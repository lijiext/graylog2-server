<#if _title>
索引器集群不健康 (RED)
</#if>

<#if _description>
<span>
索引器集群状态为 RED，表示存在未分配的分片。
这通常表明集群已崩溃或损坏，需要进一步调查。消息将写入本地磁盘日志。
请查看如何修复此问题
<a href="https://docs.graylog.org/docs/elasticsearch#cluster-status-explained" target="_blank" rel="noreferrer">此处</a>
</span>
</#if>
