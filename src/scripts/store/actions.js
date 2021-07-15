export const actionTypes = {
  addNote: 'NOTE/ADD_NOTE',
  addContentToNote: 'NOTE/ADD_CONTENT_NOTE',
  removeNote: 'NOTE/REMOVE_NOTE',
  setCurrentSlide: 'SLIDE/SET_SLIDE',
  startRecording: 'RECORDING/START_RECORDING',
  stopRecording: 'RECORDING/STOP_RECORDING',
  addRecord: 'RECORDING/STOP_RECORDING',
};

export const addNote = ({ note }) => ({ action: { type: actionTypes.addNote }, payload: { note } });
export const removeNote = ({ id }) => ({ action: { type: actionTypes.removeNote }, payload: { id } });
export const addContentToNote = ({ id, content }) => ({ action: { type: actionTypes.addContentToNote }, payload: { id, content } });

export const setCurrentSlide = ({ id }) => ({ action: { type: actionTypes.setCurrentSlide }, payload: { id } });

export const startRecording = () => ({ action: { type: actionTypes.startRecording } });
export const stopRecording = ({ noteId, data }) => ({ action: { type: actionTypes.stopRecording }, payload: { noteId, data } });
export const addRecord = ({ id, data }) => ({ action: { type: actionTypes.addRecord }, payload: { noteId, data } });
