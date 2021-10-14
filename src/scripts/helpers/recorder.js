import fromStore from '../store/store.js';
import { startRecording, stopRecording } from '../store/actions.js';
import { handleAudioData, setError } from '../helpers/utils.js';
import { timeFuncs } from '../helpers/timer.js';

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

			this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.#_getSupportedCodecFileExt().mime });
			this.mediaRecorder.onstart = _e => console.log('Started recording');
			this.mediaRecorder.onstop = _e => {
				this.#_setMedia();
				this.tracks.forEach(track => track.readyState !== 'ended' && track.stop());
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
				setError('Video  is not supported by your device.');
			} else if (error.name === 'PermissionDeniedError') {
				setError('Permissions have not been granted to use your microphone, you need to allow the page access to your devices');
			}
			setError('getUserMedia error: ' + error.name, error);
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

	async #_setMedia() {
		const { clips } = fromStore.getStateSnapshot();
		const id = clips[clips.length - 1].id;
		const { ext, mime } = this.#_getSupportedCodecFileExt();
		const blob = new Blob(this.chunks, { type: mime });
		const file = new File([blob], `Clip-${id}`, { type: mime });

		const { voiceEnd, voiceStart, duration } = await handleAudioData(file);
		console.log({ voiceEnd, voiceStart });
		fromStore.dispatch(stopRecording({ file, ext, voiceStart, voiceEnd, duration }));
		this.chunks = [];
	}
}
