import Events from '@src/script/events';
import { Switch, Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="tb_nn=w12Xh18_s6_pagination_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Tab.update(getDataSelector(`tab`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});