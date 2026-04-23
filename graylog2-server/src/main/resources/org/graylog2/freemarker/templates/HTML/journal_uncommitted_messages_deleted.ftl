<#if _title>未提交的日志消息已从日志中删除</#if>

<#if _description><span>
部分日志消息在写入 Elasticsearch 之前已从 Graylog 日志中删除。请
验证您的 Elasticsearch 集群是否健康且速度足够快。您可能还需要检查 Graylog
日志设置并提高限制。（节点：<em>${node_id}</em>）
</span></#if>
