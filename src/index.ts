import { resolve } from "path";

export * from "./common";
export * from "./runner";
export * from "./http";

export const mainPath = (): string => resolve(__dirname, "cli.js");
