import { CronJob } from "cron";
import { EventEmitter } from "events";
import moment from "moment";
import "moment-round";

export class Timer extends EventEmitter {
    public period: number; // в минутах
    private cronJob: CronJob;

    public constructor(data?: { period?: number }) {
        super();
        Object.assign(this, data);
    }

    public start() {
        const { period } = this;
        const nextTime = moment.utc().ceil(period, "minutes"); // FIXME переделать в минуты и часы
        this._emitTime(nextTime.toISOString());
        this.cronJob = new CronJob(
            nextTime,
            async () => {
                this.start();
            },
            null,
            true
        );
    }

    public stop() {
        this.cronJob.stop();
    }

    public onTime(listner: (time: string) => void) {
        this.on("time", listner);
    }

    public offTime(listner: (time: string) => void) {
        this.off("time", listner);
    }

    private _emitTime(time: string) {
        this.emit("time", time);
    }
}
