
import {corsHeaders,json,adminClient,requireAdmin} from "../_shared/common.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(!await requireAdmin(req))return json({error:"unauthorized"},401);
 const db=adminClient();
 const {data:subs,error}=await db.from("submissions").select("*").order("student_number"); if(error)return json({error:"db"},500);
 const {data:items}=await db.from("submission_items").select("*").order("question_number");
 const results=(subs||[]).map(s=>({...s,items:(items||[]).filter(i=>i.submission_id===s.id)}));
 const submitted=results.length, correct=results.reduce((a,r)=>a+r.correct_count,0), incorrect=results.reduce((a,r)=>a+r.incorrect_count,0);
 const missing=Array.from({length:31},(_,i)=>i+1).filter(n=>!results.some(r=>r.student_number===n));
 return json({summary:{submitted,correct,incorrect,correctPercent:submitted?Math.round(correct/(submitted*2)*1000)/10:0},missing,results});
});
