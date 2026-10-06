import {useCallback} from 'react';

import {CheckOutlined, CloudUploadOutlined as RawCloudUploadOutlined, UnorderedListOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setStartPageLearnTopic} from '@redux/reducers/ui';

import { Icon } from "@components/foundation/primitives";
import { LearnCard, LearnPage as LearnPageContainer } from "@components/foundation/walkthrough";
import {LearnTopicType} from '@shared/models/ui';
import {openDiscord, openDocumentation, openTutorialVideo, trackEvent} from '@shared/utils';

import WalkThroughModal from './WalkThroughModal';

const LearnPage = () => {
  const dispatch = useAppDispatch();
  const learnTopic = useAppSelector(state => state.ui.startPage.learn.learnTopic);

  const onLearnCardClickHandler = useCallback(
    (topic: LearnTopicType) => {
      dispatch(setStartPageLearnTopic(topic));
      trackEvent('learn/select_topic', {topic});
    },
    [dispatch]
  );
  return (
    <LearnPageContainer
      onHelpfulResourceCardClick={topic => {
        if (topic === 'documentation') {
          openDocumentation();
        } else if (topic === 'discord') {
          openDiscord();
        } else if (topic === 'video-tutorial') {
          openTutorialVideo();
        }
      }}
    >
      <LearnCard
        description="Explore local projects, Helm charts, values files and rendered resources."
        icon={<UnorderedListOutlined />}
        title="Explore"
        onClick={() => onLearnCardClickHandler('explore')}
      />

      <LearnCard
        description="Fix errors in your resources, compare them, learn about yaml best practices and much more."
        icon={<Icon name="terminal" style={{fontSize: '16px'}} />}
        title="Edit"
        onClick={() => onLearnCardClickHandler('edit')}
      />

      <LearnCard
        description="Configure your policies & validation rules, create your own. See & fix validation errors."
        icon={<CheckOutlined />}
        title="Validate"
        onClick={() => onLearnCardClickHandler('validate')}
      />

      <LearnCard
        description="Save manifests locally and export rendered Helm resources."
        icon={<CloudUploadOutlined />}
        title="Save & export"
        onClick={() => onLearnCardClickHandler('publish')}
      />
      {learnTopic && <WalkThroughModal />}
    </LearnPageContainer>
  );
};

export default LearnPage;

export const CloudUploadOutlined = styled(RawCloudUploadOutlined)`
  font-size: 16px;
`;
