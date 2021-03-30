#!/usr/bin/env node

import { runCLI } from '@simple-cli/base';
import { commands } from './commands';

runCLI({
	name: 'tsa',
	version: '1.0.0',
	summary: 'Hey-oh',
	commands,
});
