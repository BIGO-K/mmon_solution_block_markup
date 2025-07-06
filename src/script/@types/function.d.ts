/**
 * * 키와 값 위치를 바꿈
 * + value: key
 * + const 타입은 ValueOf<typeof Type> 형식으로 Type 앞에 typeof를 추가하여 사용
 * + interface가 아닌 const, type 형식만 가능
 */
declare type ValueToKey<T extends Record<keyof T, string | number>> = {
	[K in keyof T as T[K]]: K;
}


/**
 * * readonly 제거
 */
declare type readonlyToUse<T> = {
	-readonly [K in keyof T]: T[K];
}