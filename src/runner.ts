import { fork } from "child_process";
import { Console } from "console";
import { resolve as pathResolve } from "path";
import { format } from "util";
import { TestHelper } from "./http";
import { getCallerFilePath, requireMock, fake } from "./common";

export type TestFunction = () => void | Promise<void>;
type TestFunctionWrapper = (disableIsolate: boolean, disableLogging: boolean, isolateDefault: boolean) => void | Promise<void>;

const DEFAULT_TIMEOUT = 2000;

interface Test { run: TestFunctionWrapper; title: string; category?: string; fullName: string; testFilePath: string; }

const tests: Test[] = [];

export function getTestCount() { return tests.length };

export function it(title: string, impl: TestFunction, options?: {
  category?: string;
  timeout?: number;
  before?: TestFunction;
  after?: TestFunction;
  isolate?: boolean;
  mockRequire?: {
    [path: string]: any
  }
}, logger: {
  log: (...args: any[]) => void
} | Console = new Console(process.stdout)): void {
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
};

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
  for (const test of tests) {
    for (const title of titles) {

      if ((!exact && (title && test.fullName.indexOf(title) !== -1 || !title)) || (exact && title && title === test.fullName)) {
        try {
          /*console.log("**");
          console.log(disableIsolate);
          console.log(exact);
          console.log(test.testFilePath);
          console.log(test.fullName);*/
          await test.run(disableIsolate, disableLogging, isolateDefault);
          ret.passed++;
        } catch (e) {
          logger.error("\x1b[31m%s\x1b[0m", e);
          ret.failed.push({
            error: e,
            fullName: test.fullName
          })
        }
        //console.log("**");
        if (exact) {
          return ret;
        }
      } else {
        ret.ignored++;
      }
    }
  }
  return ret;
};

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
  for (const path of modules) {
    (global as any).it = it;
    (global as any).requireMock = requireMock;
    (global as any).fake = fake;
    (global as any).TestHelper = TestHelper;
    require(path);
  }
  return await runTests(title, logger, exact, disableIsolate, disableLogging, isolateDefault);
}

