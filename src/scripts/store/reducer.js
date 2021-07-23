import { actionTypes } from './actions.js';

export default (state, { action: { type }, payload }) => {
  switch (type) {
    case actionTypes.setCurrentSlide:
      return {
        ...state,
        currentSlide: payload.id,
        clips: !!!state.recording
          ? state.clips
          : [
              ...state.clips.map((clip) =>
                clip.id === state.clips.length && payload.time
                  ? {
                      ...clip,
                      slides: clip.slides.concat({ id: payload.id, time: payload.time }),
                    }
                  : { ...clip }
              ),
            ],
      };

    case actionTypes.startRecording:
      return {
        ...state,
        recording: true,
        clips: (state.clips || []).concat({
          id: state.clips?.length + 1 || 1,
          slides: [{ time: 0, id: state.currentSlide }],
        }),
      };

    case actionTypes.stopRecording:
      return {
        ...state,
        recording: false,
        timer: null,
        clips: state.clips.map((clip) => (clip.id !== state.clips.length ? { ...clip } : { ...clip, data: payload.data })),
      };

    case actionTypes.setTimer:
      return {
        ...state,
        timer: payload.timer,
      };

    case actionTypes.removeNote:
      return {
        ...state,
        timer: undefined,
        clips: state.clips.filter((clip) => payload.id !== clip.id),
      };

    default:
      return state;
  }
};
