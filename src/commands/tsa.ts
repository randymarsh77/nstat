import timeseries from 'timeseries-analysis';
import timestring from 'timestring';
import { IPluggableCommand } from '@simple-cli/base';
import { ITSAPluginArgs, TSAPluginResult, ITSAPluginResult } from '../types';

const rangeOptions = {
	options: [
		{
			name: 'since',
			type: String,
			description: 'Time to start computing stats. Can be relative from --until or absolute.',
		},
		{
			name: 'until',
			type: String,
			description:
				'Time to stop computing stats. Can be "now" (default), relative to now, or absolute',
		},
		{
			name: 'step',
			type: String,
			description:
				'Interval between each data point. Defaults to the larger of 1000 points total, or 30',
		},
		{
			name: 'aggregate',
			type: Boolean,
			description: 'When processing multiple series, process them all as one series.',
		},
	],
	validate: () => true,
	populateOptions: () => ({}),
};

interface ITSAOptions {
	since: string;
	until: string;
	step: string;
	aggregate: boolean;
}

const name = 'null';
const summary = 'Runs a time-series analysis.';

export const tsa: IPluggableCommand<ITSAOptions, ITSAPluginArgs, TSAPluginResult> = {
	name,
	summary,
	definitions: [...rangeOptions.options],
	usage: [
		{
			header: `tsa`,
			content: summary,
		},
		{
			header: 'Synopsis',
			content: `$ tsa <options>`,
		},
	],
	populateOptions: () => ({
		...rangeOptions.populateOptions(),
	}),
	validate: () => rangeOptions.validate(),
	execute: async ({ options }) => {
		const { since, until, step, plugin, aggregate } = options;
		const untilMS =
			!until || until.toLowerCase() === 'now'
				? Date.now()
				: Date.now() - timestring(until, 'ms', {});
		const sinceMS = untilMS - ((!since && 3600000) || timestring(since, 'ms', {}));
		const resolvedStep = Math.max(30, (step && parseInt(step, 10)) || (untilMS - sinceMS) / 1000);

		const result = await plugin.execute(
			{ start: sinceMS, end: untilMS, step: resolvedStep },
			options
		);

		if (Array.isArray(result)) {
			const t = new timeseries.main(result);
			console.log(`Min: ${t.min()} Max: ${t.max()} Mean: ${t.mean()}`);
		} else if (aggregate) {
			const { data } = result as ITSAPluginResult;
			const series = Object.keys(data).flatMap((k) => data[k]);
			const t = new timeseries.main(series);
			console.log(`Min: ${t.min()} Max: ${t.max()} Mean: ${t.mean()}`);
		} else {
			const { data } = result as ITSAPluginResult;
			const processed = Object.keys(data).map((label) => {
				const series = new timeseries.main(data[label]);
				const min = series.min() as number;
				const max = series.max() as number;
				const mean = series.mean() as number;
				return {
					label,
					series,
					min,
					max,
					mean,
				};
			});

			processed.sort((a, b) => a.mean - b.mean);

			processed.forEach(({ label, min, max, mean }) => {
				console.log(`${label}: Min: ${min} Max: ${max} Mean: ${mean}`);
			});
		}

		return { code: 0 };
	},
};
