<#if _title>索引器节点磁盘使用率超过高水位线</#if>

<#if _description>
集群中存在索引器节点磁盘空间几乎耗尽，其磁盘使用率已超过高水位线。
因此，分片将从受影响的节点重新定位。
受影响的节点为：[${nodes}]
查看详细信息："https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html
</#if>
