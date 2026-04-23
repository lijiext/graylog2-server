<#if _title>由于处理时间过长，数据流处理已被禁用</#if>

<#if _description><span>
数据流 <em>${stream_title} (${stream_id})</em> 的处理耗时过长，已发生 ${fault_count} 次。为保护消息处理的稳定性，
该数据流已被禁用。请修正数据流规则并重新启用该数据流。
有关更多详细信息，请查看 <a href="https://docs.graylog.org/docs/streams#stream-processing-runtime-limits" target="_blank" rel="noreferrer">文档</a>。
</span></#if>
