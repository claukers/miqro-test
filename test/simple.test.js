const { requireMock, fake } = require("../dist");
const { strictEqual } = require("assert");



it("mock module test", async () => {
  console.log(process.pid); 
  const mock = fake(()=>{
    console.log("mock!");
  });

  const mock2 = fake(()=>{
    console.log("mock2!");
  });

  requireMock("./mock-test1.js", {
    "./lib": {
      mock
    },
    "./mockdir": {
      mock2
    }
  });

  strictEqual(mock.callCount, 1);
  strictEqual(mock2.callCount, 1);

  require("./mock-test1");

  strictEqual(mock.callCount, 1);
  strictEqual(mock2.callCount, 1);
  
  requireMock("./mock-test1.js", {
    "./lib": {
      mock
    }
  });

  strictEqual(mock.callCount, 2);
  strictEqual(mock2.callCount, 1);
});
