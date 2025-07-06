/** @extends interface MMON UI */
interface MUI {
    /**
     * * 오브젝트 깊은 병합/복제
     * + 얕은 복제는 {...foo, ...bar}, [...foo, ...bar] ...스프레드 연산자 사용
     * + array length가 다를 때 결과 값 주의 - [0, 1, 2] + [3, 4] = [3, 4, 2] 원본 개수 유지됨
     * @param __items - {object | array} 복제에는 단일, 병합에는 복수의 파라미터 전달
     * @returns 병합/복제 된 값
     */
    clone<T extends ObjectCollection>(...__items: unknown[]): T;
    /**
	 * * 쿠키
	 * + 4kb, 4000자까지 저장 가능
	 * @public
	 */
    cookie: DataCookie;
    /**
	 * * 로컬 쿠키(스토리지)
	 * + 사용은 쿠키와 같음
	 * + 로컬 스토리지에 저장하여 브라우저를 닫아도 유지
	 * + 개인정보 저장에 주의
	 * @public
	 */
    local: DataLocal;
    /**
	 * * 로컬/세션 스토리지
	 * + 값을 string만 지원하여 JSON으로 변환하여 저장
	 * + 도메인을 기준으로 저장
	 * + session은 브라우저를 닫으면 삭제
	 * + local은 브라우저를 닫아도 유지
	 * + 개인정보 저장에 주의
	 * + 5mb까지 저장 가능
     * @public
	 */
    storage: DataStorage;
    /**
	 * * 히스토리
	 * + url과 history index 기준으로 저장
	 * + url이 같아도 history index가 다르면 별도로 저장
	 * + 브라우저를 닫으면 삭제
	 * + 640k까지 저장 가능
     * @public
	 */
    history: DataHistory;
    /**
	 * * 로드 axios
	 * @param __url
	 * @param __option
	 * @param __option.config - axios 설정
	 * @param __option.onStart (default undefined) - 로드 전에 콜백
	 * @param __option.onStartParams (default [])
	 * @param __option.onComplete (default undefined) - 로드 성공 후 콜백
	 * @param __option.onCompleteParams (default [])
	 * @param __option.onError (default undefined) - 로드 실패 콜백
	 * @param __option.onErrorParams (default [])
	 * @param __option.onFinally (default undefined) - 로드 성공/실패 상관없이 종료 후 콜백
	 * @param __option.onFinallyParams (default [])
	 */
    axios(__url: string, __option?: DataLoadOption): void;
    // ~ load(__url: string): void;// fetch or axios
    /**
     * * blob 변환
     * @param __url
     */
    blob(__url: string): Promise<Blob>;
}

declare interface DataCookie {
    /**
	 * * 쿠키 저장
	 * @param __key
	 * @param __value (default `true`)
	 * @param __day (default 365) - 유지 기간
	 * @param __isMidnight (default false) - 자정(0시)를 기준으로 설정
	 */
    set(__key: string, __value: string | number = `true`, __day: number = 365, __isMidnight: boolean = false): void;
    /**
	 * * 쿠키 가져오기
	 * @param __key
	 * @returns
	 */
    get(__key: string): string | undefined;
    /**
	 * * 쿠키 삭제
	 * @param __key
	 */
    remove(__key: string): void;
}

declare interface DataLocal {
    /**
	 * * 로컬 쿠키 저장
	 * @param __key
	 * @param __value (default `true`)
	 * @param __day (default 365) - 유지 기간
	 * @param __isMidnight (default false) - 자정(0시)를 기준으로 설정
	 */
    set(__key: string, __value: unknown = `true`, __day: number = 365, __isMidnight: boolean = false): void;
    /**
	 * * 로컬 쿠키 가져오기
	 * @param __key
	 * @returns
	 */
	get<T>(__key: string): T | undefined;
	get(__key: string): unknown;
    /**
	 * * 로컬 쿠키 삭제
	 * @param __key
	 */
    remove(__key: string): void;
}

declare interface DataLocalItem {
    /** 저장할 값 */
    value: unknown;
    /** 폐기 날짜 UTCString */
    _expire: string;
}

declare interface DataStorage {
    /**
	 * * 스토리지 저장
	 * @param __type - `session`, `local
	 * @param __key
	 * @param __value
	 */
    set(__type: DataStorageType, __key: string, __value: unknown): void;
    /**
	 * * 스토리지 가져오기
	 * @param __type - `session`, `local
	 * @param __key
	 * @returns
	 */
	get<T>(__type: DataStorageType, __key: string): T | undefined;
	get(__type: DataStorageType, __key: string): unknown;
    /**
	 * * 스토리지 삭제
	 * @param __type - `session`, `local
	 * @param __key
	 */
    remove(__type: DataStorageType, __key: string): void;
    /**
	 * * 스토리지 전체 삭제
	 * @param __type - `session`, `local
	 */
    clear(__type: DataStorageType): void;
}

type DataStorageType = `session` | `local`;
declare interface DataStorageItem {
    /** 저장하는 값의 type */
    _type: string;
    /** 저장할 값 */
    value: unknown;
}

declare interface DataHistory {
    /**
	 * * 히스토리 저장
	 * + history.state에 object가 아닌 값이 있으면 저장 안됨
	 * @param __key
	 * @param __value
	 * @param __window - history를 가져올 window 요소
	 */
	set(__key: string, __value: unknown, __window: Window = window): void;
    /**
	 * * 히스토리 가져오기
	 * @param __key
	 * @param __window - history를 가져올 window 요소
	 * @returns
	 */
	get<T>(__key: string, __window: Window = window): T | undefined;
	get(__key: string, __window: Window = window): unknown;
    /**
	 * * 히스토리 삭제
	 * @param __key
	 * @param __window - history를 가져올 window 요소
	 * @returns
	 */
	remove(__key: string, __window: Window = window): void;
}

declare interface DataLoadOption {
    /** axios 설정 */
    config?: Partial<import("axios").AxiosRequestConfig>;
    /** (default null) 로드 전에 콜백 */
    onStart?: ApplyFunc | null;
    /** (default []) */
    onStartParams?: unknown[];
    /** (default null) 로드 성공 후 콜백 */
    onComplete?: ApplyFunc | null;
    /** (default []) */
    onCompleteParams?: unknown[];
    /** (default null) 로드 실패 콜백 */
    onError?: ApplyFunc | null;
    /** (default []) */
    onErrorParams?: unknown[];
    /** (default null) 로드 성공/실패 상관없이 종료 후 콜백 */
    onFinally?: ApplyFunc | null;
    /** (default []) */
    onFinallyParams?: unknown[];
}