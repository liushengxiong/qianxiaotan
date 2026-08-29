import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MobileShell from "../../components/mobile-shell";
import { getScenic } from "../../lib/catalog";

type Props={params:Promise<{slug:string}>;searchParams:Promise<{mode?:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const scenic=getScenic((await params).slug);
  if(!scenic)return {title:"未找到景区｜黔小探",openGraph:{images:[]},twitter:{card:"summary",images:[]}};
  const title=`${scenic.name}探索｜黔小探`;
  return {title,description:scenic.summary,openGraph:{title,description:scenic.summary,images:scenic.image?[{url:scenic.image,alt:scenic.name}]:[]},twitter:{card:scenic.image?"summary_large_image":"summary",title,description:scenic.summary,images:scenic.image?[scenic.image]:[]}};
}
export default async function Page({params,searchParams}:Props){const scenic=getScenic((await params).slug);if(!scenic)notFound();return <MobileShell view="scenic" scenicId={scenic.id} cityId={scenic.cityId} mode={(await searchParams).mode}/>}
