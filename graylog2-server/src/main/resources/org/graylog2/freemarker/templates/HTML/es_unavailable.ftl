<#if _title>
Elasticsearch 集群不可用
</#if>

<#if _description>
<span>
Graylog 无法成功连接到 Elasticsearch 集群。如果您正在使用组播，请检查
它是否在网络中正常工作，以及 Elasticsearch 是否可访问。同时请检查集群名称设置
是否正确。阅读如何修复此问题的说明：
<a href="https://docs.graylog.org/docs/elasticsearch#configuration" target="_blank" rel="noreferrer">Elasticsearch 设置文档。</a>
</span>
</#if>
