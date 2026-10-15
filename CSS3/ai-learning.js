// User-reviewed corrections; local, account-scoped context, not model training.
(function(){
  "use strict";
  const PREFIX="vertexCorrectionsV1:";
  const MAX=50;
  let scope="",state={enabled:true,items:[]},modal,lastFocus,editing=null;
  const $=id=>document.getElementById(id);
  const normalize=text=>String(text||"").toLowerCase().normalize("NFKC").replace(/[\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
  const STOP=new Set("اشرح اكتب عطني اعطني اريد ابغى ابغا ممكن كيف لماذا ماذا ماهو ماهي الصحيح التصحيح الجواب اجابه اجابة السؤال الرد هذا هذه ذلك الذي التي كان على الى من في عن مع هل وما وهو وهي ايضا فقط please what when where which how why the and for with this that have give explain write answer correct correction".split(" ").map(normalize));
  const terms=text=>new Set(normalize(text).split(" ").filter(word=>word.length>=3&&!STOP.has(word)));
  const questionKey=text=>String(text||"").normalize("NFKC").replace(/\s+/g," ").trim();

  function validItems(items){
    return Array.isArray(items)?items.filter(x=>x&&typeof x.id==="string"&&typeof x.question==="string"&&typeof x.correction==="string").slice(0,MAX).map(x=>({id:x.id,question:x.question.slice(0,400),correction:x.correction.slice(0,240),answer:String(x.answer||"").slice(0,500),createdAt:String(x.createdAt||"")})):[];
  }
  function read(){
    let next={enabled:true,items:[]};
    if(scope)try{const data=JSON.parse(localStorage.getItem(PREFIX+scope)||"null");if(data)next={enabled:data.enabled!==false,items:validItems(data.items)};}catch{}
    state=next;refresh();
  }
  function persist(next){
    if(!scope)throw new Error("account_not_ready");
    localStorage.setItem(PREFIX+scope,JSON.stringify(next));state=next;refresh();
  }
  function setScope(value){
    const next=String(value||"").slice(0,120);
    if(next===scope)return;
    if(modal&&!modal.hidden)close();scope=next;editing=null;read();
  }
  function syncAccount(){
    if(document.getElementById("messageInput")){const user=window.VertexAuth?.getUser?.();setScope(user?.id?"account:"+user.id:"");}
  }
  function refresh(){
    const count=$("vertexLearningCount");if(count)count.textContent=`${state.items.length} / ${MAX} تصحيحًا محفوظًا`;
    const toggle=$("vertexLearningEnabled");if(toggle){toggle.checked=state.enabled;toggle.disabled=!scope;}
  }
  function previousQuestion(element){
    let previous=element.previousElementSibling;
    while(previous){if(previous.classList.contains("user"))return (previous.querySelector(".message-text,.bubble")?.textContent||"").trim().slice(0,400);previous=previous.previousElementSibling;}
    return "";
  }
  function context(question,recent=[]){
    syncAccount();if(!scope||!state.enabled)return [];
    let query=terms(question);
    if(query.size<2){const prior=recent.slice(-2).join(" ");query=terms(question+" "+prior);}
    if(!query.size)return [];
    const exact=questionKey(question),numbers=new Set(String(question).match(/\p{N}+/gu)||[]);
    return state.items.map((item,index)=>{
      const keywords=terms(item.question+" "+item.correction);let score=0,overlap=0;
      const oldNumbers=new Set(item.question.match(/\p{N}+/gu)||[]);
      if(numbers.size&&oldNumbers.size&&(numbers.size!==oldNumbers.size||[...numbers].some(n=>!oldNumbers.has(n))))return {item,score:0,index};
      for(const word of query)if(keywords.has(word)){score+=word.length>=5?2:1;overlap++;}
      if(exact&&questionKey(item.question)===exact)score+=10;
      else if(overlap<2&&!(query.size===1&&[...query][0].length>=5))score=0;
      return {item,score,index};
    }).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3).map(({item})=>({content:`تصحيح من المستخدم، يُستخدم عند صلته بالسؤال ويُتحقق منه عند الشك.\nالسياق: ${item.question.slice(0,50)}\nالتصحيح: ${item.correction}`.slice(0,400)}));
  }
  function augment(question,recent=[]){
    const memories=context(question,recent);
    return memories.length?question+"\n\n[تصحيحات المستخدم المحفوظة، للمساعدة في الإجابة عن السؤال الحالي فقط]\n"+memories.map(m=>m.content).join("\n\n"):question;
  }
  function status(text){for(const id of ["vertexLearningStatus","vertexLearningSettingsStatus"]){const node=$(id);if(node)node.textContent=text;}}
  function close(){if(!modal)return;modal.hidden=true;document.body.style.overflow=modal.dataset.previousOverflow||"";if(lastFocus?.isConnected)lastFocus.focus();}
  function show(){
    ensureUI();lastFocus=document.activeElement;
    if(modal.hidden)modal.dataset.previousOverflow=document.body.style.overflow;
    modal.hidden=false;document.body.style.overflow="hidden";status("");
  }
  function edit(question,answer,element){
    syncAccount();show();editing={scope,element};
    $("vertexLearningTitle").textContent="تصحيح رد المساعد";$("vertexLearningForm").hidden=false;$("vertexLearningManager").hidden=true;
    $("vertexLearningQuestion").value=String(question||"").slice(0,400);
    $("vertexLearningAnswer").textContent=String(answer||"").slice(0,1500);
    $("vertexLearningCorrection").value="";$("vertexLearningSave").disabled=!scope;$("vertexLearningReask").hidden=true;
    if(!scope)status("انتظر اكتمال تحميل حسابك ثم افتح التصحيح مرة أخرى.");
    $("vertexLearningCorrection").focus();
  }
  function save(){
    const question=$("vertexLearningQuestion").value.trim(),correction=$("vertexLearningCorrection").value.trim();
    if(!editing||editing.scope!==scope||!scope){status("تغيّر الحساب. افتح التصحيح مرة أخرى.");return;}
    if(question.length<3||correction.length<3||/^(?:غلط|خطأ|غير صحيح|لا)$/.test(correction)){status("اكتب السؤال والتصحيح الصحيح بوضوح، وليس مجرد الإشارة إلى وجود خطأ.");return;}
    const duplicate=state.items.find(x=>questionKey(x.question)===questionKey(question));
    if(!duplicate&&state.items.length>=MAX){status("وصلت إلى 50 تصحيحًا. احذف تصحيحًا قديمًا من «إدارة التصحيحات» أولًا.");return;}
    const item={id:duplicate?.id||crypto.randomUUID(),question:question.slice(0,400),correction:correction.slice(0,240),answer:$("vertexLearningAnswer").textContent.slice(0,500),createdAt:new Date().toISOString()};
    try{
      persist({...state,items:[item,...state.items.filter(x=>x.id!==item.id)]});
      const actions=editing.element?.querySelector(".vertex-correction-actions");
      if(actions){let notice=actions.querySelector(".vertex-correction-saved");if(!notice){notice=document.createElement("span");notice.className="vertex-correction-saved";notice.setAttribute("role","status");actions.appendChild(notice);}notice.textContent="تم حفظ تصحيحك";}
      status(state.enabled?"حُفظ تصحيحك. سيُستخدم في الأسئلة المرتبطة به عند تفعيل الذاكرة.":"حُفظ التصحيح، واستخدام التصحيحات متوقف حاليًا. يمكنك تفعيله من الإدارة.");
      $("vertexLearningSave").disabled=true;$("vertexLearningReask").hidden=false;
    }catch{status("تعذر حفظ التصحيح في المتصفح. تحقق من سماح المتصفح بالتخزين أو وفّر مساحة ثم حاول مرة أخرى.");}
  }
  function renderManager(){
    const list=$("vertexLearningList");list.replaceChildren();
    $("vertexLearningManagerToggle").checked=state.enabled;$("vertexLearningManagerToggle").disabled=!scope;
    $("vertexLearningTotal").textContent=`${state.items.length} / ${MAX} تصحيحًا محفوظًا`;
    if(!state.items.length){const empty=document.createElement("p");empty.className="vertex-learning-empty";empty.textContent="لا توجد تصحيحات محفوظة بعد. استخدم «صحّح الرد» تحت أي إجابة.";list.appendChild(empty);}
    for(const item of state.items){
      const card=document.createElement("article");card.className="vertex-learning-item";
      const heading=document.createElement("h3");heading.textContent=item.question;
      const text=document.createElement("p");text.textContent=item.correction;
      const remove=document.createElement("button");remove.type="button";remove.textContent="حذف التصحيح";remove.setAttribute("aria-label","حذف التصحيح: "+item.question.slice(0,60));
      remove.addEventListener("click",()=>{try{persist({...state,items:state.items.filter(x=>x.id!==item.id)});renderManager();status("تم حذف التصحيح ولن يُرسل في الطلبات القادمة.");}catch{status("تعذر حذف التصحيح من تخزين المتصفح.");}});
      card.append(heading,text,remove);list.appendChild(card);
    }
  }
  function manage(){syncAccount();show();editing=null;$("vertexLearningTitle").textContent="التصحيحات المحفوظة";$("vertexLearningForm").hidden=true;$("vertexLearningManager").hidden=false;renderManager();$("vertexLearningClose").focus();}
  function setEnabled(value){try{persist({...state,enabled:Boolean(value)});status(state.enabled?"تم تفعيل استخدام التصحيحات ذات الصلة.":"تم إيقاف إرسال التصحيحات في الطلبات القادمة.");}catch{refresh();if($("vertexLearningManagerToggle"))$("vertexLearningManagerToggle").checked=state.enabled;status("تعذر حفظ الإعداد.");}}
  function clear(){
    state={enabled:state.enabled,items:[]};refresh();
    try{if(scope)localStorage.setItem(PREFIX+scope,JSON.stringify(state));return true;}catch{try{if(scope)localStorage.removeItem(PREFIX+scope);return true;}catch{return false;}}
  }
  function attach(element,options={}){
    if(element.querySelector(".vertex-correct-btn"))return;
    const actions=document.createElement("div");actions.className="vertex-correction-actions";
    const button=document.createElement("button");button.type="button";button.className="vertex-correct-btn";button.textContent="✏️ صحّح الرد";
    button.addEventListener("click",()=>{const answer=typeof options.answer==="function"?options.answer():options.answer||element.querySelector(".message-text,.bubble")?.textContent||"";edit(previousQuestion(element),answer,element);});
    actions.appendChild(button);(element.querySelector(".message-content")||element).appendChild(actions);
  }
  function ensureUI(){
    if(modal)return;modal=document.createElement("div");modal.className="vertex-learning-modal";modal.hidden=true;
    modal.innerHTML=`<section class="vertex-learning-panel" role="dialog" aria-modal="true" aria-labelledby="vertexLearningTitle"><header class="vertex-learning-header"><h2 id="vertexLearningTitle">تصحيح رد المساعد</h2><button id="vertexLearningClose" class="vertex-learning-close" type="button" aria-label="إغلاق التصحيحات">×</button></header><p class="vertex-learning-note">تُحفظ التصحيحات في هذا المتصفح، وتُفصل حسب الحساب. يستفيد المساعد من التصحيح في السياق المناسب، وقد يحتاج التحقق منه. هذه ذاكرة للتصحيحات وليست إعادة تدريب للنموذج.</p><div id="vertexLearningForm" class="vertex-learning-form"><label>السؤال أو الموضوع<input id="vertexLearningQuestion" maxlength="400" placeholder="السؤال الذي كانت إجابته غير صحيحة"></label><details><summary>عرض الرد السابق</summary><p id="vertexLearningAnswer"></p></details><label>ما التصحيح الصحيح؟<textarea id="vertexLearningCorrection" rows="4" maxlength="240" placeholder="اكتب التصحيح باختصار ووضوح، حتى 240 حرفًا"></textarea></label><div class="vertex-learning-buttons"><button id="vertexLearningSave" class="vertex-learning-save" type="button">حفظ التصحيح</button><button id="vertexLearningReask" type="button" hidden>إعادة طرح السؤال</button><button id="vertexLearningManage" type="button">إدارة التصحيحات</button></div></div><div id="vertexLearningManager" hidden><label class="vertex-learning-toggle"><input id="vertexLearningManagerToggle" type="checkbox">استخدام التصحيحات في الردود القادمة</label><p id="vertexLearningTotal" class="vertex-learning-note"></p><div id="vertexLearningList" class="vertex-learning-list"></div></div><p id="vertexLearningStatus" class="vertex-learning-status" role="status" aria-live="polite"></p></section>`;
    document.body.appendChild(modal);
    $("vertexLearningClose").addEventListener("click",close);$("vertexLearningSave").addEventListener("click",save);$("vertexLearningManage").addEventListener("click",manage);
    $("vertexLearningManagerToggle").addEventListener("change",e=>setEnabled(e.target.checked));
    $("vertexLearningReask").addEventListener("click",()=>{const input=$("messageInput")||$("promptInput");if(!input)return;input.value=$("vertexLearningQuestion").value;input.dispatchEvent(new Event("input",{bubbles:true}));close();input.focus();});
    modal.addEventListener("click",e=>{if(e.target===modal)close();});
    modal.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();}
      if(event.key==="Tab"){
        const nodes=[...modal.querySelectorAll("button,input,textarea,summary")].filter(n=>!n.disabled&&n.offsetParent!==null&&!n.hidden),first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    });
    for(const id of ["vertexLearningCorrection","vertexLearningQuestion"])$(id).addEventListener("input",()=>{$("vertexLearningSave").disabled=!scope;$("vertexLearningReask").hidden=true;});
  }
  function init(){
    if($("messageInput")){
      syncAccount();document.addEventListener("vertex-auth-ready",syncAccount);window.VertexAuth?.whenReady?.().then(syncAccount).catch(()=>{});
      $("vertexLearningOpen")?.addEventListener("click",manage);$("vertexLearningEnabled")?.addEventListener("change",event=>{ensureUI();setEnabled(event.target.checked);});
    }else{
      setScope("guest");const composer=document.querySelector(".composer-area .composer");
      if(composer){let tools=document.querySelector(".vertex-video-toolbar");if(!tools){tools=document.createElement("div");tools.className="vertex-video-toolbar";composer.parentNode.insertBefore(tools,composer);}const button=document.createElement("button");button.type="button";button.className="vertex-learning-open";button.textContent="🧠 التصحيحات";button.addEventListener("click",manage);tools.appendChild(button);}
    }
    refresh();
  }
  window.VertexLearning={context,augment,attach,manage,setScope,syncAccount,clear,exportData(){syncAccount();return state.items.map(item=>({...item}));}};
  window.addEventListener("storage",event=>{if(scope&&event.key===PREFIX+scope){read();if(modal&&!modal.hidden&&!editing)renderManager();}});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
