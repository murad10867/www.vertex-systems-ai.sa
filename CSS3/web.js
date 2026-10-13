// ==========================================
// العناصر
// ==========================================

const startBuilderBtn =
    document.getElementById(
        "startBuilderBtn"
    );


// ==========================================
// Inputs
// ==========================================

const siteNameInput =
    document.getElementById(
        "siteNameInput"
    );


const heroTitleInput =
    document.getElementById(
        "heroTitleInput"
    );


const heroDescriptionInput =
    document.getElementById(
        "heroDescriptionInput"
    );


const buttonTextInput =
    document.getElementById(
        "buttonTextInput"
    );


const accentColorInput =
    document.getElementById(
        "accentColorInput"
    );


const colorValue =
    document.getElementById(
        "colorValue"
    );


// ==========================================
// Themes
// ==========================================

const themeButtons =
    document.querySelectorAll(
        ".theme-btn"
    );


const radiusButtons =
    document.querySelectorAll(
        ".radius-btn"
    );


// ==========================================
// Toggles
// ==========================================

const heroToggle =
    document.getElementById(
        "heroToggle"
    );


const servicesToggle =
    document.getElementById(
        "servicesToggle"
    );


const aboutToggle =
    document.getElementById(
        "aboutToggle"
    );


const contactToggle =
    document.getElementById(
        "contactToggle"
    );


// ==========================================
// Preview
// ==========================================

const previewFrame =
    document.getElementById(
        "previewFrame"
    );


const websitePreview =
    document.getElementById(
        "websitePreview"
    );


const previewSiteName =
    document.getElementById(
        "previewSiteName"
    );


const previewHero =
    document.getElementById(
        "previewHero"
    );


const previewHeroTitle =
    document.getElementById(
        "previewHeroTitle"
    );


const previewHeroDescription =
    document.getElementById(
        "previewHeroDescription"
    );


const previewHeroButton =
    document.getElementById(
        "previewHeroButton"
    );


const previewServices =
    document.getElementById(
        "previewServices"
    );


const previewAbout =
    document.getElementById(
        "previewAbout"
    );


const previewContact =
    document.getElementById(
        "previewContact"
    );


const previewFooterName =
    document.getElementById(
        "previewFooterName"
    );


// ==========================================
// Device
// ==========================================

const deviceButtons =
    document.querySelectorAll(
        ".device-btn"
    );


// ==========================================
// Actions
// ==========================================

const saveBtn =
    document.getElementById(
        "saveBtn"
    );


const resetBtn =
    document.getElementById(
        "resetBtn"
    );


const downloadBtn =
    document.getElementById(
        "downloadBtn"
    );


const saveMessage =
    document.getElementById(
        "saveMessage"
    );


const backBtn =
    document.getElementById(
        "backBtn"
    );


// ==========================================
// الإعدادات الحالية
// ==========================================

let currentSettings = {

    siteName:
        "Vertex Website",

    heroTitle:
        "مرحباً بك في موقعي",

    heroDescription:
        "موقع تم إنشاؤه باستخدام Vertex Web.",

    buttonText:
        "ابدأ الآن",

    accentColor:
        "#2b8cff",

    theme:
        "dark",

    radius:
        12,

    sections: {

        hero:
            true,

        services:
            true,

        about:
            true,

        contact:
            true

    }

};


// ==========================================
// الذهاب للمنشئ
// ==========================================

startBuilderBtn.addEventListener(

    "click",

    function () {

        document
            .getElementById(
                "builderSection"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }

);


// ==========================================
// قراءة الإعدادات
// ==========================================

function readSettingsFromControls() {

    currentSettings.siteName =
        siteNameInput.value.trim() ||
        "My Website";


    currentSettings.heroTitle =
        heroTitleInput.value.trim() ||
        "مرحباً بك";


    currentSettings.heroDescription =
        heroDescriptionInput.value.trim();


    currentSettings.buttonText =
        buttonTextInput.value.trim() ||
        "ابدأ الآن";


    currentSettings.accentColor =
        accentColorInput.value;


    currentSettings.sections.hero =
        heroToggle.checked;


    currentSettings.sections.services =
        servicesToggle.checked;


    currentSettings.sections.about =
        aboutToggle.checked;


    currentSettings.sections.contact =
        contactToggle.checked;

}


// ==========================================
// تحديث المعاينة
// ==========================================

function updatePreview() {

    readSettingsFromControls();


    previewSiteName.textContent =
        currentSettings.siteName;


    previewFooterName.textContent =
        currentSettings.siteName;


    previewHeroTitle.textContent =
        currentSettings.heroTitle;


    previewHeroDescription.textContent =
        currentSettings.heroDescription;


    previewHeroButton.textContent =
        currentSettings.buttonText;


    colorValue.textContent =
        currentSettings.accentColor;


    websitePreview.style.setProperty(
        "--accent",
        currentSettings.accentColor
    );


    websitePreview.style.setProperty(
        "--preview-radius",
        currentSettings.radius +
        "px"
    );


    // ======================================
    // Theme
    // ======================================

    websitePreview.classList.remove(
        "theme-dark",
        "theme-light",
        "theme-space"
    );


    websitePreview.classList.add(
        "theme-" +
        currentSettings.theme
    );


    // ======================================
    // Sections
    // ======================================

    setSectionVisibility(
        previewHero,
        currentSettings.sections.hero
    );


    setSectionVisibility(
        previewServices,
        currentSettings.sections.services
    );


    setSectionVisibility(
        previewAbout,
        currentSettings.sections.about
    );


    setSectionVisibility(
        previewContact,
        currentSettings.sections.contact
    );

}


// ==========================================
// إظهار وإخفاء قسم
// ==========================================

function setSectionVisibility(
    element,
    visible
) {

    if (
        visible
    ) {

        element.classList.remove(
            "section-hidden"
        );

    }

    else {

        element.classList.add(
            "section-hidden"
        );

    }

}


// ==========================================
// تحديث عند الكتابة
// ==========================================

const liveInputs = [

    siteNameInput,
    heroTitleInput,
    heroDescriptionInput,
    buttonTextInput,
    accentColorInput,
    heroToggle,
    servicesToggle,
    aboutToggle,
    contactToggle

];


liveInputs.forEach(

    function (
        input
    ) {

        input.addEventListener(
            "input",
            updatePreview
        );


        input.addEventListener(
            "change",
            updatePreview
        );

    }

);


// ==========================================
// اختيار Theme
// ==========================================

themeButtons.forEach(

    function (
        button
    ) {

        button.addEventListener(

            "click",

            function () {

                currentSettings.theme =
                    button.dataset.theme;


                themeButtons.forEach(

                    function (
                        otherButton
                    ) {

                        otherButton
                            .classList
                            .remove(
                                "selected"
                            );

                    }

                );


                button.classList.add(
                    "selected"
                );


                updatePreview();

            }

        );

    }

);


// ==========================================
// شكل الأزرار
// ==========================================

radiusButtons.forEach(

    function (
        button
    ) {

        button.addEventListener(

            "click",

            function () {

                currentSettings.radius =
                    Number(
                        button.dataset.radius
                    );


                radiusButtons.forEach(

                    function (
                        otherButton
                    ) {

                        otherButton
                            .classList
                            .remove(
                                "selected"
                            );

                    }

                );


                button.classList.add(
                    "selected"
                );


                updatePreview();

            }

        );

    }

);


// ==========================================
// أجهزة المعاينة
// ==========================================

deviceButtons.forEach(

    function (
        button
    ) {

        button.addEventListener(

            "click",

            function () {

                const device =
                    button.dataset.device;


                previewFrame.classList.remove(
                    "desktop",
                    "tablet",
                    "mobile"
                );


                previewFrame.classList.add(
                    device
                );


                deviceButtons.forEach(

                    function (
                        otherButton
                    ) {

                        otherButton
                            .classList
                            .remove(
                                "selected"
                            );

                    }

                );


                button.classList.add(
                    "selected"
                );

            }

        );

    }

);


// ==========================================
// حفظ المشروع
// ==========================================

saveBtn.addEventListener(

    "click",

    function () {

        readSettingsFromControls();


        localStorage.setItem(

            "vertexWebProject",

            JSON.stringify(
                currentSettings
            )

        );


        showMessage(
            "✅ تم حفظ تصميم الموقع."
        );

    }

);


// ==========================================
// رسالة
// ==========================================

function showMessage(
    message
) {

    saveMessage.textContent =
        message;


    setTimeout(

        function () {

            saveMessage.textContent =
                "";

        },

        2500

    );

}


// ==========================================
// تحميل المشروع المحفوظ
// ==========================================

function loadSavedProject() {

    const saved =
        localStorage.getItem(
            "vertexWebProject"
        );


    if (
        !saved
    ) {

        return;

    }


    try {

        const parsed =
            JSON.parse(
                saved
            );


        currentSettings =
            parsed;


        applySettingsToControls();


        updatePreview();

    }

    catch (
        error
    ) {

        console.error(
            "خطأ في تحميل مشروع Vertex Web:",
            error
        );

    }

}


// ==========================================
// وضع الإعدادات داخل الحقول
// ==========================================

function applySettingsToControls() {

    siteNameInput.value =
        currentSettings.siteName;


    heroTitleInput.value =
        currentSettings.heroTitle;


    heroDescriptionInput.value =
        currentSettings.heroDescription;


    buttonTextInput.value =
        currentSettings.buttonText;


    accentColorInput.value =
        currentSettings.accentColor;


    heroToggle.checked =
        currentSettings.sections.hero;


    servicesToggle.checked =
        currentSettings.sections.services;


    aboutToggle.checked =
        currentSettings.sections.about;


    contactToggle.checked =
        currentSettings.sections.contact;


    // Theme

    themeButtons.forEach(

        function (
            button
        ) {

            if (
                button.dataset.theme ===
                currentSettings.theme
            ) {

                button.classList.add(
                    "selected"
                );

            }

            else {

                button.classList.remove(
                    "selected"
                );

            }

        }

    );


    // Radius

    radiusButtons.forEach(

        function (
            button
        ) {

            if (
                Number(
                    button.dataset.radius
                ) ===
                Number(
                    currentSettings.radius
                )
            ) {

                button.classList.add(
                    "selected"
                );

            }

            else {

                button.classList.remove(
                    "selected"
                );

            }

        }

    );

}


// ==========================================
// إعادة للوضع الأساسي
// ==========================================

resetBtn.addEventListener(

    "click",

    function () {

        currentSettings = {

            siteName:
                "Vertex Website",

            heroTitle:
                "مرحباً بك في موقعي",

            heroDescription:
                "موقع تم إنشاؤه باستخدام Vertex Web.",

            buttonText:
                "ابدأ الآن",

            accentColor:
                "#2b8cff",

            theme:
                "dark",

            radius:
                12,

            sections: {

                hero:
                    true,

                services:
                    true,

                about:
                    true,

                contact:
                    true

            }

        };


        localStorage.removeItem(
            "vertexWebProject"
        );


        applySettingsToControls();


        updatePreview();


        showMessage(
            "🔄 تم إرجاع التصميم للوضع الأساسي."
        );

    }

);


// ==========================================
// حماية النصوص قبل وضعها في HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// إنشاء ملف الموقع النهائي
// ==========================================

function buildExportHTML() {

    readSettingsFromControls();


    const name =
        escapeHTML(
            currentSettings.siteName
        );


    const title =
        escapeHTML(
            currentSettings.heroTitle
        );


    const description =
        escapeHTML(
            currentSettings.heroDescription
        );


    const buttonText =
        escapeHTML(
            currentSettings.buttonText
        );


    let pageBackground =
        "#080b11";


    let textColor =
        "#ffffff";


    let cardBackground =
        "#111722";


    let mutedColor =
        "#aeb6c4";


    if (
        currentSettings.theme ===
        "light"
    ) {

        pageBackground =
            "#f7f7f7";


        textColor =
            "#111111";


        cardBackground =
            "#ffffff";


        mutedColor =
            "#555555";

    }


    if (
        currentSettings.theme ===
        "space"
    ) {

        pageBackground =
            "#050817";


        textColor =
            "#ffffff";


        cardBackground =
            "#101735";


        mutedColor =
            "#b5bdd2";

    }


    const heroSection =
        currentSettings.sections.hero
            ?
        `
        <section class="hero">

            <div>

                <p class="small">
                    WELCOME
                </p>

                <h1>
                    ${title}
                </h1>

                <p>
                    ${description}
                </p>

                <button>
                    ${buttonText}
                </button>

            </div>

        </section>
        `
            :
        "";


    const servicesSection =
        currentSettings.sections.services
            ?
        `
        <section
            class="section"
            id="services"
        >

            <h2>
                خدماتنا
            </h2>

            <div class="cards">

                <article>

                    <span>
                        💻
                    </span>

                    <h3>
                        تطوير المواقع
                    </h3>

                    <p>
                        تصميم مواقع جميلة وسريعة.
                    </p>

                </article>


                <article>

                    <span>
                        📱
                    </span>

                    <h3>
                        تصميم متجاوب
                    </h3>

                    <p>
                        يعمل على جميع الشاشات.
                    </p>

                </article>


                <article>

                    <span>
                        ⚡
                    </span>

                    <h3>
                        أداء سريع
                    </h3>

                    <p>
                        صفحات منظمة وخفيفة.
                    </p>

                </article>

            </div>

        </section>
        `
            :
        "";


    const aboutSection =
        currentSettings.sections.about
            ?
        `
        <section
            class="section about"
            id="about"
        >

            <h2>
                من نحن
            </h2>

            <p>
                نبني تجارب رقمية جميلة
                باستخدام تقنيات الويب.
            </p>

        </section>
        `
            :
        "";


    const contactSection =
        currentSettings.sections.contact
            ?
        `
        <section
            class="section contact"
            id="contact"
        >

            <h2>
                تواصل معنا
            </h2>

            <form
                onsubmit="return false;"
            >

                <input
                    type="text"
                    placeholder="الاسم"
                >

                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                >

                <textarea
                    rows="5"
                    placeholder="رسالتك"
                ></textarea>

                <button>
                    إرسال
                </button>

            </form>

        </section>
        `
            :
        "";


    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${name}</title>


    <style>

        * {
            box-sizing: border-box;
        }


        html {
            scroll-behavior: smooth;
        }


        body {
            margin: 0;
            background: ${pageBackground};
            color: ${textColor};
            font-family: Arial, Tahoma, sans-serif;
        }


        nav {
            min-height: 75px;
            padding: 0 7%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            background: ${cardBackground};
        }


        nav strong {
            color: ${currentSettings.accentColor};
            font-size: 21px;
        }


        nav div {
            display: flex;
            gap: 20px;
        }


        nav a {
            color: inherit;
            text-decoration: none;
        }


        .hero {
            min-height: 620px;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            background:
                radial-gradient(
                    circle at center,
                    ${currentSettings.accentColor}33,
                    transparent 60%
                );
        }


        .hero > div {
            max-width: 800px;
        }


        .small {
            color: ${currentSettings.accentColor};
            font-weight: bold;
            letter-spacing: 5px;
        }


        .hero h1 {
            margin: 15px 0;
            font-size: 55px;
        }


        .hero p {
            color: ${mutedColor};
            font-size: 20px;
            line-height: 1.8;
        }


        button {
            padding: 14px 28px;
            border: none;
            border-radius: ${currentSettings.radius}px;
            background: ${currentSettings.accentColor};
            color: white;
            font-size: 17px;
            cursor: pointer;
        }


        .section {
            max-width: 1200px;
            margin: auto;
            padding: 80px 25px;
            text-align: center;
        }


        .section h2 {
            font-size: 36px;
        }


        .cards {
            margin-top: 35px;
            display: grid;
            grid-template-columns:
                repeat(3, 1fr);
            gap: 20px;
        }


        .cards article {
            padding: 35px 20px;
            background: ${cardBackground};
            border-radius: ${currentSettings.radius}px;
        }


        .cards span {
            font-size: 50px;
        }


        .cards p,
        .about p {
            color: ${mutedColor};
            line-height: 1.8;
        }


        .contact form {
            max-width: 600px;
            margin: 30px auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }


        .contact input,
        .contact textarea {
            padding: 15px;
            border: 1px solid #8884;
            border-radius: ${currentSettings.radius}px;
            background: ${cardBackground};
            color: ${textColor};
            font-family: inherit;
        }


        footer {
            min-height: 110px;
            padding: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: ${cardBackground};
            color: ${mutedColor};
        }


        @media (
            max-width: 700px
        ) {

            nav {
                padding: 20px;
                flex-direction: column;
            }


            nav div {
                flex-wrap: wrap;
                justify-content: center;
            }


            .hero h1 {
                font-size: 38px;
            }


            .cards {
                grid-template-columns: 1fr;
            }

        }

    </style>

</head>


<body>


    <nav>

        <strong>
            ${name}
        </strong>

        <div>

            <a href="#">
                الرئيسية
            </a>

            <a href="#services">
                الخدمات
            </a>

            <a href="#about">
                من نحن
            </a>

            <a href="#contact">
                تواصل
            </a>

        </div>

    </nav>


    ${heroSection}

    ${servicesSection}

    ${aboutSection}

    ${contactSection}


    <footer>

        © ${new Date().getFullYear()}
        ${name}

    </footer>


</body>

</html>
`;

}


// ==========================================
// تنزيل الموقع
// ==========================================

downloadBtn.addEventListener(

    "click",

    function () {

        const htmlContent =
            buildExportHTML();


        const blob =
            new Blob(
                [
                    htmlContent
                ],
                {
                    type:
                        "text/html;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "vertex-website.html";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );


        showMessage(
            "✅ تم إنشاء ملف الموقع."
        );

    }

);


// ==========================================
// العودة للوحة التحكم
// ==========================================

backBtn.addEventListener(

    "click",

    function () {

        window.location.href =
            "dashboard.html";

    }

);


// ==========================================
// بداية الصفحة
// ==========================================

loadSavedProject();


updatePreview();