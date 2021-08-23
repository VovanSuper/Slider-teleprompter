import { addDragHandler, playBtnPause, playBtnPlay } from './utils.js';
import createNoteCloserBtn from './closer-btn.js';

const getNoteByIndex = (index) => document.querySelector(`.note[idx="${index}"]`);

const renderNote = (clip, notesEl, rootEl) => {
  let noteEl = document.createElement('section');
  let noteElHeader = document.createElement('header');
  let noteElFooter = document.createElement('footer');
  let noteElContent = document.createElement('div');
  let noteSlidesNamesEl = document.createElement('div');
  let noteClipEl = document.createElement('div');
  if (!!clip.slides?.length) addNoteSlidesList(noteSlidesNamesEl, clip);

  if (!!clip.file) {
    const videoEl = addMediaElementToNote(noteClipEl, { ...clip });
    // const surfer = createWave(clip.data, noteElFooter, crateMarkers(clip.slides));
    const surfer = createWave(videoEl, noteElFooter, crateMarkers(clip.slides));
    let wavePlayBtn = document.createElement('button');
    wavePlayBtn.classList.add('btn-wave--play');

    surfer.on('waveform-ready', () => {
      // surfer.on('ready', () => {
      surfer.on(
        'marker-click',
        /** @param {Event & {el:Element}} markerClkEv  */ (markerClkEv) => {
          surfer.isPlaying() && surfer.stop();
          markerClkEv.el.addEventListener(
            'mousemove',
            (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
            },
            true
          );
        }
      );

      const clipDuration = surfer.getDuration();
      const { markers } = surfer.markers;
      const surferRootEl = surfer.container.querySelector('wave > canvas');

      markers.forEach((marker) => addDragHandler(marker.el, surferRootEl, clipDuration, clip.id));
      // wavePlayBtn.addEventListener('click', function PlaySurfer(_e) {
      //   if (!!surfer.isPlaying()) return surfer.pause();
      //   surfer.play();
      //   return () => wavePlayBtn.removeEventListener(PlaySurfer);
      // });
      let currentSlideImg = null;
      wavePlayBtn.addEventListener('click', surfer.playPause.bind(surfer));
      wavePlayBtn.addEventListener('click', (e) => {
        noteSlidesNamesEl.children.length && !!noteSlidesNamesEl.querySelector('.slides-names') && noteSlidesNamesEl.removeChild(noteSlidesNamesEl.querySelector('.slides-names'));
        if (!!clip.slides?.length && !currentSlideImg) {
          currentSlideImg = renderNoteSlideImg(noteSlidesNamesEl);
        }
      });

      surfer.on('audioprocess', (currentSeekSec) => {
        const currentPlayBackTime = Math.round(currentSeekSec * 1000);
        // clip.slides.forEach((slide) => {
        //   if (slide.time === currentPlayBackTime) {
        //     (allCurrentSlides || []).forEach((imgEl) => {
        //       imgEl.style.zIndex = '0';
        //     });
        //     const currentSlide = allCurrentSlides.find((imgEl) => {
        //       const slideIdx = +imgEl.getAttribute('data-slide-idx');
        //       const isSame = slideIdx === slide.id;
        //       return isSame;
        //       //.querySelector(`.slides-images--container > img[data-slide-idx="${slide.id}"]`);
        //     });
        //     if (!!currentSlide) currentSlide.style.zIndex = '9999';
        //   }
        // });
        const firstSlideImg = clip.slides[0].imgUrl;
        console.log({ firstSlideImg });
        clip.slides.forEach((slide) => {
          if (slide.time <= currentPlayBackTime + 37) {
            const imgUrl = (!!slide.imgUrl && slide.imgUrl) || firstSlideImg;
            console.log({ slideId: slide.id, slideTIme: slide.time, slideImgUrl: imgUrl, currentPlayBackTime });
            setTimeout(() => renderNoteSlideCurrentImg(currentSlideImg, imgUrl), 100);
          }
        });
      });

      surfer.on('play', (e) => {
        console.log({ e, status: 'Playing' });
        //TODO: check the moving part relative to markers !!!!
      });
      surfer.on('pause', (e) => {
        console.log({ e, status: 'Paused' });
      });
      surfer.on('finish', (e) => {
        console.log({ e, status: 'finish' });
      });
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

  // return () =>
};

const renderClips = ({ clips }, rootEl) => {
  const notesEl = document.querySelector('.notes');
  clearNoteEls(notesEl);
  clips.forEach((clip, i) => renderNote(clip, notesEl, rootEl));
};

const addNoteSlidesList = (noteContentUl, clip) => {
  const { slides } = clip || {};
  try {
    const ulEl = document.createElement('ul');
    ulEl.classList.add('slides-names');
    (slides || []).forEach((slide, i) => {
      const liEl = document.createElement('li');
      const liSpan = document.createElement('span');
      liSpan.innerText = `Slide ${slide.id}`;
      liEl.appendChild(liSpan);
      ulEl.appendChild(liEl);
    });
    noteContentUl.appendChild(ulEl);
  } catch (e) {
    console.error('Error appending Slides names / Audio Element to parent');
    console.error(e);
  }
};

const renderNoteSlideImg = (noteContentUl) => {
  try {
    const ulEl = noteContentUl.querySelector('.slides-names');
    if (ulEl) {
      noteContentUl.removeChild(ulEl);
    }
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('slides-images--container');
    const imgEl = document.createElement('img');
    imgEl.classList.add('slide-img');
    imgContainer.appendChild(imgEl);
    noteContentUl.appendChild(imgContainer);
    return imgEl;
  } catch (e) {
    console.error(e);
  }
};

const renderNoteSlideCurrentImg = (imgEl, imgUrl) => {
  imgEl.src = imgUrl;
};

const addMediaElementToNote = (nodeSlidesContainerEl, { file, id, ...rest }) => {
  // const video = window.URL.createObjectURL(data);
  // const video = URL.createObjectURL(new File([data], `Clip-${id}`));

  const video = URL.createObjectURL(file);
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
    backend: 'MediaElement',
    plugins: [WaveSurfer.markers.create({ markers })],
  });
  // wavesurfer.loadBlob(blob);
  wavesurfer.load(mediaEl);
  return wavesurfer;
};

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

export { getNoteByIndex, renderClips };
