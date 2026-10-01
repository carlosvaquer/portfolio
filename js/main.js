const mainElement = document.querySelector('main');

const leftWheel =
    document.querySelector('.project-wheel-left');

const rightWheel =
    document.querySelector('.project-wheel-right');

const leftItems =
    leftWheel.querySelectorAll('.wheel-item');

const rightItems =
    rightWheel.querySelectorAll('.wheel-item');

const mediaGroups =
    document.querySelectorAll('.project-image-group');

const projectsArea =
    document.querySelector('.projects');

const mediaArea =
    document.querySelector('.project-images');

const index =
    document.querySelector('.index');

const indexMenu =
    document.querySelector('.index-menu');

const about =
    document.querySelector('.about');

const aboutMenu =
    document.querySelector('.about-menu');

const intro =
    document.querySelector('.intro');

const introTitle =
    intro
        ? intro.querySelector('h1')
        : null;

const introDescription =
    intro
        ? intro.querySelector('p')
        : null;


const radius = 300;

const angleStep = 25;

const scrollSensitivity = 0.01;

const smoothness = 0.14;

const snapDelay = 120;


const mediaSpacing = 350;

const mediaScale = 0.82;

const mediaBlur = 5;

const mediaScrollSensitivity = 0.005;

const mediaSmoothness = 0.14;

const mediaSnapDelay = 120;


const mobileBreakpoint = 768;

const mobileMediaSpacing = 0.68;

const mobileMediaMaxSpacing = 280;


let currentPosition = 0;

let targetPosition = 0;

let currentMediaPosition = 0;

let targetMediaPosition = 0;

let animationFrame = null;

let projectSnapTimeout = null;

let mediaSnapTimeout = null;

let previousActiveProject = -1;

let activeProject = 0;

let activeMediaItems = [];


const mediaByProject =
    Array.from(
        mediaGroups,
        group =>
            Array.from(
                group.querySelectorAll(
                    'img, video'
                )
            )
    );


const videosByProject =
    mediaByProject.map(
        items =>
            items.filter(
                media =>
                    media.tagName ===
                    'VIDEO'
            )
    );


const allVideos =
    videosByProject.flat();


const mobileProjectData = {

    0: {
        title: 'Javier Camps',
        category: 'Visual Identity',
        year: '2025',
        url: 'https://javiercamps.com'
    },

    1: {
        title: 'Aina Monzó',
        category: 'Online Jewellery Shop',
        year: '2026',
        url: 'https://ainamonzo.com'
    },

    2: {
        title: '3D Modeling',
        category: 'Design + 3D Animation',
        year: '2022',
        url: 'https://www.instagram.com/vaqkr.3d'
    },

    3: {
        title: 'Artántida',
        category: 'Event Platform',
        year: '2026',
        url: 'https://artantida.com'
    },

    4: {
        title: 'Gorka Larcan',
        category: 'Visual Identity',
        year: '2026',
        wip: true,
        url: 'https://gorkalarcan.com'
    },

    5: {
        title: 'Rubén Segovia',
        category: 'Visual Identity',
        year: '2025',
        url: 'https://rubensegovia.com/'
    },

    6: {
        title: 'Luzia Orts',
        category: 'Photography Portfolio',
        year: '2025',
        url: 'https://luziaorts.com'
    }

};


let mobileProjectInfo = null;

let mobileNeighborLayer = null;

let mobilePreviousNeighbor = null;

let mobileNextNeighbor = null;


function isMobile() {

    return window.innerWidth <=
        mobileBreakpoint;

}


function getActiveProject(
    position
) {

    const totalProjects =
        mediaGroups.length;

    if (!totalProjects) {
        return 0;
    }

    let indexValue =
        Math.round(position);

    indexValue =
        (
            (
                indexValue %
                totalProjects
            ) +
            totalProjects
        ) %
        totalProjects;

    return indexValue;

}


function normalizeProjectIndex(
    indexValue
) {

    const totalProjects =
        mediaGroups.length;

    if (!totalProjects) {
        return 0;
    }

    return (
        (
            indexValue %
            totalProjects
        ) +
        totalProjects
    ) %
    totalProjects;

}


function getProjectData(
    projectIndex
) {

    return mobileProjectData[
        projectIndex
    ] || null;

}


function getRelativeIndex(
    indexValue,
    position,
    totalItems
) {

    let relativeIndex =
        indexValue -
        position;

    while (
        relativeIndex >
        totalItems / 2
    ) {

        relativeIndex -=
            totalItems;

    }

    while (
        relativeIndex <
        -totalItems / 2
    ) {

        relativeIndex +=
            totalItems;

    }

    return relativeIndex;

}


function getOpacity(
    distance
) {

    const absDistance =
        Math.abs(
            distance
        );

    if (
        absDistance <= 1
    ) {

        return 1 -
            (
                absDistance *
                0.75
            );

    }

    if (
        absDistance <= 2
    ) {

        return 0.25 -
            (
                (
                    absDistance -
                    1
                ) *
                0.10
            );

    }

    if (
        absDistance <= 3
    ) {

        return 0.15 -
            (
                (
                    absDistance -
                    2
                ) *
                0.10
            );

    }

    return 0.05;

}


function prepareVideos() {

    allVideos.forEach(
        video => {

            video.autoplay =
                false;

            video.removeAttribute(
                'autoplay'
            );

            video.muted =
                true;

            video.loop =
                true;

            video.playsInline =
                true;

            video.preload =
                'none';

            video.pause();

        }
    );

}


function pauseAllVideos() {

    allVideos.forEach(
        video => {

            video.pause();

        }
    );

}


function preloadProject(
    projectIndex
) {

    const items =
        mediaByProject[
            projectIndex
        ] || [];

    const firstVideo =
        items.find(
            media =>
                media.tagName ===
                'VIDEO'
        );

    if (!firstVideo) {
        return;
    }

    firstVideo.preload =
        'auto';

}


function playVideo(
    video
) {

    if (!video) {
        return;
    }

    video.preload =
        'auto';

    video.play().catch(
        () => {}
    );

}


function syncVideos() {

    pauseAllVideos();

    const activeVideos =
        videosByProject[
            activeProject
        ] || [];

    if (!activeVideos.length) {
        return;
    }

    if (isMobile()) {

        const totalMedia =
            activeMediaItems.length;

        if (!totalMedia) {
            return;
        }

        let mediaIndex =
            Math.round(
                targetMediaPosition
            );

        mediaIndex =
            (
                (
                    mediaIndex %
                    totalMedia
                ) +
                totalMedia
            ) %
            totalMedia;

        const activeMedia =
            activeMediaItems[
                mediaIndex
            ];

        if (
            activeMedia &&
            activeMedia.tagName ===
            'VIDEO'
        ) {

            playVideo(
                activeMedia
            );

        }

        return;

    }

    activeVideos.forEach(
        video => {

            playVideo(
                video
            );

        }
    );

}


function activateProject(
    projectIndex
) {

    activeProject =
        normalizeProjectIndex(
            projectIndex
        );

    previousActiveProject =
        activeProject;

    currentMediaPosition =
        0;

    targetMediaPosition =
        0;

    activeMediaItems =
        mediaByProject[
            activeProject
        ] || [];

    mediaGroups.forEach(
        (
            group,
            indexValue
        ) => {

            group.classList.toggle(
                'active',
                indexValue ===
                activeProject
            );

        }
    );

    updateMobileProjectInfo(
        activeProject
    );

    updateMobileNeighbors(
        activeProject
    );

    preloadProject(
        activeProject
    );

    preloadProject(
        normalizeProjectIndex(
            activeProject + 1
        )
    );

    preloadProject(
        normalizeProjectIndex(
            activeProject - 1
        )
    );

    syncVideos();

}


function checkActiveProject() {

    const nextProject =
        getActiveProject(
            currentPosition
        );

    if (
        nextProject ===
        previousActiveProject
    ) {

        return;
    }

    activateProject(
        nextProject
    );

}


function updateMobileIntro() {

    if (
        !introTitle ||
        !introDescription
    ) {

        return;

    }

    introTitle.textContent =
        'Carlos Vaquer';

    introDescription.textContent =
        isMobile()
            ? 'Websites & Design'
            : 'Web developer and designer focused on custom digital experiences.';

}


function createMobileProjectInfo() {

    if (
        !mainElement
    ) {

        return null;

    }

    if (
        mobileProjectInfo
    ) {

        return mobileProjectInfo;

    }

    mobileProjectInfo =
        document.createElement(
            'div'
        );

    mobileProjectInfo.className =
        'mobile-project-info';

    const copy =
        document.createElement(
            'div'
        );

    copy.className =
        'mobile-project-copy';

    const title =
        document.createElement(
            'span'
        );

    title.className =
        'mobile-project-title';

    const category =
        document.createElement(
            'span'
        );

    category.className =
        'mobile-project-category';

    const year =
        document.createElement(
            'span'
        );

    year.className =
        'mobile-project-year';

    const wip =
        document.createElement(
            'span'
        );

    wip.className =
        'mobile-project-wip';

    copy.appendChild(
        title
    );

    copy.appendChild(
        category
    );

    copy.appendChild(
        year
    );

    copy.appendChild(
        wip
    );

    const link =
        document.createElement(
            'a'
        );

    link.className =
        'mobile-project-link project-link';

    link.target =
        '_blank';

    link.rel =
        'noopener noreferrer';

    link.textContent =
        'View Site';

    mobileProjectInfo.appendChild(
        copy
    );

    mobileProjectInfo.appendChild(
        link
    );

    mainElement.appendChild(
        mobileProjectInfo
    );

    return mobileProjectInfo;

}


function updateMobileProjectInfo(
    projectIndex
) {

    const info =
        createMobileProjectInfo();

    const project =
        getProjectData(
            projectIndex
        );

    if (
        !info ||
        !project
    ) {

        return;

    }

    const title =
        info.querySelector(
            '.mobile-project-title'
        );

    const category =
        info.querySelector(
            '.mobile-project-category'
        );

    const year =
        info.querySelector(
            '.mobile-project-year'
        );

    const wip =
        info.querySelector(
            '.mobile-project-wip'
        );

    const link =
        info.querySelector(
            '.mobile-project-link'
        );

    title.textContent =
        project.title;

    category.textContent =
        project.category;

    year.textContent =
        project.year;

    wip.textContent =
        project.wip
            ? 'WIP'
            : '';

    wip.style.display =
        project.wip
            ? 'inline'
            : 'none';

    if (
        project.url
    ) {

        link.href =
            project.url;

        link.style.display =
            'inline-flex';

    } else {

        link.removeAttribute(
            'href'
        );

        link.style.display =
            'none';

    }

}


function createMobileNeighbor(
    type
) {

    const card =
        document.createElement(
            'div'
        );

    card.className =
        `mobile-neighbor mobile-neighbor-${type}`;

    card.style.position =
        'absolute';

    card.style.left =
        '50%';

    card.style.width =
        '100vw';

    card.style.transform =
        'translateX(-50%)';

    card.style.display =
        'flex';

    card.style.flexDirection =
        'column';

    card.style.alignItems =
        'center';

    card.style.gap =
        '0.4rem';

    card.style.opacity =
        '0.42';

    card.style.filter =
        'blur(8px)';

    card.style.pointerEvents =
        'none';

    const media =
        document.createElement(
            'div'
        );

    media.className =
        'mobile-neighbor-media';

    media.style.position =
        'relative';

    media.style.width =
        '100vw';

    media.style.height =
        'min(15dvh, 105px)';

    media.style.display =
        'block';

    media.style.overflow =
        'visible';


    const title =
        document.createElement(
            'span'
        );

    title.className =
        'mobile-neighbor-title';

    title.style.display =
        'block';

    title.style.width =
        '100%';

    title.style.textAlign =
        'center';


    card.appendChild(
        media
    );

    card.appendChild(
        title
    );


    return card;

}


function setMobileNeighbor(
    card,
    projectIndex
) {

    if (
        !card
    ) {

        return;

    }


    if (
        card.dataset.project ===
        String(projectIndex)
    ) {

        return;

    }


    const project =
        getProjectData(
            projectIndex
        );

    const sourceMedia =
        mediaByProject[
            projectIndex
        ] || [];


    const mediaContainer =
        card.querySelector(
            '.mobile-neighbor-media'
        );

    const title =
        card.querySelector(
            '.mobile-neighbor-title'
        );


    if (
        !project ||
        !mediaContainer ||
        !title
    ) {

        return;

    }


    card.dataset.project =
        String(projectIndex);


    title.textContent =
        project.title;


    mediaContainer.replaceChildren();


    const mediaToShow =
        sourceMedia.slice(
            0,
            3
        );


    const mobileSpacing =
        Math.min(
            190,
            window.innerWidth *
            0.50
        );


    mediaToShow.forEach(
        (
            source,
            indexValue
        ) => {

            const preview =
                source.cloneNode(
                    true
                );


            preview.classList.add(
                'mobile-neighbor-preview'
            );


            preview.removeAttribute(
                'id'
            );


            preview.setAttribute(
                'aria-hidden',
                'true'
            );


            if (
                preview.tagName ===
                'VIDEO'
            ) {

                preview.autoplay =
                    false;

                preview.removeAttribute(
                    'autoplay'
                );

                preview.muted =
                    true;

                preview.loop =
                    true;

                preview.playsInline =
                    true;

                preview.preload =
                    'metadata';

                preview.removeAttribute(
                    'controls'
                );


                preview.addEventListener(
                    'loadeddata',
                    () => {

                        preview.currentTime =
                            0;

                        preview.pause();

                    },
                    {
                        once: true
                    }
                );

                preview.load();

            }


            const relativeIndex =
                indexValue === 0

                    ? 0

                    : indexValue === 1

                        ? 1

                        : -1;


            const x =
                relativeIndex *
                mobileSpacing;


            const scale =
                relativeIndex === 0
                    ? 1
                    : mediaScale;


            preview.style.position =
                'absolute';


            preview.style.top =
                '50%';


            preview.style.left =
                '50%';


            preview.style.width =
                'auto';


            preview.style.height =
                '100%';


            preview.style.maxWidth =
                'none';


            preview.style.objectFit =
                'contain';


            preview.style.transform = `
                translate3d(
                    calc(
                        -50% +
                        ${x}px
                    ),
                    -50%,
                    0
                )
                scale(
                    ${scale}
                )
            `;


            preview.style.pointerEvents =
                'none';


            mediaContainer.appendChild(
                preview
            );

        }
    );

}


function updateMobileNeighbors(
    projectIndex
) {

    if (
        !isMobile() ||
        !mobilePreviousNeighbor ||
        !mobileNextNeighbor
    ) {

        return;

    }


    const totalProjects =
        mediaGroups.length;


    const previousProject =
        (
            projectIndex -
            1 +
            totalProjects
        ) %
        totalProjects;


    const nextProject =
        (
            projectIndex +
            1
        ) %
        totalProjects;


    setMobileNeighbor(
        mobilePreviousNeighbor,
        previousProject
    );


    setMobileNeighbor(
        mobileNextNeighbor,
        nextProject
    );

}


function createMobileNeighbors() {

    if (
        !projectsArea ||
        mobileNeighborLayer
    ) {

        return;

    }


    mobileNeighborLayer =
        document.createElement(
            'div'
        );


    mobileNeighborLayer.className =
        'mobile-neighbor-layer';


    mobileNeighborLayer.setAttribute(
        'aria-hidden',
        'true'
    );


    mobilePreviousNeighbor =
        createMobileNeighbor(
            'previous'
        );


    mobileNextNeighbor =
        createMobileNeighbor(
            'next'
        );


    mobileNeighborLayer.appendChild(
        mobilePreviousNeighbor
    );


    mobileNeighborLayer.appendChild(
        mobileNextNeighbor
    );


    projectsArea.appendChild(
        mobileNeighborLayer
    );

}


function positionCenterMedia(
    mediaPosition
) {

    const totalMedia =
        activeMediaItems.length;


    if (!totalMedia) {

        return;

    }


    const mobile =
        isMobile();


    const visualPosition =
        mobile
            ? Math.round(
                targetMediaPosition
            )
            : mediaPosition;


    const spacing =
        mobile

            ? Math.min(
                mobileMediaMaxSpacing,
                window.innerWidth *
                mobileMediaSpacing
            )

            : mediaSpacing;


    activeMediaItems.forEach(
        (
            media,
            indexValue
        ) => {

            const physicalRelative =
                getRelativeIndex(
                    indexValue,
                    mediaPosition,
                    totalMedia
                );


            const visualRelative =
                getRelativeIndex(
                    indexValue,
                    visualPosition,
                    totalMedia
                );


            const distance =
                Math.abs(
                    visualRelative
                );


            const scale =
                Math.pow(
                    mediaScale,
                    distance
                );


            if (mobile) {

                const x =
                    physicalRelative *
                    spacing;


                const isActive =
                    distance === 0;


                media.style.transform = `
                    translate3d(
                        calc(
                            -50% +
                            ${x}px
                        ),
                        -50%,
                        0
                    )
                    scale(
                        ${
                            isActive
                                ? 1
                                : scale
                        }
                    )
                `;


                media.style.opacity =
                    isActive
                        ? 1
                        : Math.max(
                            0.08,
                            1 -
                            (
                                distance *
                                0.30
                            )
                        );


                media.style.filter =
                    isActive
                        ? 'none'
                        : `blur(
                            ${
                                distance *
                                mediaBlur
                            }px
                        )`;


                media.style.zIndex =
                    isActive
                        ? '3'
                        : '1';


                return;

            }


            const y =
                physicalRelative *
                mediaSpacing;


            media.style.transform = `
                translate3d(
                    -50%,
                    calc(
                        -50% +
                        ${y}px
                    ),
                    0
                )
                scale(
                    ${scale}
                )
            `;


            media.style.opacity =
                distance === 0

                    ? 1

                    : Math.max(
                        0.05,
                        1 -
                        (
                            distance *
                            0.30
                        )
                    );


            media.style.filter =
                `blur(
                    ${
                        distance *
                        mediaBlur
                    }px
                )`;


            media.style.zIndex =
                distance === 0
                    ? '3'
                    : '1';

        }
    );

}


function positionWheels(
    projectPosition,
    mediaPosition
) {

    positionCenterMedia(
        mediaPosition
    );


    if (isMobile()) {

        return;

    }


    const centerY =
        leftWheel.offsetHeight /
        2;


    const viewportWidth =
        window.innerWidth;


    const halfWidth =
        viewportWidth /
        2;


    const totalProjects =
        leftItems.length;


    leftItems.forEach(
        (
            item,
            indexValue
        ) => {

            const relativeIndex =
                getRelativeIndex(
                    indexValue,
                    projectPosition,
                    totalProjects
                );


            const angle =
                relativeIndex *
                angleStep;


            const radians =
                angle *
                Math.PI /
                180;


            const x =
                Math.cos(
                    radians
                ) *
                radius;


            const y =
                Math.sin(
                    radians
                ) *
                radius;


            item.style.left =
                `${x}px`;


            item.style.top =
                `${centerY + y}px`;


            item.style.opacity =
                getOpacity(
                    relativeIndex
                );


            item.style.transform = `
                translate(
                    -50%,
                    -50%
                )
                rotate(
                    ${angle}deg
                )
            `;

        }
    );


    rightItems.forEach(
        (
            item,
            indexValue
        ) => {

            const relativeIndex =
                getRelativeIndex(
                    indexValue,
                    -projectPosition,
                    totalProjects
                );


            const angle =
                relativeIndex *
                angleStep;


            const radians =
                angle *
                Math.PI /
                180;


            const x =
                Math.cos(
                    radians
                ) *
                radius;


            const y =
                Math.sin(
                    radians
                ) *
                radius;


            item.style.left =
                `${
                    halfWidth -
                    x
                }px`;


            item.style.top =
                `${centerY + y}px`;


            item.style.opacity =
                getOpacity(
                    relativeIndex
                );


            item.style.transform = `
                translate(
                    -50%,
                    -50%
                )
                rotate(
                    ${-angle}deg
                )
            `;

        }
    );

}


function snapProject() {

    targetPosition =
        Math.round(
            targetPosition
        );

    startRender();

}


function snapMedia() {

    targetMediaPosition =
        Math.round(
            targetMediaPosition
        );

    syncVideos();

    startRender();

}


function startRender() {

    if (
        animationFrame !==
        null
    ) {

        return;

    }

    animationFrame =
        requestAnimationFrame(
            render
        );

}


function handleProjectWheel(
    event
) {

    if (isMobile()) {

        return;

    }


    event.preventDefault();


    let delta =
        event.deltaY;


    if (
        event.deltaMode ===
        1
    ) {

        delta *=
            16;

    }


    if (
        event.deltaMode ===
        2
    ) {

        delta *=
            window.innerHeight;

    }


    targetPosition -=
        delta *
        scrollSensitivity;


    const maxDelta =
        1.5;


    if (
        targetPosition -
        currentPosition >
        maxDelta
    ) {

        targetPosition =
            currentPosition +
            maxDelta;

    }


    if (
        targetPosition -
        currentPosition <
        -maxDelta
    ) {

        targetPosition =
            currentPosition -
            maxDelta;

    }


    clearTimeout(
        projectSnapTimeout
    );


    projectSnapTimeout =
        setTimeout(
            snapProject,
            snapDelay
        );


    startRender();

}


function handleMediaWheel(
    event
) {

    if (
        isMobile() ||
        !mediaArea
    ) {

        return;

    }


    const rect =
        mediaArea.getBoundingClientRect();


    const isInside =
        event.clientX >=
            rect.left &&
        event.clientX <=
            rect.right &&
        event.clientY >=
            rect.top &&
        event.clientY <=
            rect.bottom;


    if (!isInside) {

        return;

    }


    event.preventDefault();

    event.stopPropagation();


    let delta =
        event.deltaY;


    if (
        event.deltaMode ===
        1
    ) {

        delta *=
            16;

    }


    if (
        event.deltaMode ===
        2
    ) {

        delta *=
            window.innerHeight;

    }


    targetMediaPosition +=
        delta *
        mediaScrollSensitivity;


    clearTimeout(
        mediaSnapTimeout
    );


    mediaSnapTimeout =
        setTimeout(
            snapMedia,
            mediaSnapDelay
        );


    startRender();

}


function render() {

    const projectDelta =
        targetPosition -
        currentPosition;


    const mediaDelta =
        targetMediaPosition -
        currentMediaPosition;


    currentPosition +=
        projectDelta *
        smoothness;


    checkActiveProject();


    currentMediaPosition +=
        mediaDelta *
        (
            isMobile()
                ? 0.20
                : mediaSmoothness
        );


    positionWheels(
        currentPosition,
        currentMediaPosition
    );


    const projectFinished =
        Math.abs(
            targetPosition -
            currentPosition
        ) < 0.001;


    const mediaFinished =
        Math.abs(
            targetMediaPosition -
            currentMediaPosition
        ) < 0.0001;


    if (
        projectFinished &&
        mediaFinished
    ) {

        currentPosition =
            Math.round(
                targetPosition
            );


        targetPosition =
            currentPosition;


        currentMediaPosition =
            targetMediaPosition;


        positionWheels(
            currentPosition,
            currentMediaPosition
        );


        animationFrame =
            null;


        return;

    }


    animationFrame =
        requestAnimationFrame(
            render
        );

}


function toggleMenu(
    menu,
    arrow
) {

    if (!menu) {

        return;

    }


    const isOpen =
        menu.classList.contains(
            'open'
        );


    if (isOpen) {

        menu.style.height =
            `${menu.scrollHeight}px`;


        requestAnimationFrame(
            () => {

                menu.style.height =
                    '0px';

                menu.style.opacity =
                    '0';

            }
        );


        menu.classList.remove(
            'open'
        );


        if (arrow) {

            arrow.classList.remove(
                'open'
            );

        }


        menu.addEventListener(
            'transitionend',
            () => {

                menu.style.pointerEvents =
                    'none';

            },
            {
                once: true
            }
        );


        return;

    }


    menu.classList.add(
        'open'
    );


    menu.style.height =
        '0px';


    menu.style.opacity =
        '0';


    requestAnimationFrame(
        () => {

            menu.style.height =
                `${menu.scrollHeight}px`;

            menu.style.opacity =
                '1';

        }
    );


    menu.style.pointerEvents =
        'auto';


    if (arrow) {

        arrow.classList.add(
            'open'
        );

    }


    menu.addEventListener(
        'transitionend',
        () => {

            menu.style.height =
                'auto';

        },
        {
            once: true
        }
    );

}


const indexArrow =
    index
        ? index.querySelector(
            '.index-content span:last-child'
        )
        : null;


const aboutArrow =
    about
        ? about.querySelector(
            '.about-content span:last-child'
        )
        : null;


if (
    index &&
    indexMenu
) {

    index.addEventListener(
        'click',
        () => {

            toggleMenu(
                indexMenu,
                indexArrow
            );

        }
    );

}


if (
    about &&
    aboutMenu
) {

    about.addEventListener(
        'click',
        () => {

            toggleMenu(
                aboutMenu,
                aboutArrow
            );

        }
    );

}


const indexRows =
    document.querySelectorAll(
        '.index-row[data-project]'
    );


const indexToScreenProject = {

    0: 4,

    5: 1,

    4: 3,

    3: 0,

    6: 5,

    2: 6,

    1: 2

};


indexRows.forEach(
    row => {

        row.addEventListener(
            'click',
            event => {

                event.stopPropagation();


                const indexProjectIndex =
                    Number(
                        row.dataset.project
                    );


                const projectIndex =
                    indexToScreenProject[
                        indexProjectIndex
                    ];


                const totalProjects =
                    mediaGroups.length;


                if (
                    !totalProjects ||
                    projectIndex ===
                    undefined
                ) {

                    return;

                }


                const currentProject =
                    getActiveProject(
                        targetPosition
                    );


                let difference =
                    projectIndex -
                    currentProject;


                if (
                    difference >
                    totalProjects / 2
                ) {

                    difference -=
                        totalProjects;

                }


                if (
                    difference <
                    -totalProjects / 2
                ) {

                    difference +=
                        totalProjects;

                }


                targetPosition +=
                    difference;


                targetMediaPosition =
                    0;


                currentMediaPosition =
                    0;


                clearTimeout(
                    projectSnapTimeout
                );


                projectSnapTimeout =
                    setTimeout(
                        snapProject,
                        snapDelay
                    );


                startRender();

            }
        );

    }
);


let touchStartX = 0;

let touchStartY = 0;

let touchStartedOnMedia =
    false;

let touchStartedInUI =
    false;


mainElement.addEventListener(
    'touchstart',
    event => {

        if (!isMobile()) {

            return;

        }


        const target =
            event.target;

        const touch =
            event.touches[0];


        if (!touch) {

            return;

        }


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;


        touchStartedOnMedia =
            target instanceof
            Element &&
            Boolean(
                target.closest(
                    '.project-images'
                )
            );


        touchStartedInUI =
            target instanceof
            Element &&
            Boolean(
                target.closest(
                    '.index, .index-menu, .about, .about-menu'
                )
            );

    },
    {
        passive: true
    }
);


mainElement.addEventListener(
    'touchend',
    event => {

        if (
            !isMobile() ||
            touchStartedInUI
        ) {

            return;

        }


        const target =
            event.target;

        const touch =
            event.changedTouches[0];


        if (
            !touch ||
            (
                target instanceof
                Element &&
                target.closest(
                    '.index, .index-menu, .about, .about-menu'
                )
            )
        ) {

            return;

        }


        const deltaX =
            touch.clientX -
            touchStartX;


        const deltaY =
            touch.clientY -
            touchStartY;


        const distanceX =
            Math.abs(
                deltaX
            );


        const distanceY =
            Math.abs(
                deltaY
            );


        const threshold =
            50;


        if (
            Math.max(
                distanceX,
                distanceY
            ) <
            threshold
        ) {

            return;

        }


        if (
            distanceX >
            distanceY
        ) {

            if (
                !touchStartedOnMedia
            ) {

                return;

            }


            targetMediaPosition +=
                deltaX < 0
                    ? 1
                    : -1;


            syncVideos();


            clearTimeout(
                mediaSnapTimeout
            );


            mediaSnapTimeout =
                setTimeout(
                    snapMedia,
                    mediaSnapDelay
                );


            startRender();


            return;

        }


        targetPosition +=
            deltaY < 0
                ? 1
                : -1;


        clearTimeout(
            projectSnapTimeout
        );


        projectSnapTimeout =
            setTimeout(
                snapProject,
                snapDelay
            );


        startRender();

    },
    {
        passive: true
    }
);


function handleResize() {

    updateMobileIntro();

    updateMobileNeighbors(
        activeProject
    );

    syncVideos();

    positionWheels(
        currentPosition,
        currentMediaPosition
    );

}


window.addEventListener(
    'resize',
    handleResize
);


prepareVideos();

createMobileProjectInfo();

createMobileNeighbors();


activateProject(
    0
);


updateMobileIntro();


positionWheels(
    currentPosition,
    currentMediaPosition
);


if (leftWheel) {

    leftWheel.addEventListener(
        'wheel',
        handleProjectWheel,
        {
            passive: false
        }
    );

}


if (rightWheel) {

    rightWheel.addEventListener(
        'wheel',
        handleProjectWheel,
        {
            passive: false
        }
    );

}


if (mediaArea) {

    mediaArea.addEventListener(
        'wheel',
        handleMediaWheel,
        {
            passive: false
        }
    );

}