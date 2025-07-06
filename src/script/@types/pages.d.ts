/** @extends interface MMON UI */
interface MUI {
    /**
	 * * UI 영역
	 * @public
	 */
    ui: PageUI;
    /**
	 * * 아이프레임 리사이즈
	 * @param __elements - HTMLIframeElement 셀렉터, 값이 없으면 frameElement를 확인하여 실행
	 * @param __option
	 * @param __option._isLoad (default false) - 페이지 ready, load로 실행
	 * @param __option._isEven (default false) - 높이를 짝수로 적용
	 * @param __option._extraHeight (default 0) - 높이에 추가로 계산할 값
	 */
    frameResize(__elements?: ElementSelector, __option?: PageFrameResizeOption): void;
    /**
	 * * (디)싱커 전환
	 * @param __elements - 싱커를 연결할 요소
	 * @param __is - 활성 여부
	 * @param __dataName - data-name 이름
	 */
	sync(__elements: ElementSelector, __is: boolean, __dataName: string): void;
    /**
	 * * 로딩
	 * @public
	 */
    loading: PageLoading;
    /**
	 * * 프로그레스
	 * @public
	 */
    // ~ progress: PageProgress;
    /**
	 * * 소셜태그
	 * @public
	 */
    socialTag: PageSocialTag;
	/**
	 * * 링크
	 * + anchor, modal, popup, home, link(modal.close, loading.show)
	 * @param __url
	 * @param __option
	 */
	link(__url: string, __option?: PageLinkOption): void | boolean;
	/**
	 * * 모달
	 * @public
	 */
	modal: PageModal;
	/**
	 * * 팝업
	 * @public
	 */
	popup: PagePopup;
}

declare interface PageUI {
    /**
	 * * UI 생성자 저장
	 * @param __newUI - UI 생성자
	 * @param __option
	 * @param __option._isOverwrite (default false) - 값이 true 일 때 internalUI[_name] 값이 있으면 병합하고, 없거나 false면 새로 저장
	 * @returns
	 */
    set(__newUI: BaseUI, __option?: PageUIOption): void;
    /**
	 * * UI 생성자 확인
	 * __name 값이 없으면 전체 클래스 생성자 리턴
	 * @param __element - 단일 요소
	 * @param __name - data-x 속성 이름 또는 클래스 이름
	 * @returns
	 */
	get<T extends BaseUI>(__element: ElementSelector, __name?: string): T | undefined;
    /**
	 * * UI 생성자 삭제
	 * @param __target - UI 생성자
	 * @param __target - 단일 요소
	 * @param __name - data-x 속성 이름 또는 클래스 이름(__target 이 단일 요소 일 때 사용)
	 */
	remove(__target: BaseUI, __name?: undefined): void;
	remove(__target: ElementSelector, __name: string): void;
}

declare interface PageUIOption {
	/** (default false) 값이 true 일 때 internalUI[_name] 값이 있으면 병합하고, 없거나 false면 새로 저장 */
	_isOverwrite?: boolean;
}

declare interface PageFrameResizeOption {
    /** (default false) 페이지 ready, load로 실행 */
    _isLoad?: boolean;
    /** (default false) 높이를 짝수로 적용 */
    _isEven?: boolean;
    /** (default 0) 높이에 추가로 계산할 값 */
    _extraHeight?: number;
}

declare interface PageSyncOption {
	/** (default null) 싱크 콜백 */
	onSync?: ApplyFunc | null;
	/** (default null) 디싱크 콜백 */
	onDesync?: ApplyFunc | null;
}

declare interface PageLoading {
    /**
	 * * 로딩 노출
	 * + ios에서 링크가 바뀔 때 css keyframes로 적용된 모션 중 ::before, ::after 가상 요소는 움직이지 않는 이슈
	 * @param __element (default `.mm_app`) - 로딩을 노출할 부모 단일 요소
	 * @param __option
	 * @param __option._minHeight (default 0) - 로딩이 노출되는 동안 적용할 부모 요소의 높이
	 * @param __option._top (default 0) - 로딩 아이콘 top 위치
	 * @param __option._background (default ``) - background-color 스타일 값
	 * @param __option._size (default 0) - 로딩 아이콘 폰트 사이즈
	 * @param __option._text (default ``) - 로딩 아이콘 하단에 노출할 텍스트
	 * @returns
	 */
    show(__element: ElementSelector = `.mm_app`, __option?: PageLoadingOption): HTMLElement | undefined;
    /**
	 * * 로딩 숨김
	 * @param __elements (default `.mm_app`) - 로딩의 부모 요소
	 * @param __delay (default 0) - 숨김 딜레이 시간(초)
	 */
    hide(__elements: ElementSelector = `.mm_app`, __delay: number = 0): void;
}

declare interface PageLoadingOption {
    /** (default 0) 로딩이 노출되는 동안 적용할 부모 요소의 높이 */
    _minHeight?: number;
    /** (default 0) 로딩 아이콘 top 위치 */
    _top?: number;
    /** (default ``) background-color 스타일 값 */
    _background?: string;
    /** (default 0) 로딩 아이콘 폰트 사이즈 */
    _size?: number;
    /** (default ``) 로딩 아이콘 하단에 노출할 텍스트 */
    _text?: string;
}

declare interface PageSocialTag {
    /**
	 * * 소셜태그 추가/변경
	 * @param __option
	 * @param __option.title - og:title
	 * @param __option.type - og:type(`article` | `book` | `profile` | `website` | `video.movie` | `video.episode` | `video.tv_show` | `video.other` | `music.song` | `music.album` | `music.playlist` | `music.radio_station`);
	 * @param __option.image - og:image
	 * @param __option.url - og:url
	 * @param __option.description - og:description
	 * @param __option.siteName - og:site_name
	 * @param __option.card - twitter:card
	 * @param __option.imageAlt - twitter:image:alt
	 */
    set(__option: PageSocialTagOption): void;
    /**
	 * * 소셜태그 가져오기
	 * @param __key - 값이 있으면 해당 내용만 없으면 전체를 리턴
	 * @returns
	 */
    get(__key?: keyof PageSocialTagOption): PageSocialTagOption | string | undefined;
    /**
	 * * 소셜태그 삭제
	 * @param __key - 값이 없으면 전체 삭제
	 */
    remove(__key?: keyof PageSocialTagOption | Array<keyof PageSocialTagOption>): void;
}

declare interface PageSocialTagOption {
    /** (default ``) og:title */
    title?: string;
    /** (default ``) og:type */
    type?: `article` | `book` | `profile` | `website` | `video.movie` | `video.episode` | `video.tv_show` | `video.other` | `music.song` | `music.album` | `music.playlist` | `music.radio_station`;
    /** (default ``) og:image */
    image?: string;
    /** (default ``) og:url */
    url?: string;
    /** (default ``) og:description */
    description?: string;
    /** (default ``) og:site_name */
    siteName?: string;
    /** (default ``) twitter:card */
    card?: string;
    /** (default ``) twitter:image:alt */
    imageAlt?: string;
}

/** 소셜태그 타입 별 property, name 값 */
declare interface PageSocialTagKey {
    title: `og:title`;
    type: `og:type`;
    image: `og:image`;
    url: `og:url`;
    description: `og:description`;
    siteName: `og:site_name`;
    card: `twitter:card`;
    imageAlt: `twitter:image:alt`;
}

declare type PageLinkType = `anchor` | `modal` | `popup` | `link` | `home` | `reload` | `back` | `forward`;

declare interface PageLinkOption extends DomScrollToOption, PageModalOption, PagePopupOption {
	/** (default `link`) 링크 타입 */
	_type?: PageLinkType;
	/** (default 1) 히스토리 이동 단계 */
	_step?: number;
}

declare interface PageModal {
	/** 모달을 열 때 클릭한 요소 */
	get $openEl(): Window | HTMLElement | null;
	/** 오프너 */
	get $opener(): Window | null;
	/**
	 * * 모달 열기
	 * @param __url
	 * @param __option
	 * @param __option.openEl (default null) - modal.openEl로 리턴할 요소
	 * @param __option._frameId (default ``) - 아이프레임 id 속성 값
	 * @param __option._frameName (default ``) - 아이프레임 name 속성 값
	 * @param __option._frameTitle (default ``) - 아이프레임 title 속성 값
	 * @param __option._isFull (default false) - 화면에 꽉차게 노출
	 * @param __option._isHeader (default true) - 헤더 노출
	 * @param __option._isCloseOutside (default false) - dim 요소를 클랙해서 닫기
	 * @param __option.classes (default []) - 생성된 modal-item 요소에 추가할 클래스
	 * @param __option.onReady (default null)
	 * @param __option.onReadyParams (default [])
	 * @param __option.onLoad (default null)
	 * @param __option.onLoadParams (default [])
	 * @returns
	 */
	open(__url: string, __option?: PageModalOption): HTMLElement;
	/**
	 * * 모달 닫기
	 * @param __callback
	 * @param __params - 콜백 파라미터
	 */
	close(__callback?: ArrowFunc, __params?: unknown[]): void;
	/**
	 * * 모달 리사이즈
	 * @param __option
	 * @param __option._isLoad (default false) - 페이지 ready, load로 실행
	 * @param __option._isEven (default false) - 높이를 짝수로 적용
	 * @param __option._extraHeight (default 0) - 높이에 추가로 계산할 값
	 */
	resize(__option?: PageModalResizeOption): void;
}

declare interface PageModalItem {
	/** 모달 아이템 요소 */
	$item: HTMLElement;
	/** modal.openEl로 리턴할 요소 */
	$openEl: HTMLElement | null;
}

declare interface PageModalOption {
	/** (default null) modal.openEl로 리턴할 요소 */
	$openEl?: HTMLElement | null;
	/** (default ``) 아이프레임 id 속성 값 */
	_frameId?: string;
	/** (default ``) 아이프레임 name 속성 값 */
	_frameName?: string;
	/** (default ``) 아이프레임 title 속성 값 */
	_frameTitle?: string;
	/** (default false) 화면에 꽉차게 노출 */
	_isFull?: boolean;
	/** (default true) 헤더 노출 */
	_isHeader?: boolean;
	/** (default false) dim 요소를 클랙해서 닫기 */
	_isCloseOutside?: boolean;
	/** (default []) 생성된 modal-item 요소에 추가할 클래스 */
	classes?: string[];
	onReady?: ArrowFunc | null;
	onReadyParams?: unknown[];
	onLoad?: ArrowFunc | null;
	onLoadParams?: unknown[];
}

declare interface PageModalResizeOption extends PageFrameResizeOption {
}

declare interface PagePopup {
	/** 팝업을 열 때 클릭한 요소 */
	get $openEl(): Window | HTMLElement | null;
	/** 오프너 */
	get $opener(): Window | null;
	/**
	 * * 팝업 열기
	 * @param __url
	 * @param __option
	 * @param __option.openEl (default null) - modal.openEl로 리턴할 요소
	 * @param __option._frameId (default ``) - 아이프레임 id 속성 값
	 * @param __option._frameName (default ``) - 아이프레임 name 속성 값
	 * @param __option._frameTitle (default ``) - 아이프레임 title 속성 값
	 * @param __option._isFull (default false) - 화면에 꽉차게 노출
	 * @param __option._isHeader (default true) - 헤더 노출
	 * @param __option._isCloseOutside (default false) - dim 요소를 클랙해서 닫기
	 * @param __option.classes (default []) - 생성된 modal-item 요소에 추가할 클래스
	 * @param __option.onReady (default null)
	 * @param __option.onReadyParams (default [])
	 * @param __option.onLoad (default null)
	 * @param __option.onLoadParams (default [])
	 * @returns
	 */
	open(__url: string, __option?: PagePopupOption): Window | null;
	/**
	 * * 팝업 닫기
	 * @param __callback
	 * @param __params - 콜백 파라미터
	 */
	close(__callback?: ArrowFunc, __params?: unknown[]): void;
	/**
	 * * 팝업 리사이즈
	 */
	resize(): void;
}

declare interface PagePopupOption {
	/** popup.openEl로 리턴할 요소 */
	openEl?: HTMLElement;
	_name?: string;
	specs: {
		_top: number;
		_left: number;
		_width: number;
		_height: number;
		_isTitlebar: boolean;
		_isMenubar: boolean;
		_isToolbar: boolean;
		_isLocation: boolean;
		_isScrollbars: boolean;
		_isStatus: boolean;
		_isResizable: boolean;
	};
}