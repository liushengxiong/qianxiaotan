import assert from "node:assert/strict";
import test from "node:test";
const {default:worker}=await import("../dist/server/index.js");
async function render(path){
  const response=await worker.fetch(new Request("http://localhost"+path,{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
  return {status:response.status,html:await response.text()};
}
test("root uses the project's existing trusted social preview",async()=>{
  const {status,html}=await render("/");assert.equal(status,200);assert.match(html,/<title>黔小探｜贵州亲子探索<\/title>/);assert.match(html,/https:\/\/qianxing-youzhi\.lolmes\.chatgpt\.site\/og\.png/);assert.doesNotMatch(html,/Your site is taking shape/);
});
test("Huangguoshu detail metadata comes from its scenic record",async()=>{
  const {status,html}=await render("/scenic/huangguoshu");assert.equal(status,200);assert.match(html,/<title>黄果树瀑布探索｜黔小探<\/title>/);assert.match(html,/property="og:description" content="听水声、看水雾/);assert.match(html,/property="og:image" content="https:\/\/p7\.itc\.cn/);assert.match(html,/name="twitter:image" content="https:\/\/p7\.itc\.cn/);
});
test("image-less scenic clears inherited social images",async()=>{
  const {status,html}=await render("/scenic/longgong");assert.equal(status,200);assert.match(html,/<title>龙宫探索｜黔小探<\/title>/);assert.doesNotMatch(html,/<meta[^>]+(?:property="og:image"|name="twitter:image")/);assert.match(html,/从洞口的光线与水面倒影/);
});
test("explore and profile routes render, unknown scenic returns 404",async()=>{
  for(const path of ["/explore?city=guiyang","/explore?city=anshun","/my-journey","/assistant","/scenic/huangguoshu?mode=listen","/scenic/huangguoshu?mode=create","/scenic/huangguoshu?mode=quiz","/scenic/huangguoshu?mode=journal"]){const page=await render(path);assert.equal(page.status,200);assert.match(page.html,/class="mapp [^"]*"/);assert.doesNotMatch(page.html,/class="site-header"/);assert.doesNotMatch(page.html,/黔行有知|小知/)}
  assert.equal((await render("/scenic/not-a-real-place")).status,404);
});
