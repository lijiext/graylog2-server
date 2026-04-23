/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog2.telemetry.rest;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog2.audit.AuditActor;
import org.graylog2.audit.AuditEventSender;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.plugin.database.users.User;
import org.graylog2.shared.rest.resources.RestResource;

import jakarta.inject.Inject;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.Map;

import static org.graylog2.audit.AuditEventTypes.TELEMETRY_USER_SETTINGS_UPDATE;
import static org.graylog2.shared.rest.documentation.generator.Generator.CLOUD_VISIBLE;

@RequiresAuthentication
@Api(value = "Telemetry", description = "Message inputs", tags = {CLOUD_VISIBLE})
@Path("/telemetry")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TelemetryResource extends RestResource {

    private final TelemetryService telemetryService;
    private final AuditEventSender auditEventSender;

    @Inject
    protected TelemetryResource(TelemetryService telemetryService,
                                AuditEventSender auditEventSender) {
        this.telemetryService = telemetryService;
        this.auditEventSender = auditEventSender;
    }

    @GET
    @ApiOperation(value = "获取遥测信息。")
    public Map<String, Object> get() {
        return telemetryService.getTelemetryResponse(getCurrentUserOrThrow());
    }

    @GET
    @Path("user/settings")
    @ApiOperation("检索用户的遥测设置。")
    @ApiResponses({
            @ApiResponse(code = 404, message = "未找到当前用户。")
    })
    public TelemetryUserSettings getTelemetryUserSettings() {
        return telemetryService.getTelemetryUserSettings(getCurrentUserOrThrow());
    }

    @PUT
    @Path("user/settings")
    @ApiOperation("更新用户的遥测设置。")
    @ApiResponses({@ApiResponse(code = 404, message = "未找到当前用户。")})
    @NoAuditEvent("Audit event is sent manually.")
    public void saveTelemetryUserSettings(@ApiParam(name = "JSON body", value = "要分配给用户的遥测设置。", required = true)
                                          @Valid @NotNull TelemetryUserSettings telemetryUserSettings) {

        User currentUser = getCurrentUserOrThrow();
        telemetryService.saveUserSettings(currentUser, telemetryUserSettings);
        auditEventSender.success(
                AuditActor.user(currentUser.getName()),
                TELEMETRY_USER_SETTINGS_UPDATE,
                Map.of(
                        "telemetry_enabled", telemetryUserSettings.telemetryEnabled(),
                        "telemetry_permission_asked", telemetryUserSettings.telemetryPermissionAsked()
                )
        );
    }

    private User getCurrentUserOrThrow() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new NotFoundException("找不到当前用户！");
        }
        return currentUser;
    }
}
