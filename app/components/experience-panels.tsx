"use client";

import {FormEvent,useEffect,useRef,useState} from "react";
import {Scenic,chaptersFor,tasksFor,questionsFor} from "../lib/catalog";
import {Progress,score} from "../lib/progress";
import {XiaozhiArt} from "./xiaozhi-art";

type PanelProps={scenic:Scenic;progress:Progress;update:(patch:Partial<Progress>)=>void};

export function ListenPanel({scenic,progress,update,active,onGuide}:PanelProps&{active:boolean;onGuide:()=>void}){
  const chapters=chaptersFor(scenic);
  const [index,setIndex]=useState(0);
  const [status,setStatus]=useState<"idle"|"playing"|"paused">("idle");
  const [position,setPosition]=useState(0);
  const [notice,setNotice]=useState("");
  const [rate,setRate]=useState(1);
  const utterance=useRef<SpeechSynthesisUtterance|null>(null);
  const finishRef=useRef(()=>{});
  finishRef.current=()=>update({listened:[...new Set([...progress.listened,chapters[index].id])]});
  const stop=()=>{
    if(typeof window!=="undefined"&&"speechSynthesis" in window){
      if(utterance.current){utterance.current.onend=null;utterance.current.onerror=null}
      window.speechSynthesis.cancel();
    }
    utterance.current=null;setStatus("idle");
  };
  useEffect(()=>{if(!active)stop();return()=>{if(typeof window!=="undefined"&&"speechSynthesis" in window)window.speechSynthesis.cancel()}},[active]);
  const play=()=>{
    if(!("speechSynthesis" in window)){setNotice("当前浏览器不支持语音朗读。可以阅读下方完整内容。");return}
    if(status==="playing"){window.speechSynthesis.pause();setStatus("paused");return}
    if(status==="paused"){window.speechSynthesis.resume();setStatus("playing");return}
    window.speechSynthesis.cancel();setNotice("");setPosition(0);
    const speech=new SpeechSynthesisUtterance(chapters[index].text);speech.lang="zh-CN";speech.rate=rate;
    const voice=window.speechSynthesis.getVoices().find(item=>item.lang.startsWith("zh"));if(voice)speech.voice=voice;
    speech.onboundary=event=>setPosition(Math.min(100,event.charIndex/chapters[index].text.length*100));
    speech.onend=()=>{setStatus("idle");setPosition(100);finishRef.current()};
    speech.onerror=()=>{setStatus("idle");setNotice("设备语音暂不可用；请阅读文字，或换用支持中文语音的浏览器。")};
    utterance.current=speech;setStatus("playing");window.speechSynthesis.speak(speech);
  };
  return <div className="listen-v3">
    <div className="podcast-feature">
      <div className={`podcast-art art-${scenic.kind}`} style={scenic.image?{backgroundImage:`linear-gradient(0deg,rgba(13,45,33,.9),rgba(13,45,33,.04)),url(${scenic.image})`}:undefined}>
        <span className="pill light">景区故事</span>
        <div><small>黔小探 · 山水故事</small><h2>{scenic.name}<br/>藏在风景里的故事</h2><p>让每一次看见，都多一点理解。</p></div>
      </div>
      <div className="audio-player">
        <span className="section-kicker">听一听 · 第 {String(index+1).padStart(2,"0")} 章</span>
        <h3>{chapters[index].title}</h3>
        <button className="podcast-xiaozhi" onClick={onGuide}><XiaozhiArt/><span>小探陪你听 · 中文讲解<small>想多问一句？点击和小探聊聊 ↗</small></span></button>
        <div className={`sound-wave ${status==="playing"?"playing":""}`}>{Array.from({length:40},(_,i)=><i key={i} style={{height:16+(i*17)%46}}/>)}</div>
        <div className="audio-track"><span style={{width:`${position}%`}}/></div>
        <div className="audio-controls">
          <button onClick={()=>{stop();setPosition(0)}}>重新开始</button>
          <button className="round-play" onClick={play} aria-label={status==="playing"?"暂停朗读":status==="paused"?"继续朗读":"开始朗读"}>{status==="playing"?"Ⅱ":"▶"}</button>
          <select aria-label="朗读速度" value={rate} onChange={event=>{stop();setRate(Number(event.target.value));setPosition(0)}}><option value={.85}>0.85×</option><option value={1}>1.0×</option><option value={1.15}>1.15×</option></select>
        </div>
        {notice&&<p className="inline-notice" role="status">{notice}</p>}
        <div className="chapter-list">{chapters.map((chapter,i)=><button key={chapter.id} className={index===i?"active":""} onClick={()=>{stop();setIndex(i);setPosition(0)}}><i>{String(i+1).padStart(2,"0")}</i><span><strong>{chapter.title}</strong><small>{progress.listened.includes(chapter.id)?"已完成听读":"可朗读 / 可阅读"}</small></span><em>{index===i?"当前章节":"→"}</em></button>)}</div>
      </div>
    </div>
    <div className="transcript"><div><span className="section-kicker">本章文字稿</span><h3>{chapters[index].title}</h3></div><p>{chapters[index].text}</p><button className="text-button" onClick={()=>finishRef.current()}>{progress.listened.includes(chapters[index].id)?"本章已完成 ✓":"我已阅读本章 →"}</button></div>
  </div>;
}

export function PlayPanel({scenic,progress,update,onGuide}:PanelProps&{onGuide:()=>void}){
  const quests=tasksFor(scenic);
  const [drafts,setDrafts]=useState<Record<string,string>>({...progress.tasks});
  const [editing,setEditing]=useState<string[]>([]);
  const [hint,setHint]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const submit=(event:FormEvent,id:string)=>{
    event.preventDefault();const text=(drafts[id]??"").trim();
    if(text.length<2){setMessage("再写一点：至少记录两个字的真实发现。");return}
    update({tasks:{...progress.tasks,[id]:text}});setEditing(current=>current.filter(item=>item!==id));setMessage("观察已经记录下来，继续寻找下一条线索吧。");
  };
  return <div className="play-v3">
    <div className="task-intro"><button className="task-xiaozhi" onClick={onGuide} aria-label="问问小探"><XiaozhiArt pose="point"/></button><div><span className="section-kicker">小探为你准备的观察任务</span><h2>你来观察，留下自己的答案。</h2><p>3 个亲子任务 · 不需要离开安全游览区</p></div><span className="pill">{Object.keys(progress.tasks).length} / 3 已作答</span></div>
    <div className="answerable-tasks">{quests.map((quest,index)=>{
      const saved=!!progress.tasks[quest.id]&&!editing.includes(quest.id);
      return <form key={quest.id} onSubmit={event=>submit(event,quest.id)} className={saved?"task-form saved":"task-form"}>
        <div className="task-form-head"><i>{saved?"✓":String(index+1).padStart(2,"0")}</i><div><small>{quest.label}</small><h3>{quest.title}</h3></div><span>{saved?"已记录":"待作答"}</span></div>
        <p>{quest.prompt}</p><label><span className="sr-only">{quest.title}的观察答案</span><textarea value={drafts[quest.id]??""} readOnly={saved} minLength={2} maxLength={500} required placeholder="写下你们看到、听到或想到的……" onChange={event=>setDrafts(current=>({...current,[quest.id]:event.target.value}))}/></label>
        {hint===quest.id&&<p className="task-hint">提示：{quest.hint}</p>}
        <footer><button type="button" className="text-button" onClick={()=>setHint(hint===quest.id?null:quest.id)}>{hint===quest.id?"收起提示":"给我一点提示"}</button>{saved?<button type="button" className="small-button" onClick={()=>setEditing(current=>[...current,quest.id])}>修改答案</button>:<button type="submit" className="small-button primary">提交作答 →</button>}</footer>
      </form>})}</div>
    <p className="local-note" role="status">{message||"开放观察题没有唯一答案。完成作答后，去“趣味挑战”巩固发现。"}</p>
  </div>;
}

export function PracticePanel({scenic,progress,update}:PanelProps){
  const questions=questionsFor(scenic);
  const [selected,setSelected]=useState<number|null>(null);
  const [review,setReview]=useState<number|null>(null);
  const index=review??progress.answers.length;
  const question=questions[index];
  const correct=questions.map(item=>item.correct);
  const singleCount=questions.filter(item=>item.type==="single").length;
  const booleanCount=questions.length-singleCount;
  const submit=()=>{if(selected===null||!question)return;const answers=[...progress.answers,selected];setReview(index);update({answers,quizCompleted:answers.length===questions.length})};
  const restart=()=>{setReview(null);setSelected(null);update({answers:[],quizCompleted:false,completedAt:undefined})};
  return <div className="practice-layout">
    <aside><span>练一练 · 景区知识挑战</span><h2>把刚才的发现，<br/>变成记得住的知识。</h2><p>{questions.length} 道趣味题，每次提交后都可以看到答案解析。</p><div className="quiz-map">{questions.map((item,i)=><i key={item.id} className={i<progress.answers.length?"done":i===index?"active":""}>{i<progress.answers.length?"✓":i+1}</i>)}</div><div className="quiz-kind-key"><span>选择题 {singleCount} 道</span><span>判断题 {booleanCount} 道</span></div></aside>
    {!question?<div className="practice-result"><div className="score-ring"><b>{score(progress.answers,correct)}</b><small>分</small></div><span>本次挑战已完成</span><h2>{score(progress.answers,correct)>=80?"你们的观察有了收获。":"每一次试错，也是一种发现。"}</h2><p>答对 {progress.answers.filter((answer,i)=>answer===correct[i]).length} / {questions.length} 题 · 成绩已记录</p><div className="result-button-row"><a className="primary-button compact" href="/my-journey">查看我的探索 →</a><button className="text-button" onClick={restart}>再挑战一次</button></div><small>完成听读与 3 个任务后，即可点亮本景区徽章。</small></div>:
      <div className="quiz-card quiz-card-new"><div className="quiz-top"><span className="pill">{question.type==="boolean"?"判断题":"选择题"}</span><b>{index+1} / {questions.length}</b></div><h3>{question.prompt}</h3><div className={`answer-list ${question.type==="boolean"?"boolean-answers":""}`}>{question.options.map((option,i)=>{const choice=review!==null?progress.answers[index]:selected;return <button key={option} disabled={review!==null} onClick={()=>setSelected(i)} className={`${choice===i?"selected":""} ${review!==null&&i===question.correct?"right-answer":""}`}><i>{question.type==="boolean"?(i===0?"✓":"×"):["一","二","三","四"][i]}</i>{option}<span>{choice===i?"●":""}</span></button>})}</div>{review!==null&&<div role="status" className={`answer-note ${progress.answers[index]===question.correct?"correct":"wrong"}`}><b>{progress.answers[index]===question.correct?"回答正确":"这次答错了，看看线索"}</b><p>{question.explanation}</p></div>}{review===null?<button className="primary-button compact" disabled={selected===null} onClick={submit}>提交答案 →</button>:<button className="primary-button compact" onClick={()=>{setReview(null);setSelected(null)}}>{index+1===questions.length?"查看成绩":"下一题"} →</button>}</div>}
  </div>;
}
