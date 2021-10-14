const MARP_BESPOKE_KEY_FROM_HISTORY = window.history?.state?.marpBespokeSyncKey;
const currentSlideLSSubKey = !!MARP_BESPOKE_KEY_FROM_HISTORY ? `bespoke-marp-sync-${MARP_BESPOKE_KEY_FROM_HISTORY}` : 'bespoke-marp-sync-';

const getBespokeLSKey = () => {
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith(currentSlideLSSubKey)) return key;
	}
};

const readLocalStorageBespokeData = () => JSON.parse(localStorage.getItem(getBespokeLSKey())) || undefined;

export const readBespokeCurrentSlideIndex = () => {
	return new Promise(resolve =>
		setTimeout(() => {
			const data = readLocalStorageBespokeData();
			const id = !!data && !!data['index'] ? parseInt(data['index']) + 1 : 1;
			return resolve({ id });
		}, 1)
	);
};
