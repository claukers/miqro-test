const { TestHelper, it } = require("../dist");
const { strictEqual } = require("assert");

it("empty test", async () => {
   console.log(process.pid);
   const response = await TestHelper((req, res)=>{
    try {
      console.dir(req.url);
      strictEqual(req.url, "/hello");
      strictEqual(req.method, "POST");
      res.statusCode = 200;
      res.end(String("world!"));
    } catch(e) {
      console.error(e);
    }
   }, {
    url: "/hello",
    method: "post"
   });
   strictEqual(response.data, "world!");
});

it("empty test2", async () => {
  console.log(process.pid); 
});
