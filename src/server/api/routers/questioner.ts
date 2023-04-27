import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { languageSchema } from "../schemas";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

const CHAT_MODEL = 'gpt-3.5-turbo';
const QUESTIONER_SYSTEM = `You are a tester.
You ask multiple choice questions about programming.
Your response should have 3 parts: the question, the options, and the answer.
Each part should be seperated by a double line break.
Each option should be seperated by a single line break.
Each part should not be labeled.`;


export type QuestionReturn = inferRouterOutputs<typeof questionerRouter>['question'];


export const questionerRouter = createTRPCRouter({
  question: publicProcedure
    .input(z.object({
      language: languageSchema,
      difficulty: z.number().min(1).max(10),
      topic: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const res = await ctx.openai.createChatCompletion({
        model: CHAT_MODEL,
        messages: [{
          role: 'system',
          content: QUESTIONER_SYSTEM,
        }, {
          role: 'user',
          content: `Give me a multiple choice programming question about the language: ${input.language} with a difficulty of '${input.difficulty}' on a scale of 1-10. Themed around super heros`,
        }]
      });

      const message = res.data.choices?.[0]?.message;

      if (!message) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No response from OpenAI'});
      }

      const [question, options, answer] = message.content.split('\n\n');

      return {
        question,
        options: options?.split('\n'),
        answer,
      };
    }),
});