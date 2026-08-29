"use client";
import {useEffect,useState} from "react";
import {IconBrain,IconHeadphones,IconInfoCircle,IconMap,IconMapPinCheck,IconSlideshow,IconUser} from "@tabler/icons-react";
import {CITIES,getCity,getScenic,cityScenics,hotspotsFor,questionsFor} from "../lib/catalog";
import type {Scenic} from "../lib/catalog";
import {EMPTY_STATE} from "../lib/mobile";
import type {MobileState,MobileProfile,MobileVisit} from "../lib/mobile";
import {XiaozhiArt} from "./xiaozhi-art";
import {DigitalGuide} from "./digital-guide";
import {ListenPanel} from "./experience-panels";
import {MobileJournal} from "./mobile-journal";
import {MobileHome} from "./mobile-home";
import {MobileProfileView} from "./mobile-profile";
import {MobileOnboarding} from "./mobile-onboarding";
import {MobileQuiz} from "./mobile-quiz";
import {ScenicOverview} from "./scenic-overview";

type Props={view?:string;scenicId?:string;cityId?:string;mode?:string;setup?:boolean};
const now=()=>new Date().toISOString();
const blankVisit=(scenicId:string):MobileVisit=>({scenic_id:scenicId,listened:[],checked_at:null,journal_at:null,answers:[],quiz_score:null,updated_at:now()});

export default function MobileShell({view="welcome",scenicId,cityId,mode="overview",setup=false}:Props){
  const [data,setData]=useState<MobileState>(EMPTY_STATE);
  const [ready,setReady]=useState(false);
  const [city,setCity]=useState<string>(getCity(cityId||"anshun").id);
  const [guideScenic,setGuideScenic]=useState(scenicId||"");
  const [guide,setGuide]=useState(view==="assistant");
  const [setupDone,setSetupDone]=useState(false);
  const [stamp,setStamp]=useState(false);
  const scenic=getScenic(scenicId||"")||cityScenics(city)[0];
  const visit=data.visits.find(v=>v.scenic_id===scenic.id);
  const progress={listened:visit?.listened||[],tasks:{},answers:visit?.answers||[],quizCompleted:visit?.quiz_score!=null};
  const showSetup=ready&&!setupDone&&(setup||view==="welcome");
  const link=(activity:string)=>"/scenic/"+scenic.id+"?mode="+activity;
  useEffect(()=>setReady(true),[]);
  function updateVisit(patch:Partial<MobileVisit>){
    setData(current=>{const existing=current.visits.find(item=>item.scenic_id===scenic.id)||blankVisit(scenic.id);const updated={...existing,...patch,updated_at:now()};return {...current,visits:[...current.visits.filter(item=>item.scenic_id!==scenic.id),updated]}});
  }
  async function finishSetup(profile:MobileProfile){setData({...EMPTY_STATE,profile});setCity(profile.city);setSetupDone(true);return true}
  const navigation=<><a href={"/explore?city="+city} aria-current={view!=="profile"&&view!=="assistant"?"page":undefined} className={view!=="profile"&&view!=="assistant"?"active":""}><IconMap stroke={1.8}/><span>旅行</span></a><button onClick={()=>{setGuideScenic(scenic.id);setGuide(true)}} aria-expanded={guide} className={guide?"active":""}><XiaozhiArt/><span>小探陪你</span></button><a href="/my-journey" aria-current={view==="profile"?"page":undefined} className={view==="profile"?"active":""}><IconUser stroke={1.8}/><span>我的手账</span></a></>;
  const activities=[
    {id:"overview",label:"景区概要",icon:IconInfoCircle},
    {id:"listen",label:"听一听",icon:IconHeadphones},
    {id:"checkin",label:"打卡任务",icon:IconMapPinCheck},
    {id:"quiz",label:"趣味挑战",icon:IconBrain},
    {id:"journal",label:"电子相册",icon:IconSlideshow},
  ];
  return <div className="mobile-surround"><main className={"mapp "+(showSetup?"is-onboarding":"")+" view-"+view}>
    <header className="m-top"><a href="/" className="m-logo"><i>黔</i><span>黔小探<small>让好奇心，走远一点</small></span></a>{ready&&!showSetup&&<nav className="desktop-navigation" aria-label="主导航">{navigation}</nav>}{ready&&!showSetup&&<label className="m-city"><select aria-label="选择目的地" value={city} onChange={e=>{const next=e.target.value;if(view==="scenic")window.location.assign("/explore?city="+next);else{setCity(next);setGuideScenic("")}}}>{CITIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}</header>
    <div className={"m-body "+(!showSetup&&["welcome","home","assistant"].includes(view)?"is-map-body":"")}>
      {!ready?<div className="m-state-screen" role="status"><XiaozhiArt pose="note"/><h1>正在翻开你的探索地图</h1><p>让好奇心，走远一点。</p></div>:showSetup?<MobileOnboarding initial={data.profile} busy={false} onComplete={finishSetup}/>:<>
        {(view==="welcome"||view==="home"||view==="assistant")&&<MobileHome key={city} city={city} data={data} onGuide={id=>{setGuideScenic(id);setGuide(true)}}/>}
        {view==="scenic"&&<section className="scenic-screen">
          <a className="m-back" href={"/explore?city="+scenic.cityId}>← 返回探索地图</a>
          <div className="scenic-screen-heading"><div className="m-mini-title"><span>{getCity(scenic.cityId).name} / 亲子探索</span><h1>{scenic.name}</h1></div><button className="scenic-guide-button" onClick={()=>setGuide(true)}><XiaozhiArt/><span>问问小探 ↗</span></button></div>
          <nav className="m-activity-nav" aria-label="景区体验">{activities.map(item=>{const Icon=item.icon;return <a key={item.id} aria-current={mode===item.id?"page":undefined} className={mode===item.id?"active":""} href={link(item.id)}><Icon stroke={1.8}/><span>{item.label}</span></a>})}</nav>
          <div className={"scenic-content scenic-mode-"+mode} key={scenic.id+mode}>
          {(!["listen","checkin","quiz","journal"].includes(mode))&&<ScenicOverview scenic={scenic} onGuide={()=>setGuide(true)}/>}
          {mode==="listen"&&<><ListenPanel scenic={scenic} progress={progress} active={!guide} onGuide={()=>setGuide(true)} update={patch=>{const chapter=patch.listened?.find(id=>!visit?.listened.includes(id));if(chapter)updateVisit({listened:[...new Set([...(visit?.listened||[]),chapter])]})}}/><a className="m-primary" href={link("checkin")}>故事听完了，去完成打卡任务 →</a></>}
          {mode==="quiz"&&<MobileQuiz key={scenic.id} scenic={scenic} onComplete={async answers=>{const questions=questionsFor(scenic);updateVisit({answers,quiz_score:Math.round(answers.filter((answer,index)=>answer===questions[index].correct).length/questions.length*100)});return true}}/>}
          {mode==="journal"&&<MobileJournal scenic={scenic}/>}
          {mode==="checkin"&&<CheckinTasks scenic={scenic} visit={visit} onComplete={()=>{updateVisit({checked_at:now()});setStamp(true)}} stamp={stamp}/>}
        </div></section>}
        {view==="profile"&&<MobileProfileView data={data} city={city}/>}
      </>}
    </div>
    {ready&&!showSetup&&<nav className="m-bottom" aria-label="主导航">{navigation}</nav>}
    <DigitalGuide open={guide&&ready&&!showSetup} scenic={getScenic(guideScenic)||scenic} onClose={()=>view==="assistant"?window.location.assign("/explore?city="+city):setGuide(false)}/>
  </main></div>;
}

function CheckinTasks({scenic,visit,onComplete,stamp}:{scenic:Scenic;visit?:MobileVisit;onComplete:()=>void;stamp:boolean}){
  const [done,setDone]=useState<string[]>([]);const tasks=hotspotsFor(scenic);const complete=!!visit?.checked_at;
  return <section className="m-checkin-task-screen"><header><span>旅行中 · 任务卡</span><h2>走到现场，完成三次小发现。</h2><p>和孩子一起看、一起听，把眼前的风景变成属于你们的发现。</p></header><div className="m-hotspot-tasks">{tasks.map((task,index)=><button key={task} className={done.includes(task)||complete?"done":""} onClick={()=>setDone(value=>value.includes(task)?value.filter(item=>item!==task):[...value,task])} disabled={complete}><i>{done.includes(task)||complete?"✓":String(index+1).padStart(2,"0")}</i><span><strong>{task}</strong><small>{done.includes(task)||complete?"这一项完成啦":"到安全开放区域后，和孩子一起完成"}</small></span></button>)}</div><p className="m-disclaimer">请遵守景区安全提示，不越过护栏，不影响当地居民和其他游客。</p><button className="m-primary" disabled={done.length!==tasks.length||complete} onClick={onComplete}>{complete?"本次打卡已完成 ✓":"完成三项，收下景区印章"}</button>{complete&&<div className={"m-stamp-result "+(stamp?"celebrate":"")} role="status"><span>黔行印记</span><strong>{scenic.name}</strong><small>这一路的发现，值得珍藏</small></div>}<a className="m-secondary" href={"/scenic/"+scenic.id+"?mode=quiz"}>去完成趣味挑战 →</a></section>;
}
