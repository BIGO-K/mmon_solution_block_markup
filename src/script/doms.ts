/**
 * @class DOM 조작
 * @static
 */

import { gsap } from 'gsap';
import Datas from './datas';
import Events from './events';
import Is from './is';
import Times from './times';
import Utils from './utils';

class Doms {

	/**
     * * 자식 요소 검색
	 * @public @static
     * @param __elements
     * @param __parents - 값이 없으면 페이지 전체에서 검색, iframe 내부를 검색할 때는 단일 요소로 적용
     * @returns
     */
	public static find<T extends keyof HTMLElementTagNameMap>(__elements: T, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): HTMLElementTagNameMap[T][];
	public static find(__elements?: ElementSelector, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): ElementList;
	public static find(__elements?: DOMSelector, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): DOMList;
	public static find(__elements?: DOMSelector, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): unknown {

		if (!__elements || (__parents != null && typeof __parents !== `object`)) return [];// object, array, element, document, window
		if (Array.isArray(__elements) && __elements.context === `DOMList` && __parents == null) return __elements;

		let $parents: DOMList = (!__parents) ? [document] : (Is.element(__parents, [document, window])) ? [__parents] : Object.values(__parents).filter(__$pa => Is.element(__$pa, [document, window]));
		if ($parents.length === 1 && $parents[0] instanceof HTMLIFrameElement) $parents[0] = $parents[0].contentDocument!;// iframe 요소 내부 검색을 위해 contentDocument로 변경
		if ($parents.length === 0 || $parents[0] == null) return [];// filter 결과가 없거나 iframe 내부 접근 불가
		let $elements: DOMList = [];

		// 문자열로 검색
		if (typeof __elements === `string`) {
			$elements = [...new Set($parents.flatMap(__$pa => {

				const _selector = __elements.trim();
				let $collection: DOMCollection = [];

				if (__$pa instanceof Window) __$pa = __$pa.document;// window는 document로 변경

				// data attribute
				if (_selector.startsWith(`data-`)) $collection = __$pa.querySelectorAll(`[${_selector}]`);
				else {
					const splits = _selector.split(/[\#\.\s\[\]]/g);
					const _splitTotal = (/[\:\,]/.test(_selector)) ? 0 : splits.length;// querySelector 강제 적용

					if (_splitTotal === 1) $collection = __$pa.getElementsByTagName(_selector);
					else if (_splitTotal === 2 && splits[0] === ``) {
						if (_selector.startsWith(`.`)) $collection = __$pa.getElementsByClassName(splits[1].replace(`\\`, ``));// className에서는 escape 제거
						else if (_selector.startsWith(`#`)) {
							const $id = (__$pa instanceof Document) ? __$pa.getElementById(splits[1]) : __$pa.querySelector(_selector);
							if ($id) $collection.push($id);
						}
					}
					else {
						// :scope(> + ~ 셀렉터 대응)
						// if (`documentElement` in __$pa) __$pa = document.documentElement;// 없어도 문제 없는 듯...
						$collection = __$pa.querySelectorAll(`:scope ${_selector.replace(/\,/g, `, :scope `)}`);
					}
				}

				return Object.values($collection);

			}))];
		}
		// 요소에서 검색
		else {
			if (Is.element(__elements, [document, window])) $elements.push(__elements as DOMElement);
			else {
				switch (__elements.constructor.name) {
					case `HTMLCollection`:
					case `NodeList`:
						$elements = Object.values(__elements);
						break;
					case `jQuery`:
					case `Array`:
						$elements = Object.values(__elements).filter(__$el => Is.element(__$el, [document, window]));
						break;
				}
			}

            $elements = $elements.filter(__$el => {

				return (__parents == null) ? true : $parents.some(__$pa => {

					const $parent = (__$pa instanceof Window) ? __$pa.document : __$pa;
					return __$pa !== __$el && !(__$el instanceof Window) && $parent.contains(__$el);

				});

			});
		}

		$elements.context = `DOMList`;// find로 재검색 방지

		return $elements;

	}

	/**
     * * 형제 요소 검색
	 * @public @static
     * @param __elements
     * @param __selector - 값이 없으면 전체 형제 요소 리턴
     * @returns
     */
	public static siblings(__elements: Exclude<ElementSelector, string>, __selector?: string): ElementList {

		if (typeof __elements !== `object`) return [];

		const $selves: HTMLElement[] = (__elements instanceof HTMLElement) ? [__elements] : Object.values(__elements).filter(__$el => __$el instanceof HTMLElement);
		if ($selves.length === 0) return [];

		const $elements = [...new Set($selves.flatMap(__$self => (!__$self.parentElement) ? [] : Object.values(__$self.parentElement.children).filter(__$child => (typeof __selector === `string`) ? __$child.matches(__selector) : __$child !== __$self)))] as ElementList;
		$elements.context = `DOMList`;// find로 재검색 방지

		return $elements;

	}

	/**
	 * * 상위 요소 검색
	 * @public @static
	 * @param __elements
	 * @param __selector
	 * @returns
	 */
	public static closest(__elements: Exclude<ElementSelector, string>, __selector: string): ElementList {

		if (!__elements) return [];

		const $selves: HTMLElement[] = (__elements instanceof HTMLElement) ? [__elements] : Object.values(__elements).filter(__$el => __$el instanceof HTMLElement);
		if ($selves.length === 0) return [];

		const $elements = [...new Set($selves.map(__$self => __$self.closest(__selector)))].filter(__$el => __$el != null) as ElementList;
		$elements.context = `DOMList`;// find로 재검색 방지

		return $elements;

	}

	/**
	 * * 데이터 속성(data-x)
	 * @public @static
	*/
	public static readonly data: DomData = {
		set: Doms.dataSet,
		get: Doms.dataGet,
	}

	/**
	 * * 데이터 속성 저장 및 확인
	 * @param __$element - 단일 요소
	 * @param __name - data-x 속성 이름
	 * @param __data - 저장할 값
	 * @param __isExtend - (default true) 기본 속성을 확장하여 저장, 값이 false이면 새로 저장
	 */
	private static dataSet<T>(__$element: HTMLElement, __name: string, __data: Partial<T>, __isExtend: boolean = true): void {

		const _name = __name.replace(`data-`, ``);
		const data: Partial<T> = (__isExtend) ? Datas.clone(Doms.dataGet(__$element, _name), __data) : __data;
        Doms.attribute(__$element, { [`data-${_name}`]: data });

	}

	/**
	 * * 데이터 속성 확인
	 * @param __$element - 단일 요소
	 * @param __name - data-x 속성 이름
	 * @returns
	 */
	private static dataGet<T>(__$element: HTMLElement, __name: string): Partial<T> | string {

		const _name = __name.replace(`data-`, ``);
		const _value: string = __$element.dataset[_name] ?? ``;

		return (_value.startsWith(`{`)) ? JSON.parse(_value.replace(/\'/g, `"`).replace(/\t/g, ` `).replace(/\n/g, `\\n`)) : _value;

	}

	/**
	 * * 프로퍼티
	 * 여러 프로퍼티를 관리할 때 사용
	 * @public @static
	 * @param __elements
	 * @param __property - 요소에 적용할 프로퍼티 객체
	 */
	public static property(__elements: ElementSelector, __property: ObjectCollection): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			for (const _key in __property) ($el as ObjectCollection)[_key] = (Is.empty(__property[_key])) ? false : __property[_key];
		}

	}

	/**
	 * * 속성
	 * @public @static
	 * 여러 속성을 추가하거나 data-속성 값에 사용하고, 단일 속성은 setAttribute 사용
	 * 속성 값이 없거나 false면 삭제, true면 빈 값(``)없이 속성만 추가 됨
	 * 속성 값 타입이 object면 JSON.stringify로 적용(단, "더블퀏"이 '싱글퀏'으로 적용 됨)
	 * @param __elements
	 * @param __attribute - 요소에 적용할 속성 객체
	 */
	public static attribute(__elements: ElementSelector, __attribute: ObjectCollection): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			for (const _key in __attribute) {
				const value: unknown = __attribute[_key];

				// 값이 없거나 false이면 삭제
				if (Is.empty(value) || value === false) return $el.removeAttribute(_key);

				if (_key === `style`) {
					Doms.style($el, ((): Partial<CSSStyleDeclaration> => {

						if (Is.object(value)) return value;
						else if (typeof value === `string`) return Object.fromEntries(value.split(`;`).map(__source => __source.split(`:`).map(__word => __word.trim())));
						else return {};

					})());
				}
				else $el.setAttribute(_key, (value === true) ? `` : (typeof value === `object`) ? JSON.stringify(value).replace(/"/g, `\'`) : String(value));
			}
		}

	}

	/**
     * * 스타일
	 * @public @static
     * @param __elements
     * @param __style - 값이 없거나 오브젝트 타입이면 요소에 스타일을 적용하고 전체 스타일을 리턴하고, 스트링 타입이면 해당하는 스타일 값만 리턴
     * @returns
     */
	public static style(__elements: ElementSelector, __style?: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
	public static style(__elements: ElementSelector, __style: keyof CSSStyleDeclaration): string;
	public static style(__elements: ElementSelector, __style?: keyof CSSStyleDeclaration | Partial<CSSStyleDeclaration>): unknown {

		const $elements = Doms.find(__elements);

		// 스타일 적용
		if (Is.object(__style)) {
			for (const $el of $elements) {
				for (const _key in __style) $el.style[_key] = __style[_key] ?? ``;// 값이 undefined이면 ``빈 값 적용
			}
		}

		// 첫 번째 요소의 스타일 리턴
		if ($elements[0] != null) {
			const css = getComputedStyle($elements[0]);
			return (typeof __style === `string`) ? css[__style] : css;
		}
		else return ``;

	}

	/**
	 * * 스크롤
	 * @public @static
	 */
	public static readonly scroll: DomScroll = {
        get element() { return Doms.scrollFind(); },
		find: Doms.scrollFind,
		to: Doms.scrollTo,
		position: Doms.scrollPosition,
		toggle: Doms.scrollToggle,
		on: Doms.scrollOn,
		off: Doms.scrollOff,
	}

	/**
	 * * 내부 스크롤 검색
	 * @param __element - 단일 요소
	 * @param __isClosest - 검색 방향을 상위 요소로 변경
	 * @returns
	 */
	private static scrollFind(__element?: undefined, __isClosest?: undefined): HTMLElement;
	private static scrollFind(__element: DOMSelector, __isClosest: true): HTMLElement;
	private static scrollFind(__element: DOMSelector, __isClosest?: boolean): HTMLElement | null;
	private static scrollFind(__element?: DOMSelector, __isClosest?: boolean): unknown {

		const $element = Doms.find(__element)[0];

		if ($element == null || $element instanceof Window || $element instanceof Document || [`HTML`, `BODY`].includes($element.tagName)) return document.querySelector(`.mm_page > .mm_scroller`) ?? document.documentElement;
		else if ($element.classList.contains(`mm_scroll`)) return $element;
		else return (__isClosest) ? $element.closest(`.mm_scroller`) ?? document.documentElement : $element.querySelector(`.mm_scroller`) ?? null;

	}

	/**
	 * * 스크롤 이동
	 * @param __target 단일 요소 또는 스크롤 위치(px)
	 * @param __option
	 * @param __option.scroller (default null) - 스크롤 요소
	 * @param __option._orientation (default `vertical`) - vertical(세로), horizontal(가로)
	 * @param __option._margin (default 0) - 스크롤 위치 조정(px)
	 * @param __option._time (default Times._FAST) - 스크롤 이동 모션 시간(초), 값이 0이면 바로 이동
	 * @param __option._isFocus (default false) - __target이 단일 요소일 때 이동 후 __target에 포커스 여부
	 * @param __option.onStart (default null) - 스크롤 이동 전 콜백
	 * @param __option.onStartParams (default [])
	 * @param __option.onComplete (default null) - 스크롤 이동 후 콜백
	 * @param __option.onCompleteParams (default [])
	 * @returns
	 */
	private static scrollTo(__target: ElementSelector | number, __option?: DomScrollToOption): void {

		const target = (typeof __target === `number`) ? __target : Doms.find(__target)[0];
		if (typeof target === `number` && !Number.isFinite(target)) return;

		const option: Required<DomScrollToOption> = Datas.clone({
			scroller: null,
			_orientation: `vertical`,
			_margin: 0,
			_time: Times.FAST,
			_isFocus: false,
			onStart: null,
			onStartParams: [],
			onComplete: null,
			onComplereParams: [],
		}, __option);
		option.scroller = (option.scroller == null) ? Doms.scroll.element : (option.scroller instanceof Window) ? document.documentElement : option.scroller;

		Utils.apply(option.onStart, option.onStartParams);

		const _scroll = ((typeof target === `number`) ? target : ((): number => {

			const position = Doms.position(target)!;

			return (option._orientation === `vertical`) ? position.top : position.left;

		})()) - option._margin;

		gsap.to(option.scroller, {
			[(option._orientation === `vertical`) ? `scrollTop` : `scrollLeft`]: _scroll,
			duration: option._time,
			ease: `sine.out`,
			onComplete: (): void => {

				if (option._isFocus && target instanceof HTMLElement) Times.delay.on(Doms.focusIn, { _name: `DELAY_FOCUS_SCROLL`, _isOverwrite: true, params: [target] });// 중복 실행 방지
				Utils.apply(option.onComplete, option.onCompleteParams);

			}
		});

	}

	/**
	 * * 스크롤 위치
	 * @param __element 단일 요소
	 * @returns
	 */
	private static scrollPosition(__element: DOMSelector): DomPosition | undefined {

		const $element = Doms.find(__element)[0];

		if ($element instanceof HTMLElement) return { top: $element.scrollTop, left: $element.scrollLeft };
		else if ($element instanceof Window) return { top: $element.scrollY, left: $element.scrollX };
		else if ($element instanceof Document) return { top: $element.documentElement.scrollTop, left: $element.documentElement.scrollLeft };
		else return undefined;

	}

	/**
	 * * 스크롤 허용/차단 토글
	 * + pc에서 스크롤이 없어지면서 화면이 흔들리는 이슈로 스크립트에서 위치 조절(fixed에서는 가로 스크롤 적용 안됨)
	 * @param __is - 허용, 차단 여부
	 */
	private static scrollToggle(__is?: boolean): void {

		// todo: html 대신 mm_view 로 감지 이동?(레이아웃, 모달, 봄, 스크롤 등)
		const _classNo = `S=noscroll`;
		const _isMobile = Is.mobile();
		const $element = (_isMobile) ? Doms.find(`.mm_view`).find((__item, __i, __list) => __i + 1 === __list.length) : document.documentElement;
		if ($element == null) return;

		const _is = (typeof __is === `boolean`) ? __is : (Doms.find(`.S=bom`).length === 0 || Doms.find(`.S=modal`).length === 0) ? false : document.documentElement.classList.contains(_classNo);// BOM 또는 모달이 있으면 차단으로 유지
		if (_is) {
			$element.classList.remove(_classNo);

			// pc
			if (!_isMobile) {
				Doms.style(`.mm_app`, { top: `${-document.documentElement.scrollTop}px` });
				Doms.style(document.body, { overflow: `hidden` });
			}
		}
		else {
			$element.classList.add(_classNo);

			// pc
			if (!_isMobile) {
				const offset = Doms.offset(`.mm_app`) ?? { top: 0, left: 0 };
				Doms.style(`.mm_app`, { top: `` });
				Doms.style(document.body, { overflow: `` });
				$element.scrollTop = -offset.top;// todo: 위치 테스트
			}
		}

	}

	/**
	 * * 스크롤 허용
	 */
	private static scrollOn(): void {

		Doms.scrollToggle(true);

	}

	/**
	 * * 스크롤 차단
	 */
	private static scrollOff(): void {

		Doms.scrollToggle(false);

	}

	/**
	 * * 요소의 위치(통합)
	 * @param __element - 단일 요소
	 * @param __type - offset, clirent, position
	 * @returns
	 */
	private static axis(__element: HTMLElement, __type: `offset` | `client` | `position`): DomPosition;
	private static axis(__element: ElementSelector, __type: `offset` | `client` | `position`): DomPosition | undefined;
	private static axis(__element: ElementSelector, __type: `offset` | `client` | `position`): unknown {

		const $element = Doms.find(__element)[0];
		if ($element == null) return undefined;

		const rect = ($element instanceof HTMLHtmlElement) ? { top: 0, left: 0 } : $element.getBoundingClientRect();
		if (__type === `offset`) return { top: rect.top, left: rect.left };

		const $scroll = Doms.scrollFind($element, true);
		const scrollRect = ($scroll instanceof HTMLHtmlElement) ? { top: 0, left: 0 } : $scroll.getBoundingClientRect();
		if (__type === `client`) return { top: rect.top - scrollRect.top, left: rect.left - scrollRect.left };

		return { top: rect.top - scrollRect.top + $scroll.scrollTop, left: rect.left - scrollRect.left + $scroll.scrollLeft };

	}

	/**
	 * * 브라우저에서 보여지는 위치
	 * @public @static
	 * @param __element - 단일 요소
	 * @returns
	 */
	public static offset(__element: HTMLElement): DomPosition;
	public static offset(__element: ElementSelector): DomPosition | undefined;
	public static offset(__element: ElementSelector): unknown {

		return Doms.axis(__element, `offset`);

	}

	/**
	 * * 스크롤 영역에서 보여지는 위치
	 * @public @static
	 * @param __element - 단일 요소
	 * @returns
	 */
	public static client(__element: HTMLElement): DomPosition;
	public static client(__element: ElementSelector): DomPosition | undefined;
	public static client(__element: ElementSelector): unknown {

		return Doms.axis(__element, `client`);

	}

	/**
	 * * 스크롤 영역 내 실제 위치(scroll + offset)
	 * @public @static
	 * @param __element - 단일 요소
	 * @returns
	 */
	public static position(__element: HTMLElement): DomPosition;
	public static position(__element: ElementSelector): DomPosition | undefined;
	public static position(__element: ElementSelector): unknown {

		return Doms.axis(__element, `position`);

	}

	/**
	 * * 요소 인덱스 검색
	 * @param __element - 단일 요소 또는 셀렉터
	 * @param __$lists - 인덱스를 검색할 요소 목록
	 * @param __isReverse (default false) - 역방향으로 인덱스 검색
	 * @returns
	 */
	private static findIndex(__element: HTMLElement | string, __$lists?: ElementCollection, __isReverse: boolean = false): number {

		let $element: HTMLElement | undefined;
		let $lists = (__$lists == null) ? [] : Object.values(__$lists);

		if (__element instanceof HTMLElement && __element.parentElement != null) {
			$element = __element;
			if ($lists.length === 0) $lists = Object.values(__element.parentElement.children);
		}
		else if (typeof __element === `string` && $lists.length > 0) $element = $lists.find(__$item => __$item instanceof HTMLElement && __$item.matches(__element)) as typeof $element;

		if ($element == null || $lists.length === 0) return -1;
		else return ((__isReverse) ? $lists.reverse() : $lists).indexOf($element);

	}

	/**
	 * * 요소 인덱스 검색
	 * @public @static
	 * @param __element - 단일 요소 또는 셀렉터
	 * @param __$lists - 인덱스를 검색할 요소 목록
	 * @returns
	 */
	public static index(__element: HTMLElement | string, __$lists?: ElementCollection): number {

		return Doms.findIndex(__element, __$lists);

	}

	/**
	 * * 요소 인덱스 역방향 검색
	 * @public @static
	 * @param __element - 단일 요소 또는 셀렉터
	 * @param __$lists - 인덱스를 검색할 요소 목록
	 * @returns
	 */
	public static lastIndex(__element: HTMLElement | string, __$lists?: ElementCollection): number {

		return Doms.findIndex(__element, __$lists, true);

	}

	/** 요소의 display 속성 값  */
	private static displayValueMap: Record<string, string> = {
		LI: `list-item`,
		TABLE: `table`,
		CAPTION: `table-caption`,
		COLGROUP: `table-column-group`,
		COL: `table-column`,
		THEAD: `table-header-group`,
		TBODY: `table-row-group`,
		TFOOT: `table-footer-group`,
		TR: `table-row`,
		TH: `table-cell`,
		TD: `table-cell`
	}

	/**
	 * * 요소 노출/비노출 토글
	 * @public @static
	 * @param __elements
	 * @param __is - 노출/비노출 여부
	 * @returns
	 */
	public static toggle(__elements: ElementSelector, __is?: boolean): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			const _is = (typeof __is === `boolean`) ? __is : !Is.display($el);
			const _style = $el.getAttribute(`style`) ?? ``;

			Doms.style($el, { display: (_is) ? (_style.replace(/ /g, ``).includes(`display:none`)) ? `` : Doms.displayValueMap[$el.tagName] ?? `block` : `none` });
		}

	}

	/**
	 * * 노출
	 * @public @static
	 * @param __elements
	 */
	public static show(__elements: ElementSelector): void {

		Doms.toggle(__elements, true);

	}

	/**
	 * * 비노출
	 * @public @static
	 * @param __elements
	 */
	public static hide(__elements: ElementSelector): void {

		Doms.toggle(__elements, false);

	}

	/**
	 * * 포커스
	 * @public @static
	 * @public
	*/
	public static readonly focus: DomFocus = {
		in: Doms.focusIn,
		out: Doms.focusOut,
	}

	/**
	 * * 포커스 인
	 * __element가 단일 요소가 아니면 첫 번째 요소에 적용
	 * @param __element - 단일 요소
	 */
	private static focusIn(__element: ElementSelector, __style?: Partial<CSSStyleDeclaration>): void {

		const $element = Doms.find(__element)[0];
		if ($element == null) return;

		$element.setAttribute(`tabindex`, `-1`);

		const focusoutHandler = (): void => $element.removeAttribute(`tabindex`);
		Events.bind.on($element, `focusout`, focusoutHandler, { _isOnce: true });

		$element.focus();
		Events.bind.call($element, `focusin focus`);

	}

	/**
	 * * 포커스 아웃
	 * __element가 단일 요소가 아니면 첫 번째 요소에 적용
	 * @param __element - 단일 요소
	 */
	private static focusOut(__element: ElementSelector): void {

		const $element = Doms.find(__element)[0];
		if ($element == null || document.activeElement !== $element) return;

		$element.blur();
		Events.bind.call($element, `focusout blur`);

	}

	/**
	 * * 요소 생성
	 * @public @static
	 * @param __html
	 * @returns
	 */
	public static create(__html: string): Node[] {

		const $template = document.createElement(`template`);
		$template.insertAdjacentHTML(`beforeend`, __html);

		return Object.values($template.childNodes);

	}

	/**
	 * * 여러 요소 삭제
	 * @public @static
	 * @param __elements
	 */
	public static remove(__elements: ElementSelector): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) $el.remove();

	}

	/**
	 * * 요소 추가/이동(통합)
	 * @param __elements
	 * @param __node
	 * @param __position (default append) - before(beforebegin), after(afterend), prepend(afterbegin), append(beforeend)
	 * @returns
	 */
	private static insert(__elements: ElementSelector, __node: unknown, __position: `before` | `after` | `prepend` | `append` = `append`): void {

		const $elements = Doms.find(__elements);
		if ($elements.length === 0 || __node == null) return;

		let appends: Node[] = [];
		if (typeof __node === `string`) appends = Doms.create(__node);
		else if (typeof __node === `object`) {
			if (__node instanceof Node) appends.push(__node);
			else {
				appends = Object.values(__node).flatMap(__item => {

					if (typeof __item === `string`) return Doms.create(__item);
					else if (__item instanceof Node) return __item;
					else return document.createTextNode(``);

				});
			}
		}
		if (appends.length === 0) return;

		let _isClone = false;
		for (const $el of $elements) {
			const nodes = (_isClone) ? appends.map(__node => __node.cloneNode(true)) : appends;
			$el[__position](...nodes);

			_isClone = true;// 첫 번째 요소는 원본, 나머지는 클론으로 적용
		}

	}

	/**
	 * * 요소 내부 마지막에 노드 추가
	 * + __elements가 여러 개일 때 사용하면 2번째 요소에는 __node를 클론으로 적용
	 * + __elements가 1개면 el.append(...nodes) 형식으로 사용
	 * @public @static
	 * @param __elements
	 * @param __node
	 */
	public static append(__elements: ElementSelector, __node: unknown): void {

		Doms.insert(__elements, __node, `append`);

	}

	/**
	 * * 요소 내부 처음에 노드 추가
	 * + __elements가 여러 개일 때 사용하면 2번째 요소에는 __node를 클론으로 적용
	 * + __elements가 1개면 el.prepend(...nodes) 형식으로 사용
	 * @public @static
	 * @param __elements
	 * @param __node
	 */
	public static prepend(__elements: ElementSelector, __node: unknown): void {

		Doms.insert(__elements, __node, `prepend`);

	}

	/**
	 * * 요소 뒤에 노드 추가
	 * + __elements가 여러 개일 때 사용하면 2번째 요소에는 __node를 클론으로 적용
	 * + __elements가 1개면 el.after(...nodes) 형식으로 사용
	 * @public @static
	 * @param __elements
	 * @param __node
	 */
	public static after(__elements: ElementSelector, __node: unknown): void {

		Doms.insert(__elements, __node, `after`);

	}

	/**
	 * * 요소 앞에 노드 추가
	 * + __elements가 여러 개일 때 사용하면 2번째 요소에는 __node를 클론으로 적용
	 * + __elements가 1개면 el.before(...nodes) 형식으로 사용
	 * @public @static
	 * @param __elements
	 * @param __node
	 */
	public static before(__elements: ElementSelector, __node: unknown): void {

		Doms.insert(__elements, __node, `before`);

	}

	/**
	 * * 요소를 태그로 묶음
	 * @public @static
	 * @param __elements
	 * @param _tagName
	 * @param __isInner (default false) - 값이 true면 요소의 내부 요소를 묶음
	 * @returns
	 */
	public static wrap(__elements: ElementSelector, _tagName: keyof HTMLElementTagNameMap, __isInner: boolean = false): HTMLElement[] {

		const $wraps: HTMLElement[] = [];

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			const $wrap = document.createElement(_tagName);
			$wraps.push($wrap);

			if (__isInner) {
				$wrap.append(...Object.values($el.childNodes));
				$el.append($wrap);
			}
			else {
				$el.after($wrap);
				$wrap.append($el);
			}
		}

		return $wraps;

	}

	/**
	 * * 요소를 풀어 내부 요소를 해당 뎁스로 이동하고, 요소는 삭제
	 * @public @static
	 * @param __elements
	 * @param __isParent (default false) - 값이 true면 부모 요소를 풀어줌
	 */
	public static unwrap(__elements: ElementSelector, __isParent: boolean = false): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			const $wrap = (__isParent) ? $el.parentElement : $el;
			if ($wrap != null) {
				$wrap.after(...Object.values($wrap.childNodes));
				$wrap.remove();
			}
		}

	}

	/**
	 * * 클래스
	 * @public @static
	 */
	public static readonly class: DomClass = {
		toggle: Doms.classToggle,
		add: Doms.classAdd,
		remove: Doms.classRemove,
		replace: Doms.classReplace,
		every: Doms.classEvery,
		some: Doms.classSome,
	}

	/**
	 * * 클래스 토글
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 * @param __is - 강제 적용
	 */
	private static classToggle(__elements: ElementSelector, __classes: string | string[], __is?: boolean): void {

		const classes = (typeof __classes === `string`) ? [__classes] : __classes;

		const $elements = Doms.find(__elements);
		for (const $el of $elements) {
			for (const _class of classes) $el.classList.toggle(_class, (typeof __is === `boolean`) ? __is : !$el.classList.contains(_class));
		}

	}

	/**
	 * * 클래스 추가
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 */
	private static classAdd(__elements: ElementSelector, __classes: string | string[]): void {

		const classes = (typeof __classes === `string`) ? [__classes] : __classes;

		const $elements = Doms.find(__elements);
		for (const $el of $elements) $el.classList.add(...classes);

	}

	/**
	 * * 클래스 삭제
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 */
	private static classRemove(__elements: ElementSelector, __classes: string | string[]): void {

		const classes = (typeof __classes === `string`) ? [__classes] : __classes;

		const $elements = Doms.find(__elements);
		for (const $el of $elements) $el.classList.remove(...classes);

	}

	/**
	 * * 클래스 교체
	 * @param __elements
	 * @param __class - 교체할 기존 단일 클래스
	 * @param __newClass - 적용할 새로운 단일 클래스
	 */
	private static classReplace(__elements: ElementSelector, __class: string, __newClass: string): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) $el.classList.replace(__class, __newClass);

	}

	/**
	 * * 단일 요소에 모든 클래스 확인
	 * @param __element - 단일 요소
	 * @param __classes - 단일 또는 복수의 클래스
	 * @returns
	 */
	private static classEvery(__element: ElementSelector, __classes: string | string[]): boolean {

		const $element = Doms.find(__element)[0];
		const elementClasses = $element.classList.value.split(` `);
		const classes = (typeof __classes === `string`) ? [__classes] : __classes;

		return classes.every(__class => elementClasses.includes(__class));

	}

	/**
	 * * 단일 요소에 일부 클래스 확인
	 * @param __element - 단일 요소
	 * @param __classes - 단일 또는 복수의 클래스
	 * @returns
	 */
	private static classSome(__element: ElementSelector, __classes: string | string[]): boolean {

		const $element = Doms.find(__element)[0];
		const elementClasses = $element.classList.value.split(` `);
		const classes = (typeof __classes === `string`) ? [__classes] : __classes;

		return classes.some(__class => elementClasses.includes(__class));

	}

	/**
	 * * 텍스트 입력
	 * 단일 요소는 element.textContent 직접 사용
	 * @public @static
	 * @param __elements
	 * @param __text
	 */
	public static text(__elements: ElementSelector, __text: string): void {

		const $elements = Doms.find(__elements);
		for (const $el of $elements) $el.textContent = __text;

	}

}

export default Doms;