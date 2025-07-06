/** @extends interface MMON UI */
interface MUI {
    /**
     * * 자식 요소 검색
     * @param __elements
     * @param __parents - 값이 없으면 페이지 전체에서 검색, iframe 내부를 검색할 때는 단일 요소로 적용
     * @returns
     */
    find<T extends keyof HTMLElementTagNameMap>(__elements: T, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): HTMLElementTagNameMap[T][];
    find(__elements?: ElementSelector, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): ElementList;
	find(__elements?: DOMSelector, __parents?: Exclude<DOMSelector, string> | HTMLIFrameElement): DOMList;
    /**
     * * 형제 요소 검색
     * @param __elements
     * @param __selector - 값이 없으면 전체 형제 요소 리턴
     * @returns
     */
    siblings(__elements: Exclude<ElementSelector, string>, __selector?: string): ElementList;
    /**
     * * 상위 요소 검색
     * @param __elements
     * @param __selector
     * @returns
     */
    closest(__elements: Exclude<ElementSelector, string>, __selector: string): ElementList;
    /**
	 * * 데이터 속성(data-name)
	 * @public
	*/
    data: DomData;
    /**
     * * 프로퍼티
     * + 여러 프로퍼티를 관리할 때 사용
     * @param __elements
     * @param __property - 요소에 적용할 프로퍼티 객체
     */
    property(__elements: ElementSelector, __property: ObjectCollection): void;
    /**
     * * 속성
     * + 여러 속성을 추가하거나 data-속성 값에 사용하고, 단일 속성은 setAttribute 사용
     * + 속성 값이 없거나 false면 삭제, true면 빈 값(``)없이 속성만 추가 됨
     * + 속성 값 타입이 object면 JSON.stringify로 적용(단, "더블퀏"이 '싱글퀏'으로 적용 됨)
     * @param __elements
     * @param __attribute - 요소에 적용할 속성 객체
     */
    attribute(__elements: ElementSelector, __attribute: ObjectCollection): void;
    /**
     * * 스타일
     * @param __elements
     * @param __style - 값이 없거나 오브젝트 타입이면 요소에 스타일을 적용하고 전체 스타일을 리턴하고, 스트링 타입이면 해당하는 스타일 값만 리턴
     * @returns
     */
    style(__elements: ElementSelector, __style?: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
    style(__elements: ElementSelector, __style: keyof CSSStyleDeclaration): string;
    /**
	 * * 스크롤
	 * @public
	 */
    scroll: DomScroll;
    /**
     * * 브라우저에서 보여지는 위치
     * @param __element - 단일 요소
     * @returns
     */
    offset(__element: HTMLElement): DomPosition;
    offset(__element: DOMSelector): DomPosition | undefined;
    /**
     * * 스크롤 영역에서 보여지는 위치
     * @param __element - 단일 요소
     * @returns
     */
    client(__element: HTMLElement): DomPosition;
    client(__element: DOMSelector): DomPosition | undefined;
    /**
     * * 스크롤 영역 내 실제 위치(scroll + offset)
     * @param __element - 단일 요소
     * @returns
     */
    position(__element: HTMLElement): DomPosition;
    position(__element: DOMSelector): DomPosition | undefined;
    /**
     * * 요소 인덱스 검색
     * @param __element - 단일 요소 또는 셀렉터
     * @param __lists - 인덱스를 검색할 요소 목록
     * @returns
     */
    index(__element: HTMLElement | string, __lists?: ElementCollection): number;
    /**
     * * 요소 인덱스 역방향 검색
     * @param __element - 단일 요소 또는 셀렉터
     * @param __lists - 인덱스를 검색할 요소 목록
     * @returns
     */
    lastIndex(__element: HTMLElement | string, __lists?: ElementCollection): number;
    /**
     * * 요소 노출/비노출 토글
     * @param __elements
     * @param __is - 노출/비노출 여부
     * @returns
     */
    toggle(__elements: ElementSelector, __is?: boolean): void;
    /**
     * * 노출
     * @param __elements
     */
    show(__elements: ElementSelector): void;
    /**
     * * 비노출
     * @param __elements
     */
    hide(__elements: ElementSelector): void;
    /**
	 * * 포커스
	 * @public
	*/
    focus: DomFocus;
    /**
     * * 요소 생성
     * @param __html
     * @returns
     */
    create(__html: string): Node[];
    /**
     * * 여러 요소 삭제
     * @param __elements
     */
    remove(__elements: ElementSelector): void;
    /**
     * * 요소 내부 마지막에 노드 추가
     * @param __elements
     * @param __node
     */
    append(__elements: ElementSelector, __node: unknown): void;
    /**
     * * 요소 내부 처음에 노드 추가
     * @param __elements
     * @param __node
     */
    prepend(__elements: ElementSelector, __node: unknown): void;
    /**
     * * 요소 뒤에 노드 추가
     * @param __elements
     * @param __node
     */
    after(__elements: ElementSelector, __node: unknown): void;
    /**
     * * 요소 앞에 노드 추가
     * @param __elements
     * @param __node
     */
    before(__elements: ElementSelector, __node: unknown): void;
    /**
     * * 요소를 태그로 묶음
     * @param __elements
     * @param _tagName
     * @param __isInner (default false) - 값이 true면 요소의 내부 요소를 묶음
     * @returns
     */
    wrap(__elements: ElementSelector, _tagName: keyof HTMLElementTagNameMap, __isInner: boolean = false): HTMLElement[];
    /**
     * * 요소를 풀어 내부 요소를 해당 뎁스로 이동하고, 요소는 삭제
     * @param __elements
     * @param __isParent (default false) - 값이 true면 부모 요소를 풀어줌
     */
    unwrap(__elements: ElementSelector, __isParent: boolean = false): void;
    /**
	 * * 클래스
	 * @public
	 */
    class: DomClass;
    /**
     * * 텍스트 입력
     * 단일 요소는 element.textContent 직접 사용
     * @param __elements
     * @param __text
     */
    text(__elements: ElementSelector, __text: string): void;
}

declare interface DomData {
    /**
	 * * 데이터 속성 저장 및 확인
	 * @param __$element - 단일 요소
	 * @param __name - data-x 속성 이름
	 * @param __data - 저장할 값
	 * @param __isExtend - (default true) 기본 속성을 확장하여 저장, 값이 false이면 새로 저장
	 */
    set<T>(__$element: HTMLElement, __name: string, __data: Partial<T>, __isExtend: boolean = true): void;
    /**
	 * * 데이터 속성 확인
	 * @param __$element - 단일 요소
	 * @param __name - data-x 속성 이름
	 * @returns
	 */
    get<T>(__$element: HTMLElement, __name: string): Partial<T> | string;
}

declare interface DomDataOption<T> {
    /** (default {}) data-name 값을 병합할 기본 값 */
    initial?: Partial<T>;
    /** (default undefined) 결과에 추가로 병합할 값 */
    extend?: Partial<T> | null;
    /** (default false) 값이 true 일 때 mmData[__name] 값이 있으면 병합하고, 없거나 false면 새로 저장 */
    _isOverwrite?: boolean;
}

declare interface DomPosition {
    top: number;
    left: number;
}

declare interface DomScroll {
    /** 페이지 기본 스크롤 요소 */
    element: HTMLElement;
    /**
	 * * 내부 스크롤 검색
	 * @param __element - 단일 요소
	 * @param __isClosest - 검색 방향을 상위 요소로 변경
	 * @returns
	 */
	find(__element?: undefined, __isClosest?: undefined): HTMLElement;
	find(__element: DOMSelector, __isClosest: true): HTMLElement;
	find(__element: DOMSelector, __isClosest?: boolean): HTMLElement | null;
    /**
	 *
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
    to(__target: ElementSelector | number, __option?: DomScrollToOption): void;
    /**
	 * * 스크롤 위치
	 * @param __element 단일 요소
	 * @returns
	 */
    position(__element: DOMSelector): DomPosition | undefined;
    /**
	 * * 스크롤 토글
	 * + pc에서 스크롤이 없어지면서 화면이 흔들리는 이슈로 스크립트에서 위치 조절(fixed에서는 가로 스크롤 적용 안됨)
	 * @param __is - 허용, 차단 여부
	 */
    toggle(__is?: boolean): void;
    /**
	 * * 스크롤 허용
	 */
    on(): void;
    /**
	 * * 스크롤 차단
	 */
    off(): void;
}

declare interface DomScrollToOption {
    /** (default null) 스크롤 요소 */
    scroller?: DOMElement;
    /** (default `vertical`) vertical(세로), horizontal(가로) */
    _orientation?: `vertical` | `horizontal`;
    /** (default 0) 스크롤 위치 조정(px) */
    _margin?: number;
    /** (default Times._Fast) 스크롤 이동 모션 시간(초), 값이 0이면 바로 이동 */
    _time?: number;
    /** (default false) __target이 단일 요소일 때 이동 후 __target에 포커스 여부 */
    _isFocus?: boolean;
    /** (default null) 스크롤 이동 전 콜백 */
    onStart?: ApplyFunc | null;
    /** (default []) */
    onStartParams?: unknown[];
    /** (default null) 스크롤 이동 후 콜백 */
    onComplete?: ApplyFunc | null;
    /** (default []) */
    onCompleteParams?: unknown[];
}

declare interface DomFocus {
    /**
	 * * 포커스 인
	 * __element가 단일 요소가 아니면 첫 번째 요소에 적용
	 * @param __element - 단일 요소
	 */
    in(__element: ElementSelector, __style?: Partial<CSSStyleDeclaration>): void;
    /**
	 * * 포커스 아웃
	 * __element가 단일 요소가 아니면 첫 번째 요소에 적용
	 * @param __element - 단일 요소
	 */
    out(__element: ElementSelector): void;
}

declare interface DomClass {
	/**
	 * * 클래스 토글
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 * @param __is - 강제 적용
	 */
    toggle(__elements: ElementSelector, __classes: string | string[], __is?: boolean): void;
	/**
	 * * 클래스 추가
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 */
    add(__elements: ElementSelector, __classes: string | string[]): void;
	/**
	 * * 클래스 삭제
	 * @param __elements
	 * @param __classes - 단일 또는 복수의 클래스
	 */
    remove(__elements: ElementSelector, __classes: string | string[]): void;
	/**
	 * * 클래스 교체
	 * @param __elements
	 * @param __class - 교체할 기존 단일 클래스
	 * @param __newClass - 적용할 새로운 단일 클래스
	 */
    replace(__elements: ElementSelector, __class: string, __newClass: string): void;
	/**
	 * * 단일 요소에 모든 클래스 확인
	 * @param __element - 단일 요소
	 * @param __classes - 단일 또는 복수의 클래스
	 * @returns
	 */
    every(__element: ElementSelector, __classes: string | string[]): boolean;
	/**
	 * * 단일 요소에 일부 클래스 확인
	 * @param __element - 단일 요소
	 * @param __classes - 단일 또는 복수의 클래스
	 * @returns
	 */
    some(__element: ElementSelector, __classes: string | string[]): boolean;
}