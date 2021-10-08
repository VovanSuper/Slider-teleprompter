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
							...state.clips.map(clip =>
								clip.id === state.clips.length && payload.time
									? {
											...clip,
											slides: clip.slides.concat({ id: payload.id, time: 1000 - payload.time > 0 ? 1000 : payload.time, imgUrl: payload.imgUrl }),
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
					slides: [{ time: 1000, id: state.currentSlide }],
				}),
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
				clips: state.clips.filter(clip => payload.id !== clip.id),
			};

		case actionTypes.updateRecordTimePoint:
			return {
				...state,
				clips: state.clips.map(clip =>
					clip.id === payload.clipId
						? {
								...clip,
								slides: clip.slides.map((slide, i) => (i === payload.slideId ? { ...slide, time: payload.time } : { ...slide })),
						  }
						: clip
				),
			};

		case actionTypes.stopRecording:
			return {
				...state,
				recording: false,
				timer: null,
				clips: state.clips.map(clip => (clip.id !== state.clips.length ? { ...clip } : { ...clip, ...payload })),
			};

		default:
			return state;
	}
};
