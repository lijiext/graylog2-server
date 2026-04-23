<#if _title>Elasticsearch 节点磁盘使用率超过洪水阶段水位线</#if>

<#if _description>
集群中存在没有可用磁盘空间的 Elasticsearch 节点，其磁盘使用率已超过洪水阶段水位线。
因此，Elasticsearch 会对所有在受影响节点中拥有任意分片的索引强制实施只读索引块。受影响的节点如下：[${nodes}]
点击此处查看详细信息："https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html
</#if>
