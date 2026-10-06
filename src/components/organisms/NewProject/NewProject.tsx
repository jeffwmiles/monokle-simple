import {useAppDispatch} from '@redux/hooks';
import {openFolderExplorer, openHelmRepoModal} from '@redux/reducers/ui';

import SelectFolder from '@assets/newProject/FromFolder.svg';
import CreateFromHelm from '@assets/newProject/FromHelm.svg';

import {trackEvent} from '@shared/utils/telemetry';

import ActionCard from './ActionCard';
import * as S from './NewProject.styled';

const NewProject: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const START_PROJECT_OPTIONS = [
    {
      disabled: false,
      itemId: 'select-existing-folder',
      itemLogo: SelectFolder,
      itemTitle: 'Open a folder with Helm charts',
      itemDescription: 'Open local Helm charts and values files.',
      itemAction: handleOpenFolderExplorer,
    },
    {
      disabled: false,
      itemId: 'start-from-helm',
      itemLogo: CreateFromHelm,
      itemTitle: 'Start from a Helm Chart',
      itemDescription: 'Create a new project from a Helm Chart in a Helm repository, and save it locally.',
      itemAction: () => {
        dispatch(openHelmRepoModal());
        trackEvent('app_start/create_project', {from: 'helm'});
      },
    },
  ];

  return (
    <S.NewProjectContainer>
      {START_PROJECT_OPTIONS.map(item => {
        const {disabled, itemId, itemLogo, itemTitle, itemDescription, itemAction} = item;

        return (
          <ActionCard
            description={itemDescription}
            disabled={disabled}
            key={itemId}
            id={itemId}
            logo={itemLogo}
            title={itemTitle}
            onClick={itemAction}
            size="big"
          />
        );
      })}
    </S.NewProjectContainer>
  );
};

export default NewProject;
