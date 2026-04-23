<#if _title>输出失败</#if>

<#if _description>
输出端 "${outputTitle}" (ID: ${outputId})
在数据流 "${streamTitle}" (ID: ${streamId})
中无法将消息发送到配置的目的地。
来自输出端的错误消息为：${errorMessage}
</#if>
