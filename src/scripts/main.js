import fromStore from './store/store.js';
import { renderClips } from './helpers/notes.js';
import handleRecording from './helpers/recorder.js';
import { getStatusBoxEl } from './helpers/utils.js';
import { optToSliderButtons, dispatchCurrentSlideIndex } from './helpers/slides.js';

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
  navigator.permissions.query({ name: 'microphone' }).then((micAllowed) => micAllowed.state === 'granted');
  fromStore.subscribe(({ clips, recording }) => {
    getStatusBoxEl().innerHTML = !!recording ? `<p>Recording</P>` : '<small style="color: #ccc; font-size: small;">Click `R` to record</small>';
    renderClips({ clips }, rootEl);
    getDownloadBtn().style.opacity = !!clips?.length ? 1 : 0;
    if (recording) getDownloadBtn().classList.add('btn-recording');
    else getDownloadBtn().classList.remove('btn-recording');
  });
}

function handleDownloadClick() {
  getDownloadBtn().addEventListener('click', async function downloadHandler(e) {
    const { clips, recording } = fromStore.getStateSnapshot();
    if (recording) return;
    const type = 'audio/webm';
    const allRecs = clips.map(({ id, slides, data }) => ({
      file: new File([data], `Slide-${id}`, { type }),
      id,
      slides,
    }));

    let meta = { clips: [] };
    const audiofileOpts = {
      types: [
        {
          description: 'Recorded clips',
          accept: { [type]: ['.weba'] },
        },
      ],
    };
    const metadataOpts = {
      types: [
        {
          description: 'Recorded clips metadata',
          accept: { 'text/json': ['.json'] },
        },
      ],
    };

    await Promise.all(
      allRecs.map(async ({ file, slides, id }) => {
        let fileHandle = await window.showSaveFilePicker(audiofileOpts);

        const writable = await fileHandle.createWritable();

        await writable.write(file, fileHandle.name, file.type);
        await writable.close();

        meta = {
          clips: meta.clips.concat({
            id,
            slides,
            // audio: audioBas64,
            file: `${file.name}.weba`,
          }),
        };
      })
    )
      .then(async () => {
        let fileHandle = await window.showSaveFilePicker(metadataOpts);

        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(meta), fileHandle.name + '.json' || 'clips-metadata.json');
        await writable.close();
      })
      .catch((e) => {
        console.error('Error writing files : ', e);
      });

    // clips.forEach(({ id, slides, data }) => {
    //   let reader = new FileReader();
    //   reader.readAsDataURL(data);
    //   reader.onloadend = (_e) => {
    //     const audioBas64 = reader.result.toString();
    //     meta = {
    //       clips: meta.clips.concat({
    //         id,
    //         slides,
    //         audio: audioBas64,
    //       }),
    //     };
    //     const aEl = document.createElement('a');
    //     aEl.href = window.URL.createObjectURL(data);

    //     aEl.download = `Clip-${id}.webm`;
    //     aEl.style.display = 'none';
    //     document.body.appendChild(aEl);

    //     aEl.click();

    //     document.body.removeChild(aEl);
    //   };
    // });

    // setTimeout(() => {
    //   const aEl = document.createElement('a');
    //   const filename = `media-metadata.json`;
    //   aEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(meta)));
    //   aEl.setAttribute('download', filename);

    //   aEl.style.display = 'none';
    //   document.body.appendChild(aEl);

    //   aEl.click();

    //   document.body.removeChild(aEl);
    // }, 100);
  });
}
