import Events from '@src/script/events';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="bp_nc=w12Xh8_s8_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Carousel.update(getDataSelector(`carousel`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});