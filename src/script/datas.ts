/**
 * @class 데이터
 * @static
 */

import axios from 'axios';
import Is from './is';
import Utils from './utils';

class Datas {

    /**
     * * 오브젝트 깊은 병합/복제
	 * + 얕은 복제는 {...foo, ...bar}, [...foo, ...bar] ...스프레드 연산자 사용
     * + array length가 다를 때 결과 값 주의 - [0, 1, 2] + [3, 4] = [3, 4, 2] 원본 개수 유지됨
	 * @public @static
     * @param __items - {object | array} 복제에는 단일, 병합에는 복수의 파라미터 전달
     * @returns 병합/복제 된 값
     */
	public static clone<T>(...__items: unknown[]): T {

		// __base 값이 있으면 병합, 없으면 복제
		const reproduce = (__target: any, __base?: any): any => {

			if (!(Is.object(__target) || Array.isArray(__target)) || !(Is.object(__base) || Array.isArray(__base))) return __target;

			const obj: ObjectCollection = (__base?.constructor === __target.constructor) ? __base : __target.constructor();
			for (const _key in __target) obj[_key] = reproduce(__target[_key], obj[_key]);

			return obj;

		}

		let clone: T = reproduce(__items[0]);
		let _count = 0;
		while (++_count < __items.length) {
			if (!(Is.object(__items[_count]) || Array.isArray(__items[_count]))) continue;
			clone = reproduce(__items[_count], clone);
		};

		return clone;

	}

	/**
	 * * 폐기 날짜
	 * + cookie, local
	 * @param __day (default 365) - 유지 기간
	 * @param __isMidnight (defult false) - 자정(0시)를 기준으로 설정
	 * @returns UTCString
	 */
	private static getExpireDay(__day: number = 365, __isMidnight: boolean = false): string {

		const date = new Date();
		if (__isMidnight) date.setHours(0, 0, 0, 0);
		date.setTime(date.getTime() + (__day * 24 * 60 * 60 * 1000));

		return date.toUTCString();

	}

	/**
	 * * 쿠키
	 * + 4kb, 4000자까지 저장 가능
	 * @public @static
	 */
	public static readonly cookie: DataCookie = {
		set: Datas.cookieSet,
		get: Datas.cookieGet,
		remove: Datas.cookieRemove,
	}

	/**
	 * * 쿠키 저장
	 * @param __key
	 * @param __value (default `true`)
	 * @param __day (default 365) - 유지 기간
	 * @param __isMidnight (default false) - 자정(0시)를 기준으로 설정
	 */
	private static cookieSet(__key: string, __value: string | number = `true`, __day: number = 365, __isMidnight: boolean = false): void {

		document.cookie = `${__key}=${encodeURIComponent(__value)}; expires=${Datas.getExpireDay(__day, __isMidnight)}; path=/; domain=${location.hostname}`;

	}

	/**
	 * * 쿠키 가져오기
	 * @param __key
	 * @returns
	 */
	private static cookieGet(__key: string): string | undefined {

		const cookies = document.cookie.split(`;`);
		const _cookie = cookies.find(__cookie => __cookie.startsWith(`${__key}=`));

		return (_cookie == null) ? undefined : decodeURIComponent(_cookie.split(`=`)[1]);

	}

	/**
	 * * 쿠키 삭제
	 * @param __key
	 */
	private static cookieRemove(__key: string): void {

		Datas.cookieSet(__key, ``, -1);

	}

	/**
	 * * 로컬 쿠키(스토리지)
	 * + 사용은 쿠키와 같음
	 * + 로컬 스토리지에 저장하여 브라우저를 닫아도 유지
	 * + 개인정보 저장에 주의
	 * @public @static
	 */
	public static readonly local: DataLocal = {
		set: Datas.localSet,
		get: Datas.localGet,
		remove: Datas.localRemove,
	}

	/**
	 * * 로컬 쿠키 저장
	 * @param __key
	 * @param __value (default `true`)
	 * @param __day (default 365) - 유지 기간
	 * @param __isMidnight (default false) - 자정(0시)를 기준으로 설정
	 */
	private static localSet(__key: string, __value: unknown = `true`, __day: number = 365, __isMidnight: boolean = false): void {

		const item: DataLocalItem = { value: __value, _expire: Datas.getExpireDay(__day, __isMidnight) };
		Datas.storageSet(`local`, __key, item);

	}

	/**
	 * * 로컬 쿠키 가져오기
	 * @param __key
	 * @returns
	 */
	private static localGet<T>(__key: string): T | undefined;
	private static localGet(__key: string): unknown;
	private static localGet(__key: string): unknown {

		const data = Datas.storageGet<DataLocalItem>(`local`, __key);
		if (data == null) return undefined;

		// 폐기
		if (data._expire < new Date().toUTCString()) {
			Datas.localRemove(__key);
			return undefined;
		}
		else return data.value;

	}

	/**
	 * * 로컬 쿠키 삭제
	 * @param __key
	 */
	private static localRemove(__key: string): void {

		Datas.storageRemove(`local`, __key);

	}

	/**
	 * * 로컬/세션 스토리지
	 * + 값을 string만 지원하여 JSON으로 변환하여 저장
	 * + 도메인을 기준으로 저장
	 * + session은 브라우저를 닫으면 삭제
	 * + local은 브라우저를 닫아도 유지
	 * + 개인정보 저장에 주의
	 * + 5mb까지 저장 가능
	 * @public @static
	 */
	public static readonly storage: DataStorage = {
		set: Datas.storageSet,
		get: Datas.storageGet,
		remove: Datas.storageRemove,
		clear: Datas.storageClear,
	}

	/**
	 * * 스토리지 저장
	 * @param __type - `session`, `local
	 * @param __key
	 * @param __value
	 */
	private static storageSet(__type: DataStorageType, __key: string, __value: unknown): void {

		const item: DataStorageItem = { _type: (Array.isArray(__value)) ? `array` : typeof __value, value: __value };
		window[`${__type}Storage`].setItem(__key, JSON.stringify(item));

	}

	/**
	 * * 스토리지 가져오기
	 * @param __type - `session`, `local
	 * @param __key
	 * @returns
	 */
	private static storageGet<T>(__type: DataStorageType, __key: string): T | undefined;
	private static storageGet(__type: DataStorageType, __key: string): unknown;
	private static storageGet(__type: DataStorageType, __key: string): unknown {

		const _value = window[`${__type}Storage`].getItem(__key);
		if (_value == null) return undefined;

		const item: DataStorageItem = JSON.parse(_value);
		return item.value;
	}

	/**
	 * * 스토리지 삭제
	 * @param __type - `session`, `local
	 * @param __key
	 */
	private static storageRemove(__type: DataStorageType, __key: string): void {

		window[`${__type}Storage`].removeItem(__key);

	}

	/**
	 * * 스토리지 전체 삭제
	 * @param __type - `session`, `local
	 */
	private static storageClear(__type: DataStorageType): void {

		window[`${__type}Storage`].clear();

	}

	/**
	 * * 히스토리
	 * + url과 history index 기준으로 저장
	 * + url이 같아도 history index가 다르면 별도로 저장
	 * + 브라우저를 닫으면 삭제
	 * + 640k까지 저장 가능
	 * @public @static
	 */
	public static readonly history: DataHistory = {
		set: Datas.historySet,
		get: Datas.historyGet,
		remove: Datas.historyRemove,
	}

	/**
	 * * 히스토리 저장
	 * + history.state에 object가 아닌 값이 있으면 저장 안됨
	 * @param __key
	 * @param __value
	 * @param __window - history를 가져올 window 요소
	 */
	private static historySet(__key: string, __value: unknown, __window: Window = window): void {

		const history = __window.history;

		if (history.state == null) history.replaceState({ [__key]: __value }, document.title);
		else if (!Is.object(history.state)) console.error(`history.state is not an object type:`, history.state);
		else __window.history.state[__key] = __value;

	}

	/**
	 * * 히스토리 가져오기
	 * @param __key
	 * @param __window - history를 가져올 window 요소
	 * @returns
	 */
	private static historyGet<T>(__key: string, __window: Window): T | undefined;
	private static historyGet(__key: string, __window: Window): unknown;
	private static historyGet(__key: string, __window: Window = window): unknown {

		const state = __window.history.state;
		return (state == null) ? undefined : (!Is.object(state)) ? state : state[__key];

	}

	/**
	 * * 히스토리 삭제
	 * @param __key
	 * @param __window - history를 가져올 window 요소
	 */
	private static historyRemove(__key: string, __window: Window = window): void {

		const state = __window.history.state;
		if (Is.object(state)) delete state[__key];

	}

	/**
	 * * 로드 axios
	 * + 로딩은 onStart, onFinally에 연결 가능
	 * @public @static
	 * @param __url
	 * @param __option
	 * @param __option.config - axios 설정
	 * @param __option.onStart (default null) - 로드 전에 콜백
	 * @param __option.onStartParams (default [])
	 * @param __option.onComplete (default null) - 로드 성공 후 콜백
	 * @param __option.onCompleteParams (default [])
	 * @param __option.onError (default null) - 로드 실패 콜백
	 * @param __option.onErrorParams (default [])
	 * @param __option.onFinally (default null) - 로드 성공/실패 상관없이 종료 후 콜백
	 * @param __option.onFinallyParams (default [])
	 */
	public static axios(__url: string, __option?: DataLoadOption): void {

		const option: Required<DataLoadOption> = Datas.clone({
			config: {
				url: __url,
				method: `get`,
				// baseURL: ``,
				// params: {},// url 파라미터
				// data: {},// 요청 바디로 전송될 데이터
				responseType: `json`,// `json`, `arraybuffer`, `document`, `text`, `stream`, `blob`
				responseEncoding: `utf8`,
				// timeout: 1000,
				// headers: {},
				maxContentLength: 2000,
			},
			onStart: null,
			onStartParams: [],
			onComplete: null,
			onCompleteParams: [],
			onError: null,
			onErrorParams: [],
			onFinally: null,
			onFinallyParams: [],
		}, __option);

		Utils.apply(option.onStart, option.onStartParams);

		axios(option.config)
		.then(__res => {

			// __res.data 응답
			// __res.status 상태 코드
			// __res.statusText 상태 메시지
			// __res.headers HTTP 헤더

			Utils.apply(option.onComplete, [__res, ...option.onCompleteParams]);

		})
		.catch(__error => {

			// __error.response 전송 후 서버에서 2xx 외 상태 코드로 응답
			// __error.request 전송 후 응답 수신 안됨
			// __error.message 그 외 오류가 발생한 요청을 설정하는 동안 문제 발생

			console.error(`Failed to axios: ${__url}`, __error);
			Utils.apply(option.onError, [__error, ...option.onErrorParams]);

		})
		.then(() => Utils.apply(option.onFinally, option.onFinallyParams));// finally

	}

	/**
	 * * 데이터 로드
	 * todo: 옵션 추가 및 테스트 or axios 쓸까...
	 * @public @static
	 * @param __url
	 */
	public static load(__url: string): void {

		// fetch(__url, option)
		fetch(__url)
		.then(__res => {

			// __res[`${option.returnType}`]();
			// __res[`blob`]();

			// __res.text();
			// __res.json();
			// __res.formData();
			// __res.blob();
			// __res.arrayBuffer();
			return __res.json();

		})
		.catch(__error => console.error(`Failed to load: ${__url}`, __error));

	}

	/**
	 * * blob 변환
	 * @public @static
	 * @param __url
	 * @returns
	 */
	public static async loadBlob(__url: string): Promise<Blob> {

		const res = await fetch(__url);
		return res.blob();

		// ! Datas.load(__url, { returnType: `blob` }); 으로?

	}

}

export default Datas;