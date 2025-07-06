import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="b_n=w12Xh2_s1_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Lazyload.update(getDataSelector(`lazyload`));

})