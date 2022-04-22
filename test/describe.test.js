const { strictEqual } = require("assert");

before(()=>{
  console.log("before describe2");
});

after(()=>{
  console.log("after describe2");
});

describe("describe1", () => {

  before(()=>{
    console.log("before describe1");
  });

  after(()=>{
    console.log("after describe1");
  });

  it("title1", async ()=>{

  });

  describe("describe1 child", () => {

    before(()=>{
      console.log("before describe3");
    });

    after(()=>{
      console.log("after describe3");
    });

    it("title5", async ()=>{

    });
    it("title6", async ()=>{

    });
  });

  it("title2", async ()=>{

  });

});

describe("describe2", () => {

  it("title3", async ()=>{

  });
  it("title4", async ()=>{

  });
});
