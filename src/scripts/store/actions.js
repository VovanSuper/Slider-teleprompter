export const actionTypes = {
  setCurrentSlide: 'SLIDE/SET_SLIDE',
  startRecording: 'RECORDING/START_RECORDING',
  stopRecording: 'RECORDING/STOP_RECORDING',
  addRecord: 'RECORDING/STOP_RECORDING',
  setTimer: 'TIMER/SET_TIMER',
  getElapsedTimer: 'TIMER/GET_ELAPSED_TIMER',
  updateRecordTimePoint: 'RECORDING/UPDATE_TIME_POINT',
  removeNote: 'NOTE/REMOVE_NOTE',
};

export const setCurrentSlide = ({ id, time = null }) => ({ action: { type: actionTypes.setCurrentSlide }, payload: { id, time } });
export const updateClipTimePoint = ({ clipId, slideId,  time = null }) => ({ action: { type: actionTypes.updateRecordTimePoint }, payload: { clipId, slideId, time } });

export const startRecording = () => ({ action: { type: actionTypes.startRecording } });
export const stopRecording = ({ data, ext }) => ({ action: { type: actionTypes.stopRecording }, payload: { data, ext } });

export const setTimer = ({ timer }) => ({ action: { type: actionTypes.setTimer }, payload: { timer } });
export const getElapsedTimer = () => ({ action: { type: actionTypes.getElapsedTimer } });

export const removeNote = ({ id }) => ({ action: { type: actionTypes.removeNote }, payload: { id } });
