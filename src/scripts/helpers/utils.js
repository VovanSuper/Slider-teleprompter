import fromStore from '../store/store.js';
import { setTimer } from '../store/actions.js';

const currentSlideLSSubKey = 'bespoke-marp-sync-';

const getBespokeLSKey = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(currentSlideLSSubKey)) {
      return key;
    }
  }
};

const readLocalStorageBespokeData = () => JSON.parse(localStorage.getItem(getBespokeLSKey()));

export const readBespokeCurrentSlideIndex = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = readLocalStorageBespokeData();
      const id = !!data && !!data['index'] ? data['index'] + 1 : 1;
      return resolve({ id });
    }, 1);
  });
};

export const getStatusBoxEl = () => document.querySelector('#status_box');

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
  setStoreTimer: (isNewUp) => {
    fromStore.dispatch(setTimer({ timer: isNewUp ? createTimer() : null }));
  },
  getElapsedTime: () => fromStore.getStateSnapshot().timer?.getDiffMs() || null,
};
