<#if _title>
    需要重新计算索引范围
</#if>

<#if _description>
    <span>
索引范围已不同步。请前往 System/Indices，并从
        <#if index_sets??>
            以下索引集的维护菜单中触发索引范围重新计算：${index_sets}
        <#else>所有索引集
        </#if>
    </span>
</#if>
