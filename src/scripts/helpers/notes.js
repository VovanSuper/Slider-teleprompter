import { addDragHandler, playBtnSetInitial, playBtnToggleIcon } from './utils.js';
import createNoteCloserBtn from './closer-btn.js';

const getNoteByIndex = index => document.querySelector(`.note[idx="${index}"]`);

const renderClips = ({ clips }, rootEl) => {
	const notesEl = document.querySelector('.notes');
	clearNoteEls(notesEl);
	clips.forEach((clip, i) => renderNote(clip, notesEl, rootEl));
};

const renderNoteHtmlStruct = (clip, rootEl) => {
	let noteEl = document.createElement('section');
	let noteElHeader = document.createElement('header');
	let noteElFooter = document.createElement('footer');
	let noteElContent = document.createElement('div');
	let noteSlidesNamesEl = document.createElement('div');
	let noteClipEl = document.createElement('div');
	noteElHeader.classList.add('note-header');
	noteElFooter.classList.add('note-footer');
	noteElContent.classList.add('note-content');
	noteSlidesNamesEl.classList.add('note-slides', 'note-content__item');
	noteClipEl.classList.add('note-media', 'note-content__item');
	noteElContent.appendChild(noteSlidesNamesEl);
	noteElContent.appendChild(noteClipEl);
	noteElHeader.innerHTML = `<h1>Clip ${clip.id}</h1>`;
	noteEl.appendChild(noteElHeader);
	noteEl.appendChild(noteElContent);
	noteEl.appendChild(noteElFooter);
	noteEl.classList.add('note');
	noteEl.setAttribute('idx', clip.id);
	createNoteCloserBtn(noteEl, rootEl);
	return [noteEl, noteSlidesNamesEl, noteClipEl, noteElFooter];
};

const renderNote = (clip, notesEl, rootEl) => {
	const [noteEl, noteSlidesNamesEl, noteClipEl, noteElFooter] = renderNoteHtmlStruct(clip, rootEl);
	notesEl.appendChild(noteEl);

	if (!!clip.slides?.length) addNoteSlidesList(noteSlidesNamesEl, clip);

	if (!!clip.file) {
		const videoEl = addMediaElementToNote(noteClipEl, { ...clip });
		// const surfer = createWave(clip.data, noteElFooter, crateMarkers(clip.slides));
		const markers = !!clip.voiceEnd ? [...createSlidesMarkers(clip.slides)].concat(createEndMarker({ voiceEnd: clip.voiceEnd })) : createSlidesMarkers(clip.slides);
		const surfer = createWave(videoEl, noteElFooter, markers);
		let wavePlayBtn = document.createElement('button');
		playBtnSetInitial(wavePlayBtn);

		surfer.on('waveform-ready', () => {
			// surfer.on('ready', () => {
			surfer.on(
				'marker-click',
				/** @param {Event & {el:Element}} markerClkEv  */ markerClkEv => {
					surfer.isPlaying() && surfer.stop();
					markerClkEv.el.addEventListener(
						'mousemove',
						e => {
							e.preventDefault();
							e.stopImmediatePropagation();
						},
						true
					);
				}
			);

			const clipDuration = surfer.getDuration();
			const { markers } = surfer.markers;
			const surferRootEl = surfer.container.querySelector('wave > canvas');
			markers.filter(marker => marker.label.trim().toLowerCase() !== 'end').forEach(marker => addDragHandler(marker.el, surferRootEl, clipDuration, clip.id));

			let currentSlideImg = null;
			wavePlayBtn.addEventListener('click', surfer.playPause.bind(surfer));
			wavePlayBtn.addEventListener('click', function HandleWavePlayclick() {
				playBtnToggleIcon(wavePlayBtn);
				noteSlidesNamesEl.children.length && !!noteSlidesNamesEl.querySelector('.slides-names') && noteSlidesNamesEl.removeChild(noteSlidesNamesEl.querySelector('.slides-names'));
				if (!!clip.slides?.length && !currentSlideImg) {
					currentSlideImg = renderNoteSlideImg(noteSlidesNamesEl);
				}
				return () => wavePlayBtn.removeEventListener('click', HandleWavePlayclick);
			});
			surfer.on('play', e => console.log({ e, status: 'Playing' }));
			surfer.on('pause', e => console.log({ e, status: 'Paused' }));
			surfer.on('finish', e => console.log({ e, status: 'finish' }));
			surfer.on('finish', _ => playBtnSetInitial(wavePlayBtn));
			surfer.on('audioprocess', currentSeekSec => {
				const currentPlayBackTime = Math.round(currentSeekSec * 1000);
				const firstSlideImg = clip.slides[0].imgUrl;
				console.log({ firstSlideImg });
				clip.slides.forEach(slide => {
					if (slide.time <= currentPlayBackTime + 37) {
						const imgUrl = (!!slide.imgUrl && slide.imgUrl) || firstSlideImg;
						console.log({ slideId: slide.id, slideTIme: slide.time, slideImgUrl: imgUrl, currentPlayBackTime });
						setTimeout(() => renderNoteSlideCurrentImg(currentSlideImg, imgUrl), 100);
					}
				});
			});
		});
		noteElFooter.appendChild(wavePlayBtn);
	}
};

const addNoteSlidesList = (noteContentUl, clip) => {
	const { slides } = clip || {};
	try {
		const ulEl = document.createElement('ul');
		ulEl.classList.add('slides-names');
		(slides || []).forEach((slide, i) => {
			const liEl = document.createElement('li');
			const liSpan = document.createElement('span');
			liSpan.innerText = `Slide ${slide.id}`;
			liEl.appendChild(liSpan);
			ulEl.appendChild(liEl);
		});
		noteContentUl.appendChild(ulEl);
	} catch (e) {
		console.error('Error appending Slides names / Audio Element to parent');
		console.error(e);
	}
};

const renderNoteSlideImg = noteContentUl => {
	try {
		const ulEl = noteContentUl.querySelector('.slides-names');
		if (ulEl) {
			noteContentUl.removeChild(ulEl);
		}
		const imgContainer = document.createElement('div');
		imgContainer.classList.add('slides-images--container');
		const imgEl = document.createElement('img');
		imgEl.classList.add('slide-img');
		imgContainer.appendChild(imgEl);
		noteContentUl.appendChild(imgContainer);
		return imgEl;
	} catch (e) {
		console.error(e);
	}
};

const renderNoteSlideCurrentImg = (imgEl, imgUrl) => {
	imgEl.src = imgUrl;
};

const addMediaElementToNote = (nodeSlidesContainerEl, { file, id, ...rest }) => {
	// const video = window.URL.createObjectURL(data);
	// const video = URL.createObjectURL(new File([data], `Clip-${id}`));

	const video = URL.createObjectURL(file);
	const videoEl = document.createElement('video');
	// URL.revokeObjectURL(file);
	videoEl.controls = true;
	try {
		videoEl.src = video;
	} catch {
		videoEl.srcObject = video;
	}
	nodeSlidesContainerEl.appendChild(videoEl);
	return videoEl;
};

// const createWave = (blob, waveContainerEl, markers = []) => {
const createWave = (mediaEl, waveContainerEl, markers = []) => {
	const canvas = document.createElement('canvas');
	const { width } = waveContainerEl.getBoundingClientRect();
	const height = 75;
	canvas.style.visibility = 'collapsed';
	const ctx = canvas.getContext('2d');
	const waveColor = ctx.createLinearGradient(0, -height / 2, width, height);
	waveColor.addColorStop(0, '#3091c6');
	waveColor.addColorStop(1, '#2D2DC5');

	const wavesurfer = WaveSurfer.create({
		container: waveContainerEl,
		mediaControls: true,
		interact: true,
		mediaType: 'video',
		height,
		responsive: true,
		// waveColor: '#2D2DC5',
		waveColor,
		mediaControls: true,
		closeAudioContext: true,
		backend: 'MediaElement',
		plugins: [WaveSurfer.markers.create({ markers })],
	});
	// wavesurfer.loadBlob(blob);
	wavesurfer.load(mediaEl);
	return wavesurfer;
};

const createSlidesMarkers = slides => createMarkers(slides.map(slide => ({ idx: slide.id, position: 'top', color: 'var(--wave-marker-color)', label: `Slide ${slide.id}`, time: slide.time / 1000 })));
const createEndMarker = ({ voiceEnd }) => createMarkers({ position: 'top', color: 'var(--wave-end-marker-color)', label: 'End', time: voiceEnd / 1000 });

/** @param {Array<object>} markers */
const createMarkers = markers => {
	const getMarker = ({ time, idx = undefined, index = undefined, label = 'End', color = 'var(--wave-end-marker-color)', position = 'top' }) => ({
		time,
		idx,
		label,
		color,
		position,
		markerId: index,
	});
	return Array.isArray(markers) ? markers.map((marker, index) => getMarker({ ...marker, index })) : { ...getMarker(markers) };
};

const clearNoteEls = notesEl => {
	!!notesEl.children.length && Array.from(notesEl.children).forEach(child => notesEl.removeChild(child));
};

export { getNoteByIndex, renderClips };
