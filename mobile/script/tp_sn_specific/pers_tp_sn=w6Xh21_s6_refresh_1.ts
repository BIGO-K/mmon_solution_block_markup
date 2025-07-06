import Events from '@src/script/events';
import { Switch, Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Slider } from '@src/script/ui/sliders';

const _selector = `[data-mui="pers_tp_sn=w6Xh21_s6_refresh_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Tab.update(getDataSelector(`tab`));
	Slider.update(getDataSelector(`slider`));
	Switch.update(getDataSelector(`switch`));
	Lazyload.update(getDataSelector(`lazyload`));

});