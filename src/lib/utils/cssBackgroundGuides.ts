// TODO: use css-var for color and change with dark mode
// FIXME: this results in an inline style containing position: relative; which breaks modals as it renders on top of them. Currently we are unsetting this again. But not surte why it happens. Definetely not an elegant fix currently.
export const cssBackgroundGuides = (
	duration: number,
	millis = 2000,
	{ lineWidth = 0.5, color = '#9993' }
) => {
	const divisions = duration / millis;
	const divisionsPercent = 100 / divisions;
	return `background-image: linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px, transparent calc(100% - ${lineWidth}px), ${color} calc(100% - ${lineWidth}px)); 
	background-size: ${divisionsPercent}% 100%;`;
};
