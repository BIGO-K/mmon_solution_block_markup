/**
 * @class 이벤트
 * @static
 */

import Datas from './datas';
import Doms from './doms';
import Is from './is';
import Utils from './utils';

class Events {

    /** 커스텀 이벤트 목록 */
    private static typer: EventTypeList = {};

    /**
     * * 커스텀 이벤트 getter/setter
     * + 저장 - ..type.set(`string`);
     * + 사용 - ..type[`string`] 또는 type.string
     * @public @static
     */
    public static readonly type: EventCustom = {
        /**
         * * 이벤트 저장
         * @param __type
         */
        set: (__type: string): void => {

            Events.typer[__type] = `mevt_${__type}`.toUpperCase();

            // 사용
            Object.defineProperty(Events.type, __type, {
                get: (): string => Events.typer[__type],
            });

        }
    };

    /**
     * * 페이지 레디
     * @public @static
     * @param __callback
     */
    public static ready(__callback: ArrowFunc): void {

        Events.bindOn(document, `DOMContentLoaded`, __callback, { _isOnce: true });

    }

    /**
     * * 페이지 로드
     * @public @static
     * @param __callback
     * @param __elements (default window)
     * @param __isOnce (default true) - 한 번만 실행
     */
    public static load(__callback: ArrowFunc, __elements: DOMSelector = window, __isOnce: boolean = true): void {

        const $elements = Doms.find(__elements);
        for (const $el of $elements) Events.bindOn($el, `load`, __callback, { _isOnce: __isOnce });

    }

    /**
	 * * 이벤트
	 * @public @static
	 */
	public static readonly bind: EventBind = {
		on: Events.bindOn,
		off: Events.bindOff,
		call: Events.bindCall,
		get: Events.bindGet,
	}

    /** 연결된 이벤트 목록 */
    private static binders: EventBindItem[] = [];

    /**
     * * 이벤트 연결
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback
     * @param __option - IE 적용이 필요하면 boolean으로 변경
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     * @param __option._isCapture (default false) - 버블링 방향으로 반대로
     * @param __option._isPassive (default false) - 스크롤 성능을 위해 true일 때 preventDefault 사용 불가(touchstart, touchmove, wheel, mousewheel 이벤트에서 true로 변경 적용)
     */
    private static bindOn(__elements: DOMSelector, __type: string, __callback: ArrowFunc, __option?: EventBindOption): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;

        const option: Required<EventBindOption> = Datas.clone({
            data: {},
            _isOnce: false,
            _isCapture: false,
            _isPassive: false,
        }, __option);
        const types = __type.split(` `);

        for (const $el of $elements) {
            for (const _type of types) {

                if (Events.binders.some(__source => Is.match(__source, { $element: $el, _type: _type }) && (__source.callback === __callback || (__callback.name.length > 0 && __source.callback.name === __callback.name)))) continue;// 중복 방지

                const eventHandler = (__e: Event): void => {

                    if (__e != null && Number.isNaN((__e as Event & Record<`detail`, any>).detail)) return;// 중복 실행 방지를 위해 detail 값이 NaN이면 __callback이 실행되지 않도록 적용

                    Utils.apply(__callback, [__e, option.data]);
                    if (option._isOnce) Events.bindOff($el, _type, __callback);// 한 번만 실행

                }

                $el.addEventListener(_type, eventHandler, { capture: option._isCapture, passive: option._isPassive });// once 옵션이 있지만 이벤트 관리를 위해 사용 안함
                Events.binders.push({ $element: $el, _type: _type, callback: __callback, handler: eventHandler });
            }
        }

    }

    /**
     * * 이벤트 해제
     * + __callback 값이 없으면 연결된 전체 이벤트 해제
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback - string 타입이면 function.name 값으로 비교
     */
    private static bindOff(__elements: DOMSelector, __type: string, __callback?: ApplyFunc): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0 || (typeof __callback === `function` && __callback.name.length === 0)) return;// 함수에 name값이 없으면 매칭 안됨

        const types = __type.split(` `);

        for (const $el of $elements) {
            for (const _type of types) {
                const _callbackName = (typeof __callback === `function`) ? __callback.name : __callback;

                let _i = 0;
                while (_i < Events.binders.length) {
                    const binder = Events.binders[_i];
                    if (Is.match(binder, { $element: $el, _type: _type })) {
                        if (_callbackName != null && binder.callback.name !== _callbackName) {
                            _i++;
                            continue;
                        }

                        binder.$element.removeEventListener(binder._type, binder.handler);
                        Events.binders.splice(_i, 1);
                    }
                    else _i++;
                }
            }
        }

    }

    /**
     * * 이벤트 실행
     * @param __elements
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __option
     * @param __option.data (default {}) - event.detail로 전달할 값
     */
    private static bindCall(__elements: DOMSelector, __type: string, __option?: Pick<EventBindOption, `data`>): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;

        const option: Pick<EventBindOption, `data`> = Datas.clone({
            data: {}
        }, __option);
        const types = __type.split(` `);

        for (const $el of $elements) {
            for (const _type of types) {
                // 기본 이벤트(UIEvent, MouseEvent, KeyboardEvent 등)는 event.detail로 사용자 지정 값을 전달할 수 없어 이중 적용 필요
                if (_type === `click`) $el.dispatchEvent(new MouseEvent(_type, { detail: NaN }));// 중복 방지를 위해 detail: NaN 적용
                $el.dispatchEvent(new CustomEvent(_type, { detail: option.data, bubbles: true }));
            }
        }

    }

    /**
     * * 이벤트 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements
     * @returns __elements의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    private static bindGet(__elements?: DOMSelector): EventBindItem[] {

        if (arguments.length === 0) return Events.binders;

        const $element = Doms.find(__elements)[0];
        return Events.binders.filter(__source => __source.$element === $element);

    }

    /**
	 * * 이벤트 위임
	 * @public @static
	 */
	public static readonly delegate: EventDelegate = {
		on: Events.delegateOn,
		off: Events.delegateOff,
		get: Events.delegateGet,
	}

    /** 위임된 이벤트 목록 */
    private static delegators: EventDelegateItem[] = [];

    /**
     * * 이벤트 위임 연결
     * @param __parents
     * @param __delegator - 위임할 셀렉터
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    private static delegateOn(__parents: DOMSelector, __delegator: string, __type: string, __callback: ArrowFunc, __option?: EventDelegateOption): void {

        const $parents = Doms.find(__parents);
        if ($parents.length === 0) return;

        const option: Required<EventDelegateOption> = Datas.clone({
            data: {},
            _isOnce: false,
        }, __option);
        const types = __type.split(` `);

        for (let $pa of $parents) {
            if ($pa instanceof Window) $pa = $pa.document;// window는 document로 변경

            for (const _type of types) {
                const target: EventDelegateItemTarget = { _delegator: __delegator, callback: __callback };
                const item: Partial<EventDelegateItem> = { $parent: $pa, _type: _type };
                let delegator = Events.delegators.find(__source => Is.match(__source, item));

                if (delegator == null) {
                    const eventHandler = (__e: Event): void => {

                        delegator = Events.delegators.find(__source => Is.match(__source, item));
                        if (delegator == null) return;

                        let $element = __e.target as HTMLElement | null;
                        while ($element != null && ($pa as Exclude<DOMElement, Window>).contains($element) && $element.tagName !== `BODY`) {
                            const targets = delegator.targets.filter(__source => $element!.matches(__source._delegator));

                            for (const _target of targets) {
                                Utils.apply(_target.callback, [__e, option.data, $element]);
                                if (option._isOnce) Events.delegateOff($pa, _target._delegator, __type, _target.callback);// 한 번만 실행
                            }

                            $element = $element.parentElement;
                        }

                    }

                    $pa.addEventListener(__type, eventHandler, false);
					Events.delegators.push({ $parent: $pa, _type: __type, targets: [target], handler: eventHandler });
                }
                // 연결된 이벤트가 있으면 항목 추가
                else {
                    if (delegator.targets.some(__source => Is.match(__source, { _delegator: __delegator }) && (__source.callback === __callback || (__callback.name.length > 0 && __source.callback.name === __callback.name)))) continue;// 중복 방지

                    delegator.targets.push(target);
                }
            }
        }

    }

    /**
     * * 이벤트 위임 해제
     * + __callback 값이 없으면 연결된 전체 이벤트 해제
     * @param __parents
     * @param __delegator - 위임할 셀렉터
     * @param __type - 띄어쓰기로 여러 타입 연결 가능
     * @param __callback - string 타입이면 function.name 값으로 비교
     */
    private static delegateOff(__parents: DOMSelector, __delegator: string, __type: string, __callback?: ApplyFunc): void {

        const $parents = Doms.find(__parents);
        if ($parents.length === 0 || (typeof __callback === `function` && __callback.name.length === 0)) return;// 함수에 name값이 없으면 매칭 안됨

        const types = __type.split(` `);

        for (let $pa of $parents) {
            if ($pa instanceof Window) $pa = $pa.document;// window는 document로 변경

            for (const _type of types) {
                const _eventIndex = Events.delegators.findIndex(__source => Is.match(__source, { $parent: $pa, _type: _type }));
                if (_eventIndex < 0) continue;

                const delegator = Events.delegators[_eventIndex];
                const _callbackName = (typeof __callback === `function`) ? __callback.name : __callback;

                let _i = 0;
                while (_i < delegator.targets.length) {
                    const targetItem = delegator.targets[_i];
                    if (Is.match(targetItem, { _delegator: __delegator })) {
                        if (_callbackName != null && targetItem.callback.name !== _callbackName) {
                            _i++;
                            continue;
                        }

                        delegator.targets.splice(_i, 1);
                    }
                    else _i++;
                }

                if (delegator.targets.length === 0) {
                    delegator.$parent.removeEventListener(delegator._type, delegator.handler);
                    Events.delegators.splice(_eventIndex, 1);
                }
            }
        }

    }

    /**
     * * 이벤트 위임 연결 확인
     * + 파라미터 값이 없으면 전체 이벤트 리턴
     * @param __parents
     * @returns __parents의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    private static delegateGet(__parents?: DOMSelector): EventDelegateItem[] {

        if (arguments.length === 0) return Events.delegators;

        const $parent = Doms.find(__parents)[0];
        return Events.delegators.filter(__source => Is.match(__source, { $parent: $parent }));

    }

    /**
	 * * 이벤트 옵저버
	 * @public @static
	 */
	public static readonly observer: EventObserver = {
		on: Events.observerOn,
		off: Events.observerOff,
		call: Events.observerCall,
		get: Events.observerGet,
	}

    /** 옵저버 이벤트 목록 */
    private static observers: EventObserverItem[] = [];

    /**
     * * 이벤트 옵저버 연결
     * @param __elements
     * @param __type - 커스텀 이벤트 단일 타입
     * @param __callback
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 한 번만 실행
     */
    private static observerOn(__elements: DOMSelector, __type: string, __callback: ArrowFunc, __option?: EventObserverOption): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;
        if (frameElement != null) return Utils.apply(Events.observer.on, [...arguments]);// top에서 실행

        const option: Required<EventObserverOption> = Datas.clone({
            data: {},
            _isOnce: false,
        });

        for (const $el of $elements) {
            if (Events.observers.some(__source => Is.match(__source, { $element: $el, _type: __type }) && (__source.callback === __callback || (__callback.name.length > 0 && __source.callback.name === __callback.name)))) continue;// 중복 방지

            const eventHandler = (__e: Event): void => {

                Utils.apply(__callback, [__e, option.data]);
                if (option._isOnce) Events.observerOff($el, __type);// 한 번만 실행

            }

            $el.addEventListener(__type, eventHandler, false);
            Events.observers.push({ $element: $el, _type: __type, callback: __callback, handler: eventHandler });
        }

    }

    /**
     * * 이벤트 옵저버 해제
     * + __elements 값이 없으면 __type에 연결된 전체 이벤트 해제
     * + __type 값이 없으면 __elements에 연결된 전체 이벤트 해제
     * + 해제 시 callback은 확인 안함
     * @param __elements
     * @param __type - 커스텀 이벤트 단일 타입
     */
    private static observerOff(__elements: DOMSelector, __type?: string): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;
        if (frameElement != null) return Utils.apply(Events.observer.off, [...arguments]);// top에서 실행

        for (const $el of $elements) {
            const item: Partial<EventObserverItem> = { $element: $el };
            if (typeof __type === `string`) item._type = __type;

            let _i = 0;
            while (_i < Events.observers.length) {
                const observer = Events.observers[_i];
                if (Is.match(observer, item)) {
                    observer.$element.removeEventListener(observer._type, observer.handler);
                    Events.observers.splice(_i, 1);
                }
                else _i++;
            }
        }

    }

    /**
     * * 이벤트 옵저버 실행
     * @param __type - 커스텀 이벤트 단일 타입
     * @param __option
     * @param __option.data (default {}) - event.detail로 전달할 값
     * @param __option._isLocal (default false) - 현재 프레임(document) 안에 연결된 이벤트만 실행(지역)
     * @param __option.$frameWindow (default undefined) - observerCall을 실행한 iframe의 window
     */
    private static observerCall(__type: string, __option?: EventObserverCallOption): void {

        if (frameElement != null) return Utils.apply(Events.observer.call, [__type, Datas.clone(__option ?? {}, { $frameWindow: window })]);// top에서 실행

        const option: Required<EventObserverCallOption> = Datas.clone({
            data: {},
            _isLocal: false,
            $frameWindow: null,
        }, __option);
        const $document = option.$frameWindow?.document ?? document;

        for (const item of Events.observers) {
            if (item._type !== __type) continue;

            const _isContains = (item.$element instanceof Window) ? $document.defaultView === item.$element : $document.contains(item.$element);
            if (!option._isLocal || (option._isLocal && _isContains)) item.$element.dispatchEvent(new CustomEvent(__type, { detail: option.data, bubbles: false }));
        }

    }

    /**
     * * 이벤트 옵저버 연결 확인
     * + __target 값이 없으면 전체 이벤트 리턴
     * @param __target - 단일 요소 또는 커스텀 이벤트 단일 타입
     * @returns __target에 연결된 이벤트 리턴
     */
    private static observerGet(__target?: DOMElement | string): EventObserverItem[] {

        if (frameElement != null) return Utils.apply(Events.observer.get, [...arguments]);
        if (arguments.length === 0) return Events.observers;

        return Events.observers.filter(__source => (typeof __target === `string`) ? __source._type === __target : __source.$element === __target);

    }

    /**
	 * * 이벤트 인터섹션
	 * @public @static
	 */
	public static readonly intersection: EventIntersection = {
        on: Events.intersectionOn,
		off: Events.intersectionOff,
		call: Events.intersectionCall,
		get: Events.intersectionGet,
	}

    /** 인터섹션 이벤트 목록 */
    private static intersectors: EventIntersectionItem[] = [];

    /**
     * * 이벤트 인터섹션 핸들링 함수
     * + __isForce 값이 true면 임의 entry를 생성하여 적용
     * + __entry.boundingClientRect는 리플로우 없이 사용 가능
     * + __entry.intersectionRatio로 현재 노출된 비율 확인
     * @param __entryOrTarget
     * @param __io
     * @param __isForce (default false) - 강제 실행
     */
    private static intersectionHandler(__entryOrTarget: IntersectionObserverEntry | EventIntersectionItemTarget, __io: IntersectionObserver, __isForce: boolean = false): void {

        const _isEntry = __entryOrTarget instanceof IntersectionObserverEntry;
        const intersector = Events.intersectors.find(__source => Is.match(__source, { io: __io }))!;
        const target = (_isEntry) ? intersector.targets.find(__source => Is.match(__source, { $element: __entryOrTarget.target }))! : __entryOrTarget;
        const entry: Partial<readonlyToUse<IntersectionObserverEntry>> = (_isEntry) ? Datas.clone(__entryOrTarget) : { target: __entryOrTarget.$element, boundingClientRect: __entryOrTarget.$element.getBoundingClientRect() };
        if (__isForce) entry.isIntersecting = true;
        if (target == null) return;

        Utils.apply(target.callback, [entry, target.option.data, __io]);
        if (entry.isIntersecting && target.option._isOnce) Events.intersectionOff(target.$element, target.callback, __io);

    }

    /**
     * * 이벤트 인터섹션 연결
     * @param __elements
     * @param __callback
     * @param __config
     * @param __config.root (default undefined)
     * @param __config.rootMargin (defualt `0px 0px 0px 0px`)
     * @param __config.threshold (default [0, 1])
     * @param __option
     * @param __option.data (default {}) - __callback의 3번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    private static intersectionOn(__elements: ElementSelector, __callback: ArrowFunc, __config?: IntersectionObserverInit, __option?: EventIntersectionItemOption): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;

        const config: Required<IntersectionObserverInit> = Datas.clone({
            root: null,
            rootMargin: `0px 0px 0px 0px`,
            threshold: [0, 1],
        }, __config);

        const option: Required<EventIntersectionItemOption> = Datas.clone({
            data: {},
            _isOnce: false,
        }, __option);

        let intersector = Events.intersectors.find(__source => Is.match({ root: __source.io.root, rootMargin: __source.io.rootMargin, threshold: __source.io.thresholds }, __config));// threshold != thresholds 차이로 __source.io 대신 새로운 오브젝트로 비교
        if (intersector == null) {
            intersector = {
                io: new IntersectionObserver((__entries, __io): void => {

                   for (const entry of __entries) Events.intersectionHandler(entry, __io);

                }, config),
                targets: [],
            };
            Events.intersectors.push(intersector);
        }

        for (const $el of $elements) {
            if (intersector.targets.some(__source => Is.match(__source, { $element: $el }) && (__source.callback === __callback || (__callback.name.length > 0 && __source.callback.name === __callback.name)))) return;// 중복 방지

            intersector.io.observe($el);
            intersector.targets.push({ $element: $el, callback: __callback, option: option });
        }

    }

    /**
     * * 이벤트 인터섹션 해제
     * + __callback, __io 값이 없으면 __elements 전체 해제
     * @param __elements
     * @param __callback
     * @param __io
     */
    private static intersectionOff(__elements: ElementSelector, __callback?: ApplyFunc, __io?: IntersectionObserver): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0 || (typeof __callback === `function` && __callback.name.length === 0)) return;// 함수에 name값이 없으면 매칭 안됨

        for (const $el of $elements) {
            const _callbackName = (typeof __callback === `function`) ? __callback.name : __callback;

            for (const [_index, intersector] of Events.intersectors.entries()) {
                if (__io != null && __io !== intersector.io) continue;

                let _i = 0;
                while (_i < intersector.targets.length) {
                    const targetItem = intersector.targets[_i];
                    if (Is.match(targetItem, { $element: $el })) {
                        if (_callbackName != null && targetItem.callback.name !== _callbackName) {
                            _i++;
                            continue;;
                        }

                        intersector.io.unobserve($el);
                        intersector.targets.splice(_i, 1);
                    }
                    else _i++;
                }

                if (intersector.targets.length === 0) {
                    intersector.io.disconnect();
                    Events.intersectors.splice(_index, 1);
                }
            }
        }

    }

    /**
     * * 이벤트 인터섹션 실행
     * + __io 값이 없으면 __elements 전체 실행
     * @param __elements
     * @param __io
     */
    private static intersectionCall(__elements: ElementSelector, __io?: IntersectionObserver): void {

        const $elements = Doms.find(__elements);
        for (const $el of $elements) {
            for (const intersector of Events.intersectors) {
                if (__io != null && __io !== intersector.io) continue;

                for (const target of intersector.targets) {
                    if (target.$element === $el) Events.intersectionHandler(target, intersector.io, true);
                }
            }
        }

    }

    /**
     * * 이벤트 인터섹션 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements - 단일 요소
     * @returns __elements의 첫 번째 요소가 targets에 포함된 이벤트만 리턴
     */
    private static intersectionGet(__element?: ElementSelector): EventIntersectionItem[] {

        if (arguments.length === 0) return Events.intersectors;

        const $element = Doms.find(__element)[0];
        return Events.intersectors.filter(__source => __source.targets.filter(__target => __target.$element === $element));

    }

    /**
     * * 이벤트 뮤테이션
     * @public @static
     */
    public static readonly mutation: EventMutation = {
        on: Events.mutationOn,
        off: Events.mutationOff,
        get: Events.mutationGet,
    }

    /** 뮤테이션 이벤트 목록 */
    private static mutators: EventMutationItem[] = [];

    /**
     * * 이벤트 뮤테이션 연결
     * + input 요소에는 적용 안됨
     * + characterData는 contenteditable에서 적용
     * + characterData를 키보드로 감지(record.target.parentElement > oldValue 이전)
     * + innerText, textContent등으로 직접 변경하면, characterData가 아닌 childList에서 감지(record.target > record.removedNodes 이전, record.addednodes 현재)
     * - (record.type === `childList`) ? record.target : record.target.parentElement;
     * + .observe()는 intersectionObserver와 다르게 추가되지 않고 덮어 씌우게 되어있어 상태별 개별 observer를 만들어 적용
     * @param __elements
     * @param __callback
     * @param __config
     * @param __config.attributes (default false) - 속성 변경 감시
     * @param __config.attributeOldValue (default false) - 속성 변경 이전 값 기록, 값을 true로 하면 attributes의 기본 값이 true로 적용
     * @param __config.attributeFilter (default []) - 감시할 속성으로 값이 없으면 전체 속성 적용
     * @param __config.characterDatas (default false) - 키보드 문자 데이터 변경 감시(innerText, textContent로 직접 변경은 감시 안됨 > childList로 적용)
     * @param __config.characterDataOldValue (default false) - 문자 데이터 변경 이전 값 기록, 값을 true로 하면 characterData의 기본 값이 true로 적용
     * @param __config.childList (default false) - 자식 노드의 추가/삭제 감시
     * @param __config.subtree (default false) - 하위 트리를 포함하여 감시영역 확장
     * @param __option
     * @param __option.data (default {}) - __callback의 2번째 파라미터로 전달
     * @param __option._isOnce (default false) - 이벤트를 한 번만 실행
     */
    private static mutationOn(__elements: DOMSelector, __callback: ArrowFunc, __config: MutationObserverInit, __option?: EventMutationItemOption): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0) return;

        const option: Required<EventMutationItemOption> = Datas.clone({
            data: {},
            _isOnce: false,
        }, __option);

        for (let $el of $elements) {
            if ($el instanceof Window) $el = $el.document;// window는 document로 변경

            let mutator = Events.mutators.find(__source => Is.match(__source, { $element: $el, config: __config } && (__source.callback === __callback || (__callback.name.length > 0 && __source.callback.name === __callback.name))));
            if (mutator != null) continue;

            mutator = {
                mo: new MutationObserver((__records, __mo): void => {

                    const mutator = Events.mutators.find(__source => Is.match(__source, { mo: __mo }))!;
                    Utils.apply(mutator.callback, [__records, mutator.option.data]);
                    if (mutator.option._isOnce) Events.mutationOff(mutator.$element, mutator.callback, mutator.config);

                }),
                $element: $el,
                callback: __callback,
                config: __config,
                option: option,
            };
            mutator.mo.observe($el, __config);

            Events.mutators.push(mutator);

        }

    }

    /**
     * * 이벤트 뮤테이션 해제
     * + __callback, __config 값이 없으면 __elemenrs 전체 해제
     * @param __elements
     * @param __callback
     * @param __config
     */
    private static mutationOff(__elements: DOMSelector, __callback?: ApplyFunc, __config?: MutationObserverInit): void {

        const $elements = Doms.find(__elements);
        if ($elements.length === 0 || (typeof __callback === `function` && __callback.name.length === 0)) return;// 함수에 name값이 없으면 매칭 안됨

        for (let $el of $elements) {
            if ($el instanceof Window) $el = $el.document;// window는 document로 변경
            const _callbackName = (typeof __callback === `function`) ? __callback.name : __callback;
            const item: Partial<EventMutationItem> = { $element: $el };
            if (__config != null) item.config = __config;

            let _i = 0;
            while (_i < Events.mutators.length) {
                const mutator = Events.mutators[_i];
                if (Is.match(mutator, item)) {
                    if (_callbackName != null && mutator.callback.name !== _callbackName) {
                        _i++;
                        continue;
                    }

                    mutator.mo.disconnect();
                    Events.mutators.splice(_i, 1);
                }
                else _i++;
            }
        }

    }

    /**
     * * 이벤트 뮤테이션 연결 확인
     * + __elements 값이 없으면 전체 이벤트 리턴
     * @param __elements - 단일 요소
     * @returns __elements의 첫 번째 요소에 연결된 이벤트만 리턴
     */
    private static mutationGet(__elements?: DOMSelector): EventMutationItem[] {

        if (arguments.length === 0) Events.mutators;

        const $element = Doms.find(__elements)[0];
        return Events.mutators.filter(__source => __source.$element === $element);

    }

}

export default Events;