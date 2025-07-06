/**
 * @class UI 상속 기본형
 * @constructor
 * @static
 */

import Doms from '../doms';
import Pages from '../pages';
import Utils from '../utils';

class BaseUI {

    /** UI 생성자에 연결된 요소 */
    public readonly $element: HTMLElement;
    /** constructor name toLowerCase */
    public readonly _name: string;
    /** 블록에서 실행 여부 */
    public readonly _isBlock: boolean;
    /** UI 클래스 프리픽스 */
    public readonly _prefix: `mui_` | `mm_`;
    /** 아이콘 클래스 프리픽스 */
    public readonly _prefixIco: `uico_` | `ico_`;

    constructor(__$element: HTMLElement, __name: string) {

        // const _constructor = this.constructor.name;// * minify 할 때 축약이되어 강제로 name 적용
        const _dataName = `data-${__name.toLowerCase().replace(`form`, ``)}`;// dataName에서 form 텍스트 삭제(data-formtext > data-text)

        if (!__$element.hasAttribute(_dataName)) throw { $element: __$element, message: `요소에 ${_dataName} 속성이 없습니다. update 함수를 이용하거나 속성이 있는 요소에 new를 연결해주세요.` };
        if (__name === `BaseUI`) throw { message: `상속형으로 BaseUI 단독으로 사용할 수 없습니다.` };
        // * tab, dropdown 등 자동 ui.update가 빠져 화면에 노출되지 않은 ui 요소도 실행되도록 변경
        // if (__name !== `Lazyload` && !Is.display(__$element)) throw { $element: __$element, message: `화면에 없습니다.` };// Lazyload를 제외하고 화면에 노출되지 않으면 catch로 전달

        const beforeUI = Pages.ui.get(__$element, __name.toLowerCase());
        if (beforeUI != null) throw { ui: beforeUI, message: `중복 선언입니다. ui 객체를 사용하세요.` };// 중복 방지로 이전에 저장된 값이 있으면 catch로 전달

        this.$element = __$element;
        this._name = __name.toLowerCase();
        this._isBlock = __$element.closest(`[data-mui]`) != null;
        this._prefix = (this._isBlock) ? `mui_` : `mm_`;
        this._prefixIco = (this._isBlock) ? `uico_` : `ico_`;

        Pages.ui.set(this);

    }

    /**
     * * UI 연결(public update)
     * @static @protected
     * @param __elements - 업데이트 할 요소
     * @param __onCatch
     * @returns 연결된 UI 생성자 전체
     */
    protected static ini<T>(__elements: ElementSelector, __data: any = {}, __onCatch?: (__ui: T) => void): T[] {

        const $elements = Doms.find(__elements);
        const UIs: T[] = [];

        for (const $el of $elements) {
            try {
                UIs.push(new this($el, __data) as T);// 신규 생성
            }
            catch (__e) {
                const error = __e as UIError<T>;
                const ui: T | undefined = error.ui;
                // console.log(error);

                if (ui != null) UIs.push(ui);// 이전 생성
                Utils.apply(__onCatch, [ui ?? error.$element]);// ui 중복방지, $element 숨겨진 요소
            }
        }

        return UIs;

    }

}

export default BaseUI;