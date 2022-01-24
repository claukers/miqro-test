import { resolve } from "path";

export { fake, requireMock, FakeCallback } from "./common";
export * from "./http";

export const mainPath = (): string => resolve(__dirname, "cli.js");
