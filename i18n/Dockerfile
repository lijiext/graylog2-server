ARG JAVA_VERSION=17

# Stage 1: unpack tarball + build data layout
FROM ubuntu:jammy AS graylog-downloader

ARG GRAYLOG_HOME=/usr/share/graylog
ARG GRAYLOG_UID=1100
ARG GRAYLOG_GID=1100
ARG TARBALL=graylog.tgz

WORKDIR /tmp
COPY ${TARBALL} /tmp/graylog.tgz

RUN mkdir -p /opt/graylog && \
    tar --extract --gzip --file /tmp/graylog.tgz --directory /opt/graylog && \
    rm -f /tmp/graylog.tgz && \
    install --directory --mode=0750 \
      /opt/graylog/data \
      /opt/graylog/data/journal \
      /opt/graylog/data/log \
      /opt/graylog/data/config \
      /opt/graylog/data/plugin \
      /opt/graylog/data/contentpacks \
      /opt/graylog/data/scripts \
      /opt/graylog/data/data \
      /opt/graylog/data/libnative \
      /opt/graylog/data/libnative/jna \
      /opt/graylog/config && \
    mv /opt/graylog ${GRAYLOG_HOME} && \
    mv ${GRAYLOG_HOME}/plugin ${GRAYLOG_HOME}/plugins-default && \
    install -d -m 0755 ${GRAYLOG_HOME}/plugins-merged && \
    install -d -m 0755 ${GRAYLOG_HOME}/plugin && \
    chown -R ${GRAYLOG_UID}:${GRAYLOG_GID} ${GRAYLOG_HOME}

COPY --chown=${GRAYLOG_UID}:${GRAYLOG_GID} config/ ${GRAYLOG_HOME}/config/

# Stage 2: runtime
FROM eclipse-temurin:${JAVA_VERSION}-jre-jammy

ARG GRAYLOG_HOME=/usr/share/graylog
ARG GRAYLOG_USER=graylog
ARG GRAYLOG_UID=1100
ARG GRAYLOG_GROUP=graylog
ARG GRAYLOG_GID=1100
ARG GRAYLOG_VERSION=6.1.16-zh

COPY --chown=${GRAYLOG_UID}:${GRAYLOG_GID} --from=graylog-downloader ${GRAYLOG_HOME} ${GRAYLOG_HOME}

WORKDIR ${GRAYLOG_HOME}
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN echo "export GRAYLOG_VERSION=${GRAYLOG_VERSION}" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_SERVER_JAVA_OPTS='-Dlog4j2.formatMsgNoLookups=true -Djdk.tls.acknowledgeCloseNotify=true -XX:+UnlockExperimentalVMOptions -XX:-OmitStackTraceInFastThrow -XX:+UseG1GC -server'" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_HOME=${GRAYLOG_HOME}" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_USER=${GRAYLOG_USER}" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_GROUP=${GRAYLOG_GROUP}" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_UID=${GRAYLOG_UID}" >> /etc/profile.d/graylog.sh && \
    echo "export GRAYLOG_GID=${GRAYLOG_GID}" >> /etc/profile.d/graylog.sh && \
    echo "export PATH=${GRAYLOG_HOME}/bin:${PATH}" >> /etc/profile.d/graylog.sh && \
    apt-get update > /dev/null && \
    apt-get install --no-install-recommends --assume-yes \
      curl tini libcap2-bin fonts-dejavu fontconfig > /dev/null && \
    addgroup --gid "${GRAYLOG_GID}" --quiet "${GRAYLOG_GROUP}" && \
    adduser --disabled-password --disabled-login --gecos '' \
      --home ${GRAYLOG_HOME} \
      --uid "${GRAYLOG_UID}" --gid "${GRAYLOG_GID}" \
      --quiet "${GRAYLOG_USER}" && \
    setcap 'cap_net_bind_service=+ep' "${JAVA_HOME}/bin/java" && \
    find "$JAVA_HOME/lib" -name '*.so' -exec dirname '{}' ';' | sort -u > /etc/ld.so.conf.d/docker-openjdk.conf && \
    ldconfig && \
    apt-get clean > /dev/null && \
    rm -rf /tmp/* /var/lib/apt/lists/* /var/log/*

COPY docker-entrypoint.sh /
COPY health_check.sh /
RUN chmod 0755 /docker-entrypoint.sh /health_check.sh

EXPOSE 9000
USER ${GRAYLOG_USER}
VOLUME ${GRAYLOG_HOME}/data
ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]
CMD ["server"]

HEALTHCHECK --interval=10s --timeout=2s --retries=12 CMD /health_check.sh
