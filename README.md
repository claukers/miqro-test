# @miqro/test

```npm install @miqro/test --save-dev```

## require mock

### example

```lib.js```

```typescript
module.exports.libFN = () => {
  console.log("real function");
}
```

```file.js```

```typescript
import {libFN} from "./lib";

module.exports.someFunction = function someFunction() {
  libFN();
}
```

```file.test.js```

```typescript
import {requireMock} from "@miqro/test";

const mockedFile = requireMock("./file.js", {
  "./lib": {
    libFN: () => {
      console.log("fake function")
    }
  }
});

mockedFile.someFunction(); // prints "fake function"

const notMockedFile = require("./file.js");

notMockedFile.someFunction(); // prints "real function"
```

## clearRequireCache

```typescript
import {clearRequireCache} from "@miqro/test";
import {resolve} from "path";

clearRequireCache(resolve(__dirname, "src/"));
```

## fake function

```typescript
import {fake} from "@miqro/test";

const cb = fake(() => {
  return 1;
})

strictEqual(cb(), 1);
strictEqual(cb.callCount, 1);
strictEqual(cb.callArgs[0].length, 0);
strictEqual(cb.returnValues[0], 1);

// cb.reset(); // resets callCount, callArgs and returnValues
```

## test runner

```npm install @miqro/test --save-dev```

```example.test.js```

```typescript
import {strictEqual} from "assert";

describe("some category", () => {
  describe("some other category", () => {
    before(async () => {

    });
    after(() => {

    });
    setTestTimeout(10000);
    setIsolate(true); // this will run "some test" in it's own node process
    it("some test", async () => {
        strictEqual(true, false, "todo empty test");
    });
  });
  it("some other test", async () => {

  });
})
```

recursive run ```*.test.js``` files

```npx miqro-test test -r test/```

run test files

```npx miqro-test test/*.test.js```

run test isolated into its own node process

```npx miqro-test test/*.test.js -i```

run test named tests

```npx miqro-test test/*.test.js -n "testname"```
