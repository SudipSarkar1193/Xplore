export function timeAgo(createdAt) {
	const now = new Date();
	const postDate = new Date(createdAt);

	let diffInSeconds = Math.floor((now - postDate) / 1000);

	// Prevent negative (future date)
	if (diffInSeconds < 0) diffInSeconds = 0;

	const minutesAgo = Math.floor(diffInSeconds / 60);
	const hoursAgo = Math.floor(minutesAgo / 60);
	const daysAgo = Math.floor(hoursAgo / 24);
	const weeksAgo = Math.floor(daysAgo / 7);
	const monthsAgo = Math.floor(daysAgo / 30);
	const yearsAgo = Math.floor(daysAgo / 365);

	if (diffInSeconds < 60) {
		return diffInSeconds === 1 ? "1 second ago" : `${diffInSeconds} seconds ago`;
	} else if (minutesAgo < 60) {
		return minutesAgo === 1 ? "1 minute ago" : `${minutesAgo} minutes ago`;
	} else if (hoursAgo < 24) {
		return hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;
	} else if (daysAgo < 7) {
		return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
	} else if (weeksAgo < 4) {
		return weeksAgo === 1 ? "1 week ago" : `${weeksAgo} weeks ago`;
	} else if (monthsAgo < 12) {
		return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
	} else {
		return yearsAgo === 1 ? "1 year ago" : `${yearsAgo} years ago`;
	}
}
