import {env} from 'cloudflare:workers';
import {fingerprint} from '../../pov';
const reply=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const rows=await env.DB!.prepare('SELECT data FROM asks').all();return reply({asks:rows.results.map((r:any)=>JSON.parse(r.data))});}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Forbidden'},403);
 let b:any;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(b.action==='create'){
 if(typeof b.id!=='string'||!/^[\w-]{8,100}$/.test(b.id)||typeof b.brief!=='string'||!b.brief.trim()||b.brief.length>4000)return reply({error:'Write a brief of 1–4,000 characters.'},400);
 const data={id:b.id,brief:b.brief.trim(),status:'pending',createdAt:new Date().toISOString(),results:[],note:''};
 await env.DB!.prepare('INSERT OR IGNORE INTO asks(id,data) VALUES(?,?)').bind(b.id,JSON.stringify(data)).run();return reply({saved:true,id:b.id});
 }
 if(b.action==='answer'){
 if(typeof b.id!=='string'||typeof b.expectedBrief!=='string'||typeof b.note!=='string'||b.note.length>3000||!Array.isArray(b.results)||b.results.length>6)return reply({error:'Invalid answer'},400);
 const row=await env.DB!.prepare('SELECT data FROM asks WHERE id=?').bind(b.id).first<{data:string}>();if(!row)return reply({error:'Brief not found'},404);
 const ask=JSON.parse(row.data);if(ask.status!=='pending'||ask.brief!==b.expectedBrief)return reply({error:'Brief already answered or changed'},409);
 for(const a of b.results){if(!a||['title','position','grounding','tension','counterpoint','question'].some(k=>typeof a[k]!=='string'||a[k].length>2500)||!Array.isArray(a.sources)||!a.sources.length||a.sources.length>8||a.sources.some((s:any)=>typeof s.id!=='string'||typeof s.fingerprint!=='string'))return reply({error:'Invalid angle'},400);
 for(const s of a.sources){const r=await env.DB!.prepare('SELECT data FROM cards WHERE id=?').bind(s.id).first<{data:string}>();if(!r||fingerprint(JSON.parse(r.data))!==s.fingerprint)return reply({error:'Source changed; reread your sources.'},409)}
 }
 const data={...ask,status:'answered',note:b.note,results:b.results,answeredAt:new Date().toISOString()};
 const r=await env.DB!.prepare('UPDATE asks SET data=? WHERE id=? AND data=?').bind(JSON.stringify(data),b.id,row.data).run();return r.meta.changes?reply({saved:true}):reply({error:'Brief changed'},409);
 }
 return reply({error:'Unknown action'},400);
}
