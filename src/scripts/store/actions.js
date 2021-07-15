export const actionTypes = {
  addNote: 'NOTE/ADD_NOTE',
  addContentToNote: 'NOTE/ADD_CONTENT_NOTE',
  removeNote: 'NOTE/REMOVE_NOTE',
  setCurrentSlide: 'SLIDE/SET_SLIDE',
  startRecord: 'RECORDING/START_RECORDING',
  stopRecord: 'RECORDING/STOP_RECORDING',
};

export const addNote = ({ note } = { note: { title: '', content: '' } }) => ({ action: { type: actionTypes.addNote }, payload: { note } });
export const removeNote = ({ id }) => ({ action: { type: actionTypes.removeNote }, payload: { id } });
export const addContentToNote = ({ id, content }) => ({ action: { type: actionTypes.addContentToNote }, payload: { id, content } });

export const setCurrentSlide = ({ id }) => ({ action: { type: actionTypes.setCurrentSlide }, payload: { id } });

export const startRecording = () => ({ action: { type: actionTypes.startRecord } });
export const stopRecording = ({ noteId, data }) => ({ action: { type: actionTypes.stopRecord }, payload: { noteId, data } });
