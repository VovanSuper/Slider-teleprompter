import reducer from './reducer.js';

class Store {
	#_state = { currentSlide: 1, clips: [], recording: false, timer: undefined };
	#_lastActionInvoked = null;
	#_subscribers = [];
	currentReducer;

	constructor(reducer, iniClips = []) {
		this.currentReducer = reducer;
		this.#_setState({ ...this.#_state, clips: iniClips });
	}

	subscribe(cb) {
		this.#_subscribers.push(cb);
		// cb(this.getStateSnapshot());
	}

	getStateSnapshot() {
		return { ...this.#_state };
	}

	dispatch(actionParams) {
		if (!!!actionParams.action) return;
		const newState = this.currentReducer(this.getStateSnapshot(), actionParams);
		if (this.#_sameState(newState)) return;
		this.#_lastActionInvoked = actionParams.action;
		this.#_setState(newState);
		!!this.#_subscribers.length && this.#_subscribers.forEach(_sub => _sub(this.getStateSnapshot()));
	}

	#_setState(newState) {
		this.#_state = { ...newState };
		this.#_logState();
	}

	#_logState() {
		console.group('fromState');
		console.info('Last Action : ', this.#_lastActionInvoked);
		console.info('State : ', this.#_state);
		console.groupEnd('fromState');
	}

	#_sameState(newState) {
		try {
			return JSON.stringify(this.#_state) === JSON.stringify(newState);
		} catch {
			return false;
		}
	}
}

let recordsStore = new Store(reducer);

export default {
	dispatch: actionParams => recordsStore.dispatch(actionParams),
	subscribe: cb => recordsStore.subscribe(cb),
	select: selPredicate => cb => {
		const getSnapshotFn = () => recordsStore.getStateSnapshot();
		const getStateSliceFn = () => selPredicate(getSnapshotFn()); // const selPredicate = stateSlicePredicate => cb
		let currentSlice = getStateSliceFn();
		cb(currentSlice);

		let middleCb = () => {
			const substate = getStateSliceFn();
			if (currentSlice !== substate) {
				cb(substate);
				currentSlice = substate;
			}
		};
		recordsStore.subscribe(middleCb);
	},
	getStateSnapshot: () => recordsStore.getStateSnapshot(),
};
