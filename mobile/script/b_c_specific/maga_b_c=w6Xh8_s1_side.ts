import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';
import Utils from '@src/script/utils';

const _selector = `[data-mui="maga_b_c=w6Xh8_s1_side"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Carousel.update(getDataSelector(`carousel`), {
        onUpdate: (__package: { ui: Carousel }): void => {

            var $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
            $items[__package.ui.oldIndex].classList.add(`S=prev`);
            $items[__package.ui.index].classList.add(`S=next`);

        },
        // 배너 이동이 끝나고 이전/다음 아이템 클래스 삭제
        onComplete: (__package: { ui: Carousel }): void => {

            const classes = [`S=prev`, `S=next`];
            Doms.class.remove(Doms.find(Utils.selector(`.${classes.join(`, .`)}`)), classes);

        }
    });

    Lazyload.update(getDataSelector(`lazyload`));

});