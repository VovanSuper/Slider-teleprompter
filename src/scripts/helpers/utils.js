import fromStore from "../store/store.js";
import { setCurrentSlide } from "../store/actions.js";


const currentSlideLSSubKey = 'bespoke-marp-sync-';

const getBespokeLSKey = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(currentSlideLSSubKey)) {
      return key;
    }
  }
};

export const readLocalStorageBespokeData = () => JSON.parse(localStorage.getItem(getBespokeLSKey()));

export const readBespokeCurrentSlideIndex = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = readLocalStorageBespokeData();
      const id = data['index'] ? data['index'] + 1 : 1;
      return resolve({ id });
    }, 1);
  });
};

export const getStatusBoxEl = () => document.querySelector('#status_box');

// Opt in to slider buttons clicks events
const nextBtn = document.querySelector('button[data-bespoke-marp-osc="next"]');
const prevBtn = document.querySelector('button[data-bespoke-marp-osc="prev"]');

export function optToSliderButtons() {
  [nextBtn, prevBtn].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!!e) {
        dispatchCurrentSlideIndex();
      }
    });
  });
}

export function dispatchCurrentSlideIndex() {
  readBespokeCurrentSlideIndex().then(({ id }) => {
    return fromStore.dispatch(setCurrentSlide({ id }));
  });
}
