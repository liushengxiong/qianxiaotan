import MobileShell from "./components/mobile-shell";

export default async function Page({searchParams}:{searchParams:Promise<{setup?:string}>}) {
  const query=await searchParams;
  return <MobileShell view="welcome" setup={query.setup==="1"}/>;
}
