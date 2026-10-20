import { physicsAdditions } from "./physics.ts";
import { mathAdditions } from "./mathematics.ts";
import { cosmosAdditions } from "./cosmos.ts";
import { engineeringAdditions } from "./engineering.ts";
export const additions = [
  ...physicsAdditions,
  ...mathAdditions,
  ...cosmosAdditions,
  ...engineeringAdditions,
];
export const additionById = (id: string) =>
  additions.find((x) => x.model.id === id);
