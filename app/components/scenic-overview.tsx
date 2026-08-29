"use client";
import {useEffect,useState} from "react";
import {IconBook2,IconChevronRight,IconPlayerPause,IconPlayerPlay,IconSparkles,IconX} from "@tabler/icons-react";
import type {Scenic} from "../lib/catalog";
import {getCity,kindLabel} from "../lib/catalog";
import {topicsForScenic} from "../lib/notion-content";
import {articleByTopic} from "../lib/notion-articles";
import type {NotionArticle} from "../lib/notion-articles";
import {XiaozhiArt} from "./xiaozhi-art";

export function ScenicOverview({scenic,onGuide}:{scenic:Scenic;onGuide:()=>void}){
  const [playing,setPlaying]=useState(false);const [slide,setSlide]=useState(0);const [article,setArticle]=useState<NotionArticle|null>(null);
  const slides=[`先看一看${scenic.name}的整体轮廓`,scenic.summary,"把眼前的好奇，变成一个现场问题"];
  const articles=topicsForScenic(scenic).map(item=>articleByTopic(item.title)).filter(Boolean) as NotionArticle[];
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setSlide(value=>(value+1)%slides.length),2600);return()=>window.clearInterval(timer)},[playing,slides.length]);
  useEffect(()=>{if(!article)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setArticle(null)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[article]);
  return <section className="scenic-overview-v6">
    <article className="scenic-introduction">
      <div className="scenic-hero-media">{scenic.image?<img src={scenic.image} alt={scenic.name}/>:<div className="scenic-image-placeholder"><XiaozhiArt pose="observe"/><span>{getCity(scenic.cityId).name} · {kindLabel(scenic.kind)}</span></div>}</div>
      <div className="scenic-introduction-copy"><span>景区介绍</span><h2>先认识眼前的风景，<br/>再带着问题出发。</h2><p>{scenic.summary}</p><p>{scenic.kind==="culture"?"从建筑、文字与生活痕迹开始观察。先让孩子描述自己真正看见的细节，再从文章和现场说明中寻找答案。":"从地形、植物、水与环境声开始观察。不需要急着记住结论，先把眼前的变化说清楚。"}</p><button className="overview-guide" onClick={onGuide}><IconSparkles stroke={1.8}/><span>有个为什么？问问小探</span></button></div>
    </article>
    <article className={"scenic-video-demo "+(playing?"playing":"")}>
      <div className="scenic-video-stage">{scenic.image&&<img src={scenic.image} alt="" aria-hidden="true"/>}<div><small>一分钟认识这一站</small><strong>{slides[slide]}</strong><span>{slide+1} / {slides.length}</span></div><button onClick={()=>setPlaying(value=>!value)} aria-label={playing?"暂停景区短片":"播放景区短片"}>{playing?<IconPlayerPause stroke={1.8}/>:<IconPlayerPlay stroke={1.8}/>}</button></div>
      <div className="scenic-video-copy"><IconBook2 stroke={1.8}/><div><strong>景区导览</strong><p>用一段轻量影像和三个问题，先建立对这一站的整体印象。</p></div></div>
    </article>
    <article className="scenic-source-preview"><header><div><span>小探知识库</span><h2>带着一个好问题，读懂这一站</h2></div></header><div className="scenic-topic-grid">{articles.map(item=><button key={item.topic} onClick={()=>setArticle(item)}><span>{item.column}</span><strong>{item.headline}</strong><small>阅读全文 <IconChevronRight stroke={1.8}/></small></button>)}</div></article>
    {article&&<div className="article-reader-backdrop" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)setArticle(null)}}><article className="article-reader" role="dialog" aria-modal="true" aria-labelledby="article-reader-title"><header><div><span>{article.region} · {article.column}</span><h2 id="article-reader-title">{article.headline}</h2></div><button onClick={()=>setArticle(null)} aria-label="关闭文章"><IconX stroke={1.8}/></button></header>{article.lead&&<blockquote>{article.lead}</blockquote>}<div className="article-reader-body">{article.sections.map(section=><section key={section.heading}><h3>{section.heading.startsWith("你还可以问")?"你还可以问小探":section.heading}</h3><ArticleText text={section.body}/></section>)}</div><footer><button className="m-primary" onClick={()=>setArticle(null)}>读完了，回到景区</button></footer></article></div>}
  </section>;
}

function ArticleText({text}:{text:string}){
  const lines=text.split("\n").map(line=>line.trim()).filter(Boolean);
  return <>{lines.map((line,index)=>line.startsWith("### ")?<h4 key={index}>{line.slice(4)}</h4>:line.startsWith("- ")?<p className="article-list-item" key={index}>· {line.slice(2)}</p>:line.match(/^[A-D]\. /)?<p className="article-option" key={index}>{line}</p>:line.startsWith("题目：")?<strong className="article-question" key={index}>{line.slice(3)}</strong>:line.startsWith("正确答案：")||line.startsWith("解释：")?null:<p key={index}>{line}</p>)}</>;
}
