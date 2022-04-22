import {assertNotRunning, getGlobalTestOptions} from "../common";
import {BeforeFunction, TestFunction, TestOption} from "../types";

export const before: BeforeFunction = (before: TestFunction) => {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    before
  } as TestOption;
}
