<#if _title>
    数据节点堆大小警告
</#if>

<#if _description>
    集群中存在数据节点，其配置的堆大小可能较低，建议提高以优化性能。
    数据节点 ${hostname} 仅分配了 ${heapSize} Java 堆，而总内存为 ${totalMemory}。
    我们建议将一半内存分配给 Java 堆。为获得生产环境的最佳性能，建议将此节点配置为使用 ${recommendedMemory} 的 Java 堆（占内存的 50%）。
    数据节点服务是 OpenSearch 服务的包装器，需要更改配置的是 OpenSearch 服务。
    需要更新的配置是 opensearch_heap 属性，<#if recommendedMemorySetting?has_content> 设置为 ${recommendedMemorySetting} 值，</#if> 该属性位于每个数据节点上的 (datanode.conf) 文件中。
    请注意，必须重启数据节点服务才能使配置更改生效。
</#if>
