// import WaveSurfer, { create } from 'wavesurfer.js';
// import * as WaveSurfer from '../wavesurfer.js/dist/wavesurfer.js';

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
  if (!!clip.data) addMediaElementToNote(noteClipEl, { data: clip.data });
  if (!!clip.data) createWave(clip.data, noteElFooter, crateMarkers(clip.slides));

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
    (slides || []).forEach((slide) => {
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

const addMediaElementToNote = (nodeSlidesContainerEl, { data }) => {
  const video = window.URL.createObjectURL(data);
  const videoEl = document.createElement('video');
  videoEl.controls = true;
  try {
    videoEl.src = video;
  } catch {
    videoEl.srcObject = video;
  }
  nodeSlidesContainerEl.appendChild(videoEl);
};

const createWave = (blob, waveContainerEl, markers = []) =>
  WaveSurfer.create({
    container: waveContainerEl,
    mediaControls: true,
    interact: true,
    mediaType: 'video',
    height: 75,
    responsive: true,
    waveColor: '#2D2DC5',
    plugins: [WaveSurfer.markers.create({ markers })],
  }).loadBlob(blob);

const crateMarkers = (slides) =>
  slides.map(({ time, id }) => ({
    time: time / 1000,
    label: `Slide ${id}`,
    color: '#fd4e4e',
    position: 'top',
  }));

const clearNoteEls = (notesEl) => {
  !!notesEl.children.length && Array.from(notesEl.children).forEach((child) => notesEl.removeChild(child));
};

export { getNoteByIndex, renderNote, renderClips };
