
import {corsHeaders,json,adminClient} from "../_shared/common.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 try{
  const {studentNumber}=await req.json(); const n=Number(studentNumber);
  if(!Number.isInteger(n)||n<1||n>31)return json({error:"رقم طالب غير صحيح"},400);
  const db=adminClient();
  const {data:sub}=await db.from("submissions").select("id").eq("student_number",n).maybeSingle();
  if(sub)return json({alreadySubmitted:true,questions:[]});
  const {data,error}=await db.from("questions").select("id,question_number,question_text").eq("student_number",n).order("question_number");
  if(error)throw error;
  return json({alreadySubmitted:false,questions:(data||[]).map(q=>({id:q.id,questionNumber:q.question_number,questionText:q.question_text}))});
 }catch(e){return json({error:"server_error"},500)}
});
