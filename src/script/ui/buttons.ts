/**
 * @class 스위치(토글), 탭, 드롭다운, 토스트, 스테퍼
 * @constructor
 * @static
 */

import { gsap } from 'gsap';
import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Is from '../is';
import Pages from '../pages';
import Times from '../times';
import Utils from '../utils';
import BaseUI from './baseUI';

/** @class 스위치(토글) */
class Switch extends BaseUI {

	public data: Required<SwitchData> = {
		_classOn: `S=switch-on`,
        _title: `선택됨`,
        _defaultTitle: null,
        _isParent: false,
        _isParentUpdate: false,
        _parentSelector: null,
        onChange: null,
        onChangeParams: [],
        syncer: null,
        _isSync: true,
        desyncer: null,
        _isDesync: true,
	};

    /** 스위치 대상 */
    public readonly $target: Element;
    /** 변경 여부 */
    public get isOn(): boolean { return this.$target.classList.contains(this.data._classOn); }

    constructor(__$element: HTMLElement, __data?: SwitchData) {

		super(__$element, `switch`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        const $target = (!this.data._isParent) ? this.$element : (typeof this.data._parentSelector === `string`) ? this.$element.closest(this.data._parentSelector) : this.$element.parentElement;
        if ($target == null) throw { message: `${(this.data._parentSelector != null) ? `closest "${this.data._parentSelector}"` : `parent`} 요소를 찾을 수 없습니다.` };

        this.$target = $target;

        const switchClickHandler = (__e: MouseEvent): void => {

            __e.preventDefault();
            this.toggle();

        }
        Events.bind.on(this.$element, `click`, switchClickHandler);

        this.toggle(this.isOn);

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.bind.off(this.$element, `click`);//, `switchClickHandler`);

	}

    /**
     * * 토글
     * @param __is
     */
    public toggle(__is?: boolean): void {

        const _is = (__is != null) ? __is : !this.isOn;
        if (_is) {
            this.$target.classList.add(this.data._classOn);
            this.$element.setAttribute(`title`, this.data._title);
        }
        else {
            this.$target.classList.remove(this.data._classOn);
            if (this.data._defaultTitle != null) this.$element.setAttribute(`title`, this.data._defaultTitle);
            else this.$element.removeAttribute(`title`);
        }

        Pages.sync(this.$target, _is, this._name);// 싱크

        Utils.apply(this.data.onChange, [{ ui: this }, ...this.data.onChangeParams]);

    }

    /**
     * * 활성
     */
    public on(): void {

        this.toggle(true);

    }

    /**
     * * 비활성
     */
    public off(): void {

        this.toggle(false);

    }

    /**
     * * 스위치 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: SwitchData = {}, __onCatch?: (__ui: Switch) => void): Switch[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 스위치 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Switch[] = Switch.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 스위치 토글
     * @public @static
     * @param __elements
     * @param __is
     */
    public static toggle(__elements: ElementSelector, __is?: boolean): void {

        const UIs: Switch[] = Switch.update(__elements);
        for (const ui of UIs) ui.toggle(__is);

    }

    /**
     * * 스위치 활성
     * @public @static
     * @param __elements
     */
    public static on(__elements: ElementSelector): void {

        const UIs: Switch[] = Switch.update(__elements);
        for (const ui of UIs) ui.toggle(true);

    }

    /**
     * * 스위치 비활성
     * @public @static
     * @param __elements
     */
    public static off(__elements: ElementSelector): void {

        const UIs: Switch[] = Switch.update(__elements);
        for (const ui of UIs) ui.toggle(false);

    }

}

/** @class 탭 */
class Tab extends BaseUI {

	public data: Required<TabData> = {
		_classOn: `S=tab-on`,
		_selectorBtn: `.btn_tab`,
		_title: `선택됨`,
		_isToggle: false,
		onChange: null,
		onChangeParams: [],
	};

    /** 인덱스 */
    public get index(): number { return this._index }
    private _index: number;

    constructor(__$element: HTMLElement, __data?: TabData) {

		super(__$element, `tab`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        this._index = -1;

        const tabClickHandler = (__e: MouseEvent, __data: unknown, __$target: HTMLElement): void => {

            __e.preventDefault();
            this.change(__$target);

        }
        Events.delegate.on(this.$element, this.data._selectorBtn, `click`, tabClickHandler);

        this.change();

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.delegate.off(this.$element, this.data._selectorBtn, `click`);//, `tabClickHandler`);

	}

    /**
     * * 변경
     * @param __target - 변경할 인덱스 또는 클릭한 탭 메뉴 요소 또는 변경할 탭 요소 컨텐츠
     */
    public change(__target?: number | HTMLElement): void {

        const $btns = this.find(this.data._selectorBtn);
        const $items = this.find(`.${this._prefix}tab-item`);

        let _tabIndex = $btns.findIndex(__$el => __$el.classList.contains(this.data._classOn));
        if (__target instanceof HTMLElement) _tabIndex = ((__target.matches(this.data._selectorBtn)) ? $btns : $items).findIndex(__$el => __$el === __target);
        if (!this.data._isToggle && _tabIndex < 0) _tabIndex = 0;

        this._index = (_tabIndex === this._index && this.data._isToggle) ? -1 : _tabIndex;

        for (const [_i, $el] of $btns.entries()) {
            if (_i === this._index) {
                $el.setAttribute(`title`, this.data._title);
                $el.classList.add(this.data._classOn);
                $items[_i].classList.add(this.data._classOn);
            }
            else {
                $el.removeAttribute(`title`);
                $el.classList.remove(this.data._classOn);
                $items[_i].classList.remove(this.data._classOn);
            }
        }

        Utils.apply(this.data.onChange, [{ ui: this, $buttons: $btns, $items: $items }, ...this.data.onChangeParams]);

    }

    /**
     * * 내부 요소 검색
     * @param __elements
     * @returns
     */
    private find(__elements: ElementSelector): HTMLElement[] {

        return Doms.find(__elements, this.$element).filter(__$el => __$el.closest(`[data-${this._name}]`) === this.$element);

    }

    /**
     * * 탭 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: TabData = {}, __onCatch?: (__ui: Tab) => void): Tab[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 탭 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Tab[] = Tab.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 탭 변경
     * @public @static
     * @param __elements
     * @param __target
     */
    public static change(__elements: ElementSelector, __target: number | HTMLElement): void {

        const UIs: Tab[] = Tab.update(__elements);
        for (const ui of UIs) ui.change(__target);

    }

    /**
     * * 탭 인덱스
     * @public @static
     * @param __elements - 단일 요소
     * @returns
     */
    public static index(__elements: ElementSelector): number {

        const UIs: Tab[] = Tab.update(__elements);
        return UIs[0]._index;

    }

}

/** @class 드롭다운 */
class Dropdown extends BaseUI {

    public data: Required<DropdownData> = {
		_classOn: `S=on`,
        _time: 0,
        _group: null,
        _isGroupToggle: true,
        onChange: null,
        onChangeParams: [],
	};

    /** 변경 여부 */
    public get isOn(): boolean { return this.$element.classList.contains(this.data._classOn); }

    /** 드롭다운 요소가 테이블 */
    private _isTable: boolean;
    // 요소
    private $btn: HTMLElement;
    private $item: HTMLElement;

    constructor(__$element: HTMLElement, __data?: DropdownData) {

		super(__$element, `dropdown`);

		this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        this.$btn = this.find(`.btn_dropdown`)[0];
        this.$item = this.find(`.${this._prefix}dropdown-item`)[0];
        this._isTable = [`TBODY`, `TR`].includes(this.$item.tagName);

        const dropdownClickHandler = (__e: TouchEvent): void => {

            __e.preventDefault();
            this.toggle();

        }
        Events.bind.on(this.$btn, `click`, dropdownClickHandler);

        this.toggle(this.isOn);

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.bind.off(this.$btn, `click`);//, dropdownClickHandler);

	}

    /**
     * * 토글
     * @param __is
     */
    public toggle(__is?: boolean): void {

        const _is = (__is != null) ? __is : !this.isOn;
        if (this._isTable) this.data._time = 0;

        if (_is) {
            this.$element.classList.add(this.data._classOn);
            this.$btn.setAttribute(`title`, `접어놓기`);

            if (this._isTable) Doms.show(this.$item);
            else {
                if (this.data._time > 0) gsap.to(this.$item, { height: Doms.find(`> .${this._prefix}dropdown-item-inner`, this.$item)[0].offsetHeight, duration: this.data._time, ease: `cubic.out` });
                else Doms.style(this.$item, { height: `auto` });
            }

            // 그룹 닫기(아코디언 모션)
            const UIs: Dropdown[] = Dropdown.update(`[data-dropdown*="'_group'"][data-dropdown*="'${this.data._group}'"]`);
            for (const ui of UIs) {
                if (ui === this) continue;// 현재 요소 제외
                ui.toggle(false);
            }
        }
        else {
            this.$element.classList.remove(this.data._classOn);
            this.$btn.setAttribute(`title`, `펼쳐보기`);

            if (this._isTable) Doms.hide(this.$item);
            else {
                if (this.data._time > 0) gsap.to(this.$item, { height: 0, duration: this.data._time, ease: `cubic.out` });
                else Doms.style(this.$item, { height: `` });
            }
        }

        Utils.apply(this.data.onChange, [{ ui: this }, ...this.data.onChangeParams]);

    }

    /**
     * * 활성
     */
    public on(): void {

        this.toggle(true);

    }

    /**
     * * 비활성
     */
    public off(): void {

        this.toggle(false);

    }

    /**
     * * 내부 요소 검색
     * @param __elements
     * @returns
     */
    private find(__elements: ElementSelector): HTMLElement[] {

        return Doms.find(__elements, this.$element).filter(__$el => __$el.closest(`[data-${this._name}]`) === this.$element);

    }

    /**
     * * 드롭다운 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: DropdownData = {}, __onCatch?: (__ui: Dropdown) => void): Dropdown[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 드롭다운 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Dropdown[] = Dropdown.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 드롭다운 토글
     * @public @static
     * @param __elements
     * @param __is
     */
    public static toggle(__elements: ElementSelector, __is?: boolean): void {

        const UIs: Dropdown[] = Dropdown.update(__elements);
        for (const ui of UIs) ui.toggle(__is);

    }

    /**
     * * 드롭다운 활성
     * @public @static
     * @param __elements
     */
    public static on(__elements: ElementSelector): void {

        const UIs: Dropdown[] = Dropdown.update(__elements);
        for (const ui of UIs) ui.toggle(true);

    }

    /**
     * * 드롭다운 비활성
     * @public @static
     * @param __elements
     */
    public static off(__elements: ElementSelector): void {

        const UIs: Dropdown[] = Dropdown.update(__elements);
        for (const ui of UIs) ui.toggle(false);

    }

}

/** @class 토스트 */
class Toast extends BaseUI {

    public data: Required<ToastData> = {
		_classOn: `S=on`,
        onChange: null,
        onChangeParams: [],
	};

    /** 변경 여부 */
    public get isOn(): boolean { return this.$element.classList.contains(this.data._classOn); }

    /** 모션이 진행되면서 변경되는 값 */
    private _value: number;
    // 요소
    private $btn: HTMLElement;

    constructor(__$element: HTMLElement, __data?: ToastData) {

		super(__$element, `toast`);

        this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        this.$btn = Doms.find(`.btn_toast`, __$element)[0];
        this._value = 0;

        const btnTouchStartHandler = (__e: TouchEvent | MouseEvent): void => {

            __e.preventDefault();
            if (gsap.isTweening(this)) return;

            const _stampKey = `${this._name}${Date.now()}`;
            Times.stamp.on(_stampKey);

            const _startValue = (this.isOn) ? 0 : 1;
            const startY = (__e instanceof TouchEvent) ? __e.touches[0].screenY : __e.clientY;
            let beforeY = startY;
            let _isUp = false;

            const btnTouchMoveEndHandler = (__e: TouchEvent | MouseEvent) => {

                __e.preventDefault();

                const touchY = (__e instanceof TouchEvent) ? (__e.type === `touchend`) ? __e.changedTouches[0].screenY : __e.touches[0].screenY : __e.clientY;
                Doms.style(this.$element, { transition: `none` });

                const _progress = (startY - touchY) / this.$element.offsetHeight;
                this._value = _startValue -_progress;

                _isUp = (touchY < beforeY) ? true : (touchY > beforeY) ? false : _isUp;

                switch (__e.type) {
                    case `touchmove`:
                    case `mousemove`:
                        this.move();
                        beforeY = touchY;
                        break;
                    case `touchend`:
                    case `mouseup`:
                        const _touchTime = Times.stamp.off(_stampKey) / 1000;
                        // 빠른 드래그, 클릭
                        if (_touchTime < 0.2) {
                            Doms.style(this.$element, { transform: ``, transition: `` });
                            this.toggle();
                        }
                        else {
                            gsap.to(this, { _value: (_isUp) ? 0 : 1, duration: Times.FAST, ease: `cubic.out`,
                                onUpdate: (): void => this.move(),
                                onComplete: (): void => {

                                    this.toggle(_isUp);
                                    Doms.style(this.$element, { transform: ``, transition: `` });

                                }
                            });
                        }

                        Events.bind.off(this.$btn, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, btnTouchMoveEndHandler);
                        break;
                }

            }
            Events.bind.on(this.$btn, (Is.mobile()) ? `touchmove touchend` : `mousemove mouseup`, btnTouchMoveEndHandler);

        }
        Events.bind.on(this.$btn, (Is.mobile()) ? `touchstart` : `mousedown`, btnTouchStartHandler);

        this.toggle(this.isOn);

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.bind.off(this.$btn, (Is.mobile()) ? `touchstart` : `mousedown`);//, `btnTouchStartHandler`);

	}

    /**
     * * 토글
     * @param __is
     */
    public toggle(__is?: boolean): void {

        const _is = (__is != null) ? __is : !this.isOn;
        if (_is) {
            this.$element.classList.add(this.data._classOn);
            this.$btn.setAttribute(`title`, `접어놓기`);
        }
        else {
            this.$element.classList.remove(this.data._classOn);
            this.$btn.setAttribute(`title`, `펼쳐보기`);
        }

        Utils.apply(this.data.onChange, [{ ui: this }, ...this.data.onChangeParams]);

    }

    /**
     * * 활성
     */
    public on(): void {

        this.toggle(true);

    }

    /**
     * * 비활성
     */
    public off(): void {

        this.toggle(false);

    }

    /**
     * * 모션 업데이트
     */
    private move(): void {

        Doms.style(this.$element, { transform: `translateY(${Math.max(0, Math.min(100, this._value * 100))}%)` });

    }

    /**
     * * 토스트 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: ToastData = {}, __onCatch?: (__ui: Toast) => void): Toast[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 토스트 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Toast[] = Toast.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 토스트 토글
     * @public @static
     * @param __elements
     * @param __is
     */
    public static toggle(__elements: ElementSelector, __is?: boolean): void {

        const UIs: Toast[] = Toast.update(__elements);
        for (const ui of UIs) ui.toggle(__is);

    }

    /**
     * * 토스트 활성
     * @public @static
     * @param __elements
     */
    public static on(__elements: ElementSelector): void {

        const UIs: Toast[] = Toast.update(__elements);
        for (const ui of UIs) ui.toggle(true);

    }

    /**
     * * 토스트 비활성
     * @public @static
     * @param __elements
     */
    public static off(__elements: ElementSelector): void {

        const UIs: Toast[] = Toast.update(__elements);
        for (const ui of UIs) ui.toggle(false);

    }

}

/** @class 스테퍼 */
class Stepper extends BaseUI {

    public data: Required<StepperData> = {
		_min: 1,
        _max: 99,
        onChange: null,
        onChangeParams: [],
	};

    // 요소
    private $text: HTMLInputElement;
    private $btnSubtract: HTMLElement;
    private $btnAdd: HTMLElement;

    constructor(__$element: HTMLElement, __data?: StepperData) {

        super(__$element, `stepper`);

        this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        this.$text = Doms.find(`.text_stepper`, __$element)[0] as HTMLInputElement;
        this.$btnSubtract = Doms.find(`.btn_stepper-subtract`, __$element)[0];
        this.$btnAdd = Doms.find(`.btn_stepper-add`, __$element)[0];

        const btnClickHandler = (__e: MouseEvent): void => {

            __e.preventDefault();

            let _value = parseFloat(this.$text.value);
            if (Number.isNaN(_value)) _value = 1;

            this.change(_value + (((__e.currentTarget as HTMLElement).classList.contains(`btn_stepper-add`)) ? 1 : -1));

        }
        Events.bind.on([this.$btnSubtract, this.$btnAdd], `click`, btnClickHandler);

        this.change();

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.bind.off([this.$btnSubtract, this.$btnAdd], `click`);//, `btnClickHandler`);

	}

    /**
     * * 수량 변경
     * @param __target - {number} 적용할 수량 직접 입력, {InputEvent} keyup으로 수량 변경
     */
    public change(__target?: number | Event): void {

        let _value = (typeof __target === `number` && __target > -1) ? __target : parseFloat(this.$text.value);
        _value = Math.max(Math.min(_value, this.data._max), this.data._min);
        if (Number.isNaN(_value)) _value = (__target instanceof InputEvent) ? NaN : this.data._min;

        this.$text.value = (Number.isNaN(_value)) ? `` : String(_value);

        Doms.property(this.$btnSubtract, { disabled: Number.isNaN(_value) || _value <= this.data._min });
        Doms.property(this.$btnAdd, { disabled: Number.isNaN(_value) || _value >= this.data._max });

        Utils.apply(this.data.onChange, [{ ui: this }, ...this.data.onChangeParams]);

    }

    /**
     * * 스테퍼 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: StepperData = {}, __onCatch?: (__ui: Stepper) => void): Stepper[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 스태퍼 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Stepper[] = Stepper.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 스테퍼 수량 변경
     * @public @static
     * @param __elements
     * @param __target - {number} 적용할 수량 직접 입력, {KeyboardEvent} keyup으로 수량 변경
     */
    public static change(__elements: ElementSelector, __target?: number | Event): void {

        const UIs: Stepper[] = Stepper.update(__elements);
        for (const ui of UIs) ui.change(__target);

    }

}

export { Switch, Tab, Dropdown, Toast, Stepper };
