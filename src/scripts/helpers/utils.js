import fromStore from '../store/store.js';
import { setTimer } from '../store/actions.js';

const MARP_BESPOKE_KEY_FROM_HISTORY = window.history?.state?.marpBespokeSyncKey;
const currentSlideLSSubKey = !!MARP_BESPOKE_KEY_FROM_HISTORY ? `bespoke-marp-sync-${MARP_BESPOKE_KEY_FROM_HISTORY}` : 'bespoke-marp-sync-';

// const getCurrentBespokeIndex = () => bespoke.from('#p').slide();

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
      const id = !!data && !!data['index'] ? parseInt(data['index']) + 1 : 1;
      // const id = parseInt(getCurrentBespokeIndex()) + 1 || 1;
      console.log({ id });
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
