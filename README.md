# @miqro/test

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
