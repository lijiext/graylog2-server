<#if _title>
${title}
</#if>

<#if _description>
    <#if GENERIC_DETAILS?has_content>
        ${GENERIC_DETAILS}
    </#if>
    <br>
    <#if GENERIC_URL?has_content>
        您可以点击 <a href="${GENERIC_URL}" target="_blank" rel="noreferrer">此处</a> 解决此问题。
    </#if>
</#if>
