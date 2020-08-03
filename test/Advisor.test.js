require("mocha");
const { assert } = require("chai");
const { Advisor } = require("../lib/Advisor");

describe.skip("Advisor", () => {
    it("test", function (done) {
        this.timeout(600000);
        const service = new Advisor({
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
            period: 1,
            indicatorInputs: [
                {
                    key: "max",
                    name: "max",
                    options: [2],
                },
                // {
                //     key: "min",
                //     name: "min",
                //     options: [3],
                // },
            ],
            warmup: 1,
            strategy: (data) => {
                // console.log(data, data[0].indicators);
                return "buy";
                // const max0 = data[0].indicator("max")[0];
                // const max1 = data[1].indicator("max")[0];
                // return max1 > max0 ? 1 : -1;
            },
        });
        service.onAdvice((advice) => {
            console.log(advice);
        });
        service.start();

        // setTimeout(() => {
        //     service.stop().then(() => {
        //         done();
        //     });
        // }, 4000);
    });
});
