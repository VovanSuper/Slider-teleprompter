import fromStore from '../store/store.js';
import { setCurrentSlide } from '../store/actions.js';
import { readBespokeCurrentSlideIndex, timeFuncs } from './utils.js';

const { getElapsedTime } = timeFuncs;
// Opt in to slider buttons clicks events (including buttons in Presentation mode)
const nextBtn = document.querySelector('button[data-bespoke-marp-osc="next"]');
const prevBtn = document.querySelector('button[data-bespoke-marp-osc="prev"]');
const nextBtnPresenter = document.querySelector('.bespoke-marp-presenter-info-page > button.bespoke-marp-presenter-info-page-next');
const prevBtnPresenter = document.querySelector('.bespoke-marp-presenter-info-page > button.bespoke-marp-presenter-info-page-prev');

window.addEventListener('keysEvent', (e) => {
  if (!!e) {
    dispatchCurrentSlideIndex();
  }
});

function optToSliderButtons() {
  [nextBtn, prevBtn, nextBtnPresenter, prevBtnPresenter].forEach((btn) => {
    !!btn &&
      btn.addEventListener('click', (e) => {
        if (!!e) {
          dispatchCurrentSlideIndex();
        }
      });
  });
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
