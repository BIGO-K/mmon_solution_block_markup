import Events from '@src/script/events';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Slider } from '@src/script/ui/sliders';

const _selector = `[data-mui="p_s=w6Xh6_s3_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Slider.update(getDataSelector(`slider`));
    Switch.update(getDataSelector(`switch`));
    Lazyload.update(getDataSelector(`lazyload`));

});