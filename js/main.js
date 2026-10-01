const mainElement =
    document.querySelector('main');

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

let currentPosition = 0;

let targetPosition = 0;

let currentMediaPosition = 0;

let targetMediaPosition = 0;

let animationFrame = null;

let projectSnapTimeout = null;

let mediaSnapTimeout = null;


/* CACHE DE MEDIA */

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
        media =>
            media.filter(
                item =>
                    item.tagName === 'VIDEO'
            )
    );

let previousVideoProject = -1;

let previousVideoMedia = -1;


/* UTILIDADES DE MEDIA */

function getCenteredMediaIndex(
    position,
    totalMedia
) {

    if (!totalMedia) {
        return 0;
    }

    let index =
        Math.round(position);

    index =
        (
            (
                index %
                totalMedia
            ) +
            totalMedia
        ) %
        totalMedia;

    return index;
}


function prepareMainVideos() {

    videosByProject.forEach(
        videos => {

            videos.forEach(
                video => {

                    video.muted = true;

                    video.loop = true;

                    video.playsInline = true;

                    video.removeAttribute(
                        'autoplay'
                    );

                    video.preload = 'none';

                    video.pause();

                }
            );

        }
    );

}


function pauseAllMainVideos() {

    videosByProject.forEach(
        videos => {

            videos.forEach(
                video => {

                    video.pause();

                }
            );

        }
    );

}


function playVideo(video) {

    if (!video) {
        return;
    }

    video.muted = true;

    video.loop = true;

    video.playsInline = true;

    video.preload = 'auto';

    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        video.load();

    }

    video.play().catch(
        () => {}
    );

}


function syncMainVideos(
    projectIndex,
    mediaIndex
) {

    const isMobile =
        window.innerWidth <= 768;

    if (
        isMobile &&
        projectIndex ===
            previousVideoProject &&
        mediaIndex ===
            previousVideoMedia
    ) {

        return;

    }

    if (
        !isMobile &&
        projectIndex ===
            previousVideoProject
    ) {

        return;

    }

    previousVideoProject =
        projectIndex;

    previousVideoMedia =
        mediaIndex;

    pauseAllMainVideos();

    if (isMobile) {

        const media =
            mediaByProject[
                projectIndex
            ]?.[
                mediaIndex
            ];

        if (
            media &&
            media.tagName ===
                'VIDEO'
        ) {

            playVideo(media);

        }

        return;

    }

    const videos =
        videosByProject[
            projectIndex
        ] || [];

    videos.forEach(
        video => {

            playVideo(video);

        }
    );

}


/* PRELOAD DOS PROYECTOS COLINDANTES */

function primeMobilePreviewProject(
    projectIndex
) {

    if (
        window.innerWidth >
        768
    ) {

        return;

    }

    const media =
        mediaByProject[
            projectIndex
        ];

    if (!media) {
        return;
    }

    media
        .slice(
            0,
            3
        )
        .forEach(
            source => {

                if (
                    source.tagName ===
                    'IMG'
                ) {

                    source.loading =
                        'eager';

                    source.decoding =
                        'async';

                    return;

                }

                source.muted =
                    true;

                source.loop =
                    true;

                source.playsInline =
                    true;

                source.removeAttribute(
                    'autoplay'
                );

                source.preload =
                    'auto';

                if (
                    source.networkState ===
                    HTMLMediaElement
                        .NETWORK_EMPTY
                ) {

                    source.load();

                }

            }
        );

}


/* PRELOAD DEL SIGUIENTE VIDEO */

function primeMobileProjectAhead(
    projectIndex
) {

    if (
        window.innerWidth >
        768
    ) {

        return;

    }

    const media =
        mediaByProject[
            projectIndex
        ];

    if (!media) {
        return;
    }

    const firstVideo =
        media.find(
            item =>
                item.tagName ===
                'VIDEO'
        );

    if (!firstVideo) {
        return;
    }

    firstVideo.muted =
        true;

    firstVideo.loop =
        true;

    firstVideo.playsInline =
        true;

    firstVideo.removeAttribute(
        'autoplay'
    );

    firstVideo.preload =
        'auto';

    if (
        firstVideo.networkState ===
        HTMLMediaElement
            .NETWORK_EMPTY
    ) {

        firstVideo.load();

    }

}


/* PROYECTOS */

function getActiveProject(
    position
) {

    const totalProjects =
        mediaGroups.length;

    if (!totalProjects) {
        return 0;
    }

    let index =
        Math.round(position);

    index =
        (
            (
                index %
                totalProjects
            ) +
            totalProjects
        ) %
        totalProjects;

    return index;

}


function getRelativeIndex(
    index,
    position,
    totalItems
) {

    let relativeIndex =
        index - position;

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
        Math.abs(distance);

    if (
        absDistance <= 1
    ) {

        return (
            1 -
            (
                absDistance *
                0.75
            )
        );

    }

    if (
        absDistance <= 2
    ) {

        return (
            0.25 -
            (
                (
                    absDistance - 1
                ) *
                0.10
            )
        );

    }

    if (
        absDistance <= 3
    ) {

        return (
            0.15 -
            (
                (
                    absDistance - 2
                ) *
                0.10
            )
        );

    }

    return 0.05;

}


/* INFORMACION MOBILE */

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


let mobileProjectInfo =
    null;

let mobileNeighborLayer =
    null;

let mobilePreviousNeighbor =
    null;

let mobileNextNeighbor =
    null;


/* INFO DEL PROYECTO ACTIVO */

function createMobileProjectInfo() {

    mobileProjectInfo =
        document.createElement('div');

    mobileProjectInfo.className =
        'mobile-project-info';

    const copy =
        document.createElement('div');

    copy.className =
        'mobile-project-copy';

    const title =
        document.createElement('span');

    title.className =
        'mobile-project-title';

    const category =
        document.createElement('span');

    category.className =
        'mobile-project-category';

    const year =
        document.createElement('span');

    year.className =
        'mobile-project-year';

    const wip =
        document.createElement('span');

    wip.className =
        'mobile-project-wip';

    copy.appendChild(title);

    copy.appendChild(category);

    copy.appendChild(year);

    copy.appendChild(wip);


    const link =
        document.createElement('a');

    link.className =
        'mobile-project-link project-link';

    link.textContent =
        'View Site';

    link.target =
        '_blank';

    link.rel =
        'noopener noreferrer';


    mobileProjectInfo.appendChild(
        copy
    );

    mobileProjectInfo.appendChild(
        link
    );

    mainElement.appendChild(
        mobileProjectInfo
    );

}


function updateMobileProjectInfo(
    projectIndex
) {

    if (!mobileProjectInfo) {
        return;
    }

    const project =
        mobileProjectData[
            projectIndex
        ];

    if (!project) {
        return;
    }

    const title =
        mobileProjectInfo.querySelector(
            '.mobile-project-title'
        );

    const category =
        mobileProjectInfo.querySelector(
            '.mobile-project-category'
        );

    const year =
        mobileProjectInfo.querySelector(
            '.mobile-project-year'
        );

    const wip =
        mobileProjectInfo.querySelector(
            '.mobile-project-wip'
        );

    const link =
        mobileProjectInfo.querySelector(
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

    link.href =
        project.url ||
        '#';

}


/* VECINOS */

function createMobileNeighbor(
    position
) {

    const neighbor =
        document.createElement('div');

    neighbor.className =
        `mobile-neighbor mobile-neighbor-${position}`;


    const media =
        document.createElement('div');

    media.className =
        'mobile-neighbor-media';


    const title =
        document.createElement('span');

    title.className =
        'mobile-neighbor-title';


    neighbor.appendChild(
        media
    );

    neighbor.appendChild(
        title
    );

    mobileNeighborLayer.appendChild(
        neighbor
    );


    return {
        element:
            neighbor,

        media:
            media,

        title:
            title,

        project:
            null
    };

}


function setMobileNeighbor(
    neighbor,
    projectIndex
) {

    if (
        !neighbor ||
        neighbor.project ===
            projectIndex
    ) {

        return;

    }

    const media =
        mediaByProject[
            projectIndex
        ];

    const project =
        mobileProjectData[
            projectIndex
        ];

    if (
        !media ||
        !project
    ) {

        return;

    }


    neighbor.media.innerHTML =
        '';

    neighbor.project =
        projectIndex;

    neighbor.title.textContent =
        project.title;

    neighbor.element.style.left = '50%';
    neighbor.element.style.transform = 'translateX(-50%)';


    const mobileSpacing =
        Math.min(
            280,
            window.innerWidth *
            0.72
        );


    const previewMedia =
        media.slice(
            0,
            3
        );


    previewMedia.forEach(
        (
            source,
            index
        ) => {

            const clone =
                source.cloneNode(
                    true
                );

            clone.classList.add(
                'mobile-neighbor-preview'
            );

            clone.removeAttribute(
                'id'
            );


            const isVideo =
                clone.tagName ===
                'VIDEO';


            if (isVideo) {

                clone.muted =
                    true;

                clone.loop =
                    true;

                clone.playsInline =
                    true;

                clone.removeAttribute(
                    'autoplay'
                );

                clone.autoplay =
                    false;

                clone.preload =
                    'auto';

                clone.setAttribute(
                    'muted',
                    ''
                );

                clone.setAttribute(
                    'loop',
                    ''
                );

                clone.setAttribute(
                    'playsinline',
                    ''
                );

            } else {

                clone.loading =
                    'eager';

                clone.decoding =
                    'async';

            }


            let relativeIndex =
                0;


            if (index === 1) {

                relativeIndex =
                    1;

            }


            if (index === 2) {

                relativeIndex =
                    -1;

            }


            const x =
                relativeIndex *
                mobileSpacing;


            const distance =
                Math.abs(
                    relativeIndex
                );


            const scale =
                distance === 0
                    ? 1
                    : 0.82;


            clone.style.position =
                'absolute';

            clone.style.left = '50%';
            clone.style.top = '50%';



            clone.style.width =
                'auto';

            clone.style.height =
                '100%';

            clone.style.maxWidth =
                'none';

            clone.style.objectFit =
                'contain';

            clone.style.transform =
                `
                    translate(
                        calc(-50% + ${x}px),
                        -50%
                    )
                    scale(${scale})
                `;


            clone.style.opacity =
                distance === 0
                    ? '0.8'
                    : '0.45';


            clone.style.filter =
                'none';

            clone.style.zIndex =
                distance === 0
                    ? '3'
                    : '1';


            clone.style.pointerEvents =
                'none';


            neighbor.media.appendChild(
                clone
            );


            if (!isVideo) {

                return;

            }


            /* SOLO EL VIDEO CENTRAL SE MUEVE */

            if (index === 0) {

                const startPreview =
                    () => {

                        clone
                            .play()
                            .catch(
                                () => {}
                            );

                    };


                if (
                    clone.readyState >=
                    HTMLMediaElement
                        .HAVE_CURRENT_DATA
                ) {

                    startPreview();

                } else {

                    clone.addEventListener(
                        'loadeddata',
                        startPreview,
                        {
                            once:
                                true
                        }
                    );

                }


                clone.load();

                startPreview();

                return;

            }


            /* LOS VIDEOS LATERALES SOLO CARGAN METADATA */

            clone.preload =
                'metadata';

            clone.pause();

            clone.load();

        }
    );

}


/* ACTUALIZAR VECINOS */

function updateMobileNeighbors(
    position
) {

    if (
        window.innerWidth > 768 ||
        !mobileNeighborLayer ||
        !mediaGroups.length
    ) {

        return;

    }


    const totalProjects =
        mediaGroups.length;


    const activeProject =
        getActiveProject(
            position
        );


    const previousProject =
        (
            activeProject -
            1 +
            totalProjects
        ) %
        totalProjects;


    const nextProject =
        (
            activeProject +
            1
        ) %
        totalProjects;


    const previousPreviousProject =
        (
            previousProject -
            1 +
            totalProjects
        ) %
        totalProjects;


    const nextNextProject =
        (
            nextProject +
            1
        ) %
        totalProjects;


    /* LOS DOS VECINOS YA SE PREPARAN */

    primeMobilePreviewProject(
        previousProject
    );

    primeMobilePreviewProject(
        nextProject
    );


    /* Y TAMBIEN SUS SIGUIENTES VIDEOS */

    primeMobileProjectAhead(
        previousPreviousProject
    );

    primeMobileProjectAhead(
        nextNextProject
    );


    setMobileNeighbor(
        mobilePreviousNeighbor,
        previousProject
    );

    setMobileNeighbor(
        mobileNextNeighbor,
        nextProject
    );

}


/* CREAR CAPA DE VECINOS */

function createMobileNeighbors() {

    mobileNeighborLayer =
        document.createElement('div');

    mobileNeighborLayer.className =
        'mobile-neighbor-layer';


    projectsArea.appendChild(
        mobileNeighborLayer
    );


    mobilePreviousNeighbor =
        createMobileNeighbor(
            'previous'
        );


    mobileNextNeighbor =
        createMobileNeighbor(
            'next'
        );

}


createMobileProjectInfo();

createMobileNeighbors();


/* INTRO */

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


const desktopIntroTitle =
    'Carlos Vaquer';

const desktopIntroDescription =
    'Web developer and designer focused on custom digital experiences.';


const mobileIntroTitle =
    'Carlos Vaquer';

const mobileIntroDescription =
    'Websites & Design';


function updateMobileIntro() {

    if (
        !introTitle ||
        !introDescription
    ) {

        return;

    }


    const isMobile =
        window.innerWidth <= 768;


    if (isMobile) {

        introTitle.textContent =
            mobileIntroTitle;

        introDescription.textContent =
            mobileIntroDescription;

    } else {

        introTitle.textContent =
            desktopIntroTitle;

        introDescription.textContent =
            desktopIntroDescription;

    }

}


/* MEDIA CENTRAL */

function positionCenterMedia(
    projectPosition,
    mediaPosition
) {

    if (!mediaGroups.length) {
        return;
    }


    const activeProject =
        getActiveProject(
            projectPosition
        );


    mediaGroups.forEach(
        (
            group,
            index
        ) => {

            if (
                index ===
                activeProject
            ) {

                group.classList.add(
                    'active'
                );

            } else {

                group.classList.remove(
                    'active'
                );

            }

        }
    );


    const activeGroup =
        mediaGroups[
            activeProject
        ];


    if (!activeGroup) {
        return;
    }


    const mediaItems =
        mediaByProject[
            activeProject
        ] || [];


    const totalMedia =
        mediaItems.length;


    if (!totalMedia) {
        return;
    }


    const isMobile =
        window.innerWidth <= 768;


    const centeredMediaIndex =
        getCenteredMediaIndex(
            isMobile
                ? targetMediaPosition
                : mediaPosition,
            totalMedia
        );


    syncMainVideos(
        activeProject,
        centeredMediaIndex
    );


    const mobileSpacing =
        Math.min(
            280,
            window.innerWidth *
            0.72
        );


    const mobileVisualPosition =
        Math.round(
            targetMediaPosition
        );


    mediaItems.forEach(
        (
            media,
            index
        ) => {

            const relativeIndex =
                getRelativeIndex(
                    index,
                    mediaPosition,
                    totalMedia
                );


            const visualRelativeIndex =
                isMobile
                    ? getRelativeIndex(
                        index,
                        mobileVisualPosition,
                        totalMedia
                    )
                    : relativeIndex;


            const distance =
                Math.abs(
                    visualRelativeIndex
                );


            const scale =
                Math.pow(
                    mediaScale,
                    distance
                );


            if (isMobile) {

                const x =
                    relativeIndex *
                    mobileSpacing;


                const isActive =
                    distance === 0;


                const opacity =
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


                const blur =
                    isActive
                        ? 'none'
                        : `blur(${
                            distance *
                            mediaBlur
                        }px)`;


                media.style.transform =
                    `
                        translate(
                            calc(
                                -50% +
                                ${x}px
                            ),
                            -50%
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
                    opacity;


                media.style.filter =
                    blur;


                media.style.zIndex =
                    isActive
                        ? '3'
                        : '1';


                return;

            }


            const y =
                relativeIndex *
                mediaSpacing;


            const opacity =
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


            const blur =
                distance *
                mediaBlur;


            media.style.transform =
                `
                    translate(
                        -50%,
                        calc(
                            -50% +
                            ${y}px
                        )
                    )
                    scale(
                        ${scale}
                    )
                `;


            media.style.opacity =
                opacity;


            media.style.filter =
                `blur(${blur}px)`;

        }
    );

}


/* RUEDAS */

function positionWheels(
    projectPosition,
    mediaPosition
) {

    const isMobile =
        window.innerWidth <= 768;


    positionCenterMedia(
        projectPosition,
        mediaPosition
    );


    if (isMobile) {
        return;
    }


    const centerY =
        leftWheel.offsetHeight / 2;


    const viewportWidth =
        window.innerWidth;


    const halfWidth =
        viewportWidth / 2;


    const totalProjects =
        leftItems.length;


    leftItems.forEach(
        (
            item,
            index
        ) => {

            const relativeIndex =
                getRelativeIndex(
                    index,
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


            const opacity =
                getOpacity(
                    relativeIndex
                );


            item.style.left =
                `${x}px`;


            item.style.top =
                `${centerY + y}px`;


            item.style.opacity =
                opacity;


            item.style.transform =
                `
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
            index
        ) => {

            const relativeIndex =
                getRelativeIndex(
                    index,
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


            const opacity =
                getOpacity(
                    relativeIndex
                );


            item.style.left =
                `${halfWidth - x}px`;


            item.style.top =
                `${centerY + y}px`;


            item.style.opacity =
                opacity;


            item.style.transform =
                `
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


/* CAMBIO DE PROYECTO */

let previousActiveProject =
    getActiveProject(
        currentPosition
    );


function checkActiveProject() {

    const activeProject =
        getActiveProject(
            currentPosition
        );


    if (
        activeProject !==
        previousActiveProject
    ) {

        currentMediaPosition =
            0;

        targetMediaPosition =
            0;


        previousActiveProject =
            activeProject;


        updateMobileProjectInfo(
            activeProject
        );


        updateMobileNeighbors(
            activeProject
        );


        syncMainVideos(
            activeProject,
            0
        );

    }

}


/* SNAP */

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

    startRender();

}


/* WHEEL DE PROYECTOS */

function handleProjectWheel(
    event
) {

    event.preventDefault();


    let delta =
        event.deltaY;


    if (
        event.deltaMode === 1
    ) {

        delta *= 16;

    }


    if (
        event.deltaMode === 2
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


    startRender();


    clearTimeout(
        projectSnapTimeout
    );


    projectSnapTimeout =
        setTimeout(
            () => {

                snapProject();

            },
            snapDelay
        );

}


/* WHEEL DE MEDIA */

function handleMediaWheel(
    event
) {

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
        event.deltaMode === 1
    ) {

        delta *= 16;

    }


    if (
        event.deltaMode === 2
    ) {

        delta *=
            window.innerHeight;

    }


    targetMediaPosition +=
        delta *
        mediaScrollSensitivity;


    startRender();


    clearTimeout(
        mediaSnapTimeout
    );


    mediaSnapTimeout =
        setTimeout(
            () => {

                snapMedia();

            },
            mediaSnapDelay
        );

}


/* RENDER */

function render() {

    currentPosition +=
        (
            targetPosition -
            currentPosition
        ) *
        smoothness;


    checkActiveProject();


    currentMediaPosition +=
        (
            targetMediaPosition -
            currentMediaPosition
        ) *
        mediaSmoothness;


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


/* ARRANCAR RENDER */

function startRender() {

    if (
        animationFrame !== null
    ) {

        return;

    }


    animationFrame =
        requestAnimationFrame(
            render
        );

}


/* EVENTOS */

leftWheel.addEventListener(
    'wheel',
    handleProjectWheel,
    {
        passive: false
    }
);


rightWheel.addEventListener(
    'wheel',
    handleProjectWheel,
    {
        passive: false
    }
);


mediaArea.addEventListener(
    'wheel',
    handleMediaWheel,
    {
        passive: false
    }
);


/* INDEX */

const indexArrow =
    index.querySelector(
        '.index-content span:last-child'
    );


index.addEventListener(
    'click',
    () => {

        const isOpen =
            indexMenu.classList.contains(
                'open'
            );


        if (isOpen) {

            indexMenu.style.height =
                `${indexMenu.scrollHeight}px`;


            requestAnimationFrame(
                () => {

                    indexMenu.style.height =
                        '0px';

                    indexMenu.style.opacity =
                        '0';

                }
            );


            indexMenu.classList.remove(
                'open'
            );


            if (indexArrow) {

                indexArrow.classList.remove(
                    'open'
                );

            }


            indexMenu.addEventListener(
                'transitionend',
                () => {

                    indexMenu.style.pointerEvents =
                        'none';

                },
                {
                    once:
                        true
                }
            );


            return;

        }


        indexMenu.classList.add(
            'open'
        );


        indexMenu.style.height =
            '0px';

        indexMenu.style.opacity =
            '0';


        requestAnimationFrame(
            () => {

                indexMenu.style.height =
                    `${indexMenu.scrollHeight}px`;

                indexMenu.style.opacity =
                    '1';

            }
        );


        indexMenu.style.pointerEvents =
            'auto';


        if (indexArrow) {

            indexArrow.classList.add(
                'open'
            );

        }


        indexMenu.addEventListener(
            'transitionend',
            () => {

                indexMenu.style.height =
                    'auto';

            },
            {
                once:
                    true
            }
        );

    }
);


/* ABOUT */

const aboutArrow =
    about.querySelector(
        '.about-content span:last-child'
    );


about.addEventListener(
    'click',
    () => {

        const isOpen =
            aboutMenu.classList.contains(
                'open'
            );


        if (isOpen) {

            aboutMenu.style.height =
                `${aboutMenu.scrollHeight}px`;


            requestAnimationFrame(
                () => {

                    aboutMenu.style.height =
                        '0px';

                    aboutMenu.style.opacity =
                        '0';

                }
            );


            aboutMenu.classList.remove(
                'open'
            );


            if (aboutArrow) {

                aboutArrow.classList.remove(
                    'open'
                );

            }


            aboutMenu.addEventListener(
                'transitionend',
                () => {

                    aboutMenu.style.pointerEvents =
                        'none';

                },
                {
                    once:
                        true
                }
            );


            return;

        }


        aboutMenu.classList.add(
            'open'
        );


        aboutMenu.style.height =
            '0px';

        aboutMenu.style.opacity =
            '0';


        requestAnimationFrame(
            () => {

                aboutMenu.style.height =
                    `${aboutMenu.scrollHeight}px`;

                aboutMenu.style.opacity =
                    '1';

            }
        );


        aboutMenu.style.pointerEvents =
            'auto';


        if (aboutArrow) {

            aboutArrow.classList.add(
                'open'
            );

        }


        aboutMenu.addEventListener(
            'transitionend',
            () => {

                aboutMenu.style.height =
                    'auto';

            },
            {
                once:
                    true
            }
        );

    }
);


/* TOUCH MOBILE */

let touchStartX = 0;

let touchStartY = 0;

let touchStartedOnMedia =
    false;


mainElement.addEventListener(
    'touchstart',
    event => {

        if (
            window.innerWidth >
            768
        ) {

            return;

        }


        const target =
            event.target;


        if (
            target.closest(
                '.index, .index-menu, .about, .about-menu'
            )
        ) {

            touchStartedOnMedia =
                false;

            return;

        }


        const touch =
            event.touches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;


        touchStartedOnMedia =
            Boolean(
                target.closest(
                    '.project-images'
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
            window.innerWidth >
            768
        ) {

            return;

        }


        const target =
            event.target;


        if (
            target.closest(
                '.index, .index-menu, .about, .about-menu'
            )
        ) {

            return;

        }


        const touch =
            event.changedTouches[0];


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


        /* SWIPE HORIZONTAL = MEDIA */

        if (
            distanceX >
            distanceY
        ) {

            if (
                !touchStartedOnMedia
            ) {

                return;

            }


            if (
                deltaX < 0
            ) {

                targetMediaPosition +=
                    1;

            } else {

                targetMediaPosition -=
                    1;

            }


            clearTimeout(
                mediaSnapTimeout
            );


            mediaSnapTimeout =
                setTimeout(
                    () => {

                        snapMedia();

                    },
                    mediaSnapDelay
                );


            startRender();

            return;

        }


        /* SWIPE VERTICAL = PROYECTO */

        if (
            deltaY < 0
        ) {

            targetPosition +=
                1;

        } else {

            targetPosition -=
                1;

        }


        clearTimeout(
            projectSnapTimeout
        );


        projectSnapTimeout =
            setTimeout(
                () => {

                    snapProject();

                },
                snapDelay
            );


        startRender();

    },
    {
        passive: true
    }
);


/* MAPEO DEL INDEX */

const indexToScreenProject = {

    0: 4,

    5: 1,

    4: 3,

    3: 0,

    6: 5,

    2: 6,

    1: 2

};


const indexRows =
    document.querySelectorAll(
        '.index-row[data-project]'
    );


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


                const startPosition =
                    currentPosition;


                const finalPosition =
                    targetPosition +
                    difference;


                const duration =
                    750;


                const startTime =
                    performance.now();


                function animateToProject(
                    time
                ) {

                    const elapsed =
                        time -
                        startTime;


                    const progress =
                        Math.min(
                            elapsed /
                            duration,
                            1
                        );


                    const eased =
                        progress < 0.5

                            ? 4 *
                              progress *
                              progress *
                              progress

                            : 1 -
                              Math.pow(
                                  -2 *
                                  progress +
                                  2,
                                  3
                              ) /
                              2;


                    targetPosition =
                        startPosition +
                        (
                            finalPosition -
                            startPosition
                        ) *
                        eased;


                    targetMediaPosition =
                        0;


                    currentMediaPosition =
                        0;


                    startRender();


                    if (
                        progress < 1
                    ) {

                        requestAnimationFrame(
                            animateToProject
                        );

                    } else {

                        targetPosition =
                            finalPosition;

                    }

                }


                requestAnimationFrame(
                    animateToProject
                );

            }
        );

    }
);


/* INICIO */

prepareMainVideos();

updateMobileIntro();


updateMobileProjectInfo(
    getActiveProject(
        currentPosition
    )
);


updateMobileNeighbors(
    currentPosition
);


positionWheels(
    currentPosition,
    currentMediaPosition
);


/* RESIZE */

window.addEventListener(
    'resize',
    () => {

        updateMobileIntro();


        previousVideoProject =
            -1;


        previousVideoMedia =
            -1;


        prepareMainVideos();


        const resizedProject =
            getActiveProject(
                targetPosition
            );


        const resizedMediaCount =
            (
                mediaByProject[
                    resizedProject
                ] || []
            ).length;


        syncMainVideos(
            resizedProject,
            getCenteredMediaIndex(
                targetMediaPosition,
                resizedMediaCount
            )
        );


        updateMobileNeighbors(
            targetPosition
        );


        positionWheels(
            currentPosition,
            currentMediaPosition
        );

    }
);