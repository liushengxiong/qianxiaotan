import type { Scenic } from "./catalog";

export type GuidePhase = "idle" | "requesting" | "listening" | "thinking" | "preparing" | "speaking";
export type GuideMessage = { id: number; role: "user" | "assistant"; text: string };
export const GUIDE_PHASES: Record<GuidePhase, { label: string; hint: string }> = {
  idle: { label: "等你开口", hint: "好奇，是探索的第一步" },
  requesting: { label: "等待麦克风", hint: "请在浏览器中允许使用麦克风" },
  listening: { label: "小探在听", hint: "说完后点击结束，识别结果可修改" },
  thinking: { label: "整理线索中", hint: "正在查找当前景区的示例内容" },
  preparing: { label: "准备讲述", hint: "正在准备设备语音" },
  speaking: { label: "小探正在讲", hint: "可以随时打断，也可以看文字" },
};

export function guideGreeting(scenic: Scenic) {
  return `你好呀，我是小探，你的贵州少年探索向导！这次我们一起认识${scenic.name}。你想先听个故事，还是接一个观察任务？`;
}

export function guideSuggestions(scenic: Scenic) {
  return ["小探，介绍一下自己", `讲讲${scenic.name}的故事`, "给我一个观察任务", "给孩子讲得简单一点"];
}

export function speechErrorMessage(code: string) {
  const errors: Record<string, string> = {
    "not-allowed": "麦克风权限未开启。可以在浏览器中授权，或直接打字和小探聊。",
    "service-not-allowed": "浏览器没有开放语音识别服务，请使用文字输入。",
    "audio-capture": "没有找到可用的麦克风，请检查设备或改用打字。",
    "network": "语音识别服务暂时无法连接，请改用文字输入。",
    "no-speech": "没有听清这句话。可以再试一次，也可以打字告诉小探。",
    "language-not-supported": "当前设备不支持中文语音识别，请改用文字输入。",
  };
  return errors[code] || "这次语音识别没有完成，请重试或使用文字输入。";
}

// A deliberate, disclosed demo provider, not a remote LLM or live scenic knowledge base.
export function guideAnswer(scenic: Scenic, question: string, fallback: (s: Scenic, q: string) => string) {
  if (/介绍.*自己|你是谁|你的名字|叫什么/.test(question)) {
    return "我是小探，贵州少年探索向导！我爱旅行、爱观察，也爱问为什么。帽子、地图和小挎包是我的探索装备。一起出发吧！目前我使用预置知识回答，还没有连接实时智能问答。";
  }
  if (/你好|嗨|hello/i.test(question)) return `你好呀！我是小探。我们正在探索${scenic.name}，可以问我这里的故事，也可以一起找一个观察线索。`;
  if (/谢谢|再见/.test(question)) return "不客气！带着好奇心继续出发吧。需要帮忙时，再点一下小探，我就在这里。";
  return fallback(scenic, question);
}

export type RecognitionResultEvent = {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
export type RecognitionHandle = {
  lang: string; continuous: boolean; interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
export type SpeechWindow = Window & {
  SpeechRecognition?: new () => RecognitionHandle;
  webkitSpeechRecognition?: new () => RecognitionHandle;
};
