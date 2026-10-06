import {useCallback} from 'react';

import {MenuOutlined, SettingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setStartPageLearnTopic} from '@redux/reducers/ui';

import { Icon as RawIcon } from "@components/foundation/primitives";
import { WalkThrough, WalkThroughCard } from "@components/foundation/walkthrough";
import {WALK_THROUGH_STEPS} from '@shared/constants/walkthrough';
import {Colors} from '@shared/styles';

const WalkThroughModal = () => {
  const dispatch = useAppDispatch();

  const topic = useAppSelector(state => state.ui.startPage.learn.learnTopic);
  const dismissWalkThrough = useCallback(() => dispatch(setStartPageLearnTopic(undefined)), [dispatch]);

  return (
    <WalkThrough dismissWalkThrough={dismissWalkThrough} topic={String(topic)}>
      {topic === 'explore' && (
        <WalkThroughCard
          heading="Explore"
          onFinish={dismissWalkThrough}
          items={[
            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>1. Your K8s workspace</WalkThroughCard.SubHeading>

              <WalkThroughCard.Text>
                Create a project - then find here all the resource inputs contained in it. Switch between them for
                different views. Click on the Monokle logo, the three lines icon, or the project name in the top bar to
                change the project or create a new one.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,

            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>2. Preview Helm charts</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                Browse charts in your project, select values files and render resources locally to inspect and validate them.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,

            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>3. Inspect rendered resources</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                Use the resource navigator, validation pane and resource graph to review the output of a Helm dry-run.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,
          ]}
        />
      )}

      {topic === 'edit' && (
        <WalkThroughCard
          heading="Edit"
          onFinish={dismissWalkThrough}
          items={[
            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>1. Templates & Forms</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                <WalkThroughCard.Text $bold>Use code or forms indistinctly.</WalkThroughCard.Text> Jump from one to
                another anytime to see changes.
              </WalkThroughCard.Text>
              <WalkThroughCard.Text>
                <WalkThroughCard.Text $bold>Code / form split editor.</WalkThroughCard.Text> Click on
                <Icon name="split-view" $transparent $color={Colors.blue6} />
                to access a split screen with side-to-side code and form views.
              </WalkThroughCard.Text>
              <WalkThroughCard.Text>
                <WalkThroughCard.Text $bold>Right click to use a template</WalkThroughCard.Text>
                &nbsp;anywhere in your code.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,

            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>2. Compare & sync</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                Compare local manifests and rendered previews before saving changes.
              </WalkThroughCard.Text>
              <WalkThroughCard.Text>
                Review differences between values configurations and copy the resources you need into your project.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,
          ]}
        />
      )}

      {topic === 'validate' && (
        <WalkThroughCard
          heading="Validate"
          onFinish={dismissWalkThrough}
          mediaItems={WALK_THROUGH_STEPS[topic]}
          items={[
            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>1. Enforce validation policies</WalkThroughCard.SubHeading>

              <WalkThroughCard.Text>
                <WalkThroughCard.Text $bold>Activate OPA rules </WalkThroughCard.Text>based on your policy or
                preferences, severity etc. Set it all up in
                <SettingOutlinedIcon />
              </WalkThroughCard.Text>

              <WalkThroughCard.Text>
                <WalkThroughCard.Text $bold>Check schema version.</WalkThroughCard.Text> Make sure you have your desired
                K8s schema version on. Find it always on the top bar for quick switch.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,

            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>2. See errors introduced</WalkThroughCard.SubHeading>

              <WalkThroughCard.Text>
                A validation or schema change can incur in new errors. Find them easily grouped for a quick fix in
                <Icon name="checked" />
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,
          ]}
        />
      )}

      {topic === 'publish' && (
        <WalkThroughCard
          heading="Save & export"
          onFinish={dismissWalkThrough}
          items={[
            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>1. Save locally</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                Save edited manifests and Helm values in your project folder. Review validation results before saving.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,

            <WalkThroughCard.Slice>
              <WalkThroughCard.SubHeading>2. Export Helm output</WalkThroughCard.SubHeading>
              <WalkThroughCard.Text>
                Render a chart with your selected values and save the resulting resources to a local file or folder.
              </WalkThroughCard.Text>
            </WalkThroughCard.Slice>,
          ]}
        />
      )}
    </WalkThrough>
  );
};

export default WalkThroughModal;

export const Icon = styled(RawIcon)<{
  $transparent?: boolean;
  $color?: string;
}>`
  background-color: ${({$transparent}) => ($transparent ? 'transparent' : Colors.grey4)};
  font-size: 14px;
  padding: 2px;
  margin: 0 4px;
  color: ${({$color}) => $color || Colors.grey9};
  border-radius: 50%;
`;

export const MenuOutlinedIcon = styled(MenuOutlined)`
  background-color: ${Colors.grey4};
  font-size: 14px;
  padding: 4px;
  margin: 0 4px;
  color: ${Colors.grey9};
  border-radius: 2px;
`;

export const SettingOutlinedIcon = styled(SettingOutlined)`
  background-color: ${Colors.grey4};
  font-size: 14px;
  padding: 4px;
  margin: 0 4px;
  color: ${Colors.grey9};
  border-radius: 50%;
`;
