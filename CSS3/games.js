// ==========================================
// عناصر الصفحة
// ==========================================

const openMinecraftBtn =
    document.getElementById(
        "openMinecraftBtn"
    );


const browseGamesBtn =
    document.getElementById(
        "browseGamesBtn"
    );


const minecraftDashboardBtn =
    document.getElementById(
        "minecraftDashboardBtn"
    );


const minecraftInfoBtn =
    document.getElementById(
        "minecraftInfoBtn"
    );


const gameSearch =
    document.getElementById(
        "gameSearch"
    );


const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


const gameCards =
    document.querySelectorAll(
        ".game-card"
    );


const openGameButtons =
    document.querySelectorAll(
        ".open-game-btn"
    );


const noGamesMessage =
    document.getElementById(
        "noGamesMessage"
    );


const lastOpenedProject =
    document.getElementById(
        "lastOpenedProject"
    );


const continueBtn =
    document.getElementById(
        "continueBtn"
    );


const backBtn =
    document.getElementById(
        "backBtn"
    );


// ==========================================
// الإحصائيات
// ==========================================

const projectsCount =
    document.getElementById(
        "projectsCount"
    );


const developmentCount =
    document.getElementById(
        "developmentCount"
    );


const plannedCount =
    document.getElementById(
        "plannedCount"
    );


// ==========================================
// الحالة
// ==========================================

let activeFilter =
    "all";


let lastProjectPage =
    null;


// ==========================================
// فتح صفحة
// ==========================================

function openPage(
    page
) {

    window.location.href =
        page;

}


// ==========================================
// تسجيل آخر مشروع
// ==========================================

function saveLastProject(
    name,
    page
) {

    const project = {

        name:
            name,

        page:
            page,

        date:
            new Date()
                .toLocaleString(
                    "ar-SA"
                )

    };


    localStorage.setItem(

        "vertexGamesLastProject",

        JSON.stringify(
            project
        )

    );


    loadLastProject();

}


// ==========================================
// تحميل آخر مشروع
// ==========================================

function loadLastProject() {

    const saved =
        localStorage.getItem(
            "vertexGamesLastProject"
        );


    if (
        !saved
    ) {

        lastOpenedProject.textContent =
            "لم يتم فتح مشروع من هذه الصفحة بعد.";


        continueBtn.disabled =
            true;


        lastProjectPage =
            null;


        return;

    }


    try {

        const project =
            JSON.parse(
                saved
            );


        lastProjectPage =
            project.page;


        lastOpenedProject.textContent =
            project.name +
            " — آخر فتح: " +
            project.date;


        continueBtn.disabled =
            false;

    }

    catch (
        error
    ) {

        localStorage.removeItem(
            "vertexGamesLastProject"
        );


        lastProjectPage =
            null;


        continueBtn.disabled =
            true;

    }

}


// ==========================================
// زر Minecraft في Hero
// ==========================================

openMinecraftBtn.addEventListener(

    "click",

    function () {

        saveLastProject(
            "Minecraft Rell X1000",
            "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
        );


        openPage(
            "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
        );

    }

);


// ==========================================
// زر لوحة Minecraft
// ==========================================

minecraftDashboardBtn.addEventListener(

    "click",

    function () {

        saveLastProject(
            "Minecraft Rell X1000",
            "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
        );


        openPage(
            "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
        );

    }

);


// ==========================================
// معلومات Minecraft
// ==========================================

minecraftInfoBtn.addEventListener(

    "click",

    function () {

        document
            .getElementById(
                "minecraftInfoSection"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }

);


// ==========================================
// عرض الألعاب
// ==========================================

browseGamesBtn.addEventListener(

    "click",

    function () {

        document
            .getElementById(
                "gamesSection"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }

);


// ==========================================
// فتح مشروع من البطاقة
// ==========================================

openGameButtons.forEach(

    function (
        button
    ) {

        button.addEventListener(

            "click",

            function () {

                const page =
                    button.dataset.page;


                const card =
                    button.closest(
                        ".game-card"
                    );


                const gameTitle =
                    card
                        .querySelector(
                            "h3"
                        )
                        .textContent
                        .trim();


                saveLastProject(
                    gameTitle,
                    page
                );


                openPage(
                    page
                );

            }

        );

    }

);


// ==========================================
// متابعة آخر مشروع
// ==========================================

continueBtn.addEventListener(

    "click",

    function () {

        if (
            !lastProjectPage
        ) {

            return;

        }


        openPage(
            lastProjectPage
        );

    }

);


// ==========================================
// البحث والفلاتر
// ==========================================

function filterGames() {

    const searchText =
        gameSearch
            .value
            .trim()
            .toLowerCase();


    let visibleGames =
        0;


    gameCards.forEach(

        function (
            card
        ) {

            const gameName =
                card.dataset.name
                    .toLowerCase();


            const gameStatus =
                card.dataset.status;


            const matchesSearch =
                gameName.includes(
                    searchText
                );


            const matchesFilter =
                activeFilter ===
                "all"
                ||
                gameStatus ===
                activeFilter;


            if (
                matchesSearch &&
                matchesFilter
            ) {

                card.classList.remove(
                    "hidden"
                );


                visibleGames++;

            }

            else {

                card.classList.add(
                    "hidden"
                );

            }

        }

    );


    if (
        visibleGames ===
        0
    ) {

        noGamesMessage.classList.add(
            "visible"
        );

    }

    else {

        noGamesMessage.classList.remove(
            "visible"
        );

    }

}


// ==========================================
// البحث
// ==========================================

gameSearch.addEventListener(

    "input",

    filterGames

);


// ==========================================
// الفلاتر
// ==========================================

filterButtons.forEach(

    function (
        button
    ) {

        button.addEventListener(

            "click",

            function () {

                activeFilter =
                    button.dataset.filter;


                filterButtons.forEach(

                    function (
                        otherButton
                    ) {

                        otherButton.classList.remove(
                            "active"
                        );

                    }

                );


                button.classList.add(
                    "active"
                );


                filterGames();

            }

        );

    }

);


// ==========================================
// تحديث الإحصائيات تلقائياً
// ==========================================

function updateStats() {

    let total =
        0;


    let development =
        0;


    let planned =
        0;


    gameCards.forEach(

        function (
            card
        ) {

            total++;


            if (
                card.dataset.status ===
                "development"
            ) {

                development++;

            }


            if (
                card.dataset.status ===
                "planned"
            ) {

                planned++;

            }

        }

    );


    projectsCount.textContent =
        total;


    developmentCount.textContent =
        development;


    plannedCount.textContent =
        planned;

}


// ==========================================
// اختصار بالكيبورد
// M يفتح Minecraft
// ==========================================

document.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            document.activeElement ===
            gameSearch
        ) {

            return;

        }


        if (
            event.key.toLowerCase() ===
            "m"
        ) {

            saveLastProject(
                "Minecraft Rell X1000",
                "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
            );


            openPage(
                "https://murad10867.github.io/vertex-games/minecraft-rell-x1000/"
            );

        }

    }

);


// ==========================================
// العودة للمشاريع
// ==========================================

backBtn.addEventListener(

    "click",

    function () {

        openPage(
            "projects.html"
        );

    }

);


// ==========================================
// بداية الصفحة
// ==========================================

updateStats();


loadLastProject();


filterGames();