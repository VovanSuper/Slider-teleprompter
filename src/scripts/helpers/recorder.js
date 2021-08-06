import fromStore from '../store/store.js';
import { startRecording, stopRecording } from '../store/actions.js';
import { getStatusBoxEl } from './utils.js';
import { timeFuncs } from '../helpers/utils.js';

const { setStoreTimer } = timeFuncs;

export default function () {
  document.addEventListener('keypress', (e) => {
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
  stream;
  mediaRecorder;
  chunks = [];

  constructor() {
    if (!('mediaDevices' in navigator)) {
      throw new Error('Recording is not supported ..!');
    }
  }

  stop() {
    console.log({ Recorded: this.chunks });
    this.handleStop();
  }

  async start() {
    // this.#_getSupportedMimes();
    try {
      fromStore.dispatch(startRecording());
      setStoreTimer(true);
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.#_getSupportedCodecFileExt().mime });
      this.mediaRecorder.onstart = (e) => console.log('Started recording');
      this.mediaRecorder.onstop = (e) => {
        this.#_setMedia();
      };
      this.mediaRecorder.ondataavailable = (e) => {
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
    let types = ['video/webm;codecs=vp8,vp9,opus', 'video/webm;codecs=vp9,opus', 'video/webm'];
    for (let mime of types) {
      if (MediaRecorder.isTypeSupported(mime)) return { mime, ext: '.webm' };
    }
    return { mime: 'video/mp4', ext: '.mp4' };
  }

  #_getState() {
    return this.mediaRecorder?.state; // inactive, recording, or paused
  }

  #_setMedia() {
    const { ext, mime } = this.#_getSupportedCodecFileExt();
    const blob = new Blob(this.chunks, { type: mime });
    fromStore.dispatch(stopRecording({ data: blob, ext }));
    this.chunks = [];
  }

  #_errorMsg(msg, error) {
    getStatusBoxEl().innerHTML += '<p>' + msg + '</p>';
    if (typeof error !== 'undefined') {
      console.error(error);
    }
  }
}
