import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="live_b_c=w6Xh10_s1_sideLink"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	const carouselUIs = Carousel.update(getDataSelector(`carousel`));
	Lazyload.update(getDataSelector(`lazyload`));

	for (const ui of carouselUIs) {
		const $items = Doms.find(`.mui_carousel-item`, ui.$element);
		const $originItems = $items.filter(__$el => !__$el.classList.contains(`S=clone`));
		const $progressBar = Doms.find(`.mui_carousel-progress-bar`, ui.$element)[0];
		const _barWidth = 100 / $originItems.length;

		if ($originItems.length < 2) {
			$progressBar.remove();
			continue;
		}

		Doms.style($progressBar, { width: `${_barWidth}%` });

		const carouselObserverHandler = (__e: CustomEvent): void => {

			Doms.style($progressBar, { width: `${_barWidth * (ui.realIndex + 1)}%` });

		}
		Events.observer.on(ui.$element, `ITEM_CAROUSEL_CHANGED`, carouselObserverHandler);
	}

});

declare global {
	interface Window {
		carouselProgress: (__package: { _isBack: boolean }) => void;
	}
}

window.carouselProgress = (__package: { _isBack: boolean }): void => {

	if (!__package._isBack) Events.observer.call(`ITEM_CAROUSEL_CHANGED`, { _isLocal: true });

}