import { env } from 'cloudflare:workers';
import {fingerprint} from '../../pov';
export async function GET() {
 const result = await env.DB!.prepare('SELECT data FROM cards').all();
 const initialized = await env.DB!.prepare("SELECT value FROM settings WHERE key='initialized'").first();
 return Response.json({cards:result.results.map((r:any)=>JSON.parse(r.data)),initialized:!!initialized}, {headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request) {
 if (request.headers.get('origin') !== new URL(request.url).origin) return new Response('Forbidden', {status:403});
 let card:any; try { card=await request.json(); } catch {return new Response('Invalid JSON',{status:400});}
 if(card?.initialize === true){ await env.DB!.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('initialized','true')").run();return Response.json({ok:true});}
 if (!card || typeof card.id!=='string' || card.id.length>100 || typeof card.text!=='string' || card.text.length>20000 || !['thought','inspiration','question'].includes(card.kind) || typeof card.topic!=='string') return new Response('Invalid card',{status:400});
 if(card.url && !/^https?:\/\//i.test(card.url)) return new Response('Use an http or https source link',{status:400});
 const data=JSON.stringify({id:card.id,text:card.text,title:String(card.title||'').slice(0,160),kind:card.kind,topic:card.topic,status:card.status==='review'?'review':'board',pinned:!!card.pinned,url:String(card.url||'').slice(0,4000),image:typeof card.image==='string' && /^data:image\/(png|jpeg|webp);base64,/.test(card.image) && card.image.length<2000000 ? card.image:'',date:String(card.date||new Date().toISOString()),review:card.review?.fingerprint===fingerprint(card)?card.review:undefined,color:String(card.color||'cream').slice(0,20)});
 await env.DB!.prepare('INSERT INTO cards (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(card.id,data).run();
 return Response.json({ok:true});
}
export async function DELETE(request:Request) {
 if(request.headers.get('origin') !== new URL(request.url).origin) return new Response('Forbidden',{status:403});
 const {id}=await request.json() as {id:string};
 await env.DB!.prepare('DELETE FROM cards WHERE id=?').bind(String(id)).run();
 return Response.json({ok:true});
}
