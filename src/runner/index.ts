import {Console} from "console";
import {assertNotRunning, resetGlobals, runTests} from "./common";

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
  return runTests(title, logger, exact, disableIsolate, disableLogging, isolateDefault);
}


