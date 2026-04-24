# Graylog 6.1.16 中文本地化 —— 工作总结

**分支**: `6.1.16-zh`（从 `6.1.16` 派生）
**翻译后端**: OpenAI 兼容 API（自部署 Qwen 已验证；gemini CLI 同样支持）
**最终产物**: Docker 镜像 `graylog:6.1.16-zh`

---

## 一、翻译规模

| 范畴 | 数据 |
|---|---|
| 前端静态字符串 | 约 3400 unique（JSXText + 白名单 attr + 白名单 call） |
| 前端动态模板 | 约 440 shape（TemplateLiteral，保留 `${var}` 占位） |
| 前端 ternary 分支 | 约 170 unique |
| 前端顶级 const / ObjectProperty | 约 520 unique |
| 后端 Java 字符串 | 266 条 / 102 文件 / 387 处 |
| FreeMarker 模板 | 78 个文件整体翻译 |
| ValidationMessages.properties | 1 条 |
| Docker 镜像 | ~970 MB（两阶段 + tini + entrypoint + healthcheck） |

bundle 中汉字总量约 **5.5 万**（esbuild 压缩后以 `\uXXXX` 形式存储；用 python 解码后核对覆盖）。

---

## 二、管道架构

```
┌──── 抽取 (AST)  ─────┬──── 翻译 (LLM) ─────┬──── 回写 (AST) ────┐
│  extract.mjs          │ translate.mjs         │ apply.mjs          │
│  extract-dynamic.mjs  │ translate-dynamic.mjs │ apply-dynamic.mjs  │
│  extract-ternary.mjs  │ translate.mjs*       │ apply-ternary.mjs  │
│  extract-const.mjs    │ translate.mjs*       │ apply-const.mjs    │
│  extract-backend.mjs  │ translate-ftl.mjs     │ apply-backend.mjs  │
└───────────────────────┴───────────────────────┴────────────────────┘
            ↓                        ↓                     ↓
   strings*.json           translations*.json     <源文件切片回写>
                                                   *.ftl（整文件替换）
                                                   ValidationMessages.properties
```
`translate.mjs*` 表示同一脚本通过 `--input` / `--output` 复用于 ternary/const 轨道。

### 关键脚本 (`scripts/i18n/`)

| 文件 | 用途 |
|---|---|
| `lib/config.mjs` | 加载 `i18n/config.yml` + 辅助函数（AST 名字解析、黑白名单判断、中文检测、stable hash） |
| `extract.mjs` | 前端 TSX/TS/JSX/JS AST 扫描，抽 JSXText / 白名单 JSX 属性 / 白名单函数参数的 StringLiteral |
| `extract-backend.mjs` | Java 后端（`throw new ...Exception("...")`、`@ApiOperation(value=...)` 等）+ FTL 文件清单 |
| `extract-dynamic.mjs` | 动态模板字面量（TemplateLiteral）→ shape（`{0}`, `{1}` 占位） |
| `extract-ternary.mjs` | ConditionalExpression 两个分支都是合规英文 StringLiteral 的 ternary |
| `extract-const.mjs` | 顶级 `const X = "..."` 与 `{ label/title/... : "..." }` |
| `translate.mjs` | 批量翻译引擎：OpenAI 兼容 API 或 gemini CLI；并发池 + 串行化落盘；`--input`/`--output` 可复用 |
| `translate-ftl.mjs` | FTL 整文件翻译，校验指令和变量不变 |
| `translate-dynamic.mjs` | 翻 shape + 校验占位符集合一致 |
| `apply.mjs` / `apply-*.mjs` | 按 AST start/end 切片替换，保持缩进/引号/JSX entity |
| `run-all.sh` | 流水线入口 + 状态汇总 |

### 配置（`i18n/`）

| 文件 | 用途 |
|---|---|
| `config.yml` | 路径/输出/并发/provider 主配置 |
| `terminology.json` | 术语表（Stream=数据流、Pipeline=处理管道 …） |
| `whitelist.json` | JSX 属性白名单（`title`/`placeholder`/`label`/…）+ 函数调用白名单（`UserNotification.error`/…） |
| `blacklist.json` | 字符串/属性/调用站点黑名单（className、id、key、test 字符串等） |
| `gemini_system_prompt.txt` | 翻译 system prompt |

---

## 三、构建与镜像

### 宿主只需 Docker + Node 20+

```bash
# 容器化 Maven + JDK17
docker run --rm \
  -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app \
  maven:3.9-eclipse-temurin-17 \
  bash -c "git config --global --add safe.directory '*' && \
           mvn clean package -DskipTests -Denforcer.skip=true -Dlicense.skip=true"

# Tarball → distribution/target/assembly/graylog-<ver>-<ts>-graylog-server-tarball.tar.gz
cp target/assembly/graylog-*-graylog-server-tarball.tar.gz i18n/graylog.tgz
cd i18n && docker build -t graylog:6.1.16-zh .
```

### Dockerfile 对齐 Graylog 官方 graylog-docker/7.0 oss 布局

- 两阶段：`ubuntu:jammy` 解包 → `eclipse-temurin:17-jre-jammy` 运行
- 目录：`/usr/share/graylog/{data/{journal,log,config,plugin,contentpacks,scripts,data,libnative/jna},config,plugins-default,plugins-merged,plugin}`
- `tini` 作为 PID 1
- 完整 `docker-entrypoint.sh`（`__FILE` 变量 → secrets、plugin merge、setup dirs、cert import）
- `HEALTHCHECK` 查 `/api`
- `VOLUME /usr/share/graylog/data`

### 启动（需真实 Mongo + OpenSearch）

```bash
docker network create gltest
docker run -d --name gl-mongo --network gltest mongo:7
docker run -d --name gl-os --network gltest \
  -e discovery.type=single-node -e DISABLE_SECURITY_PLUGIN=true \
  -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
  opensearchproject/opensearch:2.15.0

docker run -d --name gl-app --network gltest -p 9000:9000 \
  -e GRAYLOG_PASSWORD_SECRET=<至少 16 字符随机串> \
  -e GRAYLOG_ROOT_PASSWORD_SHA2=$(echo -n 'your-admin-password' | sha256sum | awk '{print $1}') \
  -e GRAYLOG_HTTP_EXTERNAL_URI=http://127.0.0.1:9000/ \
  -e GRAYLOG_HTTP_BIND_ADDRESS=0.0.0.0:9000 \
  -e GRAYLOG_MONGODB_URI=mongodb://gl-mongo:27017/graylog \
  -e GRAYLOG_ELASTICSEARCH_HOSTS=http://gl-os:9200 \
  graylog:6.1.16-zh
# → http://127.0.0.1:9000
```

---

## 四、遇到的坑与解法

| 问题 | 解法 |
|---|---|
| Gemini CLI (OAuth) 网络不稳定 | 切 OpenAI 兼容 API（Qwen 已验证），`AbortController` 45s 硬断 + `Connection: close` + `keepalive: false` |
| Qwen 等 reasoning 模型把答案放 `reasoning` 字段 | `chat_template_kwargs.enable_thinking=false` + 顶层 `enable_thinking: false` 双保险 |
| 长 batch 响应 `max_tokens` 截断 → JSON parse 失败 | batch 20→10→5→1 递减；`max_tokens: 32768` |
| 前端 bundle 用 grep 搜不到中文 | esbuild 默认 `charset: ascii`，CJK 转大写 `\uXXXX`；用 `python re.sub(r'\\u(....)',...)` 解码再 grep |
| 首次 Dockerfile 缺 `data` 子目录 → JNA warn + journal 创建失败 | 对齐官方布局：`install --directory` 创建所有预期子目录；`VOLUME data` |
| JSX 原有 `&lt;Empty Value&gt;` 被回写成字面 `<空值>` 破坏 parse | `apply.mjs` 对 JSXText 做 HTML entity 转义（`<` `>` `{` `}`） |
| 回写破坏 TS 字符串字面量类型（例 `'ReactError'`、`'Asc' \| 'Desc'`） | extract/apply 里加 `hasLiteralTypeAnnotation` 检查；跳过单 PascalCase 词 |
| 早期漏掉 `.jsx` / `.js` 文件 | `config.yml` 的 `include` 加 `**/*.jsx` 与 `**/*.js`；重抽重翻重应用 |
| 顶级 `const title = cond ? 'A' : 'B'` 不在 JSX 上下文 | ternary 抽取放宽：两分支都是合规 StringLiteral 即抽，同时过滤 typed VariableDeclarator |
| 5 条 Unicode 弯引号字符串 JSON 解析失败 | 手工 plain-text 翻译单独写回 |

---

## 五、局限

1. 嵌套表达式里的 StringLiteral 不抽取（例 `obj[cond ? 'keyA' : 'keyB']` 的 key）。
2. 3 个上游文件 babel parse 预先失败（`Routes.ts`、`UnitsConfig.ts`、`unitConverters.ts`），与翻译无关。
3. 术语表仍有个别不统一（如 Pipeline 在某些上下文译"管道"、某些"处理管道"）。可通过后处理替换收敛。
4. dict key / enum value 里的单词（`'Delete'`、`'Description'` 等）被新启发式安全跳过——避免破坏类型约束。

---

## 六、下次升级（6.2 / 7.x）

1. 切新分支：`git checkout -b 6.2.x-zh 6.2.x`
2. 把上一版本的 `i18n/translations*.json` 复制过来（增量翻译会复用）
3. 核对 `i18n/config.yml` 的 `javaRoots` 是否需要加新模块（例如 Graylog 可能加 `graylog-storage-opensearch3`）
4. `extract*` 一遍看新增 unique 数
5. `translate*`（已翻译自动跳过）
6. `apply*` → parse check（应该等于 extract 阶段的 `parseErrorCount`）
7. 容器化 Maven 构建 + Docker 镜像打包

如果 `terminology.json` 有更新影响大面积：`translate.mjs --retranslate` 强制全部重译。
