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
  stream = null;
  mediaRecorder = null;
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
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const tracks = this.stream.getAudioTracks();
      // console.log('Tracks :: ', tracks);
      // console.log('Capabilities :: ', tracks[0].getCapabilities());

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm;codecs=opus' });
      this.mediaRecorder.onstart = (e) => console.log('Started recording');
      this.mediaRecorder.onstop = (e) => {
        const audioData = this.#_setAudio();
      };
      this.mediaRecorder.ondataavailable = (e) => {
        // console.log('Data AVAILABLE::: ', e.data);

        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
        // const audioData = this.#_setAudio();

        // const { currentSlide: id, notes, notesLength } = fromStore.getStateSnapshot();

        // if (!!!notesLength || !!!notes[id]) {
        //   fromStore.dispatch(addNote({ note: { title: `Slide ${id}`, id, content: [audioData] } }));
        // } else {
        //   fromStore.dispatch(addContentToNote({ id, content: audioData }));
        // }
      };

      this.mediaRecorder.start();

      return this.stream;
    } catch (error) {
      if (error.name === 'ConstraintNotSatisfiedError') {
        this.#_errorMsg('Audio  is not supported by your device.');
      } else if (error.name === 'PermissionDeniedError') {
        this.#_errorMsg('Permissions have not been granted to use your microphone, you need to allow the page access to your devices');
      }
      this.#_errorMsg('getUserMedia error: ' + error.name, error);
    }
  }

  handleStop() {
    console.log('The Recorder stopping ...');
    if (!!this.mediaRecorder && this.mediaRecorder.start !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  #_getSupportedMimes() {
    let types = ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus'];
    for (let i in types) {
      console.log('Is ' + types[i] + ' supported? ' + (MediaRecorder.isTypeSupported(types[i]) ? 'Maybe!' : 'Nope :('));
    }
  }

  #_setAudio() {
    const blob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
    fromStore.dispatch(stopRecording({ data: blob }));
    this.chunks = [];
  }

  #_errorMsg(msg, error) {
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
    let bit = arrayBuffer[0]
    cumsum[0] = bit * bit;
    for (let i = 1; i < audioBuffer.length; ++i) {
      bit = arrayBuffer[i];
      cumsum[i] = bit * bit + cumsum[i - 1];

      const start = i - samples;
      if (start < 0) {
        if (cumsum[i] >= threshold)
          return 0
      } else {
        if (cumsum[i] - cumsum[start] >= threshold)
          return (start + 1) / audioBuffer.sampleRate;
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
    let bit = arrayBuffer[audioBuffer.length - 1]
    cumsum[audioBuffer.length - 1] = bit * bit;
    for (let i = audioBuffer.length - 2; i >= 0; --i) {
      bit = arrayBuffer[i];
      cumsum[i] = bit * bit + cumsum[i + 1];

      const end = i + samples;
      if (end >= audioBuffer.length) {
        if (cumsum[i] >= threshold)
          return audioBuffer.length - 1;
      } else {
        if (cumsum[i] - cumsum[end] >= threshold)
          return end / audioBuffer.sampleRate;
      }
    }
  }

  return null;
}