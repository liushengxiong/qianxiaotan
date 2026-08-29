import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { GUIDE_PHASES, guideGreeting, guideSuggestions, guideAnswer, speechErrorMessage } from "../app/lib/guide.ts";
import { SCENICS, getScenic, answerFromDemo } from "../app/lib/catalog.ts";

test("Xiaozhi retains the supplied identity and discloses the demo provider", () => {
  const reply = guideAnswer(getScenic("huangguoshu"), "小探，介绍一下自己", answerFromDemo);
  assert.match(reply, /我是小探/);
  assert.match(reply, /贵州少年探索向导/);
  assert.match(reply, /没有连接实时智能问答/);
});

test("greetings and suggestions follow every destination's scenic context", () => {
  for (const scenic of SCENICS) {
    assert.ok(guideGreeting(scenic).includes(scenic.name));
    assert.ok(guideSuggestions(scenic).some(text => text.includes(scenic.name)));
    assert.equal(guideSuggestions(scenic).length, 4);
  }
});

test("answers keep scenic context without inventing uncovered facts", () => {
  const scenic = getScenic("qingyan");
  assert.match(guideAnswer(scenic, "你在哪里", answerFromDemo), /贵阳/);
  assert.match(guideAnswer(scenic, "第七任镇长出生于哪一天", answerFromDemo), /没有|未|暂|示例/);
  assert.match(guideAnswer(scenic, "谢谢", answerFromDemo), /不客气/);
});

test("all avatar phases have an honest label and human-readable hint", () => {
  assert.deepEqual(Object.keys(GUIDE_PHASES), ["idle", "requesting", "listening", "thinking", "preparing", "speaking"]);
  for (const state of Object.values(GUIDE_PHASES)) {
    assert.ok(state.label.length > 1); assert.ok(state.hint.length > 1);
  }
  assert.match(GUIDE_PHASES.thinking.hint, /示例/);
  assert.match(GUIDE_PHASES.requesting.hint, /允许/);
});

test("denied, offline and unavailable speech always offer a text fallback", () => {
  for (const code of ["not-allowed", "service-not-allowed", "audio-capture", "network", "no-speech", "language-not-supported", "unknown"]) {
    assert.match(speechErrorMessage(code), /文字|打字/);
  }
});

test("original character sheet is local and unchanged", async () => {
  const bytes = await readFile(new URL("../public/characters/xiaozhi-reference.png", import.meta.url));
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  assert.equal(bytes.readUInt32BE(16), 1230);
  assert.equal(bytes.readUInt32BE(20), 1278);
  assert.ok(bytes.length > 100000);
});
