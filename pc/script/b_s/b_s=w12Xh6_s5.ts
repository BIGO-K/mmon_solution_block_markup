import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Times from '@src/script/times';
import Lazyload from '@src/script/ui/Lazyload';
import { gsap } from 'gsap';

const _selector = `[data-mui="b_s=w12Xh6_s5"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    (() => {

        const $ui = Doms.find(`[data-mui="b_s=w12Xh6_s5"]`)[0];
        const $brand = Doms.find(`.m_banner`, $ui)[0];
        const $list = Doms.find(`.m_banner-list`, $brand)[0];
        let $items = Object.values($list.children);

        const $indexCount = Doms.find(`.m_banner-count-index`, $brand)[0];
        const $totalCount = Doms.find(`.m_banner-count-total`, $brand)[0];
        const $progress = Doms.find(`.m_banner-progress-bar`, $brand)[0]

        const _itemTotal = $items.length;
        let _itemIndex = 0;
        let _splitWidth = 0;
        let interval = NaN;

        const setProgress = () => {

            _itemIndex = (_itemIndex < 0) ? _itemTotal + _itemIndex : _itemIndex % _itemTotal;

            $indexCount.textContent = String(_itemIndex + 1);
            $totalCount.textContent = String(_itemTotal);

            Doms.style($progress, { width: `${(_itemIndex + 1) / _itemTotal * 100}%` });

        }

        const play = () => {

            stop();

            interval = setInterval(() => {

                _itemIndex++;
                change();

            }, 2000);

        }

        const stop = () => clearInterval(interval);

        const change = () => {

            gsap.to($list, { x: -_itemIndex * _splitWidth, duration: Times.BASE,
                onComplete: () => {

                    gsap.set($list, { x: -_itemIndex * _splitWidth });

                }
            });
            setProgress();

            for (let _i = 0; _i < $items.length; _i++) {
                let _index = _i + _itemIndex;
                if (_index > $items.length - 1) _index -= $items.length;

                if (_i % _itemTotal < 4 && _i % _itemTotal !== 1) $items[_index].classList.add(`T:lg`);
                else $items[_index].classList.remove(`T:lg`);
            }

        }

        setProgress();
        play();

        // 복제
        const $firstItem = $items[0];
        const _defaultWidth = parseFloat(Doms.style($list, `width`));

        for (const $item of $items) {
            let _count = 0;
            while (_count++ < 2) {
                const $clone = $item.cloneNode(true) as HTMLElement;
                $clone.classList.add(`S=clone`);
                $clone.setAttribute(`tabindex`, `-1`);

                if (_count === 1) $firstItem.before($clone);
                else $list.append($clone);
            }
        }
        $items = Object.values($list.children);
        _splitWidth = $list.offsetWidth / $items.length;

        Doms.style($items[0], { marginInlineStart: `${-_defaultWidth}px` });

        // 마우스 이벤트
        let _isMove = false;

        const mouseControlHandler = (__e: MouseEvent): void => {

            switch (__e.type) {
                case `mouseenter`:
                    stop();
                    break;
                case `mouseleave`:
                    play();
                    break;
                case `mousedown`:
                    __e.preventDefault();

                    const _startX = __e.clientX;
                    const matrix = Doms.style($list, `transform`).split(`,`);// matrix X(4)/Y(5), matrix3d X(12)/Y(13)/Z(14)
                    const _startValue = parseFloat(matrix[matrix[0].includes(`matrix3d`) ? 12 : 4]) || 0;
                    _isMove = false;

                    Events.bind.on(document, `mousemove mouseup`, function listDragHandler(__e) {

                        __e.preventDefault();

                        switch (__e.type) {
                            case `mousemove`:
                                if (!_isMove && _startX !== __e.clientX) _isMove = true;
                                gsap.set($list, { x: _startValue + (__e.clientX - _startX) });
                                break;
                            case `mouseup`:
                                _itemIndex = -Math.round((_startValue + (__e.clientX - _startX)) / _splitWidth);
                                change();
                                Events.bind.off(document, `mousemove mouseup`, listDragHandler);
                                break;
                        }

                    });
                    break;
            }

        }
        Events.bind.on($list, `mouseenter mouseleave mousedown`, mouseControlHandler);

        const clickCancelHandler = (__e: MouseEvent): void => {

			if (_isMove) {
				__e.preventDefault();
				__e.stopPropagation();
			}

		}
		Events.bind.on($list, `click`, clickCancelHandler, { _isCapture: true });

    })();

    Lazyload.update(getDataSelector(`lazyload`));

});