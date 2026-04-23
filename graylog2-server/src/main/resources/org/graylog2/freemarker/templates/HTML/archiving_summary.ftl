<#if _title>索引尚未归档</#if>

<#if _description><span>
归档部分索引时发生错误。Graylog 将继续尝试归档这些索引，并在成功归档前保留所有索引。
<br />
请检查以下错误消息，您的协助可能有助于解决该问题：
<br />
<ul>
    <#list archiveErrors as error>
    <li>${error}</li>
    </#list>
</ul>
</span></#if>
