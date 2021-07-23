import fromStore from './store/store.js';
import { renderClips } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import { getStatusBoxEl } from './helpers/utils.js';
import { optToSliderButtons, dispatchCurrentSlideIndex } from './helpers/slides.js';

import('./bespoke_generated.js');

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
  fromStore.subscribe(({ clips, recording }) => {
    getStatusBoxEl().innerHTML = !!recording ? `<p>Recording</P>` : '<small style="color: #ccc; font-size: small;">Click `R` to record</small>';
    renderClips({ clips }, rootEl);
    getDownloadBtn().style.opacity = !!clips?.length ? 1 : 0;
  });
}

function handleDownloadClick() {
  getDownloadBtn().addEventListener('click', function downloadHandler(e) {
    const { clips } = fromStore.getStateSnapshot();
    // const allRecs = clips.map(({ noteId, data }, i) => ({
    //   file: new File([data], `Slide-${noteId}-${i}`, { type: 'audio/webm' }),
    // }));
    let meta = { clips: [] };

    clips.forEach(({ id, slides, data }) => {
      let reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onloadend = (_e) => {
        const audioBas64 = reader.result.toString();
        meta = {
          clips: meta.clips.concat({
            id,
            slides,
            audio: audioBas64,
          }),
        };
        const aEl = document.createElement('a');
        aEl.href = window.URL.createObjectURL(data);

        aEl.download = `Clip-${id}.webm`;
        aEl.style.display = 'none';
        document.body.appendChild(aEl);

        aEl.click();

        document.body.removeChild(aEl);
      };
    });

    setTimeout(() => {
      const aEl = document.createElement('a');
      const filename = `media-metadata.json`;
      aEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(meta)));
      aEl.setAttribute('download', filename);

      aEl.style.display = 'none';
      document.body.appendChild(aEl);

      aEl.click();

      document.body.removeChild(aEl);
    }, 100);
  });
}
