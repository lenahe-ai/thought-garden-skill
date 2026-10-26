import {env} from 'cloudflare:workers';
import {fingerprint} from '../../pov';
const reply=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const [rows,profile,cards]=await Promise.all([env.DB!.prepare('SELECT data FROM threads').all(),env.DB!.prepare("SELECT value FROM settings WHERE key='voice_profile'").first<{value:string}>(),env.DB!.prepare('SELECT data FROM cards').all()]);
 return reply({threads:rows.results.map((r:any)=>JSON.parse(r.data)),profile:profile?JSON.parse(profile.value):null,cards:cards.results.map((r:any)=>JSON.parse(r.data))});
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Forbidden'},403);
 let b:any;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(b?.action==='profile'){
 const p=b.profile;if(!p||typeof p.principles!=='string'||p.principles.length>15000||!Array.isArray(p.samples)||p.samples.length>20||p.samples.some((s:any)=>typeof s.id!=='string'||typeof s.text!=='string'||s.text.length>20000||!['primary','supporting'].includes(s.weight)))return reply({error:'Invalid profile'},400);
 await env.DB!.prepare("INSERT INTO settings(key,value) VALUES('voice_profile',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify({...p,updatedAt:new Date().toISOString()})).run();return reply({saved:true});
 }
 if(b?.action==='feedback'){
 if(typeof b.id!=='string'||!['new','explore','later','notme'].includes(b.state)||typeof b.note!=='string'||b.note.length>4000||typeof b.draft!=='string'||b.draft.length>20000)return reply({error:'Invalid feedback'},400);
 const r=await env.DB!.prepare('SELECT data FROM threads WHERE id=?').bind(b.id).first<{data:string}>();if(!r)return reply({error:'Thread not found'},404);
 const data=JSON.parse(r.data);data.feedback={state:b.state,note:b.note,draft:b.draft,updatedAt:new Date().toISOString()};
 const res=await env.DB!.prepare('UPDATE threads SET data=? WHERE id=? AND data=?').bind(JSON.stringify(data),b.id,r.data).run();return res.meta.changes?reply({saved:true}):reply({error:'This thread changed. Refresh before saving.'},409);
 }
 if(b?.action==='suggest'){
 if(!Array.isArray(b.threads)||b.threads.length>10)return reply({error:'Supply up to ten suggestions'},400);
 const written=[],skipped=[];
 for(const t of b.threads){
 if(!t||typeof t.id!=='string'||t.id.length>100||['title','theme','why','question','opening','voiceNote','caution'].some(k=>typeof t[k]!=='string'||t[k].length>4000)||!Array.isArray(t.sources)||!t.sources.length||t.sources.length>8||t.sources.some((s:any)=>typeof s.id!=='string'||typeof s.fingerprint!=='string'))return reply({error:'Invalid suggestion'},400);
 let stale=false;for(const s of t.sources){const row=await env.DB!.prepare('SELECT data FROM cards WHERE id=?').bind(s.id).first<{data:string}>();if(!row||fingerprint(JSON.parse(row.data))!==s.fingerprint){stale=true;break}}if(stale){skipped.push(t.id);continue}
 const existing=await env.DB!.prepare('SELECT data FROM threads WHERE id=?').bind(t.id).first();
 if(existing){skipped.push(t.id);continue} // Never overwrite feedback or a user's refinement.
 const data={id:t.id,title:t.title,theme:t.theme,why:t.why,question:t.question,opening:t.opening,voiceNote:t.voiceNote,caution:t.caution,sources:t.sources,voiceReferences:Array.isArray(t.voiceReferences)?t.voiceReferences:[],createdAt:new Date().toISOString(),feedback:{state:'new',note:'',draft:''}};
 await env.DB!.prepare('INSERT OR IGNORE INTO threads(id,data) VALUES(?,?)').bind(t.id,JSON.stringify(data)).run();written.push(t.id);
 }
 return reply({written,skipped});
 }
 return reply({error:'Unknown action'},400);
}
