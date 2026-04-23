<#if _title>输出失败</#if>

<#if _description><span>
输出端 "${outputTitle}" (id: ${outputId})
在数据流 "${streamTitle}" (id: ${streamId})
中无法将消息发送到配置的目的地。
<br />
来自输出端的错误消息为：<em>${errorMessage}</em>
</span></#if>
