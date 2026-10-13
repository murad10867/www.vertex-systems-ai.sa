// Public guest trial. Credentials and provider keys stay on the server.
const ORIGIN = "https://murad10867.github.io";
const encoder = new TextEncoder();
const allowedOrigins = new Set([ORIGIN, "http://localhost:5500", "http://127.0.0.1:5500"]);

function response(req, body, status = 200) {
  const origin = req.headers.get("origin") || ORIGIN;
  return new Response(JSON.stringify(body), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : ORIGIN,
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store", "Vary": "Origin",
  }});
}

function namedKey(name, fallback) {
  const raw = Deno.env.get(name) || "";
  try { return JSON.parse(raw).default || Deno.env.get(fallback) || ""; }
  catch { return Deno.env.get(fallback) || ""; }
}

async function hash(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2,"0")).join("");
}

async function access(action, token, ipHash, secret) {
  const headers = { "apikey": secret, "Content-Type": "application/json" };
  if (!secret.startsWith("sb_secret_")) headers["Authorization"] = `Bearer ${secret}`;
  const result = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/vertex_demo_access`, {
    method: "POST", headers,
    body: JSON.stringify({p_action:action,p_token_hash:await hash(token),p_ip_hash:ipHash}),
    signal: AbortSignal.timeout(10000),
  });
  if (!result.ok) throw new Error("trial_storage_failed");
  return result.json();
}

async function generateReply(messages, apiKey) {
  const listing = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    headers:{"x-goog-api-key":apiKey}, signal:AbortSignal.timeout(10000),
  });
  const discovery = await listing.json();
  if (!listing.ok) throw new Error(`provider_model_list_${listing.status}`);
  const available = (discovery.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => m.name.replace(/^models\//,""));
  const preferred = ["gemini-3.5-flash-lite","gemini-3.1-flash-lite","gemini-3.8-flash","gemini-flash-lite-latest","gemini-flash-latest"];
  const candidates = [...new Set([
    ...preferred.filter(m => available.includes(m)),
    ...available.filter(m => /flash/.test(m) && !/image|tts|audio|live|2\.0|2\.5/.test(m)),
  ])].slice(0,3);
  if (!candidates.length) throw new Error("provider_no_chat_model");
  const contents = [];
  for (const message of messages) {
    const role = message.role === "assistant" ? "model" : "user";
    const last = contents[contents.length-1];
    if (last?.role === role) last.parts[0].text += "\n\n" + message.content;
    else contents.push({role,parts:[{text:message.content}]});
  }
  const payload = {
    systemInstruction:{parts:[{text:"You are Vertex AI, a helpful assistant inside Vertex Systems AI. Reply clearly and accurately in the user's language. Help with learning, writing and programming. Do not claim to have performed actions or browsed websites. This is a text-only guest trial."}]},
    contents, generationConfig:{maxOutputTokens:2000,temperature:0.7},
  };
  for (const model of candidates) {
    try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method:"POST",headers:{"x-goog-api-key":apiKey,"Content-Type":"application/json"},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(25000),
    });
    const data = await result.json();
    const reply = data.candidates?.flatMap(c => c.content?.parts || []).filter(p => typeof p.text === "string" && !p.thought).map(p => p.text).join("\n").trim();
    if (result.ok && reply) return reply;
    console.warn("Vertex guest provider:",model,result.status,data.error?.status || "empty_reply");
    if ([401,403].includes(result.status)) break;
    } catch(error) {
      console.warn("Vertex guest provider:",model,"request_timeout_or_network_error");
    }
  }
  throw new Error("provider_unavailable");
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return response(req,{ok:true});
  if (req.method !== "POST") return response(req,{code:"method_not_allowed"},405);
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return response(req,{code:"origin_not_allowed"},403);
  try {
    const publicKey = namedKey("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY");
    if (!publicKey || req.headers.get("apikey") !== publicKey) return response(req,{code:"invalid_api_key"},401);
    const secret = namedKey("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
    if (!secret) return response(req,{code:"server_config"},503);
    // A keyed hash limits abuse per connection without storing raw IP addresses.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const ipHash = await hash("vertex-demo-ip:" + secret + ":" + ip);
    const raw = await req.text();
    if (encoder.encode(raw).length > 40000) return response(req,{code:"request_too_large"},413);
    let body;
    try { body = JSON.parse(raw); } catch { return response(req,{code:"invalid_request"},400); }
    const action = body?.action;
    if (!["start","status","chat"].includes(action)) return response(req,{code:"invalid_request"},400);
    const token = action === "start" ? crypto.randomUUID() + crypto.randomUUID() : body.trialToken;
    if (typeof token !== "string" || !/^[0-9a-f-]{72}$/.test(token)) return response(req,{code:"invalid_trial"},400);
    let messages = [];
    if (action === "chat") {
      if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 12) return response(req,{code:"invalid_messages"},400);
      messages = body.messages;
      if (messages.some(m => !m || !["user","assistant"].includes(m.role) || typeof m.content !== "string" || !m.content.trim() || m.content.length > 8000)
        || messages[messages.length-1].role !== "user") return response(req,{code:"invalid_messages"},400);
    }
    const state = await access(action,token,ipHash,secret);
    if (!state.ok) return response(req,state,state.code === "trial_expired" ? 403 : state.code === "invalid_trial" ? 400 : 429);
    if (action !== "chat") return response(req,{...state,trialToken:token});
    const apiKey = (Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!apiKey) return response(req,{code:"server_config"},503);
    const reply = await generateReply(messages,apiKey);
    return response(req,{...state,reply});
  } catch(error) {
    console.error("Vertex guest demo:",String(error?.message || "server_error"));
    return response(req,{code:"service_unavailable"},503);
  }
});
