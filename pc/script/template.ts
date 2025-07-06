import Doms from '@src/script/doms';
import Events from '@src/script/events';
import { Tab } from '@src/script/ui/buttons';

(function () {

    const $header = document.getElementsByClassName(`m_template-header`)[0];
    const $components = Doms.find(`.m_template-component article`);
    const $componentItems = Doms.find(`.m_template-component-item`, $components);

    const _classOn = `S=anchor-on`;

    // 서브 메뉴 생성
    const $sidebarSubs = Doms.find(`.m_template-sidebar-sub`);
    for (const [_i, $el] of $sidebarSubs.entries()) {
        $el.innerHTML = ``;

        const $titles = Doms.find(`.m_template-component-item h3 b`, $components[_i]);
        for (const $text of $titles) Doms.append($el, `<li><a href="#"><b>${$text.innerText}</b></a></li>`);
    }

    const $subBtnAnchors = Doms.find(`.m_template-sidebar-sub a`);
    const $btnAnchors = Doms.find(`.m_template-sidebar .btn_anchor`);

    // 영역 이벤트
    Events.intersection.on($componentItems, (__entry) => {

        if (__entry.isIntersecting) {
            Doms.class.remove($btnAnchors, _classOn);
            Doms.attribute($btnAnchors, { title: `` });

            const $btn = $btnAnchors[Doms.index(__entry.target.closest(`article`), $components)];
            $btn.classList.add(_classOn);
            $btn.setAttribute(`title`, `선택됨`);

            // (function callee(__isEnd) {

            // 	const $anchors = (__isEnd !== true) ? $subBtnAnchors : $btnAnchors;// 2뎁스 : 1뎁스
            // 	Doms.class.remove($anchors, _classOn);
            // 	Doms.attribute($anchors, { title: `` });

            // 	const $btn = (__isEnd !== true) ? $anchors[Doms.index(__entry.target, $componentItems)] : $anchors[Doms.index(__entry.target.closest(`article`), $components)];
            // 	$btn.classList.add(_classOn);
            // 	$btn.setAttribute(`title`, `선택됨`);

            // 	if (__isEnd !== true) callee(true);

            // })();
        }

    }, {
        rootMargin: `-50% 0px -50% 0px`,// 요소의 상단이 스크롤 높이의 35%
        threshold: [0, 1],// 요소의 시작과 끝 모두 감지
    });

    const _anchorHeight = parseFloat(Doms.style($header, `height`));

    // 컴포넌트 앵커 이동
    Events.bind.on($btnAnchors, `click`, __e => {

        __e.preventDefault();

        Doms.scroll.to(__e.currentTarget.getAttribute(`href`), { _margin: 0 });

    });

    Events.bind.on($subBtnAnchors, `click`, __e => {

        __e.preventDefault();

        Doms.scroll.to($componentItems[Doms.index(__e.currentTarget, $subBtnAnchors)], { _margin: _anchorHeight });

    });

})();

// 소스 들여쓰기 공백제거
const codeIndent = (__$code: HTMLElement): string => {

    // if (!__$code) return;

    const textLines = __$code.innerHTML.split(`\n`);
    const textResults = [];
    let _blankCount = 0;

    for (const [_i, _value] of textLines.entries()) {
        if (_value.trim().length > 0) {
            const _trim = _value.trimEnd();
            if (_blankCount == 0) _blankCount = _trim.split(/\t/).findIndex(__value => _blankCount == 0 && __value.length > 0);
            textResults.push(_trim.slice(_blankCount));
        }
    }

    return textResults.join(`\n`);

};

// preview에 내용 삽입
const $codes = Doms.find(`[type="text/codehtml"]`);
for (const $code of $codes) {
    const _getCode = codeIndent($code);
    const $tab = Doms.create(
        `<div class="mm_tab" data-tab>
            <div class="mm_tab_menu">
                <ul>
                    <li><a class="btn_tab S=tab-on" href="#" title="선택됨"><b>PREVIEW</b></a></li>
                    <li><a class="btn_tab" href="#"><b>MARKUP</b></a></li>
                </ul>
            </div>
            <div class="mm_tab-item m...preview S=on">
                <div class="m...preview-inner">${_getCode.replace(`<samp`, `<script`).replace(`</samp>`, `</script>`)}</div>
            </div>
            <div class="mm_tab-item">
                <pre><code class="html"></code></pre>
            </div>
        </div>`
    )[0] as Element;

    $code.before($tab);
    $code.remove();

    $tab.getElementsByTagName(`code`)[0].textContent = _getCode;
    Tab.update($tab);

}