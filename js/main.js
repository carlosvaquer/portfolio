/* ============================================================
   ELEMENTS
   ============================================================ */

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


/* ============================================================
   WHEEL SETTINGS
   ============================================================ */

const radius = 300;

const angleStep = 25;

const scrollSensitivity = 0.01;

const smoothness = 0.14;

const snapDelay = 120;


/* ============================================================
   MEDIA SETTINGS
   ============================================================ */

const mediaSpacing = 350;

const mediaScale = 0.82;

const mediaBlur = 5;

const mediaScrollSensitivity = 0.005;

const mediaSmoothness = 0.14;

const mediaSnapDelay = 120;


/* ============================================================
   PROJECT STATE
   ============================================================ */

let currentPosition = 0;

let targetPosition = 0;


/* ============================================================
   MEDIA STATE
   ============================================================ */

let currentMediaPosition = 0;

let targetMediaPosition = 0;


/* ============================================================
   ANIMATION STATE
   ============================================================ */

let animationFrame = null;


/* ============================================================
   SNAP TIMERS
   ============================================================ */

let projectSnapTimeout = null;

let mediaSnapTimeout = null;


/* ============================================================
   OPACITY
   ============================================================ */

function getOpacity(distance) {

    const absDistance =
        Math.abs(distance);


    if (absDistance <= 1) {

        return 1 -
            (absDistance * 0.75);

    }


    if (absDistance <= 2) {

        return 0.25 -
            (
                (absDistance - 1) *
                0.10
            );

    }


    if (absDistance <= 3) {

        return 0.15 -
            (
                (absDistance - 2) *
                0.10
            );

    }


    return 0.05;
}


/* ============================================================
   RELATIVE POSITION
   ============================================================ */

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


/* ============================================================
   ACTIVE PROJECT
   ============================================================ */

function getActiveProject(position) {

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


/* ============================================================
   POSITION CENTER MEDIA
   ============================================================ */

function positionCenterMedia(
    projectPosition,
    mediaPosition
) {

    if (!mediaGroups.length) {

        return;

    }


    /*
     * ACTIVE PROJECT
     */

    const activeProject =
        getActiveProject(
            projectPosition
        );


    /*
     * SHOW ONLY ACTIVE GROUP
     */

    mediaGroups.forEach(
        (group, index) => {

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


    /*
     * ACTIVE GROUP
     */

    const activeGroup =
        mediaGroups[
            activeProject
        ];


    const mediaItems =
        activeGroup.querySelectorAll(
            'img, video'
        );


    const totalMedia =
        mediaItems.length;


    if (!totalMedia) {

        return;

    }


    /*
     * POSITION MEDIA
     */

    mediaItems.forEach(
        (media, index) => {

            const relativeIndex =
                getRelativeIndex(
                    index,
                    mediaPosition,
                    totalMedia
                );


            /*
             * VERTICAL POSITION
             */

            const y =
                relativeIndex *
                mediaSpacing;


            /*
             * DISTANCE FROM CENTER
             */

            const distance =
                Math.abs(
                    relativeIndex
                );


            /*
             * SCALE
             */

            const scale =
                Math.pow(
                    mediaScale,
                    distance
                );


            /*
             * OPACITY
             */

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


            /*
             * BLUR
             */

            const blur =
                distance *
                mediaBlur;


            /*
             * APPLY
             */

            media.style.transform = `
                translate(
                    -50%,
                    calc(-50% + ${y}px)
                )
                scale(${scale})
            `;


            media.style.opacity =
                opacity;


            media.style.filter =
                `blur(${blur}px)`;

        }
    );
}


/* ============================================================
   POSITION PROJECT WHEELS
   ============================================================ */

function positionWheels(
    projectPosition,
    mediaPosition
) {

    const centerY =
        leftWheel.offsetHeight /
        2;


    const viewportWidth =
        window.innerWidth;


    const halfWidth =
        viewportWidth / 2;


    const totalProjects =
        leftItems.length;


    /*
     * CENTER MEDIA
     */

    positionCenterMedia(
        projectPosition,
        mediaPosition
    );


    /*
     * ========================================================
     * LEFT WHEEL
     * ========================================================
     */

    leftItems.forEach(
        (item, index) => {

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


            item.style.transform = `
                translate(-50%, -50%)
                rotate(${angle}deg)
            `;

        }
    );


    /*
     * ========================================================
     * RIGHT WHEEL
     * ========================================================
     */

    rightItems.forEach(
        (item, index) => {

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


            item.style.transform = `
                translate(-50%, -50%)
                rotate(${-angle}deg)
            `;

        }
    );
}


/* ============================================================
   ACTIVE PROJECT TRACKING
   ============================================================ */

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

        /*
         * NEW PROJECT
         *
         * Start from first media.
         */

        currentMediaPosition = 0;

        targetMediaPosition = 0;


        previousActiveProject =
            activeProject;

    }
}


/* ============================================================
   PROJECT SNAP
   ============================================================ */

function snapProject() {

    targetPosition =
        Math.round(
            targetPosition
        );


    startRender();
}


/* ============================================================
   MEDIA SNAP
   ============================================================ */

function snapMedia() {

    targetMediaPosition =
        Math.round(
            targetMediaPosition
        );


    startRender();
}


/* ============================================================
   PROJECT SCROLL
   ============================================================ */

function handleProjectWheel(event) {

    event.preventDefault();


    let delta =
        event.deltaY;


    /*
     * NORMALIZE
     */

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


    /*
     * CONTINUOUS MOVEMENT
     */

    targetPosition -=
        delta *
        scrollSensitivity;


    /*
     * LIMIT EXTREME JUMPS
     */

    const maxDelta = 1.5;


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


    /*
     * SNAP
     */

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


/* ============================================================
   MEDIA SCROLL
   ============================================================ */

function handleMediaWheel(event) {

    const rect =
        mediaArea.getBoundingClientRect();


    /*
     * ONLY THE CENTRAL RECTANGLE
     */

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


    /*
     * NORMALIZE
     */

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


    /*
     * CONTINUOUS MOVEMENT
     *
     * Scroll down = media down
     */

    targetMediaPosition +=
        delta *
        mediaScrollSensitivity;


    startRender();


    /*
     * SNAP
     */

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


/* ============================================================
   RENDER LOOP
   ============================================================ */

function render() {

    /*
     * ========================================================
     * PROJECT
     * ========================================================
     */

    currentPosition +=
        (
            targetPosition -
            currentPosition
        ) *
        smoothness;


    /*
     * ========================================================
     * CHECK PROJECT CHANGE
     * ========================================================
     */

    checkActiveProject();


    /*
     * ========================================================
     * MEDIA
     * ========================================================
     */

    currentMediaPosition +=
        (
            targetMediaPosition -
            currentMediaPosition
        ) *
        mediaSmoothness;


    /*
     * ========================================================
     * RENDER EVERYTHING
     * ========================================================
     */

    positionWheels(
        currentPosition,
        currentMediaPosition
    );


    /*
     * ========================================================
     * PROJECT FINISHED
     * ========================================================
     */

    const projectFinished =
        Math.abs(
            targetPosition -
            currentPosition
        ) < 0.001;


    /*
     * ========================================================
     * MEDIA FINISHED
     * ========================================================
     */

    const mediaFinished =
        Math.abs(
            targetMediaPosition -
            currentMediaPosition
        ) < 0.0001;


    /*
     * ========================================================
     * STOP ANIMATION
     * ========================================================
     */

    if (
        projectFinished &&
        mediaFinished
    ) {

        /*
         * PROJECT
         */

        currentPosition =
            Math.round(
                targetPosition
            );


        targetPosition =
            currentPosition;


        /*
         * MEDIA
         *
         * Do not force another visible jump.
         * Keep the snapped target position.
         */

        currentMediaPosition =
            targetMediaPosition;


        /*
         * FINAL RENDER
         */

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


/* ============================================================
   START RENDER
   ============================================================ */

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


/* ============================================================
   PROJECT WHEEL EVENTS
   ============================================================ */

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


/* ============================================================
   MEDIA EVENTS
   ============================================================ */

mediaArea.addEventListener(
    'wheel',
    handleMediaWheel,
    {
        passive: false
    }
);


/* ============================================================
   INITIAL POSITION
   ============================================================ */

positionWheels(
    currentPosition,
    currentMediaPosition
);


/* ============================================================
   RESPONSIVE
   ============================================================ */

window.addEventListener(
    'resize',
    () => {

        positionWheels(
            currentPosition,
            currentMediaPosition
        );

    }
);


/* ============================================================
   INDEX MENU
   ============================================================ */

const index =
    document.querySelector('.index');

const indexMenu =
    document.querySelector('.index-menu');

const indexArrow =
    index.querySelector(
        '.index-content span:last-child'
    );


/*
 * INDEX CLICK
 */

index.addEventListener(
    'click',
    () => {

        const isOpen =
            indexMenu.classList.contains(
                'open'
            );


        /*
         * ====================================================
         * CLOSE
         * ====================================================
         */

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


            indexArrow.classList.remove(
                'open'
            );


            indexMenu.addEventListener(
                'transitionend',
                () => {

                    indexMenu.style.pointerEvents =
                        'none';

                },
                {
                    once: true
                }
            );


        /*
         * ====================================================
         * OPEN
         * ====================================================
         */

        } else {

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


            indexArrow.classList.add(
                'open'
            );


            indexMenu.addEventListener(
                'transitionend',
                () => {

                    indexMenu.style.height =
                        'auto';

                },
                {
                    once: true
                }
            );

        }

    }
);


/* ============================================================
   ABOUT MENU
   ============================================================ */

const about =
    document.querySelector('.about');

const aboutMenu =
    document.querySelector('.about-menu');

const aboutArrow =
    about.querySelector(
        '.about-content span:last-child'
    );


/*
 * ABOUT CLICK
 */

about.addEventListener(
    'click',
    () => {

        const isOpen =
            aboutMenu.classList.contains(
                'open'
            );


        /*
         * ====================================================
         * CLOSE
         * ====================================================
         */

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


            aboutArrow.classList.remove(
                'open'
            );


            aboutMenu.addEventListener(
                'transitionend',
                () => {

                    aboutMenu.style.pointerEvents =
                        'none';

                },
                {
                    once: true
                }
            );


        /*
         * ====================================================
         * OPEN
         * ====================================================
         */

        } else {

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


            aboutArrow.classList.add(
                'open'
            );


            aboutMenu.addEventListener(
                'transitionend',
                () => {

                    aboutMenu.style.height =
                        'auto';

                },
                {
                    once: true
                }
            );

        }

    }
);


/* ============================================================
   INDEX PROJECT NAVIGATION
   ============================================================ */

const indexRows = document.querySelectorAll(
    '.index-row[data-project]'
);

indexRows.forEach((row) => {

    row.addEventListener('click', (event) => {

        event.stopPropagation();

        const projectIndex =
            Number(row.dataset.project);

        const totalProjects =
            mediaGroups.length;

        if (!totalProjects) {
            return;
        }


        /*
         * CURRENT PROJECT
         */
        const currentProject =
            getActiveProject(
                targetPosition
            );


        /*
         * SHORTEST DISTANCE
         * THROUGH THE INFINITE LOOP
         */
        let difference =
            projectIndex - currentProject;


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


        /*
         * START POSITION
         */
        const startPosition =
            currentPosition;


        /*
         * FINAL POSITION
         */
        const finalPosition =
            targetPosition + difference;


        /*
         * MOMENTUM ANIMATION
         */
        const duration = 750;

        const startTime =
            performance.now();


        function animateToProject(time) {

            const elapsed =
                time - startTime;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
             * EASE IN OUT
             *
             * slow → fast → slow
             */
            const eased =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 -
                      Math.pow(
                          -2 * progress + 2,
                          3
                      ) / 2;


            targetPosition =
                startPosition +
                (
                    finalPosition -
                    startPosition
                ) *
                eased;


            /*
             * RESET MEDIA
             */
            targetMediaPosition = 0;
            currentMediaPosition = 0;


            startRender();


            if (progress < 1) {

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

    });

});