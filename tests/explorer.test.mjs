import assert from "node:assert/strict";
import test from "node:test";
import { CITIES, SCENICS, cityScenics, getCity, getScenic, chaptersFor, tasksFor, questionsFor, answerFromDemo } from "../app/lib/catalog.ts";
import { emptyProgress, percent, score, project, restoreProgress } from "../app/lib/progress.ts";

test("all nine destinations have unique, separately routable local attractions",()=>{
  assert.equal(CITIES.length,9);assert.equal(new Set(CITIES.map(c=>c.id)).size,9);
  assert.equal(SCENICS.length,65);assert.equal(new Set(SCENICS.map(s=>s.id)).size,65);
  for(const city of CITIES){assert.ok(cityScenics(city.id).length>=7);for(const scenic of cityScenics(city.id)){assert.equal(scenic.cityId,city.id);assert.equal(getScenic(scenic.id),scenic)}}
  assert.equal(cityScenics("anshun").length,9);assert.equal(getCity("invalid").id,"anshun");assert.equal(getScenic("invalid"),undefined);
});
test("each scenic has two article chapters, three answerable tasks and a valid Notion challenge",()=>{
  for(const scenic of SCENICS){assert.deepEqual(chaptersFor(scenic).map(c=>c.id),["story","observe"]);assert.ok(chaptersFor(scenic).every(c=>c.text.length>80));assert.deepEqual(tasksFor(scenic).map(t=>t.id),["look","together","question"]);const questions=questionsFor(scenic);assert.ok(questions.length>=3&&questions.length<=5);for(const q of questions){assert.ok(["single","boolean"].includes(q.type));assert.ok(q.options.length>=2);assert.ok(q.correct>=0&&q.correct<q.options.length);assert.ok(q.explanation)}}
});
test("progress requires learning, submitted observations and a complete quiz",()=>{
  const p=emptyProgress();assert.equal(percent(p),0);p.listened=["story"];assert.equal(percent(p),10);p.listened.push("observe");assert.equal(percent(p),20);p.tasks={look:"水帘很宽",together:"不同角度",question:"水雾来自哪里"};assert.equal(percent(p),70);p.answers=[0,1,0,1,0];p.quizCompleted=true;assert.equal(percent(p),100);assert.equal(score(p.answers,[0,1,0,1,0]),100);assert.equal(score([0,0,0,0,0],[0,1,0,1,0]),60);assert.equal(score([],[]),0);
});
test("stored answers survive refresh without trusting malformed data",()=>{
  const complete={listened:["story","observe"],tasks:{look:"观察水滴",together:"交流发现",question:"水雾来源"},answers:[0,1,0,1,0],quizCompleted:true,completedAt:"2026-08-28T00:00:00Z",updatedAt:"2026-08-28T00:00:00Z"};assert.deepEqual(restoreProgress(complete,[3,3,3,2,2]),complete);
  const corrupt=restoreProgress({listened:["story","story","fake"],tasks:{look:"ok",intruder:"fake"},answers:[0,99,0],quizCompleted:true,completedAt:"fake"},[3,3,3,2,2]);assert.deepEqual(corrupt.listened,["story"]);assert.deepEqual(corrupt.tasks,{look:"ok"});assert.deepEqual(corrupt.answers,[0]);assert.equal(corrupt.quizCompleted,false);assert.equal(corrupt.completedAt,undefined);assert.equal(percent(restoreProgress(null,[3,3,3,2,2])),0);
});
test("map projection preserves geographic east/north ordering",()=>{const origin=project(26,106,10);assert.ok(project(26,107,10).x>origin.x);assert.ok(project(27,106,10).y<origin.y);for(const scenic of SCENICS){const point=project(scenic.lat,scenic.lon,10);assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y))}});
test("demo answers remain scenic-aware and refuse uncovered questions",()=>{const h=getScenic("huangguoshu"),q=getScenic("qingyan");assert.match(answerFromDemo(h,"在哪里"),/安顺/);assert.match(answerFromDemo(q,"在哪里"),/贵阳/);assert.match(answerFromDemo(h,"谁在1492年路过这里"),/未|没有|暂|示例/)});
