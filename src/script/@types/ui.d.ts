declare class BaseUI {
    /** UI 생성자에 연결된 요소 */
    public readonly $element: HTMLElement;
    /** constructor name toLowerCase */
    public readonly _name: string;
    /** 블록에서 실행 여부 */
    public readonly _isBlock: boolean;
    /** UI 클래스 프리픽스 */
    public readonly _prefix: `mui_` | `mm_`;
    /** 아이콘 클래스 프리픽스 */
    public readonly _prefixIco: `uico_` | `ico_`;
}

declare interface BaseUIAttribute {
    /**
     * * UI data-x 속성 값 저장
     * @param __$element - 단일 요소
     * @param __data
     * @param __isExtend - (default true) 기본 속성을 확장하여 저장, 값이 false이면 새로 저장
     * @returns
     */
    set<T>(__$element: HTMLElement, __data: Partial<T>, __isExtend: boolean): void;
    /**
     * * UI data-x 속성 값 확인
     * @param __$element - 단일 요소
     * @returns
     */
    get<T>(__$element: HTMLElement): Partial<T>;
}

/** @extends interface MMON UI */
interface MUI {
    lazyload: {
        /**
         * * 레이지로드 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: LazyloadData = {}, __onCatch?: (__ui: Lazyload) => void): Lazyload[];
        /**
         * * 레이지로드 강제로드
         * @static
         * @param __elements - 값이 없으면 페이지 전체 적용
         */
        force(__elements?: ElementSelector): void;
        /**
         * * 레이지로드 해제
         * + 이미 로드가 완료됐거나 오류가 있는 요소는 제외
         * @static
         * @param __elements - 값이 없으면 페이지 전체 적용
         */
        destroy(__elements: ElementSelector): void;
    };
    switch: {
        /**
         * * 스위치 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: SwitchData = {}, __onCatch?: (__ui: Switch) => void): Switch[];
        /**
         * * 스위치 토글
         * @static
         * @param __elements
         * @param __is
         */
        toggle(__elements: ElementSelector, __is?: boolean): void;
        /**
         * * 스위치 활성
         * @static
         * @param __elements
         */
        on(__elements: ElementSelector): void;
        /**
         * * 스위치 비활성
         * @static
         * @param __elements
         */
        off(__elements: ElementSelector): void;
    };
    tab: {
        /**
         * * 탭 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: TabData = {}, __onCatch?: (__ui: Tab) => void): Tab[];
        /**
         * * 탭 변경
         * @static
         * @param __elements
         * @param __target
         */
        change(__elements: ElementSelector, __target: number | HTMLElement): void;
        /**
         * * 탭 인덱스
         * @param __elements - 단일 요소
         * @returns
         */
        index(__elements: ElementSelector): number;
    };
    dropdown: {
        /**
         * * 드롭다운 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: DropdownData = {}, __onCatch?: (__ui: Dropdown) => void): Dropdown[];
        /**
         * * 드롭다운 토글
         * @static
         * @param __elements
         * @param __is
         */
        toggle(__elements: ElementSelector, __is?: boolean): void;
        /**
         * * 드롭다운 활성
         * @static
         * @param __elements
         */
        on(__elements: ElementSelector): void;
        /**
         * * 드롭다운 비활성
         * @static
         * @param __elements
         */
        off(__elements: ElementSelector): void;
    };
    toast: {
        /**
         * * 토스트 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: ToastData = {}, __onCatch?: (__ui: Toast) => void): Toast[];
        /**
         * * 토스트 토글
         * @static
         * @param __elements
         * @param __is
         */
        toggle(__elements: ElementSelector, __is?: boolean): void
        /**
         * * 토스트 활성
         * @static
         * @param __elements
         */
        on(__elements: ElementSelector): void;
        /**
         * * 토스트 비활성
         * @static
         * @param __elements
         */
        off(__elements: ElementSelector): void;
    };
    stepper: {
        /**
         * * 스테퍼 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: StepperData = {}, __onCatch?: (__ui: Stepper) => void): Stepper[];
        /**
         * * 스테퍼 수량 변경
         * @static
         * @param __elements
         * @param __target - {number} 적용할 수량 직접 입력, {KeyboardEvent} keyup으로 수량 변경
         */
        change(__elements: ElementSelector, __target?: number | KeyboardEvent): void;
    };
    carousel: {
        /**
         * * 캐러셀 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: CarouselData = {}, __onCatch?: (__ui: Carousel) => void): Carousel[];
        /**
         * * 캐러셀 변경
         * @static
         * @params __elements
         * @params __index - 변경할 인덱스
         * @params __direction - 모션 방향으로 값이 없으면 인덱스를 비요하여 방향 적용
         */
        change(__elements: ElementSelector, __index: number, __direction?: `next` | `prev`): void;
        /**
         * * 캐러셀 재정럴(추가/삭제)
         * @static
         * @params __elements
         */
        reload(__elements: ElementSelector): void;
        /**
         * * 캐러셀 자동 롤링
         * @static
         * @params __elements
         */
        play(__elements: ElementSelector): void;
        /**
         * * 캐러셀 정지
         * @static
         * @params __elements
         */
        stop(__elements: ElementSelector): void;
    };
    slider: {
        /**
         * * 슬라이더 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: SliderData = {}, __onCatch?: (__ui: Slider) => void): Slider[];
        /**
         * * 슬라이더 변경
         * @static
         * @params __elements
         * @params __index - 변경할 인덱스
         * @params __direction - 모션 방향으로 값이 없으면 인덱스를 비요하여 방향 적용
         */
        change(__elements: ElementSelector, __index: number, __direction?: `next` | `prev`): void;
        /**
         * * 슬라이더 재정럴(추가/삭제)
         * @static
         * @params __elements
         */
        reload(__elements: ElementSelector): void;
        /**
         * * 슬라이더 자동 롤링
         * @static
         * @params __elements
         */
        play(__elements: ElementSelector): void;
        /**
         * * 슬라이더 정지
         * @static
         * @params __elements
         */
        stop(__elements: ElementSelector): void;
    };
    datepicker: {
        /**
         * * 데이트픽커 연결
         * @static
         * @param __elements - 업데이트 할 요소
         * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
         * @param __onCatch
         * @returns 연결된 생성자 전체
         */
        update(__elements?: ElementSelector, __data: DatepickerData = {}, __onCatch?: (__ui: Datepicker) => void): Datepicker[];
        /**
         * * 데이트픽커 변경
         * @static
         * @param __elements
         * @param __date - 변경할 날짜
         */
        change(__elements: ElementSelector, __date: string): void;
        /**
         * * 데이트픽커 날짜 비활성
         * @static
         * @param __elements
         * @param __option.beforeDate - 이전 날짜 비활성
         * @param __option.afterDate - 이후 날짜 비활성
         */
        dateDisabled(__elements: ElementSelector, __option: DatepickerDisabledOption): void;
    };
    form: {
       /**
         * * 폼 업데이트
         * @static
         * @param __elements - 값이 없으면 페이지 전체 적용하고, 값이 폼 요소가 아니면 자식 요소에 적용
         */
        update(__elements?: ElementSelector): void;
        /**
         * * 폼 value 값 적용
         * + data-text, data-check, data-radio, data-select
         * + data-file, data-multiple은 value 값 강제로 변경 불가
         * @static
         * @param __elements
         * @param __value
         */
        value(__elements: ElementSelector, __value: string | boolean): void;
        /**
         * * 폼 요소 오류
         * + 텍스트, 셀렉트, 파일에만 적용
         * @static
         * @param __elements
         * @param __message - 오류 메시지
         */
        alert(__elements: ElementSelector, __message: string): void;
        /**
         * * 폼 요소 유효
         * + 텍스트, 셀렉트, 파일에만 적용
         * @static
         * @param __elements
         * @param __message - 유효 메시지
         * @param __condition - 상태 클래스 문자열(`S=valid-${__condition}`)
         */
        valid(__elements: ElementSelector, __message: string, __condition?: string): void;
        /**
         * * 폼 요소 오류/유효 해제
         * @static
         * @param __elements - 값이 없으면 페이지 전체 .text_alert, .text_valid 해제
         */
        lift(__elements?: ElementSelector): void;
        /**
         * * 폼 인터페이스 setter 함수 변경
         * + setter 기본형에 selectedIndex 초기 값과 property 이벤트 추가
         * @static
         * @param __interface - 인터페이스 HTMLInputElement, HTMLSelectorElement, HTMLOptionElement
         * @param __properties - 변경할 속성
         */
        changeSetter(__interface: typeof HTMLInputElement | typeof HTMLSelectElement | typeof HTMLOptionElement, __properties: string[]): void;
    };
}

declare interface UISyncData {
    /** (default undefined) 연결할 요소 */
    syncer?: ElementSelector | null;
    /** (default true) 연결 후 업데이트 */
    _isSync?: boolean;
    /** (default undefined) 해제할 요소 */
    desyncer?: ElementSelector | null;
    /** (default true) 해제 후 업데이트 */
    _isDesync?: boolean;
}

declare interface UIError<T> {
    /** 이미 만들어진 UI 생성자 */
    ui?: T;
    /** 연결할 요소 */
    $element?: HTMLElement;
    /** 메시지 */
    message: string;
}

/**
 * @file lazyload.ts
 */
declare interface LazyloadData {
    /** (defualt `0px 0px 0px 0px`) intersection observer 영역의 rootMargin */
    _rootMargin?: string;
    /** (default null) 이미지 경로 */
    _src?: string | null;
    /** (default null) _src가 없을 때 추가로 불러올 이미지 경로 */
    _src2?: string | null;
    /** (default true) 오류 이미지 노출 */
    _isErrorImage?: boolean;
    /** (default false) 로드 완료 시 비율에 따라 클래스 추가(landscape, portrait, square) */
    _isRatio?: boolean;
    /** (default false) 로드 업데이트에서 제외 */
    _isPass?: boolean;
    /** (default false) _isIntersecting, _isPass를 무시하고 강제 로드(프리로드) */
    _isForce?: boolean;
    /** (default null) 로드 전에 콜백 */
    onBefore?: ApplyFunc | null;
    /** (default []) */
    onBeforeParams?: unknown[];
    onComplete?: ApplyFunc | null;
    onCompleteParams?: unknown[];
    onError?: ApplyFunc | null;
    onErrorParams?: unknown[];
}

/**
 * @file buttons.ts
 */
declare interface SwitchData extends UISyncData {
    /** (default `S=switch-on`) */
    _classOn?: string;
    /** (default `선택됨`) on일 때 적용할 title */
    _title?: string;
    /** (default null) 기본 title */
    _defaultTitle?: string | null;
    /** (default false) 부모 요소에 _classOn 적용 */
    _isParent?: boolean;
    /** (default false) 부모 요소가 on되면 내부 ui 업데이트 실행 */
    _isParentUpdate?: boolean;
    /** (default null) _classOn을 적용할 closest 요소 */
    _parentSelector?: HTMLElement | DOMSelector | null;
    onChange?: ApplyFunc | null;
    /** 1번째 이후 아규먼트로 전달 */
    onChangeParams?: unknown[];
}

declare interface TabData {
    /** (default `S=tab-on`) */
    _classOn?: string;
    /** (default `.btn_tab`) 탭버튼 셀렉터 */
    _selectorBtn?: string;
    /** (default `선택됨`) on일 때 적용할 title */
    _title?: string;
    /** (default false) 열려있는 요소 닫기 가능 */
    _isToggle?: boolean;
    onChange?: ApplyFunc | null;
    /** onChange의 1번째 이후 아규먼트로 전달 */
    onChangeParams?: unknown[];
}

declare interface DropdownData {
    /** (default `S=on`) */
    _classOn?: string;
    /** (default 0) 변경 시간(초)으로 0은 모션없이 바로 적용, -1은 자동으로 Times.fast와 같음. 드롭다운 요소가 table 요소이면 _time 값이 0으로 적용 */
    _time?: number;
    /** (default null) 아코디언 연결과 연결할 셀렉터 */
    _group?: string | null;
    /** (default true) 아코디언에서 열려있는 요소 닫기 가능 */
    _isGroupToggle?: boolean;
    onChange?: ApplyFunc | null;
    /** onChange의 1번째 이후 아규먼트로 전달 */
    onChangeParams?: unknown[];
}

declare interface ToastData {
    _classOn?: string;
    onChange?: ApplyFunc | null;
    /** onChange의 1번째 이후 아규먼트로 전달 */
    onChangeParams?: unknown[];
}

declare interface StepperData {
    /** 최소 수량 */
    _min?: number;
    /** 최대 수량 */
    _max?: number;
    onChange?: ApplyFunc | null;
    /** onChange의 1번째 이후 아규먼트로 전달 */
    onChangeParams?: unknown[];
}

/**
 * @file sliders.ts
 */
declare type CarouselOrientation = `horizontal` | `vertical`;
declare type CarouselEffect = `slide` | `fade` | `cover` | `strip` | `none`;

declare interface CarouselData {
    /** (default 0) */
    _index?: number;
    /** (default horizontal) 방향 */
    _orientation?: CarouselOrientation;
    /** (default slide) 모션 효과, 값이 none이면 직접 제어 */
    _effect?: CarouselEffect;
    /** (default 0.2) 모션 시간(초) */
    _time?: number;
    /** (default 0) 자동 롤링 간격(초), 값이 0이면 수동 */
    _autoDelay?: number;
    /** (default 0.2) 민감도, 짧게 움직였을 때 반응할 시간(초) */
    _sensitiveTime?: number;
    /** (default false) 높이 자동 */
    _isAutoHeight?: boolean;
    /** (default false) 좌/우 요소 같이 모션 */
    _isMoreSide?: boolean;
    /** (default false) 이미지가 없으면 item 요소 삭제 */
    _isErrorRemove?: boolean;
    /** (default false) mm_carousel-group 사용 */
    _isGroup?: boolean;
    /** (default `S=on`) */
    _classOn?: string;
    /** (default `S=clone`) 복제 요소 클래스 */
    _classClone?: string;
    pagination?: {
        /** (default true) 요소를 내부에서 검색 */
        _isInner?: boolean;
        /** (default `.btn_carousel-page`) */
        _selector?: string,
    };
    control?: {
        /** (default true) 요소를 내부에서 검색 */
        _isInner?: boolean;
        /** (default `.btn_carousel-prev`) */
        _selectorPrev?: string;
        /** (default `.btn_carousel-next`) */
        _selectorNext?: string;
    };
    count?: {
        /** (default true) 요소를 내부에서 검색 */
        _isInner?: boolean;
        /** (default `0`) 노출할 자리 수 문자 스타일, 100단위 전체 노출은 `000`으로 적용 */
        _padStyle?: string;
        /** (default `${`.mm_` | `.mui_`}carousel-count`) */
        _selector?: string;
    };
    /** 준비 콜백 */
    onReady?: ApplyFunc | null;
    onReadyParams?: unknown[];
    /** 모션 중 콜백 */
    onUpdate?: ApplyFunc | null;
    onUpdateParams?: unknown[];
    /** 모션 시작 콜백 */
    onStart?: ApplyFunc | null;
    onStartParams?: unknown[];
    /** 모션 종료 콜백 */
    onComplete?: ApplyFunc | null;
    onCompleteParams?: unknown[];
}

declare type CarouselDirectionMap = Record<CarouselOrientation, CarouselDirectionEffectMap>
declare type CarouselDirectionEffectMap = Record<CarouselEffect, ArrowFunc>

declare interface SliderData {
    /** (default 0) */
    _index?: number;
    /** (default horizontal) 방향 */
    _orientation?: `horizontal` | `vertical`;
    /** (default 0.2) 모션 시간(초) */
    _time?: number;
    /** (default 0) 자동 롤링 간격(초), 값이 0이면 수동 */
    _autoDelay?: number;
    /** (default 0.2) 민감도, 짧게 움직였을 때 반응할 시간(초) */
    _sensitiveTime?: number;
    /** (default `10px 1px`) intersection observer의 rootMargin 값 */
    _rootMargin?: string;
    /** (default true) 슬라이더 반복 */
    _isLoop?: boolean;
    /** (default false) 이미지가 없으면 item 요소 삭제 */
    _isErrorRemove?: boolean;
    /** (default `S=on`) */
    _classOn?: string;
    /** (default `S=clone`) 복제 요소 클래스 */
    _classClone?: string;
    /** (default `S=intersecting`) 영역 내 intersecting 된 요소 클래스 */
    _classIntersecting?: string;
    pagination?: {
        /** (default true) 요소를 내부에서 검색 */
        _isInner?: boolean;
        /** (default `.btn_slider-page`) */
        _selector?: string;
    };
    control?: {
        /** (default true) 요소를 내부에서 검색 */
        _isInner?: boolean;
        /** (default `.btn_slider-prev`) */
        _selectorPrev?: string;
        /** (default `.btn_slider-next`) */
        _selectorNext?: string;
    };
    /** 준비 콜백 */
    onReady?: ApplyFunc | null;
    onReadyParams?: unknown[];
    /** 모션 중 콜백 */
    onUpdate?: ApplyFunc | null;
    onUpdateParams?: unknown[];
    /** 모션 시작 콜백 */
    onStart?: ApplyFunc | null;
    onStartParams?: unknown[];
    /** 모션 종료 콜백 */
    onComplete?: ApplyFunc | null;
    onCompleteParams?: unknown[];
    /** 모션 종료 후 intersection 이벤트 발생 콜백 */
    onIntersecting?: ApplyFunc | null;
    onIntersectingParams?: unknown[];
}

/**
 * @file lazyload.ts
 */
declare interface LazyloadData {
    /** (defualt `0px 0px 0px 0px`) intersection observer 영역의 rootMargin */
    _rootMargin?: string;
    /** (default null) 이미지 경로 */
    _src?: string | null;
    /** (default null) _src가 없을 때 추가로 불러올 이미지 경로 */
    _src2?: string | null;
    /** (default true) 오류 이미지 노출 */
    _isErrorImage?: boolean;
    /** (default false) pre/lazy 로드 완료 시 비율에 따라 클래스 추가(landscape, portrait, square) */
    _isRatio?: boolean;
    /** (default false) pre/lazy 로드 업데이트에서 제외 */
    _isPass?: boolean;
    /** (default false) _isIntersecting, _isPass를 무시하고 강제 로드(프리로드) */
    _isForce?: boolean;
    /** (default null) 로드 전에 콜백 */
    onBefore?: ApplyFunc | null;
    onBeforeParams?: unknown[];
    onComplete?: ApplyFunc | null;
    onCompleteParams?: unknown[];
    onError?: ApplyFunc | null;
    onErrorParams?: unknown[];
}

/**
 * @file picker.ts
 */
declare interface DatepickerData {
    /** (default [`일`, `월`, `화`, `수`, `목`, `금`, `토`]) 표시할 요일 순서 */
    weekdays?: string[];
    /** (default 0) weekdays 기준 시작 요일(0~6) */
    _firstDay?: number;
    /** (default `YYYY-MM-DD`) 날짜 형식 */
    _format?: string;
    /** (default 1) 노출할 달력 개수 */
    _multiple?: number;
    /** (default false) 월만 사용 */
    _isMonth?: boolean;
    /** (default false) 인라인 달력 */
    _isInline?: boolean;
    /** (default null) 설정한 이전 날짜 비활성(날짜 형식은 _format과 동일) */
    _disableBeforeDate?: string | null;
    /** (default null) 설정한 이후 날짜 비활성(날짜 형식은 _format과 동일) */
    _disableAfterDate?: string | null;
    onSelect?: ApplyFunc | null;
    onSelectParams?: unknown[];
}

declare interface DatepickerDisabledOption {
    beforeDate?: string;
    afterDate?: string;
}

declare interface FormTextData {
    /** (default ``) 내용이 없을 때 적용할 기본 값 */
    _default?: string;
    /** (default `S=text-on`) value 값이 있을 때 클래스 */
    _classOn?: string;
    /** (default `S=text-off`) value 값이 있고, readonly, desabled 상태일 때 클래스 */
    _classOff?: string;
    /** (default ``) 날짜, 시간에 사용(보여지는 포멧 형식으로 input과 다름, YYYY년 MM월) */
    _format?: string;
    /** (default false) textarea 내용에 따라 높이 자동 조절 */
    _isResize?: boolean;
    /** (default 0) textarea 최소 높이 라인 수 */
    _resizeMin?: number;
    /** (default 0) textarea 최대 높이 라인 수(설정한 값보다 라인이 많으면 스크롤) */
    _resizeMax?: number;
    /** (default 0) 바이트 표시로 0보다 크면 자동 생성 */
    _byte?: number;
    /** (default false) value 값을 입력할 때 연관검색어 자동완성 */
    _isAutoComplete?: boolean;
}