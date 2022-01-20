import { dirname, resolve } from "path";
import { lstatSync } from "fs";
import { getCallerFilePath } from "./common";

export function mockRequire(requirePath: string, mocks: {
	[path: string]: any
}) {
  const callerPath = getCallerFilePath();
  const resolvedRequirePath = resolve(dirname(callerPath), requirePath);
  delete require.cache[resolvedRequirePath];

  const newPath = lstatSync(resolvedRequirePath).isDirectory() ? resolvedRequirePath : dirname(resolvedRequirePath);

  const mocksPaths = Object.keys(mocks);
  const resolvedPaths = [];
  for(const path of mocksPaths) {
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

  for(const path of resolvedPaths) {
    delete require.cache[path];
  }

  delete require.cache[resolvedRequirePath];

  return mod;
};