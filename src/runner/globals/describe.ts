import {assertNotRunning, getGlobalTestOptions, resetGlobals} from "../common";
import {DescribeFunction, TestOption} from "../types";

export const describe: DescribeFunction = (title: string, impl: () => void) => {
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
