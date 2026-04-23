<#if _title>
Elasticsearch 节点打开文件数限制过低
</#if>

<#if _description>
集群中存在打开文件数限制过低的 Elasticsearch 节点。
当前限制：${hostname} 上为 ${max_file_descriptors}（应至少为 64000）。
这将导致难以诊断的问题。请阅读如何提升最大打开文件数：https://docs.graylog.org/docs/elasticsearch#configuration
</#if>
