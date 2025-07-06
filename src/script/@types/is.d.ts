/** @extends interface MMON UI */
interface MUI {
    is: {
        /**
         * * 모바일
         * + __type 값이 없으면 단순 모바일 여부 확인
         * @param __type - 모바일 디바이스/앱 상태 값(iphone, ipad, ipod, ios, android, blackberry, window, opera, app_kitkat, app_first, app_ios, app_android, app), 커스텀 값, 빈 값
         * @returns
         */
        mobile(__type?: string): boolean;
        /**
         * * 익스플로러, 구 엣지
         * + __type 값이 없으면 IE/구 엣지 여부 확인
         * @param __type - 익스플로러/구 엣지 브라우저 값(ie6, ie7, ie8, ie9, ie10, ie11, ie, ie9over, ie10over, edge), 커스텀 값, 빈 값
         * @returns
         */
        ie(__type?: string): boolean;
        /**
         * * 홀수
         * @param __value
         * @returns
         */
        odd(__value: number): boolean;
        /**
         * * 짝수
         * @param __value
         * @returns
         */
        even(__value: number): boolean;
        /**
         * * 빈 값
         * + 실제로 빈 값인지 확인하고, 0 값이라도 있으면 true로 리턴
         * @param __value
         * @param __excepts (default []) - 예외어에 해당하면 리턴 값이 반대로 적용 [0, null, undefined, ...]
         * @returns
         */
        empty(__value: unknown, __excepts: unknown[] = []): boolean;
        /**
         * * 순수 오브젝트 {}
         * typeof object가 아닌 DOM 요소와 Array를 제외한 {} 오브젝트 구분
         * @param __value
         * @returns
         */
        object(__value: unknown): boolean;
        /**
         * * 오브젝트 등 객체 비교 또는 포함
         * @param __origin - 원본
         * @param __target - 비교 대상
         */
        match(__origin: any, __target: any): boolean;
        /**
         * * 이터러블
         * @param __value
         * @returns
         */
        iterable(__value: unknown): boolean;
        /**
         * * 순수 단일 엘리먼트
         * + jQuery 엘리먼트 제외
         * @param __value
         * @param __excepts (default []) - document 또는 window 포함(Document | Window)
         * @returns
         */
        element(__value: unknown, __excepts: (Document | Window)[] = []): boolean;
        /**
         * * 요소의 화면 노출 여부
         * + display: none, append 전 상태 등
         * @param __elements
         * @returns
         */
        display(__elements: ElementSelector): boolean;
        /**
         * * 요소의 화면 노출 상태가 visibility 일 때
         * @param __elements
         * @returns
         */
        visible(__elements: ElementSelector): boolean;
        /**
         * * 요소에 포커스 여부
         * @param __element - 단일 요소, 복수의 요소는 첫 번째 요소만 확인
         * @returns
         */
        focus(__element: ElementSelector): boolean;
        /**
         * * 페이지 레이아웃
         * @param __type - 페이지 타입(main, modal, popup, frame, error, detail, print, review, ...)
         * @returns
         */
        layout(__type: string): boolean;
    };
}

declare interface IsTypeMobile extends ObjectCollection {
	iphone: string;
	ipad: string;
	ipod: string;
	ios: string;
	android: string;
	blackberry: string;
	window: string;
	opera: string;
	app_ios: string;
	app_android: string;
	app: string;
	app_kitkat: string;
	app_first: string;
}

declare interface IsTypeIE extends ObjectCollection {
	ie6: string;
	ie7: string;
	ie8: string;
	ie9: string;
	ie10: string;
	ie11: string;
	ie: string;
	ie9over: string;
	ie10over: string;
	edge: string;
}