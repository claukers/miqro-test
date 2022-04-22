import {
  AfterFunction,
  BeforeFunction,
  DescribeFunction,
  ItFunction,
  SetIsolateFunction,
  SetTestTimeoutFunction
} from "./runner/types";

export {fake, requireMock, FakeCallback, clearRequireCache} from "./common.js";
export {TestHelper} from "./http.js";

function getGlobal<T>(name: string): T {
  const global = (globalThis as any)[name];
  if (global === undefined) {
    throw new Error(`${name} not defined`);
  }
  return global as T;
}

export const it: ItFunction = getGlobal<ItFunction>("it");
export const describe: DescribeFunction = getGlobal<DescribeFunction>("describe");
export const before: BeforeFunction = getGlobal<BeforeFunction>("before");
export const after: AfterFunction = getGlobal<AfterFunction>("after");
export const setTestTimeout: SetTestTimeoutFunction = getGlobal<SetTestTimeoutFunction>("setTestTimeout");
export const setIsolate: SetIsolateFunction = getGlobal<SetIsolateFunction>("setIsolate");
