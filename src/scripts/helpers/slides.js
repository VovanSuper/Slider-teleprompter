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
  readBespokeCurrentSlideIndex()
    .then(({ id }) => {
      if (!!!currSlideIdx || currSlideIdx !== id) {
        const imgUrl = getSlideImgById(id);
        fromStore.dispatch(setCurrentSlide({ id, time: getElapsedTime(), imgUrl }));
      }
      currSlideIdx = id;
    })
    .catch((e) => console.error(e))
    .finally(() => {
      const { clips } = fromStore.getStateSnapshot();
      clips.forEach((clip) => {
        clip.slides.forEach((slide) => {
          if (!slide.imgUrl) {
            console.log('NO URL FOR slide::: ', slide);
            setTimeout(() => {
              const url = getSlideImgById(slide.id);
              console.log({ newURL: url });
              slide.imgUrl = url;
            }, 500);
          }
        });
      });
    });
}

const getSlideImgById = (id) => {
  const p = document.getElementById('p');
  const currentSlideImg = p && p.querySelector(`svg > foreignObject > section[id="${id}"] > p > img`);
  const imgUrl = (currentSlideImg && currentSlideImg.src) || null;
  // if (!!!imgUrl) {
  //   setTimeout(() => {
  //     const url = getSlideImgById(id);
  //     console.log({ url });
  //   }, 250);
  // }
  console.log({ p, currentSlideImg, imgUrl });
  return imgUrl;
};

export { optToSliderButtons, dispatchCurrentSlideIndex };
