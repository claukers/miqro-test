# @miqro/test

## test helper for RequestListener

```typescript
import { TestHelper } from "@miqro/test";
import { RequestListener } from "http";

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

## mock require


**lib.js**

```typescript
module.exports.mock = () => {
	console.log("real function");
}
```

**file.js**

```typescript
import { mock } from "./lib";

mock();
```

```typescript
import { mockRequire } from "@miqro/test";

mockRequire("./file.js", {
	"./lib": {
		mock: () => {
			console.log("fake function")
		}
	}
})
```


## fake

```typescript
import { fake } from "@miqro/test";

const cb = fake(()=>{
	return 1;
})

strictEqual(cb(), 1);
strictEqual(cb.callCount, 1);
strictEqual(cb.callArgs[0].length, 0);
strictEqual(cb.returnValues[0], 1);

```