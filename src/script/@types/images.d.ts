/** @extends interface MMON UI */
interface MUI {
    image: ImageUI;
}

declare interface ImageUI {
    /** 투명 1px gif */
    _empty: `data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==`;
    /**
     * * 없음 이미지
     * @param __$element - 단일 요소
     * @param __classNone (default ico|uico_none) - 없음 아이콘 클래스
     */
    none(__$element: HTMLElement, __classNone?: string): void;
}