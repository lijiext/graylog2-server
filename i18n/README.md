# Graylog 中文本地化（i18n-zh）

## 目标

在 **graylog2-server 6.1.16** 基础上做一次性中文本地化，产出 `graylog:6.1.16-zh` Docker 镜像。**仅翻译用户可见文案**，不翻译日志、异常堆栈、API 字段名、配置键、代码注释。

## 技术路线

直接替换硬编码字符串（**不引入 i18n 框架**），锁定版本、不跟上游同步。

## 分工

| 角色 | 任务 |
|---|---|
| **Claude Opus 4.7** | 术语表、动态拼接/ICU、构建排错、抽检 |
| **Claude Sonnet 4.6** | 脚本开发、复杂组件翻译 |
| **Gemini 2.0 Flash**（oauth-personal 免费层） | 批量硬编码字面量翻译 |

## 目录

```
i18n/
├── README.md              本文件
├── AGENTS.md              给未来 Claude 的接续指引
├── config.yml             路径、模型、批次、速率、白黑名单引用
├── terminology.json       术语表（保留词 + 翻译词 + 上下文）
├── whitelist.json         AST 抽取白名单（节点类型、属性名）
├── blacklist.json         AST 抽取黑名单（正则、文件路径）
├── tasks.md               任务清单与进度
├── strings.json           抽取产物（脚本生成）
└── translations.json      翻译产物（脚本生成）

scripts/i18n/
├── extract.mjs            AST 抽取
├── translate.mjs          Gemini 批量翻译
└── apply.mjs              AST 回写
```

## 翻译原则

1. **计算机通用术语保留英文**：URL、API、HTTP、JSON、YAML、OAuth、Token、Cache、TLS、UUID…（见 `terminology.json` 的 `keep` 段）
2. **Graylog 领域术语按词表翻译**（见 `terminology.json` 的 `translate` 段），**必须符合 Graylog 语境**，例如 `Stream → 数据流`（不是"流"），`Pipeline → 处理管道`（不是"流水线"）
3. **翻译范围**：
   - 前端：JSX 文本节点 + 白名单 UI 属性
   - 后端：用户可见异常消息（`throw new *Exception("...")`）、REST 错误、`ValidationMessages.properties`、FreeMarker 通知模板（78 个 `.ftl`）
4. **不翻译**：
   - `LoggerFactory.getLogger` / `LOG.info/warn/error` 日志
   - `console.*` 输出
   - URL、路径、`data-testid`、className、API 字段名
   - 异常类名、堆栈信息
   - 测试断言字符串（`expect(...).toBe("xxx")`）
   - 代码注释

## 使用

```bash
# 1. 扫描全项目抽取待译字符串
node scripts/i18n/extract.mjs

# 2. 调 Gemini 批量翻译
node scripts/i18n/translate.mjs

# 3. 人工审 i18n/translations.json 后回写
node scripts/i18n/apply.mjs

# 4. 构建
./mvnw clean package -DskipTests
```
