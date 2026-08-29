"use client";
import {useState} from "react";
import {CITIES,SCENICS,getCity,getScenic,cityScenics} from "../lib/catalog";
import type {MobileState} from "../lib/mobile";
import {personalLeaderboard} from "../lib/mobile";
import {XiaozhiArt} from "./xiaozhi-art";
import {IconSlideshow} from "@tabler/icons-react";

export function MobileProfileView({data,city}:{data:MobileState;city:string}){
  const [section,setSection]=useState("stamps");
  const [region,setRegion]=useState("all");
  const [page,setPage]=useState(0);
  const completed=data.visits.filter(v=>v.checked_at);
  const ranked=personalLeaderboard(data.visits);
  const locations=region==="all"?SCENICS:cityScenics(region);
  const pages=Math.max(1,Math.ceil(locations.length/9));
  const first=cityScenics(city)[0];
  return <section className="m-profile">
    <header><XiaozhiArt pose="happy"/><div><span>每一步，都是新的发现</span><h1>{data.profile?.nickname||"小探险家"}的探索手账</h1><p>{getCity(city).name} · {data.profile?.role||"亲子"}同行</p></div><a href="/">重新规划 ↗</a></header>
    <div className="m-stats"><span><b>{completed.length}<small> / {SCENICS.length}</small></b>本页景区印章</span><span><b>{ranked.length}</b>本页趣味挑战</span><span><b>0</b>已下载电子相册</span></div>
    <nav className="passport-navigation" aria-label="手账内容">{[["stamps","贵州印章"],["scores","趣味成绩"],["albums","电子相册"]].map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={section===id?"active":""} aria-pressed={section===id}>{label}</button>)}</nav>
    <div className="passport-content">
      {section==="stamps"&&<><div className="m-section-title"><h2>把贵州，一枚枚点亮。</h2><label><span className="sr-only">筛选印章市州</span><select value={region} onChange={e=>{setRegion(e.target.value);setPage(0)}}><option value="all">全部市州</option>{CITIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div><p className="m-disclaimer">已收录 {SCENICS.length} 处景区，自主到访打卡后点亮；不代表已覆盖贵州全部景点。</p><div className="m-passport">{locations.slice(page*9,page*9+9).map(s=>{const stamped=completed.some(v=>v.scenic_id===s.id);return <a key={s.id} href={"/scenic/"+s.id+"?mode=checkin"} className={stamped?"stamped":""} aria-label={s.name+(stamped?"，已盖章":"，尚未盖章")}><span>{s.name.slice(0,1)}</span><strong>{s.name}</strong><small>{getCity(s.cityId).name} · {stamped?"已盖章":"待探索"}</small></a>})}</div><div className="passport-pagination"><button disabled={page===0} onClick={()=>setPage(p=>p-1)} aria-label="上一页印章">←</button><span>第 {page+1} 页，共 {pages} 页</span><button disabled={page+1>=pages} onClick={()=>setPage(p=>p+1)} aria-label="下一页印章">→</button></div></>}
      {section==="scores"&&<section className="m-rank"><div className="m-section-title"><h2>我的趣味挑战成绩</h2><span>边旅行，边积累</span></div>{ranked.length?<ol>{ranked.map((v,i)=><li key={v.scenic_id}><i>{String(i+1).padStart(2,"0")}</i><a href={"/scenic/"+v.scenic_id+"?mode=quiz"}>{getScenic(v.scenic_id)?.name}<small>趣味挑战 · 再试一次 →</small></a><b>{v.quiz_score}<small>分</small></b></li>)}</ol>:<a className="m-empty" href={"/scenic/"+first.id+"?mode=quiz"}>还没有成绩，开启第一场趣味挑战 →</a>}</section>}
      {section==="albums"&&<section className="m-album-profile"><div className="m-section-title"><h2>我们的电子相册</h2><span>收藏一路风景</span></div><div className="m-album-empty"><IconSlideshow stroke={1.8}/><h3>把照片变成一段会播放的回忆</h3><p>选择一处景点，上传喜欢的照片，让小探自动生成电子相册。</p><a href={"/scenic/"+first.id+"?mode=journal"} className="m-primary">制作第一本电子相册 →</a></div></section>}
    </div>
    <a className="passport-continue" href={"/explore?city="+city}>回到地图，继续发现下一站 <span>→</span></a>
  </section>;
}
