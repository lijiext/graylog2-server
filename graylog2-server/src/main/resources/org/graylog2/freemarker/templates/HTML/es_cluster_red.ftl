<#if _title>
Elasticsearch 集群状态异常 (RED)
</#if>

<#if _description>
<span>
Elasticsearch 集群状态为 RED，表示存在未分配的分片。
这通常表明集群已崩溃或损坏，需要立即调查。Graylog 将写入本地磁盘日志。
请阅读<a href="https://docs.graylog.org/docs/elasticsearch#cluster-status-explained" target="_blank" rel="noreferrer">Elasticsearch 设置文档</a>以了解修复方法。
</span>
</#if>
