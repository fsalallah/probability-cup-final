
import {corsHeaders,json,adminClient,requireAdmin} from "../_shared/common.ts";
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(!await requireAdmin(req))return json({error:"unauthorized"},401);
 const {studentNumber}=await req.json();const n=Number(studentNumber);if(!Number.isInteger(n)||n<1||n>31)return json({error:"bad"},400);
 const db=adminClient();const {error}=await db.from("submissions").delete().eq("student_number",n);return error?json({error:"db"},500):json({ok:true});
});
