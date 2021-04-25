export interface ITSAPluginArgs {
	start: number;
	end: number;
	step: number;
}

export type TimeSeriesData = number[][];

export interface ILabeledTimeSeriesData {
	[label: string]: TimeSeriesData;
}

export interface ITSAPluginResult {
	// Future: Space for metadata
	data: ILabeledTimeSeriesData;
}

export type TSAPluginResult = Promise<ITSAPluginResult | TimeSeriesData>;
