import timeseries from 'timeseries-analysis';
import timestring from 'timestring';
import { IPluggableCommand } from '@simple-cli/base';
import { ITSAPluginArgs, TSAPluginResult } from '../types';

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
	],
	validate: () => true,
	populateOptions: () => ({}),
};

interface ITSAOptions {
	since: string;
	until: string;
	step: string;
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
		const { since, until, step, plugin } = options;
		const untilMS =
			!until || until.toLowerCase() === 'now'
				? Date.now()
				: Date.now() - timestring(until, 'ms', {});
		const sinceMS = untilMS - ((!since && 3600000) || timestring(since, 'ms', {}));
		console.log(`${sinceMS} - ${untilMS}`);
		const resolvedStep = Math.max(30, (step && parseInt(step, 10)) || (untilMS - sinceMS) / 1000);

		const data = await plugin.execute(
			{ start: sinceMS, end: untilMS, step: resolvedStep },
			options
		);

		const t = new timeseries.main(data); // eslint-disable-line
		console.log(`Min: ${t.min()} Max: ${t.max()} Mean: ${t.mean()}`);

		return { code: 0 };
	},
};
