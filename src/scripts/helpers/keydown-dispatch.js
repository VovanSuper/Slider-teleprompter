export default function () {
	document.addEventListener('keydown', function KeyDownHandler(e) {
		let keysEvent = new CustomEvent('keysEvent', {
			detail: {
				originalEvent: e,
			},
		});
		window.dispatchEvent(keysEvent);
		return () => document.removeEventListener('keydown', KeyDownHandler);
	});
}
