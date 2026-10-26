import {env} from 'cloudflare:workers';
import {topics,fingerprint} from '../../pov';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 let body:any;try{body=await request.json()}catch{return new Response('Invalid JSON',{status:400})}
 if(!Array.isArray(body?.reviews)||body.reviews.length>25)return new Response('Supply up to 25 reviews.',{status:400});
 for(const r of body.reviews)if(typeof r.id!=='string'||typeof r.expectedText!=='string'||typeof r.expectedTitle!=='string'||typeof r.expectedTopic!=='string'||!topics.includes(r.topic)||!['high','medium','low'].includes(r.confidence)||typeof r.summary!=='string'||!r.summary.trim()||r.summary.length>500||typeof r.reason!=='string'||!r.reason.trim()||r.reason.length>600||!Array.isArray(r.relatedTopics)||r.relatedTopics.some((t:any)=>!topics.includes(t))||r.relatedTopics.length>2)return new Response('Invalid review.',{status:400});
 const updated:string[]=[],skipped:string[]=[];
 for(const r of body.reviews){
 const row=await env.DB!.prepare('SELECT data FROM cards WHERE id=?').bind(r.id).first<{data:string}>();
 if(!row){skipped.push(r.id);continue}const card=JSON.parse(row.data);
 if(card.text!==r.expectedText||(card.title||'')!==r.expectedTitle||card.topic!==r.expectedTopic){skipped.push(r.id);continue}
 const review={summary:r.summary,reason:r.reason,confidence:r.confidence,relatedTopics:r.relatedTopics,reviewedAt:new Date().toISOString(),fingerprint:fingerprint(card),topic:r.topic};
 const data=JSON.stringify({...card,topic:r.topic,review});
 const result=await env.DB!.prepare('UPDATE cards SET data=? WHERE id=? AND data=?').bind(data,r.id,row.data).run();
 if(result.meta.changes)updated.push(r.id);else skipped.push(r.id);
 }
 return Response.json({updated,skipped},{headers:{'Cache-Control':'no-store'}});
}
