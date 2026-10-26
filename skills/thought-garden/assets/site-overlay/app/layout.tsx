import './globals.css';
export const metadata={title:'The thought garden',description:'A little room for your unfinished thoughts.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
