import { type CreateChatCompletionResponse } from 'openai';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { exists } from '~/utils/arrays';
import { type OpenAIMessage, openAIMessageSchema, storyOutcomeSchema } from '../schemas';


let tokensUsed = 0;

const CHAT_MODEL = 'gpt-3.5-turbo';

const processResponse = (response: CreateChatCompletionResponse, messages: OpenAIMessage[]): OpenAIMessage[] => {
  response.usage?.total_tokens && (tokensUsed += response.usage.total_tokens);
  const newMessages = response.choices
        .map(c => c.message)
        .filter(exists);

      return [...messages, ...newMessages];
}

export const storyTellerRouter = createTRPCRouter({
  tokensUsed: publicProcedure
    .query( () => tokensUsed),
  new: publicProcedure
    .input(z.object({
      heroName: z.string(),
      villainName: z.string(),
      scene: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemMessage = `You are a storyteller.
You are telling a story about a hero named ${input.heroName} and a villan named ${input.villainName}.
The hero and villan are fighting.
Each response should be a short part of the battle.
Do not ask questions.
Make sure the story doesn't end until either one is defeated.`;

      const storySoFar = [{
        role: 'system',
        content: systemMessage,
      }, {
        role: 'user',
        content: `The story starts at ${input.scene}.`,
      }] satisfies OpenAIMessage[];

      const { data } = await ctx.openai.createChatCompletion({
        model: CHAT_MODEL,
        messages: storySoFar,
      });

      return processResponse(data, storySoFar);
    }),
  next: publicProcedure
    .input(z.object({
      storySoFar: z.array(openAIMessageSchema),
      outcome: storyOutcomeSchema,
    }))
    .mutation(async ({ input, ctx }) => {

      let nextMessagePrompt: string;

      switch(input.outcome) {
        case 'success':
          nextMessagePrompt = 'The hero is successful in damaging the villan';
          break;
        case 'failure':
          nextMessagePrompt = 'The villan damages the hero';
          break;
        case 'complete':
          nextMessagePrompt = 'The hero defeats the villan';
          break;
        case 'defeat':
          nextMessagePrompt = 'The hero is defeated by the villan';
          break;
      }

      const nextMessage = {
        role: 'user',
        content: nextMessagePrompt,
      } satisfies OpenAIMessage;

      const { data } = await ctx.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [...input.storySoFar, nextMessage]
      });

      return processResponse(data, input.storySoFar);
    }),
});