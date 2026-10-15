// Local animated video composition. Exports real MP4, never a renamed WebM.
(function(){
  "use strict";
  const VERSION="20261015";
  const LIBRARY="vendor/mediabunny-1.61.4.min.js";
  const FPS=24;
  const THEMES={blue:["#080e22","#154a8c","#58caff"],purple:["#160b28","#532c85","#db9bff"],green:["#061a19","#145b55","#6ef5d3"]};
  const SIZES={vertical:[720,1280],horizontal:[1280,720],square:[720,720]};
  let modal,canvas,ctx,lastFocus,job=null,resultUrl="",images=[],planner=null,libraryPromise=null,planning=false,loadingImages=false;
  const el=id=>document.getElementById(id);
  const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
  const clean=value=>String(value||"").replace(/\*\*|__/g,"").trim();

  function isVideoRequest(value){
    const text=String(value||"").replace(/[\u064b-\u065f\u0670]/g,"").trim();
    if(/^(?:كيف|وش|ايش|ما|ماذا|how|what|why)(?:\s|$)/i.test(text))return false;
    return /(?:^|\s)(?:سوي|سو|انشئ|أنشئ|اصنع|انتج|أنتج|ولد|جهز|صمم|اعمل)[\s\S]{0,60}(?:فيديو|فديو|شورت|ريلز|mp4)/i.test(text)
      || /^(?:ابي|أبي|ابغى|أبغى|ابغا|أبغا|اريد|أريد|نبغى|نبي|عطني|اعطني|أعطني)\s+(?:لي\s+)?(?:فيديو|فديو|شورت|ريلز|mp4)(?:\s|$)/i.test(text)
      || /\b(?:create|make|generate|produce|render)\b[\s\S]{0,60}\b(?:video|mp4)\b/i.test(text)
      || /^(?:فيديو|فديو|شورت|ريلز|video|mp4)(?:\s|$)/i.test(text);
  }

  function scenesFrom(text){
    return String(text||"").split(/\n+/).map(clean).filter(Boolean).slice(0,8).map(s=>s.slice(0,180));
  }

  function seedScenes(prompt){
    const value=clean(prompt).replace(/^(?:سوي|سو|انشئ|أنشئ|اصنع|create|make|generate)\s*/i,"");
    const sentences=value.split(/[.!؟?\n]+/).map(clean).filter(Boolean);
    return (sentences.length>1?sentences:[value||"فكرتك تبدأ هنا","حوّل الفكرة إلى تجربة ملهمة","ابدأ خطوتك التالية اليوم"]).slice(0,6).map(s=>s.slice(0,180)).join("\n");
  }

  function config(){
    const format=el("vertexVideoFormat").value;
    const size=SIZES[format]||SIZES.vertical;
    return {width:size[0],height:size[1],duration:Number(el("vertexVideoDuration").value),theme:el("vertexVideoTheme").value,scenes:scenesFrom(el("vertexVideoScenes").value)};
  }

  function wrapText(text,width){
    const lines=[];let line="";
    for(const word of text.split(/\s+/)){
      const candidate=line?line+" "+word:word;
      if(ctx.measureText(candidate).width<=width){line=candidate;continue;}
      if(line){lines.push(line);line="";}
      for(const char of word){
        if(ctx.measureText(line+char).width>width&&line){lines.push(line);line="";}
        line+=char;
      }
    }
    if(line)lines.push(line);
    return lines;
  }

  function drawFrame(settings,time){
    const {width:w,height:h,scenes,duration}=settings;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const colors=THEMES[settings.theme]||THEMES.blue;
    const count=Math.max(1,scenes.length),sceneDuration=duration/count;
    const index=Math.min(count-1,Math.floor(time/sceneDuration));
    const phase=(time-index*sceneDuration)/sceneDuration;
    const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,colors[0]);gradient.addColorStop(1,colors[1]);
    ctx.globalAlpha=1;ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    if(images.length){
      const image=images[index%images.length];
      const scale=Math.max(w/image.width,h/image.height)*(1+.06*phase);
      ctx.drawImage(image,(w-image.width*scale)/2,(h-image.height*scale)/2,image.width*scale,image.height*scale);
      ctx.fillStyle="rgba(3,8,18,.66)";ctx.fillRect(0,0,w,h);
    }else{
      for(let i=0;i<6;i++){
        const x=w*(.12+.17*i)+Math.sin(time*.55+i)*w*.07;
        const y=h*(.2+.12*(i%4))+Math.cos(time*.4+i)*h*.08;
        const r=Math.min(w,h)*(.12+.025*(i%3));
        const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,colors[2]+"35");glow.addColorStop(1,colors[2]+"00");
        ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
      }
    }
    const fade=Math.min(1,phase*8,(1-phase)*8);ctx.globalAlpha=Math.max(0,fade);
    const text=scenes[index]||"اكتب نص المشهد هنا";
    const textWidth=w*.81,maxTextHeight=h*.57;
    let font=Math.min(w*.079,h*.115),lines=[];
    do{ctx.font=`700 ${Math.floor(font)}px Tahoma, Arial, sans-serif`;lines=wrapText(text,textWidth);if(lines.length*font*1.65<=maxTextHeight)break;font-=2;}while(font>22);
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction=/[\u0600-\u06ff]/.test(text)?"rtl":"ltr";
    ctx.fillStyle="#fff";ctx.shadowColor="#000a";ctx.shadowBlur=14;
    const lineHeight=font*1.65,top=h*.49-(lines.length-1)*lineHeight/2+(1-Math.min(1,phase*5))*25;
    lines.forEach((line,i)=>ctx.fillText(line,w/2,top+i*lineHeight,textWidth));
    ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.direction="ltr";
    ctx.font=`600 ${Math.round(Math.min(w,h)*.025)}px Arial`;ctx.fillStyle="#e3efff";
    ctx.fillText("VERTEX AI",w/2,h*.91);
    ctx.font=`500 ${Math.round(Math.min(w,h)*.023)}px Arial`;ctx.fillStyle="#b5c7e2";
    ctx.fillText(`${index+1} / ${count}`,w/2,h*.11);
    ctx.fillStyle="#ffffff30";ctx.fillRect(w*.09,h*.95,w*.82,4);
    ctx.fillStyle=colors[2];ctx.fillRect(w*.09,h*.95,w*.82*Math.min(1,time/duration),4);
  }

  function preview(){if(!job&&canvas)drawFrame(config(),config().duration/(Math.max(1,config().scenes.length)*2));}
  function status(text){el("vertexVideoStatus").textContent=text;}
  function toggleBusy(busy){
    modal.querySelectorAll("textarea,input,select,[data-video-edit]").forEach(node=>node.disabled=busy);
    el("vertexVideoCreate").disabled=busy;el("vertexVideoCancel").hidden=!busy;
    el("vertexVideoProgress").hidden=!busy;
  }

  function loadLibrary(){
    if(window.Mediabunny)return Promise.resolve(window.Mediabunny);
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement("script");let timer;
      const fail=()=>{clearTimeout(timer);script.remove();libraryPromise=null;reject(new Error("library_unavailable"));};
      script.src=LIBRARY+"?v="+VERSION;
      script.onload=()=>{clearTimeout(timer);if(window.Mediabunny)resolve(window.Mediabunny);else fail();};
      script.onerror=fail;timer=setTimeout(fail,20000);document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function abortError(){return new DOMException("تم الإلغاء","AbortError");}
  function checkJob(current){if(current.cancelled)throw abortError();}

  async function encodeMp4(settings,current){
    const M=await loadLibrary();checkJob(current);
    const target=new M.BufferTarget();
    const output=new M.Output({format:new M.Mp4OutputFormat({fastStart:"in-memory"}),target});
    current.output=output;
    const source=new M.CanvasSource(canvas,{codec:"avc",quality:new M.Quality({bitrate:2500000}),latencyMode:"quality",keyFrameInterval:2});
    output.addVideoTrack(source,{frameRate:FPS});
    try{
      await output.start();
      const total=settings.duration*FPS;
      for(let frame=0;frame<total;frame++){
        checkJob(current);drawFrame(settings,frame/FPS);await source.add(frame/FPS,1/FPS);
        if(frame%8===0){el("vertexVideoProgress").value=Math.round(frame/total*100);status(`جارٍ إنشاء الفيديو… ${Math.floor(frame/total*100)}٪`);await tick();}
      }
      source.close();checkJob(current);status("جارٍ تجهيز ملف MP4…");await output.finalize();checkJob(current);
      return new Blob([target.buffer],{type:"video/mp4"});
    }catch(error){if(output.state!=="finalized"&&output.state!=="canceled")await output.cancel().catch(()=>{});throw error;}
    finally{current.output=null;}
  }

  function nativeMime(){
    if(!window.MediaRecorder||!canvas.captureStream)return "";
    return ["video/mp4;codecs=avc1.42001f","video/mp4"].find(type=>MediaRecorder.isTypeSupported(type))||"";
  }

  async function encodeNative(settings,current,mime){
    checkJob(current);drawFrame(settings,0);
    const stream=canvas.captureStream(FPS),chunks=[];
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000});
    return new Promise((resolve,reject)=>{
      let raf,timer,settled=false;
      const cleanup=()=>{cancelAnimationFrame(raf);clearTimeout(timer);stream.getTracks().forEach(track=>track.stop());current.cancelNative=null;};
      const fail=error=>{if(settled)return;settled=true;if(recorder.state!=="inactive")recorder.stop();cleanup();reject(error);};
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>fail(new Error("encoding_failed"));
      recorder.onstop=()=>{if(settled)return;settled=true;cleanup();if(current.cancelled)reject(abortError());else if(!chunks.length)reject(new Error("encoding_failed"));else resolve(new Blob(chunks,{type:"video/mp4"}));};
      current.cancelNative=()=>fail(abortError());
      const started=performance.now();
      const frame=()=>{if(current.cancelled){fail(abortError());return;}const time=Math.min(settings.duration,(performance.now()-started)/1000);drawFrame(settings,time);el("vertexVideoProgress").value=time/settings.duration*100;status(`جارٍ تسجيل الفيديو… ${Math.floor(time/settings.duration*100)}٪ — أبقِ هذه الصفحة مفتوحة`);if(time<settings.duration)raf=requestAnimationFrame(frame);};
      recorder.start(500);raf=requestAnimationFrame(frame);timer=setTimeout(()=>{if(recorder.state!=="inactive")recorder.stop();},settings.duration*1000+150);
    });
  }

  async function validateMp4(blob){
    if(!blob||blob.size<100)throw new Error("invalid_mp4");
    const header=new Uint8Array(await blob.slice(0,64).arrayBuffer());
    if(!new TextDecoder().decode(header).includes("ftyp"))throw new Error("invalid_mp4");
    return blob;
  }

  async function createVideo(){
    if(job||planning||loadingImages)return;
    const settings=config();
    if(!settings.scenes.length){status("اكتب نص مشهد واحد على الأقل، أو اضغط «تجهيز المشاهد».");el("vertexVideoScenes").focus();return;}
    if(!window.VideoEncoder&&!nativeMime()){status("تصدير MP4 غير مدعوم في هذا المتصفح. جرّب أحدث إصدار من Chrome أو Edge أو Safari.");return;}
    const current={cancelled:false};job=current;toggleBusy(true);status("جارٍ تجهيز التصدير…");
    try{
      let blob;
      if(window.VideoEncoder){
        try{blob=await encodeMp4(settings,current);}catch(error){checkJob(current);const mime=nativeMime();if(!mime)throw error;blob=await encodeNative(settings,current,mime);}
      }else blob=await encodeNative(settings,current,nativeMime());
      await validateMp4(blob);checkJob(current);
      const nextUrl=URL.createObjectURL(blob);if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=nextUrl;
      el("vertexVideoPlayer").src=resultUrl;el("vertexVideoDownload").href=resultUrl;
      el("vertexVideoDownload").download=`vertex-video-${Date.now()}.mp4`;
      el("vertexVideoResult").hidden=false;
      status(`الفيديو جاهز: ${settings.duration} ثانية · ${settings.width}×${settings.height} · ${(blob.size/1048576).toFixed(1)} MB. اضغط «تنزيل MP4» لحفظه.`);
      el("vertexVideoDownload").focus();
    }catch(error){
      if(error.name==="AbortError")status("تم إلغاء إنشاء الفيديو.");
      else if(error.message==="library_unavailable")status("تعذر تحميل أداة التصدير. تحقق من الاتصال ثم حاول مرة أخرى.");
      else{console.warn("Vertex video export:",error);status("تعذر تصدير MP4 على هذا الجهاز. جرّب تحديث Chrome أو Edge وإغلاق التطبيقات الثقيلة.");}
    }finally{job=null;toggleBusy(false);preview();}
  }

  function cancel(){if(!job)return;job.cancelled=true;job.cancelNative?.();status("جارٍ إلغاء إنشاء الفيديو…");}

  async function chooseImages(event){
    if(job||planning||loadingImages)return;
    const files=[...event.target.files];
    if(files.length>6||files.some(file=>file.size>8*1048576||!/^image\/(png|jpeg|webp)$/.test(file.type))){status("اختر حتى 6 صور PNG أو JPG أو WebP، بحجم لا يتجاوز 8 MB للصورة.");event.target.value="";return;}
    const next=[];
    loadingImages=true;toggleBusy(true);el("vertexVideoCancel").hidden=true;status("جارٍ تجهيز الصور…");
    try{
      for(const file of files){
        const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
        const reduced=document.createElement("canvas");reduced.width=Math.max(1,Math.round(bitmap.width*ratio));reduced.height=Math.max(1,Math.round(bitmap.height*ratio));reduced.getContext("2d").drawImage(bitmap,0,0,reduced.width,reduced.height);bitmap.close();next.push(reduced);
      }
      images=next;el("vertexVideoImagesStatus").textContent=images.length?`تمت إضافة ${images.length} صورة، حسب ترتيب اختيارها.`:"خلفيات متحركة بدون صور.";preview();status("");
    }catch{status("تعذر فتح إحدى الصور. جرّب صورًا بصيغة JPG أو PNG.");}
    finally{loadingImages=false;toggleBusy(false);}
  }

  function storyboardPrompt(description){
    return "اكتب نصوصًا قصيرة لفيديو متحرك. مهمتك كتابة نصوص المشاهد فقط، والتطبيق يتولى إنشاء ملف MP4. أعد JSON صالحًا فقط بدون مقدمة أو Markdown، بصيغة {\"scenes\":[\"نص المشهد الأول\",\"نص المشهد الثاني\"]}. من 3 إلى 6 مشاهد، حتى 120 حرفًا لكل مشهد، بنفس لغة الطلب. لا تقل إنك لا تستطيع إنشاء فيديو. الطلب: "+description.slice(0,1500);
  }

  async function defaultPlanner(description){
    if(!window.VertexAuth?.ensureSupabase)throw new Error("planner_unavailable");
    const client=await window.VertexAuth.ensureSupabase();
    const {data,error}=await client.functions.invoke("vertex-ai",{body:{messages:[{role:"user",content:storyboardPrompt(description)}],memories:[],assistantName:"Vertex AI"}});
    if(error||data?.code||!data?.reply)throw new Error("planner_unavailable");return data.reply;
  }

  async function prepareScenes(){
    if(job||planning||loadingImages)return;
    const description=el("vertexVideoPrompt").value.trim();
    if(!description){status("اكتب وصف الفيديو أولًا.");el("vertexVideoPrompt").focus();return;}
    planning=true;toggleBusy(true);el("vertexVideoCancel").hidden=true;status("جارٍ كتابة نصوص المشاهد…");
    try{
      const reply=await (planner||defaultPlanner)(description,storyboardPrompt(description));
      const text=String(reply||"").replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim();
      const data=JSON.parse(text);const scenes=Array.isArray(data.scenes)?data.scenes.filter(s=>typeof s==="string").map(clean).filter(Boolean).slice(0,8):[];
      if(!scenes.length)throw new Error("invalid_storyboard");
      el("vertexVideoScenes").value=scenes.map(s=>s.slice(0,180)).join("\n");status("المشاهد جاهزة. راجع النص ثم اضغط «إنشاء MP4».");
    }catch(error){
      if(!el("vertexVideoScenes").value.trim())el("vertexVideoScenes").value=seedScenes(description);
      status("تعذر تجهيز النص تلقائيًا الآن. يمكنك تعديل نص المشاهد يدويًا ثم إنشاء MP4.");
    }finally{planning=false;toggleBusy(false);preview();}
  }

  function close(){cancel();modal.hidden=true;el("vertexVideoPlayer").pause();document.body.style.overflow=modal.dataset.previousOverflow||"";lastFocus?.focus();}
  function open(prompt=""){
    ensureUI();lastFocus=document.activeElement;
    if(modal.hidden){modal.dataset.previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";}
    modal.hidden=false;
    if(prompt&&!job&&!planning){el("vertexVideoPrompt").value=prompt.slice(0,1500);el("vertexVideoScenes").value=seedScenes(prompt);status("جهّز المشاهد تلقائيًا، أو عدّل نصها ثم أنشئ الفيديو.");}
    preview();el("vertexVideoPrompt").focus();
  }

  function ensureUI(){
    if(modal)return;
    modal=document.createElement("div");modal.className="vertex-video-modal";modal.hidden=true;
    modal.innerHTML=`<section class="vertex-video-panel" role="dialog" aria-modal="true" aria-labelledby="vertexVideoTitle" tabindex="-1">
      <header class="vertex-video-heading"><div><h2 id="vertexVideoTitle">🎬 إنشاء فيديو MP4</h2><p>فيديو متحرك من نصوصك وصورك، جاهز للتنزيل والمشاركة. الفيديو بدون صوت.</p></div><button class="vertex-video-close" id="vertexVideoClose" type="button" aria-label="إغلاق محرر الفيديو">×</button></header>
      <div class="vertex-video-layout"><div class="vertex-video-fields">
      <label>وصف الفيديو<textarea id="vertexVideoPrompt" rows="2" maxlength="1500" placeholder="مثال: إعلان قصير عن Vertex AI يساعد في التعلم والبرمجة"></textarea></label>
      <div><button class="vertex-video-launch" id="vertexVideoPrepare" data-video-edit type="button">✨ تجهيز المشاهد بالذكاء الاصطناعي</button></div>
      <label>نص المشاهد — كل سطر مشهد مستقل<textarea id="vertexVideoScenes" rows="5" maxlength="1600" placeholder="فكرتك تبدأ هنا&#10;تعلم وابتكر مع Vertex AI&#10;ابدأ الآن"></textarea><small>حتى 8 مشاهد، و180 حرفًا للمشهد. راجع النص قبل إنشاء الفيديو.</small></label>
      <div class="vertex-video-options"><label>مقاس الفيديو<select id="vertexVideoFormat"><option value="vertical">عمودي 9:16 — 720×1280</option><option value="horizontal">أفقي 16:9 — 1280×720</option><option value="square">مربع 1:1 — 720×720</option></select></label><label>المدة<select id="vertexVideoDuration"><option value="10">10 ثوانٍ</option><option value="15" selected>15 ثانية</option><option value="30">30 ثانية</option><option value="60">60 ثانية</option></select></label><label>الألوان<select id="vertexVideoTheme"><option value="blue">أزرق</option><option value="purple">بنفسجي</option><option value="green">أخضر</option></select></label></div>
      <label>صورك للخلفية — اختياري<input id="vertexVideoImages" type="file" accept="image/png,image/jpeg,image/webp" multiple><small>حتى 6 صور. تتم معالجة الصور على جهازك.</small></label><div id="vertexVideoImagesStatus" class="vertex-video-images" aria-live="polite"></div>
      <div class="vertex-video-buttons"><button id="vertexVideoCreate" class="vertex-video-create" type="button">إنشاء MP4</button><button id="vertexVideoCancel" type="button" hidden>إلغاء الإنشاء</button></div>
      <progress id="vertexVideoProgress" class="vertex-video-progress" max="100" value="0" hidden aria-label="تقدم إنشاء الفيديو"></progress><p id="vertexVideoStatus" class="vertex-video-status" role="status" aria-live="polite"></p>
      </div><div class="vertex-video-preview"><p>معاينة التصميم</p><canvas id="vertexVideoCanvas" width="720" height="1280" aria-label="معاينة نصوص الفيديو وخلفيته"></canvas><div id="vertexVideoResult" class="vertex-video-result" hidden><h3>آخر فيديو جاهز</h3><video id="vertexVideoPlayer" controls playsinline preload="metadata"></video><a id="vertexVideoDownload" class="vertex-video-download" download="vertex-video.mp4">⬇ تنزيل MP4</a></div></div></div></section>`;
    document.body.appendChild(modal);canvas=el("vertexVideoCanvas");ctx=canvas.getContext("2d");
    el("vertexVideoClose").addEventListener("click",close);el("vertexVideoCancel").addEventListener("click",cancel);el("vertexVideoCreate").addEventListener("click",createVideo);el("vertexVideoPrepare").addEventListener("click",prepareScenes);el("vertexVideoImages").addEventListener("change",chooseImages);
    ["vertexVideoScenes","vertexVideoFormat","vertexVideoDuration","vertexVideoTheme"].forEach(id=>el(id).addEventListener("input",preview));
    modal.addEventListener("click",event=>{if(event.target===modal)close();});
    modal.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();}
      if(event.key==="Tab"){
        const focusable=[...modal.querySelectorAll("button,textarea,select,input,a[href],video[controls]")].filter(node=>!node.disabled&&node.offsetParent!==null&&!node.hidden);
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    });
  }

  function init(){
    const tools=document.querySelector(".composer-tools");
    const guest=document.querySelector(".composer-area .composer");
    if(!tools&&!guest)return;
    const button=document.createElement("button");button.type="button";button.id="vertexVideoLaunch";button.className="vertex-video-launch";button.textContent="🎬 إنشاء فيديو";button.addEventListener("click",()=>open((el("messageInput")||el("promptInput"))?.value||""));
    if(tools)tools.appendChild(button);else{let toolbar=document.querySelector(".vertex-video-toolbar");if(!toolbar){toolbar=document.createElement("div");toolbar.className="vertex-video-toolbar";guest.parentNode.insertBefore(toolbar,guest);}toolbar.appendChild(button);}
  }
  window.VertexVideo={isVideoRequest,handlePrompt(text){if(!isVideoRequest(text))return false;open(text);prepareScenes();return true;},open,setPlanner(callback){planner=callback;}};
  window.addEventListener("beforeunload",()=>{cancel();if(resultUrl)URL.revokeObjectURL(resultUrl);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
