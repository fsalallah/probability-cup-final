
import {corsHeaders,json,adminClient,requireAdmin} from "../_shared/common.ts";
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(!await requireAdmin(req))return json({error:"unauthorized"},401);
 const {confirm}=await req.json();if(confirm!=="RESET")return json({error:"confirmation_required"},400);
 const db=adminClient();const {error}=await db.from("submissions").delete().neq("student_number",0);return error?json({error:"db"},500):json({ok:true});
});
