// ==========================================
// الأزرار
// ==========================================

const planetsBtn =
    document.getElementById("planetsBtn");

const starsBtn =
    document.getElementById("starsBtn");

const blackHolesBtn =
    document.getElementById("blackHolesBtn");

const galaxiesBtn =
    document.getElementById("galaxiesBtn");

const moonsBtn =
    document.getElementById("moonsBtn");

const explorationBtn =
    document.getElementById("explorationBtn");

const factBtn =
    document.getElementById("factBtn");

const spaceFact =
    document.getElementById("spaceFact");

const backBtn =
    document.getElementById("backBtn");


// ==========================================
// الكواكب
// ==========================================

planetsBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "planets.html";

    }
);


// ==========================================
// النجوم
// ==========================================

starsBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "stars.html";

    }
);


// ==========================================
// الثقوب السوداء
// ==========================================

blackHolesBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "black-holes.html";

    }
);


// ==========================================
// المجرات
// ==========================================

galaxiesBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "galaxies.html";

    }
);


// ==========================================
// الأقمار
// ==========================================

moonsBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "moons.html";

    }
);


// ==========================================
// استكشاف الفضاء
// ==========================================

explorationBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "exploration.html";

    }
);


// ==========================================
// معلومات فضائية
// ==========================================

const facts = [

    "☀️ الشمس نجم وليست كوكباً.",

    "🌍 الأرض هي الكوكب الثالث من الشمس.",

    "🪐 زحل مشهور بحلقاته الكبيرة.",

    "🔴 المريخ يعرف باسم الكوكب الأحمر.",

    "🌌 مجرة درب التبانة تحتوي على مليارات النجوم.",

    "🕳️ جاذبية الثقب الأسود قوية جداً لدرجة أن الضوء لا يستطيع الهروب بعد تجاوز أفق الحدث.",

    "🌙 القمر هو القمر الطبيعي للأرض.",

    "⭐ النجوم تولد داخل سحب ضخمة من الغاز والغبار.",

    "🚀 الضوء من الشمس يستغرق حوالي 8 دقائق للوصول إلى الأرض.",

    "🪐 المشتري هو أكبر كواكب المجموعة الشمسية."

];


// ==========================================
// اختيار معلومة عشوائية
// ==========================================

factBtn.addEventListener(
    "click",
    function () {

        const randomNumber =
            Math.floor(
                Math.random() *
                facts.length
            );


        spaceFact.textContent =
            facts[randomNumber];

    }
);


// ==========================================
// العودة
// ==========================================

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);