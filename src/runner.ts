import {fork} from "child_process";
import {Console} from "console";
import {resolve as pathResolve} from "path";
import {format} from "util";
import {getCallerFilePath} from "./common.js";

let runningTests = false;

function assertNotRunning() {
  if (runningTests) {
    throw new Error("test already started!");
  }
}

export async function runTestModules(modules: string[], title?: string | string[], logger: {
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
  assertNotRunning();
  for (const path of modules) {
    resetGlobals();
    require(path);
  }
  runningTests = true;
  const ret = await runTests(title, logger, exact, disableIsolate, disableLogging, isolateDefault);
  runningTests = false;
  return ret;
}

type TestFunction = () => void | Promise<void>;
type TestFunctionWrapper = (disableIsolate: boolean, disableLogging: boolean, isolateDefault: boolean) => void | Promise<void>;

interface TestOption {
  category?: string;
  timeout?: number;
  before?: TestFunction;
  after?: TestFunction;
  isolate?: boolean;
}

const DEFAULT_TIMEOUT = 2000;

interface Test {
  run: TestFunctionWrapper;
  title: string;
  category?: string;
  fullName: string;
  testFilePath: string;
}

const tests: Test[] = [];

function resetGlobals(baseTestOptions: TestOption = {}): void {
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

function getGlobalTestOptions(): TestOption {
  // @ts-ignore
  return globalThis.testOptions as TestOption;
}

function before(before: TestFunction) {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    before
  } as TestOption;
}

function setIsolate(isolate: boolean) {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    isolate
  } as TestOption;
}

function setTestTimeout(timeout: number) {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    timeout
  } as TestOption;
}

function after(after: TestFunction) {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    after
  } as TestOption;
}

function describe(title: string, impl: () => void) {
  assertNotRunning();
  const current = {...getGlobalTestOptions()};
  // @ts-ignore
  globalThis.testOptions = {
    ...current,
    category: current.category ? current.category + " " + title : title
  } as TestOption;
  impl();
  resetGlobals(current);
}

function it(title: string, impl: TestFunction, options?: TestOption, logger: {
  log: (...args: any[]) => void
} | Console = new Console(process.stdout)): void {
  assertNotRunning();
  options = options ? {...getGlobalTestOptions(), ...options} : {...getGlobalTestOptions()};
  const category = options && options.category ? options.category : undefined;
  const fullName = `${category ? `${category} [` : ""}${title}${category ? "]" : ""}`;
  if (tests.filter(t => t.fullName === fullName).length > 0) {
    throw new Error("cannot redefine " + fullName);
  }
  const testFilePath = getCallerFilePath();
  tests.push({
    testFilePath,
    run: (disableIsolate: boolean, disableLogging: boolean, isolateDefault: boolean) => new Promise((resolve, reject) => {
      const timeoutMS = options && options.timeout ? options.timeout : DEFAULT_TIMEOUT;
      const timeout = setTimeout(() => {
        reject(new Error(format("%s failed\x1b[31m\n%s timeout %o\x1b", fullName, fullName, timeoutMS)));
      }, timeoutMS);
      try {
        const byDefault = isolateDefault && (!options || (options && options.isolate));
        if (!disableIsolate && ((options && options.isolate) || byDefault)) {
          // console.log("isolate mode");
          // isolate mode
          // fork -n title
          const forkFilename = pathResolve(__dirname, "cli");
          const execArgv = [forkFilename, testFilePath, "-n", fullName, "--exact", "--disable-isolate", "--disable-logging"];
          const startMS = Date.now();
          const cp = fork("", {
            cwd: process.cwd(),
            execArgv,
            env: process.env,
            detached: false
          });
          cp.on("close", (code) => {
            const took = Date.now() - startMS;
            if (code === null || code === 0) {
              clearTimeout(timeout);
              logger.log("\x1b[32mpassed %s (took %sms)\x1b[0m", fullName, took);
              resolve();
            } else {
              clearTimeout(timeout);
              reject(new Error(format("%s failed\n%s finished", fullName, fullName)));
            }
          });
        } else {
          // inline mode
          // console.log("inline mode");
          (async () => {
            if (options && options.before) {
              await options.before();
            }
            const startMS = Date.now();
            await impl();
            const took = Date.now() - startMS;
            if (options && options.after) {
              await options.after();
            }
            return took;
          })().then((took) => {
            clearTimeout(timeout);
            if (!disableLogging) {
              logger.log("\x1b[32m%s passed (took %sms)\x1b[0m", fullName, took);
            }
            resolve();
          }).catch(e => {
            clearTimeout(timeout);
            reject(new Error(format("%s failed\n%s finished with errors %o", fullName, fullName, e)));
          });
        }

      } catch (e) {
        clearTimeout(timeout);
        reject(new Error(format("%s failed\n%s finished with errors %o", fullName, fullName, e)));
      }
    }), title,
    category,
    fullName
  });
}

async function runTests(title?: string | string[], logger: {
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
          return ret;
        }
      } else {
        ret.ignored++;
      }
    }
  }
  return ret;
}

