import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// 21:00 UTC = полночь по игровому времени (МСК): день закрывается всегда,
// неделя и месяц — когда сменился их ключ.
crons.daily(
	'close leaderboards',
	{ hourUTC: 21, minuteUTC: 0 },
	internal.leaderboard.closePeriods,
	{}
);

crons.daily('pay salaries', { hourUTC: 21, minuteUTC: 5 }, internal.office.paySalaries, {});

export default crons;
