<#if _title>Elasticsearch 节点磁盘使用率超过高水位线</#if>

<#if _description>
集群中存在 Elasticsearch 节点磁盘空间几乎耗尽，其磁盘使用率已超过高水位线。
因此，Elasticsearch 将尝试将分片从受影响的节点迁移出去。
受影响的节点为：[${nodes}]
请查看详细信息："https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html
</#if>
