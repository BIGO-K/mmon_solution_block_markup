import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="b_n=w12Xh14_s4_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Lazyload.update(getDataSelector(`lazyload`));

})