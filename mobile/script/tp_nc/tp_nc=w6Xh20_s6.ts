import Events from '@src/script/events';
import Doms from '@src/script/doms';
import { Switch } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="tp_nc=w6Xh20_s6"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

	Carousel.update(getDataSelector(`carousel`), { onReady: tabCarouselChange, onStart: tabCarouselChange });
	Lazyload.update(getDataSelector(`lazyload`));
	Switch.update(getDataSelector(`switch`));

	Events.bind.on(Doms.find(`${_selector} .btn_menu`), `click`, __e => {

		__e.preventDefault();

		const _classActive = `S=on`;
		const $lists = Doms.find(`${_selector} > div:not(.mui_carousel) ul li`);
		const $menus = Doms.find(`${_selector} .btn_menu`);
		const $this = (__e.currentTarget as HTMLElement);
		const $el = $this.closest(`li`);

		if ($el == null) return;

		const _index = Doms.find(`${_selector} .mui_carousel-item`).indexOf(Doms.find('.mui_carousel-item', Doms.find(`${_selector} .mui_carousel-group`)[$lists.indexOf($el)])[0])

		Doms.class.remove($menus, _classActive);
		Doms.attribute($menus, { title: `` });
		$this.classList.add(_classActive);
		$this.setAttribute(`title`, `선택됨`);

		Carousel.change(getDataSelector(`carousel`), _index);

	});

});

const _classActive = `S=on`;

const tabCarouselChange = (__package: { ui: Carousel, _isBack: boolean }): void => {

	const $menus = Doms.find(`${_selector} .btn_menu`);
	const $items = Doms.find(`.mui_carousel-item`, __package.ui.$element);
	const $groups = Doms.find(`.mui_carousel-group`, __package.ui.$element);
	const _index = Doms.index($items[__package.ui.index].parentElement as HTMLInputElement, $groups);

	Doms.class.remove($menus, _classActive);
	Doms.attribute($menus, { title: `` });
	$menus[_index].classList.add(_classActive);
	$menus[_index].setAttribute(`title`, `선택됨`);

};
