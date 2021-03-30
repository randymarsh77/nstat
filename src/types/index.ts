export interface ITSAPluginArgs {
	start: number;
	end: number;
	step: number;
}

export type TSAPluginResult = Promise<number[][]>;
