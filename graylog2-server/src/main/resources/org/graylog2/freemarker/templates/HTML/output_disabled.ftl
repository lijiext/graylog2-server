<#if _title>输出已禁用</#if>

<#if _description>
<span>
ID 为 ${outputId} 的输出端在数据流 &quot;${streamTitle}&quot;
（ID: ${streamId}）中已禁用 ${faultPenaltySeconds}
秒，因为发生了 ${faultCount} 次故障。
（节点：<em>${node_id}</em>，故障阈值：<em>${faultCountThreshold}</em>）
</span></#if>
