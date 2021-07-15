import fromStore from '../store/store.js';
import createNoteCloserBtn from './closer-btn.js';

const getNoteByIndex = (index) => document.querySelector(`.note[idx="${index}"]`);

const renderNote = (note, notesEl, rootEl) => {
  let noteEl = document.createElement('section');
  let noteElHeader = document.createElement('header');
  let noteElContent = document.createElement('ul');
  if (!!note.content) addNoteContent(noteElContent, note.content);
  // noteElContent.innerHTML = content;

  noteElHeader.classList.add('note-header');
  noteElContent.classList.add('note-content');
  noteElHeader.innerHTML = `<h1>${note.title}</h1>`;
  noteEl.appendChild(noteElHeader);
  noteEl.appendChild(noteElContent);
  noteEl.classList.add('note');
  noteEl.setAttribute('idx', note.id);
  createNoteCloserBtn(noteEl, rootEl);
  notesEl.appendChild(noteEl);
};

const renderNotes = ({ notes }, rootEl) => {
  const notesEl = document.querySelector('.notes');
  console.log({ notes });
  clearNoteEls(notesEl);
  notes.forEach((note, i) => renderNote(note, notesEl, rootEl));
};

/**
 *
 * @param {HTMLElement} noteContentUl
 * @param {Array<Blob>} records
 */
const addNoteContent = (noteContentUl, records) => {
  records.forEach((stream) => {
    try {
      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      try {
        audioEl.src = stream;
      } catch {
        audioEl.srcObject = stream;
      }

      const liEl = document.createElement('li');
      liEl.appendChild(audioEl);
      noteContentUl.appendChild(liEl);
    } catch (e) {
      console.error('Error appending Audio Element to parent');
      console.error(e);
    }
  });
};
const clearNoteEls = (notesEl) => {
  !!notesEl.children.length && Array.from(notesEl.children).forEach((child) => notesEl.removeChild(child));
};

export { getNoteByIndex, renderNote, renderNotes, addNoteContent };
