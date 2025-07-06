declare const mm: MUI;

declare interface Window {
    readonly mm: MUI;
    // readonly Pages: Pages;
}

/** object, array 요소(내용을 알 수 없을 때 사용하고 그 외에는 type/interface 적용) */
declare type ObjectCollection = Record<string | number, any>;

/** HTMLElement 확장 */
declare type DOMElement = Element | Document | Window;
/** HTMLCollection 확장(document, window 포함) */
declare type DOMCollection = HTMLCollection | NodeList | DOMList;
/** DOM 전체 및 셀렉터 포함(제이쿼리 추가 필요?) */
declare type DOMSelector = DOMElement | DOMCollection | string;
declare interface DOMList extends Array<DOMElement> {
    context?: string;
}
/** HTMLCollection 확장 */
declare type ElementCollection = HTMLCollection | NodeList | ElementList;
declare type ElementSelector = Element | ElementCollection | string;
declare interface ElementList extends Array<HTMLElement> {
    context?: string;
}

/** 화살표 함수 */
declare interface ArrowFunc {
    (...args: any[]): void;
}
/** 리턴 함수 */
declare type ApplyFunc = ArrowFunc | string;

/** MMON UI */
declare interface MUI {
}