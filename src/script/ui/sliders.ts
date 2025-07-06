/**
 * @class 캐러셀, 슬라이더
 * @constructor
 * @static
 */

import { gsap } from 'gsap';
import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Is from '../is';
import Pages from '../pages';
import Times from '../times';
import Utils from '../utils';
import BaseUI from './baseUI';
import Lazyload from './Lazyload';

/** @class 캐러셀 */
class Carousel extends BaseUI {

	public data: Required<CarouselData> = {
		_index: 0,
		_orientation: `horizontal`,
		_effect: `slide`,
		_time: 0.2,
		_autoDelay: 0,
		_sensitiveTime: 0.23,
		_isAutoHeight: false,
		_isMoreSide: false,
		_isErrorRemove: false,
		_isGroup: false,
		_classOn: `S=on`,
		_classClone: `S=clone`,
		pagination: {
			_isInner: true,
			_selector: `.btn_carousel-page`,
		},
		control: {
			_isInner: true,
			_selectorPrev: `.btn_carousel-prev`,
			_selectorNext: `.btn_carousel-next`,
		},
		count: {
			_isInner: true,
			_padStyle: `0`,
			_selector: `.${this._prefix}carousel-count`,
		},
		onReady: null,
		onReadyParams: [],
		onUpdate: null,
		onUpdateParams: [],
		onStart: null,
		onStartParams: [],
		onComplete: null,
		onCompleteParams: [],
	};

	public get index(): number { return this._index; }
	/** 클론을 제외한 실제 인덱스 */
	public get realIndex(): number { return (this.$items[this._index].classList.contains(this.data._classClone)) ? this._index - this.$items.filter(__$el => !__$el.classList.contains(this.data._classClone)).length : this._index; }
	public get oldIndex(): number { return this._oldIndex; }

	private _index: number;
	private _oldIndex: number;
	/** 모션 중 변경되는 값 */
	private _updateValue: number;
	/** 모션 방향 */
	private _direction: `next` | `prev`;
	/** 모션 방향이 같음(mui_page.ts에서 iframe 내부 스크롤에서도 사용) */
	private _isDirection?: boolean;
	/** 자동 롤링 */
	private interval: number = NaN;
	// 요소
	private $inner: HTMLElement;
	private $items: ElementList = [];
	private $pages: ElementList = [];
	private $count: HTMLElement;
	private $btnPrev: HTMLElement;
	private $btnNext: HTMLElement;

	constructor(__$element: HTMLElement, __data?: CarouselData) {

		super(__$element, `carousel`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

		this.$inner = Doms.find(`> .${this._prefix}carousel-inner`, this.$element)[0];
		this.$items = Doms.find(`> * > ${this.data._isGroup ? '* > ' : ''}.${this._prefix}carousel-item`, this.$inner);
		this.$pages = (this.data.pagination._isInner) ? Doms.find(`> .${this._prefix}carousel-pagination ${this.data.pagination._selector}`, this.$element) : Doms.find(this.data.pagination._selector);
		this.$count = (this.data.count._isInner) ? Doms.find(`> ${this.data.count._selector}`, this.$element)[0] : Doms.find(this.data.count._selector)[0];
		this.$btnPrev = (this.data.control._isInner) ? Doms.find(`> .${this._prefix}carousel-control ${this.data.control._selectorPrev}`, this.$element)[0] : Doms.find(this.data.control._selectorPrev)[0];
		this.$btnNext = (this.data.control._isInner) ? Doms.find(`> .${this._prefix}carousel-control ${this.data.control._selectorNext}`, this.$element)[0] : Doms.find(this.data.control._selectorNext)[0];

		this._index = this._oldIndex = (this.data._index > this.$items.length - 1 || this.data._index < 0) ? 0 : this.data._index;
		this._updateValue = 0;
		this._direction = `next`;

		// 이미지 프리로드, 오류 아이템 삭제
		if (this.data._isErrorRemove || this.data._isAutoHeight) {
			const $loadItems = Doms.find(`[data-lazyload]`, this.$element);
			let _loadCount = 0;

			const lazyCheck = (__$element: HTMLElement, __isRemove: boolean): void => {

				if (__isRemove) __$element.closest(`.${this._prefix}carousel-item`)?.remove();// 오류 아이템 삭제
				if (++_loadCount === $loadItems.length) this.init();

			}

			for (const $el of $loadItems) {
				let lazyUI: Lazyload | undefined;
				try {
					lazyUI = new Lazyload($el);
				}
				catch (__e) {
					const error = __e as UIError<Lazyload>;
					lazyUI = error.ui;
				}
				if (lazyUI == null) continue;
				if (Doms.class.some($el, [Lazyload.CLASS_LOADED, Lazyload.CLASS_ERROR])) {
					lazyCheck($el, $el.classList.contains(Lazyload.CLASS_ERROR));
					continue;
				}

				lazyUI.data.onComplete = lazyUI.data.onError = (__package: { ui: Lazyload }, __is: boolean): void => {

					lazyCheck($el, !__is && this.data._isErrorRemove);

				};
				lazyUI.data.onCompleteParams = [true];
				lazyUI.data.onErrorParams = [false];

				lazyUI.force();
			}
		}
		else {
			Lazyload.update(Doms.find(`[data-lazyload]`, __$element));
			this.init();
		}

	}

	/**
	 * * 해제
	 */
	public destroy(): void {

		this.stop();
		gsap.killTweensOf(this);

		Doms.data.set<CarouselData>(this.$element, this._name, { _index: this.realIndex });// 이전 인덱스 값 data-x 속성에 저장

		for (const $el of this.$items) {
			if ($el.classList.contains(this.data._classClone)) $el.remove();
			else {
				$el.removeAttribute(`style`);
				Events.bind.off(this.$inner, (Is.mobile()) ? `touchstart touchend` : `mousedown mouseover mouseleave`);//, `touchStartHandler`);
				Events.bind.off([this.$btnPrev, this.$btnNext], `click`);//, `controlClickHandler`);
				Events.bind.off(this.$pages, `click`);//, `paginationClickHandler`);
			}
		}

		Pages.ui.remove(this);

	}

	/**
	 * * 변경
	 * @param __index
	 * @param __direction
	 * @param __isBack - 변경 안함
	 */
	public change(__index: number, __direction?: `next` | `prev`, __isBack?: boolean): void {

		if (__index === this._index || gsap.isTweening(this)) return;// __index가 같거나 모션 중에는 리턴

		this._direction = (__direction != null) ? __direction : (this._index > this._oldIndex) ? `next` : `prev`;
		if (Math.abs(this._updateValue) === 1) this._updateValue = 0;// 드래그가 아닐 때는 초기화 후 변경

		gsap.to(this, { _updateValue: (__isBack === true) ? 0 : (this._direction === `next`) ? 1 : -1,
			duration: this.data._time,
			ease: (typeof __isBack === `boolean`) ? `cubic.out` : (this.data._effect === `fade`) ? `sine.out` : `sine.inOut`,
			onUpdate: () => {

				const args: Parameters<typeof this.changeUpdate> = (__isBack) ? [__index, this._index] : [this._index, this._oldIndex];
				this.changeUpdate(...args);

			},
			onStart: () => {

				if (!__isBack) {
					this._oldIndex = this._index;
					this._index = __index;

					Doms.hide(this.$items.filter((__$el, __i) => __i !== this._oldIndex && __i !== this._index));
					Doms.show(this.$items[this._index]);

					this.setValue();
				}

				Utils.apply(this.data.onStart, [{ ui: this, _isBack: __isBack }, ...this.data.onStartParams]);

			},
			onComplete: () => {

				this.reposition();
				Utils.apply(this.data.onComplete, [{ ui: this, _isBack: __isBack }, ...this.data.onCompleteParams]);

			}
		});

	}

	/**
	 * * 자동 높이
	 * @params __time - 변경 시간(초)으로 0은 모션없이 바로 적용
	 */
	public resize(__time?: number): void {

		if (this.data._isAutoHeight) gsap.to(Doms.find(`.${this._prefix}carousel-list`, this.$element)[0], { height: this.$items[this._index].offsetHeight, duration: (__time != null && __time >= 0) ? __time : this.data._time, ease: `cubic.out` });

	}

	/**
	 * * 자동 롤링 시작
	 */
	public play(): void {

		this.stop();

		if (this.data._autoDelay > 0) {
			this.interval = setInterval(() => {

				let _index = this._index + 1;
				if (_index > this.$items.length - 1) _index = 0;
				this.change(_index, `next`);

			}, this.data._autoDelay * 1000);
		}

	}

	/**
	 * * 자동 롤링 정지
	 */
	public stop(): void {

		clearTimeout(this.interval);
		this.interval = NaN;

	}

	/**
	 * * 실행
	 */
	private init(): void {

		if (this.$items.length === 0) return this.destroy();

		// update가 적용될 때 figcaption 노출
		this.$element.classList.add(`S=ready`);

		// 요소가 1개일 때
		if (this.$items.length === 1) {
			this.$items[0].classList.add(this.data._classOn);
			this.$count?.remove();
			this.$btnPrev?.parentElement?.remove();
			this.$pages[0]?.closest(`.${this._prefix}carousel-pagination`)?.remove();

			this.setValue();
			Utils.apply(this.data.onReady, [{ ui: this }, ...this.data.onReadyParams]);
			return;
		}

		// 부족한 개수 복제
		if (this.$items.length === 2 || (this.data._effect === `slide` && this.$items.length === 3)) {
			for (const $el of this.$items) {
				if ($el.parentElement?.classList.contains(`${this._prefix}carousel-group`)) continue;

				const $clone = $el.cloneNode(true) as HTMLElement;
				$clone.classList.remove(this.data._classOn);
				$clone.classList.add(this.data._classClone);
				$clone.setAttribute(`tabindex`, `-1`);

				$el.parentElement?.append($clone);

				const $lazies = Doms.find(`[data-lazyload]`, $clone);
				Lazyload.destroy($lazies);
				Lazyload.update($lazies);
			}
			this.$items = Doms.find(`.${this._prefix}carousel-item`, this.$element);// 클론 포함 저장
		}

		this.reposition();
		this.setValue();

		// touch
		const touchStartHandler = (__e: (TouchEvent | MouseEvent) & Record<`detail`, any>): void => {

			this._isDirection = undefined;

			if (gsap.isTweening(this)) return;// 모션 중에는 리턴
			if (__e instanceof MouseEvent) __e.preventDefault();

			this.stop();

			const _stampKey = `${this._name}${Date.now()}`;
			Times.stamp.on(_stampKey);

			// 아이프레임 내부에서 터치 시 __e.detail.touches로 값 전달
			const startTouch: Record<`screenX` | `screenY`, number> = (__e instanceof TouchEvent) ? (__e.detail instanceof Object && __e.detail.touches != null) ? __e.detail.touches[0] : __e.touches[0] : { screenX: __e.clientX, screenY: __e.clientY };
			let _touchCount = 0;// 터치 이벤트 실행 감도(순간 터치 시 이동 방지)

			const touchMoveEndHandler = (__e: Parameters<typeof touchStartHandler>[0]): void => {

				if (__e instanceof MouseEvent) __e.preventDefault();

				const touch: typeof startTouch = (__e instanceof TouchEvent) ? (__e.detail != null && __e.detail.touches) ? __e.detail.touches[0] : (__e.type === `touchend`) ? __e.changedTouches[0] : __e.touches[0] : { screenX: __e.clientX, screenY: __e.clientY };
				const innerTouchOff = () => {

					Events.bind.off(document, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, touchMoveEndHandler);
					this.play();

				}

				if (this._isDirection == null) {
					const _x = Math.abs(touch.screenX - startTouch.screenX);
					const _y = Math.abs(touch.screenY - startTouch.screenY);
					const _limit = 1.5;

					if (this.data._orientation === `horizontal` && _x / _y > _limit) this._isDirection = true;
					else if (this.data._orientation === `vertical` && _y / _x > _limit) this._isDirection = true;
					else innerTouchOff();
				}
				else if (this._isDirection) {
					__e.preventDefault();

					this._updateValue = (this.data._orientation = `horizontal`) ? (startTouch.screenX - touch.screenX) / this.$inner.offsetWidth : (startTouch.screenY - touch.screenY) / this.$inner.offsetHeight;

					let _index = (this._updateValue > 0) ? this._index + 1 : this._index - 1;
					this._direction = (_index > this._index) ? `next` : `prev`;
					_index = (_index < 0) ? this.$items.length - 1 : (_index > this.$items.length - 1) ? 0 : _index;

					switch (__e.type) {
						case `touchmove`:
						case `mousemove`:
							this.changeUpdate(_index, this._index);
							break;
						case `touchend`:
						case `mouseup`:
							const _touchTime = Times.stamp.off(_stampKey) / 1000;// 빠른 드래그 확인
							const _threshold = (_touchCount > 1 && _touchTime < this.data._sensitiveTime) ? 0.005 : 0.5;// 화면의 0.5% : 50%

							this.change(_index, this._direction, Math.abs(this._updateValue) < _threshold);
							break;
					}

					_touchCount++;
				}

				if ([`touchend`, `mouseup`].includes(__e.type)) innerTouchOff();

			}
			Events.bind.on(document, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, touchMoveEndHandler);

		}
		Events.bind.on(this.$inner, (Is.mobile()) ? `touchstart` : `mousedown`, touchStartHandler);

		// 이동 중 클릭 이벤트 실행 방지
		const clickCancelHandler = (__e: Event): void => {

			if (this._isDirection) {
				__e.preventDefault();
				__e.stopPropagation();
			}

		}
		Events.bind.on(this.$inner, `click`, clickCancelHandler, { _isCapture: true });

		// 내부 스크롤 요소에서는 드래그 방지(단, 페이지로 사용하기 위해 item 자식 스크롤 요소는 제외)
        const scrollerHandler = (__e: TouchEvent | MouseEvent, __data: unknown, __$element: HTMLElement): void => {

			if ((__$element as HTMLElement).classList.contains(`T=x`)) {
                __e.stopPropagation();
                this._isDirection = undefined;// inner의 touchstart보다 먼저 실행, 스크롤 요소가 없는 아이템이 있어 undefined 추가 적용
            }

        }
        Events.delegate.on(this.$items, `.mm_scroller, .mui_scroller`, (Is.mobile()) ? `touchstart` : `mousedown`, scrollerHandler);

		// control
		const controlClickHandler = (__e: MouseEvent): void => {

			__e.preventDefault();

			let _index = this._index;
			const _direction: typeof this._direction = ((__e.currentTarget as HTMLElement).matches(this.data.control._selectorNext!)) ? `next` : `prev`;

			if (_direction === `next`) {
				_index++;
				if (_index > this.$items.length - 1) _index = 0;
			}
			else {
				_index--;
				if (_index < 0) _index = this.$items.length - 1;
			}

			this.change(_index, _direction);


		}
		Events.bind.on([this.$btnPrev, this.$btnNext], `click`, controlClickHandler);

		// pagination
		const paginationClickHandler = (__e: MouseEvent): void => {

			__e.preventDefault();

			const _index = this.$pages.findIndex(__$el => __$el === __e.currentTarget);
			if (_index !== this._index) this.change(_index, (_index > this._index) ? `next` : `prev`);

		}
		Events.bind.on(this.$pages, `click`, paginationClickHandler);

		// autoplay
		if (this.data._autoDelay > 0) {
			const intervalControlHandler = (__e: Event): void => {

				switch (__e.type) {
					case `touchstart`:
					case `mouseover`:
						this.stop();
						break;
					case `touchend`:
					case `mouseleave`:
						this.play();
						break;
				}

			}
			Events.bind.on(this.$element, (Is.mobile()) ? `touchstart touchend` : `mouseover mouseleave`, intervalControlHandler);

			// 노출 여부에 따라 play/stop
			const uiIntersectionHandler = (__entry: IntersectionObserverEntry, __data: ObjectCollection | undefined, __io:IntersectionObserver): void => {

				if (__entry.isIntersecting) {
					if (this.interval === -1) this.play();
				}
				else {
					if (!Number.isNaN(this.interval)) {
						this.stop();
						this.interval = -1;
					}
				}

			}
			Events.intersection.on(this.$element, uiIntersectionHandler);

			this.play();
		}

		Utils.apply(this.data.onReady, [{ ui: this }, ...this.data.onReadyParams]);

	}

	/** 모션 타입 별 실행 함수 */
	private changeApplyMap: CarouselDirectionMap = {
		horizontal: {
			slide: (__$items: HTMLElement[], __isNext: boolean, __activeIndex: number, __beforeIndex: number): void => {

				const _value = -this._updateValue * 100;
				Doms.style(__$items[0], { transform: `translateX(${_value}%)` });
				Doms.style(__$items[1], { zIndex: `2`, transform: `translateX(${_value + ((__isNext) ? 100 : -100)}%)` });

				if (this.$items.length > 2) {
					Doms.style(this.$items.at((__isNext) ? __beforeIndex - 1 : __beforeIndex + 1 - this.$items.length)!, { zIndex: `2`, transform: `translateX(${_value + ((__isNext) ? -100 : 100)}%)` });// 사이드 요소

					if (this.data._isMoreSide) {
						const $moreItem = this.$items.at((__isNext) ? __activeIndex + 1 - this.$items.length : __activeIndex - 1)!;
						Doms.show($moreItem);
						Doms.style($moreItem, { transform: `translateX(${_value + ((__isNext) ? 200 : -200)}%)` });
					}
				}

			},
			fade: (__$items: HTMLElement[], __isNext: boolean): void => {

				Doms.style(__$items[0], { opacity: `1` });
				Doms.style(__$items[1], { zIndex: `2`, opacity: `${this._updateValue + ((__isNext) ? 0 : 1)}` });

			},
			cover: (__$items: HTMLElement[], __isNext: boolean, __activeIndex: number): void => {

				Doms.style(__$items[0], { transform: `translateX(0%)` });
				Doms.style(__$items[1], { zIndex: `2`, transform: `translateX(${-this._updateValue * 100 + ((__isNext) ? 100 : 0)}%)` });

				if (__isNext && this.data._isMoreSide) {
					const $moreItem = this.$items.at(__activeIndex + 1 - this.$items.length)!;
					Doms.show($moreItem);
				}

			},
			strip: (__$items: HTMLElement[], __isNext: boolean): void => {

				Doms.style(__$items[0], { zIndex: `2`, transform: `translateX(${-this._updateValue * 100 - ((__isNext) ? 0 : 100)}%)` });
				Doms.style(__$items[1], { transform: `translateX(0%)` });

			},
			none: (): void => {},// 모션 없음
		},
		vertical: {
			slide: (): void => {},
			fade: (): void => {},
			cover: (): void => {},
			strip: (): void => {},
			none: (): void => {},// 모션 없음
		},
	}

	/**
	 * * 모션 업데이트
	 * @param __activeIndex
	 * @param __beforeIndex
	 */
	private changeUpdate(__activeIndex: number, __beforeIndex: number): void {

		const _isNext = this._direction === `next`;
		const $item1 = this.$items[(this.data._effect === `slide`) ? __beforeIndex : (_isNext) ? __beforeIndex : __activeIndex];
		const $item2 = this.$items[(this.data._effect === `slide`) ? __activeIndex : (_isNext) ? __activeIndex : __beforeIndex];

		Doms.style(this.$items, { zIndex: `` });
		Doms.show([$item1, $item2]);

		this.changeApplyMap[this.data._orientation][this.data._effect]([$item1, $item2], _isNext, __activeIndex, __beforeIndex);

		Utils.apply(this.data.onUpdate, [{ ui: this }, ...this.data.onUpdateParams]);

	}

	/**
	 * * 변경 값 적용
	 * + pagination, count, autoHeight
	 */
	private setValue(): void {

		const $item = this.$items[this._index];

		// pagination
		if (this.$pages.length > 0) {
			Doms.class.remove(this.$pages, this.data._classOn);

			const _isClone = $item.classList.contains(this.data._classClone) && this._index >= this.$pages.length;
			this.$pages[(_isClone) ? this._index - this.$pages.length : this._index].classList.add(this.data._classOn);
		}

		// count
		if (this.$count != null) {
			const _padStyle = this.data.count._padStyle ?? ``;
			const _total = this.$items.filter(__$el => !__$el.classList.contains(this.data._classClone)).length;
			let _index = this._index + 1;
			if (_index > _total) _index -= _total;

			Doms.find(`.text_carousel-index`, this.$count)[0].textContent = String(_index).padStart(_padStyle.length, _padStyle);
			Doms.find(`.text_carousel-total`, this.$count)[0].textContent = String(_total).padStart(_padStyle.length, _padStyle);
		}

		this.resize();

	}

	/** 정렬 타입 별 실행 함수 */
	private repositionApplyMap: CarouselDirectionMap = {
		horizontal: {
			slide: (__$item: HTMLElement, __index: number, __total: number): void => {

				Doms.style(__$item, { transform: `translateX(${(__index === 0) ? 0 : (__index === 1) ? -100 : 100}%)` });
				if (__index < 2 || __index === __total) Doms.show(__$item);

			},
			fade: (__$item: HTMLElement, __index: number, __total: number): void => {

				Doms.style(__$item, { zIndex: ``, opacity: `${(__index === 0) ? 1 : 0}` });
				if (__index < 2 || __index === __total) Doms.show(__$item);

			},
			cover: (__$item: HTMLElement, __index: number, __total: number): void => {

				Doms.style(__$item, { transform: `translateX(${(__index === 0) ? 0 : 100}%)` });
				if (__index === 0 || __index === __total) Doms.show(__$item);

			},
			strip: (__$item: HTMLElement, __index: number): void => {

				Doms.style(__$item, { transform: `translateX(${(__index === 0) ? 0 : -100}%)` });
				if (__index < 2) Doms.show(__$item);

			},
			none: (): void => {},// 모션 없음
		},
		vertical: {
			slide: (__$item: HTMLElement, __index: number, __total: number): void => {},
			fade: (__$item: HTMLElement, __index: number, __total: number): void => {},
			cover: (__$item: HTMLElement, __index: number, __total: number): void => {},
			strip: (__$item: HTMLElement, __index: number, __total: number): void => {},
			none: (): void => {},// 모션 없음
		},
	}

	/**
	 * * 정렬
	 */
	private reposition(): void {

		Doms.class.remove(this.$items, this.data._classOn);
		Doms.hide(this.$items);

		for (let _i = 0; _i < this.$items.length; _i++) {
			// 0 현재, 1 이전, length - 1 다음
			const $item = this.$items.at(this._index - _i)!;
			if (_i === 0) $item.classList.add(this.data._classOn);

			this.repositionApplyMap[this.data._orientation][this.data._effect]($item, _i, this.$items.length - 1);

			// 이전, 다음 요소 미리 로드
			if (!this.data._isErrorRemove && !this.data._isAutoHeight) Lazyload.force(Doms.find(`[data-lazyload]`, $item));
		}

	}

	/**
     * * 캐러셀 연결
     * @public @static
     * @param __elements
	 * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: CarouselData = {}, __onCatch?: (__ui: Carousel) => void): Carousel[] {

        return super.ini(__elements, __data, __onCatch);

    }

	/**
	 * * 캐러셀 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Carousel[] = Carousel.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

	/**
	 * * 캐러셀 변경
	 * @public @static
	 * @params __elements
	 * @params __index - 변경할 인덱스
	 * @params __direction - 모션 방향으로 값이 없으면 인덱스를 비요하여 방향 적용
	 */
	public static change(__elements: ElementSelector, __index: number, __direction?: `next` | `prev`): void {

		const UIs: Carousel[] = Carousel.update(__elements);
        for (const ui of UIs) {
			if (__index === ui._index || __index === ui.realIndex || __index < 0) continue;

			ui.change(__index, __direction);
		}

	}

	/**
	 * * 캐러셀 자동 높이
	 * @public @static
	 * @params __elements
	 * @params __time - 변경 시간(초)으로 0은 모션없이 바로 적용
	 */
	public static resize(__elements: ElementSelector, __time?: number): void {

		const UIs: Carousel[] = Carousel.update(__elements);
        for (const ui of UIs) ui.resize(__time);

	}

	/**
	 * * 캐러셀 재정럴(추가/삭제)
	 * @public @static
	 * @params __elements
	 */
	public static reload(__elements: ElementSelector): void {

		const UIs: Carousel[] = Carousel.update(__elements);
        for (const ui of UIs) {
			const $element = ui.$element;
			const data = ui.data;
			data._index = ui.realIndex;

			ui.destroy();
			new Carousel($element, data);
		}

	}

	/**
	 * * 캐러셀 자동 롤링
	 * @public @static
	 * @params __elements
	 */
	public static play(__elements: ElementSelector): void {

		const UIs: Carousel[] = Carousel.update(__elements);
        for (const ui of UIs) ui.play();

	}

	/**
	 * * 캐러셀 정지
	 * @public @static
	 * @params __elements
	 */
	public static stop(__elements: ElementSelector): void {

		const UIs: Carousel[] = Carousel.update(__elements);
        for (const ui of UIs) ui.stop();

	}

}

/** @class 슬라이더 */
class Slider extends BaseUI {

    public data: Required<SliderData> = {
		_index: 0,
		_orientation: `horizontal`,
		_time: 0.2,
		_autoDelay: 0,
		_sensitiveTime: 0.23,
		_rootMargin: `10px 1px`,
		_isLoop: false,
		_isErrorRemove: false,
		_classOn: `S=on`,
		_classClone: `S=clone`,
		_classIntersecting: `S=intersecting`,
		pagination: {
			_isInner: true,
			_selector: `.btn_slider-page`,
		},
		control: {
			_isInner: true,
			_selectorPrev: `.btn_slider-prev`,
			_selectorNext: `.btn_slider-next`,
		},
		onReady: null,
		onReadyParams: [],
		onUpdate: null,
		onUpdateParams: [],
		onStart: null,
		onStartParams: [],
		onComplete: null,
		onCompleteParams: [],
		onIntersecting: null,
		onIntersectingParams: [],
	};

	public get index(): number { return this._index; }
	/** 클론을 제외한 실제 인덱스 */
	public get realIndex(): number { return parseFloat(this.$activeItem!.dataset._sliderIndex!); }

	private _index: number;
	private _total: number;
	/** 모션 중 변경되는 값 */
	private _updateValue: number;
	/** 모션 방향 */
	private _direction: `next` | `prev`;
	/** 이동 방향이 같음(mui_page.ts에서 iframe 내부 스크롤에서도 사용) */
	private _isDirection?: boolean;
	/** 자동 롤링 */
	private interval: number = NaN;
	/** $inner 요소의 내부 padding 값 */
	private innerPadding = { left: 0, right: 0 }
	// 요소
	private $inner: HTMLElement;
	private $list: HTMLElement;
	private $items: ElementList = [];
	private $pages: ElementList = [];
	private $btnPrev: HTMLElement;
	private $btnNext: HTMLElement;
	private $activeItem?: HTMLElement;// setValue에서 적용

    constructor(__$element: HTMLElement, __data?: SliderData) {

		super(__$element, `slider`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

		this.$inner = Doms.find(`> .${this._prefix}slider-inner`, this.$element)[0];
		this.$list = Doms.find(`> .${this._prefix}slider-list`, this.$inner)[0];
		this.$items = Doms.find(`> .${this._prefix}slider-item`, this.$list);
		this.$pages = (this.data.pagination._isInner) ? Doms.find(`> .${this._prefix}slider-pagination ${this.data.pagination._selector}`, this.$element) : Doms.find(this.data.pagination._selector);
		this.$btnPrev = (this.data.control._isInner) ? Doms.find(`> .${this._prefix}slider-control ${this.data.control._selectorPrev}`, this.$element)[0] : Doms.find(this.data.control._selectorPrev)[0];
		this.$btnNext = (this.data.control._isInner) ? Doms.find(`> .${this._prefix}slider-control ${this.data.control._selectorNext}`, this.$element)[0] : Doms.find(this.data.control._selectorNext)[0];

		this._total = this.$items.length;
		this._index = (this.data._index > this._total - 1 || this.data._index < 0) ? 0 : this.data._index;
		this._updateValue = 0;
		this._direction = `next`;

		// 이미지 프리로드, 오류 아이템 삭제
		if (this.data._isErrorRemove) {
			const $loadItems = Doms.find(`[data-lazyload]`, this.$element);
			let _loadCount = 0;

			const lazyCheck = (__$element: HTMLElement, __isRemove: boolean): void => {

				if (__isRemove) __$element.closest(`.${this._prefix}carousel-item`)?.remove();// 오류 아이템 삭제
				if (++_loadCount === $loadItems.length) this.init();

			}

			for (const $el of $loadItems) {
				let lazyUI: Lazyload | undefined;
				try {
					lazyUI = new Lazyload($el);
				}
				catch (__e) {
					const error = __e as UIError<Lazyload>;
					lazyUI = error.ui;
				}
				if (lazyUI == null) continue;
				if (Doms.class.some($el, [Lazyload.CLASS_LOADED, Lazyload.CLASS_ERROR])) {
					lazyCheck($el, $el.classList.contains(Lazyload.CLASS_ERROR));
					continue;
				}

				lazyUI.data.onComplete = lazyUI.data.onError = (__package: { ui: Lazyload }, __is: boolean): void => {

					lazyCheck($el, !__is && this.data._isErrorRemove);

				};
				lazyUI.data.onCompleteParams = [true];
				lazyUI.data.onErrorParams = [false];

				lazyUI.force();
			}
		}
		else {
			Lazyload.update(Doms.find(`[data-lazyload]`, __$element));
			this.init();
		}

    }

	/**
	 * * 해제
	 */
	public destroy(): void {

		this.stop();
		gsap.killTweensOf(this);

		Doms.data.set<SliderData>(this.$element, this._name, { _index: this._index });// 이전 인덱스 값 data-x 속성에 저장

		for (const $el of this.$items) {
			Events.intersection.off(this.$items);

			if ($el.classList.contains(this.data._classClone)) $el.remove();
			else {
				$el.removeAttribute(`style`);
				Events.bind.off(this.$inner, (Is.mobile()) ? `touchstart touchend` : `mousedown mouseover mouseleave`);//, `touchStartHandler`);
				Events.bind.off([this.$btnPrev, this.$btnNext], `click`);//, `controlClickHandler`);
				Events.bind.off(this.$pages, `click`);//, `paginationClickHandler`);
			}
		}

		Pages.ui.remove(this);

	}

	/**
	 * * 변경
	 * @param __index - realIndex
	 * @param __direction
	 * @param __isDrag - 드래그로 이동
	 */
	public change(__index: number, __direction?: `next` | `prev`, __isDrag?: boolean): void {

		if (__index === this._index || gsap.isTweening(this)) return;// __index가 같거나 모션 중에는 리턴

		this._direction = (__direction == null) ? (() => {

			if (__index > this._index) return (__index - this._index < this._index + this._total - __index) ? `next` : `prev`;
			else return (__index - this._index < __index + this._total - this._index) ? `prev` : `next`;

		})() : __direction;

		const innerRect = this.$inner.getBoundingClientRect();
		let _value = 0;

		// 직접 이동(빠른 이동)
		if (Number.isFinite(__index)) {
			const $filteredItems = (this._direction === `next`) ? this.$items.slice(this._index) : this.$items.slice(0, this._index).reverse();
			const $targetItem = $filteredItems.find(__$el => __$el.matches(`[data-_slider-index="${__index}"]`));
			if ($targetItem == null) return;

			const activeRect = this.$activeItem!.getBoundingClientRect();
			_value = $targetItem.getBoundingClientRect().left - activeRect.left - (innerRect.left + this.innerPadding.left - activeRect.left);
		}
		// 가까운 쪽으로 이동(드래그)
		else {
			let $firstItem = this.$items.filter(__$el => __$el.classList.contains(this.data._classIntersecting))[0];
			if ($firstItem == null) $firstItem = (this._direction === `next`) ? this.$items.at(-1)! : this.$items[0];
			const _x = innerRect.left + this.innerPadding.left - $firstItem.getBoundingClientRect().left;

			_value = (_x > $firstItem.offsetWidth / 2) ? $firstItem.offsetWidth - _x : -_x;
		}

		_value = this._updateValue + _value;
		if (!this.data._isLoop) _value = Math.min(Math.max(0, _value), this.$list.offsetWidth - this.$inner.offsetWidth + this.innerPadding.left + this.innerPadding.right);

		gsap.to(this, { _updateValue: _value,
			duration: this.data._time,
			ease: (__isDrag) ? `cubic.out` : `sine.inOut`,
			onUpdate: () => {

				this.changeUpdate();

			},
			onStart: () => {

				Utils.apply(this.data.onStart, [{ ui: this }, ...this.data.onStartParams]);

			},
			onComplete: () => {

				Utils.apply(this.data.onComplete, [{ ui: this }, ...this.data.onCompleteParams]);

			}
		});

	}

	/**
	 * * 자동 롤링 시작
	 */
	public play(): void {

		this.stop();

		if (this.data._autoDelay > 0) {
			this.interval = setInterval(() => {

				let _direction: typeof this._direction = `next`;
				let _index = this.realIndex + 1;

				if (_index > this._total - 1 || this.$items.at(-1)!.classList.contains(this.data._classOn)) {
					_index = 0;
					if (!this.data._isLoop) _direction = `prev`;
				}

				console.log(_index, this._total, _direction);
				this.change(_index, _direction);

			}, this.data._autoDelay * 1000);
		}

	}

	/**
	 * * 자동 롤링 정지
	 */
	public stop(): void {

		clearTimeout(this.interval);
		this.interval = NaN;

	}

	/**
	 * * 실행
	 */
	private init(): void {

		if (this.$items.length === 0) return this.destroy();

		// update가 적용될 때 figcaption 노출
		this.$element.classList.add(`S=ready`);

		const innerStyle = Doms.style(this.$inner);
		this.innerPadding.left = parseFloat(innerStyle.paddingLeft);
		this.innerPadding.right = parseFloat(innerStyle.paddingRight);

		// 리스트의 width가 영역보다 작음
		if (this.$list.offsetWidth <= this.$inner.offsetWidth - this.innerPadding.left - this.innerPadding.right) {
			Doms.class.add(this.$items, [this.data._classIntersecting, this.data._classOn]);
			Doms.remove([this.$btnPrev, this.$btnNext, ...this.$pages]);
			Doms.style(this.$inner, { textAlign: `center` });

			Utils.apply(this.data.onReady, [{ ui: this }, ...this.data.onReadyParams]);

			return;
		}

		for (const [_i, $el] of this.$items.entries()) $el.dataset._sliderIndex = String(_i);// 인덱스 적용

		// 앞뒤 복제
		if (this.data._isLoop) {
			const $firstItem = this.$items[0];
			for (const $el of this.$items) {
				const $clone = $el.cloneNode(true) as HTMLElement;
				$clone.classList.add(this.data._classClone);
				$clone.setAttribute(`tabindex`, `-1`);
				Doms.class.remove($clone, [this.data._classIntersecting, this.data._classOn]);

				$el.parentElement?.append($clone);

				const $cloneBefore = $clone.cloneNode(true) as HTMLElement;
				$firstItem.before($cloneBefore);

				const $lazies = Doms.find(`[data-lazyload]`, [$clone, $cloneBefore]);
				Lazyload.destroy($lazies);
				Lazyload.update($lazies);
			}

			this.$items = Doms.find(`.${this._prefix}slider-item`, this.$element);// 클론 포함 저장
			Doms.style(this.$list, { marginInlineStart: `${-this.$list.offsetWidth / 3}px` });
		}

		// 초기 위치
		this._updateValue = this.$items[(this.data._isLoop) ? this._index + this._total : this._index].getBoundingClientRect().left - this.$inner.getBoundingClientRect().left - this.innerPadding.left;
		if (!this.data._isLoop) this._updateValue = Math.min(Math.max(0, this._updateValue), this.$list.offsetWidth - this.$inner.offsetWidth + this.innerPadding.left + this.innerPadding.right);
		Doms.style(this.$list, { transform: `translateX(${-this._updateValue}px)`});

		// intersection event
		const itemIntersectionHandler = (__entry: IntersectionObserverEntry): void => {

			if (__entry.isIntersecting) {
				__entry.target?.classList.add(this.data._classIntersecting);

				if (__entry.intersectionRatio === 1) {
					__entry.target?.classList.add(this.data._classOn);
					this.reposition();
					this.setValue();
				}
				else __entry.target?.classList.remove(this.data._classOn);
			}
			else Doms.class.remove(__entry.target!, [this.data._classIntersecting, this.data._classOn]);

		}
		Events.intersection.on(this.$items, itemIntersectionHandler, { root: this.$inner, rootMargin: this.data._rootMargin });

		// touch
		const touchStartHandler = (__e: (TouchEvent | MouseEvent) & Record<`detail`, any>): void => {

			this._isDirection = undefined;

			if (gsap.isTweening(this)) return;// 모션 중에는 리턴
			if (__e instanceof MouseEvent) __e.preventDefault();

			this.stop();

			const _stampKey = `${this._name}${Date.now()}`;
			Times.stamp.on(_stampKey);

			// 아이프레임 내부에서 터치 시 __e.detail.touches로 값 전달
			const startTouch: Record<`screenX` | `screenY`, number> = (__e instanceof TouchEvent) ? (__e.detail instanceof Object && __e.detail.touches != null) ? __e.detail.touches[0] : __e.touches[0] : { screenX: __e.clientX, screenY: __e.clientY };
			const _startValue = this._updateValue ?? 0;
			let _touchCount = 0;// 터치 이벤트 실행 감도(순간 터치 시 이동 방지)

			const touchMoveEndHandler = (__e: Parameters<typeof touchStartHandler>[0]): void => {

				if (__e instanceof MouseEvent) __e.preventDefault();

				const touch: typeof startTouch = (__e instanceof TouchEvent) ? (__e.detail != null && __e.detail.touches) ? __e.detail.touches[0] : (__e.type === `touchend`) ? __e.changedTouches[0] : __e.touches[0] : { screenX: __e.clientX, screenY: __e.clientY };
				const innerTouchOff = () => {

					Events.bind.off(document, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, touchMoveEndHandler);
					this.play();

				}

				if (this._isDirection == null) {
					const _x = Math.abs(touch.screenX - startTouch.screenX);
					const _y = Math.abs(touch.screenY - startTouch.screenY);
					const _limit = 1.5;

					if (this.data._orientation === `horizontal` && _x / _y > _limit) this._isDirection = true;
					else if (this.data._orientation === `vertical` && _y / _x > _limit) this._isDirection = true;
					else innerTouchOff();
				}
				else if (this._isDirection) {
					__e.preventDefault();

					this._updateValue = ((this.data._orientation = `horizontal`) ? startTouch.screenX - touch.screenX : startTouch.screenY - touch.screenY) + _startValue;
					const _direction: typeof this._direction = (this._updateValue > _startValue) ? `next` : `prev`;

					switch (__e.type) {
						case `touchmove`:
						case `mousemove`:
							this.changeUpdate();
							break;
						case `touchend`:
						case `mouseup`:
							const _touchTime = Times.stamp.off(_stampKey) / 1000;// 빠른 드래그 확인
							let _index = NaN;
							if (_touchCount > 1 && _touchTime < this.data._sensitiveTime) {
								const $targetItem = (_direction === `next`) ? this.$activeItem?.nextElementSibling : this.$activeItem?.previousElementSibling;
								if ($targetItem != null) _index = parseFloat(($targetItem as HTMLElement).dataset._sliderIndex!);
							}

							this.change(_index, _direction, true);
							break;
					}

					_touchCount++;
				}

				if ([`touchend`, `mouseup`].includes(__e.type)) innerTouchOff();

			}
			Events.bind.on(document, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, touchMoveEndHandler);

		}
		Events.bind.on(this.$inner, (Is.mobile()) ? `touchstart` : `mousedown`, touchStartHandler);

		// 이동 중 클릭 이벤트 실행 방지
		const clickCancelHandler = (__e: Event): void => {

			if (this._isDirection) {
				__e.preventDefault();
				__e.stopPropagation();
			}

		}
		Events.bind.on(this.$inner, `click`, clickCancelHandler, { _isCapture: true });

		// 내부 스크롤 요소에서는 드래그 방지(단, 페이지로 사용하기 위해 item 자식 스크롤 요소는 제외)
        const scrollerHandler = (__e: TouchEvent | MouseEvent, __data: unknown, __$element: HTMLElement): void => {

            if ((__$element as HTMLElement).classList.contains(`T=x`)) {
                __e.stopPropagation();
                this._isDirection = undefined;// inner의 touchstart보다 먼저 실행, 스크롤 요소가 없는 아이템이 있어 undefined 추가 적용
            }

        }
        Events.delegate.on(this.$items, `.mm_scroller, .mui_scroller`, (Is.mobile()) ? `touchstart` : `mousedown`, scrollerHandler);

		// control
		const controlClickHandler = (__e: MouseEvent): void => {

			__e.preventDefault();

			const _direction: typeof this._direction = ((__e.currentTarget as HTMLElement).matches(this.data.control._selectorNext!)) ? `next` : `prev`;
			let _index = this.realIndex + ((_direction === `next`) ? 1 : -1);
			if (_index > this._total - 1) _index = 0;
			else if (_index < 0) _index = this._total - 1;

			this.change(_index, _direction);

		}
		Events.bind.on([this.$btnPrev, this.$btnNext], `click`, controlClickHandler);

		// pagination
		const paginationClickHandler = (__e: MouseEvent): void => {

			__e.preventDefault();

			const _index = this.$pages.findIndex(__$el => __$el === __e.currentTarget);
			if (_index !== this._index) this.change(_index, (_index > this._index) ? `next` : `prev`);

		}
		Events.bind.on(this.$pages, `click`, paginationClickHandler);

		// autoplay
		if (this.data._autoDelay > 0) {
			const intervalControlHandler = (__e: Event): void => {

				switch (__e.type) {
					case `touchstart`:
					case `mouseover`:
						this.stop();
						break;
					case `touchend`:
					case `mouseleave`:
						this.play();
						break;
				}

			}
			Events.bind.on(this.$element, (Is.mobile()) ? `touchstart touchend` : `mouseover mouseleave`, intervalControlHandler);

			// 노출 여부에 따라 play/stop
			const uiIntersectionHandler = (__entry: IntersectionObserverEntry, __data: ObjectCollection | undefined, __io:IntersectionObserver): void => {

				if (__entry.isIntersecting) {
					if (this.interval === -1) this.play();
				}
				else {
					if (!Number.isNaN(this.interval)) {
						this.stop();
						this.interval = -1;
					}
				}

			}
			Events.intersection.on(this.$element, uiIntersectionHandler);

			this.play();
		}

		Utils.apply(this.data.onReady, [{ ui: this }, ...this.data.onReadyParams]);

	}

	/**
	 * * 모션 업데이트
	 */
	private changeUpdate(): void {

		if (this.data._orientation === `horizontal`) Doms.style(this.$list, { transform: `translateX(${-this._updateValue}px)` });
		else {}

		Utils.apply(this.data.onUpdate, [{ ui: this/*, _direction: this._direction */ }, ...this.data.onUpdateParams]);

	}

	/**
	 * * 변경 값 적용
	 * + pagination, control, activeitem
	 */
	private setValue(): void {

		this.$activeItem = this.$items.find(__$el => __$el.classList.contains(this.data._classOn));
		if (this.$activeItem == null) return;

		this._index = this.$items.findIndex(__$el => __$el === this.$activeItem);// data._isLoop 값이 true면 reposition에서 한번 더 _index 값 저장

		// pagination
		if (this.$pages.length > 0 && !Is.touch) {
			Doms.class.remove(this.$pages, this.data._classOn);
			this.$pages[this._index].classList.add(this.data._classOn);
		}

		// control
		if (!this.data._isLoop) {
			Doms.property(this.$btnPrev, { disabled: this.$items[0].classList.contains(this.data._classOn) });
			Doms.property(this.$btnNext, { disabled: this.$items.at(-1)!.classList.contains(this.data._classOn) });
		}

		Utils.apply(this.data.onIntersecting, [{ ui: this }, ...this.data.onIntersectingParams]);

	}

	/**
	 * * 정렬
	 */
	private reposition(): void {

		if (!this.data._isLoop) return;

		// 정렬
		const $onItems = this.$items.filter(__$el => __$el.classList.contains(this.data._classOn));
		if ($onItems.length < 1) return;

		const _beforeTotal = this.$items.findIndex(__$el => __$el === $onItems[0]);
		const _afterTotal = this.$items.length - $onItems.length - _beforeTotal;
		const _appendTotal = Math.floor(Math.abs(_beforeTotal - _afterTotal) / 2);

		let $item = this.$list.children[0] as HTMLElement;
		let _margin = 0;
		let _count = 0;

		while (_count < _appendTotal) {
			if (_beforeTotal > _afterTotal) {
				$item = this.$list.children[0] as HTMLElement;
				_margin += (this.data._orientation === `horizontal`) ? $item.offsetWidth : $item.offsetHeight;
				$item.parentElement!.append($item);
			}
			else {
				$item = this.$list.children[this.$items.length - 1] as HTMLElement;
				_margin -= (this.data._orientation === `horizontal`) ? $item.offsetWidth : $item.offsetHeight;
				$item.parentElement!.prepend($item);
			}

			// 이전, 다음 요소 미리 로드
			Lazyload.force(Doms.find(`[data-lazyload]`, $item));
			_count++;
		}
		this.$items = Object.values(this.$list.children) as HTMLElement[];

		const _styleKey: keyof CSSStyleDeclaration = (this.data._orientation === `horizontal`) ? `marginInlineStart` : `marginBlockStart`;
		Doms.style(this.$list, { [_styleKey]: `${parseFloat(Doms.style(this.$list, _styleKey)) + _margin}px` });

	}

	/**
     * * 슬라이더 연결
     * @public @static
     * @param __elements
	 * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: SliderData = {}, __onCatch?: (__ui: Slider) => void): Slider[] {

        return super.ini(__elements, __data, __onCatch);

    }

	/**
	 * * 슬라이더 해제
	 * @public @static
	 * @param __elements
	 */
	 public static destroy(__elements: ElementSelector): void {

		const UIs: Slider[] = Slider.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

	/**
	 * * 슬라이더 변경
	 * @public @static
	 * @params __elements
	 * @params __index - 변경할 인덱스
	 * @params __direction - 모션 방향으로 값이 없으면 인덱스를 비요하여 방향 적용
	 */
	public static change(__elements: ElementSelector, __index: number, __direction?: `next` | `prev`): void {

		const UIs: Slider[] = Slider.update(__elements);
        for (const ui of UIs) {
			if (__index === ui._index || __index === ui.realIndex || __index < 0) continue;

			ui.change(__index, __direction);
		}

	}

	/**
	 * * 슬라이더 재정럴(추가/삭제)
	 * @public @static
	 * @params __elements
	 */
	public static reload(__elements: ElementSelector): void {

		const UIs: Slider[] = Slider.update(__elements);
        for (const ui of UIs) {
			const $element = ui.$element;
			const data = ui.data;
			data._index = ui.realIndex;

			ui.destroy();
			new Slider($element, data);
		}

	}

	/**
	 * * 슬라이더 자동 롤링
	 * @public @static
	 * @params __elements
	 */
	public static play(__elements: ElementSelector): void {

		const UIs: Slider[] = Slider.update(__elements);
        for (const ui of UIs) ui.play();

	}

	/**
	 * * 슬라이더 정지
	 * @public @static
	 * @params __elements
	 */
	public static stop(__elements: ElementSelector): void {

		const UIs: Slider[] = Slider.update(__elements);
        for (const ui of UIs) ui.stop();

	}

}

export { Carousel, Slider };