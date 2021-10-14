import fromStore from '../store/store.js';
import { setTimer } from '../store/actions.js';

class SimpleTimer {
	startTime = undefined;

	constructor() {
		this.#_start();
	}

	#_start() {
		this.startTime = new Date().getTime();
	}

	getDiffMs() {
		return new Date().getTime() - this.startTime;
	}
}

const createTimer = () => new SimpleTimer();

export const timeFuncs = {
	setStoreTimer: isNewUp => fromStore.dispatch(setTimer({ timer: isNewUp ? createTimer() : null })),
	getElapsedTime: () => fromStore.getStateSnapshot().timer?.getDiffMs() || null,
};
