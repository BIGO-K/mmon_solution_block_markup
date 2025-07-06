import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Is from '@src/script/is';
import Pages from '@src/script/pages';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="cp_nn=w6Xh23_s6_more"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

    $category = Doms.find(`${_selector} .mui_category`)[0];

    const switchUI = Pages.ui.get(Doms.find(`.btn_toggle`, $category)[0], `switch`) as Switch;
    switchUI.data.onChange = (__package: { ui: Switch }): void => categoryToggle(__package.ui.isOn);
    categoryToggle(switchUI.isOn);

    // 카테고리 sticky
    const _classSticky = `S=category-sticky`;
    const $header = Doms.find(`.mm_header`)[0];

    if ($category != null && $header != null) {
        const $calcElement = (Is.layout(`main`)) ? Doms.find(`.mm_gnb-inner`)[0] : $header;

        const scrollHandler = () => $category.classList[(Doms.offset($category).top + $category.offsetHeight < Doms.offset($calcElement).top + $calcElement.offsetHeight) ? `add` : `remove`](_classSticky);
        Events.bind.on(Doms.scroll.element, `scroll`, scrollHandler);
    }

});

let $category: HTMLElement;

// 카테고리 toggle
const categoryToggle = (__is: boolean) => {

    const $menus = Doms.find(`ul > li`, $category);
    const $btnToggle = Doms.find(`.btn_toggle`, $category)[0];

    // 메뉴 10개 이하시 토글버튼 제거
    if ($menus.length < 11) $btnToggle.remove();

    Doms.style($category, { height: `` });

    // 펼침 시 토글버튼과 메뉴 겹침이슈로 카테고리영역 높이 조정
    const _margin = ($category.classList.contains(`S=switch-on`) && $menus.length > 9 && $menus.length % 5 === 0) ? $menus[0].offsetHeight : 0;
    Doms.style($category, { height: `${$category.offsetHeight + _margin}px` });

}