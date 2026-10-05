
const cfg = window.APP_CONFIG;
const sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
const startCard = document.getElementById('startCard');
const quizCard = document.getElementById('quizCard');
const doneCard = document.getElementById('doneCard');
const startMsg = document.getElementById('startMsg');
const quizMsg = document.getElementById('quizMsg');
let activeStudent = null, activeQuestions = [];

function msg(el,text,type='error'){el.innerHTML=`<div class="msg ${type}">${text}</div>`}
function clearMsg(el){el.innerHTML=''}
async function invoke(name, body, authToken=null){
  const headers = authToken ? {Authorization:`Bearer ${authToken}`} : {};
  const {data,error} = await sb.functions.invoke(name,{body,headers});
  if(error) throw error;
  return data;
}
document.getElementById('startBtn').onclick = async()=>{
  clearMsg(startMsg);
  const n = Number(document.getElementById('studentNumber').value);
  if(!Number.isInteger(n)||n<1||n>31){msg(startMsg,'الرجاء إدخال رقم طالب صحيح من 1 إلى 31');return}
  try{
    const data=await invoke('get-questions',{studentNumber:n});
    if(data.alreadySubmitted){msg(startMsg,'تم تسجيل إجابات هذا الطالب مسبقاً');return}
    activeStudent=n; activeQuestions=data.questions;
    document.getElementById('studentLabel').textContent=n;
    document.getElementById('questions').innerHTML=activeQuestions.map((q,i)=>`
      <div class="question">
        <h3>السؤال ${i+1}</h3><p>${q.questionText}</p>
        <label>إجابتك:</label>
        <input id="ans${i}" class="input" inputmode="decimal" placeholder="مثال: 0.45 أو 45%">
      </div>`).join('');
    startCard.classList.add('hidden');quizCard.classList.remove('hidden');
  }catch(e){msg(startMsg,'تعذر تحميل الأسئلة. الرجاء المحاولة مرة أخرى.')}
}
document.getElementById('cancelBtn').onclick=()=>{quizCard.classList.add('hidden');startCard.classList.remove('hidden')};
document.getElementById('submitBtn').onclick=async()=>{
  clearMsg(quizMsg);
  const answers=activeQuestions.map((_,i)=>document.getElementById(`ans${i}`).value.trim());
  if(answers.some(a=>!a)){msg(quizMsg,'الرجاء الإجابة عن السؤالين قبل الإرسال.');return}
  if(!confirm('هل أنت متأكد من إرسال الإجابات؟')) return;
  const btn=document.getElementById('submitBtn'); btn.disabled=true; btn.textContent='جاري الحفظ...';
  try{
    const data=await invoke('submit-answers',{studentNumber:activeStudent,answers});
    if(data?.error){msg(quizMsg,data.error);return}
    quizCard.classList.add('hidden');doneCard.classList.remove('hidden');
    setTimeout(()=>location.reload(),4000);
  }catch(e){msg(quizMsg,'تعذر حفظ الإجابات. الرجاء المحاولة مرة أخرى.')}
  finally{btn.disabled=false;btn.textContent='إرسال الإجابات'}
}
