import MobileShell from "../components/mobile-shell";
export default async function Page({searchParams}:{searchParams:Promise<{scenic?:string}>}){
  return <MobileShell view="assistant" scenicId={(await searchParams).scenic}/>;
}
