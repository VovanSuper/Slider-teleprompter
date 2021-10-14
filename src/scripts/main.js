import fromStore from './store/store.js';
import { renderClips } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import dispatchKeyDown from './helpers/keydown-dispatch.js';
import { handleRecodingStatus, handleDownloadClick } from './helpers/utils.js';
import { optToSliderButtons, dispatchCurrentSlideIndex } from './helpers/slides.js';

import './wavesurfer/wavesurfer.js';
import './wavesurfer/plugin/wavesurfer.markers.slides.js';

const rootEl = document.getElementById('root');

export default function () {
	dispatchKeyDown();
	dispatchCurrentSlideIndex();
	optToSliderButtons();
	handleRecording();
	handleDownloadClick();
	handleRecodingStatus();

	fromStore.subscribe(({ clips }) => {
		renderClips({ clips }, rootEl);
	});
}
