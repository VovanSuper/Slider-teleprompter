import reducer from './reducer.js';

class Store {
  #_state = { notes: [], records: [], notesLength: 0, currentSlide: undefined, records: [], recording: false };
  #_subscribers = [];
  currentReducer;

  constructor(reducer, iniNotes = []) {
    this.currentReducer = reducer;
    this.#_setState({ ...this.#_state, notes: iniNotes });
  }

  subscribe(cb) {
    this.#_subscribers.push(cb);
    cb(this.getStateSnapshot());
  }

  getStateSnapshot() {
    return { ...this.#_state };
  }

  dispatch(actionParams) {
    const newState = this.currentReducer(this.getStateSnapshot(), actionParams);
    // if (this.#_sameState(newState)) return;
    this.#_setState(newState);
    !!this.#_subscribers.length && this.#_subscribers.forEach((_sub) => _sub(this.getStateSnapshot()));
  }

  #logState() {
    console.group('fromState');
    console.info('LogState : ', this.#_state);
    console.groupEnd('fromState');
  }

  #_setState(newState) {
    this.#_state = { ...newState };
    this.#logState();
  }

  #_sameState(newState) {
    try {
      return JSON.stringify(this.#_state) === JSON.stringify(newState);
    } catch {
      return false;
    }
  }
}

let NotesStore = new Store(reducer);

export default {
  dispatch: (actionParams) => NotesStore.dispatch(actionParams),
  subscribe: (cb) => NotesStore.subscribe(cb),
  getStateSnapshot: () => NotesStore.getStateSnapshot(),
};
