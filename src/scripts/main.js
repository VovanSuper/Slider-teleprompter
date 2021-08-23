import fromStore from './store/store.js';
import { renderClips } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import dispatchKeyDown from './helpers/keydown-dispatch.js';
import { getStatusBoxEl } from './helpers/utils.js';
import { optToSliderButtons, dispatchCurrentSlideIndex } from './helpers/slides.js';

const rootEl = document.getElementById('root');

import './wavesurfer/wavesurfer.js';
import './wavesurfer/plugin/wavesurfer.markers.slides.js';

/**
 *
 * @returns {HTMLButtonElement}
 */
const getDownloadBtn = () => document.querySelector('.btn-download');

export default function () {
  dispatchKeyDown();
  dispatchCurrentSlideIndex();
  optToSliderButtons();
  handleRecording();
  handleDownloadClick();
  fromStore.subscribe(({ clips, recording, currentSlide }) => {
    getStatusBoxEl().innerHTML = !!recording ? `<p>Recording</P>` : '<small style="color: #ccc; font-size: small;">Click `R` to record</small>';
    getDownloadBtn().style.opacity = !!clips?.length ? 1 : 0;
    renderClips({ clips }, rootEl);
    if (recording) {
      getDownloadBtn().classList.add('btn-recording');
    } else {
      getDownloadBtn().classList.remove('btn-recording');
    }
  });
}

function handleDownloadClick() {
  getDownloadBtn().addEventListener('click', async function downloadHandler(e) {
    const { clips, recording } = fromStore.getStateSnapshot();
    if (recording) return;

    let meta = { clips: [] };
    let dirHandler = await window.showDirectoryPicker();

    await Promise.all(
      // allRecs.map(async ({ file, slides, id, ext }) => {
      clips.map(async ({ id, slides, data, ext }) => {
        // let fileHandle = await window.showSaveFilePicker(audiofileOpts);

        const file = new File([data], `Clip-${id}`);
        let fileHandle = await dirHandler.getFileHandle(`Clip-${id}${ext}`, { create: true });
        const writable = await fileHandle.createWritable();

        await writable.write(file, `${fileHandle.name}${ext}`, file.type);
        await writable.close();

        meta = {
          clips: meta.clips.concat({
            id,
            slides,
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
      })
      .catch((e) => {
        console.error('Error writing files : ', e);
      });
  });
}
