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
import React from 'react';
import Reflux from 'reflux';
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import { LinkContainer } from 'components/common/router';
import { Row, Col, Button, ButtonToolbar, BootstrapModalConfirm } from 'components/bootstrap';
import Spinner from 'components/common/Spinner';
import Routes from 'routing/Routes';
import UserNotification from 'util/UserNotification';
import { DocumentTitle, PageHeader } from 'components/common';
import ContentPackDetails from 'components/content-packs/ContentPackDetails';
import ContentPackVersions from 'components/content-packs/ContentPackVersions';
import ContentPackInstallations from 'components/content-packs/ContentPackInstallations';
import ContentPackInstallEntityList from 'components/content-packs/ContentPackInstallEntityList';
import withParams from 'routing/withParams';
import { ContentPacksActions, ContentPacksStore } from 'stores/content-packs/ContentPacksStore';
import withHistory from 'routing/withHistory';

import ShowContentPackStyle from './ShowContentPackPage.css';

const ShowContentPackPage = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  displayName: 'ShowContentPackPage',

  // eslint-disable-next-line react/no-unused-class-component-methods
  propTypes: {
    history: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(ContentPacksStore)],

  getInitialState() {
    return {
      showModal: false,
      selectedVersion: undefined,
      uninstallEntities: undefined,
      uninstallContentPackId: undefined,
      uninstallInstallId: undefined,
    };
  },

  componentDidMount() {
    ContentPacksActions.get(this.props.params.contentPackId).catch((error) => {
      if (error.status === 404) {
        UserNotification.error(
          `找不到 ID 为 ${this.props.params.contentPackId} 的内容包，可能已被删除。`,
        );
      } else {
        UserNotification.error('发生内部服务器错误。请检查您的日志文件以获取更多信息');
      }

      const { history } = this.props;
      history.push(Routes.SYSTEM.CONTENTPACKS.LIST);
    });

    ContentPacksActions.installList(this.props.params.contentPackId);
  },

  _onVersionChanged(newVersion) {
    this.setState({ selectedVersion: newVersion });
  },

  _deleteContentPackRev(contentPackId, revision) {
    /* eslint-disable-next-line no-alert */
    if (window.confirm('You are about to delete this content pack revision, are you sure?')) {
      ContentPacksActions.deleteRev(contentPackId, revision).then(() => {
        UserNotification.success('内容包修订版已成功删除。', '成功');

        ContentPacksActions.get(contentPackId).catch((error) => {
          if (error.status !== 404) {
            UserNotification.error('发生内部服务器错误。请检查您的日志文件以获取更多信息');
          }

          const { history } = this.props;
          history.push(Routes.SYSTEM.CONTENTPACKS.LIST);
        });
      }, (error) => {
        let errMessage = error.message;

        if (error.responseMessage) {
          errMessage = error.responseMessage;
        }

        UserNotification.error(`删除内容包失败：${errMessage}`, '错误');
      });
    }
  },

  _onUninstallContentPackRev(contentPackId, installId) {
    ContentPacksActions.uninstallDetails(contentPackId, installId).then((result) => {
      this.setState({ uninstallEntities: result.entities });
    });

    this.setState({
      showModal: true,
      uninstallContentPackId: contentPackId,
      uninstallInstallId: installId,
    });
  },

  _clearUninstall() {
    this.setState({
      showModal: false,
      uninstallContentPackId: undefined,
      uninstallInstallId: undefined,
      uninstallEntities: undefined,
    });
  },

  _uninstallContentPackRev() {
    const contentPackId = this.state.uninstallContentPackId;

    ContentPacksActions.uninstall(this.state.uninstallContentPackId, this.state.uninstallInstallId).then(() => {
      UserNotification.success('内容包卸载成功。', '成功');
      ContentPacksActions.installList(contentPackId);
      this._clearUninstall();
    }, () => {
      UserNotification.error('卸载内容包失败，请查看日志以获取更多信息。', '错误');
    });
  },

  _installContentPack(contentPackId, contentPackRev, parameters) {
    ContentPacksActions.install(contentPackId, contentPackRev, parameters).then(() => {
      UserNotification.success('内容包安装成功。', '成功');
      ContentPacksActions.installList(contentPackId);
    }, (error) => {
      UserNotification.error(`安装内容包失败，状态为：${error}。
         无法安装 ID 为 ${contentPackId} 的内容包`);
    });
  },

  render() {
    if (!this.state.contentPackRevisions) {
      return (<Spinner />);
    }

    const { contentPackRevisions, selectedVersion, constraints } = this.state;

    return (
      <DocumentTitle title="内容包">
        <span>
          <PageHeader title="内容包"
                      topActions={(
                        <ButtonToolbar>
                          <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.LIST}>
                            <Button bsStyle="info">内容包</Button>
                          </LinkContainer>
                        </ButtonToolbar>
                      )}>
            <span>
              内容包可加速特定数据源的设置过程。内容包可以包含输入端/提取器、数据流和仪表盘。
              <br />
              在以下位置查找更多内容包 {' '}
              <a href="https://marketplace.graylog.org/" target="_blank" rel="noopener noreferrer">Graylog 应用市场</a>.
            </span>
          </PageHeader>

          <Row>
            <Col md={4} className="content">
              <div id="content-pack-versions">
                <Row className={ShowContentPackStyle.leftRow}>
                  <Col>
                    <h2>版本</h2>
                    <ContentPackVersions contentPackRevisions={contentPackRevisions}
                                         onInstall={this._installContentPack}
                                         onChange={this._onVersionChanged}
                                         onDeletePack={this._deleteContentPackRev} />
                  </Col>
                </Row>
                <Row className={ShowContentPackStyle.leftRow}>
                  <Col>
                    <h2>安装</h2>
                    <ContentPackInstallations installations={this.state.installations}
                                              onUninstall={this._onUninstallContentPackRev} />
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={8} className="content">
              <ContentPackDetails contentPack={contentPackRevisions.contentPack(selectedVersion)}
                                  constraints={constraints[selectedVersion]}
                                  showConstraints
                                  verbose />
            </Col>
          </Row>
        </span>
        <BootstrapModalConfirm showModal={this.state.showModal}
                               title="您确定要卸载此内容包吗？"
                               onConfirm={this._uninstallContentPackRev}
                               onCancel={this._clearUninstall}>
          <ContentPackInstallEntityList uninstall entities={this.state.uninstallEntities} />
        </BootstrapModalConfirm>
      </DocumentTitle>
    );
  },
});

export default withHistory(withParams(ShowContentPackPage));
