import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';
import Doms from '@src/script/doms';

const _selector = `[data-mui="b_c=w0Xh9_s2_sidePager"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Carousel.update(getDataSelector(`carousel`));
	Lazyload.update(getDataSelector(`lazyload`));

	(() => {

		const $element = Doms.find(_selector).filter(__$el => !__$el.classList.contains(`mui_modal`));
		const $carousel = Doms.find(`.mui_carousel`, $element)[0];
		const $btnMore = Doms.find(`.btn_more`, $element)[0];
		const $muiModal = Doms.find(`.mui_modal${_selector}`)[0];

		const _classOn = `S=on`;

		Events.bind.on($btnMore, `click`, __e => {

			__e.preventDefault();

			const $clone = $muiModal.cloneNode(true) as HTMLElement;
			const $banners = Doms.find(`ul > li`, Doms.find(`.mui_carousel-item`, $carousel).filter(__$el => !__$el.classList.contains(`S=clone`)));
			const $ul = Doms.create(`<ul></ul>`)[0] as Element;

			for (const $item of $banners) $ul.append($item.cloneNode(true) as HTMLElement);

			Doms.find(`.mm_scroller`, $clone)[0].append($ul);
			Doms.find(`body`)[0].append($clone);

			Lazyload.update(Doms.find(getDataSelector(`lazyload`), $clone));
			$clone.classList.add(_classOn);

			Events.bind.on(Doms.find(`.btn_close`, $clone)[0], `click`, __e => {

				__e.preventDefault();
				$clone.remove();

			});

		});

	})();;

});