import { actionTypes } from './actions.js';

export default (state, { action: { type }, payload }) => {
  switch (type) {
    case actionTypes.addNote:
      return {
        ...state,
        notesLength: state.notes.length + 1,
        notes: [...state.notes, payload.note],
      };

    case actionTypes.removeNote:
      return {
        ...state,
        notesLength: state.notes.length > 0 ? state.notes.length - 1 : 0,
        notes: state.notes.filter((n) => payload.id !== n.id),
      };

    case actionTypes.addContentToNote:
      const newContent = state.notes.filter((n) => n.id == payload.id)[0].content.concat(payload.content);
      const modNote = {
        ...state.notes.filter((n) => n.id === payload.id)[0],
        content: newContent,
      };
      const newNotes = state.notes.map((note) => (note.id === payload.id ? modNote : note));
      return {
        ...state,
        notes: newNotes,
      };

    case actionTypes.setCurrentSlide:
      return {
        ...state,
        currentSlide: payload.id,
      };

    case actionTypes.startRecord:
      return {
        ...state,
        recording: true,
      };

    case actionTypes.stopRecord:
      return {
        ...state,
        recording: false,
        records: [
          ...state.records,
          {
            noteId: payload.noteId,
            data: payload.data,
          },
        ],
      };

    default:
      return state;
  }
};
