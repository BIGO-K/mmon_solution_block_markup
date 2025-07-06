import { gsap } from 'gsap';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import Doms from '@src/script/doms';
import Datas from '@src/script/datas';
import Utils from '@src/script/utils';

const _selector = `[data-mui="rank_p_c=w0Xh11_s6_link_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	// 랭킹 캐러셀
	(() => {

		const $element = Doms.find(_selector)[0];
		const $ranking = Doms.find(`.m_ranking`, $element)[0];
		const $activeItem = Doms.find(`.m_ranking-active-item`, $ranking)[0];
		const $carousel = Doms.find(`.m_ranking-carousel`, $ranking)[0];
		const $list = Doms.find(`.m_ranking-carousel-list`, $carousel)[0];
		let $items = Doms.find(`.m_ranking-carousel-item`, $list);

		const $control = Doms.find(`.m_ranking-carousel-control`, $carousel)[0];
		const $btnPrev = Doms.find(`> .btn_carousel-prev`, $control)[0];
		const $btnNext = Doms.find(`> .btn_carousel-next`, $control)[0];
		const $count = Doms.find(`.m_ranking-carousel-count`, $carousel)[0];
		const $countIndex = Doms.find(`.text_carousel-index`, $count)[0];
		const $countTotal = Doms.find(`.text_carousel-total`, $count)[0];

		const _classOn = `S=on`;
		const _classClone = `S=clone`;

		const data: { _autoDelay: number } = Datas.clone({ _autoDelay: 0 }, Doms.data.get($carousel, `data-ranking`));
		let interval = NaN;

		// 캐러셀 on 아이템을 Active 아이템으로 append
		const activeItemChange = (__$item: HTMLElement): void => {

			let $clone = Doms.find(`> a`, __$item)[0].cloneNode(true);
			$activeItem.append($clone);

			if ($activeItem.childElementCount > 1) gsap.to($clone, { opacity: 1, duration: 0.3, onComplete: () => { $activeItem.children[0].remove(); } });

		}

		for (let [_i, $item] of $items.entries()) Doms.attribute($item, { [`data-ranking-index`]: _i + 1 });

		let $itemOn = $items[0];
		const $clone = $itemOn.cloneNode(true) as HTMLElement;
		// Prev 아이템 clone
		$clone.classList.add(_classClone);
		gsap.set($clone, { x: `-100%` });
		$list.prepend($clone);

		// on 아이템 next 위치로 이동
		$itemOn.classList.add(_classOn);
		$list.append($itemOn);
		activeItemChange($itemOn);

		gsap.set($list, { x: -110 });
		$items = Doms.find(`.m_ranking-carousel-item`, $list).filter(__$el => !__$el.classList.contains(_classClone));
		Lazyload.update(Doms.find(`[data-lazyload]:not(.S\\=loaded)`, $list), { _isForce: true });

		$countIndex.textContent = $itemOn.getAttribute(`data-ranking-index`);
		$countTotal.textContent = String($items.length);

		let _isChanging = false;
		// 캐러셀 전환
		const carouselChange = (__direction?: `next` | `prev`): void => {

			if (_isChanging) return;
			_isChanging = true;

			const _direction = (__direction) ? __direction : `next`;
			const $beforeItem = $itemOn; // change 이전 On 아이템
			$beforeItem.classList.remove(_classOn);

			let _index = Number($beforeItem.getAttribute(`data-ranking-index`));
			_index += (_direction === `prev`) ? -1 : 1;
			_index = (_index <= 0) ? 6 : (_index > $items.length) ? 1 : _index;

			$itemOn = Doms.find(`[data-ranking-index="${_index}"]`, $list)[0];
			gsap.to($list, { x: (_direction === `prev`) ? 0 : -220, duration: 0.15, ease: `sine.InOut`,

				onComplete: () => {

					$countIndex.textContent = String(_index);
					activeItemChange($itemOn);

				}
			});
			gsap.to((_direction === `prev`) ? $list.children[0] : $items[0], { x: (_direction === `prev`) ? 0 : `-100%`, duration: 0.6, ease: `Sine.in`,
				onComplete: () => {

					gsap.set($list, { x: -110 });

					const $clone = $itemOn.cloneNode(true) as HTMLElement;
					if (_direction === `prev`) {
						gsap.set($clone, { x: `-100%` });
						$list.prepend($beforeItem);
					}
					else {
						gsap.set($itemOn, { clearProps: `all` });
						$list.append($itemOn);
					}

					Doms.find(Utils.selector(`.${_classClone}`), $list)[0].remove();
					$itemOn.classList.add(_classOn);
					$clone.classList.add(_classClone);
					$list.prepend($clone);

					$items = Doms.find(`.m_ranking-carousel-item`, $list).filter(__$el => !__$el.classList.contains(_classClone));
					_isChanging = false;

				}
			});

		}

		// 자동롤링
		if (data._autoDelay > 0) {
			let _isFirst = true;

			const autoPlay = (): void => {

				let _delay = (_isFirst) ? data._autoDelay - 1 : data._autoDelay;
				interval = setInterval(() => {

					console.log(_isFirst);

					carouselChange();
					_isFirst = false;

				}, _delay * 1000);

			};
			autoPlay();

			// 마우스 오버 시 자동 롤링 멈춤
			Events.bind.on($carousel, `mouseenter`, () => {

				clearInterval(interval);
				interval = NaN;

				Events.bind.on($carousel, `mouseleave`, () => {

					autoPlay();
					Events.bind.off($carousel, `mouseleave`);

				});

			});
		}

		// 마우스 오버 시 중첩된 아이템 펼쳐짐
		Events.bind.on($items, `mouseenter`, __e => {

			let $beforeItems: ElementList = [];
			for (const $item of $items) {
				if ($item != __e.currentTarget) $beforeItems.push($item);
				else {
					gsap.to($item, { x: ``, duration: 0.3 });
					break;
				}
			}

			gsap.to($beforeItems, { x: -250, duration: 0.3, ease: `sine.out` });
			Events.bind.on($list, `mouseleave`, () => {

				gsap.to($beforeItems, { x: ``, duration: 0.3, ease: `sine.out`, onComplete: function () { Events.bind.off($list, `mouseleave`); } });

			});

		});

		// 컨트롤 클릭 이벤트
		const controlClickHandler = (__e: MouseEvent): void => {

			__e.preventDefault();
			carouselChange(((__e.currentTarget as HTMLElement) === $btnNext) ? `next` : `prev`);

		}
		Events.bind.on([$btnPrev, $btnNext], `click`, controlClickHandler);

	})();

	Lazyload.update(getDataSelector(`lazyload`));

});