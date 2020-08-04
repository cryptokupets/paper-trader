import { EventEmitter } from "events";
import moment from "moment";
import { Advisor } from "./Advisor";
import { AdvisorDataItem } from "./AdvisorDataItem";
import { Hitbtc } from "./Hitbtc";

export class PaperTrader extends EventEmitter {
    public currencyAvailable: number;
    public assetAvailable: number;
    public currencyReserved: number;
    public assetReserved: number;
    public exchange: string;
    public currency: string;
    public asset: string;
    public period: number;
    public indicatorInputs: Array<{
        key: string;
        name: string;
        options: number[];
    }>;
    public warmup: number;
    public strategy: (data: AdvisorDataItem[]) => string;
    public side?: string;

    private advisor: Advisor;

    public constructor(data?: {
        currencyAvailable?: number;
        assetAvailable?: number;
        exchange?: string;
        currency?: string;
        asset?: string;
        period?: number;
        indicatorInputs?: Array<{
            key: string;
            name: string;
            options: number[];
        }>;
        warmup?: number;
        strategy?: (data: AdvisorDataItem[]) => string;
    }) {
        super();
        Object.assign(this, data);
    }

    public start() {
        const startMoment = moment.utc();
        const {
            exchange,
            currency,
            asset,
            period,
            indicatorInputs,
            warmup,
            strategy,
        } = this;
        const advisor = new Advisor({
            exchange,
            currency,
            asset,
            period,
            indicatorInputs,
            warmup,
            strategy,
        });
        this.advisor = advisor;
        advisor.onAdvice((data) => {
            const { side } = data;
            this.side = side;
            const { currencyAvailable, assetAvailable } = this;
            if (side === "buy" && currencyAvailable > 0) {
                this.buy();
            } else if (side === "sell" && assetAvailable > 0) {
                this.sell();
            }
        });
        advisor.start();
    }

    public async stop() {
        await this.advisor.stop();
        this.advisor = undefined;
    }

    public onTrade(
        listner: (trade: {
            time: string;
            side: string;
            price: number;
            quantity: number;
            amount: number;
        }) => void
    ) {
        this.on("trade", listner);
    }

    public offTrade(listner: (...args: any[]) => void) {
        this.off("trade", listner);
    }

    private async getPrice(): Promise<number> {
        const { ask, bid } = await Hitbtc.getTicker(this);
        return (ask + bid) / 2;
    }

    private async buy() {
        const price = await this.getPrice();
        await this.createOrder({
            side: "buy",
            price,
            quantity: this.currencyAvailable / price,
        });
    }

    private async sell() {
        const price = await this.getPrice();
        await this.createOrder({
            side: "sell",
            price,
            quantity: this.assetAvailable,
        });
    }

    private async createOrder({
        side,
        price,
        quantity,
    }: {
        side: string;
        price: number;
        quantity: number;
    }): Promise<string> {
        const amount = price * quantity; // TODO заменить на более точное вычисление
        const { currencyAvailable, assetAvailable } = this;

        switch (side) {
            case "buy":
                if (amount > currencyAvailable) {
                    return Promise.reject();
                }
                this.currencyAvailable -= amount;
                this.currencyReserved += amount;
                break;
            case "sell":
                if (quantity > assetAvailable) {
                    return Promise.reject();
                }
                this.assetAvailable -= quantity;
                this.assetReserved += quantity;
                break;
            default:
                return Promise.reject();
        }

        setTimeout(() => {
            const time = moment.utc().toISOString();
            if (side === "buy") {
                this.currencyReserved -= amount;
                this.assetAvailable += quantity;
            } else {
                this.assetReserved -= quantity;
                this.currencyAvailable += amount;
            }

            this._emitTrade({
                time,
                side,
                price,
                quantity,
                amount,
            });
        }, 0);
    }

    private _emitTrade(trade: any) {
        this.emit("trade", trade);
    }
}
