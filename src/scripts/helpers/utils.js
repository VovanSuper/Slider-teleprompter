import fromStore from '../store/store.js';
import { updateClipTimePoint } from '../store/actions.js';

const statusBoxEl = document.querySelector('#status_box');
const downloadBtn = document.querySelector('.btn-download');

export const playBtnToggleIcon = /** @param {HTMLButtonElement} wavePlayBtn */ wavePlayBtn => {
	wavePlayBtn.classList.toggle('btn-wave--pause');
	wavePlayBtn.classList.toggle('btn-wave--play');
};

export const playBtnSetInitial = wavePlayBtn => {
	wavePlayBtn.classList.remove('btn-wave--pause');
	wavePlayBtn.classList.add('btn-wave--play');
};

export const handleRecodingStatus = () => {
	const recordingSelector = fromStore.select(state => state.recording);
	recordingSelector(recording => {
		statusBoxEl.innerHTML = !!recording ? `<p>Recording</P>` : '<small style="color: #ccc; font-size: small;">Click `R` to record</small>';
		if (recording) downloadBtn.classList.add('btn-recording');
		else downloadBtn.classList.remove('btn-recording');
	});
};

export const setError = (msg, error = undefined) => {
	statusBoxEl.innerHTML += '<p>' + msg + '</p>';
	if (typeof error !== 'undefined') {
		console.error(error);
	}
};

export const handleDownloadClick = () => {
	fromStore.select(state => state.clips.length)(len => (downloadBtn.style.opacity = !!len ? 1 : 0));

	downloadBtn.addEventListener('click', async function downloadHandler(e) {
		const { clips, recording } = fromStore.getStateSnapshot();
		if (recording) return;

		let meta = { clips: [] };
		const dirHandler = await window.showDirectoryPicker();

		await Promise.all(
			// allRecs.map(async ({ file, slides, id, ext }) => {
			clips.map(async ({ id, slides, file, ext }) => {
				// let fileHandle = await window.showSaveFilePicker(audiofileOpts);

				// const file = new File([data], `Clip-${id}`);
				const fileHandle = await dirHandler.getFileHandle(`Clip-${id}${ext}`, { create: true });
				const writable = await fileHandle.createWritable();

				await writable.write(file, `${fileHandle.name}${ext}`, file.type);
				await writable.close();

				meta = {
					clips: meta.clips.concat({
						id,
						slides: slides.map(({ time, id, ...rest }) => ({ time, id })),
						// audio: audioBas64,
						file: `${file.name}${ext}`,
					}),
				};
			})
		)
			.finally(async () => {
				// let fileHandle = await window.showSaveFilePicker(metadataOpts);

				const fileHandle = await dirHandler.getFileHandle('clips-metadata.json', { create: true });
				const writable = await fileHandle.createWritable();
				await writable.write(JSON.stringify(meta), 'clips-metadata.json');
				await writable.close();

				return () => downloadBtn().removeEventListener('click', downloadHandler);
			})
			.catch(e => {
				console.error('Error writing files : ', e);
			});
	});
};

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
	let [voiceStart, voiceEnd] = [detectVoiceStart(audioBuf, 10, 0.4), detectVoiceEnd(audioBuf, 10, 0.2)];
	if (duration * 1000 - voiceEnd < 500) voiceEnd = null;
	if (voiceStart < 500) voiceStart = null;
	return { voiceStart, voiceEnd, duration: Math.round(duration * 1000) };
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
