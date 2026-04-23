<#if _title>
索引器集群不健康 (RED)
</#if>

<#if _description>
索引器集群状态为 RED，表示分片未分配。
这通常表明集群已崩溃且损坏，需要调查。消息将写入本地磁盘日志。
请在此处查看修复方法：https://docs.graylog.org/docs/elasticsearch#cluster-status-explained
</#if>
