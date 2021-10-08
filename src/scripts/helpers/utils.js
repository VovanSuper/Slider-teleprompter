import fromStore from '../store/store.js';
import { setTimer, updateClipTimePoint } from '../store/actions.js';

const MARP_BESPOKE_KEY_FROM_HISTORY = window.history?.state?.marpBespokeSyncKey;
const currentSlideLSSubKey = !!MARP_BESPOKE_KEY_FROM_HISTORY ? `bespoke-marp-sync-${MARP_BESPOKE_KEY_FROM_HISTORY}` : 'bespoke-marp-sync-';

const getBespokeLSKey = () => {
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith(currentSlideLSSubKey)) {
			return key;
		}
	}
};

const readLocalStorageBespokeData = () => JSON.parse(localStorage.getItem(getBespokeLSKey()));

export const readBespokeCurrentSlideIndex = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const data = readLocalStorageBespokeData();
			const id = !!data && !!data['index'] ? parseInt(data['index']) + 1 : 1;
			// const id = parseInt(getCurrentBespokeIndex()) + 1 || 1;
			// console.log({ id });
			return resolve({ id });
		}, 1);
	});
};

export const getStatusBoxEl = () => document.querySelector('#status_box');

class SimpleTimer {
	startTime = undefined;

	constructor() {
		this.#_start();
	}

	#_start() {
		this.startTime = new Date().getTime();
	}

	getDiffMs() {
		return new Date().getTime() - this.startTime;
	}
}

const createTimer = () => new SimpleTimer();

export const timeFuncs = {
	setStoreTimer: isNewUp => fromStore.dispatch(setTimer({ timer: isNewUp ? createTimer() : null })),
	getElapsedTime: () => fromStore.getStateSnapshot().timer?.getDiffMs() || null,
};

export const playBtnToggleIcon = /** @param {HTMLButtonElement} wavePlayBtn */ wavePlayBtn => {
	wavePlayBtn.classList.toggle('btn-wave--pause');
	wavePlayBtn.classList.toggle('btn-wave--play');
};

export const playBtnSetInitial = wavePlayBtn => {
	wavePlayBtn.classList.remove('btn-wave--pause');
	wavePlayBtn.classList.add('btn-wave--play');
}

/**@param {HTMLElement} el  @param {HTMLElement} rootEl @param {number} clipDuration @param {number} clipId  */
export const addDragHandler = (el, rootEl, clipDuration, clipId) => {
	let isDown = false;
	let offset = 0;
	let elLeft = 0;
	let newTime = undefined;

	el.addEventListener('mousedown', OnMouseDown, true);
	document.addEventListener('mouseup', OnMouseUp, true);
	document.addEventListener('mousemove', OnMouseMove, true);
	el.ondrag = () => false;

	const slideId = +el.getAttribute('data-marker-id');

	/**@param {MouseEvent} e */ function OnMouseDown(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		const { x } = e;
		isDown = true;
		offset = el.offsetLeft - x;
	}

	/**@param {MouseEvent} e */ function OnMouseUp(e) {
		if (!!!newTime) return;
		e.preventDefault();
		e.stopImmediatePropagation();

		isDown = false;
		newTime = newTime <= 0 ? 10 : newTime;
		{
			// Remove handlers, as the page to be re-rendered at dispatch ...
			el.removeEventListener('mousedown', OnMouseDown, true);
			document.removeEventListener('mouseup', OnMouseUp, true);
			document.removeEventListener('mousemove', OnMouseMove, true);
		}
		return setTimeout(() => fromStore.dispatch(updateClipTimePoint({ clipId, slideId, time: newTime })), 10);
	}

	/**@param {MouseEvent}e */ function OnMouseMove(e) {
		const { x } = e;
		e.preventDefault();
		if (!isDown) return;

		const { width: rootElWidth, right: rootElRight, left: rootElLeft } = rootEl.getBoundingClientRect();
		const { left: elCalcLeft, width: elWidth } = el.getBoundingClientRect();
		const elOffset = x + offset;

		const markerWidth = el.getBoundingClientRect().width;

		const durationPerPx = clipDuration / rootElWidth;

		const elRootLeftDiff = elCalcLeft - rootElLeft;
		if (elRootLeftDiff <= 0 && elLeft > elOffset) return;
		el.style.left = elOffset + 'px';
		elLeft = elOffset;
		newTime = Math.round(elOffset * durationPerPx * 1000);
	}
};

/** @param {File} file */
export const handleAudioData = async file => {
	let audioCtx = new AudioContext();
	const audioData = await file.arrayBuffer();
	const audioBuf = await audioCtx.decodeAudioData(audioData);
	const { sampleRate, duration, length } = audioBuf;
	console.log({ sampleRate, duration, length });
	const voiceStart = detectVoiceStart(audioBuf, 10, 0.4);
	const voiceEnd = detectVoiceEnd(audioBuf, 10, 0.2);
	return { voiceStart, voiceEnd };
};

// Returns the start time (in milliseconds) when the voice reaches a required energy threshold to be considered not silent.
// If no suitable start time is found, it returns null
function detectVoiceStart(audioBuffer, samples, threshold) {
	// Square the threshold to compare to the square of the audio energy so there would be no need for a square root.
	// Also normalize it to the number of samples.
	threshold = threshold * threshold * samples;
	const arrayBuffer = audioBuffer.getChannelData(0);
	const cumsum = new Float32Array(audioBuffer.length);

	if (audioBuffer.length > 0) {
		let bit = arrayBuffer[0];
		cumsum[0] = bit * bit;
		for (let i = 1; i < audioBuffer.length; ++i) {
			bit = arrayBuffer[i];
			cumsum[i] = bit * bit + cumsum[i - 1];

			const start = i - samples;
			if (start < 0) {
				if (cumsum[i] >= threshold) return 0;
			} else {
				if (cumsum[i] - cumsum[start] >= threshold) return Math.round(1000 * ((start + 1) / audioBuffer.sampleRate));
			}
		}
	}

	return null;
}

// Returns the end time (in milliseconds) when the voice reaches a required energy threshold to be considered not silent.
// If no suitable end time is found, it returns null
function detectVoiceEnd(audioBuffer, samples, threshold) {
	// Square the threshold to compare to the square of the audio energy so there would be no need for a square root.
	// Also normalize it to the number of samples.
	threshold = threshold * threshold * samples;
	const arrayBuffer = audioBuffer.getChannelData(0);
	const cumsum = new Float32Array(audioBuffer.length);

	if (audioBuffer.length > 0) {
		let bit = arrayBuffer[audioBuffer.length - 1];
		cumsum[audioBuffer.length - 1] = bit * bit;
		for (let i = audioBuffer.length - 2; i >= 0; --i) {
			bit = arrayBuffer[i];
			cumsum[i] = bit * bit + cumsum[i + 1];

			const end = i + samples;
			if (end >= audioBuffer.length) {
				if (cumsum[i] >= threshold) {
					const result = audioBuffer.length - 1;
					return Math.round(1000 * result);
				}
			} else {
				if (cumsum[i] - cumsum[end] >= threshold) {
					const result = end / audioBuffer.sampleRate;
					return Math.round(1000 * result);
				}
			}
		}
	}

	return null;
}
