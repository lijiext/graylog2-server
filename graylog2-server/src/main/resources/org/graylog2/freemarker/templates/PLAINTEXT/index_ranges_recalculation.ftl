<#if _title>
索引范围重新计算
</#if>

<#if _description>
索引范围已不同步。请前往系统/索引，并从以下索引集的维护菜单中触发索引范围重新计算：
    <#if index_sets??>
        ${index_sets}
    <#else>
        所有索引集
    </#if>
</#if>
