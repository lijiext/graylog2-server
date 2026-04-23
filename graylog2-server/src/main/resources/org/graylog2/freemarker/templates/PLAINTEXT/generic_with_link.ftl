<#if _title>
${title}
</#if>

<#if _description>
    <#if GENERIC_DETAILS?has_content>
        ${GENERIC_DETAILS}
    </#if>
    <br>
    <#if GENERIC_URL?has_content>
        您可点击此处解决此问题：${GENERIC_URL}
    </#if>
</#if>
