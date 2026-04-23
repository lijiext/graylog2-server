<#if _title>
索引器节点打开文件数限制过低
</#if>

<#if _description>
集群中存在打开文件数限制过低的索引器节点。
当前限制：${max_file_descriptors}（在 ${hostname} 上，应至少为 64000）。
这将导致难以诊断的问题。请阅读如何提升最大打开文件数：https://docs.graylog.org/docs/elasticsearch#configuration
</#if>
