import fromStore from './store/store.js';
import { setCurrentSlide } from './store/actions.js';
import createNoteCloserBtn from './helpers/closer-btn.js';
import { getNoteByIndex, renderNotes, addNoteContent } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import { readBespokeCurrentSlideIndex, getStatusBoxEl } from './helpers/utils.js';
// import { renderModal } from './modal.js';

const rootEl = document.getElementById('root');

export default function () {
  dispatchCurrentSlideIndex();
  handleRecording();
  fromStore.subscribe(({ notesLength, notes, recording }) => {
    getStatusBoxEl().innerHTML = !!recording ? `<p>Recording</P>` : '';
    renderNotes({ notes }, rootEl);
  });
}

// Opt in to slider buttons clicks events
const nextBtn = document.querySelector('button[data-bespoke-marp-osc="next"]');
const prevBtn = document.querySelector('button[data-bespoke-marp-osc="prev"]');

[nextBtn, prevBtn].forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (!!e) {
      dispatchCurrentSlideIndex();
    }
  });
});

function dispatchCurrentSlideIndex() {
  readBespokeCurrentSlideIndex().then(({ id }) => {
    return fromStore.dispatch(setCurrentSlide({ id }));
  });
}
