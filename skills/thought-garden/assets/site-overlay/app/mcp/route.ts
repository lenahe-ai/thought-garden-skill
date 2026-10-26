import {GET as listCards,POST as saveCard} from '../api/cards/route';
export async function POST(request:Request){
 let rpc:any;try{rpc=await request.json()}catch{return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}})}
 const result=(value:any)=>Response.json({jsonrpc:'2.0',id:rpc.id??null,result:value});
 if(rpc.method==='server/discover')return result({supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
 if(rpc.method==='initialize')return result({protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'thought-garden',version:'1.0.0'}});
 if(rpc.method==='tools/list')return result({tools:[{name:'list_thoughts',description:'Read the owner’s private thought garden to find ideas and connections. Preserve attribution and uncertainty.',inputSchema:{type:'object',properties:{},additionalProperties:false}},{name:'capture_thought',description:'Save a thought or inspiration to the private board. Preserve the owner’s wording. Do not invent experiences or beliefs.',inputSchema:{type:'object',properties:{text:{type:'string'},title:{type:'string'},topic:{type:'string',enum:['Inbox','Human by design','Understand first','Learning & curiosity','Fresh eyes','Building & becoming','Growth at a human pace','AI that helps in real life']},kind:{type:'string',enum:['thought','inspiration','question']},url:{type:'string'}},required:['text'],additionalProperties:false}}]});
 if(rpc.method==='tools/call'){
 try{
 if(rpc.params?.name==='list_thoughts'){const r=await listCards();return result({content:[{type:'text',text:JSON.stringify(await r.json())}]})}
 if(rpc.params?.name==='capture_thought'){
 const a=rpc.params.arguments||{};const origin=new URL(request.url).origin;
 const c={...a,id:crypto.randomUUID(),topic:a.topic||'Inbox',kind:a.kind||'thought',title:a.title||'',pinned:false,date:new Date().toISOString(),color:'sage'};
 const r=await saveCard(new Request(origin+'/api/cards',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(c)}));
 if(!r.ok)throw Error(await r.text());return result({content:[{type:'text',text:JSON.stringify({saved:true,id:c.id,title:c.title,topic:c.topic})}]});
 }throw Error('Unknown tool');
 }catch(e:any){return result({isError:true,content:[{type:'text',text:e.message}]})}
 }
 if(rpc.method?.startsWith('notifications/'))return new Response(null,{status:202});
 return Response.json({jsonrpc:'2.0',id:rpc.id??null,error:{code:-32601,message:'Method not found'}});
}
