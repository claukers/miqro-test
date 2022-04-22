#!/usr/bin/env node

//@miqro/test

import {resolve} from "path";
import {lstatSync, readdirSync} from "fs";
import {runTestModules} from "./runner";

function getModulesRecursive(path: string[] | string, ret: string[] = []) {
  const paths = path instanceof Array ? path : [path];
  for (const path of paths) {
    const files = readdirSync(path);
    for (const file of files) {
      if (lstatSync(resolve(path, file)).isDirectory()) {
        getModulesRecursive(resolve(path, file), ret);
      } else {
        const split = file.split(".").reverse();
        if (split.length >= 3 && split[0] === "js" && split[1] === "test") {
          ret.push(resolve(path, file));
        }
      }
    }
  }
  return ret;
}

const extractFlags = (args: string[], options?: {
  flags: {
    [name: string]: {
      description?: string;
      hasValue?: boolean;
    }
  }
}): { flags: { [key: string]: string | (string | null)[] | null }; files: string[]; } => {
  const flags: { [key: string]: string | (string | null)[] | null } = {};
  const files: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.indexOf("-") === 0) {
      const argName = arg.substring(arg.indexOf("--") === 0 ? 2 : 1);
      const ignoreValue = options && options.flags && options.flags[argName] && options.flags[argName].hasValue === false ? true : false;
      const argValue = !ignoreValue && args.length > i + 1 && args[i + 1] && args[i + 1].indexOf("-") != 0 ? args[i + 1] : null;
      const flag = flags[argName];
      if (flag instanceof Array) {
        flag.push(argValue);
      } else if (flag) {
        flags[argName] = [flag, argValue];
      } else {
        flags[argName] = argValue;
      }
      if (argValue !== null) {
        i++;
      }
    } else {
      files.push(arg);
    }
  }
  return {flags, files};
}

const logger = console;

const main = async (): Promise<void> => {

  const startMS = Date.now();

  const args = extractFlags(process.argv.slice(2), {
    flags: {
      i: {
        description: "isolate default",
        hasValue: false
      },
      ["isolate-default"]: {
        description: "isolate default",
        hasValue: false
      },
      n: {
        description: "test name",
        hasValue: true
      },
      ["exact"]: {
        description: "use exact for test name matching",
        hasValue: false
      },
      ["disable-loging"]: {
        description: "disable logging",
        hasValue: false
      },
      ["disable-isolate"]: {
        description: "disable isolation",
        hasValue: false
      },
      r: {
        description: "recursive. cannot be used with files",
        hasValue: true
      }
    }
  });

  // console.dir(args);

  const recursive: string[] | false = args.flags.r !== undefined && args.flags.r !== null ? (args.flags.r instanceof Array ? args.flags.r : [args.flags.r]) as string[] : false;

  if (args.files.length === 0 && !recursive) {
    throw new Error(`bad arguments`);
  } else if (recursive && args.files.length > 0) {
    throw new Error(`cannot use recursive with files`);
  }

  const modules = recursive ? getModulesRecursive(recursive.map(r => resolve(process.cwd(), r))) : args.files.map(m => resolve(process.cwd(), m));

  const name = args.flags.n ? args.flags.n as string[] : "all";
  const exact = args.flags.exact !== undefined ? true : false;
  const isolateDefault = args.flags.i !== undefined || args.flags["isolate-default"] !== undefined ? true : false;
  const disableIsolate = args.flags["disable-isolate"] !== undefined ? true : false;
  const disableLogging = args.flags["disable-logging"] !== undefined ? true : false;

  // console.dir(args);
  // console.dir(process.argv);
  // console.log(disableIsolate + " disableIsolate");

  const ret = await runTestModules(modules, typeof name === "string" && name.toLowerCase() === "all" ? undefined : name, console, exact, disableIsolate, disableLogging, isolateDefault);

  const took = Date.now() - startMS;

  if (!disableLogging) {
    ret.failed.forEach(e => {
      logger.log("");
      logger.log("");
      logger.error("\x1b[31m%s\x1b[0m", e.fullName);
      logger.error(e.error);
      logger.log("");
      logger.log("");
    });


    logger.log("");
    logger.log("");
    logger.log(ret.passed + " tests passed");
    logger.log(ret.failed.length + " failed");
    logger.log("took " + took + "ms");
    logger.log("");
    logger.log("");
  }
  process.exit(ret.failed.length > 0 ? 1 : 0);

}

main().catch(e => {
  logger.error(e);
  process.exit(1);
});
