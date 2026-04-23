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
package org.graylog2.rest.resources.messages;

import com.codahale.metrics.annotation.Timed;
import com.eaio.uuid.UUID;
import com.google.common.net.InetAddresses;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.indexer.IndexNotFoundException;
import org.graylog2.indexer.IndexSetRegistry;
import org.graylog2.indexer.messages.DocumentNotFoundException;
import org.graylog2.indexer.messages.Messages;
import org.graylog2.indexer.results.ResultMessage;
import org.graylog2.indexer.results.ResultMessageFactory;
import org.graylog2.inputs.codecs.CodecFactory;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.ResolvableInetSocketAddress;
import org.graylog2.plugin.Tools;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.codecs.Codec;
import org.graylog2.plugin.journal.RawMessage;
import org.graylog2.rest.models.messages.requests.MessageParseRequest;
import org.graylog2.rest.models.messages.responses.MessageTokens;
import org.graylog2.shared.rest.resources.RestResource;
import org.graylog2.shared.security.RestPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import static com.google.common.base.Strings.isNullOrEmpty;
import static java.util.Objects.requireNonNull;
import static org.graylog2.shared.rest.documentation.generator.Generator.CLOUD_VISIBLE;

@RequiresAuthentication
@Api(value = "Messages", description = "Single messages", tags = {CLOUD_VISIBLE})
@Produces(MediaType.APPLICATION_JSON)
@Path("/messages")
public class MessageResource extends RestResource {
    private static final Logger LOG = LoggerFactory.getLogger(MessageResource.class);

    private final Messages messages;
    private final CodecFactory codecFactory;
    private final IndexSetRegistry indexSetRegistry;
    private final ResultMessageFactory resultMessageFactory;

    @Inject
    public MessageResource(Messages messages, CodecFactory codecFactory, IndexSetRegistry indexSetRegistry,
                           ResultMessageFactory resultMessageFactory) {
        this.messages = requireNonNull(messages);
        this.codecFactory = requireNonNull(codecFactory);
        this.indexSetRegistry = requireNonNull(indexSetRegistry);
        this.resultMessageFactory = resultMessageFactory;
    }

    @GET
    @Path("/{index}/{messageId}")
    @Timed
    @ApiOperation(value = "获取单条消息。")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "指定的索引不存在。"),
            @ApiResponse(code = 404, message = "消息不存在。")
    })
    public ResultMessage search(@ApiParam(name = "index", value = "此消息存储的索引。", required = true)
                                @PathParam("index") String index,
                                @ApiParam(name = "messageId", required = true)
                                @PathParam("messageId") String messageId) throws IOException {
        checkPermission(RestPermissions.MESSAGES_READ, messageId);
        try {
            final ResultMessage resultMessage = messages.get(messageId, index);
            final Message message = resultMessage.getMessage();
            checkMessageReadPermission(message);

            return resultMessage;
        } catch (DocumentNotFoundException e) {
            throw new NotFoundException("Message " + messageId + " does not exist in index " + index, e);
        } catch (IndexNotFoundException e) {
            throw new NotFoundException("Index " + index + " does not exist.", e);
        }
    }

    private void checkMessageReadPermission(Message message) {
        // if user has "admin" privileges, do not check stream permissions
        if (isPermitted(RestPermissions.STREAMS_READ, "*")) {
            return;
        }

        boolean permitted = false;
        for (String streamId : message.getStreamIds()) {
            if (isPermitted(RestPermissions.STREAMS_READ, streamId)) {
                permitted = true;
                break;
            }
        }
        if (!permitted) {
            throw new ForbiddenException("Not authorized to access message " + message.getId());
        }
    }

    @POST
    @Path("/parse")
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Parse a raw message")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "指定的编解码器不存在。"),
            @ApiResponse(code = 400, message = "无法解码消息。")
    })
    @NoAuditEvent("only used to parse a test message")
    public ResultMessage parse(@ApiParam(name = "JSON body", required = true) MessageParseRequest request) {
        Codec codec;
        try {
            final Configuration configuration = new Configuration(request.configuration());
            codec = codecFactory.create(request.codec(), configuration);
        } catch (IllegalArgumentException e) {
            throw new NotFoundException(e);
        }

        final ResolvableInetSocketAddress remoteAddress = ResolvableInetSocketAddress.wrap(new InetSocketAddress(request.remoteAddress(), 1234));

        final RawMessage rawMessage = new RawMessage(0, new UUID(), Tools.nowUTC(), remoteAddress, request.message().getBytes(StandardCharsets.UTF_8));
        final Message message = decodeMessage(codec, remoteAddress, rawMessage);

        return resultMessageFactory.createFromMessage(message);
    }

    private Message decodeMessage(Codec codec, ResolvableInetSocketAddress remoteAddress, RawMessage rawMessage) {
        Message message;
        try {
            message = codec.decode(rawMessage);

        } catch (Exception e) {
            throw new BadRequestException("Could not decode message");
        }

        if (message == null) {
            throw new BadRequestException("Could not decode message");
        }

        // Ensure the decoded Message has a source, otherwise creating a ResultMessage will fail
        if (isNullOrEmpty(message.getSource())) {
            final String address = InetAddresses.toAddrString(remoteAddress.getAddress());
            message.setSource(address);
        }

        // Override source
        final Configuration configuration = codec.getConfiguration();
        if (configuration.stringIsSet(Codec.Config.CK_OVERRIDE_SOURCE)) {
            message.setSource(configuration.getString(Codec.Config.CK_OVERRIDE_SOURCE));
        }

        return message;
    }

    @GET
    @Path("/{index}/analyze")
    @Timed
    @ApiOperation(value = "Analyze a message string",
                  notes = "Returns what tokens/terms a message string (message or full_message) is split to.")
    @RequiresPermissions(RestPermissions.MESSAGES_ANALYZE)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "指定的索引不存在。"),
    })
    public MessageTokens analyze(
            @ApiParam(name = "index", value = "包含该字符串的消息所在的索引。", required = true)
            @PathParam("index") String index,
            @ApiParam(name = "analyzer", value = "要使用的分析器。")
            @QueryParam("analyzer") @Nullable String analyzer,
            @ApiParam(name = "string", value = "要分析的字符串。", required = true)
            @QueryParam("string") @NotEmpty String string) throws IOException {

        final String indexAnalyzer = indexSetRegistry.getForIndex(index)
                .map(indexSet -> indexSet.getConfig().indexAnalyzer())
                .orElse("standard");
        final String messageAnalyzer = analyzer == null ? indexAnalyzer : analyzer;

        return MessageTokens.create(messages.analyze(string, index, messageAnalyzer));
    }
}
