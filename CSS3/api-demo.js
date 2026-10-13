(function(){
  "use strict";

  const ENDPOINT="https://fkpjawyuyzgtjceymnal.supabase.co/functions/v1/vertex-ai-demo";
  const PUBLIC_KEY="sb_publishable__82IrF70sojq4WkLdfZNsg_Cb19N3GE";
  const STORAGE_KEY="vertexGuestTrialV1";
  const $=id=>document.getElementById(id);
  let busy=false;
  let trial=null;
  const history=[];

  function show(el){el&&el.classList.remove("hidden")}
  function hide(el){el&&el.classList.add("hidden")}

  function errorText(code){
    const messages={
      trial_expired:"انتهت تجربتك المجانية لمدة شهر. يمكنك تسجيل الدخول للاستمرار.",
      daily_limit:"وصلت إلى الحد اليومي للتجربة. جرّب غدًا.",
      rate_limit:"انتظر دقيقة ثم أرسل رسالتك مرة ثانية.",
      start_limit:"تعذر بدء تجربة جديدة الآن. حاول لاحقًا من هذا المتصفح.",
      service_limit:"التجربة مشغولة حاليًا. حاول مرة أخرى لاحقًا.",
      invalid_trial:"تعذر التحقق من التجربة المحفوظة. حاول مرة أخرى لاحقًا.",
    };
    return messages[code]||"تعذر الاتصال بخدمة Vertex AI. حاول مرة ثانية بعد قليل.";
  }

  function updateTrial(){
    const expires=Date.parse(trial?.expires_at||"");
    if(!Number.isFinite(expires))return false;
    if(expires<=Date.now()){
      $("trialStatus").textContent="انتهت مدة التجربة";
      $("trialNotice").textContent=errorText("trial_expired");
      show($("trialLogin"));
      $("sendBtn").disabled=true;
      $("promptInput").disabled=true;
      return false;
    }
    const days=Math.ceil((expires-Date.now())/86400000);
    $("trialStatus").textContent=`تجربة بدون تسجيل دخول · المتبقي ${days} يومًا`;
    return true;
  }

  async function request(body){
    const result=await fetch(ENDPOINT,{
      method:"POST",headers:{"apikey":PUBLIC_KEY,"Content-Type":"application/json"},
      body:JSON.stringify(body),signal:AbortSignal.timeout(95000),
    });
    const data=await result.json();
    if(data.expires_at){trial={...trial,...data};updateTrial();}
    if(!result.ok||!data.ok){
      const error=new Error(data.code||"service_unavailable");
      error.code=data.code;
      throw error;
    }
    return data;
  }

  async function startTrial(){
    let token="";
    try{token=localStorage.getItem(STORAGE_KEY)||"";}catch{}
    const valid=/^[0-9a-f-]{72}$/.test(token);
    trial=await request(valid?{action:"status",trialToken:token}:{action:"start"});
    try{localStorage.setItem(STORAGE_KEY,trial.trialToken);}catch{}
    return updateTrial();
  }

  function message(role,text,meta){
    hide($("welcome"));
    const wrap=document.createElement("article");
    wrap.className="message "+role;
    const avatar=document.createElement("div");
    avatar.className="avatar";
    avatar.textContent=role==="assistant"?"V":"أنت";
    const content=document.createElement("div");
    const bubble=document.createElement("div");
    bubble.className="bubble";
    bubble.textContent=text;
    content.appendChild(bubble);
    if(meta){
      const metaEl=document.createElement("div");
      metaEl.className="message-meta";
      metaEl.textContent=meta;
      content.appendChild(metaEl);
    }
    if(role==="assistant")wrap.append(avatar,content);else wrap.append(content,avatar);
    $("messages").appendChild(wrap);
    requestAnimationFrame(()=>wrap.scrollIntoView({behavior:"smooth",block:"end"}));
    return wrap;
  }

  function typingMessage(){
    hide($("welcome"));
    const wrap=document.createElement("article");
    wrap.className="message assistant";
    wrap.innerHTML='<div class="avatar">V</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
    $("messages").appendChild(wrap);
    requestAnimationFrame(()=>wrap.scrollIntoView({behavior:"smooth",block:"end"}));
    return wrap;
  }

  function autoGrow(){
    const box=$("promptInput");
    box.style.height="auto";
    box.style.height=Math.min(box.scrollHeight,140)+"px";
  }

  function recentMessages(userMessage){
    const messages=[...history.slice(-10),userMessage];
    while(messages.length>1&&new TextEncoder().encode(JSON.stringify(messages)).length>30000){
      messages.shift();
    }
    return messages;
  }

  async function sendPrompt(){
    if(busy||!trial?.trialToken||!updateTrial())return;
    const box=$("promptInput");
    const prompt=box.value.trim();
    if(!prompt)return;
    busy=true;
    $("sendBtn").disabled=true;
    $("trialNotice").textContent="";
    message("user",prompt);
    box.value="";
    autoGrow();
    const typing=typingMessage();
    try{
      const userMessage={role:"user",content:prompt};
      const data=await request({action:"chat",trialToken:trial.trialToken,messages:recentMessages(userMessage)});
      if(typeof data.reply!=="string"||!data.reply.trim())throw new Error("empty_ai_reply");
      const reply=data.reply.trim();
      history.push(userMessage,{role:"assistant",content:reply.slice(0,8000)});
      if(history.length>10)history.splice(0,history.length-10);
      message("assistant",reply,"Vertex AI");
    }catch(error){
      const text=errorText(error.code);
      message("assistant",text);
      $("trialNotice").textContent=text;
      // Expiry is confirmed by the server; never redirect visitors to login.
      if(error.code==="trial_expired"){
        trial={...trial,expires_at:new Date(0).toISOString()};
        updateTrial();
      }
    }finally{
      typing.remove();
      busy=false;
      if(updateTrial()){$("sendBtn").disabled=false;box.focus();}
    }
  }

  async function init(){
    $("sendBtn").addEventListener("click",sendPrompt);
    $("promptInput").addEventListener("input",autoGrow);
    $("promptInput").addEventListener("keydown",e=>{
      if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPrompt();}
    });
    document.querySelectorAll("[data-prompt]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        $("promptInput").value=btn.dataset.prompt||"";
        autoGrow();
        $("promptInput").focus();
      });
    });
    try{
      if(await startTrial()){
        $("promptInput").disabled=false;
        $("sendBtn").disabled=false;
        setInterval(updateTrial,60000);
      }
    }catch(error){
      if(error.code!=="trial_expired"){
        $("trialStatus").textContent="التجربة غير متاحة الآن";
        $("trialNotice").textContent=errorText(error.code)+" حدّث الصفحة للمحاولة مرة أخرى.";
      }
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
