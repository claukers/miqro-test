import {assertNotRunning, getGlobalTestOptions} from "../common";
import {AfterFunction, TestFunction, TestOption} from "../types";

export const after: AfterFunction = (after: TestFunction) => {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    after
  } as TestOption;
}
