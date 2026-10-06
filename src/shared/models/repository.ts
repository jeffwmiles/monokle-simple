import * as Rt from 'runtypes';

export const GitRepositoryRuntype = Rt.Object({
  owner: Rt.String,
  name: Rt.String,
  branch: Rt.String,
});

export const isGitRepository = GitRepositoryRuntype.guard;
export const validateGitRepository = GitRepositoryRuntype.check;
