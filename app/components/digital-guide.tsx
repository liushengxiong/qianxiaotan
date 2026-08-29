"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Scenic } from "../lib/catalog";
import { answerFromDemo, chaptersFor, tasksFor } from "../lib/catalog";
import { GUIDE_PHASES, guideGreeting, guideSuggestions, guideAnswer, speechErrorMessage } from "../lib/guide";
import type { GuideMessage, GuidePhase, RecognitionHandle, SpeechWindow } from "../lib/guide";
import { XiaozhiArt } from "./xiaozhi-art";

type Props = { open: boolean; scenic: Scenic; onClose: () => void };

export function DigitalGuide({ open, scenic, onClose }: Props) {
  const [phase, setPhase] = useState<GuidePhase>("idle");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [caption, setCaption] = useState(() => guideGreeting(scenic));
  const [notice, setNotice] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [supported, setSupported] = useState({ recognition: false, synthesis: false });
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [spokenIndex, setSpokenIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const panel = useRef<HTMLElement>(null);
  const historyEnd = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const recognition = useRef<RecognitionHandle | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0);
  const nextId = useRef(0);

  const stop = useCallback(() => {
    sequence.current += 1;
    if (pending.current) clearTimeout(pending.current);
    if (watchdog.current) clearTimeout(watchdog.current);
    pending.current = null; watchdog.current = null;
    const rec = recognition.current;
    recognition.current = null;
    if (rec) { rec.onresult = null; rec.onstart = null; rec.onend = null; rec.onerror = null; try { rec.abort(); } catch {} }
    const speech = utterance.current;
    utterance.current = null;
    if (speech) {
      speech.onstart = null; speech.onend = null; speech.onerror = null; speech.onboundary = null;
      window.speechSynthesis?.cancel();
    }
  }, []);

  const interrupt = () => { stop(); setPhase("idle"); setSpokenIndex(0); };

  useEffect(() => {
    const win = window as SpeechWindow;
    setSupported({ recognition: !!(win.SpeechRecognition || win.webkitSpeechRecognition), synthesis: "speechSynthesis" in window });
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("zh")));
    if ("speechSynthesis" in window) { updateVoices(); window.speechSynthesis.addEventListener("voiceschanged", updateVoices); }
    return () => { stop(); window.speechSynthesis?.removeEventListener("voiceschanged", updateVoices); };
  }, [stop]);

  useEffect(() => {
    stop(); setPhase("idle"); setInput(""); setMessages([]); setCaption(guideGreeting(scenic)); setNotice(""); setSpokenIndex(0); setShowHistory(false);
  }, [scenic.id, stop]);

  useEffect(() => {
    if (!open) { stop(); setPhase("idle"); setShowConsent(false); return; }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,a[href]') || []).filter(el => el.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const visibility = () => { if (document.hidden) { stop(); setPhase("idle"); } };
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", visibility);
    return () => { stop(); document.body.style.overflow = overflow; document.removeEventListener("keydown", keyboard); document.removeEventListener("visibilitychange", visibility); previous?.focus(); };
  }, [open, stop]);

  useEffect(() => { if (showHistory) historyEnd.current?.scrollIntoView({ block: "nearest" }); }, [messages, showHistory]);

  function speak(text: string) {
    stop(); setCaption(text); setSpokenIndex(0);
    if (!voiceEnabled || !supported.synthesis) {
      setPhase("idle");
      if (!supported.synthesis) setNotice("当前浏览器不支持朗读，完整回答已显示为文字。");
      return;
    }
    const token = sequence.current;
    const speech = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === voiceName) || voices[0];
    if (voice) speech.voice = voice;
    speech.lang = "zh-CN"; speech.rate = .95; speech.pitch = 1.08;
    speech.onstart = () => { if (token !== sequence.current) return; if (watchdog.current) clearTimeout(watchdog.current); setPhase("speaking"); };
    speech.onboundary = event => { if (token === sequence.current) setSpokenIndex(event.charIndex); };
    speech.onend = () => { if (token !== sequence.current) return; if (watchdog.current) clearTimeout(watchdog.current); utterance.current = null; setSpokenIndex(text.length); setPhase("idle"); };
    speech.onerror = () => { if (token !== sequence.current) return; if (watchdog.current) clearTimeout(watchdog.current); utterance.current = null; setPhase("idle"); setNotice("设备语音未能播放。可以点击重播，或直接阅读文字。"); };
    utterance.current = speech;
    setPhase("preparing");
    watchdog.current = setTimeout(() => { if (token !== sequence.current) return; interrupt(); setNotice("设备语音没有响应。请尝试重播，或使用文字模式。"); }, 7000);
    try { window.speechSynthesis.speak(speech); } catch { interrupt(); setNotice("设备语音暂不可用，已保留文字回答。"); }
  }

  function answer(question: string) {
    if (/故事|讲解|介绍.*景区/.test(question)) return chaptersFor(scenic)[0].text;
    if (/任务|观察/.test(question)) return `小探给你一个观察任务：${tasksFor(scenic)[0].prompt} 记得和家人一起，并留在允许停留的区域。`;
    return guideAnswer(scenic, question, answerFromDemo);
  }

  function ask(question: string) {
    const text = question.trim().slice(0, 300);
    if (!text) return;
    stop(); setNotice(""); setInput(""); setPhase("thinking");
    setMessages(current => [...current, { id: ++nextId.current, role: "user", text }]);
    const token = sequence.current;
    pending.current = setTimeout(() => {
      if (token !== sequence.current) return;
      const reply = answer(text);
      setMessages(current => [...current, { id: ++nextId.current, role: "assistant", text: reply }]);
      speak(reply);
    }, 450);
  }

  function startListening() {
    if (!supported.recognition) { setNotice("当前浏览器不支持语音识别。请在下方打字，仍可听小探朗读回答。"); return; }
    if (!voiceConsent) { setShowConsent(true); return; }
    stop(); setNotice(""); setShowConsent(false);
    const token = sequence.current;
    const Constructor = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) return;
    const rec = new Constructor();
    recognition.current = rec;
    rec.lang = "zh-CN"; rec.interimResults = true; rec.continuous = false;
    let heard = "";
    rec.onstart = () => { if (token === sequence.current) setPhase("listening"); };
    rec.onresult = event => {
      if (token !== sequence.current) return;
      heard = Array.from(event.results).map(result => result[0].transcript).join("").slice(0, 300);
      setInput(heard);
    };
    rec.onerror = event => {
      if (token !== sequence.current) return;
      stop(); setPhase("idle"); setNotice(speechErrorMessage(event.error));
    };
    rec.onend = () => {
      if (token !== sequence.current) return;
      recognition.current = null; if (watchdog.current) clearTimeout(watchdog.current);
      setPhase("idle"); setNotice(heard ? "已听到你的问题，可以修改后点击发送。" : "没有识别到内容，请再试一次或直接打字。");
    };
    setPhase("requesting");
    watchdog.current = setTimeout(() => { if (token === sequence.current) { interrupt(); setNotice("语音等待已结束。可以重试或使用文字输入。"); } }, 30000);
    try { rec.start(); } catch { interrupt(); setNotice("麦克风未能启动，请使用文字输入。"); }
  }

  if (!open) return null;
  const state = GUIDE_PHASES[phase];
  const busy = phase !== "idle";
  const recording = phase === "listening" || phase === "requesting";
  return <>
    <div className="guide-backdrop" onClick={onClose} />
    <aside ref={panel} className="digital-guide" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <header className="guide-header"><div><XiaozhiArt className="guide-header-avatar" /><span><h2 id="guide-title">小探 <i>贵州少年探索向导</i></h2><small>好奇 · 爱观察 · 爱提问 · 爱旅行</small></span></div><button onClick={onClose} className="guide-close" aria-label="关闭小探数字人对话">×</button></header>
      <div className="guide-scroll">
        <div className="guide-context"><span>本次一起探索</span><strong>⌖ {scenic.name}</strong><span className="guide-demo-label">互动演示</span></div>
        <section className={`guide-stage phase-${phase}`} aria-label="小探数字人形象">
          <div className="guide-stage-copy"><span>你的贵州探索伙伴</span><h3>你问为什么，<br/>我们一起找答案。</h3><p>我是小探，<br/>准备好陪你出发了。</p><div className="guide-state" role="status"><i />{state.label}</div></div>
          <div className="guide-character"><XiaozhiArt pose="hero" label="戴着探险帽、背着背包、手拿地图的小探" /><span className="guide-expression"><XiaozhiArt pose={phase === "thinking" ? "thinking" : phase === "speaking" ? "happy" : "face"} /></span></div>
          <div className="guide-stage-floor" />
          <div className="guide-stage-note">二维形象动效 · 非实时口型</div>
        </section>
        <div className="guide-subtitle" aria-live="polite"><div><span>小探说</span><button onClick={() => speak(caption)} disabled={!voiceEnabled || !supported.synthesis}>{phase === "speaking" ? "重新讲一遍" : "听小探说"} <i>▷</i></button></div><p><mark>{phase === "speaking" ? caption.slice(0, spokenIndex) : ""}</mark>{phase === "speaking" ? caption.slice(spokenIndex) : caption}</p></div>
        <div className="guide-playback"><span className={`guide-meter ${phase === "speaking" || recording ? "moving" : ""}`} aria-hidden="true">{[0,1,2,3,4].map(i => <i key={i} style={{ animationDelay: `${i * .13}s` }} />)}</span><span>{state.hint}</span>{busy && <button onClick={interrupt}>■ {recording ? "取消录音" : "打断小探"}</button>}</div>
        <div className="guide-suggestions"><span>不知道从哪问起？</span><div>{guideSuggestions(scenic).map((q, i) => <button key={q} onClick={() => ask(q)}><i>{["01","02","03","04"][i]}</i>{q}<b>↗</b></button>)}</div></div>
        <div className="guide-history"><button aria-expanded={showHistory} onClick={() => setShowHistory(v => !v)}><span>本次对话 <small>{messages.length ? `${messages.length} 条` : "还没有提问"}</small></span>{showHistory ? "收起 −" : "展开 +"}</button>{showHistory && <div className="guide-message-list" role="log" aria-label="与小探的对话记录">{messages.length ? messages.map(message => <div key={message.id} className={`guide-message ${message.role}`}><small>{message.role === "assistant" ? "小探" : "你"}</small><p>{message.text}</p>{message.role === "assistant" && <button onClick={() => speak(message.text)} disabled={!voiceEnabled || !supported.synthesis}>朗读 ▷</button>}</div>) : <p className="guide-empty-history">从一个小问题开始，留下我们共同的发现。</p>}<div ref={historyEnd} /></div>}</div>
      </div>
      <footer className="guide-composer">
        {notice && <p className="guide-notice" role="status">{notice}</p>}
        {showConsent && <div className="guide-consent"><strong>开启语音输入</strong><p>浏览器可能将音频发送到其语音识别服务。本站不保存录音。请家长确认后开启，不要说出隐私信息。</p><button onClick={() => { setVoiceConsent(true); setShowConsent(false); setNotice("已确认。请再次点击“语音输入”开始说话。"); }}>同意，启用语音</button><button onClick={() => setShowConsent(false)}>继续打字</button></div>}
        <form onSubmit={event => { event.preventDefault(); ask(input); }}><label className="sr-only" htmlFor="guide-question">向小探提问</label><input id="guide-question" value={input} onChange={event => setInput(event.target.value)} maxLength={300} placeholder={recording ? "正在听，识别文字会显示在这里…" : "小探，我想知道……"} /><button type="submit" disabled={!input.trim()} aria-label="发送问题给小探">↑</button></form>
        <div className="guide-controls"><button className={recording ? "recording" : ""} onClick={() => { if (recording) { try { recognition.current?.stop(); } catch { interrupt(); } } else startListening(); }}><span aria-hidden="true">◉</span>{recording ? "结束录音" : "语音输入"}</button><button aria-pressed={voiceEnabled} onClick={() => { if (voiceEnabled) interrupt(); setVoiceEnabled(!voiceEnabled); }}>{voiceEnabled ? "声音开启" : "仅文字"}</button><select aria-label="小探朗读音色" value={voiceName} onChange={event => { interrupt(); setVoiceName(event.target.value); }} disabled={!supported.synthesis}><option value="">设备中文音色</option>{voices.map((v, index) => <option key={v.voiceURI} value={v.name}>中文音色 {index + 1}</option>)}</select></div>
        <p className="guide-disclosure">预置知识演示，未接入实时智能服务 · 语音需浏览器支持 · 对话仅保留在本页</p>
      </footer>
    </aside>
  </>;
}

export function GuideInvitation({ scenic, onOpen }: { scenic: Scenic; onOpen: () => void }) {
  return <section className="guide-invitation"><div className="guide-invitation-art"><XiaozhiArt pose="point" /></div><div><span className="section-kicker">认识你的探索伙伴</span><h2>你好呀，我是小探。</h2><p>关于{scenic.name}的每一个“为什么”，<br />都可以和我一起找线索。</p><button className="primary-button compact" onClick={onOpen}>和小探面对面聊聊 <span>→</span></button><small>形象互动 · 文字对话 · 设备语音</small></div></section>;
}
