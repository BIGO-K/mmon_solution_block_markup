/** @extends interface MMON UI */
interface MUI {
    /**
     * * 정규식 이스케이프
     * @param __value
     * @returns
     */
    escape(__value: string): string;
    /**
     * * 셀럭터 이스케이프
     * + querySelector, element.matches에 추가된 클래스 규칙(`=`, `...`)을 적용하기 위해 해당 문자열 앞에 \\ 추가
     * + classList, getElementsByClassName 에서는 \ 없이 그대로 사용
     * @param __selector - 셀렉터 또는 복수의 셀렉터
     * @returns .class.S\\=on .class\\.\\.\\.name
     */
    selector(__selector: string): string;
    /**
     * * 3자리마다 ,표시
     * @param __value
     * @returns 1,234,567
     */
    comma(__value: number | string): string;
    /**
     * * 쿼리스트링
     * @public
     */
    query: UtilQuery;
    /**
     * * 컬러
     * @public
     */
    color: UtilColor;
    /**
     * * 함수 실행
     * @param __callback - 함수 또는 문자열 함수
     * @param __params (default [])
     * @returns 실행되는 함수에 따라 리턴 값 유/무
     */
    apply(__callback: unknown, __params: unknown[] = []): any;
    /**
     * * 클립보드에 복사
     * + click 등 document에 이벤트가 발생해야 실행
     * @param __text - 복사할 내용
     * @param __callback - 복사 실행 후 콜백, 성공 여부 파라미터로 리턴
     */
    copy(__text: string, __callback?: ApplyFunc): void;
}

declare interface UtilQuery {
    /**
     * * 쿼리스트링을 오브젝트로 변환
     * + location.search 등에 사용
     * @param __value - foo=1&bar=2&baz[]=3&qux[]=4 형식의 문자열
     * @returns { foo: 1, bar: [] }
     */
    parse(__value: string): ObjectCollection;
    /**
     * * 오브젝트를 쿼리스트링으로 변환
     * @param __object
     * @param __isUrlSearch (default false) - location.search 값 처럼 앞에 ? 추가
     * @returns ?foo=1&bar[]=2&bar[]=3
     */
    stringify(__object: ObjectCollection, __isUrlSearch: boolean = false): string;
}

declare interface UtilColor {
    /**
     * * rgb/rgba 컬러를 hex로 변환
     * @param __value - rgb(0, 0, 0) 또는 rgba(0, 0, 0, 1)
     * @returns #000000
     */
    hex(__value: string): string;
    // ~ colorRgb(__value: string): string;
}