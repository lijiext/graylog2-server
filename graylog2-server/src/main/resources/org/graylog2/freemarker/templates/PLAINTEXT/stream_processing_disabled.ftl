<#if _title>由于处理时间过长，数据流处理已被禁用</#if>

<#if _description>
数据流 ${stream_title} (${stream_id}) 的处理已超时 ${fault_count} 次。
为保护消息处理的稳定性，该数据流已被禁用。请修正数据流规则并重新启用该数据流。
点击此处查看详细信息：https://docs.graylog.org/docs/streams#stream-processing-runtime-limits
</#if>
