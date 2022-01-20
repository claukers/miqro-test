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
