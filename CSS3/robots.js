// ==========================================
// بيانات الروبوتات
// ==========================================

const robotsData = {

    assistant: {

        name:
            "Vertex Assistant",

        preview:
            "🤖",

        description:
            "روبوت مساعد ذكي مصمم للتفاعل مع المستخدم وتنفيذ الأوامر البسيطة والمساعدة في المهام اليومية.",

        mission:
            "المساعدة والتفاعل",

        speed:
            "متوسطة",

        sensors:
            "كاميرا + مسافة + حرارة",

        system:
            "Vertex AI"

    },


    explorer: {

        name:
            "Vertex Explorer",

        preview:
            "🦾",

        description:
            "روبوت مخصص للاستكشاف والتحرك في البيئات المختلفة وجمع المعلومات باستخدام الحساسات.",

        mission:
            "الاستكشاف",

        speed:
            "سريعة",

        sensors:
            "كاميرات + مسافة + حركة",

        system:
            "Vertex Navigation"

    },


    industrial: {

        name:
            "Vertex Industrial",

        preview:
            "⚙️",

        description:
            "روبوت صناعي يمكن تصميمه لتنفيذ الأعمال المتكررة والتحكم في الأدوات والآلات.",

        mission:
            "الأعمال الصناعية",

        speed:
            "دقيقة ومنظمة",

        sensors:
            "قوة + حركة + قرب",

        system:
            "Vertex Control"

    },


    space: {

        name:
            "Vertex Space Bot",

        preview:
            "🚀",

        description:
            "روبوت استكشاف فضائي مصمم للعمل في البيئات البعيدة وجمع البيانات العلمية.",

        mission:
            "استكشاف الفضاء",

        speed:
            "متغيرة",

        sensors:
            "كاميرا + حرارة + إشعاع + مسافة",

        system:
            "Vertex Space AI"

    }

};


// ==========================================
// عناصر الصفحة
// ==========================================

const startLabBtn =
    document.getElementById(
        "startLabBtn"
    );


const robotCards =
    document.querySelectorAll(
        "[data-robot]"
    );


const robotPreview =
    document.getElementById(
        "robotPreview"
    );


const robotName =
    document.getElementById(
        "robotName"
    );


const robotDescription =
    document.getElementById(
        "robotDescription"
    );


const robotMission =
    document.getElementById(
        "robotMission"
    );


const robotSpeed =
    document.getElementById(
        "robotSpeed"
    );


const robotSensors =
    document.getElementById(
        "robotSensors"
    );


const robotSystem =
    document.getElementById(
        "robotSystem"
    );


// ==========================================
// المحاكي
// ==========================================

const simRobot =
    document.getElementById(
        "simRobot"
    );


const robotStatus =
    document.getElementById(
        "robotStatus"
    );


const powerBtn =
    document.getElementById(
        "powerBtn"
    );


const homeBtn =
    document.getElementById(
        "homeBtn"
    );


const forwardBtn =
    document.getElementById(
        "forwardBtn"
    );


const backwardBtn =
    document.getElementById(
        "backwardBtn"
    );


const leftBtn =
    document.getElementById(
        "leftBtn"
    );


const rightBtn =
    document.getElementById(
        "rightBtn"
    );


const stopBtn =
    document.getElementById(
        "stopBtn"
    );


// ==========================================
// البطارية
// ==========================================

const batteryFill =
    document.getElementById(
        "batteryFill"
    );


const batteryText =
    document.getElementById(
        "batteryText"
    );


const batteryMessage =
    document.getElementById(
        "batteryMessage"
    );


const chargeBtn =
    document.getElementById(
        "chargeBtn"
    );


// ==========================================
// الحساسات
// ==========================================

const distanceSensor =
    document.getElementById(
        "distanceSensor"
    );


const temperatureSensor =
    document.getElementById(
        "temperatureSensor"
    );


const lightSensor =
    document.getElementById(
        "lightSensor"
    );


const obstacleSensor =
    document.getElementById(
        "obstacleSensor"
    );


const scanBtn =
    document.getElementById(
        "scanBtn"
    );


// ==========================================
// الأوامر
// ==========================================

const commandInput =
    document.getElementById(
        "commandInput"
    );


const sendCommandBtn =
    document.getElementById(
        "sendCommandBtn"
    );


const robotReply =
    document.getElementById(
        "robotReply"
    );


// ==========================================
// السجل
// ==========================================

const robotLog =
    document.getElementById(
        "robotLog"
    );


const clearLogBtn =
    document.getElementById(
        "clearLogBtn"
    );


// ==========================================
// العودة
// ==========================================

const backBtn =
    document.getElementById(
        "backBtn"
    );


// ==========================================
// الحالات
// ==========================================

let selectedRobot =
    "assistant";


let robotPowered =
    false;


let battery =
    100;


let robotX =
    50;


let robotY =
    60;


let robotLogs =
    [];


// ==========================================
// دخول المختبر
// ==========================================

startLabBtn.addEventListener(

    "click",

    function () {

        document
            .getElementById(
                "robotLab"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }

);


// ==========================================
// اختيار روبوت
// ==========================================

function showRobot(
    robotId
) {

    const robot =
        robotsData[
            robotId
        ];


    if (!robot) {

        return;

    }


    selectedRobot =
        robotId;


    robotPreview.textContent =
        robot.preview;


    robotName.textContent =
        robot.name;


    robotDescription.textContent =
        robot.description;


    robotMission.textContent =
        robot.mission;


    robotSpeed.textContent =
        robot.speed;


    robotSensors.textContent =
        robot.sensors;


    robotSystem.textContent =
        robot.system;


    robotCards.forEach(

        function (card) {

            card.classList.remove(
                "selected"
            );

        }

    );


    const selectedCard =
        document.querySelector(
            '[data-robot="' +
            robotId +
            '"]'
        );


    if (selectedCard) {

        selectedCard.classList.add(
            "selected"
        );

    }


    addLog(
        "تم اختيار " +
        robot.name
    );

}


// ==========================================
// الضغط على الروبوتات
// ==========================================

robotCards.forEach(

    function (card) {

        card.addEventListener(

            "click",

            function () {

                showRobot(
                    card.dataset.robot
                );

            }

        );

    }

);


// ==========================================
// تشغيل وإيقاف الروبوت
// ==========================================

powerBtn.addEventListener(

    "click",

    function () {

        if (
            battery <= 0
        ) {

            robotReply.textContent =
                "🔋 البطارية فارغة. اشحن الروبوت أولاً.";

            return;

        }


        robotPowered =
            !robotPowered;


        if (
            robotPowered
        ) {

            simRobot.classList.add(
                "powered"
            );


            robotStatus.textContent =
                "يعمل";


            powerBtn.textContent =
                "⛔ إيقاف الروبوت";


            robotReply.textContent =
                "🤖 تم تشغيل الروبوت بنجاح.";


            addLog(
                "تشغيل الروبوت"
            );

        }

        else {

            simRobot.classList.remove(
                "powered"
            );


            simRobot.classList.remove(
                "walking"
            );


            robotStatus.textContent =
                "متوقف";


            powerBtn.textContent =
                "🔌 تشغيل الروبوت";


            robotReply.textContent =
                "🤖 تم إيقاف الروبوت.";


            addLog(
                "إيقاف الروبوت"
            );

        }

    }

);


// ==========================================
// فحص إمكانية الحركة
// ==========================================

function canMove() {

    if (
        !robotPowered
    ) {

        robotReply.textContent =
            "⚠️ شغّل الروبوت أولاً.";

        return false;

    }


    if (
        battery <= 0
    ) {

        robotPowered =
            false;


        simRobot.classList.remove(
            "powered"
        );


        robotStatus.textContent =
            "البطارية فارغة";


        powerBtn.textContent =
            "🔌 تشغيل الروبوت";


        robotReply.textContent =
            "🔋 البطارية فارغة.";


        return false;

    }


    return true;

}


// ==========================================
// استهلاك البطارية
// ==========================================

function useBattery(
    amount
) {

    battery -=
        amount;


    if (
        battery < 0
    ) {

        battery =
            0;

    }


    updateBattery();

}


// ==========================================
// تحريك الروبوت
// ==========================================

function moveRobot(
    direction
) {

    if (
        !canMove()
    ) {

        return;

    }


    simRobot.classList.add(
        "walking"
    );


    if (
        direction ===
        "forward"
    ) {

        robotY -=
            6;


        robotStatus.textContent =
            "يتحرك للأمام";


        addLog(
            "تحرك للأمام"
        );

    }


    if (
        direction ===
        "backward"
    ) {

        robotY +=
            6;


        robotStatus.textContent =
            "يتحرك للخلف";


        addLog(
            "تحرك للخلف"
        );

    }


    if (
        direction ===
        "left"
    ) {

        robotX -=
            6;


        robotStatus.textContent =
            "يتحرك لليسار";


        addLog(
            "تحرك لليسار"
        );

    }


    if (
        direction ===
        "right"
    ) {

        robotX +=
            6;


        robotStatus.textContent =
            "يتحرك لليمين";


        addLog(
            "تحرك لليمين"
        );

    }


    // حدود منطقة الحركة

    robotX =
        Math.max(
            10,
            Math.min(
                90,
                robotX
            )
        );


    robotY =
        Math.max(
            20,
            Math.min(
                78,
                robotY
            )
        );


    updateRobotPosition();


    useBattery(
        2
    );


    setTimeout(

        function () {

            simRobot.classList.remove(
                "walking"
            );

        },

        350

    );

}


// ==========================================
// تحديث مكان الروبوت
// ==========================================

function updateRobotPosition() {

    simRobot.style.left =
        robotX + "%";


    simRobot.style.top =
        robotY + "%";

}


// ==========================================
// أزرار الحركة
// ==========================================

forwardBtn.addEventListener(

    "click",

    function () {

        moveRobot(
            "forward"
        );

    }

);


backwardBtn.addEventListener(

    "click",

    function () {

        moveRobot(
            "backward"
        );

    }

);


leftBtn.addEventListener(

    "click",

    function () {

        moveRobot(
            "left"
        );

    }

);


rightBtn.addEventListener(

    "click",

    function () {

        moveRobot(
            "right"
        );

    }

);


// ==========================================
// إيقاف الحركة
// ==========================================

stopBtn.addEventListener(

    "click",

    function () {

        simRobot.classList.remove(
            "walking"
        );


        if (
            robotPowered
        ) {

            robotStatus.textContent =
                "متوقف في مكانه";

        }


        addLog(
            "إيقاف الحركة"
        );

    }

);


// ==========================================
// العودة للبداية
// ==========================================

homeBtn.addEventListener(

    "click",

    function () {

        robotX =
            50;


        robotY =
            60;


        updateRobotPosition();


        if (
            robotPowered
        ) {

            robotStatus.textContent =
                "عاد إلى نقطة البداية";

        }


        addLog(
            "العودة لنقطة البداية"
        );

    }

);


// ==========================================
// تحديث البطارية
// ==========================================

function updateBattery() {

    batteryFill.style.width =
        battery + "%";


    batteryText.textContent =
        battery + "%";


    if (
        battery > 60
    ) {

        batteryFill.style.background =
            "linear-gradient(90deg, #26d66f, #63ee9c)";


        batteryMessage.textContent =
            "البطارية بحالة ممتازة.";

    }

    else if (
        battery > 30
    ) {

        batteryFill.style.background =
            "linear-gradient(90deg, #ffd42a, #ff9d19)";


        batteryMessage.textContent =
            "⚠️ البطارية متوسطة.";

    }

    else if (
        battery > 0
    ) {

        batteryFill.style.background =
            "linear-gradient(90deg, #ff493d, #ff7c31)";


        batteryMessage.textContent =
            "⚠️ البطارية منخفضة.";

    }

    else {

        batteryFill.style.background =
            "#621b1b";


        batteryMessage.textContent =
            "🔋 البطارية فارغة.";


        robotPowered =
            false;


        simRobot.classList.remove(
            "powered"
        );


        robotStatus.textContent =
            "البطارية فارغة";


        powerBtn.textContent =
            "🔌 تشغيل الروبوت";

    }

}


// ==========================================
// شحن البطارية
// ==========================================

chargeBtn.addEventListener(

    "click",

    function () {

        battery =
            100;


        updateBattery();


        robotReply.textContent =
            "⚡ تم شحن البطارية إلى 100%.";


        addLog(
            "شحن البطارية"
        );

    }

);


// ==========================================
// فحص البيئة
// ==========================================

scanBtn.addEventListener(

    "click",

    function () {

        if (
            !robotPowered
        ) {

            robotReply.textContent =
                "⚠️ شغّل الروبوت قبل استخدام الحساسات.";

            return;

        }


        const distance =
            Math.floor(
                Math.random() *
                250
            ) +
            20;


        const temperature =
            Math.floor(
                Math.random() *
                16
            ) +
            18;


        const light =
            Math.floor(
                Math.random() *
                101
            );


        const obstacle =
            distance <
            70;


        distanceSensor.textContent =
            distance +
            " cm";


        temperatureSensor.textContent =
            temperature +
            "°C";


        lightSensor.textContent =
            light +
            "%";


        if (
            obstacle
        ) {

            obstacleSensor.textContent =
                "⚠️ يوجد عائق";


            robotReply.textContent =
                "📡 تم اكتشاف عائق قريب.";

        }

        else {

            obstacleSensor.textContent =
                "لا يوجد";


            robotReply.textContent =
                "📡 تم فحص البيئة ولا يوجد عائق قريب.";

        }


        useBattery(
            1
        );


        addLog(
            "فحص البيئة"
        );

    }

);


// ==========================================
// تنفيذ أمر مكتوب
// ==========================================

function executeCommand() {

    const command =
        commandInput
            .value
            .trim()
            .toLowerCase();


    if (
        command ===
        ""
    ) {

        return;

    }


    if (
        !robotPowered
    ) {

        robotReply.textContent =
            "⚠️ الروبوت متوقف. شغّله أولاً.";


        return;

    }


    let reply =
        "🤖 لم أفهم الأمر.";


    if (
        command.includes(
            "مرحبا"
        ) ||
        command.includes(
            "هلا"
        ) ||
        command.includes(
            "السلام"
        )
    ) {

        reply =
            "🤖 أهلاً! أنا روبوت من Vertex Robots.";

    }


    else if (
        command.includes(
            "اسمك"
        )
    ) {

        reply =
            "🤖 اسمي " +
            robotsData[
                selectedRobot
            ].name +
            ".";

    }


    else if (
        command.includes(
            "امام"
        ) ||
        command.includes(
            "أمام"
        )
    ) {

        moveRobot(
            "forward"
        );


        reply =
            "🤖 أتحرك للأمام.";

    }


    else if (
        command.includes(
            "خلف"
        )
    ) {

        moveRobot(
            "backward"
        );


        reply =
            "🤖 أتحرك للخلف.";

    }


    else if (
        command.includes(
            "يمين"
        )
    ) {

        moveRobot(
            "right"
        );


        reply =
            "🤖 أتحرك لليمين.";

    }


    else if (
        command.includes(
            "يسار"
        )
    ) {

        moveRobot(
            "left"
        );


        reply =
            "🤖 أتحرك لليسار.";

    }


    else if (
        command.includes(
            "بطارية"
        )
    ) {

        reply =
            "🔋 مستوى البطارية " +
            battery +
            "%.";

    }


    else if (
        command.includes(
            "توقف"
        )
    ) {

        simRobot.classList.remove(
            "walking"
        );


        robotStatus.textContent =
            "متوقف في مكانه";


        reply =
            "🤖 توقفت.";

    }


    robotReply.textContent =
        reply;


    addLog(
        "أمر: " +
        command
    );


    commandInput.value =
        "";

}


// ==========================================
// إرسال الأمر
// ==========================================

sendCommandBtn.addEventListener(

    "click",

    executeCommand

);


// Enter
commandInput.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            executeCommand();

        }

    }

);


// ==========================================
// إضافة للسجل
// ==========================================

function addLog(
    text
) {

    const time =
        new Date()
            .toLocaleTimeString(
                "ar-SA"
            );


    robotLogs.unshift({

        text:
            text,

        time:
            time

    });


    if (
        robotLogs.length >
        20
    ) {

        robotLogs.pop();

    }


    renderLog();

}


// ==========================================
// عرض السجل
// ==========================================

function renderLog() {

    robotLog.innerHTML =
        "";


    if (
        robotLogs.length ===
        0
    ) {

        robotLog.innerHTML =

            `
            <p class="empty-log">
                لا توجد أوامر حتى الآن.
            </p>
            `;


        return;

    }


    robotLogs.forEach(

        function (
            item
        ) {

            const logItem =
                document.createElement(
                    "div"
                );


            logItem.className =
                "log-item";


            logItem.innerHTML =

                `
                <strong>
                    ${item.text}
                </strong>

                <span class="log-time">
                    ${item.time}
                </span>
                `;


            robotLog.appendChild(
                logItem
            );

        }

    );

}


// ==========================================
// مسح السجل
// ==========================================

clearLogBtn.addEventListener(

    "click",

    function () {

        robotLogs =
            [];


        renderLog();

    }

);


// ==========================================
// التحكم بالكيبورد
// ==========================================

document.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            document.activeElement ===
            commandInput
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowUp" ||
            event.key.toLowerCase() ===
            "w"
        ) {

            moveRobot(
                "forward"
            );

        }


        if (
            event.key ===
            "ArrowDown" ||
            event.key.toLowerCase() ===
            "s"
        ) {

            moveRobot(
                "backward"
            );

        }


        if (
            event.key ===
            "ArrowLeft" ||
            event.key.toLowerCase() ===
            "a"
        ) {

            moveRobot(
                "left"
            );

        }


        if (
            event.key ===
            "ArrowRight" ||
            event.key.toLowerCase() ===
            "d"
        ) {

            moveRobot(
                "right"
            );

        }

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
// تشغيل الصفحة
// ==========================================

showRobot(
    "assistant"
);


updateRobotPosition();


updateBattery();


renderLog();