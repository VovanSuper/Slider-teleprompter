import fromStore from '../store/store.js';
import renderModal from './modal.js';
import { removeNote } from '../store/actions.js';

export default function (noteEl, rootEl) {
	const closer = document.createElement('button');
	closer.classList.add('btn-close');
	closer.innerHTML = '&Cross;';
	closer.addEventListener('click', function handleRemoveNote(e) {
		const id = parseInt(e.target.parentElement.attributes.idx.nodeValue);
		const delNote = () => fromStore.dispatch(removeNote({ id }));

		renderModal({ id, rootEl }, delNote);
	});
	noteEl.appendChild(closer);

	return () => closer.removeEventListener('click', handleRemoveNote);
}
