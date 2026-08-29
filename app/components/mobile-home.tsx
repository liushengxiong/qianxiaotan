"use client";
import {cityScenics,getCity,kindLabel} from "../lib/catalog";
import type {MobileState} from "../lib/mobile";
import {travelProgress} from "../lib/mobile";
import {CityMap} from "./city-map";
import {XiaozhiArt} from "./xiaozhi-art";

export function MobileHome({city,data,onGuide}:{city:string;data:MobileState;onGuide:(scenicId:string)=>void}){
  const destination=getCity(city);
  const locations=cityScenics(city);
  const completion=Object.fromEntries(locations.map(s=>[s.id,travelProgress(data.visits.find(v=>v.scenic_id===s.id))*25]));
  const visited=locations.filter(s=>data.visits.some(v=>v.scenic_id===s.id&&v.checked_at)).length;
  return <section className="exploration-screen" aria-label="探索目的地">
    <header className="exploration-heading">
      <div><p>你好，{data.profile?.nickname||"小探险家"} · 带着好奇出发</p><h1>下一站，发现{destination.name}。</h1></div>
      <a href="/my-journey" className="exploration-tally"><strong>{visited}<small> / {locations.length}</small></strong><span>本页景区已盖章 ↗</span></a>
    </header>
    <div className="exploration-workspace">
      <aside className="exploration-destinations" aria-label="景区入口">
        <div className="exploration-list-heading"><span>{destination.theme}</span><h2>从一处风景开始</h2><p>点击景区，开启你们的探索。</p></div>
        <div className="exploration-list">{locations.map((scenic,index)=><a href={"/scenic/"+scenic.id} key={scenic.id} className="exploration-place">
          <span className={"place-index "+(completion[scenic.id]===100?"done":completion[scenic.id]>0?"started":"")}>{completion[scenic.id]===100?"✓":String(index+1).padStart(2,"0")}</span>
          <span><strong>{scenic.name}</strong><small>{kindLabel(scenic.kind)} · {completion[scenic.id]?"已探索 "+completion[scenic.id]+"%":"等待你的发现"}</small></span><b>↗</b>
        </a>)}</div>
        <button className="exploration-companion" onClick={()=>onGuide(locations[0].id)}><XiaozhiArt pose="face"/><span><strong>让小探陪你发现</strong><small>听故事，问问题，找线索。</small></span><b>↗</b></button>
      </aside>
      <div className="exploration-map"><CityMap key={city} city={destination} scenics={locations} records={{}} completion={completion}/><div className="exploration-map-legend"><span><i/>待探索</span><span><i className="started"/>探索中</span><span><i className="done"/>已完成</span></div></div>
    </div>
  </section>;
}
