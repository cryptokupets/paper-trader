require("mocha");
const moment = require("moment");
require("moment-round");
const { assert } = require("chai");
const { Hitbtc } = require("../lib/Hitbtc");

describe.skip("Hitbtc", () => {
    it("test", function (done) {
        this.timeout(3000);
        const period = 1;
        const limit = 3;
        const endMoment = moment.utc().floor(period, "minutes");
        const options = {
            currency: "USD",
            asset: "BTC",
            period,
            end: endMoment.toISOString(),
            limit,
        };
        console.log(options);
        Hitbtc.getCandles(options).then((candles) => {
            console.log(candles);
            assert.equal(candles.length, limit);
            done();
        });
    });
});
