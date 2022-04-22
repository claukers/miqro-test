const {strictEqual} = require("assert");
const {fake, describe, it, after} = require("../dist");

const beforeDescribe1 = fake(() => {
  console.log("before describe1");
});

const afterDescribe1 = fake(() => {
  console.log("after describe1");
});

const beforeDescribe2 = fake(() => {
  console.log("before describe2");
});

const afterDescribe2 = fake(() => {
  console.log("after describe2");
});

const beforeDescribe3 = fake(() => {
  console.log("before describe3");
});

const afterDescribe3 = fake(() => {
  console.log("after describe3");
});

before(beforeDescribe2);

after(afterDescribe2);

describe("describe1", () => {



  before(beforeDescribe1);

  after(afterDescribe1);

  it("title1", async () => {

    strictEqual(beforeDescribe1.callCount, 1);
    strictEqual(afterDescribe1.callCount, 0);

    strictEqual(beforeDescribe2.callCount, 0);
    strictEqual(afterDescribe2.callCount, 0);

    strictEqual(beforeDescribe3.callCount, 0);
    strictEqual(afterDescribe3.callCount, 0);
  });

  describe("describe1 child", () => {

    before(beforeDescribe3);

    after(afterDescribe3);

    it("title5", async () => {
      strictEqual(beforeDescribe1.callCount, 1);
      strictEqual(afterDescribe1.callCount, 1);

      strictEqual(beforeDescribe2.callCount, 0);
      strictEqual(afterDescribe2.callCount, 0);

      strictEqual(beforeDescribe3.callCount, 1);
      strictEqual(afterDescribe3.callCount, 0);
    });
    it("title6", async () => {
      strictEqual(beforeDescribe1.callCount, 1);
      strictEqual(afterDescribe1.callCount, 1);

      strictEqual(beforeDescribe2.callCount, 0);
      strictEqual(afterDescribe2.callCount, 0);

      strictEqual(beforeDescribe3.callCount, 2);
      strictEqual(afterDescribe3.callCount, 1);
    });
  });

  it("title2", async () => {
    strictEqual(beforeDescribe1.callCount, 2);
    strictEqual(afterDescribe1.callCount, 1);

    strictEqual(beforeDescribe2.callCount, 0);
    strictEqual(afterDescribe2.callCount, 0);

    strictEqual(beforeDescribe3.callCount, 2);
    strictEqual(afterDescribe3.callCount, 2);
  });

});

describe("describe2", () => {

  it("title3", async () => {
    strictEqual(beforeDescribe1.callCount, 2);
    strictEqual(afterDescribe1.callCount, 2);

    strictEqual(beforeDescribe2.callCount, 1);
    strictEqual(afterDescribe2.callCount, 0);

    strictEqual(beforeDescribe3.callCount, 2);
    strictEqual(afterDescribe3.callCount, 2);
  });
  it("title4", async () => {
    strictEqual(beforeDescribe1.callCount, 2);
    strictEqual(afterDescribe1.callCount, 2);

    strictEqual(beforeDescribe2.callCount, 2);
    strictEqual(afterDescribe2.callCount, 1);

    strictEqual(beforeDescribe3.callCount, 2);
    strictEqual(afterDescribe3.callCount, 2);
  });
});
