
const sb=supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_ANON_KEY);
let dataCache=null;
async function token(){const {data}=await sb.auth.getSession(); if(!data.session){location.href='./';return null} return data.session.access_token}
async function invoke(name,body={}){const t=await token();if(!t)return;const {data,error}=await sb.functions.invoke(name,{body,headers:{Authorization:`Bearer ${t}`}});if(error)throw error;return data}
function badge(ok){return `<span class="badge ${ok?'good':'bad'}">${ok?'✓ صحيح':'✗ خطأ'}</span>`}
function render(d){
 dataCache=d;
 stats.innerHTML=[
 ['عدد الطلاب الكلي',31],['تم التسليم',d.summary.submitted],['المتبقون',31-d.summary.submitted],
 ['الإجابات الصحيحة',d.summary.correct],['الإجابات الخاطئة',d.summary.incorrect],['متوسط الصحيح',d.summary.correctPercent+'%']
 ].map(x=>`<div class="stat">${x[0]}<b>${x[1]}</b></div>`).join('');
 missing.textContent=d.missing.length?d.missing.join('، '):'جميع الطلاب سلّموا';
 drawTable(d.results);
 analysis.innerHTML=d.results.map(r=>`<details><summary>الطالب ${r.student_number} — ${r.score_percent}%</summary>
 ${r.items.map(i=>`<div class="question"><b>السؤال ${i.question_number}</b><p>${i.question_text}</p>
 <p><b>إجابة الطالب:</b> ${i.student_answer}</p><p><b>الإجابة الصحيحة:</b> ${i.correct_answer}</p>
 <p><b>القاعدة:</b> ${i.rule}</p><p><b>القانون والحل:</b> ${i.formula_solution}</p><p>${badge(i.is_correct)}</p></div>`).join('')}
 </details>`).join('');
}
function drawTable(results){
 const q=search.value.trim();
 const f=q?results.filter(r=>String(r.student_number).includes(q)):results;
 tbody.innerHTML=f.map(r=>`<tr><td>${r.student_number}</td><td>${r.items[0]?.student_answer??''}</td><td>${badge(r.items[0]?.is_correct)}</td>
 <td>${r.items[1]?.student_answer??''}</td><td>${badge(r.items[1]?.is_correct)}</td><td>${r.correct_count}</td><td>${r.incorrect_count}</td>
 <td>${r.score_percent}%</td><td>${new Date(r.submitted_at).toLocaleString('ar-SA')}</td>
 <td><button class="btn btn-danger" onclick="delStudent(${r.student_number})">حذف</button></td></tr>`).join('');
}
async function load(){try{render(await invoke('admin-results'))}catch(e){alert('تعذر تحميل النتائج')}}
async function delStudent(n){if(!confirm(`حذف محاولة الطالب ${n}؟`))return;await invoke('admin-delete',{studentNumber:n});await load()}
refreshBtn.onclick=load; search.oninput=()=>dataCache&&drawTable(dataCache.results);
logoutBtn.onclick=async()=>{await sb.auth.signOut();location.href='./'};
csvBtn.onclick=async()=>{const t=await token();const res=await fetch(`${APP_CONFIG.SUPABASE_URL}/functions/v1/admin-export?format=csv`,{headers:{Authorization:`Bearer ${t}`,apikey:APP_CONFIG.SUPABASE_ANON_KEY}});const blob=await res.blob();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='results.csv';a.click()};
jsonBtn.onclick=()=>{if(!dataCache)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(dataCache.results,null,2)],{type:'application/json'}));a.download='results.json';a.click()};
resetBtn.onclick=async()=>{if(!confirm('سيتم مسح جميع النتائج. هل أنت متأكد؟'))return;const typed=prompt('اكتب RESET للتأكيد');if(typed!=='RESET')return;await invoke('admin-reset',{confirm:'RESET'});await load()};
load();
