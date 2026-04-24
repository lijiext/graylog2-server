# Graylog 6.1.16 中文本地化（i18n-zh）

在 Graylog **6.1.16** 基础上做一次性中文本地化，产出 `graylog:6.1.16-zh` Docker 镜像。

**翻译范围**：用户可见文案 —— 前端 TSX/TS/JSX/JS、后端 Java throw / Swagger 注解、FreeMarker 通知模板、`ValidationMessages.properties`。
**不翻译**：日志、异常堆栈、API 字段名、配置键、代码注释、test/spec/mock 文件。

## 技术路线

直接 AST 替换硬编码字符串，**不引入 i18n 框架**，锁定版本、不跟上游同步。
零运行时开销；代价是失去运行时切语言能力（这是"分支特化"方案）。

## 目录

```
i18n/
├── README.md                  本文件
├── SUMMARY.md                 工作总结（规模、架构、坑、复用指引）
├── config.yml                 路径 / 输出 / 并发 / provider 主配置
├── terminology.json           术语表（Stream=数据流、Pipeline=处理管道 …）
├── whitelist.json             AST 白名单（属性名 + 函数名）
├── blacklist.json             AST 黑名单（正则、文件 pattern、调用站点）
├── gemini_system_prompt.txt   翻译 system prompt
├── strings*.json              抽取产物
├── translations*.json         翻译缓存
├── ftl-files.json             FreeMarker 文件清单
├── Dockerfile                 镜像（两阶段，对齐 graylog-docker/7.0 布局）
├── docker-entrypoint.sh       官方 entrypoint
├── health_check.sh            官方 healthcheck
└── config/                    graylog.conf + log4j2.xml

scripts/i18n/
├── extract.mjs            前端：JSXText / 白名单属性值 / 白名单 call 参数
├── extract-dynamic.mjs    前端：TemplateLiteral（按 shape 去重）
├── extract-ternary.mjs    前端：ConditionalExpression 分支字面量
├── extract-const.mjs      前端：const = "..." / { label: "..." }
├── extract-backend.mjs    后端：Java throw + Swagger + FTL 清单
├── translate.mjs          通用 batch 翻译（OpenAI 兼容 / gemini CLI）
├── translate-dynamic.mjs  shape 翻译，校验占位符不变
├── translate-ftl.mjs      FreeMarker 整文件，校验指令/变量保留
├── apply.mjs              JSX 切片回写
├── apply-dynamic.mjs      TemplateLiteral 重组（保留原始表达式）
├── apply-ternary.mjs      ternary 分支替换
├── apply-const.mjs        const / ObjectProperty 替换
├── apply-backend.mjs      Java 字符串切片回写
├── lib/config.mjs         配置加载 + AST 辅助
└── run-all.sh             流水线入口
```

## 前置条件

- Node 20+
- Docker（构建镜像时）
- 任一翻译后端：
  - **OpenAI 兼容 API**（推荐）——自部署 Qwen / DeepSeek / vLLM 都行。凭据放仓库外：
    ```bash
    # ~/.config/graylog-i18n.env
    export I18N_PROVIDER=qwen
    export QWEN_BASE_URL=https://your-endpoint/v1
    export QWEN_MODEL=Qwen3.5
    export QWEN_API_KEY=...
    ```
  - **gemini CLI**：`export I18N_PROVIDER=gemini`（需已登录）

## 使用

```bash
# 加载凭据（凭据文件不入 git）
set -a && source ~/.config/graylog-i18n.env && set +a

cd scripts/i18n && npm install && cd -

# 1) 抽取
cd scripts/i18n
node extract.mjs
node extract-dynamic.mjs
node extract-ternary.mjs
node extract-const.mjs
node extract-backend.mjs
cd -

# 2) 翻译（全部增量，已缓存的跳过）
cd scripts/i18n
I18N_CONCURRENCY=8 node translate.mjs
I18N_CONCURRENCY=8 node translate-dynamic.mjs
I18N_CONCURRENCY=8 node translate.mjs --input i18n/strings-ternary.json --output i18n/translations-ternary.json
I18N_CONCURRENCY=8 node translate.mjs --input i18n/strings-const.json    --output i18n/translations-const.json
I18N_CONCURRENCY=4 node translate.mjs --input i18n/strings-backend.json  --output i18n/translations-backend.json
I18N_CONCURRENCY=4 node translate-ftl.mjs
cd -

# 3) 回写
cd scripts/i18n
node apply.mjs
node apply-dynamic.mjs
node apply-ternary.mjs
node apply-const.mjs
node apply-backend.mjs
cd -

# 4) 构建（详见 SUMMARY.md）
docker run --rm -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app \
  maven:3.9-eclipse-temurin-17 \
  bash -c "git config --global --add safe.directory '*' && \
           mvn clean package -DskipTests -Denforcer.skip=true -Dlicense.skip=true"

cp target/assembly/graylog-*-graylog-server-tarball.tar.gz i18n/graylog.tgz
cd i18n && docker build -t graylog:6.1.16-zh .
```

## 抽取规则要点

- **类型感知**：跳过有 `TSLiteralType` 或 `TSUnionType<TSLiteralType>` 注解的 `VariableDeclarator`，避免破坏 `'Asc' | 'Desc'` 这种字面量类型
- **启发式过滤**：单 PascalCase 词（通常是 enum/type）、CSS 关键字、SCREAMING_CASE、URL、查询样例（`name:foo`）等不翻
- **黑白名单**：在 `i18n/whitelist.json` / `i18n/blacklist.json` 调整

## 已知局限

- 嵌套表达式里的 StringLiteral 不抽取（例：`obj[cond ? 'keyA' : 'keyB']` 的 key）
- 3 个上游文件 babel parse 失败（`Routes.ts` 等），与翻译无关
- 单短词常量（`'Delete'`、`'Description'` 作 dict key）被新启发式安全跳过，避免破坏 enum

详细架构、构建坑、复用下一版本的步骤见 [SUMMARY.md](SUMMARY.md)。
