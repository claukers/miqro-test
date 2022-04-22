import {it, after, before, describe, setIsolate, setTestTimeout} from "./globals";
import {Console} from "console";
import {Test, TestOption} from "./types";

let runningTests = false;

export function assertNotRunning() {
  if (runningTests) {
    throw new Error("test already started!");
  }
}

const tests: Test[] = [];

export function pushTest(test: Test): void {
  assertNotRunning();
  if (tests.filter(t => t.fullName === test.fullName).length > 0) {
    throw new Error("cannot redefine " + test.fullName);
  }
  tests.push(test);
}

export function resetGlobals(baseTestOptions: TestOption = {}): void {
  // @ts-ignore
  globalThis.it = it;
  // @ts-ignore
  globalThis.setIsolate = setIsolate;
  // @ts-ignore
  globalThis.setTestTimeout = setTestTimeout;
  // @ts-ignore
  globalThis.before = before;
  // @ts-ignore
  globalThis.after = after;
  // @ts-ignore
  globalThis.describe = describe;
  // @ts-ignore
  delete globalThis.testOptions;
  // @ts-ignore
  globalThis.testOptions = baseTestOptions;
}

export function getGlobalTestOptions(): TestOption {
  // @ts-ignore
  return globalThis.testOptions as TestOption;
}

export const DEFAULT_TIMEOUT = 2000;

export async function runTests(title?: string | string[], logger: {
  error: (...args: any[]) => void;
} | Console = new Console(process.stdout), exact = false, disableIsolate = false, disableLogging = false, isolateDefault = false): Promise<{
  passed: number;
  total: number;
  ignored: number;
  failed: {
    error: any;
    fullName: string;
  }[];
}> {
  const titles = title ? title instanceof Array ? title : [title] : [undefined];
  const ret: {
    passed: number;
    total: number;
    ignored: number;
    failed: {
      error: any;
      fullName: string;
    }[];
  } = {
    total: tests.length,
    ignored: 0,
    passed: 0,
    failed: []
  };
  runningTests = true;
  try {
    for (const test of tests) {
      for (const title of titles) {

        if ((!exact && (title && test.fullName.indexOf(title) !== -1 || !title)) || (exact && title && title === test.fullName)) {
          try {
            await test.run(disableIsolate, disableLogging, isolateDefault);
            ret.passed++;
          } catch (e) {
            logger.error("\x1b[31m%s\x1b[0m", e);
            ret.failed.push({
              error: e,
              fullName: test.fullName
            })
          }
          if (exact) {
            runningTests = false;
            return ret;
          }
        } else {
          ret.ignored++;
        }
      }
    }
  } catch (e) {
    runningTests = false;
    throw e;
  } finally {
    runningTests = false;
  }
  return ret;
}
