/**
 * @param {Object} props
 * @param {string} props.id
 * @param {HTMLElement} props.rootEl
 * @returns
 */
function createModal({ id, rootEl }, cb) {
	function handleCancelClick() {
		cb();
		modalBtnCancel.removeEventListener('click', handleCancelClick);
		modalBtnOk.removeEventListener('click', handleOkClick);
		detachModal(id, rootEl);
	}

	function handleOkClick(e) {
		detachModal(id, rootEl);
	}

	const modalContainer = document.createElement('div');
	modalContainer.classList.add('modal-container', `modal-${id}`);

	const modalDialog = document.createElement('div');
	modalDialog.classList.add('modal-dialog');
	const dialogCaption = document.createElement('span');
	dialogCaption.innerHTML = 'Do You want to keep the clip?';
	dialogCaption.classList.add('dialog-caption');
	modalDialog.appendChild(dialogCaption);

	const modalOverlay = document.createElement('div');
	modalOverlay.classList.add('modal-overlay');

	const modalBtnCancel = document.createElement('button');
	modalBtnCancel.classList.add('modal-btn', 'modal-btn--cancel');
	modalBtnCancel.innerText = 'NO';
	modalBtnCancel.addEventListener('click', handleCancelClick);
	const modalBtnOk = document.createElement('button');
	modalBtnOk.classList.add('modal-btn', 'modal-btn--ok');
	modalBtnOk.innerText = 'YES';
	modalBtnOk.addEventListener('click', handleOkClick);

	modalDialog.append(modalBtnOk, modalBtnCancel);
	modalContainer.append(modalOverlay, modalDialog);

	return modalContainer;
}

function detachModal(id, rootEl) {
	const openedModal = rootEl.querySelector(`.modal-${id}`);
	if (!!openedModal) {
		rootEl.removeChild(openedModal);
	}
}

function attachModal(modal, rootEl) {
	return rootEl.appendChild(modal);
}

export default function ({ id, rootEl }, cb) {
	const newModal = createModal({ id, rootEl }, cb);
	attachModal(newModal, rootEl);
}
