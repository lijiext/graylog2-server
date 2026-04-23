<#if _title>集群中未检测到任何 Graylog 服务器主节点</#if>

<#if _description><span>
Graylog 服务器的某些操作需要主节点存在，但未启动此类主节点。
请确保您的 Graylog 服务器节点之一在其配置中包含设置 <code>is_leader = true</code> 且正在运行。
在问题解决之前，索引轮转将无法运行，这意味着索引保留机制也无法运行，导致索引大小增加。
某些维护功能以及多种 Web 界面页面（例如 仪表盘）将不可用。
</span></#if>
