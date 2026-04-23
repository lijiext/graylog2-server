<#if _title>远程重新索引迁移已完成</#if>

<#if _description><span>
    将现有数据远程重新索引到数据节点的操作已完成<#if status == 'FINISHED'>成功<#else>出现错误</#if>。<br />
    <#if DATA_NODE_MIGRATION_WIZARD?has_content>
        请访问<a href="${DATA_NODE_MIGRATION_WIZARD}" target="_blank" rel="noreferrer">数据节点迁移向导</a>以完成迁移。
    </#if>
    </#if>
