require("mocha");
const moment = require("moment");
const { assert } = require("chai");
const { Timer } = require("../lib/Timer");

describe.skip("Timer", () => {
    it.skip("должен срабатывать каждые три минуты", function (done) {
        this.timeout(1800000);
        const options = {
            period: 3,
        };

        const timer = new Timer(options);
        timer.onTime((time) => {
            console.log(moment.utc().toISOString());
            console.log(time);
        });
        timer.start();

        setTimeout(() => {
            timer.stop();
            done();
        }, 1700000);
    });

    it("стоп таймера", function (done) {
        this.timeout(2000);
        const options = {
            period: 1,
        };

        const timer = new Timer(options);
        timer.start();

        setTimeout(() => {
            timer.stop();
            done();
        }, 1000);
    });
});
