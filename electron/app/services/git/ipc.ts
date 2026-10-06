import {handleIpc} from '../../utils/ipc';

const disabled = () => {
  throw new Error('Git integration is disabled. Manage repositories outside the application.');
};

handleIpc('git:checkoutGitBranch', disabled);
handleIpc('git:cloneGitRepo', disabled);
handleIpc('git:commitChanges', disabled);
handleIpc('git:createLocalBranch', disabled);
handleIpc('git:deleteLocalBranch', disabled);
handleIpc('git:fetchRepo', disabled);
handleIpc('git:getAheadBehindCommitsCount', disabled);
handleIpc('git:getBranchCommits', disabled);
handleIpc('git:getChangedFiles', disabled);
handleIpc('git:getCommitResources', disabled);
handleIpc('git:getGitRemotePath', disabled);
handleIpc('git:getRepoInfo', disabled);
handleIpc('git:initGitRepo', disabled);
handleIpc('git:isFolderGitRepo', () => false);
handleIpc('git:isGitInstalled', () => false);
handleIpc('git:publishLocalBranch', disabled);
handleIpc('git:pullChanges', disabled);
handleIpc('git:pushChanges', disabled);
handleIpc('git:setRemote', disabled);
handleIpc('git:stageChangedFiles', disabled);
handleIpc('git:unstageFiles', disabled);
