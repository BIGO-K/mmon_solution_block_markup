import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="b_n=w6Xh7_s9"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Lazyload.update(getDataSelector(`lazyload`));

});