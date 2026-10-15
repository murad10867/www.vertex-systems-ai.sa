// ==========================================
// Vertex AI
// ai.js
// ==========================================


// ==========================================
// التحقق من الجلسة
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
// مفاتيح التخزين
// ==========================================

const STORAGE_KEYS = {

    conversations:
        "vertexAIConversations",

    activeConversation:
        "vertexAIActiveConversation",

    memories:
        "vertexMemories",

    settings:
        "vertexAISettings",

    dashboardHistory:
        "vertexChatHistory"

};


// ==========================================
// الإعدادات الافتراضية
// ==========================================

const defaultSettings = {

    assistantName:
        "Vertex AI",

    responseStyle:
        "balanced",

    typingSpeed:
        "normal",

    memoryEnabled:
        true,

    fontSize:
        "medium",

    animations:
        true

};


// ==========================================
// الحالة
// ==========================================

let conversations =
    loadJSON(
        STORAGE_KEYS.conversations,
        []
    );


let memories =
    loadJSON(
        STORAGE_KEYS.memories,
        []
    );


let settings =
    {

        ...defaultSettings,

        ...loadJSON(
            STORAGE_KEYS.settings,
            {}
        )

    };


let activeConversationId =
    localStorage.getItem(
        STORAGE_KEYS.activeConversation
    );


let currentView =
    "chat";


let isGenerating =
    false;


let generationToken =
    0;


let pendingConfirmAction =
    null;


// ==========================================
// DOM
// ==========================================

const aiSidebar =
    document.getElementById(
        "aiSidebar"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const closeSidebarBtn =
    document.getElementById(
        "closeSidebarBtn"
    );


const newChatBtn =
    document.getElementById(
        "newChatBtn"
    );


const conversationSearchInput =
    document.getElementById(
        "conversationSearchInput"
    );


const conversationsList =
    document.getElementById(
        "conversationsList"
    );


const conversationCount =
    document.getElementById(
        "conversationCount"
    );


const topConversationTitle =
    document.getElementById(
        "topConversationTitle"
    );


const topConversationStatus =
    document.getElementById(
        "topConversationStatus"
    );


const renameChatBtn =
    document.getElementById(
        "renameChatBtn"
    );


const deleteChatBtn =
    document.getElementById(
        "deleteChatBtn"
    );


const chatView =
    document.getElementById(
        "chatView"
    );


const memoryView =
    document.getElementById(
        "memoryView"
    );


const settingsView =
    document.getElementById(
        "settingsView"
    );


const memoriesViewBtn =
    document.getElementById(
        "memoriesViewBtn"
    );


const settingsViewBtn =
    document.getElementById(
        "settingsViewBtn"
    );


const projectsBtn =
    document.getElementById(
        "projectsBtn"
    );


const dashboardBtn =
    document.getElementById(
        "dashboardBtn"
    );


const memoryBadge =
    document.getElementById(
        "memoryBadge"
    );


const welcomeScreen =
    document.getElementById(
        "welcomeScreen"
    );


const messagesContainer =
    document.getElementById(
        "messagesContainer"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const characterCount =
    document.getElementById(
        "characterCount"
    );


const sendBtn =
    document.getElementById(
        "sendBtn"
    );


const sendIcon =
    document.getElementById(
        "sendIcon"
    );


const clearInputBtn =
    document.getElementById(
        "clearInputBtn"
    );


const composerArea =
    document.getElementById(
        "composerArea"
    );


// ==========================================
// Memory DOM
// ==========================================

const addMemoryBtn =
    document.getElementById(
        "addMemoryBtn"
    );


const memoriesGrid =
    document.getElementById(
        "memoriesGrid"
    );


const emptyMemoryState =
    document.getElementById(
        "emptyMemoryState"
    );


const memoryModal =
    document.getElementById(
        "memoryModal"
    );


const memoryInput =
    document.getElementById(
        "memoryInput"
    );


const confirmMemoryBtn =
    document.getElementById(
        "confirmMemoryBtn"
    );


// ==========================================
// Rename
// ==========================================

const renameModal =
    document.getElementById(
        "renameModal"
    );


const renameInput =
    document.getElementById(
        "renameInput"
    );


const confirmRenameBtn =
    document.getElementById(
        "confirmRenameBtn"
    );


// ==========================================
// Confirm
// ==========================================

const confirmModal =
    document.getElementById(
        "confirmModal"
    );


const confirmTitle =
    document.getElementById(
        "confirmTitle"
    );


const confirmMessage =
    document.getElementById(
        "confirmMessage"
    );


const confirmActionBtn =
    document.getElementById(
        "confirmActionBtn"
    );


// ==========================================
// Settings
// ==========================================

const assistantNameInput =
    document.getElementById(
        "assistantNameInput"
    );


const responseStyleSelect =
    document.getElementById(
        "responseStyleSelect"
    );


const typingSpeedSelect =
    document.getElementById(
        "typingSpeedSelect"
    );


const memoryEnabledToggle =
    document.getElementById(
        "memoryEnabledToggle"
    );


const fontSizeSelect =
    document.getElementById(
        "fontSizeSelect"
    );


const animationsToggle =
    document.getElementById(
        "animationsToggle"
    );


const saveSettingsBtn =
    document.getElementById(
        "saveSettingsBtn"
    );


const settingsStatus =
    document.getElementById(
        "settingsStatus"
    );


const exportDataBtn =
    document.getElementById(
        "exportDataBtn"
    );


const clearConversationsBtn =
    document.getElementById(
        "clearConversationsBtn"
    );


const clearMemoriesBtn =
    document.getElementById(
        "clearMemoriesBtn"
    );


const resetAISettingsBtn =
    document.getElementById(
        "resetAISettingsBtn"
    );


// ==========================================
// JSON
// ==========================================

function loadJSON(
    key,
    fallback
) {

    const value =
        localStorage.getItem(
            key
        );


    if (
        !value
    ) {

        return fallback;

    }


    try {

        return JSON.parse(
            value
        );

    }

    catch (
        error
    ) {

        console.error(
            "Vertex AI storage error:",
            error
        );


        return fallback;

    }

}


// ==========================================
// ID
// ==========================================

function createId() {

    return (
        Date.now()
            .toString(36)
        +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );

}


// ==========================================
// Date
// ==========================================

function formatTime(
    dateValue
) {

    const date =
        new Date(
            dateValue
        );


    return date.toLocaleTimeString(

        "ar-SA",

        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }

    );

}


function formatConversationDate(
    dateValue
) {

    const date =
        new Date(
            dateValue
        );


    const today =
        new Date();


    if (
        date.toDateString() ===
        today.toDateString()
    ) {

        return "اليوم";

    }


    return date.toLocaleDateString(

        "ar-SA",

        {
            month:
                "short",

            day:
                "numeric"
        }

    );

}


// ==========================================
// Storage
// ==========================================

function saveConversations() {

    localStorage.setItem(

        STORAGE_KEYS.conversations,

        JSON.stringify(
            conversations
        )

    );


    syncDashboardChatHistory();

}


function saveMemories() {

    localStorage.setItem(

        STORAGE_KEYS.memories,

        JSON.stringify(
            memories
        )

    );


    renderMemories();

}


function saveSettings() {

    localStorage.setItem(

        STORAGE_KEYS.settings,

        JSON.stringify(
            settings
        )

    );

}


// ==========================================
// Dashboard compatibility
// ==========================================

function syncDashboardChatHistory() {

    const flattened =
        [];


    conversations.forEach(

        function (
            conversation
        ) {

            conversation.messages
                .forEach(

                    function (
                        message
                    ) {

                        flattened.push({

                            conversationId:
                                conversation.id,

                            role:
                                message.role,

                            content:
                                message.content,

                            createdAt:
                                message.createdAt

                        });

                    }

                );

        }

    );


    localStorage.setItem(

        STORAGE_KEYS.dashboardHistory,

        JSON.stringify(
            flattened
        )

    );

}


// ==========================================
// Active conversation
// ==========================================

function getActiveConversation() {

    return conversations.find(

        function (
            conversation
        ) {

            return (
                conversation.id ===
                activeConversationId
            );

        }

    ) || null;

}


// ==========================================
// New conversation
// ==========================================

function createConversation() {

    stopGeneration();


    const conversation = {

        id:
            createId(),

        title:
            "محادثة جديدة",

        createdAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString(),

        messages:
            []

    };


    conversations.unshift(
        conversation
    );


    activeConversationId =
        conversation.id;


    localStorage.setItem(

        STORAGE_KEYS.activeConversation,

        activeConversationId

    );


    saveConversations();


    showView(
        "chat"
    );


    renderConversations();


    renderChat();


    messageInput.focus();

}


// ==========================================
// Select conversation
// ==========================================

function selectConversation(
    conversationId
) {

    stopGeneration();


    activeConversationId =
        conversationId;


    localStorage.setItem(

        STORAGE_KEYS.activeConversation,

        activeConversationId

    );


    showView(
        "chat"
    );


    renderConversations();


    renderChat();


    aiSidebar.classList.remove(
        "open"
    );

}


// ==========================================
// Sort
// ==========================================

function sortConversations() {

    conversations.sort(

        function (
            a,
            b
        ) {

            return (
                new Date(
                    b.updatedAt
                ).getTime()
                -
                new Date(
                    a.updatedAt
                ).getTime()
            );

        }

    );

}


// ==========================================
// Render conversations
// ==========================================

function renderConversations() {

    sortConversations();


    conversationsList.innerHTML =
        "";


    const search =
        conversationSearchInput
            .value
            .trim()
            .toLowerCase();


    const filtered =
        conversations.filter(

            function (
                conversation
            ) {

                if (
                    !search
                ) {

                    return true;

                }


                const messagesText =
                    conversation.messages
                        .map(

                            function (
                                message
                            ) {

                                return message.content;

                            }

                        )
                        .join(
                            " "
                        );


                const target =
                    (
                        conversation.title
                        +
                        " "
                        +
                        messagesText
                    )
                        .toLowerCase();


                return target.includes(
                    search
                );

            }

        );


    conversationCount.textContent =
        conversations.length;


    if (
        filtered.length ===
        0
    ) {

        conversationsList.innerHTML =

            `
            <div class="empty-conversations">
                ${
                    search
                        ?
                    "لا توجد نتائج."
                        :
                    "لا توجد محادثات بعد."
                }
            </div>
            `;


        return;

    }


    filtered.forEach(

        function (
            conversation
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "conversation-item";


            if (
                conversation.id ===
                activeConversationId
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.innerHTML =

                `
                <span class="conversation-icon">
                    💬
                </span>

                <span class="conversation-text">

                    <strong>
                        ${escapeHTML(conversation.title)}
                    </strong>

                    <small>
                        ${formatConversationDate(conversation.updatedAt)}
                    </small>

                </span>
                `;


            button.addEventListener(

                "click",

                function () {

                    selectConversation(
                        conversation.id
                    );

                }

            );


            conversationsList.appendChild(
                button
            );

        }

    );

}


// ==========================================
// Render Chat
// ==========================================

function renderChat() {

    const conversation =
        getActiveConversation();


    messagesContainer.innerHTML =
        "";


    if (
        !conversation ||
        conversation.messages.length ===
        0
    ) {

        welcomeScreen.style.display =
            "flex";


        messagesContainer.style.display =
            "none";


        topConversationTitle.textContent =
            conversation
                ?
                conversation.title
                :
                "محادثة جديدة";


        topConversationStatus.textContent =
            settings.assistantName +
            " جاهز";


        return;

    }


    welcomeScreen.style.display =
        "none";


    messagesContainer.style.display =
        "block";


    topConversationTitle.textContent =
        conversation.title;


    topConversationStatus.textContent =
        conversation.messages.length +
        " رسالة";


    conversation.messages.forEach(

        function (
            message
        ) {

            appendMessageToDOM(
                message
            );

        }

    );


    scrollMessagesToBottom();

}


// ==========================================
// Message DOM
// ==========================================

function appendMessageToDOM(
    message
) {

    const element =
        document.createElement(
            "article"
        );


    element.className =
        "message " +
        message.role;


    const isUser =
        message.role ===
        "user";


    element.innerHTML =

        `
        <div class="message-avatar">
            ${isUser ? "👤" : "V"}
        </div>

        <div class="message-content">

            <div class="message-header">

                <strong>
                    ${isUser ? "أنت" : escapeHTML(settings.assistantName)}
                </strong>

                <span>
                    ${formatTime(message.createdAt)}
                </span>

            </div>

            <div class="message-text"></div>

            <div class="message-actions">

                <button class="message-action-btn copy-message-btn">
                    📋 نسخ
                </button>

                ${
                    !isUser
                        ?
                    `
                    <button class="message-action-btn remember-message-btn">
                        🧠 تذكر
                    </button>
                    `
                        :
                    ""
                }

            </div>

        </div>
        `;


    const messageText =
        element.querySelector(
            ".message-text"
        );


    messageText.textContent =
        message.content;


    element
        .querySelector(
            ".copy-message-btn"
        )
        .addEventListener(

            "click",

            function () {

                navigator.clipboard
                    .writeText(
                        message.content
                    )
                    .catch(
                        function () {}
                    );

            }

        );


    const rememberButton =
        element.querySelector(
            ".remember-message-btn"
        );


    if (
        rememberButton
    ) {

        rememberButton.addEventListener(

            "click",

            function () {

                addMemory(
                    message.content
                );

            }

        );

    }


    messagesContainer.appendChild(
        element
    );

}


// ==========================================
// Add message
// ==========================================

function addMessage(
    role,
    content
) {

    let conversation =
        getActiveConversation();


    if (
        !conversation
    ) {

        createConversation();


        conversation =
            getActiveConversation();

    }


    const message = {

        id:
            createId(),

        role:
            role,

        content:
            content,

        createdAt:
            new Date()
                .toISOString()

    };


    conversation.messages.push(
        message
    );


    conversation.updatedAt =
        new Date()
            .toISOString();


    if (
        role ===
        "user"
        &&
        (
            conversation.title ===
            "محادثة جديدة"
            ||
            conversation.messages.length ===
            1
        )
    ) {

        conversation.title =
            createConversationTitle(
                content
            );

    }


    saveConversations();


    renderConversations();


    return message;

}


// ==========================================
// Conversation title
// ==========================================

function createConversationTitle(
    text
) {

    const cleaned =
        text
            .replace(/\s+/g, " ")
            .trim();


    if (
        cleaned.length <=
        38
    ) {

        return cleaned;

    }


    return (
        cleaned.slice(
            0,
            38
        )
        +
        "..."
    );

}


// ==========================================
// Send message
// ==========================================

async function sendCurrentMessage() {

    if (
        isGenerating
    ) {

        stopGeneration();


        return;

    }


    const text =
        messageInput
            .value
            .trim();


    if (
        !text
    ) {

        return;

    }


    if (window.VertexVideo?.handlePrompt(text)) return;

    messageInput.value =
        "";


    updateComposer();


    addMessage(
        "user",
        text
    );


    renderChat();


    const currentToken =
        ++generationToken;


    isGenerating =
        true;


    updateGeneratingState();


    const typingElement =
        createTypingIndicator();


    messagesContainer.appendChild(
        typingElement
    );


    scrollMessagesToBottom();


    const delay =
        settings.typingSpeed ===
        "fast"
            ?
        300
            :
        settings.typingSpeed ===
        "slow"
            ?
        900
            :
        550;


    await wait(
        delay
    );


    if (
        currentToken !==
        generationToken
    ) {

        typingElement.remove();


        return;

    }


    let reply;

    try {
        reply = await generateAIReply(text);
    }
    catch (error) {
        console.error("Vertex AI request failed:", error);
        reply = getVertexAIErrorMessage(error);
    }


    typingElement.remove();


    const assistantMessage =
        addMessage(
            "assistant",
            reply
        );


    const assistantElement =
        createAssistantStreamingElement(
            assistantMessage
        );


    messagesContainer.appendChild(
        assistantElement
    );


    scrollMessagesToBottom();


    await typeText(

        assistantElement
            .querySelector(
                ".message-text"
            ),

        reply,

        currentToken

    );


    if (
        currentToken ===
        generationToken
    ) {

        isGenerating =
            false;


        updateGeneratingState();


        renderConversations();

    }

}


// ==========================================
// Typing indicator
// ==========================================

function createTypingIndicator() {

    const element =
        document.createElement(
            "article"
        );


    element.className =
        "message assistant";


    element.innerHTML =

        `
        <div class="message-avatar">
            V
        </div>

        <div class="message-content">

            <div class="message-header">

                <strong>
                    ${escapeHTML(settings.assistantName)}
                </strong>

                <span>
                    يكتب...
                </span>

            </div>

            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>
        `;


    return element;

}


// ==========================================
// Streaming message
// ==========================================

function createAssistantStreamingElement(
    message
) {

    const element =
        document.createElement(
            "article"
        );


    element.className =
        "message assistant";


    element.innerHTML =

        `
        <div class="message-avatar">
            V
        </div>

        <div class="message-content">

            <div class="message-header">

                <strong>
                    ${escapeHTML(settings.assistantName)}
                </strong>

                <span>
                    ${formatTime(message.createdAt)}
                </span>

            </div>

            <div class="message-text"></div>

            <div class="message-actions">

                <button class="message-action-btn copy-message-btn">
                    📋 نسخ
                </button>

                <button class="message-action-btn remember-message-btn">
                    🧠 تذكر
                </button>

            </div>

        </div>
        `;


    element
        .querySelector(
            ".copy-message-btn"
        )
        .addEventListener(

            "click",

            function () {

                navigator.clipboard
                    .writeText(
                        message.content
                    )
                    .catch(
                        function () {}
                    );

            }

        );


    element
        .querySelector(
            ".remember-message-btn"
        )
        .addEventListener(

            "click",

            function () {

                addMemory(
                    message.content
                );

            }

        );


    return element;

}


// ==========================================
// Type text
// ==========================================

function isChatNearBottom(threshold = 12) {
    const distanceFromBottom =
        chatView.scrollHeight -
        chatView.scrollTop -
        chatView.clientHeight;

    return distanceFromBottom <= threshold;
}


async function typeText(
    element,
    text,
    token
) {

    if (!element) {
        return;
    }

    if (!settings.animations || !text) {
        element.textContent = text || "";
        return;
    }

    element.textContent = "";

    const targetDuration =
        settings.typingSpeed === "fast"
            ? 450
            : settings.typingSpeed === "slow"
                ? 1600
                : 900;

    const frameDelay = 16;
    const frameCount = Math.max(1, Math.floor(targetDuration / frameDelay));
    const chunkSize = Math.max(1, Math.ceil(text.length / frameCount));

    for (let i = 0; i < text.length; i += chunkSize) {
        if (token !== generationToken) {
            element.textContent = text;
            return;
        }

        // Follow the reply only while the user is already at the bottom.
        // As soon as the user scrolls up, stop forcing the chat back down.
        const shouldFollowOutput = isChatNearBottom();

        element.textContent += text.slice(i, i + chunkSize);

        if (shouldFollowOutput) {
            scrollMessagesToBottom();
        }

        await wait(frameDelay);
    }

    element.textContent = text;
}


// ==========================================
// Stop
// ==========================================

function stopGeneration() {

    generationToken++;


    isGenerating =
        false;


    updateGeneratingState();


    document
        .querySelectorAll(
            ".typing-dots"
        )
        .forEach(

            function (
                element
            ) {

                const message =
                    element.closest(
                        ".message"
                    );


                if (
                    message
                ) {

                    message.remove();

                }

            }

        );

}


// ==========================================
// Generating UI
// ==========================================

function updateGeneratingState() {

    if (
        isGenerating
    ) {

        sendBtn.classList.add(
            "stop-mode"
        );


        sendIcon.textContent =
            "■";


        topConversationStatus.textContent =
            settings.assistantName +
            " يكتب...";

    }

    else {

        sendBtn.classList.remove(
            "stop-mode"
        );


        sendIcon.textContent =
            "↑";


        const conversation =
            getActiveConversation();


        topConversationStatus.textContent =
            conversation
                ?
                conversation.messages.length +
                " رسالة"
                :
                settings.assistantName +
                " جاهز";

    }

}


// ==========================================
// Real Vertex AI (Supabase Edge Function)
// ==========================================

async function generateAIReply(userText) {
    let client = null;
    if (window.VertexAuth && typeof window.VertexAuth.ensureSupabase === "function") {
        client = await window.VertexAuth.ensureSupabase();
    } else if (typeof supabaseClient !== "undefined" && supabaseClient && supabaseClient.functions) {
        client = supabaseClient;
    }
    if (!client || !client.functions) throw new Error("supabase_not_ready");
    const conversation = getActiveConversation();
    const messages = conversation ? conversation.messages.map(function (message) {
        return { role: message.role, content: message.content };
    }) : [{ role: "user", content: userText }];
    const memoryPayload = settings.memoryEnabled ? memories.slice(0, 20).map(function (memory) {
        return { content: memory.content };
    }) : [];
    const { data, error } = await client.functions.invoke("vertex-ai", {
        body: { messages: messages, memories: memoryPayload, assistantName: settings.assistantName }
    });
    if (error) throw error;
    if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("empty_ai_reply");
    return applyResponseStyle(data.reply.trim());
}

function getVertexAIErrorMessage(error) {
    const message = String(error && error.message ? error.message : error || "").toLowerCase();
    if (message.includes("jwt") || message.includes("401") || message.includes("unauthorized")) {
        return "🔐 انتهت جلسة الدخول. سجّل الدخول من جديد ثم حاول مرة أخرى.";
    }
    if (message.includes("failed to fetch") || message.includes("network")) {
        return "🌐 تعذر الاتصال بخدمة Vertex AI. تأكد من الإنترنت ثم حاول مرة أخرى.";
    }
    return "⚠️ تعذر الحصول على رد من Vertex AI الآن. حاول مرة أخرى بعد قليل.";
}
// ==========================================
// Local AI
// ==========================================

function generateLocalReply(
    userText
) {

    const text =
        userText
            .toLowerCase()
            .trim();


    const name =
        settings.assistantName;


    const memoryText =
        settings.memoryEnabled &&
        memories.length >
        0
            ?
        "\n\n🧠 عندي في الذاكرة " +
        memories.length +
        " معلومة محفوظة."
            :
        "";


    let response;


    // greetings

    if (
        containsAny(
            text,
            [
                "السلام",
                "مرحبا",
                "مرحباً",
                "هلا",
                "هاي",
                "hello"
            ]
        )
    ) {

        response =
            "أهلاً 👋 أنا " +
            name +
            ". كيف أقدر أساعدك اليوم؟";

    }


    // identity

    else if (
        containsAny(
            text,
            [
                "من انت",
                "من أنت",
                "وش اسمك",
                "ما اسمك",
                "اسمك"
            ]
        )
    ) {

        response =
            "أنا " +
            name +
            "، المساعد الموجود داخل Vertex Systems AI. هذه النسخة تعمل محليًا داخل المتصفح باستخدام JavaScript.";

    }


    // AI

    else if (
        containsAny(
            text,
            [
                "ذكاء اصطناعي",
                "الذكاء الاصطناعي",
                "ai"
            ]
        )
    ) {

        response =
            "الذكاء الاصطناعي هو مجال يجعل البرامج والأنظمة قادرة على تنفيذ مهام تحتاج عادةً إلى قدر من الفهم أو التعلّم أو اتخاذ القرار. من أمثلته فهم النصوص، التعرف على الصور، التنبؤ، والروبوتات الذكية.";

    }


    // JS

    else if (
        containsAny(
            text,
            [
                "javascript",
                "جافاسكربت",
                "java script"
            ]
        )
    ) {

        response =
            "JavaScript هي اللغة التي تضيف التفاعل للمواقع. بعد HTML وCSS، تقدر تستخدمها للأزرار، القوائم، الألعاب البسيطة، حفظ البيانات في LocalStorage، وجلب البيانات من APIs.\n\nأفضل بداية: المتغيرات → الشروط → الحلقات → الدوال → DOM → الأحداث → LocalStorage.";

    }


    // HTML

    else if (
        containsAny(
            text,
            [
                "html"
            ]
        )
    ) {

        response =
            "HTML يبني هيكل صفحة الويب: العناوين، الفقرات، الصور، الأزرار والأقسام. CSS يهتم بالشكل، وJavaScript يهتم بالتفاعل.";

    }


    // CSS

    else if (
        containsAny(
            text,
            [
                "css"
            ]
        )
    ) {

        response =
            "CSS مسؤول عن تصميم الموقع: الألوان، الأحجام، المسافات، Grid وFlexbox، الحركات، والتجاوب مع الجوال.";

    }


    // Godot

    else if (
        containsAny(
            text,
            [
                "godot",
                "قودوت",
                "قودت"
            ]
        )
    ) {

        response =
            "Godot محرك ألعاب مفتوح المصدر يدعم الألعاب ثنائية وثلاثية الأبعاد. في مشروع ثلاثي الأبعاد تبدأ عادةً بـ Node3D، وتستخدم CharacterBody3D للشخصية، وGDScript لكتابة الحركة والمنطق.";

    }


    // GDScript

    else if (
        containsAny(
            text,
            [
                "gdscript",
                "جي دي سكربت"
            ]
        )
    ) {

        response =
            "GDScript لغة Godot الأساسية، وصياغتها قريبة من Python. أهم الأشياء التي تحتاجها: var، func، if، for، signals، nodes، وطرق مثل _ready() و _process() و _physics_process().";

    }


    // Minecraft project

    else if (
        containsAny(
            text,
            [
                "minecraft rell",
                "x1000",
                "ماينكرافت"
            ]
        )
    ) {

        response =
            "Minecraft Rell X1000 هو مشروع ضخم، والأفضل تطويره على مراحل بدل محاولة بناء العالم كاملًا مرة واحدة.\n\nابدأ بـ: حركة اللاعب → الكاميرا → الأرض → كسر ووضع المكعبات → حفظ العالم → التضاريس → الذكاء الاصطناعي → الكواكب والفضاء.";

    }


    // Games

    else if (
        containsAny(
            text,
            [
                "فكرة لعبة",
                "لعبة جديدة",
                "game idea"
            ]
        )
    ) {

        response =
            "🎮 فكرة: لعبة اسمها Vertex Planet Zero. تبدأ على كوكب مجهول بعد تحطم مركبتك. تجمع الموارد، تبني قاعدة، تصنع روبوتات تساعدك، ثم تطور مركبة للوصول إلى أقمار وكواكب أخرى. كل منطقة فيها طقس وجاذبية ومخلوقات مختلفة.";

    }


    // Space

    else if (
        containsAny(
            text,
            [
                "فضاء",
                "كوكب",
                "نجوم",
                "الثقب الأسود",
                "ثقب اسود",
                "مجرة"
            ]
        )
    ) {

        response =
            "🌌 معلومة فضائية: النظام الشمسي يوجد في مجرة درب التبانة داخل منطقة تسمى الذراع المحلي أو Orion Spur، ويبعد تقريبًا 26 ألف سنة ضوئية عن مركز المجرة.";

    }


    // memory request

    else if (
        containsAny(
            text,
            [
                "تذكر أن",
                "تذكر ان",
                "احفظ أن",
                "احفظ ان"
            ]
        )
    ) {

        const cleaned =
            userText
                .replace(
                    /تذكر أن|تذكر ان|احفظ أن|احفظ ان/gi,
                    ""
                )
                .trim();


        if (
            cleaned
        ) {

            addMemory(
                cleaned
            );


            response =
                "🧠 تم حفظ هذه المعلومة في ذاكرة Vertex AI:\n\"" +
                cleaned +
                "\"";

        }

        else {

            response =
                "اكتب المعلومة بعد كلمة «تذكر أن» وسأحفظها.";

        }

    }


    // memory question

    else if (
        containsAny(
            text,
            [
                "ماذا تتذكر",
                "وش تتذكر",
                "ايش تتذكر",
                "ذاكرتك"
            ]
        )
    ) {

        if (
            !settings.memoryEnabled
        ) {

            response =
                "استخدام الذاكرة متوقف من الإعدادات.";

        }

        else if (
            memories.length ===
            0
        ) {

            response =
                "🧠 لا توجد معلومات محفوظة في الذاكرة حتى الآن.";

        }

        else {

            response =
                "🧠 المعلومات المحفوظة عندي:\n\n" +
                memories
                    .slice(
                        0,
                        10
                    )
                    .map(

                        function (
                            memory,
                            index
                        ) {

                            return (
                                (index + 1) +
                                ". " +
                                memory.content
                            );

                        }

                    )
                    .join(
                        "\n"
                    );

        }

    }


    // Help

    else if (
        containsAny(
            text,
            [
                "ماذا تستطيع",
                "وش تقدر",
                "ايش تقدر",
                "ساعدني"
            ]
        )
    ) {

        response =
            "أقدر في هذه النسخة المحلية أساعدك بمعلومات وتجارب مبرمجة مسبقًا عن البرمجة وVertex والألعاب والفضاء، وأحفظ الذكريات والمحادثات داخل المتصفح.\n\nولما نربطني لاحقًا بـ API حقيقي، أقدر أتعامل مع أسئلة مفتوحة بشكل أذكى بكثير.";

    }


    // Default

    else {

        response =
            "فهمت رسالتك: \"" +
            userText +
            "\".\n\nلكن هذه النسخة من " +
            name +
            " ما زالت محلية وليست نموذج ذكاء اصطناعي حقيقي، لذلك معرفتي بالأسئلة المفتوحة محدودة. جرّب تسألني عن البرمجة، Godot، GDScript، Vertex، الألعاب أو الفضاء.";

    }


    response =
        applyResponseStyle(
            response
        );


    return (
        response +
        memoryText
    );

}


// ==========================================
// Response style
// ==========================================

function applyResponseStyle(
    response
) {

    if (
        settings.responseStyle ===
        "short"
    ) {

        const firstParagraph =
            response
                .split(
                    "\n\n"
                )[0];


        return firstParagraph;

    }


    if (
        settings.responseStyle ===
        "detailed"
    ) {

        return (
            response +
            "\n\nإذا احتجت، أقدر أكمل لك الموضوع خطوة بخطوة داخل Vertex AI."
        );

    }


    return response;

}


// ==========================================
// containsAny
// ==========================================

function containsAny(
    text,
    terms
) {

    return terms.some(

        function (
            term
        ) {

            return text.includes(
                term
            );

        }

    );

}


// ==========================================
// Memory
// ==========================================

function addMemory(
    content
) {

    const value =
        String(
            content
        )
            .trim();


    if (
        !value
    ) {

        return;

    }


    const duplicate =
        memories.some(

            function (
                memory
            ) {

                return (
                    memory.content
                        .toLowerCase()
                    ===
                    value
                        .toLowerCase()
                );

            }

        );


    if (
        duplicate
    ) {

        return;

    }


    memories.unshift({

        id:
            createId(),

        content:
            value,

        createdAt:
            new Date()
                .toISOString()

    });


    saveMemories();

}


// ==========================================
// Render memories
// ==========================================

function renderMemories() {

    memoryBadge.textContent =
        memories.length;


    memoriesGrid.innerHTML =
        "";


    if (
        memories.length ===
        0
    ) {

        emptyMemoryState.classList.add(
            "visible"
        );


        return;

    }


    emptyMemoryState.classList.remove(
        "visible"
    );


    memories.forEach(

        function (
            memory
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "memory-card";


            card.innerHTML =

                `
                <div class="memory-card-top">

                    <span class="memory-card-icon">
                        🧠
                    </span>

                    <button
                        class="delete-memory-btn"
                        title="حذف"
                    >
                        🗑️
                    </button>

                </div>

                <p>
                    ${escapeHTML(memory.content)}
                </p>

                <small>
                    ${new Date(memory.createdAt).toLocaleDateString("ar-SA")}
                </small>
                `;


            card
                .querySelector(
                    ".delete-memory-btn"
                )
                .addEventListener(

                    "click",

                    function () {

                        memories =
                            memories.filter(

                                function (
                                    item
                                ) {

                                    return (
                                        item.id !==
                                        memory.id
                                    );

                                }

                            );


                        saveMemories();

                    }

                );


            memoriesGrid.appendChild(
                card
            );

        }

    );

}


// ==========================================
// Views
// ==========================================

function showView(
    viewName
) {

    currentView =
        viewName;


    [
        chatView,
        memoryView,
        settingsView
    ].forEach(

        function (
            view
        ) {

            view.classList.remove(
                "active-view"
            );

        }

    );


    composerArea.style.display =
        "none";


    renameChatBtn.style.display =
        "none";


    deleteChatBtn.style.display =
        "none";


    if (
        viewName ===
        "chat"
    ) {

        chatView.classList.add(
            "active-view"
        );


        composerArea.style.display =
            "block";


        renameChatBtn.style.display =
            "";


        deleteChatBtn.style.display =
            "";


        const conversation =
            getActiveConversation();


        topConversationTitle.textContent =
            conversation
                ?
                conversation.title
                :
                "محادثة جديدة";


        renderChat();

    }


    if (
        viewName ===
        "memory"
    ) {

        memoryView.classList.add(
            "active-view"
        );


        topConversationTitle.textContent =
            "ذاكرة Vertex AI";


        topConversationStatus.textContent =
            memories.length +
            " معلومة محفوظة";


        renderMemories();

    }


    if (
        viewName ===
        "settings"
    ) {

        settingsView.classList.add(
            "active-view"
        );


        topConversationTitle.textContent =
            "إعدادات Vertex AI";


        topConversationStatus.textContent =
            "تخصيص النظام";


        loadSettingsIntoControls();

    }


    aiSidebar.classList.remove(
        "open"
    );

}


// ==========================================
// Rename
// ==========================================

function renameActiveConversation() {

    const conversation =
        getActiveConversation();


    if (
        !conversation
    ) {

        return;

    }


    renameInput.value =
        conversation.title;


    openModal(
        renameModal
    );


    setTimeout(

        function () {

            renameInput.focus();

            renameInput.select();

        },

        50

    );

}


function confirmRename() {

    const conversation =
        getActiveConversation();


    if (
        !conversation
    ) {

        closeModal(
            renameModal
        );


        return;

    }


    const name =
        renameInput
            .value
            .trim();


    if (
        !name
    ) {

        return;

    }


    conversation.title =
        name;


    conversation.updatedAt =
        new Date()
            .toISOString();


    saveConversations();


    renderConversations();


    renderChat();


    closeModal(
        renameModal
    );

}


// ==========================================
// Delete conversation
// ==========================================

function requestDeleteConversation() {

    const conversation =
        getActiveConversation();


    if (
        !conversation
    ) {

        return;

    }


    openConfirmation(

        "حذف المحادثة؟",

        "سيتم حذف \"" +
        conversation.title +
        "\" نهائيًا.",

        function () {

            stopGeneration();


            conversations =
                conversations.filter(

                    function (
                        item
                    ) {

                        return (
                            item.id !==
                            conversation.id
                        );

                    }

                );


            activeConversationId =
                conversations.length >
                0
                    ?
                    conversations[0].id
                    :
                    null;


            if (
                activeConversationId
            ) {

                localStorage.setItem(

                    STORAGE_KEYS.activeConversation,

                    activeConversationId

                );

            }

            else {

                localStorage.removeItem(
                    STORAGE_KEYS.activeConversation
                );

            }


            saveConversations();


            renderConversations();


            renderChat();

        }

    );

}


// ==========================================
// Settings
// ==========================================

function loadSettingsIntoControls() {

    assistantNameInput.value =
        settings.assistantName;


    responseStyleSelect.value =
        settings.responseStyle;


    typingSpeedSelect.value =
        settings.typingSpeed;


    memoryEnabledToggle.checked =
        settings.memoryEnabled;


    fontSizeSelect.value =
        settings.fontSize;


    animationsToggle.checked =
        settings.animations;

}


function saveSettingsFromControls() {

    settings = {

        assistantName:
            assistantNameInput
                .value
                .trim()
            ||
            "Vertex AI",

        responseStyle:
            responseStyleSelect.value,

        typingSpeed:
            typingSpeedSelect.value,

        memoryEnabled:
            memoryEnabledToggle.checked,

        fontSize:
            fontSizeSelect.value,

        animations:
            animationsToggle.checked

    };


    saveSettings();


    applySettings();


    settingsStatus.textContent =
        "✅ تم الحفظ";


    setTimeout(

        function () {

            settingsStatus.textContent =
                "";

        },

        1800

    );

}


// ==========================================
// Apply settings
// ==========================================

function applySettings() {

    document.body.classList.remove(

        "ai-font-small",
        "ai-font-medium",
        "ai-font-large"

    );


    document.body.classList.add(

        "ai-font-" +
        settings.fontSize

    );


    document.body.classList.toggle(

        "no-ai-animations",

        !settings.animations

    );

}


// ==========================================
// Reset Settings
// ==========================================

function resetSettings() {

    settings =
        {
            ...defaultSettings
        };


    saveSettings();


    loadSettingsIntoControls();


    applySettings();

}


// ==========================================
// Export
// ==========================================

function exportAIData() {

    const exportData = {

        product:
            "Vertex AI",

        exportedAt:
            new Date()
                .toISOString(),

        conversations:
            conversations,

        memories:
            memories,

        settings:
            settings

    };


    const blob =
        new Blob(

            [
                JSON.stringify(
                    exportData,
                    null,
                    2
                )
            ],

            {
                type:
                    "application/json"
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
        "vertex-ai-data.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


// ==========================================
// Clear All Conversations
// ==========================================

function requestClearConversations() {

    openConfirmation(

        "مسح جميع المحادثات؟",

        "سيتم حذف كل محادثات Vertex AI نهائيًا.",

        function () {

            stopGeneration();


            conversations =
                [];


            activeConversationId =
                null;


            localStorage.removeItem(
                STORAGE_KEYS.activeConversation
            );


            saveConversations();


            renderConversations();


            renderChat();

        }

    );

}


// ==========================================
// Clear Memories
// ==========================================

function requestClearMemories() {

    openConfirmation(

        "مسح ذاكرة Vertex AI؟",

        "سيتم حذف جميع المعلومات المحفوظة.",

        function () {

            memories =
                [];


            saveMemories();

        }

    );

}


// ==========================================
// Confirmation
// ==========================================

function openConfirmation(
    title,
    message,
    action
) {

    confirmTitle.textContent =
        title;


    confirmMessage.textContent =
        message;


    pendingConfirmAction =
        action;


    openModal(
        confirmModal
    );

}


// ==========================================
// Modals
// ==========================================

function openModal(
    modal
) {

    modal.classList.add(
        "visible"
    );

}


function closeModal(
    modal
) {

    modal.classList.remove(
        "visible"
    );

}


// ==========================================
// Composer
// ==========================================

function updateComposer() {

    const length =
        messageInput.value.length;


    characterCount.textContent =
        length +
        " / 5000";


    if (
        !isGenerating
    ) {

        sendBtn.disabled =
            (
                messageInput
                    .value
                    .trim()
                    .length ===
                0
            );

    }


    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            160
        )
        +
        "px";

}


// ==========================================
// Scroll
// ==========================================

function scrollMessagesToBottom() {

    chatView.scrollTop =
        chatView.scrollHeight;

}


// ==========================================
// Escape HTML
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
// Wait
// ==========================================

function wait(
    milliseconds
) {

    return new Promise(

        function (
            resolve
        ) {

            setTimeout(
                resolve,
                milliseconds
            );

        }

    );

}


// ==========================================
// Sidebar
// ==========================================

menuBtn.addEventListener(

    "click",

    function () {

        aiSidebar.classList.add(
            "open"
        );

    }

);


closeSidebarBtn.addEventListener(

    "click",

    function () {

        aiSidebar.classList.remove(
            "open"
        );

    }

);


// ==========================================
// New Chat
// ==========================================

newChatBtn.addEventListener(

    "click",

    createConversation

);


// ==========================================
// Search
// ==========================================

conversationSearchInput.addEventListener(

    "input",

    renderConversations

);


// ==========================================
// View buttons
// ==========================================

memoriesViewBtn.addEventListener(

    "click",

    function () {

        showView(
            "memory"
        );

    }

);


settingsViewBtn.addEventListener(

    "click",

    function () {

        showView(
            "settings"
        );

    }

);


projectsBtn.addEventListener(

    "click",

    function () {

        window.location.href =
            "dashboard.html";

    }

);


dashboardBtn.addEventListener(

    "click",

    function () {

        window.location.href =
            "dashboard.html";

    }

);


// ==========================================
// Rename/Delete
// ==========================================

renameChatBtn.addEventListener(

    "click",

    renameActiveConversation

);


deleteChatBtn.addEventListener(

    "click",

    requestDeleteConversation

);


confirmRenameBtn.addEventListener(

    "click",

    confirmRename

);


renameInput.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            confirmRename();

        }

    }

);


// ==========================================
// Suggestions
// ==========================================

document
    .querySelectorAll(
        ".suggestion-card"
    )
    .forEach(

        function (
            button
        ) {

            button.addEventListener(

                "click",

                function () {

                    messageInput.value =
                        button.dataset.prompt;


                    updateComposer();


                    sendCurrentMessage();

                }

            );

        }

    );


// ==========================================
// Send
// ==========================================

sendBtn.addEventListener(

    "click",

    sendCurrentMessage

);


messageInput.addEventListener(

    "input",

    updateComposer

);


messageInput.addEventListener(

    "keydown",

    function (
        event
    ) {

        if (
            event.key ===
            "Enter"
            &&
            !event.shiftKey
        ) {

            event.preventDefault();


            sendCurrentMessage();

        }

    }

);


clearInputBtn.addEventListener(

    "click",

    function () {

        messageInput.value =
            "";


        updateComposer();


        messageInput.focus();

    }

);


// ==========================================
// Memory
// ==========================================

addMemoryBtn.addEventListener(

    "click",

    function () {

        memoryInput.value =
            "";


        openModal(
            memoryModal
        );


        setTimeout(

            function () {

                memoryInput.focus();

            },

            50

        );

    }

);


confirmMemoryBtn.addEventListener(

    "click",

    function () {

        const content =
            memoryInput
                .value
                .trim();


        if (
            !content
        ) {

            return;

        }


        addMemory(
            content
        );


        closeModal(
            memoryModal
        );

    }

);


// ==========================================
// Settings actions
// ==========================================

saveSettingsBtn.addEventListener(

    "click",

    saveSettingsFromControls

);


exportDataBtn.addEventListener(

    "click",

    exportAIData

);


clearConversationsBtn.addEventListener(

    "click",

    requestClearConversations

);


clearMemoriesBtn.addEventListener(

    "click",

    requestClearMemories

);


resetAISettingsBtn.addEventListener(

    "click",

    function () {

        openConfirmation(

            "إعادة إعدادات Vertex AI؟",

            "سيتم إرجاع الإعدادات للوضع الافتراضي.",

            resetSettings

        );

    }

);


// ==========================================
// Confirm Action
// ==========================================

confirmActionBtn.addEventListener(

    "click",

    function () {

        if (
            typeof pendingConfirmAction ===
            "function"
        ) {

            pendingConfirmAction();

        }


        pendingConfirmAction =
            null;


        closeModal(
            confirmModal
        );

    }

);


// ==========================================
// Close modals
// ==========================================

document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(

        function (
            element
        ) {

            element.addEventListener(

                "click",

                function () {

                    const modal =
                        document.getElementById(
                            element.dataset.closeModal
                        );


                    if (
                        modal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                }

            );

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

            document
                .querySelectorAll(
                    ".modal.visible"
                )
                .forEach(

                    function (
                        modal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                );


            aiSidebar.classList.remove(
                "open"
            );

        }

    }

);


// ==========================================
// Mobile sidebar click outside
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
            aiSidebar.contains(
                event.target
            )
            ||
            menuBtn.contains(
                event.target
            )
        ) {

            return;

        }


        aiSidebar.classList.remove(
            "open"
        );

    }

);


// ==========================================
// Validate Active Conversation
// ==========================================

function validateActiveConversation() {

    const exists =
        conversations.some(

            function (
                conversation
            ) {

                return (
                    conversation.id ===
                    activeConversationId
                );

            }

        );


    if (
        exists
    ) {

        return;

    }


    if (
        conversations.length >
        0
    ) {

        activeConversationId =
            conversations[0].id;


        localStorage.setItem(

            STORAGE_KEYS.activeConversation,

            activeConversationId

        );

    }

    else {

        activeConversationId =
            null;


        localStorage.removeItem(
            STORAGE_KEYS.activeConversation
        );

    }

}


// ==========================================
// Startup
// ==========================================

validateActiveConversation();


applySettings();


loadSettingsIntoControls();


renderConversations();


renderMemories();


renderChat();


syncDashboardChatHistory();


updateComposer();
