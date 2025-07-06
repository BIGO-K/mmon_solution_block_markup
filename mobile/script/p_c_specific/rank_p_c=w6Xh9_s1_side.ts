import { gsap } from 'gsap';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';
import Doms from '@src/script/doms';

const _selector = `[data-mui="rank_p_c=w6Xh9_s1_side"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Carousel.update(getDataSelector(`carousel`), { onReady: carouselStartHandler, onStart: carouselStartHandler });
	Lazyload.update(getDataSelector(`lazyload`));

});

const _classActive = `S=active`;
/** 캐러셀 아이템 크기 및 높이 변경 */
const carouselStartHandler = (__package: { ui: Carousel }): void => {

	const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
	const $activeItem = $items[__package.ui.index];

	Doms.class.remove(Doms.find(`.${_classActive}`, __package.ui.$element), _classActive);
	$activeItem.classList.add(_classActive);

	gsap.to($items.map(__$el => __$el.firstElementChild), { width: `88.41463%`, y: `5.79268%`, x: 0, duration: 0.4, ease: `cubic.out` });
	gsap.to($activeItem.firstElementChild, { width: `100%`, y: 0, duration: 0.2, ease: `cubic.out`, overwrite: true,
		onComplete: () => {
			gsap.to($activeItem.firstElementChild, { duration: 0.2, ease: `sine.out`  });
			gsap.to(Doms.find(`.mui_carousel-list`, __package.ui.$element)[0], { height: $activeItem.offsetHeight, duration: __package.ui.data._time, ease: `cubic.out` });
		}
	});

}