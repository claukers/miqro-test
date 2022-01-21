import { resolve } from "path";

export { fake, requireMock, FakeCallback } from "./common";
export { it, TestFunction } from "./runner";
export * from "./http";

export const mainPath = (): string => resolve(__dirname, "cli.js");
