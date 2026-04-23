<#if _title>Elasticsearch 版本不兼容</#if>

<#if _description><
当前运行的 Elasticsearch 版本（${current_version}）的主版本与 Graylog 领导节点启动时的主版本（${initial_version}）不同。
这极可能导致索引或搜索过程中出现错误。Graylog 要求在 Elasticsearch 从一个主版本升级到另一个主版本后执行完全重启。
详细信息，请参阅我们的说明： "https://docs.graylog.org/docs/rolling-es-upgrade
</#if>
