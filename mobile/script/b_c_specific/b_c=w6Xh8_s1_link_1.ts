import Doms from '@src/script/doms';
import Events from '@src/script/events';
import Lazyload from '@src/script/ui/Lazyload';
import { Carousel } from '@src/script/ui/sliders';

const _selector = `[data-mui="b_c=w6Xh8_s1_link_1"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Carousel.update(getDataSelector(`carousel`), {
        // 캐러셀 동작 시 비디오 재생/멈춤
        onComplete: (__package: { ui: Carousel }): void => {

            const _classVideo = `S=video-on`;
            const $videoOn = Doms.find(`.${_classVideo}`, __package.ui.$element)[0];

            if ($videoOn != null) {
                if (Doms.find(`.mui_carousel-item.S=on`, __package.ui.$element)[0] === $videoOn.closest(`.mui_carousel-item`)) return;

                const $video = Doms.find(`video`, $videoOn)[0];
                $video.pause();
                $video.currentTime = 0;

                $videoOn.classList.remove(_classVideo);
            }

        }
    });

    Lazyload.update(getDataSelector(`lazyload`));

    // play 버튼 클릭 시 동영상 재생
    const playClickHandler = (__e: MouseEvent): void => {

        const _classVideo = `S=video-on`;
        const $el = (__e.currentTarget as HTMLElement).closest(`.mui_carousel-item-video`);
        if ($el == null) return;

        $el.classList.add(_classVideo);

        const $video = Doms.find(`video`, $el)[0];
        $video.play();
        $video.onended = () => {

            $video.currentTime = 0;

        }

    }
    Events.bind.on(`${_selector} .btn_play`, `click`, playClickHandler);

});