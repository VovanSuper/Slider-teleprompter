export const actionTypes = {
	setCurrentSlide: 'SLIDE/SET_SLIDE',
	updateRecordTimePoint: 'RECORDING/UPDATE_TIME_POINT',
	startRecording: 'RECORDING/START_RECORDING',
	stopRecording: 'RECORDING/STOP_RECORDING',
	addRecord: 'RECORDING/STOP_RECORDING',
	setTimer: 'TIMER/SET_TIMER',
	getElapsedTimer: 'TIMER/GET_ELAPSED_TIMER',
	removeNote: 'NOTE/REMOVE_NOTE',
};

export const setCurrentSlide = ({ id, imgUrl, time = null }) => ({ action: { type: actionTypes.setCurrentSlide }, payload: { id, imgUrl, time } });
export const updateClipTimePoint = ({ clipId, slideId, time = null }) => ({ action: { type: actionTypes.updateRecordTimePoint }, payload: { clipId, slideId, time } });

export const startRecording = () => ({ action: { type: actionTypes.startRecording } });
export const stopRecording = ({ file, ext, voiceStart, voiceEnd, }) => ({ action: { type: actionTypes.stopRecording }, payload: { file, ext, voiceStart, voiceEnd, } });

export const setTimer = ({ timer }) => ({ action: { type: actionTypes.setTimer }, payload: { timer } });
export const getElapsedTimer = () => ({ action: { type: actionTypes.getElapsedTimer } });

export const removeNote = ({ id }) => ({ action: { type: actionTypes.removeNote }, payload: { id } });
