
import {corsHeaders,json,adminClient,requireAdmin} from "../_shared/common.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(!await requireAdmin(req))return json({error:"unauthorized"},401);
 const db=adminClient();const {data:subs}=await db.from("submissions").select("*").order("student_number");const {data:items}=await db.from("submission_items").select("*").order("question_number");
 const lines=[["Student Number","Question 1","Student Answer 1","Correct Answer 1","Result 1","Question 2","Student Answer 2","Correct Answer 2","Result 2","Correct Count","Incorrect Count","Score Percentage","Date/Time"]];
 for(const s of subs||[]){const its=(items||[]).filter(i=>i.submission_id===s.id);lines.push([s.student_number,its[0]?.question_text||"",its[0]?.student_answer||"",its[0]?.correct_answer||"",its[0]?.is_correct?"Correct":"Incorrect",its[1]?.question_text||"",its[1]?.student_answer||"",its[1]?.correct_answer||"",its[1]?.is_correct?"Correct":"Incorrect",s.correct_count,s.incorrect_count,s.score_percent,s.submitted_at])}
 const esc=(v:any)=>`"${String(v??"").replaceAll('"','""')}"`;const csv="\uFEFF"+lines.map(r=>r.map(esc).join(",")).join("\n");
 return new Response(csv,{headers:{...corsHeaders,"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=results.csv"}});
});
