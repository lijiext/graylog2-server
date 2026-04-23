<#if _title>遗留的 LDAP/Active Directory 配置已迁移至认证服务</#if>

<#if _description><span>
    <#if AUTHENTICATION_BACKEND?has_content>
本系统的遗留 LDAP/Active Directory 配置已升级至新的
<a href="${AUTHENTICATION_BACKEND}" 认证服务</a>。
由于新的认证服务需要一些在遗留配置中不存在的信息，因此<strong>需要人工审查</strong>！
<br /> <br />
<strong>在审查 <a href="${AUTHENTICATION_BACKEND}" 认证服务</a> 后，必须启用它，以便 LDAP 或 Active Directory 用户能够再次登录！
</strong>
    <#else>
本系统的遗留 LDAP/Active Directory 配置已升级至新的认证服务。
由于新的认证服务需要一些在遗留配置中不存在的信息，因此<strong>需要人工审查</strong>！
<br /> <br />
<strong>在审查认证服务后，必须启用它，以便 LDAP 或 Active Directory 用户能够再次登录！
</strong>
    </#if>
<br />
<br />
请查看 <a href="https://docs.graylog.org/docs/upgrading-graylog">升级指南</a>
以获取更多信息。
</span></#if>
