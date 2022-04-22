import {Console} from "console";

export type TestFunction = () => void | Promise<void>;
export type TestFunctionWrapper = (disableIsolate: boolean, disableLogging: boolean, isolateDefault: boolean) => void | Promise<void>;

export type BeforeFunction = (before: TestFunction) => void;


export type SetIsolateFunction = (isolate: boolean) => void;


export type SetTestTimeoutFunction = (timeout: number) => void;


export type AfterFunction = (after: TestFunction) => void;


export type DescribeFunction = (title: string, impl: () => void) => void;

export type ItFunction = (title: string, impl: TestFunction, options?: TestOption, logger?: {
  log: (...args: any[]) => void
} | Console) => void;

export interface TestOption {
  category?: string;
  timeout?: number;
  before?: TestFunction;
  after?: TestFunction;
  isolate?: boolean;
}

export interface Test {
  run: TestFunctionWrapper;
  title: string;
  category?: string;
  fullName: string;
  testFilePath: string;
}
