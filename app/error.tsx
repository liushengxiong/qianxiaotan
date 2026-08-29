"use client";
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){
  return <main className="m-state-screen" style={{minHeight:"100dvh",padding:24}}><span>黔小探</span><h1>旅程暂时停了一下</h1><p>请重试，已保存的探索记录不会因此清空。</p><button className="m-primary" onClick={reset}>重新打开这一页</button><a href="/explore">返回探索地图 →</a></main>;
}
