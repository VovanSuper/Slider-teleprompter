export const actionTypes = {
	setCurrentSlide: 'SLIDE/SET_SLIDE',
	updateRecordTimePoint: 'RECORDING/UPDATE_TIME_POINT',
	startRecording: 'RECORDING/START_RECORDING',
	stopRecording: 'RECORDING/STOP_RECORDING',
	addRecordVoiceStartEnd: 'RECORDING/VOICE_START_END_RECORDING',
	addRecord: 'RECORDING/STOP_RECORDING',
	setTimer: 'TIMER/SET_TIMER',
	getElapsedTimer: 'TIMER/GET_ELAPSED_TIMER',
	removeNote: 'NOTE/REMOVE_NOTE',
};

export const setCurrentSlide = ({ id, imgUrl, time = null }) => ({ action: { type: actionTypes.setCurrentSlide }, payload: { id, imgUrl, time } });
export const updateClipTimePoint = ({ clipId, slideId, time = null }) => ({ action: { type: actionTypes.updateRecordTimePoint }, payload: { clipId, slideId, time } });

export const startRecording = () => ({ action: { type: actionTypes.startRecording } });
export const stopRecording = ({ file, ext }) => ({ action: { type: actionTypes.stopRecording }, payload: { file, ext } });
export const addVoiceStartEndInRecording = ({ voiceStart, voiceEnd, id }) => ({ action: { type: actionTypes.addRecordVoiceStartEnd }, payload: { voiceStart, voiceEnd, id } });

export const setTimer = ({ timer }) => ({ action: { type: actionTypes.setTimer }, payload: { timer } });
export const getElapsedTimer = () => ({ action: { type: actionTypes.getElapsedTimer } });

export const removeNote = ({ id }) => ({ action: { type: actionTypes.removeNote }, payload: { id } });
