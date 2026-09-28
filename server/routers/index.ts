import { createPlanet, findPlanet, listPlanets } from "#server/routers/planet.ts";
import { me } from "./users";

export { authed, base } from "./base";

export const appRouter = {
  planet: {
    list: listPlanets,
    find: findPlanet,
    create: createPlanet,
  },
  users: {
    me,
  },
};

export type AppRouter = typeof appRouter;
