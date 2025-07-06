import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="rank_p_n=w6Xh19_s5_link"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Lazyload.update(getDataSelector(`lazyload`));

});