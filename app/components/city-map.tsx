"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { City, Scenic } from "../lib/catalog";
import { Progress, percent, project } from "../lib/progress";

export function CityMap({city,scenics,records,completion}:{city:City;scenics:Scenic[];records:Record<string,Progress>;completion?:Record<string,number>}) {
  const container=useRef<HTMLDivElement>(null);
  const dragging=useRef<{x:number;y:number;panX:number;panY:number}|null>(null);
  const [size,setSize]=useState({width:0,height:550});
  const [zoomDelta,setZoomDelta]=useState(0);
  const [pan,setPan]=useState({x:0,y:0});
  const [unavailable,setUnavailable]=useState(false);
  useEffect(()=>{if(!container.current)return;const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(container.current);return()=>observer.disconnect()},[]);
  const camera=useMemo(()=>{
    const points=scenics.map(s=>project(s.lat,s.lon,0));
    const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x));
    const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
    const fit=Math.floor(Math.log2(Math.min(Math.max(size.width-180,140)/Math.max(maxX-minX,.001),Math.max(size.height-150,140)/Math.max(maxY-minY,.001))));
    const zoom=Math.max(6,Math.min(14,fit+zoomDelta));
    return {zoom,x:(minX+maxX)/2*2**zoom-pan.x,y:(minY+maxY)/2*2**zoom-pan.y};
  },[scenics,size,zoomDelta,pan]);
  const left=camera.x-size.width/2,top=camera.y-size.height/2;
  const tiles=[];
  if(size.width&&!unavailable) for(let y=Math.floor(top/256);y<=Math.floor((top+size.height)/256);y++) for(let x=Math.floor(left/256);x<=Math.floor((left+size.width)/256);x++) tiles.push({x,y});
  const reset=()=>{setZoomDelta(0);setPan({x:0,y:0});setUnavailable(false)};
  return <div className="local-map" ref={container} role="region" aria-label={`${city.name}景区探索地图`} tabIndex={0}
    onKeyDown={e=>{const step=50;if(e.key==="ArrowLeft")setPan(p=>({...p,x:p.x+step}));else if(e.key==="ArrowRight")setPan(p=>({...p,x:p.x-step}));else if(e.key==="ArrowUp")setPan(p=>({...p,y:p.y+step}));else if(e.key==="ArrowDown")setPan(p=>({...p,y:p.y-step}));else return;e.preventDefault()}}
    onPointerDown={e=>{if((e.target as HTMLElement).closest("a,button"))return;dragging.current={x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y};e.currentTarget.setPointerCapture(e.pointerId)}}
    onPointerMove={e=>{const d=dragging.current;if(d)setPan({x:d.panX+e.clientX-d.x,y:d.panY+e.clientY-d.y})}}
    onPointerUp={()=>{dragging.current=null}} onPointerCancel={()=>{dragging.current=null}}>
    <div className="tile-layer" aria-hidden="true">{tiles.map(tile=><img key={`${camera.zoom}/${tile.x}/${tile.y}`} draggable={false} alt="" referrerPolicy="strict-origin-when-cross-origin" src={`https://tile.openstreetmap.org/${camera.zoom}/${tile.x}/${tile.y}.png`} style={{left:tile.x*256-left,top:tile.y*256-top}} onError={()=>setUnavailable(true)}/>)}</div>
    <div className="map-location-label"><span className="status-dot"/>{city.name}探索地图 <small>{scenics.length} 个景区</small></div>
    {unavailable&&<div className="map-offline">底图暂时未加载 · 以下为地理点位示意<button onClick={reset}>重试</button></div>}
    {size.width>0&&scenics.map((scenic,index)=>{const point=project(scenic.lat,scenic.lon,camera.zoom);const p=completion?.[scenic.id]??(records[scenic.id]?percent(records[scenic.id]):0);return <a className={`geo-marker ${p===100?"complete":p>0?"started":""}`} key={scenic.id} href={`/scenic/${scenic.id}`} style={{left:point.x-left,top:point.y-top}} aria-label={`${scenic.name}，探索进度${p}%，进入景区`}><span className="marker-number">{p===100?"✓":String(index+1).padStart(2,"0")}</span><b>{scenic.name}</b><span className="marker-tooltip"><strong>{scenic.name}</strong><small>{scenic.summary}</small><em>{p}% 已探索 · 约 30–60 分钟 →</em></span></a>})}
    <div className="geo-controls"><button aria-label="放大地图" disabled={camera.zoom>=14} onClick={()=>{setZoomDelta(v=>v+1);setPan({x:0,y:0})}}>＋</button><button aria-label="缩小地图" disabled={camera.zoom<=6} onClick={()=>{setZoomDelta(v=>v-1);setPan({x:0,y:0})}}>−</button><button aria-label="显示全部景区" onClick={reset}>◎</button></div>
    <div className="geo-footnote">景区为大致点位，不用于导航 · 可拖动 / 方向键移动</div>
    <div className="map-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">开放街图</a>贡献者 · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">反馈地图</a></div>
  </div>;
}
