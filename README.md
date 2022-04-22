# @miqro/test

```npm install @miqro/test --save-dev```

## test helper for RequestListener

```typescript
import {TestHelper} from "@miqro/test";
import {RequestListener} from "http";

const listener: RequestListener = (req, res) => {
  // server code
};

const response = await TestHelper({
  listener
}, {
  url: ...,
  method: ...,
  ...
})
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

## test runner

```npm install miqro --save-dev```

recursive run ```*.test.js``` files

```npx miqro test -r test/```

run test files

```npx miqro test test/*.test.js```

run test isolated into its own node process

```npx miqro test test/*.test.js -i```

run test named tests

```npx miqro test test/*.test.js -n "testname"```
