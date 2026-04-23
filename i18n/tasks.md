# 本地化任务清单

状态记号：`[ ]` 未开始  `[~]` 进行中  `[x]` 已完成

## 第 0 周 — 基础设施

- [x] 锁定版本：切到 tag `6.1.16`，建分支 `6.1.16-zh`
- [x] 实探 1 个样本（登录页）校准 token 消耗（实测 5.6K token / 7 处文案）
- [x] 验证 gemini CLI 可用（oauth-personal + gemini-2.0-flash）
- [~] 固化配置与术语表到 `i18n/`（当前任务）
- [ ] 写 AST 抽取脚本 `scripts/i18n/extract.mjs`
- [ ] 写 Gemini 翻译脚本 `scripts/i18n/translate.mjs`
- [ ] 写 AST 回写脚本 `scripts/i18n/apply.mjs`

## 第 1 周 — 前端主干批量翻译

- [ ] 扫描 → 生成 `strings.json`，预期 2,500–4,000 条唯一条目
- [ ] 调 Gemini 批量翻译 → `translations.json`
- [ ] 人工审术语一致性（抽检 5–10%）
- [ ] 按模块分批 apply + commit：
  - [ ] `src/components/common/` 通用组件
  - [ ] `src/components/navigation/` 导航
  - [ ] `src/pages/` 页面
  - [ ] `src/components/streams/` 数据流
  - [ ] `src/components/alerts/` 告警
  - [ ] `src/components/dashboards/` 仪表盘
  - [ ] `src/views/` 搜索与 Dashboard 核心
  - [ ] `src/components/pipelines/` 处理管道
  - [ ] `src/components/sidecars/` Sidecar
  - [ ] `src/components/users/` 用户管理
  - [ ] `src/components/inputs/` 输入端
  - [ ] `src/components/extractors/` 提取器
  - [ ] `src/components/grok/` Grok
  - [ ] `src/components/lookup-tables/` 查找表
  - [ ] `src/components/content-packs/` 内容包
  - [ ] 其他

## 第 2 周 — 难点与后端

- [ ] Claude Opus 处理动态拼接（`\`${x}\``、模板串、ICU 复数）
- [ ] 后端 Java 用户可见异常消息（`BadRequestException`、`NotFoundException`、`ValidationException` 等）
- [ ] `ValidationMessages.properties`
- [ ] FreeMarker 通知模板（78 个 `.ftl`，`graylog2-server/src/main/resources/org/graylog2/freemarker/templates/`）
- [ ] 邮件主题与正文

## 第 3 周 — 构建与验收

- [ ] 前端构建：`./mvnw -pl graylog2-web-interface compile`
- [ ] 后端构建：`./mvnw clean package -DskipTests`
- [ ] Dockerfile：基于原镜像或从源码构建 `graylog:6.1.16-zh`
- [ ] 替换 `graylog_open_collect/docker-compose.yaml` 的镜像 tag
- [ ] 冒烟测试：登录 → Dashboard → Search → Streams → Alerts → System
- [ ] Claude Opus 抽检 5–10% 翻译质量
- [ ] 发布内部镜像

## 阻塞与决策日志

（每次出现术语分歧、技术决策时记在此处）

- 2026-04-22：确认**不引入 i18n 框架**，直接替换硬编码（节省工作量 3–5 倍）
- 2026-04-22：Gemini 使用 oauth-personal 免费层（默认 gemini-2.0-flash），速率 8 RPM 保守
- 2026-04-22：`Streams` 译为"数据流"、`Pipelines` 译为"处理管道"（Flash 默认译的"流/流水线"不符合 Graylog 语境）

## 验收清单

- [ ] 登录页所有文案中文
- [ ] 顶栏 + 侧边栏全中文
- [ ] 6 个核心模块页面（Dashboard/Search/Streams/Alerts/Pipelines/System）全中文
- [ ] 表单校验错误中文
- [ ] Toast / Notification 中文
- [ ] 未破坏：单元测试、E2E 测试、TS 类型检查
- [ ] 未破坏：Enterprise 插件加载（不翻译但需兼容）
- [ ] 构建产物可启动并连通 MongoDB + DataNode
