<#if _title>Elasticsearch 版本不兼容</#if>

<#if _description><span>
当前运行的 Elasticsearch 版本（${current_version}）与 Graylog 领导节点启动时使用的版本（${initial_version}）主版本号不同。
这很可能导致索引或搜索过程中出现错误。Graylog 要求在 Elasticsearch 从一个主版本升级到另一个主版本后执行完全重启。
<br />
详细信息，请参阅我们关于
<a href="https://docs.graylog.org/docs/rolling-es-upgrade" target="_blank" rel="noreferrer">Elasticsearch 滚动升级</a>的说明。
</span></#if>
