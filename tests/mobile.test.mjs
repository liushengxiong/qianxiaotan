import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {travelProgress,validatePhoto,personalLeaderboard} from "../app/lib/mobile.ts";
import {NOTION_TOPICS,topicsForScenic} from "../app/lib/notion-content.ts";
import {getScenic} from "../app/lib/catalog.ts";

test("demo progress is memory-only and covers the remaining four activities",()=>{
  const visit={scenic_id:"huangguoshu",listened:["story"],checked_at:"2026-08-29",journal_at:null,answers:[],quiz_score:null,updated_at:"2026-08-29"};
  assert.equal(travelProgress(),0);assert.equal(travelProgress(visit),2);
  assert.equal(travelProgress({...visit,quiz_score:0,journal_at:"2026-08-29"}),4);
  assert.equal(personalLeaderboard([{...visit,quiz_score:80}])[0].quiz_score,80);
});
test("local album validates photos without any mobile persistence calls",()=>{
  assert.equal(validatePhoto({type:"image/png",size:100}),null);
  for(const file of [{type:"image/svg+xml",size:100},{type:"image/heic",size:100},{type:"image/png",size:0},{type:"image/jpeg",size:9*1024*1024}])assert.ok(validatePhoto(file));
  for(const file of ["app/components/mobile-shell.tsx","app/components/mobile-journal.tsx"])assert.doesNotMatch(fs.readFileSync(file,"utf8"),/\/api\/mobile|localStorage|sessionStorage/);
  const worker=fs.readFileSync("worker/index.ts","utf8");assert.match(worker,/status:410/);
});
test("all Notion content rows are bundled and scenic-aware",()=>{
  assert.equal(NOTION_TOPICS.length,90);assert.equal(new Set(NOTION_TOPICS.map(item=>item.region)).size,9);
  const waterfall=topicsForScenic(getScenic("huangguoshu"));assert.equal(waterfall.length,4);assert.ok(waterfall.some(item=>item.title.includes("黄果树")||item.title.includes("白水河")));
  for(const item of NOTION_TOPICS){assert.ok(item.title);assert.match(item.source,/^https:\/\//);assert.ok(["低","中","高"].includes(item.risk))}
});
