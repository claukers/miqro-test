import { Console } from "console";
import { getCallerFilePath } from "../../common";
import { format } from "util";
import { resolve as pathResolve } from "path";
import { fork } from "child_process";
import { assertNotRunning, DEFAULT_TIMEOUT, getGlobalTestOptions, pushTest } from "../common";
import { ItFunction, TestFunction, TestOption } from "../types";

export const it: ItFunction = (title: string, testFunction: TestFunction, options?: TestOption, logger: {
  log: (...args: any[]) => void
} | Console = new Console(process.stdout)): void => {
  assertNotRunning();
  options = options ? { ...getGlobalTestOptions(), ...options } : { ...getGlobalTestOptions() };
  const category = options && options.category ? options.category : undefined;
  const fullName = `${category ? `${category} [` : ""}${title}${category ? "]" : ""}`;
  const testFilePath = getCallerFilePath();
  pushTest({
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
          const forkFilename = pathResolve(__dirname, "..", "..", "cli");
          const execArgv = [forkFilename, testFilePath, "-n", fullName, "--exact", "--disable-isolate", "--disable-logging"];
          const startMS = Date.now();
          const cp = fork("", {
            cwd: process.cwd(),
            execArgv,
            env: process.env,
            detached: false
          });
          cp.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
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
            await testFunction();
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
            //reject(new Error(format("%s failed\n%s finished with errors %o", fullName, fullName, e)));
            reject(e);
          });
        }

      } catch (e) {
        clearTimeout(timeout);
        reject(e);
        // reject(new Error(format("%s failed\n%s finished with errors %o", fullName, fullName, e)));
      }
    }), title,
    category,
    fullName
  });
}
