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
      const currentSlideIndex = data['index'] || 0;
      return resolve({ id: currentSlideIndex });
    });
  });
};

export const getStatusBoxEl = () => document.querySelector('#status_box');
