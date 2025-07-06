/**
 * * 페이지 공통(old)
 * mm 선언 필요 시 포함
 */

import Datas from '../datas';
import Doms from '../doms';
import Events from '../events';
import Is from '../is';
import Pages from '../pages';
import { Forms } from '../ui/forms';

/** 로딩 제거(크롬 페이지 뒤로가기 시 이전 링크 이동으로 생긴 로딩 제거) */
const windowUnloadHandler = (): void => Pages.loading.hide();
Events.bind.on(window, `unload`, windowUnloadHandler);

/** 폼 요소 */
// value, checked 속성을 변경할 때 change 이벤트가 실행되도록 기본 함수 변경
Forms.changeSetter(HTMLInputElement, [`checked`, `value`]);
Forms.changeSetter(HTMLSelectElement, [`value`, `selectedIndex`]);
Forms.changeSetter(HTMLOptionElement, [`selected`]);

// 포커스(모바일 키패드, 셀렉트 등 노출에 따른 스크롤 이동)
const formFocusHandler = (__e: FocusEvent, __data: ObjectCollection, __$el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void => {

	if (__$el instanceof HTMLInputElement && ![`text`, `password`, `email`, `number`, `search`, `tel`, `url`, `date`, `month`, `time`, `week`].includes(__$el.type)) return;
	if (Is.mobile(`ios`) && !(__$el instanceof HTMLSelectElement) && (__$el.readOnly || __$el.disabled)) Doms.focus.out(__$el);// ios에서 date 타입일 때 선택되는 이슈가 있어 포커스아웃 적용(접근성 탭이동 문제가 있을 경우 변경 필요)

	const _classFocus = `S=focus`;

	switch (__e.type) {
		case `focusin`:
			if (__$el.hasAttribute(`data-text`)) document.documentElement.classList.add(_classFocus);
			if (!__$el.hasAttribute(`autocomplete`)) __$el.setAttribute(`autocomplete`, `off`);

			if (Is.mobile()) {
				const $scroll = Doms.scroll.find(_classFocus, true);

				// 안드로이드 포커싱 위치 스크롤
				if (Is.mobile(`android`) && !(__$el instanceof HTMLSelectElement) && $scroll.classList.contains(`mm_scroller`)) Doms.scroll.to(__$el, { scroller: $scroll, _margin: 50 + (Doms.find(`.mm_header`)[0]?.offsetHeight ?? 0) });

				// 모바일 화면 스크롤 시 포커스 해제
				const scrollFocusHandler = (__e: Event): void => {

					const $focus = document.activeElement;
					if ($focus != null && Is.touch) {
						Doms.focus.out($focus);
						Events.bind.off($scroll, `scroll`, scrollFocusHandler);
					}

				}
				Events.bind.on($scroll, `scroll`, scrollFocusHandler);
			}
			break;
		case `focusout`:
			document.documentElement.classList.remove(_classFocus);
			break;
	}

}
Events.delegate.on(document, `[data-text], [data-select]`, `focusin focusout`, formFocusHandler);

/** 레디 */
const readyHandler = () => {

	// 아이프레임
	if (frameElement != null) {
		Events.observer.call(Events.type[`frame_ready`], { data: { this: window }});

		// 컨텐츠 아이프레임 리사이즈
		// if (Is.layout(`frame`)) Pages.frameResize(undefined, { _isLoad: true });// ! mm을 사용하지 않을 때 mm.대신 클래스를 직접 호출할 수 있는 방법은?
	}

	// autofill 감지
	const textAutofillHandler = (__e: AnimationEvent): void => {

		const $this = __e.currentTarget as HTMLInputElement;
		const $text = $this.closest(`.mm_form-text`);
		const _classOn = `S=text-on`;
		if ($text == null) return;

		switch (__e.animationName) {
			case `autofill-on`:
				$text.classList.add(_classOn);
				break;
			case `autofill-cancel`:
				if ($this.value.trim().length === 0) $text.classList.remove(_classOn);
				break;
		}

	}
	Events.bind.on(`[data-text]`, `animationstart`, textAutofillHandler);

	// a 링크
	const linkClickHandler = (__e: MouseEvent): void => {

		__e.preventDefault();

		const $this = __e.currentTarget as HTMLAnchorElement;
		if ($this.target.toLowerCase() === `blank`) return;

		const data: PageLinkOption = Datas.clone({
			openEl: $this,
			_type: ``,
			_frameId: ``,
			_frameName: ``,
			_step: 1,
			// _isCloseBefore: false,
			// _isLinkStage: true,
		}, Doms.data.get($this, `data-href`));
		if (data._type!.trim().length === 0) return;

		const _attrHref = $this.getAttribute(`href`);
		const _href = $this.href;
		if (data._type === `link`) {
			if (_attrHref?.replace(`#`, ``).trim().length === 0 || _attrHref?.toLowerCase().includes(`javascript:`)) return;

			if (_href.split(`#`)[0] === location.href.split(`#`)[0]) data._type = `reload`;// 링크가 같으면 reload로 변경
			if (data._type === `reload` && _href.includes(`#`)) data._type = `anchor`;// 링크가 같고 #이 있으면 anchor로 변경
		}

		// 외부링크
		if ([`link`, `popup`].includes(data._type!) && !_href.includes(location.host)) {
			window.open(_href);// 새 창 열림
			return;
		}

		Pages.link(_href, data);

	}
	Events.delegate.on(document, `a[data-href]`, `click`, linkClickHandler);

}
Events.ready(readyHandler);