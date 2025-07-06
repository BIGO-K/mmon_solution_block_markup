import Events from '@src/script/events';
import { Switch, Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel, Slider } from '@src/script/ui/sliders';

const _selector = `[data-mui="tp_sc=w12Xh7_s5"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Tab.update(getDataSelector(`tab`), { onChange: () => Carousel.resize(getDataSelector(`carousel`), 0) });
    Carousel.update(getDataSelector(`carousel`));
    Slider.update(getDataSelector(`slider`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});