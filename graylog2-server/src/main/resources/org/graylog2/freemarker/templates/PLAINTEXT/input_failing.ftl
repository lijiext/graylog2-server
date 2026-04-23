<#if _title>
输入失败
</#if>

<#if _description>
输入端 ${input_id} 在节点 ${node_id} 上失败，原因如下：
   »${reason}«。
这意味着您无法从此输入端接收任何消息。
这通常表示配置错误或发生了错误。
    <#if _cloud == false>
        <#if SYSTEM_INPUTS?has_content>
点击此处解决此问题：${SYSTEM_INPUTS}
        </#if>
    </#if>
</#if>
