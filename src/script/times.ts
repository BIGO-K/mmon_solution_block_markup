/**
 * @class 시간
 * @static
 */

import Datas from './datas';
import Utils from './utils';

class Times {

	/**
	 * * 기본 시간(초)
	 */
    public static readonly FASTER = 0.1;
    public static readonly FAST = 0.2;
    public static readonly BASE = 0.4;
    public static readonly SLOW = 0.7;
    public static readonly SLOWER = 1;

	/**
	 * * 시간 간격
	 * @public @static
	*/
	public static readonly stamp: TimeStamp = {
		on: Times.stampOn,
		off: Times.stampOff,
	}

	/** 시간 간격 목록 */
	private static stamper: TimeStampList = {};

    /**
     * * 시간 간격 저장
     * @param __key - 구분 고유 값
     * @returns 시간 간격 밀리세컨드
     */
    private static stampOn(__key: string): number {

		const stamps: number[] | undefined = Times.stamper[__key];
		let _timeGap = 0;

        if (stamps == null) Times.stamper[__key] = [window.performance.now()];
        else {
            stamps.push(window.performance.now());
			_timeGap = stamps[stamps.length - 1] - stamps[stamps.length - 2];
        }

		return _timeGap;

    }

    /**
     * * 시간 저장 종료
     * @param __key - 구분 고유 값
     * @returns 시간 간격 밀리세컨드
     */
    private static stampOff(__key: string): number {

		const stamps: number[] | undefined = Times.stamper[__key];
        if (stamps == null) return 0;

        const _timeGap = window.performance.now() - stamps[stamps.length - 1];
		delete Times.stamper[__key];

        return _timeGap;

    }

	/**
	 * * 지연 함수
	 * @public @static
	 */
	public static readonly delay: TimeDelay = {
		on: Times.delayOn,
		off: Times.delayOff,
	}

	/** 실행 중인 딜레이 목록 */
	private static delayer: TimeDelayList = {};
	private static _delayCount: number = 0;// _name이 없을 때 이름 중복을 피하기 위해 사용

	/**
	 * * 지연 함수 실행
	 * @param __callback
	 * @param __option
	 * @param __option._time (default 1) - 딜레이 시간(ms)
	 * @param __option._isSec (default false) - 시간 단위를 초로 적용
	 * @param __option._name (default ``) - 값이 있으면 중복 실행 안됨
	 * @param __option._isOverwrite (default false) - 중복 적용일 때 덮어쓰기(_name과 같이 사용)
	 * @param __option.params (default []) - 콜백 파라미터
	 */
	private static delayOn(__callback: ApplyFunc, __option?: TimeDelayOption): void {

		const option: Required<TimeDelayOption> = Datas.clone({
			_time: 1,
			_isSec: false,
			_name: ``,
			_isOverwrite: false,
			params: [],
		}, __option);
		const _time = option._time * ((option._isSec) ? 1000 : 1);
		const _name = (option._name.length > 0) ? option._name : `DELAY_${Times._delayCount++}`;
		let _is = false;

		const delayItem = Times.delayer[_name];
		if (delayItem) {
			if (option._isOverwrite) {
				clearTimeout(delayItem);
				delete Times.delayer[_name];
			}
			else _is = true;
		}

		if (_is) return;

		Times.delayer[_name] = setTimeout((): void => {

			Times.delayOff(_name);
			Utils.apply(__callback, option.params);

		}, _time);

	}

	/**
	 * * 지연 함수 종료
	 * @param __name 구분 고유 값
	 */
	private static delayOff(__name: string): void {

		const delayItem = Times.delayer[__name];
		if (delayItem) {
			clearTimeout(delayItem);
			delete Times.delayer[__name];
		}

	}

}

export default Times;