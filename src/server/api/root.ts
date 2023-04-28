import { createTRPCRouter } from "~/server/api/trpc";
import { storyTellerRouter } from "./routers/storyTeller";
import { questionerRouter } from "./routers/questioner";
import { imagesRouter } from "./routers/images";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  storyTeller: storyTellerRouter,
  questioner: questionerRouter,
  images: imagesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
