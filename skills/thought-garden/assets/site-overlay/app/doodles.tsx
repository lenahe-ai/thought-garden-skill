import type {CSSProperties} from 'react';
export function Doodle({kind='spark',className='',style}:{kind?:string,className?:string,style?:CSSProperties}){
 const shapes:Record<string,React.ReactNode>={
 spark:<><path d="M31 5 35 23 52 15 41 31 56 40 37 38 31 57 26 39 7 44 21 31 9 18 26 23Z"/><path d="m53 4 3 5m-51 46 5-3"/></>,
 sun:<><path d="M39 17c-13-6-24 4-23 16s13 18 23 12 12-21 0-28Z"/><path d="m30 3 1 8m21-4-6 8m14 13-9 2m4 20-8-7M30 60l1-9M8 49l7-7M2 28l10 1M9 9l8 9"/><path d="M25 29h1m12 0h1m-13 7q6 7 12 0"/></>,
 sprout:<><path d="M29 58c6-15 6-28 3-40M32 35C14 35 8 25 10 15c13-2 24 6 22 20ZM33 25C30 10 43 3 54 7c0 11-8 19-21 18Z"/><path d="M20 58q11-5 24 0"/></>,
 kite:<><path d="m32 3 23 21-18 22L14 24Z"/><path d="m32 3 5 43M14 24l41 0M37 46c-17 8 14 11-1 16"/><path d="m27 51 5 1-2 5m13-1 5 1-3 5"/></>,
 heart:<><path d="M31 53C15 43 2 30 9 16s20-6 23 3c4-12 19-17 24-3S42 43 31 53Z"/><path d="m5 6-3-4m56 1-1 6m2 40 4 2"/></>,
 brain:<><path d="M31 14C22 1 12 9 14 17 1 19 3 32 10 35c-9 11 3 23 13 17 4 10 14 8 13-1 13 6 25-4 18-15 11-7 5-20-3-20C52 3 37 2 34 13l-1 40"/><path d="M14 18q11-3 9 9M10 35q11-8 14 2m-2 15q-5-8 2-11m27-25q-12 0-10 12m13 8q-12-7-12 5"/></>,
 eyes:<><path d="M4 31Q15 9 30 29 44 8 60 29 45 49 31 31 17 50 4 31Z"/><ellipse cx="20" cy="29" rx="3" ry="6"/><ellipse cx="43" cy="28" rx="3" ry="6"/><path d="m11 11-3-5m15 4 1-6m19 5 1-6m10 8 4-4"/></>,
 arrow:<><path d="M5 9c40-17 59 24 29 31-12 3-16-7-9-12s24 0 23 25"/><path d="m38 45 10 10 9-13"/></>,
 loop:<><path d="M4 29c8-14 17 14 25 0s17 14 25 0M4 39c8-14 17 14 25 0s17 14 25 0"/></>,
 star:<><path d="m31 5 7 17 19 2-15 13 5 19-17-10-16 10 4-20L4 24l20-2Z"/><path d="m25 28 2 1m10-1 2 1m-12 6q5 4 10-1"/></>,
 bulb:<><path d="M22 43c0-9-10-11-10-23 0-20 37-21 38 0 1 12-11 15-11 23ZM22 49l17-1m-15 7 13-1m-10 5h7M31 41V27l-6-6m6 6 7-6"/><path d="m3 6 5 5m48-8-5 7M1 28l7-1m48-1 6 2"/></>
 };
 return <svg className={'doodle '+className} style={style} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind]||shapes.spark}</svg>
}
export function topicDoodle(topic:string){return ({'Learning & curiosity':'kite','Human by design':'heart','Understand first':'sprout','Fresh eyes':'eyes','Building & becoming':'bulb','Growth at a human pace':'sprout','AI that helps in real life':'bulb'} as Record<string,string>)[topic]||'brain'}
