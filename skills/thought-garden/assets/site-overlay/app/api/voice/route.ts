import {env} from 'cloudflare:workers';
const reply=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const r=await env.DB!.prepare("SELECT value FROM settings WHERE key='voice_profile'").first<{value:string}>();return reply({profile:r?JSON.parse(r.value):{principles:'Preserve my wording and uncertainty. Use references for tone, never invented experiences.',samples:[]},revision:r?.value||''});}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Forbidden'},403);
 let b:any;try{b=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
 if(!b||!['upsert','principles'].includes(b.action)||typeof b.expectedRevision!=='string')return reply({error:'Invalid voice update'},400);
 const row=await env.DB!.prepare("SELECT value FROM settings WHERE key='voice_profile'").first<{value:string}>();if((row?.value||'')!==b.expectedRevision)return reply({error:'Voice library changed. Reload before saving; your input is still here.'},409);
 const p=row?JSON.parse(row.value):{principles:'Preserve my wording and uncertainty. Use references for tone, never invented experiences.',samples:[]};
 if(b.action==='principles'){if(typeof b.principles!=='string'||b.principles.length>15000)return reply({error:'Invalid principles'},400);p.principles=b.principles;}
 else {const s=b.sample;if(!s||typeof s.id!=='string'||s.id.length>100||typeof s.text!=='string'||!s.text.trim()||s.text.length>20000||!['primary','supporting'].includes(s.weight)||['title','note','url','kind'].some(k=>typeof s[k]!=='string')||s.title.length>160||s.note.length>2000||s.url.length>4000||s.url&&!/^https?:\/\//i.test(s.url))return reply({error:'Add text (up to 20,000 characters) and a valid optional source link.'},400);
 const i=p.samples.findIndex((x:any)=>x.id===s.id);if(i<0&&p.samples.length>=100)return reply({error:'The library allows 100 references. Edit an existing sample.'},400);
 const item={...(i>=0?p.samples[i]:{}),...s,updatedAt:new Date().toISOString()};if(i<0)p.samples.push(item);else p.samples[i]=item;}
 p.updatedAt=new Date().toISOString();const value=JSON.stringify(p);
 const r=row?await env.DB!.prepare("UPDATE settings SET value=? WHERE key='voice_profile' AND value=?").bind(value,row.value).run():await env.DB!.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('voice_profile',?)").bind(value).run();return r.meta.changes?reply({profile:p,revision:value}):reply({error:'Voice library changed; reload before retrying.'},409);
}
