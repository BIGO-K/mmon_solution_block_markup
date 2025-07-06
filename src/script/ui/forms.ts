/**
 * @class 폼 요소
 * @constructor
 * @static
 * 프로젝트 구조(mm_page)
 */

import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Is from '../is';
import Times from '../times';
import BaseUI from './baseUI';
import { Stepper } from './buttons';

class Forms {

    private static readonly selectors = [`data-text`/*, `data-check`, `data-radio`, `data-select`, `data-file`, `data-multiple`*/];
    private static readonly CLASS_ALERT = `text_alert`;
    private static readonly CLASS_VALID = `text_valid`;

    /**
     * * 폼 업데이트
     * @public @static
     * @param __elements
     */
    public static update(__elements: ElementSelector, __data?: any): void {

        let $elements = Forms.find(__elements ?? `.mm_app`);
        FormText.update($elements, __data);

        // $elements = $elements.filter(__$el => Is.display(__$el));// 숨겨진 요소 제외

        Events.bind.call($elements, `update`);

    }

    /**
     * * 폼 value 값 적용
     * + data-text, data-check, data-radio, data-select
     * + data-file, data-multiple은 value 값 강제로 변경 불가
     * @public @static
     * @param __elements
     * @param __value
     */
    public static value(__elements: ElementSelector, __value: string | boolean): void {

        const $elements = Forms.find(__elements);

        for (const $el of $elements) {
            if ($el.hasAttribute(`data-text`)) $el.value = String(__value);
            else if (($el.hasAttribute(`data-check`) || $el.hasAttribute(`data-radio`)) && typeof __value === `boolean`) ($el as HTMLInputElement).checked = __value;
            else if ($el.hasAttribute(`data-select`)) {
                $el.value = String(__value);
                if (($el as HTMLSelectElement).selectedIndex < 0) ($el as HTMLSelectElement).selectedIndex = 0;
            }
        }

        Events.bind.call($elements, `change`);

    }

    /**
     * * 폼 요소 오류
     * + 텍스트, 셀렉트, 파일에만 적용
     * @public @static
     * @param __elements
     * @param __message - 오류 메시지
     */
    public static alert(__elements: ElementSelector, __message: string): void {

        const $elements = Forms.find(__elements);
        const _message = __message.replace(/\n/gi, `<br>`);

        for (const $el of $elements) {
            Forms.appendFormText($el, `<p class="${Forms.CLASS_ALERT}">${_message}</p>`);

            const $ui = $el.closest(`[class*="mm_form-]`);
            if ($ui == null) continue;

            $ui.classList.add(`S=text-alert`);
            Doms.scroll.to($ui, { scroller: Doms.scroll.find($el, true), _margin: 50 + (Doms.find(`.mm_header`)[0]?.offsetHeight ?? 0) });
        }

    }

    /**
     * * 폼 요소 유효
     * + 텍스트, 셀렉트, 파일에만 적용
     * @public @static
     * @param __elements
     * @param __message - 유효 메시지
     * @param __condition - 상태 클래스 문자열(`S=valid-${__condition}`)
     */
    public static valid(__elements: ElementSelector, __message: string, __condition?: string): void {

        const $elements = Forms.find(__elements);
        const _message = __message.replace(/\n/gi, `<br>`);

        for (const $el of $elements) {
            const $message = Forms.appendFormText($el, `<p class="${Forms.CLASS_ALERT}"><i class="ico_form-valid"></i>${_message}</p>`);

            const $ui = $el.closest(`[class*="mm_form-]`);
            if ($ui == null) continue;

            // 직접 또는 시작 문자열에 따라 자동 적용
            const _condition = (__condition != null) ? __condition.toLowerCase() : (__message.startsWith(`보통`)) ? `normal` : (__message.startsWith(`위험`)) ? `danger` : (__message.startsWith(`사용불가`)) ? `invalid` : `valid`;
            $message.classList.add(`S=valid-${_condition}`);
            $ui.classList.add(`S=text-valid-${_condition}`);
        }

    }

    /**
     * * 폼 요소 오류/유효 해제
     * @public @static
     * @param __elements - 값이 없으면 페이지 전체 .text_alert, .text_valid 해제
     */
    public static lift(__elements?: ElementSelector): void {

        const $elements = (__elements != null) ? Forms.find(__elements) : Doms.find(`.${Forms.CLASS_ALERT}, .${Forms.CLASS_VALID}`);

        for (const $el of $elements) Forms.liftFormText($el);

    }

    /**
     * * 폼 인터페이스 setter 함수 변경
     * + setter 기본형에 selectedIndex 초기 값과 property 이벤트 추가
     * @public @static
     * @param __interface - 인터페이스 HTMLInputElement, HTMLSelectorElement, HTMLOptionElement
     * @param __properties - 변경할 속성
     */
    public static changeSetter(__interface: typeof HTMLInputElement | typeof HTMLSelectElement | typeof HTMLOptionElement, __properties: string[]): void {

        for (const _prop of __properties) {
            const descriptor = Object.getOwnPropertyDescriptor(__interface.prototype, _prop);
            if (descriptor == null) continue;

            if (_prop === `checked`) Object.defineProperty(__interface.prototype, `checkedOnly`, descriptor);// 전체, 부분에서 checked 변경 시 property 이벤트 이슈로 이벤트가 없는 속성 추가

            const originalSet = descriptor.set;
            descriptor.set = function(__value: any) {// 기본 setter의 this 요소를 사용하기 위해 function으로 적용

                if (__value === this.value) return;

                originalSet?.apply(this, [__value]);

                if (this instanceof HTMLSelectElement && this.selectedIndex < 0) this.selectedIndex = 0;
                Events.bind.call((this instanceof HTMLOptionElement) ? this.parentElement! : this as HTMLElement, `property`);

            }

            Object.defineProperty(__interface.prototype, _prop, descriptor);
        }

    }

    /**
     * * 폼 요소 검색
     * ! ui 처럼 부모에서 범용이 아닌 요소 직접 선택하도록 변경하면 find 사용 안해도 됨
     * @param __elements
     * @returns
     */
    private static find(__elements: ElementSelector): (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] {

        const _checker = `[${Forms.selectors.join(`], [`)}]`;
        const $elements = Doms.find(__elements);
        const $filtered = $elements.filter(__$el => __$el.matches(_checker));

        return (($filtered.length > 0) ? $filtered : Doms.find(_checker, $elements)) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];

    }

    /**
     * * 폼 상태 텍스트 추가
     * @param __$element
     * @param __messageHtml
     */
    private static appendFormText(__$element: HTMLElement, __messageHtml: string): HTMLElement {

        Forms.liftFormText(__$element);

        const $text = Doms.create(__messageHtml)[0] as HTMLElement;
        __$element.closest(`label`)?.after($text);

        const $ui = __$element.closest(`[class*="mm_form-]`);
        if ($ui != null) {
            const $buttons = Doms.find(`> button`, $ui);
            for (const $btn of $buttons) {
                const _btnY = parseFloat(getComputedStyle($btn).marginBlockStart);
                Doms.style($btn, { marginBlockStart: `${$text.offsetHeight / 2 + _btnY}px`});
            }
        }

        return $text;

    }

    /**
     * * 폼 상태 텍스트 해제
     * @param __$element
     */
    private static liftFormText(__$element: HTMLElement): void {

        const _selector = `.${Forms.CLASS_ALERT}, .${Forms.CLASS_VALID}`;
        const $label = (__$element.matches(_selector)) ? Doms.siblings(__$element, `label`)[0] : __$element.closest(`label`);
        const $ui = $label?.closest(`[class*="mm_form-]`);
        if ($ui == null) return;

        let _i = 0;
        while (_i < $ui.classList.length) {
            const _class = $ui.classList[_i];
            if (_class === `S=text-alert` || _class === `S=text-valid`) $ui.classList.remove(_class);
            else _i++;
        }

        const $buttons = Doms.find(`> button`, $ui);
        for (const $btn of $buttons) Doms.style($btn, { marginBlockStart: `` });

        Doms.remove(Doms.find(_selector, $ui));

    }

}

/** @class 폼 텍스트 */
class FormText extends BaseUI {

    public data: Required<FormTextData> = {
        _default: ``,
        _classOn: `S=text-on`,
        _classOff: `S=text-off`,
        _format: ``,
        _isResize: false,
        _resizeMin: 0,
        _resizeMax: 0,
        _byte: 0,
        _isAutoComplete: false,
    }

    private $text: HTMLInputElement | HTMLTextAreaElement;
    private $ui: HTMLElement | null;
    private $byte?: HTMLElement | null;
    private $autoComplete?: HTMLElement | null;

    constructor(__$element: HTMLElement, __data?: FormTextData) {

        super(__$element, `text`);

        this.data = Datas.clone(this.data, Doms.data.get(__$element, this._name), __data);

        this.$text = __$element as HTMLInputElement | HTMLTextAreaElement;
        this.$ui = __$element.closest(`.${this._prefix}form-text, .${this._prefix}form-textarea`);

        const textEventHandler = (__e: Event): void => {

            if (this.$ui == null) return;

            const _classToggle = (this.$text.readOnly || this.$text.disabled) ? this.data._classOff : this.data._classOn;
            let _value = this.$text.value;

            switch (__e.type) {
                case `paste`:
                case `keydown`:
                    this.$ui.classList.add(_classToggle);
                    break;
                case `update`:
                    // 모바일 numberpad 노출(w3c validation 검사를 위해 스크립트로 처리)
                    if (this.$text instanceof HTMLInputElement && this.$text.type === `number` && Is.empty(this.$text.inputMode)) {
                        this.$text.pattern = `[0-9]*`;
                        this.$text.inputMode = `numaric`;
                    }
                    if (!Is.mobile() && this.$text instanceof HTMLInputElement && [`number`, `date`, `month`, `time`, `week`].includes(this.$text.type)) this.$text.type = `text`;// pc에서 기본 포멧 사용을 text로 변경
                    if (this.data._byte > 0) this.byte();
                    if (this.data._isAutoComplete) this.autocomplete();

                    // textarea 고정 높이
                    if (this.$text instanceof HTMLTextAreaElement && this.data._resizeMin > 0) {
                        const textStyle = getComputedStyle(this.$text);
                        const _padding = parseFloat(textStyle.paddingBlockStart) + parseFloat(textStyle.paddingBlockEnd);
                        const _lineHeight = parseFloat(textStyle.lineHeight);

                        Doms.style(this.$text, { height: `${_padding + _lineHeight + 2}px`});// 초기화

                        const _line = (this.$text.scrollHeight === this.$text.offsetHeight) ? this.data._resizeMin : Math.ceil((this.$text.scrollHeight - _padding) / _lineHeight);
                        Doms.style(this.$text, { height: `${_padding + _lineHeight * _line}px`});
                    }
                    // fall through
                case `focusout`:
                    if (_value.trim().length === 0) this.$text.value = this.data._default;// 기본 값

                    Events.bind.call(this.$text, `change`, { data: { _isUpdate: true }});
                    break;
                case `change`:
                    _value = this.$text.value = _value.trim();
                    break;// Forms.changeSetter 적용으로 value 값이 이전 값과 다르면 property 실행되어 break 적용
                case `input`:
                case `property`:
                    if (_value.length > 0) {
                        const _maxlength = Math.max(this.$text.maxLength, 0);
                        if ((Is.mobile(`android`) || Is.mobile(`ios`)) && this.$text.type === `number` && _value.length > _maxlength) this.$text.value = _value.substring(0, _maxlength);
						this.$ui.classList.add(_classToggle);
                    }
                    else this.$ui.classList.remove(_classToggle);

                    // _default 와 value 가 다르면 변경 클래스 추가
					if (this.data._default.trim().length > 0) {
                        const _classChanged = `S=text-changed`;
						if (this.data._default !== _value) this.$ui.classList.add(_classChanged);
						else this.$ui.classList.remove(_classChanged);
					}

                    // textarea 자동 높이
					if (this.$text instanceof HTMLTextAreaElement && this.data._isResize) {
						const textStyle = getComputedStyle(this.$text);
                        const _padding = parseFloat(textStyle.paddingBlockStart) + parseFloat(textStyle.paddingBlockEnd);
                        const _lineHeight = parseFloat(textStyle.lineHeight);
						const $scroller = Doms.scroll.find(this.$text, true);
						const _scrollTop = $scroller.scrollTop;

						Doms.style(this.$text, { height: `${_padding + _lineHeight + 2}px` });// 초기화

						if (this.data._resizeMin === 0) this.data._resizeMin = 2;// 초기 값
						if (this.data._resizeMax === 0) this.data._resizeMax = 99999;// 초기 값

                        let _line = (this.$text.scrollHeight === this.$text.offsetHeight) ? this.data._resizeMin : Math.ceil((this.$text.scrollHeight - _padding) / _lineHeight);
						_line = (_line < this.data._resizeMin) ? this.data._resizeMin : (_line > this.data._resizeMax) ? this.data._resizeMax : _line;
                        Doms.style(this.$text, { height: `${_padding + _lineHeight * _line}px`});

						$scroller.scrollTop = _scrollTop;// focus out 될 때 스크롤이 올라가는 이슈 수정

					}

                    // 날짜확인 (모바일)
					if ([`date`, `month`, `week`].includes(this.$text.type)) {
						// todo: format 적용
						// if (!this.data._format) this.data._format = `YYYY-MM-DD`;
						// var _txt = (_value.length > 0) ? Forms.dateFormat(_value, data._format) : `\u00a0`;

						Doms.siblings(this.$text, `.text_date`)[0].textContent = _value;
					}

					// 시간확인 (모바일)
					if (this.$text.type === `time`) {
						// todo: format 적용
						// if (!this.data._format) this.data._format = `HH:mm`;// a hh:mm, A h:mm

						// var _txt = (_value.length > 0) ? Forms.dateFormat(`2000-01-01 ` + _value, this.data._format) : `\u00a0`;
						// _txt = _txt.replace(/am/gi, `오전`).replace(/pm/gi, `오후`);// 한글
						// this.$text.siblings(`.text_date`).text(_txt);

						Doms.siblings(this.$text, `.text_date`)[0].textContent = _value;
					}

					// 수량변경
					if (this.$text.classList.contains(`text_stepper`)) {
                        const $stepper = this.$text.closest(`[data-stepper]`);
                        if ($stepper != null) Stepper.change($stepper, __e);
                    }
                    break;
            }

        }
        Events.bind.on(this.$text, `paste keydown update focusout change input property`, textEventHandler);

        const clearClickHandler = (__e: MouseEvent): void => {

            __e.preventDefault();

            if (!(this.$text instanceof HTMLInputElement) || this.$text.readOnly || this.$text.disabled) return;

            this.$text.value = this.data._default;

            Events.bind.call(this.$text, `clear`);
            Doms.focus.in(this.$text);

        }
        Events.bind.on(Doms.find(`.btn_text-clear`, this.$ui!)[0], `click`, clearClickHandler);

        const passwordClickHandler = (__e: MouseEvent): void => {

            __e.preventDefault();

            if (!(this.$text instanceof HTMLInputElement) || this.$text.readOnly || this.$text.disabled) return;

            if (this.$text.type === `password`) this.$text.type = `text`;
            else this.$text.type = `password`;

            const _classIcoShow = `${this._prefixIco}show`;
            const _classIcoHide = `${this._prefixIco}hide`;
            const $mco = Doms.find(`.${_classIcoShow}, .${_classIcoHide}`, __e.currentTarget as HTMLElement)[0];
            if ($mco != null) {
                Doms.class.toggle($mco, [_classIcoShow, _classIcoHide]);
                $mco.nextElementSibling!.textContent = ($mco.classList.contains(_classIcoShow)) ? `비밀번호 숨기기` : `비밀번호 보기`;
            }

        }
        Events.bind.on(Doms.find(`.btn_text-pw`, this.$ui!)[0], `click`, passwordClickHandler);

    }

    /**
	 * * 해제
	 */
	public destroy(): void {

		Events.bind.off(this.$text, `paste keydown update focusout change input property`);//, `textEventHandler`);
        Events.bind.off(Doms.find(`.btn_text-clear`, this.$ui!)[0], `click`);//, `clearClickHandler`);
        Events.bind.off(Doms.find(`.btn_text-pw`, this.$ui!)[0], `click`);//, `passwordClickHandler`);
        Events.bind.off(this.$element, `keydown keyup change`);//, `textKeyChangeHandler`);
        Events.bind.off(this.$text, `change keyup`);//, `textKeyChangeHandler`);
        Events.bind.off(this.$ui!, `keydown mouseover mouseleave focusout`);//, `uiKeyMouseFocusHandler`);

	}

    /**
     * * 글자수 제한
     */
    private byte(): void {

        if (this.$ui == null || this.$byte != null) return;

        this.$byte = Doms.find(`.text_byte`, this.$element)[0];
        if (this.$byte == null) {
            this.$byte = Doms.create(`<b class="text_byte"><strong>0</strong>/${this.data._byte}</b>`)[0] as HTMLElement;
            this.$ui.append(this.$byte);
        }

        this.$ui.classList.add(`S=byte`);

        const textKeyChangeHandler = (__e: Event): void => {

            let _value = this.$text.value;
            if (_value.length > this.data._byte) _value = this.$text.value = _value.substring(0, this.data._byte);
            this.$byte!.firstElementChild!.textContent = _value.length.toString();

            if (this.$text instanceof HTMLInputElement) {
                this.$text.style.width = ``;
                this.$text.style.width = `${this.$text.scrollWidth}px`;
            }

        }
        Events.bind.on(this.$element, `keydown keyup change`, textKeyChangeHandler);

    }

    /**
     * * 자동완성
     */
    private autocomplete(): void {

        if (this.$ui == null || this.$autoComplete != null) return;

        const _classAuto = `S=auto`;
        const _classOver = `S=over`;
        const _delayClose = `DELAY_AUTOCOMPLETE_CLOSE_${new Date().valueOf()}`;

        this.$autoComplete = Doms.find(`.${this._prefix}form-text-autocomplete`)[0];
        if (this.$autoComplete == null) {
            this.$autoComplete = Doms.create(
                `<div class="${this._prefixIco}form-text-autocomplete">
                	<div class="mm_scroller">
                		<ul>
                			<li><button type="button"><b>자동<strong class="mm_text-primary">완성</strong>샘플, 내용(li 요소) 교체 필요</b></button></li>
                		</ul>
                	</div>
                </div>`
            )[0] as HTMLElement;
            this.$ui.append(this.$autoComplete);
        }

        const focusKeydown = (__e: KeyboardEvent, __$element: HTMLElement): void => {

            __e.preventDefault();

            Times.delay.on(() => {

                Doms.class.remove(Doms.find(`.${_classOver}`, this.$autoComplete!), _classOver);
                __$element.classList.add(_classOver);

                this.$text.value = Doms.find(`b:not(.text_date)`, __$element).at(-1)?.innerText ?? ``;

            });

        }

        const textKeyChangeHandler = (__e: Event & Record<`detail`, any>): void => {

            if (__e.detail._isUpdate || (__e instanceof KeyboardEvent && __e.key.startsWith(`arrow`)/* 방향키 */)) return;

            if (this.$text.value.trim().length > 0) this.$autoComplete!.classList.add(_classAuto);
            else this.$autoComplete!.classList.remove(_classAuto);

        }
        Events.bind.on(this.$text, `change keyup`, textKeyChangeHandler);

        const uiKeyMouseFocusHandler = (__e: KeyboardEvent | MouseEvent | FocusEvent): void => {

            Times.delay.off(_delayClose);
            if (!this.$autoComplete!.classList.contains(_classAuto)) return;

            switch (__e.type) {
                case `keydown`:
                    const $active = Doms.find(`.${_classOver}`, this.$autoComplete!)[0] ?? document.activeElement;
                    const $items = Doms.find(`li > button`, this.$autoComplete!);
                    const _itemIndex = Doms.index($active, $items);
                    const _isText = $active.hasAttribute(`data-text`);

                    if (__e instanceof KeyboardEvent) {
                        switch (__e.key) {
                            case `ArrowUp`:
                                if (_isText) return;

                                focusKeydown(__e, $items[($active instanceof HTMLButtonElement || _itemIndex === 0) ? $items.length - 1 : _itemIndex - 1]);
                                break;
                            case `ArrowDown`:
                                focusKeydown(__e, $items[($active instanceof HTMLButtonElement || _itemIndex === 0) ? 0 : _itemIndex + 1]);
                                break;
                        }
                    }
                    break;
                case `mouseover`:
                    Doms.class.remove(Doms.find(`.${_classOver}`, this.$autoComplete!), _classOver);
                    if (document.activeElement instanceof HTMLButtonElement) Doms.focus.in(this.$text);

                    const $autoItem = (__e.target as HTMLElement).closest(`button`);
                    if ($autoItem != null) $autoItem.classList.add(_classOver);
                    break;
                case `mouseleave`:
                case `focusout`:
                    Times.delay.on(() => {

                        this.$autoComplete!.classList.remove(_classAuto);

                    }, { _time: (__e.type === `mouseleave`) ? 1: 0, _isSec: true, _name: _delayClose, _isOverwrite: true });
                    break;
            }

        }
        Events.bind.on(this.$ui, `keydown mouseover mouseleave focusout`, uiKeyMouseFocusHandler);

    }

    /**
     * * 폼 텍스트 연결
     * @public @static
     * @param __elements
     * @param __data (default {}) - data-x에 확장할 데이터 객체로 data-x 속성에 연결이 어려운 콜백 등 적용
     * @param __onCatch
     * @returns 연결된 생성자 전체
     */
    public static update(__elements: ElementSelector, __data: FormTextData = {}, __onCatch?: (__ui: FormText) => void): FormText[] {

        return super.ini(__elements, __data, __onCatch);

    }

    /**
	 * * 폼 텍스트 해제
	 * @public @static
	 * @param __elements
	 */
	public static destroy(__elements: ElementSelector): void {

		const UIs: FormText[] = FormText.update(__elements);
		for (const ui of UIs) ui.destroy();

	}
}

export { Forms, FormText };
