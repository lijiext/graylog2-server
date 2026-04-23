<#if _title>
输入端因故障已关闭
</#if>

<#if _description>
输入端 ${input_title} 在节点 ${node_id} 上因以下原因已关闭：
   »${reason}«
这意味着您将无法从该输入端接收任何消息。
这通常表明存在持续的网络故障。
        <#if _cloud == false>
            <#if SYSTEM_INPUTS?has_content>
您可以点击此处查看该输入端：${SYSTEM_INPUTS}
            </#if>
        </#if>
</#if>
