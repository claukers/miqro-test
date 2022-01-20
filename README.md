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