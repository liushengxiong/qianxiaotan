"use client";
import {useState} from "react";
import {CITIES} from "../lib/catalog";
import type {MobileProfile} from "../lib/mobile";
import {XiaozhiArt} from "./xiaozhi-art";

export function MobileOnboarding({initial,busy,onComplete}:{initial:MobileProfile|null;busy:boolean;onComplete:(profile:MobileProfile)=>Promise<boolean>}){
  const [step,setStep]=useState(0);
  const [nickname,setNickname]=useState(initial?.nickname||"");
  const [role,setRole]=useState<MobileProfile["role"]>(initial?.role||"母亲");
  const [city,setCity]=useState(initial?.city||"anshun");
  return <section className="m-onboarding">
    <div className="m-onboarding-art"><div className="onboarding-story"><span>黔小探 · 贵州亲子探索</span><h2>山水之间，<br/>总有新的发现。</h2><p>听一个故事，留下一次观察。<br/>和小探一起，把好奇装进行囊。</p></div><XiaozhiArt pose={step===0?"hero":step===1?"point":"note"}/><span>小探陪你出发</span></div>
    <div className="onboarding-questions">
    <div className="m-step-dots" aria-label={"引导第 "+(step+1)+" 步，共 3 步"}>{[0,1,2].map(n=><i key={n} className={n<=step?"active":""}/>)}</div>
    <small>一场属于你们的贵州探索</small>
    <h1>{["你好呀，该怎么称呼你？","这一次，谁陪孩子出发？","第一站，想去哪里？"][step]}</h1>
    <p>{["一个喜欢的昵称就好，让我们的旅程从认识开始。","一起观察、一起提问，做彼此最好的旅行搭子。","贵州 9 个市州，每一站都有值得收藏的发现。"][step]}</p>
    <form onSubmit={async e=>{e.preventDefault();if(step<2)setStep(step+1);else await onComplete({nickname:nickname.trim(),role,city})}}>
      {step===0&&<label className="m-nickname"><span>你的昵称</span><input autoComplete="nickname" autoFocus maxLength={16} required value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="例如：小林一家"/><small>不必填写真实姓名 · 最多 16 字</small></label>}
      {step===1&&<div className="m-role-options">{(["父亲","母亲","其他"] as const).map((value,i)=><button type="button" key={value} disabled={busy} aria-pressed={role===value} onClick={()=>setRole(value)} className={role===value?"active":""}><b>{["爸","妈","伴"][i]}</b><span>{value}</span><small>{["爸爸同行","妈妈同行","家人 / 陪同者"][i]}</small></button>)}</div>}
      {step===2&&<div className="m-city-options">{CITIES.map(c=><button type="button" key={c.id} disabled={busy} aria-pressed={city===c.id} onClick={()=>setCity(c.id)} className={city===c.id?"active":""}><strong>{c.name}</strong><small>{c.theme}</small></button>)}</div>}
      <button type="submit" className="m-primary" disabled={busy||!nickname.trim()}>{busy?"正在开启旅程…":step===2?"和小探一起，出发 →":"下一步 →"}</button>
      {step>0&&<button type="button" className="m-link-button" disabled={busy} onClick={()=>setStep(step-1)}>← 上一步</button>}
    </form></div>
  </section>;
}
