import fromStore from '../store/store.js';
import { setCurrentSlide } from '../store/actions.js';
import { readBespokeCurrentSlideIndex, timeFuncs } from './utils.js';

const { getElapsedTime } = timeFuncs;
// Opt in to slider buttons clicks events
const nextBtn = document.querySelector('button[data-bespoke-marp-osc="next"]');
const prevBtn = document.querySelector('button[data-bespoke-marp-osc="prev"]');

window.addEventListener('keysEvent', (e) => {
  if (!!e) {
    dispatchCurrentSlideIndex();
  }
});

function optToSliderButtons() {
  [nextBtn, prevBtn].forEach(
    /**
     *
     * @param {HTMLButtonElement} btn
     */
    (btn) => {
      btn.addEventListener('click', (e) => {
        if (!!e) {
          dispatchCurrentSlideIndex();
        }
      });
    }
  );
}

let currSlideIdx = undefined;

function dispatchCurrentSlideIndex() {
  readBespokeCurrentSlideIndex().then(({ id }) => {
    if (!!!currSlideIdx || currSlideIdx !== id) {
      fromStore.dispatch(setCurrentSlide({ id, time: getElapsedTime() }));
    }
    currSlideIdx = id;
  });
}

export { optToSliderButtons, dispatchCurrentSlideIndex };
