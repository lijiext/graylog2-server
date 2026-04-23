<#if _title>
GC 暂停时间过长的节点
</#if>

<#if _description>
存在垃圾回收运行时间过长的节点。
垃圾回收运行时间应尽可能短。请检查这些节点是否健康。
(节点：${node_id}，GC 持续时间：${gc_duration_ms} 毫秒，
GC 阈值：${gc_threshold_ms} 毫秒
</#if>
