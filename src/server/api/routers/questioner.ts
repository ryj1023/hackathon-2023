import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { languageSchema } from "../schemas";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { type OpenAIApi } from "openai";
import { retrier } from "~/utils/async";

const CHAT_MODEL = 'gpt-3.5-turbo';
const QUESTIONER_SYSTEM = `You are a tester.
You ask multiple choice questions about programming.
Your response should have 3 parts: the question, the options, and the answer.
Each part should be seperated by a double line break.
Each option should be seperated by a single line break.
Each part should not be labeled.`;


export type QuestionReturn = inferRouterOutputs<typeof questionerRouter>['question'];

const fetchQuestion = async (openai: OpenAIApi, language: string, difficulty: number) => {
  const res = await openai.createChatCompletion({
    model: CHAT_MODEL,
    messages: [{
      role: 'system',
      content: QUESTIONER_SYSTEM,
    }, {
      role: 'user',
      content: `Give me a multiple choice programming question about the language: ${language} with a difficulty of '${difficulty}' on a scale of 1-10. Options should be labeld A), B), C), etc.`,
    }]
  });

  const message = res.data.choices?.[0]?.message;

  if (!message) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No response from OpenAI'});
  }

  let question: string | undefined;
  let options: string | undefined;
  let answer: string | undefined;
  if (message.content.startsWith('What is the output')) {
    const parts = message.content.split('\n\n');
    question = `${parts[0]!}\n\n${parts[1]!}`;
    options = parts[2];
    answer = parts[3];
  } else {
    [question, options, answer] = message.content.split('\n\n');
  }

  return {
    question,
    options: options?.split('\n'),
    answer,
  };
}

export const questionerRouter = createTRPCRouter({
  question: publicProcedure
    .input(z.object({
      language: languageSchema,
      difficulty: z.number().min(1).max(10),
    })).mutation(async ({ input, ctx }) => {
      return await retrier(
        () => fetchQuestion(ctx.openai, input.language, input.difficulty),
        res => !!(res.question && res.options && res.options.length > 3 && res.options.every(o => /^\s*\w\)/.exec(o)) && res.answer));
    }),
});