<#if _title>
索引器节点打开文件数限制过低
</#if>

<#if _description>
<span>
集群中存在打开文件数限制过低的索引器节点（当前限制：
<em>${max_file_descriptors}</em> 在 <em>${hostname}</em> 上；
应至少为 64000）。这将导致难以诊断的问题。请阅读如何增加最大打开文件数：
<a href="https://docs.graylog.org/docs/elasticsearch#configuration" target="_blank" rel="noreferrer">Elasticsearch 设置文档</a>。
</span>
</#if>
