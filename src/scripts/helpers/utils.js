import fromStore from '../store/store.js';
import { setTimer, updateClipTimePoint } from '../store/actions.js';

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
      // console.log({ id });
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

/**@param {HTMLElement} el  @param {HTMLElement} rootEl @param {number} clipDuration @param {number} clipId  */
export const addDragHandler = (el, rootEl, clipDuration, clipId) => {
  console.log({ rootEl });
  let isDown = false;
  let offset = 0;
  let elLeft = 0;
  let newTime = undefined;

  el.addEventListener('mousedown', OnMouseDown, true);
  document.addEventListener('mouseup', OnMouseUp, true);
  document.addEventListener('mousemove', OnMouseMove, true);
  el.ondrag = () => false;

  const slideId = +el.getAttribute('idx');

  /**@param {MouseEvent} e */ function OnMouseDown(e) {
    const { x } = e;
    isDown = true;
    offset = el.offsetLeft - x;
  }

  /**@param {MouseEvent} e */ function OnMouseUp(e) {
    if (!!!newTime) return;

    isDown = false;
    console.log({ newTime });

    el.removeEventListener('mousedown', OnMouseDown, true);
    document.removeEventListener('mouseup', OnMouseUp, true);
    document.removeEventListener('mousemove', OnMouseMove, true);
    return fromStore.dispatch(updateClipTimePoint({ clipId, slideId, time: newTime }));
  }

  /**@param {MouseEvent}e */ function OnMouseMove(e) {
    const { x } = e;
    e.preventDefault();
    if (!isDown) return;

    const { width: rootElWidth, right: rootElRight, left: rootElLeft } = rootEl.getBoundingClientRect();
    const { left: elCalcLeft, width: elWidth } = el.getBoundingClientRect();
    const elOffset = x + offset;

    const markerWidth = el.getBoundingClientRect().width;

    const durationPerPx = clipDuration / rootElWidth;

    const elRootLeftDiff = elCalcLeft - rootElLeft;
    if (elRootLeftDiff <= 0 && elLeft > elOffset) return;
    el.style.left = elOffset + 'px';
    elLeft = elOffset;
    newTime = Math.round(elOffset * durationPerPx * 1000);
  }
};
