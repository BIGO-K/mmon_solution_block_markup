/** @extends interface MMON UI */
interface MUI {
    /**
	 * * 기본 시간(초)
	 */
    time: TimeTable;
    /**
	 * * 시간 간격
	 * @public
	*/
    stamp: TimeStamp;
    /**
	 * * 지연 함수
	 * @public
	 */
    delay: TimeDelay;
}

declare interface TimeTable {
    /** 0.1s */
    _faster: number;
    /** 0.2s */
    _fast: number;
    /** 0.4s */
    _base: number;
    /** 0.7s */
    _slow: number;
    /** 1s */
    _slower: number;
}

declare interface TimeStamp {
    /**
     * * 시간 간격 저장
     * @param __key 구분 고유 값
     * @returns 시간 간격 밀리세컨드
     */
    on(__key: string): number;
    /**
     * * 시간 저장 종료
     * @param __key 구분 고유 값
     * @returns 시간 간격 밀리세컨드
     */
    off(__key: string): number;
}

declare interface TimeStampList {
	[key: string]: number[];
}

declare interface TimeDelay {
    /**
	 * * 지연 함수 실행
	 * @param __callback
	 * @param __option
	 * @param __option._time (default 1) - 딜레이 시간(ms)
	 * @param __option._isSec (default false) - 시간 단위를 초로 적용
	 * @param __option._name (default ``) - 값이 있으면 중복 실행 안됨
	 * @param __option._isOverwrite (default false) - 중복 적용일 때 덮어쓰기(_name과 같이 사용)
	 * @param __option.thisEl (default undefined) - 콜백 this 객체
	 * @param __option.params (default []) - 콜백 파라미터
	 */
    on(__callback: ApplyFunc, __option?: TimeDelayOption): void;
    /**
	 * * 지연 함수 종료
	 * @param __name 구분 고유 값
	 */
    off(__name: string): void;
}

declare interface TimeDelayList {
	[key: string]: number;
}

declare interface TimeDelayOption {
    /** (default 1) 딜레이 시간(ms) */
    _time?: number;
    /** (default false) 시간 단위를 초로 적용 */
    _isSec?: boolean;
    /** (default ``) 값이 있으면 중복 실행 안됨 */
    _name?: string;
    /** (default false) 중복 적용일 때 덮어쓰기(_name과 같이 사용) */
    _isOverwrite?: boolean;
    /** (default []) 콜백 파라미터 */
    params?: unknown[];
}