import Events from '@src/script/events';
import { Switch, Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="tp_sc=w6Xh13_s4_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Tab.update(getDataSelector(`tab`), { onChange: () => Carousel.resize(getDataSelector(`carousel`), 0) });
    Carousel.update(getDataSelector(`carousel`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});