<#if _title>Elasticsearch 节点磁盘使用率超过低水位线</#if>

<#if _description>
集群中有 Elasticsearch 节点磁盘空间不足，其磁盘使用率已超过低水位线。
因此，Elasticsearch 将不再向受影响的节点分配新的分片。
受影响的节点为：[${nodes}]
查看详细信息：https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html
</#if>
