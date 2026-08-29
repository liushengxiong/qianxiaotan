"use client";
import {useEffect,useState} from "react";
import {IconBook2,IconExternalLink,IconPlayerPause,IconPlayerPlay,IconSparkles} from "@tabler/icons-react";
import type {Scenic} from "../lib/catalog";
import {getCity,kindLabel} from "../lib/catalog";
import {topicsForScenic} from "../lib/notion-content";
import {XiaozhiArt} from "./xiaozhi-art";

export function ScenicOverview({scenic,onGuide}:{scenic:Scenic;onGuide:()=>void}){
  const [playing,setPlaying]=useState(false);const [slide,setSlide]=useState(0);
  const topics=topicsForScenic(scenic);
  const slides=[`先看一看${scenic.name}的整体轮廓`,scenic.summary,"把眼前的好奇，变成一个现场问题"];
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setSlide(value=>(value+1)%slides.length),2600);return()=>window.clearInterval(timer)},[playing,slides.length]);
  return <section className="scenic-overview-v6">
    <article className="scenic-introduction">
      <div className="scenic-hero-media">
        {scenic.image?<img src={scenic.image} alt={scenic.name}/>:<div className="scenic-image-placeholder"><XiaozhiArt pose="observe"/><span>{getCity(scenic.cityId).name} · {kindLabel(scenic.kind)}</span></div>}
        <span className="scenic-media-caption">景区图片 · 示意展示</span>
      </div>
      <div className="scenic-introduction-copy"><span>景区介绍</span><h2>先认识眼前的风景，<br/>再带着问题出发。</h2><p>{scenic.summary}</p><p>{scenic.kind==="culture"?"这里适合从建筑、文字与生活痕迹开始观察。亲子同行时，可以先让孩子描述自己真正看见的细节，再阅读现场说明寻找答案。":"这里适合从地形、植物、水与环境声开始观察。亲子同行时，不需要急着记住结论，先把眼前的变化说清楚。"}</p><button className="overview-guide" onClick={onGuide}><IconSparkles stroke={1.8}/><span>有个为什么？问问小探</span></button></div>
    </article>
    <article className={"scenic-video-demo "+(playing?"playing":"")}>
      <div className="scenic-video-stage">{scenic.image&&<img src={scenic.image} alt="" aria-hidden="true"/>}<div><small>景区短片预览 · 演示</small><strong>{slides[slide]}</strong><span>{slide+1} / {slides.length}</span></div><button onClick={()=>setPlaying(value=>!value)} aria-label={playing?"暂停景区短片预览":"播放景区短片预览"}>{playing?<IconPlayerPause stroke={1.8}/>:<IconPlayerPlay stroke={1.8}/>}</button></div>
      <div className="scenic-video-copy"><IconBook2 stroke={1.8}/><div><strong>一分钟认识这一站</strong><p>当前用图片与文字动效模拟视频结构；正式版本可在这里接入已获授权的景区视频。</p></div></div>
    </article>
    <article className="scenic-source-preview"><header><div><span>内容资料</span><h2>从可信来源继续追问</h2></div><a href="https://app.notion.com/p/f7d440a50d454fdab10003b3e5c477b3" target="_blank" rel="noreferrer">内容库 <IconExternalLink stroke={1.8}/></a></header><div className="scenic-topic-grid">{topics.map(topic=><a key={topic.title} href={topic.source} target="_blank" rel="noreferrer"><span>{topic.column}</span><strong>{topic.title}</strong><small>待人工复核 · 查看主来源 <IconExternalLink stroke={1.8}/></small></a>)}</div><p>以上选题来自项目资料库，当前仍处于人工复核阶段；点击可查看原始主来源。</p></article>
  </section>;
}
