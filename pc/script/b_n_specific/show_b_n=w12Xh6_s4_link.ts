import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="show_b_n=w12Xh6_s4_link"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Lazyload.update(getDataSelector(`lazyload`));

})