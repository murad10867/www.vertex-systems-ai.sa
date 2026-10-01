// ==========================================
// Vertex AI Voice v2
// Plan-aware voice choices with continuous speech playback
// - Prefers high-quality Microsoft Edge online voices
// - Saudi Arabic first (ar-SA)
// - Waits for voices to become available
// - Natural pacing and sentence pauses
// - Voice conversation with the existing Vertex AI chat
// ==========================================
(function () {
    "use strict";

    if (window.__vertexVoiceV2Installed) return;
    window.__vertexVoiceV2Installed = true;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const canRecognize = !!Recognition;
    const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    let voiceMode = false;
    let listening = false;
    let muted = false;
    let waitingForReply = false;
    let recognition = null;
    let finalTranscript = "";
    let restartTimer = null;
    let speechToken = 0;
    let observeTimer = null;
    let previewing = false;
    let speaking = false;
    let activeUtterance = null;
    let lastSpeechText = "";
    let replayBtn;
    let previousAssistant = null;
    let turnToken = 0;
    let lastFocus = null;
    let previousOverflow = "";
    let overlay, statusEl, transcriptEl, micToggle, closeBtn, messageInput, sendBtn;
    let voiceSelect, languageSelect, styleSelect, speedInput, speedLabel, qualityEl, previewBtn;
    const profiles = {
        free: { label: "Free", limit: 2, rate: 1, pause: 100 },
        pro: { label: "Pro", limit: 6, rate: 0.97, pause: 160 },
        plus: { label: "Plus", limit: Infinity, rate: 0.95, pause: 200 }
    };
    let preferences = { voices: {}, language: "ar", style: "natural", speed: 1 };
    try {
        const saved = JSON.parse(localStorage.getItem("vertexVoicePreferencesV3") || "null");
        if (saved && typeof saved === "object") {
            preferences.voices = saved.voices && typeof saved.voices === "object" ? saved.voices : {};
            preferences.language = saved.language === "en" ? "en" : "ar";
            preferences.style = ["natural", "calm", "bright"].includes(saved.style) ? saved.style : "natural";
            preferences.speed = Math.min(1.2, Math.max(0.8, Number(saved.speed) || 1));
        }
    } catch (_) {}

    const style = document.createElement("style");
    style.id = "vertexVoiceV2Styles";
    style.textContent = `
        .vertex-voice-launch {
            width: 42px;
            height: 42px;
            border-radius: 14px;
            border: 1px solid rgba(96,165,250,.25);
            background: rgba(37,99,235,.16);
            color: #dbeafe;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            transition: .18s ease;
        }
        .vertex-voice-launch:hover { transform: translateY(-1px); background: rgba(37,99,235,.28); }
        .vertex-voice-overlay {
            position: fixed; inset: 0; z-index: 100000;
            display: flex; align-items: center; justify-content: center;
            padding: 16px; overflow-y: auto; background: rgba(2,6,15,.90);
            backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
        }
        .vertex-voice-overlay[hidden] { display: none !important; }
        .vertex-voice-panel {
            width: min(560px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; min-height: 0;
            border: 1px solid rgba(148,163,184,.16); border-radius: 34px;
            background: radial-gradient(circle at 50% 12%, rgba(14,165,233,.10), transparent 36%), #07101d;
            box-shadow: 0 30px 90px rgba(0,0,0,.55);
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
            box-sizing: border-box;
            text-align: center; padding: 38px 28px 30px; color: #f8fafc;
        }
        .vertex-voice-panel > * { flex-shrink:0; }
        .vertex-voice-brand { font-size: 12px; letter-spacing: .22em; color: #64748b; margin-bottom: 16px; }
        .vertex-voice-orb {
            position: relative; width: 112px; height: 112px; flex-shrink: 0; border-radius: 999px;
            display: grid; place-items: center;
            background: radial-gradient(circle at 35% 30%, #67e8f9, #2563eb 48%, #111827 72%);
            box-shadow: 0 0 0 14px rgba(37,99,235,.06), 0 22px 70px rgba(37,99,235,.32);
            transition: transform .25s ease, box-shadow .25s ease; overflow: hidden;
        }
        .vertex-voice-orb::before, .vertex-voice-orb::after {
            content: ""; position: absolute; inset: 11px; border-radius: inherit;
            border: 1px solid rgba(255,255,255,.18);
        }
        .vertex-voice-orb::after { inset: 28px; border-color: rgba(255,255,255,.09); }
        .vertex-voice-orb span { position: relative; z-index: 2; font-size: 56px; font-weight: 800; color: white; }
        .vertex-voice-overlay.listening .vertex-voice-orb { animation: vertexVoicePulseV2 1.35s ease-in-out infinite; box-shadow: 0 0 0 18px rgba(34,197,94,.06), 0 22px 80px rgba(34,197,94,.26); }
        .vertex-voice-overlay.speaking .vertex-voice-orb { animation: vertexVoiceSpeakV2 .72s ease-in-out infinite alternate; box-shadow: 0 0 0 18px rgba(56,189,248,.07), 0 22px 90px rgba(56,189,248,.32); }
        @keyframes vertexVoicePulseV2 { 0%,100% { transform: scale(.98); } 50% { transform: scale(1.055); } }
        @keyframes vertexVoiceSpeakV2 { from { transform: scale(.99); } to { transform: scale(1.045); } }
        .vertex-voice-title { margin: 20px 0 8px; font-size: 28px; font-weight: 800; }
        .vertex-voice-status { margin: 0; min-height: 28px; color: #94a3b8; font-size: 16px; }
        .vertex-voice-transcript { width: min(440px,100%); min-height: 66px; margin: 22px 0 26px; color: #dbeafe; font-size: 18px; line-height: 1.8; display:flex; align-items:center; justify-content:center; overflow-wrap:anywhere; }
        .vertex-voice-actions { display:flex; gap:14px; align-items:center; justify-content:center; }
        .vertex-voice-action { width:58px; height:58px; border-radius:999px; border:1px solid rgba(148,163,184,.18); background:#111c2d; color:#f8fafc; display:grid; place-items:center; cursor:pointer; font-size:23px; transition:.18s ease; }
        .vertex-voice-action:hover { transform:translateY(-1px); background:#17253a; }
        .vertex-voice-action.voice-active { background:#1d4ed8; border-color:rgba(96,165,250,.55); box-shadow:0 10px 34px rgba(37,99,235,.30); }
        .vertex-voice-action.voice-close { background:#24141a; }
        .vertex-voice-hint { margin-top:22px; font-size:12px; color:#94a3b8; max-width:440px; line-height:1.7; }
        .vertex-voice-settings { width:100%; margin:14px 0 18px; display:grid; gap:12px; text-align:right; }
        .vertex-voice-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .vertex-voice-settings label { display:grid; gap:6px; color:#cbd5e1; font-size:13px; min-width:0; }
        .vertex-voice-settings select { width:100%; min-width:0; padding:10px; color:#f8fafc; background:#111c2d; border:1px solid #334155; border-radius:10px; font:inherit; }
        .vertex-voice-settings input { width:100%; accent-color:#60a5fa; }
        .vertex-voice-quality { margin:0; color:#93c5fd; font-size:12px; line-height:1.7; }
        .vertex-voice-preview { padding:10px 16px; border:1px solid #334155; border-radius:10px; color:#dbeafe; background:#13233a; cursor:pointer; font:inherit; }
        .vertex-voice-preview:disabled { opacity:.5; cursor:default; }
        .vertex-voice-settings :focus-visible, .vertex-voice-action:focus-visible { outline:2px solid #60a5fa; outline-offset:3px; }
        @media (prefers-reduced-motion:reduce) { .vertex-voice-orb { animation:none !important; } }
        @media (max-width:620px) { .vertex-voice-panel { min-height:0; border-radius:26px; padding:30px 18px 24px; } .vertex-voice-orb { width:88px; height:88px; } .vertex-voice-orb span { font-size:48px; } .vertex-voice-title { font-size:24px; } }
    `;
    document.head.appendChild(style);

    function ready(fn) {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
        else fn();
    }

    function getVoices() {
        if (!canSpeak) return [];
        return window.speechSynthesis.getVoices() || [];
    }

    function profile() {
        const plan = window.VertexPlan?.get?.()?.plan;
        return profiles[plan] || profiles.free;
    }

    function savePreferences() {
        try { localStorage.setItem("vertexVoicePreferencesV3", JSON.stringify(preferences)); } catch (_) {}
    }

    function voiceKey(voice) {
        return `${voice.voiceURI || voice.name}|${voice.lang}`;
    }

    function isNatural(voice) {
        return /natural|neural|online|enhanced|premium/i.test(voice.name || "");
    }

    function availableVoices(language) {
        const config = profile();
        const seen = new Set();
        return getVoices().filter(voice => {
            const key = voiceKey(voice);
            if (!String(voice.lang || "").toLowerCase().startsWith(language) || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).sort((a, b) => {
            function score(voice) {
                const exact = String(voice.lang).toLowerCase() === (language === "ar" ? "ar-sa" : "en-us");
                // Paid profiles prioritize natural engines when the browser supplies them.
                return (config === profiles.plus && /neural/i.test(voice.name) ? 40 : 0) + (exact ? 40 : 0) + (isNatural(voice) ? (config === profiles.free ? 10 : 100) : 0)
                    + (voice.default ? 5 : 0);
            }
            return score(b) - score(a) || String(a.name).localeCompare(String(b.name));
        }).slice(0, config.limit);
    }

    function pickVoice(text) {
        const language = /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
        const voices = availableVoices(language);
        return voices.find(v => voiceKey(v) === preferences.voices[language]) || voices[0] || null;
    }

    function refreshVoiceSettings() {
        if (!voiceSelect) return;
        const config = profile();
        const voices = availableVoices(preferences.language);
        voiceSelect.replaceChildren(new Option("تلقائي — أفضل صوت متاح", ""));
        voices.forEach(voice => {
            const label = `${voice.name} (${voice.lang})${isNatural(voice) ? " · طبيعي" : ""}`;
            voiceSelect.add(new Option(label, voiceKey(voice)));
        });
        const selected = preferences.voices[preferences.language];
        voiceSelect.value = voices.some(v => voiceKey(v) === selected) ? selected : "";
        languageSelect.value = preferences.language;
        const plus = config === profiles.plus;
        styleSelect.disabled = !plus;
        speedInput.disabled = config === profiles.free;
        styleSelect.value = plus ? preferences.style : "natural";
        speedInput.value = config === profiles.free ? 1 : preferences.speed;
        speedLabel.textContent = `${Number(speedInput.value).toFixed(2)}×`;
        previewBtn.disabled = !canSpeak || (waitingForReply && !previewing);
        if (replayBtn) replayBtn.disabled = !canSpeak || !lastSpeechText || (waitingForReply && !speaking);
        const language = preferences.language === "ar" ? "العربية" : "الإنجليزية";
        const count = voices.length;
        const details = config === profiles.free ? "خيارات أساسية" : config === profiles.pro
            ? "تفضيل الأصوات الطبيعية + ضبط السرعة" : "كل الأصوات + ضبط السرعة والنبرة";
        qualityEl.textContent = `${config.label} · ${details} · ${count} أصوات ${language} متاحة على جهازك`;
        if (!count) qualityEl.textContent += " — لم يوفر المتصفح أصواتًا لهذه اللغة؛ سيُستخدم الصوت الافتراضي عند توفره.";
    }

    function speechSettings() {
        const config = profile();
        const style = config === profiles.plus ? preferences.style : "natural";
        const speed = config === profiles.free ? 1 : preferences.speed;
        return {
            rate: config.rate * speed * (style === "calm" ? 0.94 : style === "bright" ? 1.04 : 1),
            pitch: style === "calm" ? 0.97 : style === "bright" ? 1.06 : 1,
            pause: config.pause + (style === "calm" ? 80 : 0)
        };
    }

    function cleanForSpeech(text) {
        return String(text || "")
            .replace(/```[\s\S]*?```/g, " ")
            .replace(/https?:\/\/\S+/g, " ")
            .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
            .replace(/[*_~>#`|{}\[\]]/g, " ")
            .replace(/\b(https?|www)\b/gi, " ")
            .replace(/\p{Extended_Pictographic}/gu, " ")
            .replace(/[\u{1F1E6}-\u{1F1FF}\u200D\uFE0E\uFE0F]/gu, " ")
            .replace(/[✓✔★☆●○■□◆◇→←↑↓]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function setState(state, message) {
        overlay.classList.remove("listening", "speaking");
        if (state) overlay.classList.add(state);
        if (message) statusEl.textContent = message;
    }

    function setInput(value) {
        if (!messageInput) return;
        messageInput.value = value;
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function stopListening() {
        clearTimeout(restartTimer);
        const previousRecognition = recognition;
        recognition = null;
        if (previousRecognition) { try { previousRecognition.abort(); } catch (_) {} }
        listening = false;
        overlay.classList.remove("listening");
    }

    function scheduleListening(delay = 500) {
        clearTimeout(restartTimer);
        if (!voiceMode || muted || waitingForReply || speaking || previewing) return;
        restartTimer = setTimeout(startListening, delay);
    }

    function cancelSpeech() {
        speechToken++;
        speaking = false;
        previewing = false;
        const hadAudio = activeUtterance || (canSpeak && (window.speechSynthesis.speaking || window.speechSynthesis.pending));
        activeUtterance = null;
        if (hadAudio && canSpeak) window.speechSynthesis.cancel();
        if (previewBtn) previewBtn.textContent = "▶ جرّب الصوت";
    }

    function speak(text, preview = false) {
        const cleaned = cleanForSpeech(text);
        if (!cleaned || !canSpeak || !voiceMode) {
            waitingForReply = false;
            refreshVoiceSettings();
            if (!canSpeak) setState(null, "قراءة الصوت غير مدعومة في هذا المتصفح");
            scheduleListening(350);
            return;
        }
        stopListening();
        cancelSpeech();
        previewing = preview;
        speaking = true;
        const token = speechToken;
        const settings = speechSettings();
        // Use the original single-utterance path so phrases are spoken continuously.
        const utterance = new SpeechSynthesisUtterance(cleaned);
        const voice = pickVoice(cleaned);
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || (/[\u0600-\u06FF]/.test(cleaned) ? "ar-SA" : "en-US");
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = 1;
        activeUtterance = utterance;
        if (!preview) lastSpeechText = cleaned;
        if (preview) previewBtn.textContent = "■ إيقاف التجربة";
        refreshVoiceSettings();
        setState(null, "جارٍ تشغيل الصوت...");
        transcriptEl.textContent = cleaned.length > 260 ? cleaned.slice(0,260) + "…" : cleaned;
        utterance.onstart = () => {
            if (token !== speechToken || !voiceMode) return;
            setState("speaking", preview ? "تجربة الصوت..." : "Vertex AI يتكلم...");
        };
        function finish(error) {
            if (token !== speechToken) return;
            speaking = false; previewing = false; activeUtterance = null;
            waitingForReply = false;
            previewBtn.textContent = "▶ جرّب الصوت";
            refreshVoiceSettings();
            setState(null, error ? "تعذر تشغيل الصوت — اضغط سماع الرد أو جرّب صوتًا آخر" : muted ? "الميكروفون متوقف" : "أسمعك...");
            scheduleListening(error ? 700 : 420);
        }
        utterance.onend = () => finish();
        utterance.onerror = () => finish(true);
        try {
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        } catch (_) { finish(true); }
    }

    function previewVoice() {
        if (waitingForReply) return;
        if (previewing) {
            cancelSpeech();
            setState(null, muted ? "الميكروفون متوقف" : "أسمعك...");
            scheduleListening();
            return;
        }
        speak(preferences.language === "ar"
            ? "أهلًا، أنا مساعدك في فيرتكس. اختر الصوت اللي يناسبك، وخلنا نبدأ."
            : "Hello, I am your Vertex assistant. Choose your favorite voice and let's begin.", true);
    }

    function submitText(text) {
        const value = String(text || "").trim();
        if (!value || !voiceMode) return;
        const previousNodes = document.querySelectorAll("#messagesContainer .message.assistant .message-text");
        previousAssistant = previousNodes[previousNodes.length - 1] || null;
        const turn = ++turnToken;
        setInput(value);
        transcriptEl.textContent = value;
        waitingForReply = true;
        setState(null, "Vertex AI يفكر...");
        refreshVoiceSettings();
        setTimeout(() => {
            if (!voiceMode || turn !== turnToken) return;
            if (sendBtn && !sendBtn.disabled) sendBtn.click();
            else {
                waitingForReply = false;
                refreshVoiceSettings();
                scheduleListening();
            }
        }, 150);
    }

    function buildRecognition() {
        if (!canRecognize) return null;
        const rec = new Recognition();
        rec.lang = "ar-SA";
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
            if (recognition !== rec || !voiceMode || muted || speaking) { rec.abort(); return; }
            listening = true;
            finalTranscript = "";
            setState("listening", "أسمعك...");
            transcriptEl.textContent = "تكلم الآن";
            micToggle.classList.add("voice-active");
        };
        rec.onresult = event => {
            if (recognition !== rec || speaking || !voiceMode) return;
            let interim = "";
            let finalText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const part = event.results[i][0]?.transcript || "";
                if (event.results[i].isFinal) finalText += part; else interim += part;
            }
            if (finalText.trim()) finalTranscript = (finalTranscript + " " + finalText).trim();
            const shown = (finalTranscript + " " + interim).trim();
            if (shown) { transcriptEl.textContent = shown; setInput(shown); }
        };
        rec.onerror = event => {
            if (recognition !== rec) return;
            listening = false;
            const code = event?.error || "unknown";
            if (code === "not-allowed" || code === "service-not-allowed") {
                muted = true;
                micToggle.classList.remove("voice-active");
                setState(null, "اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح");
                transcriptEl.textContent = "إذن الميكروفون مطلوب";
                return;
            }
            if (code !== "aborted" && voiceMode && !waitingForReply) {
                setState(null, code === "no-speech" ? "ما سمعت كلام — حاول مرة ثانية" : "تعذر التقاط الصوت");
                scheduleListening(code === "no-speech" ? 650 : 900);
            }
        };
        rec.onend = () => {
            if (recognition !== rec) return;
            listening = false;
            if (!voiceMode || muted || waitingForReply || speaking || previewing) return;
            const text = finalTranscript.trim();
            finalTranscript = "";
            if (text) submitText(text); else scheduleListening(450);
        };
        return rec;
    }

    function startListening() {
        if (!voiceMode || muted || waitingForReply || listening || speaking || previewing) return;
        if (!canRecognize) {
            setState(null, "التعرف على الصوت غير مدعوم");
            transcriptEl.textContent = "جرّب Microsoft Edge أو Google Chrome";
            return;
        }
        try {
            recognition = buildRecognition();
            recognition.start();
        } catch (_) {
            scheduleListening(900);
        }
    }

    function openVoiceMode() {
        voiceMode = true; muted = false; waitingForReply = false; finalTranscript = "";
        lastFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        overlay.hidden = false;
        document.body.style.overflow = "hidden";
        refreshVoiceSettings();
        closeBtn.focus();
        Promise.resolve(window.VertexPlan?.ready?.()).then(refreshVoiceSettings).catch(() => {});
        micToggle.classList.add("voice-active");
        transcriptEl.textContent = "تكلم الآن";
        setState(null, "أسمعك...");

        if (canSpeak) {
            // Force Chromium/Edge to populate the voice list before the first reply.
            window.speechSynthesis.getVoices();
            scheduleListening(120);
        } else {
            startListening();
        }
    }

    function closeVoiceMode() {
        voiceMode = false; muted = false; waitingForReply = false; finalTranscript = "";
        turnToken++;
        clearTimeout(observeTimer);
        stopListening();
        cancelSpeech();
        overlay.hidden = true;
        document.body.style.overflow = previousOverflow;
        lastFocus?.focus?.();
    }

    function toggleMic() {
        if (!voiceMode) return;
        muted = !muted;
        if (muted) {
            stopListening();
            // Keep pending assistant replies, but stop current audio immediately.
            if (speaking) { cancelSpeech(); waitingForReply = false; }
            refreshVoiceSettings();
            micToggle.classList.remove("voice-active");
            setState(null, "الميكروفون متوقف");
            transcriptEl.textContent = "اضغط المايك للمتابعة";
        } else {
            micToggle.classList.add("voice-active");
            setState(null, "أسمعك...");
            transcriptEl.textContent = "تكلم الآن";
            startListening();
        }
    }

    function installLaunchButton() {
        if (document.getElementById("vertexVoiceLaunchBtn")) return true;
        const tools = document.querySelector(".composer-tools");
        if (!tools) return false;
        const button = document.createElement("button");
        button.id = "vertexVoiceLaunchBtn";
        button.type = "button";
        button.className = "vertex-voice-launch";
        button.title = "محادثة صوتية";
        button.setAttribute("aria-label", "بدء المحادثة الصوتية");
        button.textContent = "🎙️";
        button.addEventListener("click", openVoiceMode);
        tools.prepend(button);
        return true;
    }

    function installObserver() {
        const messages = document.getElementById("messagesContainer");
        if (!messages) return;
        const observer = new MutationObserver(() => {
            if (!voiceMode || !waitingForReply || speaking) return;
            clearTimeout(observeTimer);
            observeTimer = setTimeout(() => {
                if (!voiceMode || !waitingForReply || speaking) return;
                const nodes = messages.querySelectorAll(".message.assistant .message-text");
                if (!nodes.length) return;
                const last = nodes[nodes.length - 1];
                const text = String(last.textContent || "").trim();
                if (!text || last === previousAssistant) return;
                const turn = turnToken;
                // Wait for the streamed reply to settle before speaking it.
                setTimeout(() => {
                    const settled = String(last.textContent || "").trim();
                    if (turn === turnToken && settled === text && voiceMode && waitingForReply && !speaking) speak(settled);
                }, 850);
            }, 250);
        });
        observer.observe(messages, { childList: true, subtree: true, characterData: true });
    }

    ready(() => {
        const overlay = document.createElement("div");
        overlay.id = "vertexVoiceV2Overlay";
        overlay.className = "vertex-voice-overlay";
        overlay.hidden = true;
        overlay.innerHTML = `
            <section class="vertex-voice-panel" role="dialog" aria-modal="true" aria-label="المحادثة الصوتية مع Vertex AI">
                <div class="vertex-voice-brand">VERTEX VOICE</div>
                <div class="vertex-voice-orb" aria-hidden="true"><span>V</span></div>
                <h2 class="vertex-voice-title">المحادثة الصوتية</h2>
                <p id="vertexVoiceV2Status" class="vertex-voice-status">جاهز</p>
                <div id="vertexVoiceV2Transcript" class="vertex-voice-transcript">تكلم مع Vertex AI مباشرة</div>
                <div class="vertex-voice-settings">
                    <p id="vertexVoiceQuality" class="vertex-voice-quality" aria-live="polite"></p>
                    <div class="vertex-voice-fields">
                        <label>لغة اختيار الصوت<select id="vertexVoiceLanguage"><option value="ar">العربية</option><option value="en">English</option></select></label>
                        <label>النبرة · Plus<select id="vertexVoiceStyle"><option value="natural">طبيعي</option><option value="calm">هادئ</option><option value="bright">حيوي</option></select></label>
                    </div>
                    <label>اختر الصوت<select id="vertexVoiceChoice"></select></label>
                    <label>سرعة القراءة · Pro / Plus <output id="vertexVoiceSpeedLabel">1.00×</output><input id="vertexVoiceSpeed" type="range" min="0.8" max="1.2" step="0.05" value="1"></label>
                    <button id="vertexVoicePreview" class="vertex-voice-preview" type="button">▶ جرّب الصوت</button>
                </div>
                <div class="vertex-voice-actions">
                    <button id="vertexVoiceV2MicBtn" class="vertex-voice-action voice-active" type="button" title="تشغيل أو إيقاف المايك">🎙️</button>
                    <button id="vertexVoiceReplay" class="vertex-voice-action" type="button" title="سماع آخر رد" aria-label="سماع آخر رد" disabled>🔊</button>
                    <button id="vertexVoiceV2CloseBtn" class="vertex-voice-action voice-close" type="button" title="إنهاء المحادثة الصوتية">✕</button>
                </div>
                <div class="vertex-voice-hint">الأصوات وجودتها تعتمد على جهازك ومتصفحك. نحفظ اختيارًا مستقلًا للعربية والإنجليزية ويُستخدم الصوت المناسب للغة الرد. لا يلزم تشغيل الميكروفون لتجربة الصوت.</div>
            </section>`;
        document.body.appendChild(overlay);

        window.__vertexVoiceV2Overlay = overlay;
        window.__vertexVoiceV2Status = overlay.querySelector("#vertexVoiceV2Status");
        window.__vertexVoiceV2Transcript = overlay.querySelector("#vertexVoiceV2Transcript");
        window.__vertexVoiceV2Mic = overlay.querySelector("#vertexVoiceV2MicBtn");
        window.__vertexVoiceV2Close = overlay.querySelector("#vertexVoiceV2CloseBtn");

        window.__vertexVoiceV2OverlayRefs = {
            overlay, statusEl: window.__vertexVoiceV2Status, transcriptEl: window.__vertexVoiceV2Transcript,
            micToggle: window.__vertexVoiceV2Mic
        };

        // Local aliases used by the functions above.
        window.vertexVoiceV2Ready = true;
        window.__vertexVoiceV2Start = openVoiceMode;
        window.__vertexVoiceV2Close = closeVoiceMode;
        window.__vertexVoiceV2Toggle = toggleMic;

        window.__vertexVoiceV2Install = () => {
            installLaunchButton();
            installObserver();
        };

        window.speechSynthesis?.addEventListener?.("voiceschanged", refreshVoiceSettings);
        installLaunchButton();
        installObserver();

        window.__vertexVoiceV2Refs = window.__vertexVoiceV2OverlayRefs;
    });

    // The helper functions access these through lexical names; initialize them lazily.
    const originalReady = ready;
    originalReady(() => {
        overlay = document.getElementById("vertexVoiceV2Overlay");
        statusEl = document.getElementById("vertexVoiceV2Status");
        transcriptEl = document.getElementById("vertexVoiceV2Transcript");
        micToggle = document.getElementById("vertexVoiceV2MicBtn");
        closeBtn = document.getElementById("vertexVoiceV2CloseBtn");
        messageInput = document.getElementById("messageInput");
        sendBtn = document.getElementById("sendBtn");
        voiceSelect = document.getElementById("vertexVoiceChoice");
        languageSelect = document.getElementById("vertexVoiceLanguage");
        styleSelect = document.getElementById("vertexVoiceStyle");
        speedInput = document.getElementById("vertexVoiceSpeed");
        speedLabel = document.getElementById("vertexVoiceSpeedLabel");
        qualityEl = document.getElementById("vertexVoiceQuality");
        previewBtn = document.getElementById("vertexVoicePreview");
        replayBtn = document.getElementById("vertexVoiceReplay");
        replayBtn.addEventListener("click", () => {
            if (!waitingForReply || speaking) speak(lastSpeechText);
        });
        voiceSelect.addEventListener("change", () => {
            preferences.voices[preferences.language] = voiceSelect.value;
            savePreferences();
        });
        languageSelect.addEventListener("change", () => {
            preferences.language = languageSelect.value;
            savePreferences(); refreshVoiceSettings();
        });
        styleSelect.addEventListener("change", () => { preferences.style = styleSelect.value; savePreferences(); });
        speedInput.addEventListener("input", () => {
            preferences.speed = Number(speedInput.value);
            speedLabel.textContent = `${preferences.speed.toFixed(2)}×`;
            savePreferences();
        });
        previewBtn.addEventListener("click", previewVoice);
        refreshVoiceSettings();
        // The plan can load after the voice panel is installed.
        const badgeObserver = new MutationObserver(refreshVoiceSettings);
        const actions = document.querySelector(".topbar-actions");
        if (actions) badgeObserver.observe(actions, { childList:true, subtree:true, attributes:true, attributeFilter:["data-plan"] });
        micToggle?.addEventListener("click", toggleMic);
        closeBtn?.addEventListener("click", closeVoiceMode);
        overlay?.addEventListener("click", event => { if (event.target === overlay) closeVoiceMode(); });
        document.addEventListener("keydown", event => {
            if (!voiceMode) return;
            if (event.key === "Escape") closeVoiceMode();
            if (event.key === "Tab") {
                const controls = Array.from(overlay.querySelectorAll("button:not(:disabled), select:not(:disabled), input:not(:disabled)"));
                const first = controls[0], last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });
    });
})();
