<#if _title>
有一个节点未运行任何输入端
</#if>

<#if _description>
<span>
有一个节点未运行任何输入端。这意味着您目前无法从该节点接收任何消息。这很可能表明存在错误或配置不当。
    <#if _cloud == false>
        <#if SYSTEM_INPUTS?has_content>
         您可以点击<a href="${SYSTEM_INPUTS}" target="_blank" rel="noreferrer">此处</a>来解决此问题。
        </#if>
    </#if>
</span>
</#if>
