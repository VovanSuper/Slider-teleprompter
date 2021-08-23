import fromStore from '../store/store.js';
import { startRecording, stopRecording } from '../store/actions.js';
import { getStatusBoxEl } from './utils.js';
import { timeFuncs } from '../helpers/utils.js';

const { setStoreTimer } = timeFuncs;

export default function () {
	document.addEventListener('keypress', e => {
		if (e.key.toLocaleLowerCase() == 'r') {
			handleRecording();
		}
	});
}

let recorder = null;

function handleRecording() {
	const { recording } = fromStore.getStateSnapshot();
	if (recording) {
		if (!!recorder) {
			recorder.stop();
			recorder = null;
		} else {
			console.log('Error: NO recorder !');
		}
	} else {
		recorder = new Recorder();
		recorder.start();
	}
}

export class Recorder {
	/** @property @type {MediaStream} stream */ stream;
	/** @property @type {MediaRecorder} mediaRecorder */ mediaRecorder;
	/** @type {Blob[]} chunks */ chunks = [];

	constructor() {
		if (!('mediaDevices' in navigator)) {
			throw new Error('Recording is not supported ..!');
		}
	}

	stop() {
		this.handleStop();
	}

	async start() {
		try {
			fromStore.dispatch(startRecording());
			setStoreTimer(true);
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
			this.tracks = this.stream.getTracks();
			const audioTrack = this.stream.getAudioTracks()[0];
			console.log({ audioTrack });

			audioTrack.addEventListener('ended', audioEndedEv => {
				console.log('Ended AUDIO !!!!!!!!!!!!!!!!!');
				console.log({ audioEndedEv });
			});

			this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.#_getSupportedCodecFileExt().mime });
			this.mediaRecorder.onstart = _e => console.log('Started recording');
			this.mediaRecorder.onstop = _e => {
				this.#_setMedia();
				// audioTrack.stop();
				this.tracks.forEach(track => track.readyState !== 'ended' && track.stop());
				console.log('Audio Track status :::::::::: ', audioTrack.readyState);
			};
			this.mediaRecorder.ondataavailable = e => {
				if (e.data.size > 0) {
					this.chunks.push(e.data);
				}
			};

			this.mediaRecorder.start();

			return this.stream;
		} catch (error) {
			if (error.name === 'ConstraintNotSatisfiedError') {
				this.#_errorMsg('Video  is not supported by your device.');
			} else if (error.name === 'PermissionDeniedError') {
				this.#_errorMsg('Permissions have not been granted to use your microphone, you need to allow the page access to your devices');
			}
			this.#_errorMsg('getUserMedia error: ' + error.name, error);
		}
	}

	handleStop() {
		if (this.#_getState() !== 'inactive') this.mediaRecorder.stop();
	}

	#_getSupportedCodecFileExt() {
		let types = ['video/webm;codecs=vp9,opus', 'video/webm'];
		for (let mime of types) {
			if (MediaRecorder.isTypeSupported(mime)) return { mime, ext: '.webm' };
		}
		return { mime: 'video/mp4', ext: '.mp4' };
	}

	#_getState() {
		return this.mediaRecorder?.state; // inactive, recording, or paused
	}

	#_setMedia() {
		const { clips } = fromStore.getStateSnapshot();
		const id = clips[clips.length - 1].id;
		const { ext, mime } = this.#_getSupportedCodecFileExt();
		const blob = new Blob(this.chunks, { type: mime });
		const file = new File([blob], `Clip-${id}`, { type: mime });
		fromStore.dispatch(stopRecording({ file, ext }));
		this.chunks = [];
	}

	#_errorMsg(msg, error = undefined) {
		getStatusBoxEl().innerHTML += '<p>' + msg + '</p>';
		if (typeof error !== 'undefined') {
			console.error(error);
		}
	}
}

// Returns the start time (in seconds) when the voice reaches a required energy threshold to be considered not silent.
// If no suitable start time is found, it returns null
function detectVoiceStart(audioBuffer, samples, threshold) {
	// Square the threshold to compare to the square of the audio energy so there would be no need for a square root.
	// Also normalise it to the number of samples.
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
				if (cumsum[i] - cumsum[start] >= threshold) return (start + 1) / audioBuffer.sampleRate;
			}
		}
	}

	return null;
}

// Returns the end time (in seconds) when the voice reaches a required energy threshold to be considered not silent.
// If no suitable end time is found, it returns null
function detectVoiceEnd(audioBuffer, samples, threshold) {
	// Square the threshold to compare to the square of the audio energy so there would be no need for a square root.
	// Also normalise it to the number of samples.
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
				if (cumsum[i] >= threshold) return audioBuffer.length - 1;
			} else {
				if (cumsum[i] - cumsum[end] >= threshold) return end / audioBuffer.sampleRate;
			}
		}
	}

	return null;
}
