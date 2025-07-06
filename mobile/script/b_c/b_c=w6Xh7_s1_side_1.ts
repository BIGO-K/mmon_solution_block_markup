import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';
import { gsap } from 'gsap';

const _selector = `[data-mui="b_c=w6Xh7_s1_side_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Carousel.update(getDataSelector(`carousel`), { onReady: carouselReadyHandler, onStart: carouselStartHandler });
	Lazyload.update(getDataSelector(`lazyload`));

});

const _classActive = `S=active`;

const carouselReadyHandler = (__package: { ui: Carousel }): void => {

	const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
	// const $originItems = Doms.find(`.mui_carousel-item:not([class*=clone])`, __package.ui.$element);
	const $activeItem = $items[__package.ui.index];
	const $pagination = Doms.find(`.m_pagination`, __package.ui.$element)[0];
	const _classOn = `S=on`;
	const _classFade = `S=fade-on`;

	const $ol = Doms.create(`<ol></ol>`)[0] as Element;
	$pagination.append($ol);

	for (let [_i, $item] of $items.entries()) {

		const $li = Doms.create(`<li><button type="button" class="btn_page"><b class="mui_ir-blind">${_i + 1}</b></button></li>`)[0] as Element;
		if (__package.ui.index === _i)  Doms.find(`.btn_page`, $li)[0].classList.add(_classOn);

		if (!$item.classList.contains('S=clone')) {
			$ol.append($li);

			if (_i === 7) {
				$li.classList.add(_classFade);

				break;
			}
		}

	}

	gsap.set($items.map(__$el => __$el.firstElementChild), { width: `100%`, y: `5.06756%`, x: 0 });
	gsap.set($activeItem.firstElementChild, { width: `113.51351%`, y: 0, x: `-5.95238%` });
	gsap.set(Doms.find(`.mui_carousel-list`, __package.ui.$element)[0], { height: $activeItem.offsetHeight, duration: __package.ui.data._time, ease: `cubic.out` });

};

/** 캐러셀 아이템 크기 및 높이 변경 */
const carouselStartHandler = (__package: { ui: Carousel, _isBack: boolean }): void => {

	if (__package._isBack)  return; // 캐러셀 변경 없을 경우 return

	const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
	const $activeItem = $items[__package.ui.index];

	const _classOn = `S=on`;
	const _classFade = `S=fade-on`;

	let _direction = (__package.ui.index - __package.ui.oldIndex < 0) ? 'prev' : 'next';
	if (__package.ui.oldIndex === $items.length - 1 && __package.ui.index === 0) _direction = 'next';
	else if (__package.ui.index === $items.length - 1 && __package.ui.oldIndex === 0) _direction = 'prev';

	const $ol = Doms.find('.m_pagination ol', __package.ui.$element)[0];
	const $li = Doms.create(`<li><button type="button" class="btn_page"><b class="mui_ir-blind">${__package.ui.realIndex + 1}</b></button></li>`)[0] as Element;

	// 페이지네이션 index
	const $pagination = Doms.find(`.m_pagination li`, __package.ui.$element);
	const _paginationOldIndex = $pagination.indexOf(Doms.find(`.${_classOn}`, $pagination)[0].parentElement as HTMLElement);
	const _paginationIndex = (_direction === 'next') ? _paginationOldIndex + 1 : (_paginationOldIndex === 0) ? $pagination.length - 1 : _paginationOldIndex - 1;

	if ($pagination.length > 6) {
		switch (_direction) {
			case 'next':
				if (__package.ui.realIndex === 0) {
					$pagination[0].classList.remove(_classFade);
					$pagination[$pagination.length - 1].classList.add(_classFade);
				}

				if (_paginationIndex === 6) {
					if (__package.ui.realIndex < $items.length - 1) $pagination[$pagination.length - 1].classList.remove(_classFade);
					if (__package.ui.realIndex < $items.length - 2) {
						$ol.append($li);
						$li.classList.add(_classFade);

						gsap.to($ol, { x: `-8px`, duration: 0.2, ease: `cubic.out`,
							onStart: () => {

								Doms.find(`.m_pagination li`, __package.ui.$element)[1].classList.add(_classFade);

							},
							onComplete: () => {

								Doms.find(`.m_pagination li`, __package.ui.$element)[0].remove();
								gsap.set($ol, { x: 0 });

							}
						});
					}
				}

				break;

			case 'prev':
				if (_paginationIndex === $pagination.length - 1) {
					$pagination[_paginationIndex].classList.remove(_classFade);
					$pagination[0].classList.add(_classFade);
				}

				if (_paginationIndex === 1) {
					if (__package.ui.realIndex <= 1) $pagination[0].classList.remove(_classFade);
					else {
						$pagination[0].classList.remove(_classFade);
						$ol.prepend($li);
						$li.classList.add(_classFade);

						gsap.set($ol, { x: `-8px` });
						gsap.to($ol, { x: `0`, duration: 0.2, ease: `cubic.out`,
							onStart: () => {

								Doms.find(`.m_pagination li`, __package.ui.$element)[$pagination.length - 1].classList.add(_classFade);

							},
							onComplete: () => {

								Doms.find(`.m_pagination li`, __package.ui.$element)[$pagination.length].remove();
								gsap.set($ol, { x: 0 });

							}
						});
					}
				}

				break;
		}
	}

	Doms.class.remove(Doms.find(`.${_classOn}`, $pagination), _classOn);
	Doms.find(`.btn_page`, $pagination[_paginationIndex])[0].classList.add(_classOn);

	// 전환 시 가운데 Carousel item 확대
	Doms.class.remove(Doms.find(`.${_classActive}`, __package.ui.$element), _classActive);
	$activeItem.classList.add(_classActive);

	gsap.to($items.map(__$el => __$el.firstElementChild), { width: `100%`, y: `5.06756%`, x: 0, duration: 0.4, ease: `cubic.out` });
	gsap.to($activeItem.firstElementChild, { width: `113.51351%`, y: 0, x: `-5.95238%`, duration: 0.2, ease: `cubic.out`, overwrite: true,
		onComplete: () => {

			gsap.to(Doms.find(`.mui_carousel-list`, __package.ui.$element)[0], { height: $activeItem.offsetHeight, duration: __package.ui.data._time, ease: `cubic.out` });

		}
	});

}