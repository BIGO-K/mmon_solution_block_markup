import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';
import { gsap } from 'gsap';

const _selector = `[data-mui="b_c=w6Xh11_s1_side_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Carousel.update(getDataSelector(`carousel`), { onReady: carouselStartHandler, onStart: carouselStartHandler });
    Lazyload.update(getDataSelector(`lazyload`));

});

const _classActive = `S=active`;

/** 캐러셀 아이템 크기 및 높이 변경 */
const carouselStartHandler = (__package: { ui: Carousel }): void => {

    const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
    const $activeItem = $items[__package.ui.index];

    Doms.class.remove(Doms.find(`.${_classActive}`, __package.ui.$element), _classActive);
    $activeItem.classList.add(_classActive);

    gsap.to($items.map(__$el => __$el.firstElementChild), { width: `100%`, y: `3.25732%`, x: 0, duration: 0.4, ease: `cubic.out` });
    gsap.to($activeItem.firstElementChild, { width: `109.66587%`, y: 0, x: `-4.5%`, duration: 0.2, ease: `cubic.out`, overwrite: true,
        onComplete: () => {

            gsap.to(Doms.find(`.mui_carousel-list`, __package.ui.$element)[0], { height: $activeItem.offsetHeight, duration: __package.ui.data._time, ease: `cubic.out` });

        }
    });

}