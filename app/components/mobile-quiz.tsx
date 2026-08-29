"use client";
import {useState} from "react";
import {questionsFor} from "../lib/catalog";
import type {Scenic} from "../lib/catalog";
import {XiaozhiArt} from "./xiaozhi-art";

export function MobileQuiz({scenic,onComplete}:{scenic:Scenic;onComplete:(answers:number[])=>Promise<boolean>}){
  const questions=questionsFor(scenic);
  const [answers,setAnswers]=useState<number[]>([]);
  const [choice,setChoice]=useState<number|null>(null);
  const [revealed,setRevealed]=useState(false);
  const [finished,setFinished]=useState(false);
  const [busy,setBusy]=useState(false);
  const index=Math.min(answers.length,questions.length-1),question=questions[index];
  const correctCount=answers.filter((answer,i)=>answer===questions[i].correct).length;
  const score=Math.round(correctCount/questions.length*100);
  async function next(){
    const updated=[...answers,choice!];
    if(updated.length===questions.length){setBusy(true);if(await onComplete(updated)){setAnswers(updated);setFinished(true)}setBusy(false)}
    else{setAnswers(updated);setChoice(null);setRevealed(false)}
  }
  if(finished)return <section className="m-quiz-result"><XiaozhiArt pose="happy"/><span>这一站的知识，装进口袋了！</span><h1>{score}<small> 分</small></h1><p>答对 {correctCount} / {questions.length} 题</p><div className="m-knowledge"><h3>我们一起记住了</h3>{questions.map(q=><p key={q.id}>✓ {q.explanation}</p>)}</div><a className="m-primary" href={"/scenic/"+scenic.id+"?mode=journal"}>制作这次旅行的电子相册 →</a><button className="m-link-button" onClick={()=>{setAnswers([]);setChoice(null);setRevealed(false);setFinished(false)}}>再挑战一次</button></section>;
  return <section className="m-quiz"><div className="m-quiz-intro"><XiaozhiArt pose="thinking"/><div><small>旅行后 · 趣味挑战</small><h2>你记住了多少贵州？</h2><p>不用着急，和孩子一起想一想。</p></div></div><div className="m-quiz-progress">{questions.map((q,i)=><i key={q.id} className={i<=index?"active":""}/>)}</div><div className="m-quiz-meta"><span>{question.type==="boolean"?"判断题":"选择题"}</span><span>{index+1} / {questions.length}</span></div><h2>{question.prompt}</h2><div className="m-answers">{question.options.map((option,i)=><button key={option} disabled={revealed} className={(choice===i?"selected ":"")+(revealed&&i===question.correct?"correct ":"")+(revealed&&choice===i&&choice!==question.correct?"wrong":"")} onClick={()=>setChoice(i)}><b>{question.type==="boolean"?(i===0?"✓":"×"):["一","二","三","四"][i]}</b><span>{option}</span></button>)}</div>{revealed&&<div className={"m-answer-feedback "+(choice===question.correct?"correct":"wrong")} role="status"><strong>{choice===question.correct?"答对啦！细心观察真有用。":"没关系，我们一起看看线索。"}</strong><p>{question.explanation}</p></div>}<button className="m-primary" disabled={choice===null||busy} onClick={()=>revealed?void next():setRevealed(true)}>{busy?"正在计算…":!revealed?"确认答案":index===questions.length-1?"看看这次收获 →":"下一题 →"}</button></section>;
}
