<#if _title>
邮件传输配置缺失或无效！
</#if>

<#if _description>
<span>
邮件传输子系统的配置显示缺失或无效。
请检查您的 Graylog 服务器配置文件中相关部分。
这是详细的错误信息：${exception}
</span>
</#if>
