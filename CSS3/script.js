// ==========================================
// عناصر الصفحة
// ==========================================

const navbar =
    document.getElementById(
        "navbar"
    );


const brandBtn =
    document.getElementById(
        "brandBtn"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


const mobileLinks =
    document.querySelectorAll(
        ".mobile-link"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const mobileLoginBtn =
    document.getElementById(
        "mobileLoginBtn"
    );


const startBtn =
    document.getElementById(
        "startBtn"
    );


const servicesBtn =
    document.getElementById(
        "servicesBtn"
    );


const ctaLoginBtn =
    document.getElementById(
        "ctaLoginBtn"
    );


const footerLoginBtn =
    document.getElementById(
        "footerLoginBtn"
    );


const topBtn =
    document.getElementById(
        "topBtn"
    );


const copyright =
    document.getElementById(
        "copyright"
    );


// ==========================================
// بيانات الأنظمة
// ==========================================

const systemsData = {

    ai: {

        icon:
            "🤖",

        label:
            "VERTEX AI",

        title:
            "Vertex AI",

        description:
            "مساعد ذكاء اصطناعي يعمل داخل المتصفح ويحتوي على محادثة وذاكرة محلية.",

        tags: [
            "Chat",
            "Memory",
            "JavaScript"
        ]

    },


    robots: {

        icon:
            "🦾",

        label:
            "VERTEX ROBOTS",

        title:
            "Vertex Robots",

        description:
            "مختبر روبوتات تفاعلي يحتوي على الحركة والحساسات والطاقة والأوامر.",

        tags: [
            "Robotics",
            "Sensors",
            "Control"
        ]

    },


    games: {

        icon:
            "🎮",

        label:
            "VERTEX GAMES",

        title:
            "Vertex Games",

        description:
            "مركز تطوير الألعاب ويضم Minecraft Rell X1000 وVertex Racing: Nitro Rush ومشاريع ألعاب أخرى.",

        tags: [
            "Godot",
            "GDScript",
            "12 Games"
        ]

    },


    web: {

        icon:
            "🌐",

        label:
            "VERTEX WEB",

        title:
            "Vertex Web",

        description:
            "مختبر لتصميم وإنشاء مواقع الويب مع معاينة مباشرة وحفظ وتصدير HTML.",

        tags: [
            "HTML",
            "CSS",
            "JavaScript"
        ]

    },


    space: {

        icon:
            "🌌",

        label:
            "VERTEX SPACE",

        title:
            "Vertex Space",

        description:
            "منصة تفاعلية لاستكشاف الكواكب والنجوم والثقوب السوداء والمجرات والأقمار والرحلات الفضائية.",

        tags: [
            "Planets",
            "Stars",
            "Space"
        ]

    }

};


// ==========================================
// عناصر الأنظمة
// ==========================================

const systemItems =
    document.querySelectorAll(
        ".system-item"
    );


const systemPreviewIcon =
    document.getElementById(
        "systemPreviewIcon"
    );


const systemPreviewLabel =
    document.getElementById(
        "systemPreviewLabel"
    );


const systemPreviewTitle =
    document.getElementById(
        "systemPreviewTitle"
    );


const systemPreviewDescription =
    document.getElementById(
        "systemPreviewDescription"
    );


const systemPreviewTags =
    document.getElementById(
        "systemPreviewTags"
    );


const systemLoginBtn =
    document.getElementById(
        "systemLoginBtn"
    );


// ==========================================
// القسم المحدد
// ==========================================

let selectedSystem =
    "ai";


// ==========================================
// الانتقال إلى قسم
// ==========================================

function scrollToSection(
    sectionId
) {

    const section =
        document.getElementById(
            sectionId
        );


    if (
        !section
    ) {

        return;

    }


    section.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    mobileMenu.classList.remove(
        "open"
    );


    menuBtn.textContent =
        "☰";

}


// ==========================================
// الشعار
// ==========================================

brandBtn.addEventListener(

    "click",

    function () {

        scrollToSection(
            "home"
        );

    }

);


// ==========================================
// روابط Navbar
// ==========================================

navLinks.forEach(

    function (
        link
    ) {

        link.addEventListener(

            "click",

            function () {

                scrollToSection(
                    link.dataset.section
                );

            }

        );

    }

);


// ==========================================
// روابط الجوال
// ==========================================

mobileLinks.forEach(

    function (
        link
    ) {

        link.addEventListener(

            "click",

            function () {

                scrollToSection(
                    link.dataset.section
                );

            }

        );

    }

);


// ==========================================
// قائمة الجوال
// ==========================================

menuBtn.addEventListener(

    "click",

    function () {

        mobileMenu.classList.toggle(
            "open"
        );


        if (
            mobileMenu.classList.contains(
                "open"
            )
        ) {

            menuBtn.textContent =
                "✕";

        }

        else {

            menuBtn.textContent =
                "☰";

        }

    }

);


// ==========================================
// إغلاق قائمة الجوال عند الضغط خارجها
// ==========================================

document.addEventListener(

    "click",

    function (
        event
    ) {

        const clickedMenu =
            menuBtn.contains(
                event.target
            );


        const clickedInside =
            mobileMenu.contains(
                event.target
            );


        if (
            !clickedMenu &&
            !clickedInside
        ) {

            mobileMenu.classList.remove(
                "open"
            );


            menuBtn.textContent =
                "☰";

        }

    }

);


// ==========================================
// فتح تسجيل الدخول
// ==========================================

window.vertexHomeSessionActive = false;

function openLogin(destinationPage) {

    const destination =
        typeof destinationPage === "string"
            ? destinationPage
            : "dashboard.html";

    if (window.vertexHomeSessionActive) {
        window.location.href = destination;
        return;
    }

    window.location.href = "login.html";

}


loginBtn.addEventListener(
    "click",
    openLogin
);


mobileLoginBtn.addEventListener(
    "click",
    openLogin
);


startBtn.addEventListener(
    "click",
    openLogin
);


ctaLoginBtn.addEventListener(
    "click",
    openLogin
);


footerLoginBtn.addEventListener(
    "click",
    openLogin
);


// ==========================================
// استكشف الخدمات
// ==========================================

servicesBtn.addEventListener(

    "click",

    function () {

        scrollToSection(
            "services"
        );

    }

);


// ==========================================
// اختيار نظام
// ==========================================

function showSystem(
    systemId
) {

    const system =
        systemsData[
            systemId
        ];


    if (
        !system
    ) {

        return;

    }


    selectedSystem =
        systemId;


    systemPreviewIcon.textContent =
        system.icon;


    systemPreviewLabel.textContent =
        system.label;


    systemPreviewTitle.textContent =
        system.title;


    systemPreviewDescription.textContent =
        system.description;


    systemPreviewTags.innerHTML =
        "";


    system.tags.forEach(

        function (
            tag
        ) {

            const tagElement =
                document.createElement(
                    "span"
                );


            tagElement.textContent =
                tag;


            systemPreviewTags.appendChild(
                tagElement
            );

        }

    );


    systemItems.forEach(

        function (
            item
        ) {

            item.classList.remove(
                "active"
            );

        }

    );


    const selectedItem =
        document.querySelector(
            '[data-system="' +
            systemId +
            '"]'
        );


    if (
        selectedItem
    ) {

        selectedItem.classList.add(
            "active"
        );

    }

}


// ==========================================
// اختيار الأنظمة
// ==========================================

systemItems.forEach(

    function (
        item
    ) {

        item.addEventListener(

            "click",

            function () {

                showSystem(
                    item.dataset.system
                );

            }

        );

    }

);


// ==========================================
// الدخول للنظام المحدد
//
// لا نفتح صفحات المشاريع مباشرة من
// الواجهة الرئيسية.
// المستخدم يدخل أولاً من login.html
// ==========================================

systemLoginBtn.addEventListener(

    "click",

    function () {

        localStorage.setItem(

            "vertexRequestedSystem",

            selectedSystem

        );


        openLogin(selectedSystem + ".html");

    }

);


// ==========================================
// Navbar عند النزول
// ==========================================

function updateNavbar() {

    if (
        window.scrollY >
        30
    ) {

        navbar.classList.add(
            "scrolled"
        );

    }

    else {

        navbar.classList.remove(
            "scrolled"
        );

    }

}


// ==========================================
// زر العودة للأعلى
// ==========================================

function updateTopButton() {

    if (
        window.scrollY >
        600
    ) {

        topBtn.classList.add(
            "visible"
        );

    }

    else {

        topBtn.classList.remove(
            "visible"
        );

    }

}


topBtn.addEventListener(

    "click",

    function () {

        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });

    }

);


// ==========================================
// تحديد الرابط حسب مكان الصفحة
// ==========================================

const observedSections = [

    document.getElementById(
        "home"
    ),

    document.getElementById(
        "services"
    ),

    document.getElementById(
        "systems"
    ),

    document.getElementById(
        "technology"
    )

];


const sectionObserver =
    new IntersectionObserver(

        function (
            entries
        ) {

            entries.forEach(

                function (
                    entry
                ) {

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    navLinks.forEach(

                        function (
                            link
                        ) {

                            link.classList.remove(
                                "active"
                            );

                        }

                    );


                    const activeLink =
                        document.querySelector(
                            '.nav-link[data-section="' +
                            entry.target.id +
                            '"]'
                        );


                    if (
                        activeLink
                    ) {

                        activeLink.classList.add(
                            "active"
                        );

                    }

                }

            );

        },

        {
            threshold:
                0.35
        }

    );


observedSections.forEach(

    function (
        section
    ) {

        if (
            section
        ) {

            sectionObserver.observe(
                section
            );

        }

    }

);


// ==========================================
// العدادات
// ==========================================

const counters =
    document.querySelectorAll(
        ".counter"
    );


let countersStarted =
    false;


function startCounters() {

    if (
        countersStarted
    ) {

        return;

    }


    countersStarted =
        true;


    counters.forEach(

        function (
            counter
        ) {

            const target =
                Number(
                    counter.dataset.target
                );


            let current =
                0;


            const duration =
                900;


            const steps =
                30;


            const intervalTime =
                duration /
                steps;


            const increment =
                target /
                steps;


            const timer =
                setInterval(

                    function () {

                        current +=
                            increment;


                        if (
                            current >=
                            target
                        ) {

                            current =
                                target;


                            clearInterval(
                                timer
                            );

                        }


                        counter.textContent =
                            Math.round(
                                current
                            );

                    },

                    intervalTime

                );

        }

    );

}


// ==========================================
// مراقبة قسم الأرقام
// ==========================================

const numbersSection =
    document.querySelector(
        ".numbers-section"
    );


const numbersObserver =
    new IntersectionObserver(

        function (
            entries
        ) {

            entries.forEach(

                function (
                    entry
                ) {

                    if (
                        entry.isIntersecting
                    ) {

                        startCounters();

                    }

                }

            );

        },

        {
            threshold:
                0.35
        }

    );


if (
    numbersSection
) {

    numbersObserver.observe(
        numbersSection
    );

}


// ==========================================
// إنشاء النجوم الصغيرة بالخلفية
// ==========================================

const particles =
    document.getElementById(
        "particles"
    );


function createParticles() {

    const numberOfParticles =
        65;


    for (
        let i = 0;
        i < numberOfParticles;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "particle";


        particle.style.left =
            Math.random() *
            100 +
            "%";


        particle.style.top =
            Math.random() *
            100 +
            "%";


        particle.style.setProperty(

            "--duration",

            (
                2 +
                Math.random() *
                5
            )
            +
            "s"

        );


        particle.style.setProperty(

            "--delay",

            (
                Math.random() *
                -5
            )
            +
            "s"

        );


        particles.appendChild(
            particle
        );

    }

}


// ==========================================
// السنة
// ==========================================

copyright.textContent =
    "© " +
    new Date()
        .getFullYear() +
    " Vertex Systems AI";


// ==========================================
// Scroll
// ==========================================

window.addEventListener(

    "scroll",

    function () {

        updateNavbar();

        updateTopButton();

    },

    {
        passive:
            true
    }

);


// ==========================================
// تشغيل الصفحة
// ==========================================

createParticles();


showSystem(
    "ai"
);


updateNavbar();


updateTopButton();

// ==========================================
// حالة تسجيل الدخول في الصفحة الرئيسية
// ==========================================

async function updateHomeAuthState() {
    if (typeof supabaseClient === "undefined" || !supabaseClient?.auth) return;

    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        window.vertexHomeSessionActive = Boolean(data.session?.user);

        if (window.vertexHomeSessionActive) {
            if (loginBtn) loginBtn.textContent = "لوحة التحكم";
            if (mobileLoginBtn) mobileLoginBtn.textContent = "📊 لوحة التحكم";
            if (startBtn) startBtn.innerHTML = "لوحة التحكم <span>←</span>";
            if (ctaLoginBtn) ctaLoginBtn.textContent = "فتح لوحة التحكم ←";
            if (footerLoginBtn) footerLoginBtn.textContent = "لوحة التحكم ←";
            if (systemLoginBtn) systemLoginBtn.textContent = "فتح النظام ←";
        }
    } catch (error) {
        console.warn("Home session check failed:", error);
    }
}

updateHomeAuthState();
