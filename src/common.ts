import {dirname, resolve} from "path";
import {lstatSync} from "fs";

export type Callback<T = any> = (...args: any[]) => T;

export interface FakeCallback<T = any> extends Callback<T> {
  callCount: number;
  callArgs: T[];
  returnValues: any[];
}

export function fake(cb: Callback): FakeCallback {
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
  return stackS.substring(stackS.indexOf("(") + 1, stackS.indexOf(":")).split(" ").reverse()[0];
}

export function requireMock(requirePath: string, mocks: {
  [path: string]: any
}) {
  const callerPath = getCallerFilePath();
  const resolvedRequirePath = resolve(dirname(callerPath), requirePath);
  delete require.cache[resolvedRequirePath];

  const newPath = lstatSync(resolvedRequirePath).isDirectory() ? resolvedRequirePath : dirname(resolvedRequirePath);

  const mocksPaths = Object.keys(mocks);
  const resolvedPaths = [];
  for (const path of mocksPaths) {
    const paths = (require.resolve.paths(resolvedRequirePath) as string[]).concat(newPath);
    const resolvedPath = require.resolve(path, {
      paths
    });
    require.cache[resolvedPath] = {
      id: resolvedPath,
      file: resolvedPath,
      loaded: true,
      exports: mocks[path]
    } as any;
    resolvedPaths.push(resolvedPath);
  }
  const mod = require(resolvedRequirePath);

  for (const path of resolvedPaths) {
    delete require.cache[path];
  }

  delete require.cache[resolvedRequirePath];

  return mod;
}
