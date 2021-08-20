import { addDragHandler } from './utils.js';
import createNoteCloserBtn from './closer-btn.js';

const getNoteByIndex = (index) => document.querySelector(`.note[idx="${index}"]`);

const renderNote = (clip, notesEl, rootEl) => {
  let noteEl = document.createElement('section');
  let noteElHeader = document.createElement('header');
  let noteElFooter = document.createElement('footer');
  let noteElContent = document.createElement('div');
  let noteSlidesNamesEl = document.createElement('ul');
  let noteClipEl = document.createElement('div');
  if (!!clip.slides?.length) addNoteSlidesList(noteSlidesNamesEl, clip);

  if (!!clip.data) {
    const videoEl = addMediaElementToNote(noteClipEl, { ...clip });
    // const surfer = createWave(clip.data, noteElFooter, crateMarkers(clip.slides));
    const surfer = createWave(videoEl, noteElFooter, crateMarkers(clip.slides));
    // surfer.backend;
    let wavePlayBtn = document.createElement('button');
    wavePlayBtn.classList.add('btn-wave--play');
    surfer.on('ready', () => {
      surfer.on(
        'marker-click',
        /** @param {Event & {el:Element}} markerClkEv  */ (markerClkEv) => {
          surfer.stop();
          let currentMarker = markerClkEv.el;
          currentMarker.addEventListener('mousemove', (moveEv) => {
            moveEv.stopPropagation();
          });
        }
      );

      const clipDuration = surfer.getDuration();
      const { markers } = surfer.markers;
      const surferRootEl = surfer.container.querySelector('wave > canvas');
      console.log({ markers, clipDuration, surferRootEl });

      markers.forEach((marker) => addDragHandler(marker.el, surferRootEl, clipDuration, clip.id));
      // wavePlayBtn.addEventListener('click', function PlaySurfer(_e) {
      //   if (!!surfer.isPlaying()) return surfer.pause();
      //   surfer.play();
      //   return () => wavePlayBtn.removeEventListener(PlaySurfer);
      // });
      wavePlayBtn.addEventListener('click', surfer.playPause.bind(surfer));
    });

    noteElFooter.appendChild(wavePlayBtn);
  }

  noteElHeader.classList.add('note-header');
  noteElFooter.classList.add('note-footer');

  noteElContent.classList.add('note-content');
  noteSlidesNamesEl.classList.add('note-slides', 'note-content__item');
  noteClipEl.classList.add('note-media', 'note-content__item');
  noteElContent.appendChild(noteSlidesNamesEl);
  noteElContent.appendChild(noteClipEl);
  noteElHeader.innerHTML = `<h1>Clip ${clip.id}</h1>`;
  noteEl.appendChild(noteElHeader);
  noteEl.appendChild(noteElContent);
  noteEl.appendChild(noteElFooter);
  noteEl.classList.add('note');
  noteEl.setAttribute('idx', clip.id);
  createNoteCloserBtn(noteEl, rootEl);
  notesEl.appendChild(noteEl);
};

const renderClips = ({ clips }, rootEl) => {
  const notesEl = document.querySelector('.notes');
  clearNoteEls(notesEl);
  clips.forEach((clip, i) => renderNote(clip, notesEl, rootEl));
};

const addNoteSlidesList = (noteContentUl, clip) => {
  const { slides } = clip || {};
  try {
    (slides || []).forEach((slide, i) => {
      const liEl = document.createElement('li');
      const liSpan = document.createElement('span');
      liSpan.innerText = `Slide ${slide.id}`;
      liEl.appendChild(liSpan);
      noteContentUl.appendChild(liEl);
    });
  } catch (e) {
    console.error('Error appending Slides names / Audio Element to parent');
    console.error(e);
  }
};

const addMediaElementToNote = (nodeSlidesContainerEl, { data, id, ..._rest }) => {
  // const video = window.URL.createObjectURL(data);
  const video = URL.createObjectURL(new File([data], `Clip-${id}`));
  const videoEl = document.createElement('video');
  videoEl.controls = true;
  try {
    videoEl.src = video;
  } catch {
    videoEl.srcObject = video;
  }
  nodeSlidesContainerEl.appendChild(videoEl);
  return videoEl;
};

// const createWave = (blob, waveContainerEl, markers = []) => {
const createWave = (mediaEl, waveContainerEl, markers = []) => {
  const canvas = document.createElement('canvas');
  canvas.style.visibility = 'collapsed';
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 10, 10, 0);
  gradient.addColorStop(0, '#3030C6');
  gradient.addColorStop(1, '#6767D9');

  const wavesurfer = WaveSurfer.create({
    container: waveContainerEl,
    mediaControls: true,
    interact: true,
    mediaType: 'video',
    height: 75,
    responsive: true,
    // waveColor: '#2D2DC5',
    waveColor: gradient,
    // backend: 'MediaElement',
    plugins: [WaveSurfer.markers.create({ markers })],
  });
  // wavesurfer.loadBlob(blob);
  wavesurfer.load(mediaEl);
  return wavesurfer;
};

/** @param @type{WaveSurfer} */
const crateMarkers = (slides) =>
  slides.map(({ time, id }, i) => ({
    time: time / 1000,
    label: `Slide ${id}`,
    color: '#fd4e4e',
    position: 'top',
    markerId: i,
    idx: id,
  }));

const clearNoteEls = (notesEl) => {
  !!notesEl.children.length && Array.from(notesEl.children).forEach((child) => notesEl.removeChild(child));
};

export { getNoteByIndex, renderNote, renderClips };
