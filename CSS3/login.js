// ==========================================
// Vertex Systems AI - Supabase Login
// تسجيل دخول حقيقي عبر Supabase
// ==========================================

const systems = {
    ai: { name: "Vertex AI", icon: "🤖", page: "ai.html" },
    robots: { name: "Vertex Robots", icon: "🦾", page: "robots.html" },
    games: { name: "Vertex Games", icon: "🎮", page: "games.html" },
    web: { name: "Vertex Web", icon: "🌐", page: "web.html" },
    space: { name: "Vertex Space", icon: "🌌", page: "space.html" }
};

const homeBtn = document.getElementById("homeBtn");
const backHomeBtn = document.getElementById("backHomeBtn");
const loginForm = document.getElementById("loginForm");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const rememberMe = document.getElementById("rememberMe");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const requestedSystemIcon = document.getElementById("requestedSystemIcon");
const requestedSystemName = document.getElementById("requestedSystemName");
const existingSession = document.getElementById("existingSession");
const sessionUserName = document.getElementById("sessionUserName");
const continueSessionBtn = document.getElementById("continueSessionBtn");
const differentAccountBtn = document.getElementById("differentAccountBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotModal = document.getElementById("forgotModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOkBtn = document.getElementById("modalOkBtn");
const modalOverlay = document.querySelector(".modal-overlay");
const particles = document.getElementById("particles");

const forgotModalTitle = forgotModal ? forgotModal.querySelector("h2") : null;
const forgotModalText = forgotModal ? forgotModal.querySelector("p") : null;
const modalCard = forgotModal ? forgotModal.querySelector(".modal-card") : null;

let requestedSystem = localStorage.getItem("vertexRequestedSystem");
let currentSupabaseUser = null;
let modalMode = "reset-request";
let recoveryFields = null;
let recoveryPasswordInput = null;
let recoveryConfirmInput = null;

function isSupabaseReady() {
    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient &&
        supabaseClient.auth
    );
}

function getDestinationPage() {
    if (requestedSystem && systems[requestedSystem]) {
        return systems[requestedSystem].page;
    }

    const returnPage = localStorage.getItem("vertexReturnPage");

    if (
        returnPage &&
        /^[a-zA-Z0-9_-]+\.html$/.test(returnPage) &&
        returnPage !== "login.html" &&
        returnPage !== "index.html"
    ) {
        return returnPage;
    }

    return "dashboard.html";
}

function updateRequestedSystem() {
    if (requestedSystem && systems[requestedSystem]) {
        requestedSystemIcon.textContent = systems[requestedSystem].icon;
        requestedSystemName.textContent = systems[requestedSystem].name;
    } else {
        requestedSystemIcon.textContent = "📊";
        requestedSystemName.textContent = "لوحة التحكم";
    }
}

function goHome() {
    window.location.href = "index.html";
}

homeBtn?.addEventListener("click", goHome);
backHomeBtn?.addEventListener("click", goHome);

togglePasswordBtn?.addEventListener("click", function () {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    togglePasswordBtn.textContent = show ? "🙈" : "👁️";
    togglePasswordBtn.setAttribute(
        "aria-label",
        show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
    );
});

function clearErrors() {
    if (nameError) nameError.textContent = "";
    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";

    document.querySelectorAll(".input-wrapper").forEach(function (wrapper) {
        wrapper.classList.remove("error");
    });
}

function showFieldError(input, errorElement, message) {
    if (errorElement) errorElement.textContent = message;
    const wrapper = input?.closest(".input-wrapper");
    if (wrapper) wrapper.classList.add("error");
}

function showFormMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = "form-message visible " + type;
}

function hideFormMessage() {
    if (!formMessage) return;
    formMessage.className = "form-message";
    formMessage.textContent = "";
}

function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("loading", loading);
    submitBtn.disabled = loading;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateLoginForm() {
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    if (!email) {
        showFieldError(emailInput, emailError, "اكتب البريد الإلكتروني.");
        valid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(emailInput, emailError, "صيغة البريد الإلكتروني غير صحيحة.");
        valid = false;
    }

    if (!password) {
        showFieldError(passwordInput, passwordError, "اكتب كلمة المرور.");
        valid = false;
    }

    return valid;
}

function saveRememberedEmail(email) {
    if (rememberMe?.checked) {
        localStorage.setItem("vertexRememberedEmail", email);
    } else {
        localStorage.removeItem("vertexRememberedEmail");
    }
}

function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem("vertexRememberedEmail");
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberMe) rememberMe.checked = true;
    }
}

function getDisplayName(user, typedName = "") {
    const metadata = user?.user_metadata || {};
    return (
        metadata.full_name ||
        metadata.name ||
        typedName ||
        (user?.email ? user.email.split("@")[0] : "") ||
        "مستخدم Vertex"
    );
}

function getFriendlyAuthError(error) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("invalid login credentials")) {
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }

    if (message.includes("email not confirmed")) {
        return "يجب تأكيد البريد الإلكتروني أولاً من الرسالة التي وصلتك.";
    }

    if (message.includes("rate limit") || message.includes("too many requests")) {
        return "تمت محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.";
    }

    if (message.includes("failed to fetch") || message.includes("network")) {
        return "تعذر الاتصال بالخادم. تأكد من الإنترنت ثم حاول مرة أخرى.";
    }

    return "تعذر إكمال العملية. تأكد من البيانات وحاول مرة أخرى.";
}

loginForm?.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideFormMessage();

    if (!isSupabaseReady()) {
        showFormMessage(
            "❌ لم يتم تحميل اتصال Supabase. تأكد من supabase-config.js.",
            "error"
        );
        return;
    }

    if (!validateLoginForm()) {
        showFormMessage("⚠️ تأكد من البيانات المكتوبة.", "error");
        return;
    }

    const typedName = nameInput?.value.trim() || "";
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    setLoading(true);

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        if (!data.session || !data.user) throw new Error("No active session returned");

        currentSupabaseUser = data.user;
        saveRememberedEmail(email);

        if (typedName && !data.user.user_metadata?.name) {
            try {
                await supabaseClient.auth.updateUser({
                    data: { name: typedName }
                });
            } catch (metadataError) {
                console.warn("Could not save display name:", metadataError);
            }
        }

        const destination = getDestinationPage();
        localStorage.removeItem("vertexRequestedSystem");
        localStorage.removeItem("vertexReturnPage");
        window.location.replace(destination);
    } catch (error) {
        console.error("Vertex login error:", error);
        showFormMessage("❌ " + getFriendlyAuthError(error), "error");
        setLoading(false);
    }
});

[nameInput, emailInput, passwordInput].forEach(function (input) {
    input?.addEventListener("input", function () {
        input.closest(".input-wrapper")?.classList.remove("error");
        hideFormMessage();
    });
});

async function checkExistingSession() {
    if (!isSupabaseReady()) {
        existingSession?.classList.remove("visible");
        if (loginForm) loginForm.style.display = "block";
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        const session = data.session;

        if (!session?.user) {
            currentSupabaseUser = null;
            existingSession?.classList.remove("visible");
            if (loginForm) loginForm.style.display = "block";
            return;
        }

        currentSupabaseUser = session.user;
        const destination = getDestinationPage();
        localStorage.removeItem("vertexRequestedSystem");
        localStorage.removeItem("vertexReturnPage");
        window.location.replace(destination);
    } catch (error) {
        console.error("Session check error:", error);
        existingSession?.classList.remove("visible");
        if (loginForm) loginForm.style.display = "block";
    }
}

continueSessionBtn?.addEventListener("click", function () {
    const destination = getDestinationPage();
    localStorage.removeItem("vertexRequestedSystem");
    localStorage.removeItem("vertexReturnPage");
    window.location.href = destination;
});

differentAccountBtn?.addEventListener("click", async function () {
    if (isSupabaseReady()) {
        try {
            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }

    currentSupabaseUser = null;
    existingSession?.classList.remove("visible");
    if (loginForm) loginForm.style.display = "block";
    if (passwordInput) passwordInput.value = "";
    emailInput?.focus();
});

function ensureRecoveryFields() {
    if (recoveryFields || !modalCard || !modalOkBtn) return;

    recoveryFields = document.createElement("div");
    recoveryFields.id = "vertexRecoveryFields";
    recoveryFields.innerHTML = `
        <div class="input-group" style="margin-top:16px">
            <label for="vertexNewPassword">كلمة المرور الجديدة</label>
            <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input id="vertexNewPassword" type="password" placeholder="12 حرفًا على الأقل" autocomplete="new-password">
            </div>
        </div>
        <div class="input-group" style="margin-top:12px">
            <label for="vertexConfirmPassword">تأكيد كلمة المرور</label>
            <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input id="vertexConfirmPassword" type="password" placeholder="أعد كتابة كلمة المرور" autocomplete="new-password">
            </div>
        </div>
    `;

    modalCard.insertBefore(recoveryFields, modalOkBtn);
    recoveryPasswordInput = recoveryFields.querySelector("#vertexNewPassword");
    recoveryConfirmInput = recoveryFields.querySelector("#vertexConfirmPassword");
}

function hideRecoveryFields() {
    if (recoveryFields) recoveryFields.style.display = "none";
}

function openForgotModal(mode = "reset-request") {
    if (!forgotModal) return;

    modalMode = mode;
    forgotModal.classList.add("visible");

    if (mode === "recovery") {
        ensureRecoveryFields();
        if (recoveryFields) recoveryFields.style.display = "block";
        if (forgotModalTitle) forgotModalTitle.textContent = "تعيين كلمة مرور جديدة";
        if (forgotModalText) {
            forgotModalText.textContent =
                "اكتب كلمة مرور من 12 حرفًا على الأقل وبها حرف كبير وصغير ورقم ورمز.";
        }
        if (modalOkBtn) modalOkBtn.textContent = "حفظ كلمة المرور الجديدة";
        setTimeout(() => recoveryPasswordInput?.focus(), 50);
        return;
    }

    hideRecoveryFields();
    if (forgotModalTitle) forgotModalTitle.textContent = "استعادة كلمة المرور";
    if (forgotModalText) {
        forgotModalText.textContent =
            "سنرسل رابط استعادة كلمة المرور إلى البريد المكتوب في نموذج تسجيل الدخول.";
    }
    if (modalOkBtn) modalOkBtn.textContent = "إرسال رابط الاستعادة";
}

function closeForgotModal() {
    forgotModal?.classList.remove("visible");
    if (modalMode !== "recovery") modalMode = "reset-request";
}

forgotPasswordBtn?.addEventListener("click", function () {
    hideFormMessage();
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
        showFieldError(emailInput, emailError, "اكتب بريدك الإلكتروني الصحيح أولاً.");
        emailInput.focus();
        return;
    }

    openForgotModal("reset-request");
});

closeModalBtn?.addEventListener("click", closeForgotModal);
modalOverlay?.addEventListener("click", function () {
    if (modalMode !== "recovery") closeForgotModal();
});

function isStrongPassword(password) {
    return (
        password.length >= 12 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

modalOkBtn?.addEventListener("click", async function () {
    if (!isSupabaseReady()) {
        if (forgotModalText) forgotModalText.textContent = "تعذر الاتصال بـ Supabase.";
        return;
    }

    if (modalMode === "sent") {
        closeForgotModal();
        return;
    }

    if (modalMode === "reset-request") {
        const email = emailInput.value.trim();

        if (!email || !isValidEmail(email)) {
            closeForgotModal();
            showFieldError(emailInput, emailError, "اكتب بريدك الإلكتروني الصحيح أولاً.");
            return;
        }

        modalOkBtn.disabled = true;
        modalOkBtn.textContent = "جارٍ الإرسال...";

        try {
            const redirectTo = new URL("login.html", window.location.href).href;
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo
            });
            if (error) throw error;

            modalMode = "sent";
            if (forgotModalTitle) forgotModalTitle.textContent = "تم إرسال الرابط ✅";
            if (forgotModalText) {
                forgotModalText.textContent =
                    "إذا كان البريد مسجلاً، ستصلك رسالة استعادة. افتح الرابط الموجود فيها.";
            }
            modalOkBtn.textContent = "إغلاق";
        } catch (error) {
            console.error("Password reset error:", error);
            if (forgotModalText) forgotModalText.textContent = "تعذر إرسال رسالة الاستعادة الآن.";
            modalOkBtn.textContent = "حاول مرة أخرى";
        } finally {
            modalOkBtn.disabled = false;
        }

        return;
    }

    if (modalMode === "recovery") {
        const newPassword = recoveryPasswordInput?.value || "";
        const confirmPassword = recoveryConfirmInput?.value || "";

        if (!isStrongPassword(newPassword)) {
            if (forgotModalText) {
                forgotModalText.textContent =
                    "كلمة المرور يجب أن تكون 12 حرفًا على الأقل وبها حرف كبير وصغير ورقم ورمز.";
            }
            return;
        }

        if (newPassword !== confirmPassword) {
            if (forgotModalText) forgotModalText.textContent = "كلمتا المرور غير متطابقتين.";
            return;
        }

        modalOkBtn.disabled = true;
        modalOkBtn.textContent = "جارٍ الحفظ...";

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;

            await supabaseClient.auth.signOut();
            currentSupabaseUser = null;
            modalMode = "sent";
            hideRecoveryFields();
            if (forgotModalTitle) forgotModalTitle.textContent = "تم تغيير كلمة المرور ✅";
            if (forgotModalText) {
                forgotModalText.textContent = "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.";
            }
            modalOkBtn.textContent = "العودة لتسجيل الدخول";
            window.history.replaceState({}, document.title, "login.html");
        } catch (error) {
            console.error("Password update error:", error);
            if (forgotModalText) {
                forgotModalText.textContent =
                    "تعذر تغيير كلمة المرور. افتح رابط الاستعادة من البريد مرة أخرى.";
            }
            modalOkBtn.textContent = "حاول مرة أخرى";
        } finally {
            modalOkBtn.disabled = false;
        }
    }
});

function listenForAuthEvents() {
    if (!isSupabaseReady()) return;

    supabaseClient.auth.onAuthStateChange(function (event, session) {
        if (event === "PASSWORD_RECOVERY") {
            currentSupabaseUser = session?.user || null;
            setTimeout(function () {
                openForgotModal("recovery");
            }, 0);
        }

        if (event === "SIGNED_OUT") {
            currentSupabaseUser = null;
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modalMode !== "recovery") {
        closeForgotModal();
    }
});

function createParticles() {
    if (!particles) return;

    for (let i = 0; i < 45; i++) {
        const particle = document.createElement("span");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.setProperty("--duration", 2 + Math.random() * 5 + "s");
        particle.style.setProperty("--delay", Math.random() * -5 + "s");
        particles.appendChild(particle);
    }
}

async function initializeLoginPage() {
    updateRequestedSystem();
    loadRememberedEmail();
    createParticles();

    const note = document.querySelector(".local-note p");
    if (note) {
        note.textContent =
            "تسجيل الدخول محمي عبر Supabase، وكلمة المرور لا يتم حفظها داخل كود الموقع.";
    }

    if (!isSupabaseReady()) {
        showFormMessage(
            "❌ تعذر الاتصال بـ Supabase. تأكد من ملفات الاتصال.",
            "error"
        );
        return;
    }

    listenForAuthEvents();
    await checkExistingSession();
}

initializeLoginPage();
