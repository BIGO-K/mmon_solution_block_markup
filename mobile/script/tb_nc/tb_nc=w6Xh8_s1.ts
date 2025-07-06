import Doms from '@src/script/doms';
import Events from '@src/script/events';
import { Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="tb_nc=w6Xh8_s1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Tab.update(getDataSelector(`tab`));
    Carousel.update(getDataSelector(`carousel`), { onReady: carouselProgress, onStart: carouselProgress });
    Lazyload.update(getDataSelector(`lazyload`));

});

// 캐러셀 진행바
const carouselProgress = (__package: { ui: Carousel, _isBack: boolean }): void => {

    const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
    const $originItems = $items.filter(__$el => !__$el.classList.contains(`S=clone`));
    const $progressBar = Doms.find(`.mui_carousel-progress-bar`, __package.ui.$element)[0];
    const _barWidth = 100 / $originItems.length;

    if ($originItems.length < 2) {
        $progressBar.remove();
        return;
    }

    Doms.style($progressBar, { width: `${_barWidth * (__package.ui.realIndex + 1)}%` });

}