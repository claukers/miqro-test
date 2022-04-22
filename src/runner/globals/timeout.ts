import {assertNotRunning, getGlobalTestOptions} from "../common";
import {SetTestTimeoutFunction, TestOption} from "../types";

export const setTestTimeout: SetTestTimeoutFunction = (timeout: number) => {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    timeout
  } as TestOption;
}
