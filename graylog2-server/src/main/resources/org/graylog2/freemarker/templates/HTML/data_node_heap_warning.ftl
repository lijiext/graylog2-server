<#if _title>
    数据节点堆大小警告
</#if>

<#if _description>
    <p>
        集群中存在数据节点，通过配置更大的堆大小可以获得更好的性能。
    </p>
    <p>
        数据节点 <em>${hostname}</em> 仅分配了 ${heapSize} Java 堆，总内存为 ${totalMemory}。<br/>
        我们建议将一半的内存分配给 Java 堆。为了达到生产环境的性能要求，建议将此节点配置为使用 ${recommendedMemory} 的 Java 堆（内存的 50%）。
    </p>
    <p>
        数据节点服务是 OpenSearch 服务的包装器，需要更改配置的是 OpenSearch 服务。<br/>
        需要更新的配置是 <b>opensearch_heap</b> 属性，<#if recommendedMemorySetting?has_content> 设置为 <b>${recommendedMemorySetting}</b> 值，</#if> 该属性位于每个数据节点上的 (<em>datanode.conf</em>) 文件中。
    </p>
    <p>
        请注意，数据节点服务需要重启才能使配置更改生效。
    </p>
</#if>
