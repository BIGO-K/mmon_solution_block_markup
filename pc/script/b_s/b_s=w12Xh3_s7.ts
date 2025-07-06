import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Slider } from '@src/script/ui/sliders';

const _selector = `[data-mui="b_s=w12Xh3_s7"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Slider.update(getDataSelector(`slider`));
    Lazyload.update(getDataSelector(`lazyload`));

});