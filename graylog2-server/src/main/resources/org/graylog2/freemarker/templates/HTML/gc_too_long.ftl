<#if _title>
节点垃圾回收暂停时间过长
</#if>

<#if _description>
<span>
部分节点的垃圾回收运行时间过长。
垃圾回收运行时间应尽可能短。请检查这些节点的健康状况。
（节点：<em>${node_id}</em>，GC 持续时间：<em>${gc_duration_ms} ms</em>，
GC 阈值：<em>${gc_threshold_ms} ms</em>）
</span>
</#if>
