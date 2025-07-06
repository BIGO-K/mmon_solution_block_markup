import Events from '@src/script/events';
import Doms from '@src/script/doms';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="show_bp_nn=w6Xh57_s5"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Lazyload.update(getDataSelector(`lazyload`));
    Switch.update(getDataSelector(`switch`), { onChange: followChange });

});

// 팔로잉 버튼 제어
const followChange = (__package: { ui: Switch }): void => {

	const $followText = Doms.find(`b`, __package.ui.$element)[0];

	if (__package.ui.isOn) $followText.innerText = '팔로잉';
	else $followText.innerText = '팔로우';

};