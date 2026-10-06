import {shell} from 'electron';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingError} from '@redux/reducers/main';
import {
  setIsFromBackToStart,
  setIsInQuickClusterMode,
  setLayoutSize,
  setStartPageMenuOption,
  toggleNotifications,
  toggleStartProjectPane,
} from '@redux/reducers/ui';
import {stopPreview} from '@redux/thunks/preview';

import {NewVersionNotice} from '@molecules';

import {useHelpMenuItems} from '@hooks/menuItemsHooks';

import {useRefSelector} from '@utils/hooks';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {isInClusterModeSelector} from '@shared/utils/selectors';
import {trackEvent} from '@shared/utils/telemetry';

import DownloadProgress from './DownloadProgress';
import {K8sVersionSelection} from './K8sVersionSelection';
import * as S from './PageHeader.styled';

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const autosavingError = useAppSelector(state => state.main.autosaving.error);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const isNewVersionAvailable = useAppSelector(state => state.config.isNewVersionAvailable);
  const isNewVersionNoticeVisible = useAppSelector(state => state.ui.newVersionNotice.isVisible);

  const isInClusterModeRef = useRefSelector(isInClusterModeSelector);
  const isInQuickClusterModeRef = useRefSelector(state => state.ui.isInQuickClusterMode);
  const isStartProjectPaneVisibleRef = useRefSelector(state => state.ui.isStartProjectPaneVisible);
  const startPageSelectedMenuOption = useRefSelector(state => state.ui.startPage.selectedMenuOption);

  let timeoutRef = useRef<any>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [showAutosaving, setShowAutosaving] = useState(false);

  const helpMenuItems = useHelpMenuItems();
  const [pageHeaderRef, {height: pageHeaderHeight}] = useMeasure<HTMLDivElement>();

  const toggleNotificationsDrawer = () => {
    dispatch(toggleNotifications());
    trackEvent('notifications/toggle');
  };

  const onClickLogoHandler = () => {
    if (!isStartProjectPaneVisibleRef.current) {
      dispatch(toggleStartProjectPane());
      dispatch(setIsFromBackToStart(true));
    }

    if (isInQuickClusterModeRef.current) {
      dispatch(setIsInQuickClusterMode(false));
    }

    if (isInClusterModeRef.current) {
      dispatch(stopPreview());
    }

    dispatch(setStartPageMenuOption(startPageSelectedMenuOption.current));
  };

  const createGitHubIssue = useCallback(() => {
    if (!autosavingError) {
      return null;
    }

    const url = newGithubIssueUrl({
      user: 'kubeshop',
      repo: 'monokle',
      title: '[crash] Something went wrong',
      body: `**Describe the bug**\n\n\n**Steps to reproduce**\n\n\n**Stacktrace** \n\n \`\`\`\n${autosavingError.message}\n ${autosavingError.stack}\n\`\`\``,
      labels: ['bug'],
    });

    shell.openExternal(url);
    trackEvent('help/create_issue');
  }, [autosavingError]);

  const onClickProjectHandler = () => {
    dispatch(toggleStartProjectPane());

    if (isInQuickClusterModeRef.current) {
      dispatch(setIsInQuickClusterMode(false));
    }

    if (isInClusterModeRef.current) {
      dispatch(stopPreview());
    }
  };

  useEffect(() => {
    if (pageHeaderHeight) {
      dispatch(setLayoutSize({...layoutSize, header: pageHeaderHeight}));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageHeaderHeight]);

  useEffect(() => {
    if (autosavingStatus === undefined) {
      return;
    }

    if (!autosavingStatus && showAutosaving) {
      let timeoutTime = 3000;

      if (autosavingError) {
        timeoutTime = 5000;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (autosavingError) {
          dispatch(setAutosavingError(undefined));
        }

        setShowAutosaving(false);
      }, timeoutTime);
    } else {
      setShowAutosaving(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosavingStatus]);

  return (
    <S.PageHeaderContainer ref={pageHeaderRef}>
      <S.Header>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <S.LogoContainer $isNewVersionNoticeVisible={isNewVersionNoticeVisible}>
            <S.NewVersionBadge dot={isNewVersionAvailable}>
              <NewVersionNotice>
                <S.Logo
                  id="monokle-logo-header"
                  onClick={() => {
                    if (isStartProjectPaneVisibleRef.current) {
                      return;
                    }

                    onClickLogoHandler();
                  }}
                  src={MonokleKubeshopLogo}
                  alt="Monokle"
                />
              </NewVersionNotice>
            </S.NewVersionBadge>
          </S.LogoContainer>

          <S.Divider type="vertical" />
          {activeProject ? (
            <>
              <S.ActiveProjectButton type="text" onClick={onClickProjectHandler}>
                <S.MenuOutlinedIcon />
                <S.ProjectName>{activeProject.name}</S.ProjectName>
              </S.ActiveProjectButton>
            </>
          ) : (
            <S.BackProjectsButton type="primary" size="small" onClick={onClickLogoHandler}>
              Back to Start
            </S.BackProjectsButton>
          )}

          {showAutosaving && (
            <S.AutosavingContainer>
              {autosavingStatus ? (
                <>
                  <ReloadOutlined spin />
                  Saving...
                </>
              ) : autosavingError ? (
                <S.AutosavingErrorContainer>
                  Your changes could not be saved
                  <Button type="link" onClick={createGitHubIssue}>
                    Report
                  </Button>
                </S.AutosavingErrorContainer>
              ) : (
                autosavingStatus === false && 'Saved'
              )}
            </S.AutosavingContainer>
          )}

          <DownloadProgress />
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <K8sVersionSelection />

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
            <Badge count={unseenNotificationsCount} size="small">
              <S.BellOutlined onClick={toggleNotificationsDrawer} />
            </Badge>
          </Tooltip>
          <Dropdown
            trigger={['click']}
            menu={{
              items: helpMenuItems,
              onClick: () => {
                setIsHelpMenuOpen(false);
              },
            }}
            open={isHelpMenuOpen}
            onOpenChange={() => {
              setIsHelpMenuOpen(!isHelpMenuOpen);
            }}
            placement="bottomLeft"
            overlayClassName="help-menu-dropdown"
          >
            <S.EllipsisOutlined />
          </Dropdown>
        </div>
      </S.Header>
    </S.PageHeaderContainer>
  );
};

export default PageHeader;
