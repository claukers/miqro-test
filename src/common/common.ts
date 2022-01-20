export type Callback<T = any> = (...args: any[]) => T;

export interface FakeCallback<T = any> extends Callback<T> {
  callCount: number;
  callArgs: T[];
  returnValues: any[];
}

export const fake = (cb: Callback): FakeCallback => {
  const ret: FakeCallback = (...args: any[]) => {
    ret.callCount++;
    ret.callArgs.push(args);
    const r = cb(...args);
    ret.returnValues.push(r);
    return r;
  };
  ret.callCount = 0;
  ret.returnValues = [];
  ret.callArgs = [] as any;
  return ret;
}

export function getCallerFilePath(): string {
  const err = new Error("");
  const stack = err.stack as string;
  const stackS = stack.split("\n")[3];
  const testFilePath = stackS.substring(stackS.indexOf("(") + 1, stackS.indexOf(":")).split(" ").reverse()[0];
  return testFilePath;
}