import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="b_c=w0Xh3_s1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Carousel.update(getDataSelector(`carousel`));
    Lazyload.update(getDataSelector(`lazyload`));

});