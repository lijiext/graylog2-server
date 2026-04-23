<#if _title>
有一个节点没有任何正在运行的输入端
</#if>

<#if _description>
有一个节点没有任何正在运行的输入端。这意味着您目前无法从该节点接收任何消息。这很可能是错误或配置不当的迹象。
    <#if _cloud == false>
        <#if SYSTEM_INPUTS?has_content>
         您可以点击此处解决此问题：${SYSTEM_INPUTS}
        </#if>
    </#if>
</#if>
