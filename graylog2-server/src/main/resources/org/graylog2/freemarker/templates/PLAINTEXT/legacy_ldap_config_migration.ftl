<#if _title>已迁移旧的 LDAP/Active Directory 配置到认证服务</#if>

<#if _description>
    <#if AUTHENTICATION_BACKEND?has_content>
本系统的旧 LDAP/Active Directory 配置已升级至新的认证服务：${AUTHENTICATION_BACKEND}
由于新的认证服务需要一些旧配置中不存在的信息，因此需要人工审查！

审查完 ${AUTHENTICATION_BACKEND} 后，必须启用它，以便 LDAP 或 Active Directory 用户能够再次登录！
    <#else>
本系统的旧 LDAP/Active Directory 配置已升级至新的认证服务。
由于新的认证服务需要一些旧配置中不存在的信息，因此需要人工审查！

审查完认证服务后，必须启用它，以便 LDAP 或 Active Directory 用户能够再次登录！
    </#if>
请查看升级指南以获取更多信息：https://docs.graylog.org/docs/upgrading-graylog
</#if>
