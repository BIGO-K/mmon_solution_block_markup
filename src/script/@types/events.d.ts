/** @extends interface MMON UI */
interface MUI {
    /**
     * * 페이지 레디
     * @param __callback
     */
    ready(__callback: ArrowFunc): void;
    /**
     * * 페이지 로드
     * @param __callback
     * @param __elements (default window)
     * @param __isOnce (default true) - 한 번만 실행
     */
    load(__callback: ArrowFunc, __elements: DOMSelector = window, __isOnce: boolean = true): void;
    /**
	 * * 이벤트
	 * @public
	 */
    event: MUIEvents;
    /**
	 * * 이벤트 위임
	 * @public
	 */
    delegate: EventDelegate;
    /**
	 * * 이벤트 옵저버
	 * @public
	 */
    observer: EventObserver;
    /**
	 * * 이벤트 인터섹션
	 * @public
	 */
    intersection: EventIntersection;
    /**
	 * * 이벤트 뮤테이션
	 * @public
	 */
    mutation: EventMutation;
}

declare interface MUIEvents extends EventBind {
    readonly type: EventCustom;
}

declare interface EventTypeList {
	[key: string]: string;
}

declare interface EventBaseOption {
    /** (default {}) __callback의 2번째 파라미터로 전달 */
    data?: ObjectCollection;
    /** (default false) 이벤트를 한 번만 실행 */
    _isOnce?: boolean;
}

declare interface EventCustom extends ObjectCollection {
    /**
     * * 커스텀 이벤트 getter/setter
     * 저장 - ..type.set(`string`);
     * 사용 - ..type[`string`] 또는 type.string
     */
    set(__type: string): void;
}

declare interface EventBind {
    /**
     * * 이벤트 연결
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback
     * @param __option - IE 적용이 필요하면 boolean으로 변경
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     * @param __option._isCapture (default false) - 버블링 방향으로 반대로
     * @param __option._isPassive (default false) - 스크롤 성능을 위해 true일 때 preventDefault 사용 불가(touchstart, touchmove, wheel, mousewheel 이벤트에서 true로 변경 적용)
     */
    on(__elements: DOMSelector, __type: string, __callback: ArrowFunc, __option?: EventBindOption): void;
    /**
     * * 이벤트 해제
     * + __callback 값이 없으면 연결된 전체 이벤트 해제
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback - string 타입이면 function.name 값으로 비교
     */
    off(__elements: DOMSelector, __type: string, __callback?: ApplyFunc): void;
    /**
     * * 이벤트 실행
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __option
     * @param __option.data (default {}) - event.detail로 전달할 값
     */
    call(__elements: DOMSelector, __type: string, __option?: Pick<EventBindOption, `data`>): void;
    /**
     * * 이벤트 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements
     * @returns __elements의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    get(__elements?: DOMSelector): EventBindItem[];
}

declare interface EventBindItem {
    /** 이벤트에 연결된 요소 */
    $element: DOMElement;
    /** 이벤트 타입 */
    _type: string;
    /** 이벤트 콜백 */
    callback: ArrowFunc;
    handler: (__e: Event) => void;
}

declare interface EventBindOption extends EventBaseOption {
    /** (default false) 버블링 방향으로 반대로 */
    _isCapture?: boolean;
    /** (default false) 스크롤 성능을 위해 true일 때 preventDefault 사용 불가(touchstart, touchmove, wheel, mousewheel 이벤트에서 true로 변경 적용) */
    _isPassive?: boolean;
}

declare interface EventDelegate {
    /**
     * * 이벤트 위임 연결
     * @param __parents
     * @param __delegator - 위임할 셀렉터
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    on(__parents: DOMSelector, __delegator: string, __type: string, __callback: ArrowFunc, __option?: EventDelegateOption): void;
    /**
     * * 이벤트 위임 해제
     * + __callback 값이 없으면 연결된 전체 이벤트 해제
     * @param __parents
     * @param __delegator - 위임할 셀렉터
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback - string 타입이면 function.name 값으로 비교
     */
    off(__parents: DOMSelector, __delegator: string, __type: string, __callback?: ApplyFunc): void;
    /**
     * * 이벤트 위임 연결 확인
     * + 파라미터 값이 없으면 전체 이벤트 리턴
     * @param __parents
     * @returns __parents의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    get(__parents?: DOMSelector): EventDelegateItem[];
}

declare interface EventDelegateItem {
    /** 이벤트를 위임할 부모 요소 */
    $parent: DOMElement;
    /** 이벤트 타입 */
    _type: string;
    targets: EventDelegateItemTarget[];
    handler: (__e: Event) => void;
}

declare interface EventDelegateItemTarget {
    /** 이벤트를 연결할 셀렉터 */
    _delegator: string;
    /** 이벤트 콜백 */
    callback: ArrowFunc;
}

declare interface EventDelegateOption extends EventBaseOption {
}

declare interface EventObserver {
    /**
     * * 이벤트 옵저버 연결
     * @param __elements
     * @param __type - 커스텀 이벤트 단일 타입
     * @param __callback
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 한 번만 실행
     */
    on(__elements: DOMSelector, __type: string, __callback: ArrowFunc, __option?: EventObserverOption): void;
    /**
     * * 이벤트 옵저버 해제
     * + __elements 값이 없으면 __type에 연결된 전체 이벤트 해제
     * + __type 값이 없으면 __elements에 연결된 전체 이벤트 해제
     * + 해제 시 callback은 확인 안함
     * @param __elements
     * @param __type - 커스텀 이벤트 단일 타입
     */
    off(__elements: DOMSelector, __type?: string): void;
    /**
     * * 이벤트 옵저버 실행
     * @param __type - 커스텀 이벤트 단일 타입
     * @param __option
     * @param __option.data (default {}) - event.detail로 전달할 값
     * @param __option._isLocal (default false) - 현재 프레임(document) 안에 연결된 이벤트만 실행(지역)
     * @param __option.$frameWindow (default undefined) - observerCall을 실행한 iframe의 window
     */
    call(__type: string, __option?: EventObserverCallOption): void;
    /**
     * * 이벤트 옵저버 연결 확인
     * + __target 값이 없으면 전체 이벤트 리턴
     * @param __target - 단일 요소 또는 커스텀 이벤트 단일 타입
     * @returns __target에 연결된 이벤트 리턴
     */
    get(__target?: DOMElement | string): EventObserverItem[];
}

declare interface EventObserverItem extends EventBindItem {
}

declare interface EventObserverOption extends EventBaseOption{
}

declare interface EventObserverCallOption {
    /** (default undefined) event.detail로 전달할 값 */
    data?: ObjectCollection;
    /** (default false) 현재 프레임(document) 안에 연결된 이벤트만 실행(지역) */
    _isLocal?: boolean;
    /** (default undefined) observerCall을 실행한 iframe의 window */
    $frameWindow?: Window | null;
}

declare interface EventIntersection {
    /**
     * * 이벤트 인터섹션 연결
     * @param __elements
     * @param __callback
     * @param __config
     * @param __config.root (default undefined)
     * @param __config.rootMargin (defualt `0px 0px 0px 0px`)
     * @param __config.threshold (default [0, 1])
     * @param __option
     * @param __option.data (default {}) - __callback의 3번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    on(__elements: ElementSelector, __callback: ArrowFunc, __config: IntersectionObserverInit = { rootMargin: `0px 0px 0px 0px`, threshold: [0, 1] }, __option?: EventIntersectionItemOption): void;
    /**
     * * 이벤트 인터섹션 해제
     * + __callback, __io 값이 없으면 __elements 전체 해제
     * @param __elements
     * @param __callback
     * @param __io
     */
    off(__elements: ElementSelector, __callback?: ApplyFunc, __io?: IntersectionObserver): void;
    /**
     * * 이벤트 인터섹션 실행
     * + __io 값이 없으면 __elements 전체 실행
     * @param __elements
     * @param __io
     */
    call(__elements: ElementSelector, __io?: IntersectionObserver): void;
    /**
     * * 이벤트 인터섹션 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements - 단일 요소
     * @returns __elements의 첫 번째 요소가 targets에 포함된 이벤트만 리턴
     */
    get(__elements?: ElementSelector): EventIntersectionItem[];
}

declare interface EventIntersectionItem {
    io: IntersectionObserver;
    targets: EventIntersectionItemTarget[];
}

declare interface EventIntersectionItemTarget {
    /** 인터섹션 옵저버에 연결된 요소 */
    $element: HTMLElement;
    /** 인터섹션 콜백 */
    callback: ArrowFunc;
    option: EventIntersectionItemOption;
}

declare interface EventIntersectionItemOption extends EventBaseOption {
}

declare interface EventMutation {
    /**
     * * 이벤트 뮤테이션 연결
     * + input 요소에는 적용 안됨
     * + characterData는 contenteditable에서 적용
     * + characterData를 키보드로 감지(record.target.parentElement > oldValue 이전)
     * + innerText, textContent등으로 직접 변경하면, characterData가 아닌 childList에서 감지(record.target > record.removedNodes 이전, record.addednodes 현재)
     * + (record.type === `childList`) ? record.target : record.target.parentElement;
     * @param __elements
     * @param __callback
     * @param __config
     * @param __config.attributes (default false) - 속성 변경 감시
     * @param __config.attributeOldValue (default false) - 속성 변경 이전 값 기록, 값을 true로 하면 attributes의 기본 값이 true로 적용
     * @param __config.attributeFilter (default []) - 감시할 속성으로 값이 없으면 전체 속성 적용
     * @param __config.characterDatas (default false) - 키보드 문자 데이터 변경 감시(innerText, textContent로 직접 변경은 감시 안됨 > childList로 적용)
     * @param __config.characterDataOldValue (default false) - 문자 데이터 변경 이전 값 기록, 값을 true로 하면 characterData의 기본 값이 true로 적용
     * @param __config.childList (default false) - 자식 노드의 추가/삭제 감시
     * @param __config.subtree (default false) - 하위 트리를 포함하여 감시영역 확장
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    on(__elements: DOMSelector, __callback: ArrowFunc, __config: MutationObserverInit, __option?: EventMutationItemOption): void;
    /**
     * * 이벤트 뮤테이션 해제
     * + __callback, __config 값이 없으면 __elemenrs 전체 해제
     * @param __elements
     * @param __callback
     * @param __config
     */
    off(__elements: DOMSelector, __callback?: ApplyFunc, __config?: MutationObserverInit): void;
    /**
     * * 이벤트 뮤테이션 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements - 단일 요소
     * @returns __elements의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    get(__elements?: DOMSelector): EventMutationItem[];
}

declare interface EventMutationItem {
    mo: MutationObserver;
    /** 뮤테이션 옵저버에 연결된 요소 */
    $element: Element | Document;
    config: MutationObserverInit;
    callback: ArrowFunc;
    option: EventMutationItemOption;
}

declare interface EventMutationItemOption extends EventBaseOption {
}