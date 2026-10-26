export const topics=['Inbox','Human by design','Understand first','Learning & curiosity','Fresh eyes','Building & becoming','Growth at a human pace','AI that helps in real life'];
export const bucketDescriptions:Record<string,string>={
 'Inbox':'Unsorted fragments, or thoughts that need more context.',
 'Human by design':'Protect connection, judgment, creativity and useful friction.',
 'Understand first':'Listen, ask questions and understand causes before intervening.',
 'Learning & curiosity':'Beginner experiences and whatever draws your curiosity.',
 'Fresh eyes':'Transferable experience and perspectives from beyond one industry.',
 'Building & becoming':'Making, finishing, self-trust and finding your own way to build.',
 'Growth at a human pace':'Ambition, sustainable growth, experience and enjoying the journey.',
 'AI that helps in real life':'Practical technology that supports agency and solves a real everyday problem.'
};
export function fingerprint(c:{text:string,title?:string,url?:string}){const s=JSON.stringify([c.text,c.title||'',c.url||'']);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
export type Review={summary:string,reason:string,confidence:'high'|'medium'|'low',relatedTopics:string[],reviewedAt:string,fingerprint:string,topic:string};
