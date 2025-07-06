import Events from '@src/script/events';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Slider } from '@src/script/ui/sliders';

const _selector = `[data-mui="cp_sn=w12Xh18_s8_link"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Slider.update(getDataSelector(`slider`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});