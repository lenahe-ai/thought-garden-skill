import {env} from 'cloudflare:workers';
import {fingerprint} from '../../pov';
const reply=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const [rows,profile]=await Promise.all([env.DB!.prepare("SELECT value FROM settings WHERE key LIKE 'draft:%'").all(),env.DB!.prepare("SELECT value FROM settings WHERE key='voice_profile'").first<{value:string}>()]);return reply({drafts:rows.results.map((r:any)=>JSON.parse(r.value)),profile:profile?JSON.parse(profile.value):null});}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Forbidden'},403);
 let b:any;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(!b||typeof b.id!=='string'||!/^[\w-]{8,100}$/.test(b.id))return reply({error:'Invalid draft id'},400);
 const key='draft:'+b.id;
 if(b.action==='create'){
 const c=await env.DB!.prepare('SELECT data FROM cards WHERE id=?').bind(String(b.sourceId)).first<{data:string}>();if(!c)return reply({error:'Save the original thought first.'},404);
 const card=JSON.parse(c.data);const now=new Date().toISOString();const draft={id:b.id,title:card.title||'Untitled draft',text:'',brief:'',status:'draft',sources:[{id:card.id,text:card.text,title:card.title||'',url:card.url||'',fingerprint:fingerprint(card)}],version:crypto.randomUUID(),createdAt:now,updatedAt:now};
 await env.DB!.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)').bind(key,JSON.stringify(draft)).run();const r=await env.DB!.prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>();return reply({draft:JSON.parse(r!.value)});
 }
 if(!['save','suggest'].includes(b.action)||typeof b.expectedVersion!=='string'||typeof b.text!=='string'||b.text.length>20000)return reply({error:'Invalid draft update'},400);
 const row=await env.DB!.prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>();if(!row)return reply({error:'Draft not found'},404);
 const d=JSON.parse(row.value);if(d.version!==b.expectedVersion)return reply({error:'This draft changed. Your text is still in the editor; refresh before saving a new version.'},409);
 if(b.action==='suggest'&&(d.text.trim()||d.status==='finished'))return reply({error:'There is already writing here. Return your suggestion in chat; do not replace it.'},409);
 const n={...d,text:b.text,version:crypto.randomUUID(),updatedAt:new Date().toISOString()};
 if(b.action==='save'){if(typeof b.title!=='string'||b.title.length>160||typeof b.brief!=='string'||b.brief.length>4000||!['draft','finished'].includes(b.status))return reply({error:'Invalid draft fields'},400);Object.assign(n,{title:b.title,brief:b.brief,status:b.status});}
 const r=await env.DB!.prepare('UPDATE settings SET value=? WHERE key=? AND value=?').bind(JSON.stringify(n),key,row.value).run();return r.meta.changes?reply({draft:n}):reply({error:'Draft changed; refresh before retrying.'},409);
}
