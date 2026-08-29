import MobileShell from "../components/mobile-shell";
export default async function Page({searchParams}:{searchParams:Promise<{city?:string}>}) {
  const query=await searchParams;
  return <MobileShell view="home" cityId={query.city}/>;
}
