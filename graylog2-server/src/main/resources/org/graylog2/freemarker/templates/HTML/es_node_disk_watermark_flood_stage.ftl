<#if _title>Elasticsearch 节点磁盘使用率超过洪水阶段水位线</#if>

<#if _description><span>
集群中的 Elasticsearch 节点没有可用磁盘空间，其磁盘使用率已超过洪水阶段水位线。
因此，Elasticsearch 会对所有在受影响节点中拥有任意分片的索引强制实施只读索引块。
受影响的节点为：[${nodes}]
请查看 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html" target="_blank" rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>
以获取更多信息。
    </span></#if>
