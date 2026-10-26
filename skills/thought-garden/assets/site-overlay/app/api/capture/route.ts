import {env} from 'cloudflare:workers';
// Sites dispatch authenticates owner-private requests before forwarding them.
// Native shortcuts use the platform's OAI-Sites-Authorization service header.
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 let body:any;try{body=await request.json()}catch{return Response.json({saved:false,error:'Send a JSON object with a text field.'},{status:400})}
 if(typeof body?.text!=='string'||!body.text.trim()||body.text.length>20000)return Response.json({saved:false,error:'A thought must contain 1–20,000 characters.'},{status:400});
 const id=typeof body.capture_id==='string'&&/^[\w-]{8,100}$/.test(body.capture_id)?body.capture_id:crypto.randomUUID();
 const card={id,text:body.text.trim(),title:'',kind:'thought',topic:'Inbox',status:'review',pinned:false,url:'',image:'',date:new Date().toISOString(),color:'sage'};
 await env.DB!.prepare('INSERT OR IGNORE INTO cards (id,data) VALUES (?,?)').bind(id,JSON.stringify(card)).run();
 return Response.json({saved:true,id,message:'Saved to your review queue.'},{headers:{'Cache-Control':'no-store'}});
}
