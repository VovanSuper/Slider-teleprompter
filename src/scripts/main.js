import fromStore from './store/store.js';
import { renderNotes } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import { optToSliderButtons, getStatusBoxEl, dispatchCurrentSlideIndex } from './helpers/utils.js';

const rootEl = document.getElementById('root');

/**
 *
 * @returns {HTMLButtonElement}
 */
const getDownloadBtn = () => document.querySelector('.btn-download');

export default function () {
  dispatchCurrentSlideIndex();
  optToSliderButtons();
  handleRecording();
  handleDownloadClick();
  fromStore.subscribe(({ notesLength, notes, recording }) => {
    getStatusBoxEl().innerHTML = !!recording ? `<p>Recording</P>` : '<small style="color: #ccc; font-size: small;">Click `R` to record</small>';
    renderNotes({ notes }, rootEl);
    getDownloadBtn().style.opacity = !!notesLength ? 1 : 0;
  });
}

function handleDownloadClick() {
  getDownloadBtn().addEventListener('click', function downloadHandler(e) {
    const { records, notes } = fromStore.getStateSnapshot();
    // const allRecs = records.map(({ noteId, data }, i) => ({
    //   file: new File([data], `Slide-${noteId}-${i}`, { type: 'audio/webm' }),
    // }));
    notes.forEach(({ content }, nIdx) => {
      // const blob = new Blob([data], { type: 'audio/webm' });
      content.forEach((obj, oIdx) => {
        var aEl = document.createElement('a');
        // aEl.href = window.URL.createObjectURL(obj);
        aEl.href = obj;

        aEl.download = `Slide-${nIdx}-${oIdx}.webm`;
        aEl.style.display = 'none';
        document.body.appendChild(aEl);

        aEl.click();

        document.body.removeChild(aEl);
      });
    });
  });
}
