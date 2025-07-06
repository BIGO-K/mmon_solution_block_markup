/**
 * @class 데이트픽커, 컬러픽커
 * @constructor
 * @static
 */

import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Is from '../is';
import Pages from '../pages';
import Utils from '../utils';
import BaseUI from './baseUI';
import { Forms } from './forms';

/** @class 데이트픽커 */
class Datepicker extends BaseUI {

	public data: Required<DatepickerData> = {
		weekdays: [`일`, `월`, `화`, `수`, `목`, `금`, `토`],
        _firstDay: 0,
        _format: `YYYY-MM-DD`,
        _multiple: 1,
        _isMonth: false,
        _isInline: false,
        _disableBeforeDate: null,
        _disableAfterDate: null,
        onSelect: null,
        onSelectParams: [],
	};

    public get pickDate(): string { return this._pickDate; };

    /** 선택한 날짜 */
    private _pickDate: string = ``;
    /** 인라인 클래스 */
    private readonly _classInline = `S=datepicker-inline`;
    /** 기간 input의 index */
    private _periodIndex: number = 0;
    /** 기간 시작일 */
    private _periodStart?: string;
    /** 기간 종료일 */
    private _periodEnd?: string;
    /** 열림 */
    private _isOpen: boolean = false;

    constructor(__$element: HTMLElement, __data?: DatepickerData) {

        super(__$element, `datepicker`);

        this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        // 요일 시작일에 따른 정렬
        this.data.weekdays = this.data.weekdays.slice(this.data._firstDay).concat(this.data.weekdays.slice(0, this.data._firstDay));

        // 텍스트 요소
        if (__$element instanceof HTMLInputElement) {
            const $ui = __$element.closest(`.${this._prefix}form-text`);
            if ($ui != null) {
                $ui.classList.add(`T=calendar`);
                if (__$element.readOnly) Doms.find(`.btn_text-clear`, $ui)[0].remove();
            }

            // value가 포멧에 맞는지 유효성 체크
            if (__$element.value.trim().length > 0) {
                const _value = this.getChecked(__$element.value);

                if (_value != null) this._pickDate = _value;
                else __$element.value = String(_value);
            }
        }

        if (this.data._isInline && !this._isOpen) {
            const $picker = this.create();
            $picker.classList.add(this._classInline);
            __$element.append($picker);
            this._isOpen = true;
        }
        else {
            const inputClickHandler = (__e: MouseEvent): void => {

                __e.stopPropagation();
                this.open();

            }
            Events.bind.on(__$element, `click`, inputClickHandler);
        }

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

        this.close();

		Events.bind.off(this.$element, `click`, `inputClickHandler`);

	}

    /**
     * * date 형식 유효성 체크
     * + date 형식과 format이 다르면 null 리턴
     * + date 형식과 format이 같아도 new Date()의 파라미터로 사용할 수 없는 형식은 변환하여 리턴
     * @param __date
     * @returns
     */
    public getChecked(__date: string): string | null {

        if (!Number.isNaN(new Date(__date))) return this.getFormatted(__date);

        const _format = this.data._format.toUpperCase();
        const dateSplits = __date.match(/\d+/g)!;
        const formatSplits = _format.match(/[YMD]+/g)!;

        if (!Is.match(__date.match(/\D+/g), _format.match(/[^YMD]+/g))) {
            console.log(`datepicker의 날짜 형식과 포멧이 일치하지 않습니다.`);
            return null;
        }
        else {
            const result = [];

            for (const _word of formatSplits) {
                const _index = (_word.startsWith(`Y`)) ? 0 : (_word.startsWith(`M`)) ? 1 : 2;
                result[_index] = `${(_word === `YY`) ? Math.floor(new Date().getFullYear() / 100) : ``}${dateSplits[_index]}`;
            }

            return this.getFormatted(result.join(`/`));
        }

    }

    /**
     * * date 형식 변경
     * + __date 값이 없으면 현재 날짜 반영
     * + _isMonth 값이 true이면, DD를 제외하고 YYYY-MM만 적용
     * @param __date
     * @returns
     */
    public getFormatted(__date?: string | Date): string {

        const date = (__date != null) ? new Date(__date) : new Date();
        let _format = this.data._format;

        // 월 선택 시 형식에서 DD제거
        if (this.data._isMonth && _format.includes(`D`)) {
            const formatSplits = _format.match(/[YMD]+/g)!;
            const formatSeparators = _format.match(/[^YMD]+/g)!;// 구분자
            const _dayIndex = formatSplits.findIndex(__word => __word.includes(`D`));

            formatSplits.splice(_dayIndex, 1);

            // 숫자 뒤에 구분자 있음
            if (!_format.split(``).pop()?.match(/[YMD]+/g)) formatSeparators.splice(_dayIndex, 1);
            // 숫자 사이에만 구분자 있음
            else formatSeparators.splice((_dayIndex - 1 < 0) ? 0 : _dayIndex - 1, 1);

            _format = formatSplits.flatMap((__word, __i) => [__word, formatSeparators[__i]]).join(``);
        }

        return _format.replace(/YYYY|YY|MM|M|DD|D/g, __word => {

            let _value: string | number;

            if (__word.includes(`Y`)) {
                _value = date.getFullYear();
                if (__word === `YY`) _value = _value % 100;
            }
            else if (__word.includes(`M`)) _value = date.getMonth() + 1;
            else _value = date.getDate();

            return (__word.length === 2) ? String(_value).padStart(2, `0`) : String(_value);

        });

    }

    /**
     * * new Date
     * + __date 값이 없으면 오늘 날짜로 리턴
     * @param __date
     */
    private getDate(__date?: string | Date): Date {

        return (__date == null || Is.empty(__date)) ? new Date() : new Date(__date);

    }

    /**
     * * 생성
     */
    private create(__date?: Date): HTMLElement {

        let $picker = Doms.find(`.${this._prefix}datepicker:not(.${this._classInline})`)[0];
        if ($picker == null) {
            $picker = document.createElement(`div`);
            $picker.classList.add(`${this._prefix}datepicker`);
        }

        // 내부 html구조 생성
        if (!this._isOpen) {
            if (this._classInline) $picker.classList.add(this._classInline);
            else ((frameElement == null) ? Doms.find(`.mm_page`)[0] : document.body).append($picker);

            const _itemTotal = (this.data._isMonth) ? 1 : this.data._multiple;
            for (let _i = 0; _i < _itemTotal; _i++) {
                const $template = Doms.create(
                    `<div class="${this._prefix}datepicker-item">
                        <div class="${this._prefix}datepicker-item-head">
                            <div class="${this._prefix}datepicker...head-label">
                                <span></span>
                                <select tabindex="-1"></select>
                            </div>
                        </div>
                        <table>
                            <thead>
                                ${(() => {
                                    if (this.data._isMonth) return `<th scope="col" colspan="4">월을 선택하세요</th>`;
                                    else return this.data.weekdays.map(__day => `<th scope="col">${__day}</th>`).join(``);
                                })()}
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>`
                )[0] as HTMLElement;

                $picker.append($template);

                // 월 선택 셀렉트를 추가하기 위해 클론
                if (!this.data._isMonth) {
                    const $label = Doms.find(`.${this._prefix}datepicker\\.\\.\\.head-label`, $template)[0];
                    $label.after($label.cloneNode(true));
                }
            }

            // 오늘 버튼
            const _today = this.getFormatted();
            const $pickerFoot = Doms.create(
                `<div class="${this._prefix}datepicker-foot">
                    <button type="button" class="mm_btn T=xs T=line T=lighter btn_today" data-datepicker-date="${_today}"><b>오늘로 설정</b></button>
                </div>`
            )[0] as HTMLElement;
            $picker.append($pickerFoot);

            const $btnToday = Doms.find(`.btn_today`, $pickerFoot);
            Events.bind.on($btnToday, `click`, this.onSelect);

            if ((this._periodEnd != null && this._periodEnd <= _today && this._periodIndex === 0)
            || (this._periodStart != null && this._periodStart >= _today && this._periodIndex === 1)
            || (this.data._disableBeforeDate != null && this.data._disableBeforeDate > _today)
            || (this.data._disableAfterDate != null && this.data._disableAfterDate < _today)) Doms.property($btnToday, { disabled: true });

            const $controls = Doms.create(
                `<button type="button" class="btn_prev-month"><i class="${this._prefixIco}datepicker-prev-month"></i><b class="mm_ir-blind">이전 달</b></button>
                <button type="button" class="btn_next-month"><i class="${this._prefixIco}datepicker-next-month"></i><b class="mm_ir-blind">다음 달</b></button>
                <button type="button" class="btn_prev-year"><i class="${this._prefixIco}datepicker-prev-year"></i><b class="mm_ir-blind">1년전</b></button>
                <button type="button" class="btn_next-year"><i class="${this._prefixIco}datepicker-next-year"></i><b class="mm_ir-blind">1년후</b></button>`.replace(/\n/g, ``)
            ) as HTMLElement[];// 월 선택에서 splice 할 때 줄바꿈(\n)을 text로 인식

            // 월 선택은 이전|다음 달 버튼 삭제
            if (this.data._isMonth) $controls.splice(0, 2);
            Events.bind.on($controls, `click`, this.onDraw);
            $picker.append(...$controls);
        }

        const date = this.getDate(__date);
        const $items = Doms.find(`.${this._prefix}datepicker-item`, $picker);
        for (const $item of $items) {
            const _year = date.getFullYear();
            const _month = date.getMonth() + 1;

            if (this._isOpen) Doms.property(Doms.find(`tbody`, $item), { innerHTML: `` });

            // select 요소
            const $selects = Doms.find(`.${this._prefix}datepicker\\.\\.\\.head-label select`, $item);
            Events.bind.on($selects, `change`, this.onDraw);

            for (const [_i, $select] of $selects.entries()) {
                $select.innerHTML = ``;

                const _min = (_i === 0) ? _year - 5 : 1;
                const _max = (_i === 0) ? _year + 5 : 12;

                for (let _k = _min; _k < _max; _k++) {
                    const $option = document.createElement(`option`);
                    $option.value = String(_i);
                    $select.append($option);

                    if (_k === _year || _k === _month) {
                        $option.selected = true;
                        $select.previousElementSibling!.textContent = String(_i);
                    }
                }
            }

            // 날짜
            const dates: (string | Date)[] = [];
            let startDate: number | Date;// 시작일
            let endDate: number | Date;// 마지말일

            if (this.data._isMonth) {
                startDate = 1;
                endDate = 12;

                while (startDate < endDate) {
                    dates.push(`${_year}-${String(startDate).padStart(2, `0`)}-01`);
                    startDate++;
                }
            }
            else {
                const _startIndex = -this.data._firstDay + new Date(_year, _month - 1, 1).getDay();
                const _endIndex = new Date(_year, _month, 0).getDay() - this.data._firstDay;

                // 시작일, 마지막일은 1~31일이 아닌 이전, 다음 월까지 계산된 일자입니다.
				// 해당 시작일, 마지막일 을 구하기 위해 new Date의 마지막 parameter는 1일, 마지막일의 getDay()를 기준으로 캘린더 시작일, 마지막일을 계산합니다.
                startDate = new Date(_year, _month - 1, (_startIndex < 0) ? -_startIndex - 6 : -_startIndex + 1);
                endDate = new Date(_year, _month, (_endIndex < 0) ? 6 - _endIndex - 7 : 6 - _endIndex);

                while (startDate <= endDate) {
                    dates.push(new Date(startDate));
                    startDate.setDate(startDate.getDate() + 1);
                }
            }

            const _satIndex = 5 - (this.data._firstDay - 1);// 토요일
            const _sunIndex = (_satIndex === 6) ? 0 : _satIndex + 1;// 일요일
            for (const [_i, _date] of dates.entries()) {
                const itemDate = this.getDate(_date);
                const _dateValue = this.getFormatted(itemDate);
                let $row: HTMLTableRowElement;
                let $btnDate: HTMLButtonElement;

                // 날짜 생성
                if (this.data._isMonth) {
                    if (_i % 4 === 0) $row = Doms.find(`tbody`, $item)[0].insertRow();
                    $btnDate = Doms.create(`<button type="button" class="btn_month" data-datepicker-date="${_dateValue}"><b>${itemDate.getMonth() + 1}</b></button>`)[0] as HTMLButtonElement;
                }
                else {
                    if (_i % 7 === 0) $row = Doms.find(`tbody`, $item)[0].insertRow();
                    $btnDate = Doms.create(`<button type="button" class="btn_month ${(_i % 7 === _satIndex) ? `S=sat` : (_i % 7 === _sunIndex) ? `S=sun` : ``}" data-datepicker-date="${_dateValue}"><b>${itemDate.getDate()}</b></button>`)[0] as HTMLButtonElement;
                }
                Events.bind.on($btnDate, `click`, this.onSelect);

                // 날짜에 해당하는 클래스 추가(이전달, 다음달, 기간, 선택된 날짜 등)
                const $cell = $row!.insertCell();
                $cell.append($btnDate);

                if (!this.data._isMonth && itemDate.getMonth() + 1 !== _month) $cell.classList.add(`D:datepicker-outside-month`);
                if (this._periodStart != null || this._periodEnd != null) {
                    $btnDate.disabled = (this._periodIndex === 1 && this._periodStart != null && this._periodStart > _dateValue) || (this._periodIndex === 0 && this._periodEnd != null && this._periodEnd < _dateValue);

                    if (this._periodStart === _dateValue || this._periodEnd === _dateValue) $cell.classList.add(`S=datepicker-selected`);
                    else if (this._periodStart != null && this._periodStart < _dateValue && this._periodEnd != null && this._periodEnd > _dateValue) $cell.classList.add(`S=datepicker-period`);
                }
                else if (_dateValue === this._pickDate) $cell.classList.add(`S=datepicker-selected`);

                // 특정일(_disableBeforeDate, _disableAfterDate) 전후 날짜는 disabled
                if (this.data._disableBeforeDate != null || this.data._disableAfterDate != null) {
                    const _before = (this.data._disableBeforeDate != null) ? this.getChecked(this.data._disableBeforeDate) : null;
                    const _after = (this.data._disableAfterDate != null) ? this.getChecked(this.data._disableAfterDate) : null;

                    $btnDate.disabled = (_before != null && _before > _dateValue) || (_after != null && _after < _dateValue);
                }
            }

            // 전월의 마지막일이 31일이고 다음 달에 31일이 없으면 그 다음 달로 넘어가버리는 이슈로 다음 달로 세팅하면서 일자는 1일로 세팅합니다.
			// date의 날짜를 1일로 바꾸더라도 현재 선택된 일자는 _pickDate에서 가져오기 때문에 동작에 영향은 없습니다.
            date.setMonth(_month, 1);
        }

        return $picker;

    }

    /**
     * * 날짜 선택
     */
    private onSelect(__e: MouseEvent): void {

        const $item = __e.currentTarget as HTMLElement;
        const $picker = $item.closest(`.${this._prefix}datepicker`)!;
        const _classSelected = `S=datepicker-selected`;

        /** 달력의 버튼 요소가 가지고 있는 YYYY/MM/DD 형식의 data 값 */
        this._pickDate = $item.dataset.datepickerDate!;

        if (this.data._isInline && $item.classList.contains(`btn_today`)) this.create();
        else if (this.$element.tagName === `INPUT`) Forms.value(this.$element, this.getFormatted(this._pickDate));

        Doms.class.remove(Doms.find(`.${_classSelected}`, $picker), _classSelected);
        Doms.class.add(Doms.closest(Doms.find(`[data-datepicker-date="${this._pickDate}"]`), `td`), _classSelected);

        this.close();

        Utils.apply(this.data.onSelect, [{ ui: this, date: this.getDate(this._pickDate), _value: this.getFormatted(this._pickDate) }, ...this.data.onSelectParams]);

    }

    /**
     * * 달력 연/월 이동
     */
    private onDraw(__e: Event): void {

        const $target = __e.currentTarget as HTMLElement;
        const $picker = $target.closest(`.${this._prefix}datepicker`)!;
        const $pickerHeads = Doms.find(`.${this._prefix}datepicker-item-head`, $picker);
        let _dateValue: string;
        let changeDate: Date;

        switch (__e.type) {
            // select
            case `change`:
                const $head = $target.closest(`.${this._prefix}datepicker-item-head`);
                _dateValue = $head?.getElementsByTagName(`select`)[0]?.value ?? ``;

                if (!this.data._isMonth) _dateValue += `-${$head?.getElementsByTagName(`select`)[1].value.padStart(2, `0`)}`;
                changeDate = this.getDate(_dateValue);
                changeDate.setMonth(changeDate.getMonth() - $pickerHeads.findIndex(__$el => __$el === $picker));
                break;
            // button
            case `click`:
                const $selects = Doms.find(`select`, $pickerHeads);
                _dateValue = $selects[0].value;

                if (!this.data._isMonth) _dateValue += `-${$selects[1].value.padStart(2, `0`)}`;
                changeDate = this.getDate(_dateValue);

                if ($target.classList.contains(`btn_next-month`)) changeDate.setMonth(changeDate.getMonth() + 1);
                else if ($target.classList.contains(`btn_prev-month`)) changeDate.setMonth(changeDate.getMonth() - 1);
                else if ($target.classList.contains(`btn_next-year`)) changeDate.setMonth(changeDate.getFullYear() + 1);
                else if ($target.classList.contains(`btn_prev-year`)) changeDate.setMonth(changeDate.getFullYear() - 1);
                break;
        }

        this.create(changeDate!);

    }

    /**
     * * 열기
     */
    private open(): void {

        this.close();
        if (this._isOpen) return;

        // 기간
        const $period = this.$element.closest(`.${this._prefix}form_mix-period`);
        if ($period != null) {
            const $periodItems = Doms.find(`[data-${this._name}]`, $period) as HTMLInputElement[];
            this._periodIndex = $periodItems.findIndex(__$el => __$el === this.$element);
            this._periodStart = ($periodItems[0].value) ? Pages.ui.get<Datepicker>($periodItems[0], this._name)!._pickDate : ``;
            if ($periodItems.length > 1) this._periodEnd = ($periodItems[1].value) ? Pages.ui.get<Datepicker>($periodItems[1], this._name)!._pickDate : ``;
        }

        const $picker = this.create();
        const offset = Doms.offset(this.$element)!;
        const _scrollTop = document.documentElement.scrollTop;
        let _x = offset.left + document.documentElement.scrollLeft;
        let _y = offset.top + this.$element.offsetHeight + _scrollTop + 2;

        // 팝업에서 datepicker를 오픈할 때 화면을 넘어가면 offset 재조정
        if (Is.layout(`popup`)) {
            if (document.documentElement.scrollHeight < _y + $picker.offsetHeight) {
                if (_x === offset.left) _x = offset.left + this.$element.offsetWidth;
                _y = document.documentElement.scrollHeight - $picker.offsetHeight;
            }

            if (document.body.offsetWidth < _x + $picker.offsetWidth) {
                if (_scrollTop + offset.top < _y) _y = offset.top + _scrollTop - 3;
                _x = offset.left - $picker.offsetWidth;
            }
        }

        Doms.style($picker, { top: `${_y}px`, left: `${_y}px` });
        this._isOpen = true;

        const pickerCloseMouseHandler = (__e: MouseEvent): void => {

            if ($picker.contains(__e.target as Node)) return;

            this.close();

        }
        Events.bind.on(window, `mousedown`, pickerCloseMouseHandler);

        const keyFocusHandler = (__e: Event): void => {

            switch (__e.type) {
                case `keydown`:
                    if ((__e as KeyboardEvent).key === `Tab`) this.close();
                    break;
                case `focusout`:
                    const _inputValue = (this.$element as HTMLInputElement).value;
                    if (Is.empty(_inputValue)) return;

                    const _value = this.getChecked(_inputValue);
                    if (_value === _inputValue) this._pickDate = _value;
                    else console.log(`datepicker의 날짜 형식이 올바르지 않습니다.`);
                    break;
            }

        }
        Events.bind.on(this.$element, `keydown focusout`, keyFocusHandler);

        // if (frameElement != null) Pages.frameResize();// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?

    }

    /**
     * * 닫기
     * + mm/mui_datepicker 요소는 하나만 생성 가능
     * + mm/mui_datepicker가 생성된 상태에서 다른 datepicker를 클릭하면 전체 datepicker의 _isOpen이 false로 변경
     */
    private close(): void {

        const $uis = Doms.find(`[data-${this._name}]`);
        for (const $ui of $uis) {
            const ui: Datepicker | undefined = Pages.ui.get($ui, this._name);
            if (ui == null || ui.data._isInline) return;

            this._isOpen = false;
        }

        const $pickers = Doms.find(`.${this._prefix}datepicker:not(.${this._classInline})`);
        for (const $el of $pickers) {
            Events.bind.off(Doms.find(`.btn_today, .btn_month`, $el), `click`);//, this.onSelect);
            Events.bind.off(Doms.find(`.btn_prev-month, .btn_next-month, .btn_prev-year, .btn_next-year`, $el), `click`);//, this.onDraw);
            Events.bind.off(Doms.find(`.${this._prefix}datepicker\\.\\.\\.head-label select`, $el), `change`);//, this.onDraw);
            $el.remove();
        }

        Events.bind.off(window, `mousedown`, `pickerCloseMouseHandler`);
        Events.bind.off(this.$element, `keydown focusout`, `keyFocusHandler`);

        // if (frameElement != null) Pages.frameResize();// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?

    }

    /**
     * * 데이트픽커 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: DatepickerData = {}, __onCatch?: (__ui: Datepicker) => void): Datepicker[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 데이트픽커 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: Datepicker[] = Datepicker.update(__elements);
		for (const ui of UIs) ui.destroy();

	}

    /**
     * * 데이트픽커 변경
     * @public @static
     * @param __elements
     * @param __date - 변경할 날짜
     */
    public static change(__elements: ElementSelector, __date: string): void {

        const UIs: Datepicker[] = Datepicker.update(__elements);
        for (const ui of UIs) {
            const _value = ui.getChecked(__date);
            if (_value != null) {
                ui._pickDate = (ui.data._isMonth) ? _value.slice(0, 7) : _value;
                Forms.value(ui.$element, ui.getFormatted(_value));
            }
        }

    }

    /**
     * * 데이트픽커 날짜 비활성
     * @public @static
     * @param __elements
     * @param __option.beforeDate - 이전 날짜 비활성
     * @param __option.afterDate - 이후 날짜 비활성
     */
    public static dateDisabled(__elements: ElementSelector, __option: DatepickerDisabledOption): void {

        const UIs: Datepicker[] = Datepicker.update(__elements);
        for (const ui of UIs) {
            ui.data._disableBeforeDate = (__option.beforeDate != null) ? ui.getChecked(__option.beforeDate) : null;
            ui.data._disableAfterDate = (__option.afterDate != null) ? ui.getChecked(__option.afterDate) : null;
        }

    }

}

export { Datepicker };
