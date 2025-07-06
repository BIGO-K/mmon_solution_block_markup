/**
 * @class 페이지
 * @static
 * 프로젝트 구조(mm_page)
 */

import { gsap } from 'gsap';
import Datas from './datas';
import Doms from './doms';
import Events from './events';
import Is from './is';
import Times from './times';
import BaseUI from './ui/baseUI';
import Lazyload from './ui/Lazyload';
import Utils from './utils';

/** Pages.ui에 저장된 요소 */
type UIElement = HTMLElement & Record<`__mm.ui__`, any>;

class Pages {

	/**
	 * * UI 영역
	 * @public @static
	 */
	public static readonly ui: PageUI = {
		set: Pages.uiSet,
		get: Pages.uiGet,
		remove: Pages.uiRemove,
	}

	/** 요소에 저장할 key 이름 */
	private static readonly UI_KEY = `__mm.ui__`;

	/**
	 * * UI 생성자 저장
	 * @param __newUI - UI 생성자
	 * @param __option
	 * @param __option._isOverwrite (default false) - 값이 true 일 때 internalUI[_name] 값이 있으면 병합하고, 없거나 false면 새로 저장
	 * @returns
	 */
	private static uiSet(__newUI: BaseUI, __option?: PageUIOption): void {

		const _name: string = __newUI._name;
		const option: Required<PageUIOption> = Datas.clone({
			_isOverwrite: false,
		}, __option);

		const $element = __newUI.$element as UIElement;
		let internalUI: ObjectCollection | undefined = $element[Pages.UI_KEY];
		if (internalUI == null) internalUI = $element[Pages.UI_KEY] = {};

		if (internalUI[_name] == null || (option._isOverwrite && internalUI[_name] != null)) internalUI[_name] = __newUI;

	}

	/**
	 * * UI 생성자 확인
	 * __name 값이 없으면 전체 클래스 생성자 리턴
	 * @param __element - 단일 요소
	 * @param __name - data-x 속성 이름 또는 클래스 이름
	 * @returns
	 */
	private static uiGet<T extends BaseUI>(__element: ElementSelector, __name?: string): T | undefined {

		const $element = Doms.find(__element)[0];
		const _name: string = __name?.replace(`data-`, ``) ?? ``;
		const internalUI: ObjectCollection = ($element as UIElement)[Pages.UI_KEY] ?? {};

		return (_name.length === 0) ? internalUI : internalUI[_name];

	}

	/**
	 * * UI 생성자 삭제
	 * @param __target - UI 생성자
	 * @param __target - 단일 요소
	 * @param __name - data-x 속성 이름 또는 클래스 이름(__target 이 단일 요소 일 때 사용)
	 */
	private static uiRemove(__target: BaseUI, __name?: undefined): void;
	private static uiRemove(__target: ElementSelector, __name: string): void;
	private static uiRemove(__target: BaseUI | ElementSelector, __name?: string): void {

		const $element = (__target instanceof BaseUI) ? __target.$element : Doms.find(__target)[0];
		if ($element == null) return;

		const _name: string = (__target instanceof BaseUI) ? __target._name : __name!;
		const internalUI: ObjectCollection = ($element as UIElement)[Pages.UI_KEY] ?? {};
		delete internalUI[_name.replace(`data-`, ``).toLowerCase()];

	}

	/**
	 * * 아이프레임 리사이즈
	 * @public @static
	 * @param __elements - HTMLIframeElement 셀렉터, 값이 없으면 frameElement를 확인하여 실행
	 * @param __option
	 * @param __option._isLoad (default false) - 페이지 ready, load로 실행
	 * @param __option._isEven (default false) - 높이를 짝수로 적용
	 * @param __option._extraHeight (default 0) - 높이에 추가로 계산할 값
	 */
    public static frameResize(__elements?: ElementSelector, __option?: PageFrameResizeOption): void {

		// iframe 지정
		if (__elements != null) {
			const $elements = Doms.find(__elements);
			for (const $el of $elements) {
				if (!($el instanceof HTMLIFrameElement)) continue;

				// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?
				if ($el.contentWindow?.mm != null) $el.contentWindow.mm.frameResize(undefined, __option);
				else {
					const frameLoadHandler = (): void => $el.contentWindow?.mm.frameResize(undefined, __option);
					Events.load(frameLoadHandler, $el);
				}
			}
		}
		else {
			// iframe 안에서 실행
			if (frameElement != null) {
				let option: Required<PageFrameResizeOption> = Datas.clone({
					_isLoad: false,
					_isEven: false,
					_extraHeight: 0,
				}, __option);

				if (!option._isLoad && option._extraHeight !== 0) Doms.data.set(frameElement as HTMLElement, `data-iframe`, { _extraHeight: option._extraHeight })// 새로고침 대응으로 로드를 제외한 함수를 직접 실행할 때 _extra 값이 있으면 요소에 저장
				else option = Datas.clone(option, Doms.data.get(frameElement as HTMLElement, `data-iframe`));// 새로고침 시 이전에 저장한 extra 값이 있으면 적용

				let $target = (Doms.scroll.element instanceof HTMLElement) ? Doms.scroll.element : Doms.find(`.mm_page`)[0];
				const style: Partial<CSSStyleDeclaration> = { width: ``, height: `` };

				// ~ Doms.style(frameElement, style);// iframe 높이를 초기화하면 부모 스크롤 위치가 달라지는 이슈
				Doms.style(document.body, { height: `0`, minHeight: `0` });

				let _frameWidth = Math.ceil(Math.min($target.scrollWidth, Doms.find(`.mm_page-content`, $target)[0].scrollWidth));
				if (option._isEven && Is.odd(_frameWidth)) _frameWidth += 1;
				style.width = `${_frameWidth}px`;

				let _frameHeight = Math.ceil($target.scrollHeight + (Doms.offset($target)?.top ?? 0)) + option._extraHeight;
				if (option._isEven && Is.odd(_frameHeight)) _frameHeight += 1;
				style.height = `${_frameHeight + 2}px`;// android iframe에서 스크롤이 잘 되지 않는 이슈로 +2 적용

				Doms.style(document.body, { height: ``, minHeight: `` });
				// ~ Doms.style((Is.layout(`modal`)) ? frameElement.parentElement! : frameElement, style);// modal이 iframe에서 vue로 변경
				Doms.style(frameElement, style);
			}
		}

	}

	/**
	 * * (디)싱커 전환
	 * @public @static
	 * @param __elements - 싱커를 연결할 요소
	 * @param __is - 활성 여부
	 * @param __dataName - data-x 속성 이름
	 */
	public static sync(__elements: ElementSelector, __is: boolean, __dataName: string, __option?: PageSyncOption): void {

		const _classUse: string = `S=${__dataName.replace(`data-`, ``)}-use`;

		const $elements = Doms.find(__elements);
		for (let $el of $elements) {
			const data: UISyncData | string = Doms.data.get($el, __dataName);
			if (typeof data === `string`) return;

			if ($el.tagName === `OPTION`) $el = $el.closest(`select`)!;

			// syncer
			if (data.syncer != null) {
				const $syncers = Doms.find(data.syncer);
				for (const $sync of $syncers) {
					if (__is && Is.display($el)) $sync.classList.add(_classUse);
					else $sync.classList.remove(_classUse);
				}
			}

			// desyncer
			if (data.desyncer != null) {
				const $desyncers = Doms.find(data.desyncer);
				for (const $desync of $desyncers) {
					if (__is && Is.display($el)) $desync.classList.add(_classUse);
					else $desync.classList.remove(_classUse);
				}
			}
		}

	}

	/**
	 * * 로딩
	 * @public @static
	 * ! 로딩은 블록에서 사용되는 경우가 없어 mui, uico 변환 안함
	 */
	public static readonly loading: PageLoading = {
		show: Pages.loadingShow,
		hide: Pages.loadingHide,
	}

	/**
	 * * 로딩 노출
	 * + ios에서 링크가 바뀔 때 css keyframes로 적용된 모션 중 ::before, ::after 가상 요소는 움직이지 않는 이슈
	 * @param __element (default `.mm_app`) - 로딩을 노출할 부모 단일 요소
	 * @param __option
	 * @param __option._minHeight (default 0) - 로딩이 노출되는 동안 적용할 부모 요소의 높이
	 * @param __option._top (default 0) - 로딩 아이콘 top 위치
	 * @param __option._background (default ``) - background-color 스타일 값
	 * @param __option._size (default 0) - 로딩 아이콘 폰트 사이즈
	 * @param __option._text (default ``) - 로딩 아이콘 하단에 노출할 텍스트
	 * @returns
	 */
	private static loadingShow(__element: ElementSelector = `.mm_app`, __option?: PageLoadingOption): HTMLElement | undefined {

		const $element: DOMElement = Doms.find(__element)[0];
		if ($element == null) return;

		const option: Required<PageLoadingOption> = Datas.clone({
			_minHeight: 0,
			_top: 0,
			_background: ``,
			_size: 0,
			_text: ``,
		}, __option);
		const _isApp = [`HTML`, `BODY`].includes($element.tagName) || $element.classList.contains(`mm_app`);

		Pages.loadingHide($element);

		const $loading = Doms.create(
			`<div> class="mm_loading">
				<div class="mm_loading-inner">
					<i class="ico_loading S=ani-spin"></i>
					<p class="mm_ir-blind">Loading...</p>
				</div>
			</div>`
		)[0] as HTMLElement;
		$element.append($loading);

		const _position = getComputedStyle($element).position;
		Doms.style($element, { position: (![`absolute`, `relative`].includes(_position)) ? `relative` : ``, minHeight: (option._minHeight > 0) ? `${option._minHeight}px` : `` });
		Doms.style($loading, { position: (!_isApp) ? `absolute` : ``, top: `${option._top}px`, backgroundColor: option._background });

		if (option._size > 0) Doms.style(Doms.find(`.ico_loading`, $loading)[0], { fontSize: `${option._size}px`});
		if (option._text.trim().length > 0) {
			const $text = Doms.find(`.mm_ir-blind`, $loading)[0];
			$text.classList.remove(`mm_ir-blind`);
			$text.textContent = option._text;
		}

		return $loading;

	}

	/**
	 * * 로딩 숨김
	 * @param __elements (default `.mm_app`) - 로딩의 부모 요소
	 * @param __delay (default 0) - 숨김 딜레이 시간(초)
	 */
	private static loadingHide(__elements: ElementSelector = `.mm_app`, __delay: number = 0): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			const $loadings = Doms.find(`.mm_loading`, $el);
			for (const $load of $loadings) {
				gsap.to($load, {
					alpha: 0, duration: Times.FAST, delay: (__delay > 0) ? __delay : 0, ease: `cubic.in`,
					onComplete: (): void => {

						$load.remove();
						if (Doms.find(`.mm_loading`, $el).length === 0) Doms.style($el, { position: ``, minHeight: `` });

					}
				});
			}
		}

	}

	// todo: 필요 시 제작
	/*
	public static progress: PageProgress = {
		show: Pages.progressShow,
		hide: Pages.progressHide,
	}

	private static progressShow(__element: DOMSelector = `.mm_app`, __option?: PageProgressOption): HTMLElement | undefined {

		const $element = Doms.find(__element)[0];
		if ($element == null) return;

	}

	private static progressHide(__element: DOMSelector = `.mm_app`, __delay: number = 0): void {

		//

	}
	*/

	/**
	 * * 소셜태그
	 * @public @static
	 */
	public static readonly socialTag: PageSocialTag = {
		set: Pages.socialTagSet,
		get: Pages.socialTagGet,
		remove: Pages.socialTagRemove,
	}

	private static socialTagKey: PageSocialTagKey = {
		title: `og:title`,
		type: `og:type`,
		image: `og:image`,
		url: `og:url`,
		description: `og:description`,
		siteName: `og:site_name`,
		card: `twitter:card`,
		imageAlt: `twitter:image:alt`,
	}

	private static socialTagSelector: string = `meta[property^="og"], meta[name^="twitter"]`;

	/**
	 * * 소셜태그 추가/변경
	 * @param __option
	 * @param __option.title - og:title
	 * @param __option.type - og:type(`article` | `book` | `profile` | `website` | `video.movie` | `video.episode` | `video.tv_show` | `video.other` | `music.song` | `music.album` | `music.playlist` | `music.radio_station`);
	 * @param __option.image - og:image
	 * @param __option.url - og:url
	 * @param __option.description - og:description
	 * @param __option.siteName - og:site_name
	 * @param __option.card - twitter:card
	 * @param __option.imageAlt - twitter:image:alt
	 */
	private static socialTagSet(__option: PageSocialTagOption): void {

		// <meta property="og:title" content="European Travel Destinations">
		// <meta property="og:type" content="article" />
		// <meta property="og:image" content="http://euro-travel-example.com/thumbnail.jpg">
		// <meta property="og:url" content="http://euro-travel-example.com/index.htm">
		// <meta name="twitter:card" content="summary_large_image">

		// <meta property="og:description" content="Offering tour packages for individuals or groups.">
		// <meta property="og:site_name" content="European Travel, Inc.">
		// <meta name="twitter:image:alt" content="Alt text for image">

		const option: Required<PageSocialTagOption> = Datas.clone({
			title: ``,
			type: ``,
			image: ``,
			url: ``,
			card: ``,
			description: ``,
			siteName: ``,
			imageAlt: ``,
		}, __option);
		const $target = (Doms.find(`title`)[0] ?? Doms.find(`head`)[0]);

		for (const _key in option) {
			const _value = option[_key as keyof PageSocialTagOption];
			if (_value.length === 0) continue;

			const _type = Pages.socialTagKey[_key as keyof PageSocialTagKey];
			const _attr = (_type.startsWith(`twitter`)) ? `name` : `property`;
			const $meta = Doms.find(`[${_attr}="${_value}"]`)[0];
			if ($meta != null) $meta.setAttribute(`content`, _value);// 내용 변경
			else Doms[($target.tagName === `TITLE`) ? `after` : `append`]($target, `<meta ${_attr}="${_type}" content="${_value}">`);// 새로 추가
		}

	}

	/**
	 * * 소셜태그 가져오기
	 * @param __key - 값이 있으면 해당 내용만 없으면 전체를 리턴
	 * @returns
	 */
	private static socialTagGet(__key?: keyof PageSocialTagOption): PageSocialTagOption | string | undefined {

		const option: PageSocialTagOption = {};

		const $elements = Doms.find(Pages.socialTagSelector) as HTMLMetaElement[];
		for (const $el of $elements) {
			const entries = Object.entries(Pages.socialTagKey);
			for (const [_k, _v] of entries) if (_v === $el.getAttribute(`property`) ?? $el.name) option[_k as keyof PageSocialTagOption] = $el.content as any;
		}

		return (__key == null) ? option : option[__key];

	}

	/**
	 * * 소셜태그 삭제
	 * @param __key - 값이 없으면 전체 삭제
	 */
	private static socialTagRemove(__key?: keyof PageSocialTagOption | Array<keyof PageSocialTagOption>): void {

		if (__key == null) return Doms.remove(Pages.socialTagSelector);// 전체 삭제

		if (typeof __key === `string`) __key = [__key];

		for (const _key of __key) {
			const $el = Doms.find(`meta[${([`card`, `imageAlt`].includes(_key)) ? `name` : `property`}="${Pages.socialTagKey[_key]}"]`, document.head)[0];
			if ($el != null) $el.remove();
		}

	}

	/** 링크 타입 별 실행 함수 */
	private static linkApplyMap: Record<PageLinkType, ArrowFunc> = {
		anchor: (__url: string, __option: DomScrollToOption): void => {

			Doms.scroll.to(__url, __option);

		},
		modal: (__url: string, __option: PageModalOption): void => {

			Pages.modalOpen(__url, __option)

		},
		popup: (__url: string, __option: PagePopupOption): void => {

			Pages.popupOpen(__url, __option)

		},
		link: (__url: string): void => {

			Pages.modalClose();
			Pages.loadingHide();

			// 로딩 모션 적용으로 딜레이 필요
			setTimeout(() => {

				// url이 같으면 리로드
				if (__url === top!.location.href) top!.location.reload();
				else top!.location.href = __url;

				if (Is.mobile(`ios`) || /firefox/i.test(navigator.userAgent)) Pages.loadingHide();// ios. firefox에서 뒤로가기 시 로딩바가 사라지지 않는 이슈로 hide 적용

			}, (Is.mobile()) ? 100 : 1);

		},
		home: (): void => {

			top!.location.href = `/`;

		},
		reload: (): void => {

			location.reload();

		},
		back: (__option: PageLinkOption): void => {

			history.go(-(__option._step ?? 1));

		},
		forward: (__option: PageLinkOption): void => {

			history.go(__option._step ?? 1);

		},
	}

	/**
	 * * 링크
	 * + anchor, modal, popup, home, link(modal.close, loading.show)
	 * @public @static
	 * @param __url
	 * @param __option - PageFrameResizeOption, PageModalOption, PagePopupOption 상속
	 * @param __option._type - 링크 타입(link, popup, modal, anchor, home)
	 */
	public static link(__url: string, __option?: PageLinkOption): void | boolean {

		if (typeof __url !== `string`) return false;
		if (/^\/\/|^http\:|^https\:|www\./.test(__url) && !new RegExp(location.host, 'i').test(__url)) {
			console.log('도메인이 다릅니다.\nlocation.href/window.open/target="_blank"로 연결해주세요.');
			return false;
		}

		const _urlPathName = __url.replace(location.origin, ``).split(`#`)[0];
		const option: PageLinkOption = Datas.clone({
			_type: `link`,
		}, __option);
		if (_urlPathName === `/`) option._type = `home`;

		Pages.linkApplyMap[option._type!](__url, option);

	}

	/**
	 * * 모달
	 * @public @static
	 */
	public static readonly modal: PageModal = {
		get $openEl() { return Pages.modalOpenElement; },
		get $opener() { return Pages.modalOpener; },
        open: Pages.modalOpen,
		close: Pages.modalClose,
		resize: Pages.modalResize,
	}

	public static readonly MODAL_CLASS_HTML = `S=modal`;
	public static readonly MODAL_CLASS_ON = `S=modal-on`;
	public static readonly MODAL_CLASS_OLD = `S=modal-old`;

	private static $modal: undefined | HTMLElement;

	/** 모달 아이템 생성 카운트 */
	private static _modalItemCount: number = 0;
	private static modalItems: PageModalItem[] = [];

	/** 모달을 열 때 클릭한 요소 */
	private static get modalOpenElement(): Window | HTMLElement | null {

		if (frameElement != null) return Utils.apply(`top.mm.modal.$openEl`);// 최상위에서 실행
		if (Is.layout(`modal`)) return window.opener;// window 모달

		const $modalItem = Doms.find(`.${Pages.MODAL_CLASS_ON}`, Pages.$modal)[0];
		const data = Doms.data.get($modalItem, `data-modal`) as Record<`_itemId`, string>;

		return Pages.modalItems[Number(data._itemId)].$openEl ?? null;

	}

	/** 모달 오프너 */
	private static get modalOpener(): Window | null {

		if (frameElement != null) return Utils.apply(`top.mm.modal.$opener`);// 최상위에서 실행
		if (Is.layout(`modal`)) return window.opener;// window 모달

		const $openEl = Pages.modalOpenElement;
		let $openDocument = ($openEl != null) ? ($openEl instanceof Window) ? $openEl.document : $openEl.ownerDocument : document;

		return $openDocument.defaultView;

	}

	/**
	 * * 모달 열기
	 * @param __url
	 * @param __option
	 * @param __option.openEl (default null) - modal.openEl로 리턴할 요소
	 * @param __option._frameId (default ``) - 아이프레임 id 속성 값
	 * @param __option._frameName (default ``) - 아이프레임 name 속성 값
	 * @param __option._frameTitle (default ``) - 아이프레임 title 속성 값
	 * @param __option._isFull (default false) - 화면에 꽉차게 노출
	 * @param __option._isHeader (default true) - 헤더 노출
	 * @param __option._isCloseOutside (default false) - dim 요소를 클랙해서 닫기
	 * @param __option.classes (default []) - 생성된 modal-item 요소에 추가할 클래스
	 * @param __option.onReady (default null)
	 * @param __option.onReadyParams (default [])
	 * @param __option.onLoad (default null)
	 * @param __option.onLoadParams (default [])
	 * @returns
	 */
	private static modalOpen(__url: string, __option?: PageModalOption): HTMLElement {

		if (frameElement != null) return Utils.apply(`mm.modal.open`, [__url, __option]);// 최상위에서 실행

		const option: Required<PageModalOption> = Datas.clone({
			openEl: null,
			_frameId: ``,
			_frameName: ``,
			_frameTitle: ``,
			_isFull: false,
			_isHeader: true,
			_isCloseOutside: false,
			classes: [],
			onReady: null,
			onReadyParams: [],
			onLoad: null,
			onLoadParams: [],
		}, __option);

		// 모달 영역 생성
		if (Pages.$modal == null) {
			Pages.$modal = Doms.create(
				`<div class="mm_modal">
					<div class="mm_modal-items"></div>
				</div>`
			)[0] as HTMLElement;
			Doms.find(`.mm_app`)[0].append(Pages.$modal);
		}

		const $items = Doms.find(`.mm_modal-item`, Pages.$modal);
		Doms.class.remove($items, Pages.MODAL_CLASS_ON);
		Doms.class.add($items, Pages.MODAL_CLASS_OLD);

		if ($items.length === 0) Doms.scroll.off();// 처음 생성할 때만 적용
		document.documentElement.classList.add(Pages.MODAL_CLASS_HTML);

		// 요소 생성(iframe 요소에 #앵커 url 지원 안함)
		const modalItem: PageModalItem = {
			$item: Doms.create(
				`<div class="mm_modal-item">
					<div class="mm_modal-item-dim"></div>
					<div class="mm_modal-item-inner">
						<button type="button" class="btn_modal-close" onclick="mm.modal.close();">
							<i class="ico_modal-close"></i>
							<b class="mm_ir-blind">모달 닫기</b>
						</button>
						<iframe scrolling="no"></iframe>
					</div>
				</div>`
			)[0] as HTMLElement,
			$openEl: option.$openEl,
		}

		if (option._isCloseOutside) Doms.attribute(Doms.find(`.mm_modal-item-dim`, modalItem.$item), { tabIndex: `0`, onclick: `mm.modal.close();` });
		if (option._isFull) modalItem.$item.classList.add(`S=modal-full`);
		if (option.classes.length > 0) Doms.class.add(modalItem.$item, option.classes);

		Doms.data.set(modalItem.$item, `data-modal`, { _itemId: Pages._modalItemCount++ });
		Doms.find(`.mm_modal-items`, Pages.$modal)[0].append(modalItem.$item);

		// 흰화면이 오래 노출되는 이슈로 로드 전 레디 상태에서 팝업 노출
		Events.observer.on(modalItem.$item, Events.type[`frame_ready`], (__e: CustomEvent): void => {

			modalItem.$item.classList.add(Pages.MODAL_CLASS_ON);
			Utils.apply(option.onReady, [modalItem.$item, ...option.onReadyParams]);

		}, { _isOnce: true });

		const $iframe = Doms.find(`iframe`, modalItem.$item)[0];
		Doms.attribute($iframe, (): ObjectCollection => {

			const attr: ObjectCollection = { [`data-preload`]: { _src: __url.split(`#`)[0] }};
			if (option._frameId) attr.id = option._frameId;
			if (option._frameName) attr.name = option._frameName;
			if (option._frameTitle) attr.title = option._frameTitle;

			return attr;

		});

		const modalLazyloadCompleteHandler = () => {

			if (!option._isHeader) Doms.find(`.mm_header`, $iframe)[0].remove();
			if (Doms.find(`.btn_modal-close`, $iframe)[0] != null) Doms.remove(Doms.find(`.btn_modal-close`, modalItem.$item));// iframe 내부에 같은 버튼이 있으면 삭제

			Pages.modalResize();
			Times.delay.on(Doms.focus.in, { _time: Times.BASE, _isSec: true, _name: `DELAY_FOCUS_MODAL`, _isOverwrite: true, params: [modalItem.$item] });
			Utils.apply(option.onLoad, [modalItem.$item, ...option.onLoadParams]);

		}
		Lazyload.update($iframe, { onComplete: modalLazyloadCompleteHandler, onError: Pages.modalClose });

		return modalItem.$item;

	}

	/**
	 * * 모달 닫기
	 * @param __callback
	 * @param __params - 콜백 파라미터
	 */
	private static modalClose(__callback?: ArrowFunc, __params?: unknown[]): void {

		if (frameElement != null) return Utils.apply(`mm.modal.close`, [__callback, __params]);// 최상위에서 실행
		if (Is.layout(`modal`)) return window.close();
		if (Pages.$modal == null) return;

		const $items = Doms.find(`.mm_modal-item`, Pages.$modal);
		if ($items.length === 0) return;

		const $lastItem = $items[$items.length - 1];
		$lastItem.classList.remove(Pages.MODAL_CLASS_ON);

		const itemTransitionEndHandler = (): void => {

			$lastItem.remove();

			const data = Doms.data.get($lastItem, `data-modal`) as Record<`_itemId`, string>
			delete Pages.modalItems[Number(data._itemId)];

			// 모달 영역 삭제 2
			if ($items.length === 1) {
				Pages.$modal?.remove();
				Pages.$modal = undefined;

				Doms.scroll.on();
			}

		}
		Events.bind.on($lastItem, `transitionend`, itemTransitionEndHandler, { _isOnce: true });

		if ($items.length > 1) {
			const $prevItem = $lastItem.previousElementSibling!;
			$prevItem.classList.remove(Pages.MODAL_CLASS_OLD);
			$prevItem.classList.add(Pages.MODAL_CLASS_ON);
		}
		// 모달 영역 삭제 1
		else document.documentElement.classList.remove(Pages.MODAL_CLASS_HTML);

		Utils.apply(__callback, __params);

	}

	/**
	 * * 모달 리사이즈
	 * @param __option
	 * @param __option._isLoad (default false) - 페이지 ready, load로 실행
	 * @param __option._isEven (default false) - 높이를 짝수로 적용
	 * @param __option._extraHeight (default 0) - 높이에 추가로 계산할 값
	 */
	private static modalResize(__option?: PageModalResizeOption): void {

		// PageFrameResizeOption 상속
		const option: Required<PageModalResizeOption> = Datas.clone({
			_isLoad: false,
			_isEven: false,
			_extraHeight: 0,
		}, __option);

		if (Is.layout(`modal`)) {
			// window 모달
			if (frameElement == null) {
				const $framecontent = Doms.find(`.mm_page-content`)[0];
				const frameWidth = window.outerWidth - window.innerWidth;
				const frameHeight = window.outerHeight - window.innerHeight;

				window.resizeTo($framecontent.offsetWidth + frameWidth, $framecontent.offsetHeight + frameHeight + Doms.find(`.mm_header`)[0].offsetHeight);
			}
			// 페이지 모달 내부
			else Pages.frameResize(undefined, option);// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?
		}
		// 페이지 모달 외부
		else {
			const $frame = Utils.apply(`top.mm.find`, [`.${Pages.MODAL_CLASS_ON} iframe`, Pages.$modal]);
			Pages.frameResize($frame, option);// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?
		}

	}

	/**
	 * * 팝업
	 * @public @static
	 */
	public static readonly popup: PagePopup = {
        get $openEl() { return Pages.popupOpenElement; },
		get $opener() { return Pages.popupOpener; },
        open: Pages.popupOpen,
		close: Pages.popupClose,
		resize: Pages.popupResize,
	}

	/** 팝업을 열 때 클릭한 요소 */
	private static popupOpenElement: Window | HTMLElement | null = null;

	/** 오프너 */
	private static get popupOpener(): Window | null {

		return window.opener;

	}

	private static popupOpen(__url: string, __option?: PagePopupOption): Window | null {

		const option: Required<PagePopupOption> = Datas.clone({
			openEl: null,
			_name: ``,
			specs: {
				_top: 0,
				_left: 0,
				_width: 0,
				_height: 0,
				_isTitlebar: false,
				_isMenubar: false,
				_isToolbar: false,
				_isLocation: false,
				_isScrollbars: true,
				_isStatus: false,
				_isResizable: false,
			},
		}, __option);

		if (option.specs._width === 0) option.specs._width = window.innerWidth;
		if (option.specs._height === 0) option.specs._height = window.innerHeight;

		const _spec = Object.entries(option.specs).map(__source => `${__source[0].replace(/_|is/gi, ``)}=${(typeof __source[1] === `boolean`) ? (__source[1]) ? `yes` : `no` : __source[1]}`).join(`,`).toLowerCase();
		const $popup = window.open(__url, option._name, _spec);
		if ($popup != null) {
			$popup.resizeTo(option.specs._width, option.specs._height);
			$popup.moveTo(option.specs._left, option.specs._top);
		}
		else Pages.alert(`브라우저에서 팝업 차단을 해제해주세요`);

		return $popup;

	}

	/**
	 * * 팝업 닫기
	 * @param __callback
	 * @param __params - 콜백 파라미터
	 */
	private static popupClose(__callback?: ArrowFunc, __params?: unknown[]): void {

		Utils.apply(__callback, __params);
		window.close();

	}

	/**
	 * * 팝업 리사이즈
	 */
	private static popupResize(): void {

		if (!Is.layout(`popup`)) return;

		// 리사이즈 과정에서 innerWidth 또는 innerHeight가 변경되지 않는 경우 resize 재실행
		if (window.innerWidth > window.outerWidth || window.innerHeight > window.outerHeight) return Times.delay.on(Pages.popupResize);

		let _borderWidth = parseFloat(Doms.style(`.mm_view`, `borderWidth`)) * 2;
		if (Number.isNaN(_borderWidth)) _borderWidth = 0;

		const $frameContent = Doms.find(`.mm_page-content`)[0];
		const _scrollWidth = (window.innerWidth === document.documentElement.offsetWidth) ? window.outerWidth - window.innerWidth : window.outerWidth - document.documentElement.offsetWidth;
		const _scrollHeight = window.outerHeight - window.innerHeight;
		window.resizeTo($frameContent.offsetWidth + _scrollWidth + _borderWidth, $frameContent.offsetHeight + Doms.find(`.mm_header`)[0].offsetHeight + _scrollHeight + _borderWidth);

	}





	// ! 필요 시 제작
	public static alert(__text: string): void {

		//

	}

}

export default Pages;