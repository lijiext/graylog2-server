<#if _title>远程重新索引迁移正在进行中</#if>

<#if _description><span>
    正在将您现有的数据远程重新索引到 Graylog 数据节点。<br />
    <#if DATA_NODE_MIGRATION_WIZARD?has_content>
        请访问 <a href="${DATA_NODE_MIGRATION_WIZARD}" target="_blank" rel="noreferrer">数据节点迁移向导</a> 查看当前进度。
    </#if>
    </#if>
