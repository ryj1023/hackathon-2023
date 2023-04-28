import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fetch from 'isomorphic-fetch';
import { exists } from "~/utils/arrays";
import { writeFile, mkdir, readdir } from "fs/promises";
import { resolve } from "path";

const isFulfilled = <T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

const downloadAndSaveImage = async (url: string, path: string) => {
  const filename = url.split('?').shift()?.split('/').pop();
  if (!filename) throw new Error('No filename found');

  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  
  await writeFile(resolve(`./public/${path}/${filename}`), Buffer.from(buffer));

  return filename;
}
const AVATAR_FOLDER = 'images/avatars';
const PUBLIC_AVATAR_FOLDER = `./public/${AVATAR_FOLDER}`;

const SCENEREY_FOLDER = 'images/scenery';
const PUBLIC_SCENERY_FOLDER = `./public/${SCENEREY_FOLDER}`;

export const imagesRouter = createTRPCRouter({
  listAvatars: publicProcedure
    .query(async () => {
      const nameEntries = await readdir(resolve(PUBLIC_AVATAR_FOLDER), { withFileTypes: true });

      const names = nameEntries
        .filter(e => e.isDirectory())
        .map(e => e.name);

      const images = await Promise.all(names.map(async (name) => {
        const imageEntries = await readdir(resolve(PUBLIC_AVATAR_FOLDER, name), { withFileTypes: true });
        return {
          name,
          images: imageEntries.filter(e => e.isFile())
          .map(e => `/${AVATAR_FOLDER}/${name}/${e.name}`)
        };
      }));

      return images;
    }),
  newHero: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      samples: z.number().min(1).max(4),
      backgroundColor: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const prompt = `Portrait of a super hero named ${input.name}, realistic, digital art, with a ${input.backgroundColor ?? 'white'} background.`;

      const res = await ctx.openai.createImage({
        prompt,
        size: '256x256',
        n: input.samples,
      });

      const urls = res.data.data.map(d => d.url).filter(exists);

      const path = `${AVATAR_FOLDER}/${input.name}`;

      // ensure the folder exists
      await mkdir(resolve(`./public/${path}`), { recursive: true });

      const downloadToPath = (url: string) => downloadAndSaveImage(url, path);

      // fetch and store the images locally
      const images = await Promise.allSettled(urls.map(downloadToPath));

      return images
        .filter(isFulfilled)
        .map(r => `/${path}/${r.value}`);
    }),
  newVillain: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      samples: z.number().min(1).max(4),
      backgroundColor: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const prompt = `Portrait of a super villain named ${input.name}, realistic, digital art, with a ${input.backgroundColor ?? 'white'} background.`;

      const res = await ctx.openai.createImage({
        prompt,
        size: '256x256',
        n: input.samples,
      });
      const urls = res.data.data.map(d => d.url).filter(exists);

      const path = `${AVATAR_FOLDER}/${input.name}`;

      // ensure the folder exists
      await mkdir(resolve(`./public/${path}`), { recursive: true });

      const downloadToPath = (url: string) => downloadAndSaveImage(url, path);

      // fetch and store the images locally
      const images = await Promise.allSettled(urls.map(downloadToPath));

      return images
        .filter(isFulfilled)
        .map(r => `/${path}/${r.value}`);
    }),

  newScenery: publicProcedure
    .input(z.object({
      label: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const prompt = `A background image depticting '${input.label}', realistic, digital art.`;

      const res = await ctx.openai.createImage({
        prompt,
        size: '1024x1024',
        n: 1,
      });
      const urls = res.data.data.map(d => d.url).filter(exists);

      const path = SCENEREY_FOLDER;

      // ensure the folder exists
      await mkdir(resolve(PUBLIC_SCENERY_FOLDER), { recursive: true });

      const downloadToPath = (url: string) => downloadAndSaveImage(url, path);

      // fetch and store the images locally
      const images = await Promise.allSettled(urls.map(downloadToPath));

      console.log('images', images)

      return images
        .filter(isFulfilled)
        .map(r => `/${path}/${r.value}`);
    }),

  listScenery: publicProcedure
    .query(async () => {
      const imageEntries = await readdir(resolve(PUBLIC_SCENERY_FOLDER), { withFileTypes: true });

      const images = imageEntries
        .filter(e => e.isFile())
        .map(e => `/${SCENEREY_FOLDER}/${e.name}`);

      return images;
    }),
});