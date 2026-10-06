import log from 'loglevel';
import type {ChatCompletionMessageParam} from 'openai/resources/chat/completions';

import {getOpenAIClient} from './ai.client';

export type CreateChatCompletionParams = {
  messages: ChatCompletionMessageParam[];
};

export async function createChatCompletion({messages}: CreateChatCompletionParams): Promise<string | undefined> {
  const openai = getOpenAIClient();
  if (!openai) {
    return;
  }
  const startTime = new Date().getTime();
  log.info('[createChatCompletion]: Waiting for OpenAI response...');
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    n: 1,
  });
  const endTime = new Date().getTime();
  log.info('[createChatCompletion]: Execution time: ', (endTime - startTime) / 1000);
  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error('OpenAI returned no generated content');
  }
  return content;
}
