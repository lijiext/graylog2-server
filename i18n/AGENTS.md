# i18n-zh 接续指引（给 Claude 的工作交接）

> 如果你正在续做 Graylog 中文本地化，先读完本文件、`README.md`、`config.yml`、`terminology.json`、`tasks.md`，再动手。

## 当前进度

见 `tasks.md`。开工前先 `TaskList` 看 Claude 任务状态。

## 分工纪律

| 角色 | 只做这些 |
|---|---|
| **你（Claude Opus 4.7）** | 术语决策、动态拼接/模板串/ICU 改造、构建报错定位、运行时 bug、抽检、决策日志 |
| **Claude Sonnet 4.6** | 脚本开发、复杂组件（Views/Search/Dashboard）翻译、批量 review |
| **Gemini 2.0 Flash** | **只负责简单硬编码字面量批量翻译** — 通过 `scripts/i18n/translate.mjs` 调用，不要让它写代码 |

**不要做**：
- 不要把 UI 字符串翻译工作自己接手——交给 Gemini 批量处理
- 不要改 i18n 框架路线（已决定不引入）
- 不要 rebase 到上游新版本（已锁定 6.1.16）
- 不要翻译日志、异常堆栈、测试字符串、API 字段名

## 术语纪律

任何翻译必须先检查 `terminology.json`：
1. 在 `keep` 列表里的词 → 保留英文
2. 在 `translate` 映射里的词 → 用指定中文
3. 两者都不在 → 按 `gemini_system_prompt.txt` 的规则翻译，并在有歧义时追加到术语表

**Streams = 数据流（非"流"），Pipelines = 处理管道（非"流水线"）——不要再重复讨论。**

## 工作流

```
扫描 (extract.mjs)  →  strings.json
                          ↓
                    Gemini 翻译 (translate.mjs)
                          ↓
                    translations.json  ←  人工/Opus 抽检
                          ↓
                    回写 (apply.mjs)
                          ↓
                    构建验收
```

每批（50 条/次）后 commit 一次，按模块分组。commit 信息：`i18n(zh): translate <module>`。

## Token 预算与监控

- Claude Pro 周限额预算：**0.9 M token 完成全量**
- 如果单天消耗超过 150K token 且进度不到 15%，说明某处在做 Gemini 该做的事 — 停下来检查
- Gemini 调用次数：预计 60–80 次总量（50 条/批 × 约 60 批），远低于每日 1000 次免费额度

## 常见坑

1. **Gemini 输出带 markdown 围栏**：`translate.mjs` 里已剥 ```` ```json ... ``` ````，如扩展新版本自测一下
2. **动态模板串**：`` `Login with ${x}` `` 不能直接翻译 — 要让 Opus 改成 `` `使用 ${x} 登录` ``
3. **Styled-components 里的字符串**：注意区分 CSS 里的字符串（不翻）和 UI 文本（翻）
4. **react-intl 已被否决**：不要"一时好心"又想引入——会和已翻译的硬编码冲突
5. **Enterprise 插件**：不在开源仓内，翻译覆盖不到。在 `graylog2-web-interface/packages/` 下或运行时加载，明确告知用户

## 提交规范

分支：`6.1.16-zh`（不要另起分支）
提交粒度：每个模块一个 commit，避免巨 diff
冲突处理：发现上游 6.1.17+ 有安全补丁时，**cherry-pick**，不要 rebase
