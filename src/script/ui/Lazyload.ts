/**
 * @class 레이지로드
 * @constructor
 * @static
 */

import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Images from '../images';
import Pages from '../pages';
import Utils from '../utils';
import BaseUI from './baseUI';

/** @class 레이지로드 */
class Lazyload extends BaseUI {

	public static readonly CLASS_LOADING = `S=loading`;
    public static readonly CLASS_LOADED = `S=loaded`;
    public static readonly CLASS_ERROR = `S=error`;

	public data: Required<LazyloadData> = {
		_rootMargin: `0px 0px 0px 0px`,
		_src: null,
		_src2: null,
		_isErrorImage: true,
		_isRatio: false,
		_isPass: false,
		_isForce: false,
		onBefore: null,
		onBeforeParams: [],
		onComplete: null,
		onCompleteParams: [],
		onError: null,
		onErrorParams: [],
	}

	constructor(__$element: HTMLElement, __data?: LazyloadData) {

		super(__$element, `lazyload`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

		if (this.data._isForce) {
			this.load();
			return;
		}
		if (this.data._isPass) return;

		const lazyloadHandler = (__entry: IntersectionObserverEntry): void => {

			if (!__entry.isIntersecting || Doms.class.some(__entry.target, [Lazyload.CLASS_LOADING, Lazyload.CLASS_LOADED, Lazyload.CLASS_ERROR])) return;

			this.load();

		}

		Events.intersection.on(__$element, lazyloadHandler, { rootMargin: this.data._rootMargin }, { data: this.data, _isOnce: true });

	}

	/**
	 * * 해제
	 */
	public destroy(): void {

		if (Doms.class.some(this.$element, [Lazyload.CLASS_LOADED, Lazyload.CLASS_ERROR])) return;// 진행 중인 요소는 제외

		this.$element.removeAttribute(`src`);
		this.$element.classList.remove(Lazyload.CLASS_LOADING);

		Events.intersection.off(this.$element);//, `lazyloadHandler`);
		Pages.ui.remove(this);

	}

	/**
	 * * 강제로드
	 */
	public force(): void {

		if (!Doms.class.some(this.$element, [Lazyload.CLASS_LOADING, Lazyload.CLASS_LOADED, Lazyload.CLASS_ERROR])) this.load();

	}

	/** 이미지 로드 결과 별 실행 함수 */
	private loadApplyMap: Record<`load` | `error`, ArrowFunc> = {
		/** 로드 완료 */
		load: (__$eventElement: HTMLElement) => {

			Doms.class.remove(this.$element, [Lazyload.CLASS_LOADING, Lazyload.CLASS_ERROR]);
			this.$element.classList.add(Lazyload.CLASS_LOADED);

			// iframe
			if (this.$element instanceof HTMLIFrameElement) {
				// * iframe 오류 상태 개발에서 적용
				// const _iframeTitle = this.$element.getAttribute(`title`) ?? this.$element.contentDocument?.title ?? ``;
				// this.$element.setAttribute(`title`, _iframeTitle);

				// // 에러 화면 title로 확인
				// if (/404 not found|불편을 드려 죄송합니다|페이지를 찾을 수 없습니다|^error$/i.test(_iframeTitle)) {
				// 	Doms.class.remove(this.$element, [Lazyload.CLASS_LOADING, Lazyload.CLASS_LOADED]);
				// 	this.$element.classList.add(Lazyload.CLASS_ERROR);
				// 	console.log(`error src : ` + this.$element.getAttribute(`src`));

				// 	Utils.apply(this.data.onError, [{ ui: this, ...this.data.onErrorParams }]);
				// 	return;
				// }
			}
			else {
				const $target = __$eventElement as HTMLImageElement;
				if (this.data._isRatio) {
					const _ratio = $target.naturalWidth / $target.naturalHeight;
					let _classRatio = `S=image-square`;
					if (_ratio > 1) _classRatio = (_ratio > 8) ? `S=image-landscape-4x` : (_ratio > 4) ? `S=image-landscape-3x` : (_ratio > 2) ? `S=image-landscape-2x` : `S=image-landscape`;
					else if (_ratio < 1) _classRatio = (_ratio < 0.25) ? `S=image-portrait-3x` : (_ratio < 0.5) ? `S=image-portrait-2x` : `S=image-portrait`;

					this.$element.classList.add(_classRatio);
				}

				// 배경
				if (!(this.$element instanceof HTMLImageElement)) {
					Doms.style(this.$element, { backgroundImage: `url("${$target.getAttribute(`src`)}")` });
					$target.remove();
				}
			}

			// 모달 리사이징
			// ~ if (this.$element.closest(`.mm_modal`)) Pages.modal.resize();// 모달 제작 여부에 따라 적용

			Utils.apply(this.data.onComplete, [{ ui: this }, ...this.data.onCompleteParams]);

		},
		/** 로드 에러(iframe은 load에서 에러 처리) */
		error: (__$eventElement: HTMLElement) => {

			Doms.class.remove(this.$element, [Lazyload.CLASS_LOADING, Lazyload.CLASS_LOADED]);

			// 보조 경로가 있으면 다시 로드
			if (this.data._src2 != null) {
				this.data._src = this.data._src2;
				this.data._src2 = null;
				if (this.$element !== __$eventElement) __$eventElement.remove();// 임시로 생성된 이미지 요소 삭제

				this.load();
			}
			else {
				this.$element.classList.add(Lazyload.CLASS_ERROR);
				console.log(`error src: ${__$eventElement.getAttribute(`src`)}`);

				if (this.data._isErrorImage) Images.none(this.$element);// 없음 이미지

				Utils.apply(this.data.onError, [{ ui: this }, ...this.data.onErrorParams]);
			}

		}
	}

	/**
	 * * 이미지 로드
	 */
	private load(): void {

		let $event = this.$element;// 이벤트를 연결할 요소
        // iframe
		if (this.$element instanceof HTMLIFrameElement) {
			if (!this.$element.getAttribute(`scrolling`)) this.$element.setAttribute(`scrolling`, `no`);// scrolling 속성 웹표준 오류로 스크립트로 적용
		}
        // 배경
		else if (!(this.$element instanceof HTMLImageElement)) {
			$event = document.createElement(`img`);
			Doms.data.set($event, this._name, this.data);
		};

        // 로드 전
		this.$element.classList.add(Lazyload.CLASS_LOADING);
		Utils.apply(this.data.onBefore, [{ ui: this }, ...this.data.onBeforeParams]);

        const eventLoadHandler = (__e: Event): void => {

			Events.bind.off($event, `load error`);
			this.loadApplyMap[__e.type as `load` | `error`]($event);

		}
		Events.bind.on($event, `load error`, eventLoadHandler);

		const _loadSrc = (this.data._src != null) ? this.data._src.trim() : ``;
		if (_loadSrc.length === 0) Events.bind.call($event, `error`);
		else $event.setAttribute(`src`, _loadSrc);

	}

	/**
     * * 레이지로드 연결
     * @public @static
     * @param __elements
	 * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
	public static update(__elements: ElementSelector, __data: LazyloadData = {}, __onCatch?: (__ui: Lazyload) => void): Lazyload[] {

        return super.ini(__elements, __data, __onCatch);

    }

	/**
	 * * 레이지로드 해제
	 * + 이미 로드가 완료됐거나 오류가 있는 요소는 제외
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Lazyload[] = Lazyload.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

	/**
	 * * 레이지로드 강제로드
	 * @public @static
	 * @param __elements
	 */
	public static force(__elements: ElementSelector): void {

		const UIs: Lazyload[] = Lazyload.update(__elements, { _isForce: true });
		for (const ui of UIs) ui.force();

	}

}

export default Lazyload;