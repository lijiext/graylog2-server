# Graylog 6.1.16 中文本地化 —— 工作总结

**分支**: `6.1.16-zh`（从 `6.1.16` 派生）
**翻译后端**: 自部署 Qwen3.5（OpenAI 兼容 API），凭据在 `~/.config/graylog-i18n.env`
**最终产物**: Docker 镜像 `graylog:6.1.16-zh`（972 MB）

---

## 一、翻译规模

| 范畴 | 数据 |
|---|---|
| 前端静态字符串 | 2386 unique / 回写约 7800 处（JSXText + 白名单 attr + 白名单 call） |
| 前端动态模板 | 339 shape / 393 处（TemplateLiteral，保留 `${var}` 占位） |
| 后端 Java 字符串 | 266 条 / 102 文件 / 387 处（`throw new ...`, `swagger` 注解） |
| FreeMarker 模板 | 78 个文件整体翻译（保留 `<#if>` 指令 + `${var}` + URL + HTML） |
| ValidationMessages.properties | 1 条 |
| 构建镜像 | 616→972 MB（两阶段 + tini + entrypoint + healthcheck） |

最终 bundle 中 ≥ 2400 unique CJK 串 / 3.1 万汉字字符；"数据流"×45、"仪表盘"×32、"事件"×30、"通知"×28 等关键术语均已覆盖。

---

## 二、管道架构

```
┌──── 抽取 (AST)    ────┬──── 翻译 (Qwen) ─────┬──── 回写 (AST) ────┐
│  extract.mjs          │ translate.mjs         │ apply.mjs          │
│  extract-backend.mjs  │ translate-ftl.mjs     │ apply-backend.mjs  │
│  extract-dynamic.mjs  │ translate-dynamic.mjs │ apply-dynamic.mjs  │
└───────────────────────┴───────────────────────┴────────────────────┘
            ↓                        ↓                     ↓
   strings.json            translations.json         <源文件回写>
   strings-backend.json    translations-backend      ValidationMessages.properties
   strings-dynamic.json    translations-dynamic      *.ftl（整文件替换）
   ftl-files.json          （FTL 整文件翻译直接写源）
```

### 关键脚本（`graylog2-server/scripts/i18n/`）

| 文件 | 用途 |
|---|---|
| `lib/config.mjs` | 加载 `i18n/config.yml` + 辅助函数（AST 名字解析、黑白名单判断、中文检测、stable hash） |
| `extract.mjs` | 前端 TSX/TS AST 扫描，抽取 JSXText、白名单属性值、白名单函数参数中的 StringLiteral |
| `extract-backend.mjs` | Java 后端扫描（`throw new IllegalArgumentException("...")`, `@ApiOperation(value=...)` 等）+ FTL 文件清单 |
| `extract-dynamic.mjs` | 动态模板字面量（TemplateLiteral）抽取为 shape 字符串（`{0}` `{1}` 占位） |
| `translate.mjs` | 批量翻译引擎：OpenAI 兼容 API（Qwen）或 gemini CLI；并发池 + 串行化落盘 |
| `translate-ftl.mjs` | FTL 整文件翻译，校验指令/变量不变 |
| `translate-dynamic.mjs` | 翻译 shape + 校验占位符集合一致 |
| `apply.mjs` | 基于 AST start/end 切片替换，保持缩进/引号/JSX 转义 |
| `apply-backend.mjs` | Java 字符串切片替换 |
| `apply-dynamic.mjs` | 重组 TemplateLiteral：中文模板 + 原始表达式源码片段（允许 LLM 重排占位符顺序） |
| `run-all.sh` | 流水线入口 + 状态汇总 |

### 配置（`graylog2-server/i18n/`）

| 文件 | 用途 |
|---|---|
| `config.yml` | 路径/输出/并发/provider 主配置 |
| `terminology.json` | 术语表（Stream=数据流、Pipeline=处理管道 …） |
| `whitelist.json` | JSX 属性白名单（`title`, `placeholder`, …）与函数调用白名单（`UserNotification.error`, …） |
| `blacklist.json` | 字符串/属性/调用站点黑名单（className、id、key、测试字符串等） |
| `gemini_system_prompt.txt` | 翻译 system prompt（术语约束、保留占位符/HTML/URL 等） |

---

## 三、构建与镜像

### 宿主只需 Docker + Node 20

```
# 前提：源码已回写翻译
cd graylog2-server
docker run --rm \
  -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app \
  maven:3.9-eclipse-temurin-17 \
  bash -c "git config --global --add safe.directory '*' && \
           mvn clean package -DskipTests -Denforcer.skip=true -Dlicense.skip=true"

# Tarball → distribution/target/assembly/graylog-<ver>-<ts>-graylog-server-tarball.tar.gz
cp target/assembly/graylog-*-graylog-server-tarball.tar.gz i18n/graylog.tgz
cd i18n && docker build -t graylog:6.1.16-zh .
```

### Dockerfile 参照 Graylog 官方 graylog-docker/7.0 布局

- 两阶段：`ubuntu:jammy` 解包 → `eclipse-temurin:17-jre-jammy` 运行
- 目录：`/usr/share/graylog/{data/{journal,log,config,plugin,contentpacks,scripts,data,libnative/jna},config,plugins-default,plugins-merged,plugin}`
- `tini` 作为 PID 1
- 完整 `docker-entrypoint.sh`（secrets、plugin merge、setup dirs、cert import）
- HEALTHCHECK：`curl /api`
- `VOLUME /usr/share/graylog/data`

### 启动（挂真实 Mongo + OpenSearch）

```bash
docker network create gltest
docker run -d --name gl-mongo --network gltest mongo:7
docker run -d --name gl-os --network gltest \
  -e discovery.type=single-node -e DISABLE_SECURITY_PLUGIN=true \
  opensearchproject/opensearch:2.15.0
docker run -d --name gl-app --network gltest -p 9000:9000 \
  -e GRAYLOG_PASSWORD_SECRET=... \
  -e GRAYLOG_ROOT_PASSWORD_SHA2=... \
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
| Gemini CLI（OAuth）在墙内频繁 TLS 断连、300s 超时 | 切 Qwen OpenAI 兼容 API，45s 硬断 + `Connection: close` + `keepalive: false` |
| Qwen3.5 默认 reasoning 模式把答案放 `reasoning` 字段 | `chat_template_kwargs.enable_thinking=false` + `enable_thinking: false` 双保险 |
| 长 batch 响应 max_tokens 截断 → JSON parse 失败 | batch 20→10→5→1 递减；`max_tokens: 32768` |
| 前端 bundle 检查看不见中文 | esbuild 默认 `charset: ascii`，所有 CJK 转成 **大写** `\uXXXX`；用 `python re.sub` 解码再 grep |
| 首次 Dockerfile 缺 data 子目录 → JNA + journal 报错 | 对齐官方布局：`install --directory` 所有预期子目录；`VOLUME data` |
| EmptyValue.tsx 原有 `&lt;Empty Value&gt;` 被回写成字面 `<空值>` 破坏 JSX | `apply.mjs` 对 JSXText 做 HTML entity 转义（`<` `>` `{` `}`） |
| 5 条 Unicode 弯引号字符串 JSON 解析失败 | 手工 plain-text 翻译单独写回 |

---

## 五、局限

1. **JSX 表达式内部的 StringLiteral 不被翻译**。例：`${isSelected ? 'Hide' : 'Show'}` 里的 Hide/Show。
   - 原因：白名单只覆盖 JSXAttribute/CallExpression 的直接参数；ternary 内嵌字面量不在 AST 访问路径。
   - 影响面小（几十处），手工修或在 `extract-dynamic.mjs` 里扩 visitor。
2. **3 个文件 babel parse 预先失败**（`Routes.ts`, `UnitsConfig.ts`, `unitConverters.ts`）。与翻译无关，是源码里有新语法 babel 未识别。
3. **术语表仍有个别不统一**（如 Pipeline 在某些上下文译"管道"、某些"处理管道"）。可通过后处理替换收敛。

---

## 六、下次升级使用

1. `/graylog-zh-i18n /path/to/new-graylog-repo 6.2.x` — 技能会自动：
   - copy 脚本到 `<repo>/scripts/i18n/` + 配置到 `<repo>/i18n/`
   - extract → translate (Qwen) → apply → build docker
2. 如果新版本引入新字符串，`translations.json` 里已有的中文缓存会被复用，只翻新条目（增量翻译）。
3. 如果 terminology 有更新，编辑 `i18n/terminology.json` 后用 `--retranslate` 强制重译。

具体见 `~/.claude/skills/graylog-zh-i18n/SKILL.md`。
