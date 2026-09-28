import * as z from "zod";

import { base } from "./base";

export const listPlanets = base.handler(() => {
  // TODO: replace with drizzle query as the app grows
  return [
    { id: 1, name: "Earth" },
    { id: 2, name: "Mars" },
  ];
});

export const findPlanet = base.input(z.object({ id: z.number() })).handler(({ input }) => {
  const planet = [
    { id: 1, name: "Earth" },
    { id: 2, name: "Mars" },
  ].find((p) => p.id === input.id);

  if (!planet) {
    throw new Error("NOT_FOUND");
  }

  return planet;
});

export const createPlanet = base
  .input(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
  )
  .handler(({ input }) => {
    return { id: 3, ...input };
  });
