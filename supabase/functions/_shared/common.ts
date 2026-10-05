
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const corsHeaders={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
 "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
};
export function json(body:any,status=200){return new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json; charset=utf-8"}})}
export function adminClient(){return createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)}
export async function requireAdmin(req:Request){
 const auth=req.headers.get("Authorization")||"";
 const token=auth.replace(/^Bearer\s+/,"");
 if(!token) return null;
 const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data,error}=await client.auth.getUser(token);
 if(error||!data.user) return null;
 const allowed=(Deno.env.get("ADMIN_EMAIL")||"").toLowerCase();
 if(!allowed || data.user.email?.toLowerCase()!==allowed) return null;
 return data.user;
}
export function parseAnswer(raw:string){
 let s=String(raw??"").trim().replace(/\s+/g,"").replace("٪","%").replace(",",".");
 if(!s) return null;
 const pct=s.endsWith("%"); if(pct)s=s.slice(0,-1);
 const n=Number(s); if(!Number.isFinite(n))return null;
 return pct?n/100:n;
}
