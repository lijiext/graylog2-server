<#if _title>索引器节点磁盘使用率超过低水位线</#if>

<#if _description><span>
集群中的索引器节点磁盘空间不足，其磁盘使用率已超过低水位线。
因此，受影响的节点上将不再分配新的分片。
受影响的节点为：[${nodes}]
请查看 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html" target="_blank" rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a> 以获取详细信息。
</span></#if>
