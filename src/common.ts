import {dirname, resolve} from "path";
import {lstatSync} from "fs";

export type Callback<T = any> = (...args: any[]) => T;

export interface FakeCallback<T = any> extends Callback<T> {
  callCount: number;
  callArgs: T[];
  returnValues: any[];
  throws: any[];
  reset: () => void;
}

export function fake(cb: Callback): FakeCallback {
  const ret: FakeCallback = (...args: any[]) => {
    ret.callArgs.push(args);
    ret.callCount++;
    try {
      const r = cb(...args);
      ret.returnValues.push(r);
      ret.throws.push(undefined);
      return r;
    } catch (e) {
      ret.returnValues.push(undefined);
      ret.throws.push(e);
      throw e;
    }
  };
  ret.callCount = 0;
  ret.returnValues = [];
  ret.throws = [];
  ret.callArgs = [] as any;
  ret.reset = () => {
    ret.callArgs = [];
    ret.throws = [];
    ret.returnValues = [];
    ret.callCount = 0;
  };
  return ret;
}

export function getCallerFilePath(): string {
  const err = new Error("");
  const stack = err.stack as string;
  const stackS = stack.split("\n")[3];
  return stackS.substring(stackS.indexOf("(") + 1, stackS.indexOf(":")).split(" ").reverse()[0];
}

export function clearRequireCache(path: string): void {
  const cacheKeys = Object.keys(require.cache);
  for (const cacheKey of cacheKeys) {
    if (cacheKey.indexOf(path) === 0) {
      delete require.cache[cacheKey];
    }
  }
}

export function requireMock(requirePath: string, mocks: {
  [path: string]: any
}, cacheWipePath?: string, clearMocks = true) {
  const callerPath = getCallerFilePath();
  if (cacheWipePath !== undefined) {
    clearRequireCache(resolve(dirname(callerPath), cacheWipePath));
  }
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
  if (clearMocks !== undefined && clearMocks === true) {
    for (const path of resolvedPaths) {
      delete require.cache[path];
    }

    delete require.cache[resolvedRequirePath];
  }
  return mod;
}
