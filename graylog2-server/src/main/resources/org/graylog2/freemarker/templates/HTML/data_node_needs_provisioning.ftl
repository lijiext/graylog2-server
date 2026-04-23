<#if _title>
    数据节点需要配置
</#if>

<#if _description>
    <span>
数据节点最近首次启动，正在等待加入集群和证书配置。

由于配置了手动证书续期策略，需要手动操作才能完成此节点的配置。

<p />

    <#if _cloud == false>
        <#if DATA_NODE_CONFIGURATION?has_content>
        您可以点击<a href="${DATA_NODE_CONFIGURATION}" target="_blank" rel="noreferrer">此处</a>来解决此问题。
        </#if>
    </#if>
</span>
</#if>
