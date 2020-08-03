export class StrategyDataItem {
    public time: string;
    public indicators: Array<{
        key: string;
        name: string;
        options: number[];
        outputs: number[];
    }>;

    public constructor(data?: {
        time?: string;
        indicators?: Array<{
            key: string;
            name: string;
            options: number[];
            outputs: number[];
        }>;
    }) {
        Object.assign(this, data);
    }

    public indicator(key: string): number[] {
        return this.indicators.find((e) => e.key === key).outputs;
    }
}
