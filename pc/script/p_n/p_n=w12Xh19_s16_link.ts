import Events from '@src/script/events';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="p_n=w12Xh19_s16_link"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});