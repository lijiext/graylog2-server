<#if _title>索引器节点磁盘使用量超过洪水阶段水位线</#if>

<#if _description><span>
集群中的索引器节点没有可用磁盘空间，其磁盘使用量已超过洪水阶段水位线。
因此，所有在受影响节点上拥有任何分片的索引均被强制设置为只读块。受影响的节点为：[${nodes}]
请查看 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html" target="_blank" rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>
以获取更多信息。
    </span></#if>
