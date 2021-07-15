import fromStore from '../store/store.js';
import { startRecording, stopRecording, addNote, addContentToNote } from '../store/actions.js';
import { getStatusBoxEl } from './utils.js';

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
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const tracks = this.stream.getAudioTracks();
      console.log('Tracks :: ', tracks);
      console.log('Capabilities :: ', tracks[0].getCapabilities());

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm;codecs=opus' });
      this.mediaRecorder.onstart = (e) => console.log('Started recording');
      this.mediaRecorder.onstop = (e) => {
        const audioData = this.#_setAudio();

        const { currentSlide: id, notes, notesLength } = fromStore.getStateSnapshot();

        if (!!!notesLength || !!!notes.some((n) => n.id === id)) {
          fromStore.dispatch(addNote({ note: { title: `Slide ${id}`, id, content: [audioData] } }));
        } else {
          fromStore.dispatch(addContentToNote({ id, content: audioData }));
        }
      };
      this.mediaRecorder.ondataavailable = (e) => {
        console.log('Data AVAILABLE::: ', e.data);

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
    fromStore.dispatch(
      stopRecording({
        noteId: fromStore.getStateSnapshot().currentSlide,
        data: blob,
      })
    );
    this.chunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    return audioURL;
  }

  #_errorMsg(msg, error) {
    getStatusBoxEl().innerHTML += '<p>' + msg + '</p>';
    if (typeof error !== 'undefined') {
      console.error(error);
    }
  }
}
