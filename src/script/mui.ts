/**
 * * mm 선언
 * ! mui 없이 각각의 class를 직접 사용할 경우 대비 필요
 */

import Datas from './datas';
import Doms from './doms';
import Events from './events';
import Images from './images';
import Is from './is';
import Pages from './pages';
import Times from './times';
import { Dropdown, Stepper, Switch, Tab, Toast } from './ui/buttons';
import { Forms } from './ui/forms';
import Lazyload from './ui/Lazyload';
import { Datepicker } from './ui/pickers';
import { Carousel, Slider } from './ui/sliders';
import Utils from './utils';

const mm: Partial<MUI> = {};

Object.defineProperty(window, 'mm', {
	get: function () {

		return mm;

	},
});

mm.escape = Utils.escape;
mm.selector = Utils.selector;
mm.comma = Utils.comma;
mm.query = Utils.query;
mm.color = Utils.color;
mm.apply = Utils.apply;
mm.copy = Utils.copy;

mm.clone = Datas.clone;
mm.cookie = Datas.cookie;
mm.local = Datas.local;
mm.storage = Datas.storage;
mm.history = Datas.history;
mm.axios = Datas.axios;
// ~ mm.load = Datas.load// ! fetch or axios
mm.blob = Datas.loadBlob;

mm.is = {
    mobile: Is.mobile,
    ie: Is.ie,
    odd: Is.odd,
    even: Is.even,
    empty: Is.empty,
    object: Is.object,
    match: Is.match,
    iterable: Is.iterable,
    element: Is.element,
    display: Is.display,
    visible: Is.visible,
    focus: Is.focus,
    layout: Is.layout,
};

mm.time = {
    _faster: Times.FASTER,
    _fast: Times.FAST,
    _base: Times.BASE,
    _slow: Times.SLOW,
    _slower: Times.SLOWER,
};
mm.stamp = Times.stamp;
mm.delay = Times.delay;

mm.find = Doms.find;
mm.siblings = Doms.siblings;
mm.closest = Doms.closest;
mm.data = Doms.data;
mm.property = Doms.property;
mm.attribute = Doms.attribute;
mm.style = Doms.style;
mm.scroll = Doms.scroll;
mm.offset = Doms.offset;
mm.client = Doms.client;
mm.position = Doms.position;
mm.index = Doms.index;
mm.lastIndex = Doms.lastIndex;
mm.toggle = Doms.toggle;
mm.show = Doms.show;
mm.hide = Doms.hide;
mm.focus = Doms.focus;
mm.create = Doms.create;
mm.remove = Doms.remove;
mm.append = Doms.append;
mm.prepend = Doms.prepend;
mm.after = Doms.after;
mm.before = Doms.before;
mm.wrap = Doms.wrap;
mm.unwrap = Doms.unwrap;
mm.class = Doms.class;
mm.text = Doms.text;

mm.ready = Events.ready;
mm.load = Events.load;
mm.event = { type: Events.type, ...Events.bind };
mm.delegate = Events.delegate;
mm.observer = Events.observer;
mm.intersection = Events.intersection;
mm.mutation = Events.mutation;

mm.image = {
    _empty: Images.EMPTY,
    none: Images.none,
};

mm.ui = Pages.ui;
mm.frameResize = Pages.frameResize;
mm.sync = Pages.sync;
mm.loading = Pages.loading;
// ~ mm.progress = Pages.progress;
mm.socialTag = Pages.socialTag;
mm.link = Pages.link;
mm.modal = Pages.modal;
mm.popup = Pages.popup;
// ~ mm.alert

mm.form = {
    update: Forms.update,
    value: Forms.value,
    alert: Forms.alert,
    valid: Forms.valid,
    lift: Forms.lift,
    changeSetter: Forms.changeSetter,
};

mm.lazyload = {
    update: Lazyload.update,
    force: Lazyload.force,
    destroy: Lazyload.destroy,
};

mm.switch = {
    update: Switch.update,
    toggle: Switch.toggle,
    on: Switch.on,
    off: Switch.off,
}

mm.tab = {
    update: Tab.update,
    change: Tab.change,
    index: Tab.index,
}

mm.dropdown = {
    update: Dropdown.update,
    toggle: Dropdown.toggle,
    on: Dropdown.on,
    off: Dropdown.off,
}

mm.toast = {
    update: Toast.update,
    toggle: Toast.toggle,
    on: Toast.on,
    off: Toast.off,
}

mm.stepper = {
    update: Stepper.update,
    change: Stepper.change,
}

mm.carousel = {
    update: Carousel.update,
    change: Carousel.change,
    reload: Carousel.reload,
    play: Carousel.play,
    stop: Carousel.stop,
}

mm.slider = {
    update: Slider.update,
    change: Slider.change,
    reload: Slider.reload,
    play: Slider.play,
    stop: Slider.stop,
}

mm.datepicker = {
    update: Datepicker.update,
    change: Datepicker.change,
    dateDisabled: Datepicker.dateDisabled,
}

export default mm;