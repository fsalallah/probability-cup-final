
import {corsHeaders,json,adminClient,parseAnswer} from "../_shared/common.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 try{
  const {studentNumber,answers}=await req.json(); const n=Number(studentNumber);
  if(!Number.isInteger(n)||n<1||n>31||!Array.isArray(answers)||answers.length!==2)return json({error:"بيانات غير صحيحة"},400);
  const db=adminClient();
  const {data:existing}=await db.from("submissions").select("id").eq("student_number",n).maybeSingle();
  if(existing)return json({error:"تم تسجيل إجابات هذا الطالب مسبقاً"},409);
  const {data:qs,error:qerr}=await db.from("questions").select("*").eq("student_number",n).order("question_number"); if(qerr)throw qerr;
  if(!qs||qs.length!==2)return json({error:"لم يتم العثور على السؤالين"},500);
  const checked=qs.map((q,i)=>{const v=parseAnswer(answers[i]);const correct=v!==null&&Math.abs(v-Number(q.correct_answer))<=0.0001;return {q,v,raw:String(answers[i]),correct}});
  const correctCount=checked.filter(x=>x.correct).length;
  const {data:sub,error:serr}=await db.from("submissions").insert({student_number:n,correct_count:correctCount,incorrect_count:2-correctCount,score_percent:correctCount*50}).select().single(); if(serr)throw serr;
  const items=checked.map(x=>({submission_id:sub.id,question_id:x.q.id,question_number:x.q.question_number,question_text:x.q.question_text,student_answer:x.raw,normalized_answer:x.v,correct_answer:x.q.correct_answer,is_correct:x.correct,rule:x.q.rule,formula_solution:x.q.formula_solution}));
  const {error:ierr}=await db.from("submission_items").insert(items); if(ierr)throw ierr;
  return json({ok:true});
 }catch(e){return json({error:"تعذر حفظ الإجابات"},500)}
});
