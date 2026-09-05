import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.daily(
	'close daily leaderboard',
	{ hourUTC: 21, minuteUTC: 0 },
	internal.leaderboard.close,
	{}
);

export default crons;
