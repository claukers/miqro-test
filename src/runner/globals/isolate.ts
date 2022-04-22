import {assertNotRunning, getGlobalTestOptions} from "../common";
import {SetIsolateFunction, TestOption} from "../types";

export const setIsolate: SetIsolateFunction = (isolate: boolean) => {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    isolate
  } as TestOption;
}
