<#if _title>Journal 使用率过高</#if>

<#if _description><span>
Journal 使用率过高，可能很快超过限制。请验证您的 Elasticsearch 集群是否健康且足够快速。您可能还需要检查 Graylog 的 Journal 设置，并设置更高的限制。
(节点：<em>${node_id}</em>)
</span></#if>
