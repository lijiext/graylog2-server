<#if _title>索引器版本不兼容</#if>

<#if _description><span>
当前运行的索引器版本（${current_version}）与启动领导节点时使用的版本（${initial_version}）主版本号不同。
这很可能导致索引或搜索过程中出现错误。在升级索引器主版本后，需要进行完整重启。
<br />
详细信息，请参阅我们关于
<a href="https://docs.graylog.org/docs/rolling-es-upgrade" target="_blank" rel="noreferrer">滚动升级索引器</a>的说明。
</span></#if>
