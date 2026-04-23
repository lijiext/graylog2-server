<#if _title>Elasticsearch 节点磁盘使用率超过高水位线</#if>

<#if _description><span>
集群中存在磁盘几乎耗尽的 Elasticsearch 节点，其磁盘使用率已超过高水位线。
因此，Elasticsearch 将尝试将分片从受影响的节点迁移出去。
受影响的节点为：[${nodes}]
请查看 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html" target="_blank" rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>
以获取更多信息。
</span></#if>
