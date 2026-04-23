<#if _title>
Elasticsearch 集群状态异常 (RED)
</#if>

<#if _description>
Elasticsearch 集群状态为 RED，表示存在未分配的分片。
这通常表明集群已崩溃或损坏，需要进一步调查。Graylog 将写入本地磁盘日志。
请在此处查看修复方法：https://docs.graylog.org/docs/elasticsearch#cluster-status-explained
</#if>
