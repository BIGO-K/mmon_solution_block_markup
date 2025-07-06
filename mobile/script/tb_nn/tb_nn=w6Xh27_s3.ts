import Events from '@src/script/events';
import { Tab } from '@src/script/ui/buttons';
import Lazyload from '@src/script/ui/Lazyload';

const _selector = `[data-mui="tb_nn=w6Xh27_s3"]`;
const getDataSelector = (__name: string): string => `${_selector} [data-${__name}]`;

Events.load(() => {

    Tab.update(getDataSelector(`tab`));
    Lazyload.update(getDataSelector(`lazyload`));

});