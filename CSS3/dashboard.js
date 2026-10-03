// ==========================================
// التأكد من وجود جلسة
// ==========================================

if (
    !window.VertexAuth ||
    !VertexAuth.isLoggedIn()
) {

    window.location.replace(
        "login.html"
    );

}


// ==========================================
// المستخدم الحالي
// ==========================================

let currentUser =
    VertexAuth.getUser();


// ==========================================
// عناصر المستخدم
// ==========================================

const userName =
    document.getElementById(
        "userName"
    );


const userEmail =
    document.getElementById(
        "userEmail"
    );


const userAvatar =
    document.getElementById(
        "userAvatar"
    );


const topUserName =
    document.getElementById(
        "topUserName"
    );


const topUserAvatar =
    document.getElementById(
        "topUserAvatar"
    );


const welcomeUserName =
    document.getElementById(
        "welcomeUserName"
    );


const systemUserName =
    document.getElementById(
        "systemUserName"
    );


const systemUserEmail =
    document.getElementById(
        "systemUserEmail"
    );


// ==========================================
// عرض بيانات المستخدم
// ==========================================

function displayUser() {

    currentUser =
        VertexAuth.getUser();

    if (
        !currentUser
    ) {

        return;

    }


    const name =
        currentUser.name;


    const email =
        currentUser.email;


    const firstLetter =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    userName.textContent =
        name;


    userEmail.textContent =
        email;


    userAvatar.textContent =
        firstLetter || "V";


    topUserName.textContent =
        name;


    topUserAvatar.textContent =
        firstLetter || "V";


    welcomeUserName.textContent =
        name;


    systemUserName.textContent =
        name;


    systemUserEmail.textContent =
        email;

}


// ==========================================
// Sidebar
// ==========================================

const sidebar =
    document.getElementById(
        "sidebar"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


menuBtn.addEventListener(

    "click",

    function () {

        sidebar.classList.toggle(
            "open"
        );

    }

);


// ==========================================
// الأقسام
// ==========================================

const sections = {

    home:
        document.getElementById(
            "homeSection"
        ),

    projects:
        document.getElementById(
            "projectsSection"
        ),

    activity:
        document.getElementById(
            "activitySection"
        ),

    system:
        document.getElementById(
            "systemSection"
        )

};


function showSection(
    name
) {

    Object.values(
        sections
    )
        .forEach(

            function (
                section
            ) {

                section.classList.remove(
                    "active-section"
                );

            }

        );


    navItems.forEach(

        function (
            item
        ) {

            item.classList.remove(
                "active"
            );

        }

    );


    if (
        sections[
            name
        ]
    ) {

        sections[
            name
        ]
            .classList
            .add(
                "active-section"
            );

    }


    const nav =
        document.querySelector(
            '[data-section="' +
            name +
            '"]'
        );


    if (
        nav
    ) {

        nav.classList.add(
            "active"
        );

    }


    sidebar.classList.remove(
        "open"
    );


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


navItems.forEach(

    function (
        item
    ) {

        item.addEventListener(

            "click",

            function () {

                showSection(
                    item.dataset.section
                );

            }

        );

    }

);


// ==========================================
// الساعة
// ==========================================

const clock =
    document.getElementById(
        "clock"
    );


function updateClock() {

    clock.textContent =
        new Date()
            .toLocaleTimeString(

                "ar-SA",

                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit"
                }

            );

}


updateClock();


setInterval(

    updateClock,

    1000

);


// ==========================================
// قراءة Array من LocalStorage
// ==========================================

function readArray(
    key
) {

    const value =
        localStorage.getItem(
            key
        );


    if (
        !value
    ) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(
                value
            );


        return Array.isArray(
            parsed
        )
            ?
            parsed
            :
            [];

    }

    catch (
        error
    ) {

        return [];

    }

}


// ==========================================
// عناصر الإحصائيات
// ==========================================

const chatCount =
    document.getElementById(
        "chatCount"
    );


const memoryCount =
    document.getElementById(
        "memoryCount"
    );


const missionCount =
    document.getElementById(
        "missionCount"
    );


const aiStatusText =
    document.getElementById(
        "aiStatusText"
    );


const webStatusText =
    document.getElementById(
        "webStatusText"
    );


const activityChats =
    document.getElementById(
        "activityChats"
    );


const activityMemories =
    document.getElementById(
        "activityMemories"
    );


const activityMissions =
    document.getElementById(
        "activityMissions"
    );


const activityWeb =
    document.getElementById(
        "activityWeb"
    );


const storageItems =
    document.getElementById(
        "storageItems"
    );


const activityPreview =
    document.getElementById(
        "activityPreview"
    );


const fullActivityList =
    document.getElementById(
        "fullActivityList"
    );


// ==========================================
// قراءة بيانات Vertex
// ==========================================

function getVertexData() {

    const chats =
        readArray(
            "vertexChatHistory"
        );


    const memories =
        readArray(
            "vertexMemories"
        );


    const missions =
        readArray(
            "vertexSpaceMissionLog"
        );


    const webProject =
        localStorage.getItem(
            "vertexWebProject"
        );


    return {

        chats:
            chats.length,

        memories:
            memories.length,

        missions:
            missions.length,

        web:
            webProject
                ?
                1
                :
                0

    };

}


// ==========================================
// تحديث البيانات
// ==========================================

function updateDashboard() {

    const data =
        getVertexData();


    chatCount.textContent =
        data.chats;


    memoryCount.textContent =
        data.memories;


    missionCount.textContent =
        data.missions;


    activityChats.textContent =
        data.chats;


    activityMemories.textContent =
        data.memories;


    activityMissions.textContent =
        data.missions;


    activityWeb.textContent =
        data.web;


    storageItems.textContent =
        localStorage.length +
        " عنصر";


    if (
        data.chats >
        0
    ) {

        aiStatusText.textContent =
            data.chats +
            " رسالة محفوظة";

    }

    else {

        aiStatusText.textContent =
            "جاهز للمحادثة";

    }


    if (
        data.web
    ) {

        webStatusText.textContent =
            "يوجد مشروع محفوظ";

    }

    else {

        webStatusText.textContent =
            "لا يوجد مشروع محفوظ";

    }


    renderActivity(
        data
    );

}


// ==========================================
// النشاط
// ==========================================

function renderActivity(
    data
) {

    const items = [

        {
            icon:
                "💬",

            name:
                "Vertex AI",

            text:
                data.chats +
                " رسالة",

            value:
                data.chats
        },


        {
            icon:
                "🧠",

            name:
                "ذاكرة AI",

            text:
                data.memories +
                " معلومة",

            value:
                data.memories
        },


        {
            icon:
                "🚀",

            name:
                "Vertex Space",

            text:
                data.missions +
                " مهمة",

            value:
                data.missions
        },


        {
            icon:
                "🌐",

            name:
                "Vertex Web",

            text:
                data.web
                    ?
                    "مشروع محفوظ"
                    :
                    "لا يوجد مشروع",

            value:
                data.web
                    ?
                    "محفوظ"
                    :
                    "—"
        }

    ];


    activityPreview.innerHTML =
        "";


    fullActivityList.innerHTML =
        "";


    const hasActivity =
        data.chats >
        0
        ||
        data.memories >
        0
        ||
        data.missions >
        0
        ||
        data.web >
        0;


    if (
        !hasActivity
    ) {

        activityPreview.innerHTML =

            `
            <div class="empty-activity">
                لا يوجد نشاط محفوظ حتى الآن.
            </div>
            `;

    }

    else {

        items.forEach(

            function (
                item
            ) {

                if (
                    item.value ===
                    0
                ) {

                    return;

                }


                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "activity-item";


                element.innerHTML =

                    `
                    <div class="row-icon">
                        ${item.icon}
                    </div>

                    <div>

                        <strong>
                            ${item.name}
                        </strong>

                        <small>
                            ${item.text}
                        </small>

                    </div>
                    `;


                activityPreview.appendChild(
                    element
                );

            }

        );

    }


    items.forEach(

        function (
            item
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "full-activity-row";


            row.innerHTML =

                `
                <div class="row-icon">
                    ${item.icon}
                </div>

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <p>
                        بيانات النظام المحفوظة داخل المتصفح.
                    </p>

                </div>

                <div class="row-value">
                    ${item.value}
                </div>
                `;


            fullActivityList.appendChild(
                row
            );

        }

    );

}


// ==========================================
// فتح الصفحات
// ==========================================

function openPage(
    page
) {

    window.location.href =
        page;

}


// Quick projects

document
    .querySelectorAll(
        ".quick-project"
    )
    .forEach(

        function (
            button
        ) {

            button.addEventListener(

                "click",

                function () {

                    openPage(
                        button.dataset.page
                    );

                }

            );

        }

    );


// Project buttons

document
    .querySelectorAll(
        ".project-open-btn"
    )
    .forEach(

        function (
            button
        ) {

            button.addEventListener(

                "click",

                function () {

                    openPage(
                        button.dataset.page
                    );

                }

            );

        }

    );


// ==========================================
// أزرار Dashboard
// ==========================================

document
    .getElementById(
        "openProjectsBtn"
    )
    .addEventListener(

        "click",

        function () {

            showSection(
                "projects"
            );

        }

    );


document
    .getElementById(
        "allProjectsBtn"
    )
    .addEventListener(

        "click",

        function () {

            showSection(
                "projects"
            );

        }

    );


document
    .getElementById(
        "projectsPageSideBtn"
    )
    .addEventListener(

        "click",

        function () {

            openPage(
                "projects.html"
            );

        }

    );


document
    .getElementById(
        "homePageBtn"
    )
    .addEventListener(

        "click",

        function () {

            openPage(
                "index.html"
            );

        }

    );


// ==========================================
// تحديث
// ==========================================

document
    .getElementById(
        "refreshBtn"
    )
    .addEventListener(

        "click",

        updateDashboard

    );


document
    .getElementById(
        "activityRefreshBtn"
    )
    .addEventListener(

        "click",

        updateDashboard

    );


// ==========================================
// تسجيل الخروج
// ==========================================

const logoutModal =
    document.getElementById(
        "logoutModal"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const systemLogoutBtn =
    document.getElementById(
        "systemLogoutBtn"
    );


const cancelLogoutBtn =
    document.getElementById(
        "cancelLogoutBtn"
    );


const confirmLogoutBtn =
    document.getElementById(
        "confirmLogoutBtn"
    );


const logoutOverlay =
    document.getElementById(
        "logoutOverlay"
    );


function openLogoutModal() {

    logoutModal.classList.add(
        "visible"
    );

}


function closeLogoutModal() {

    logoutModal.classList.remove(
        "visible"
    );

}


logoutBtn.addEventListener(
    "click",
    openLogoutModal
);


systemLogoutBtn.addEventListener(
    "click",
    openLogoutModal
);


cancelLogoutBtn.addEventListener(
    "click",
    closeLogoutModal
);


logoutOverlay.addEventListener(
    "click",
    closeLogoutModal
);


confirmLogoutBtn.addEventListener(

    "click",

    function () {

        VertexAuth.logout();

    }

);


document.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

            closeLogoutModal();

        }

    }

);


// ==========================================
// إغلاق Sidebar على الجوال
// ==========================================

document.addEventListener(

    "click",

    function (
        event
    ) {

        if (
            window.innerWidth >
            900
        ) {

            return;

        }


        if (
            sidebar.contains(
                event.target
            )
        ) {

            return;

        }


        if (
            menuBtn.contains(
                event.target
            )
        ) {

            return;

        }


        sidebar.classList.remove(
            "open"
        );

    }

);


// ==========================================
// السنة
// ==========================================

document
    .getElementById(
        "footerYear"
    )
    .textContent =
        "© " +
        new Date()
            .getFullYear();


// ==========================================
// تحديث بيانات المستخدم بعد جاهزية Supabase
// ==========================================

document.addEventListener(
    "vertex-auth-ready",
    function (event) {
        if (event.detail && event.detail.loggedIn) {
            displayUser();
        }
    }
);


// ==========================================
// تشغيل الصفحة
// ==========================================

displayUser();


updateDashboard();


showSection(
    "home"
);
