import fromStore from '../store/store.js';
import { removeNote } from '../store/actions.js';
import { renderModal } from './modal.js';

export default function createNoteCloserBtn(noteEl, rootEl) {
  const currNotes = fromStore.getStateSnapshot();
  // console.log('Notes before (fromStore) :: ', currNotes);
  const closer = document.createElement('button');
  closer.classList.add('btn-close');
  closer.innerHTML = '&Cross;';
  closer.addEventListener('click', function handleRemoveNote(e) {
    const noteIndex = parseInt(e.target.parentElement.attributes.idx.nodeValue);
    function delNote() {
      fromStore.dispatch(removeNote({ id: noteIndex }));
    }

    renderModal(
      {
        id: noteIndex,
        rootEl,
      },
      delNote
    );
  });
  noteEl.appendChild(closer);

  return () => closer.removeEventListener('click', handleRemoveNote);
}
