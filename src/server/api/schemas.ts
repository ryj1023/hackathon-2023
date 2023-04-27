import { z } from "zod";

export const openAIMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  name: z.string().optional(),
});

export type OpenAIMessage = z.infer<typeof openAIMessageSchema>;

export const storyOutcomeSchema = z.enum(['success', 'failure', 'complete', 'defeat']);

export type StoryOutcome = z.infer<typeof storyOutcomeSchema>;

export const languageSchema = z.enum(['TypeScript', 'C#', 'Python', 'Haskell', 'JavaScript']);

export type Language = z.infer<typeof languageSchema>;