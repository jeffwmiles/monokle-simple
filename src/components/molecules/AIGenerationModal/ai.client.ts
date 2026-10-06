import OpenAI from 'openai';

import {electronStore} from '@shared/utils';

let openai: OpenAI | undefined;
let lastApiKey: string | undefined;

export const getOpenAIClient = () => {
  const apiKey: string | undefined = electronStore.get('appConfig.userApiKeys.OpenAI');
  if (!apiKey) {
    return;
  }

  if (!openai || lastApiKey !== apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  lastApiKey = apiKey;

  return openai;
};
