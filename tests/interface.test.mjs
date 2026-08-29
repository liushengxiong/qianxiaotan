import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import ts from "typescript";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {CITIES,cityScenics,getScenic} from "../app/lib/catalog.ts";
import {EMPTY_STATE} from "../app/lib/mobile.ts";

// Render the real components without a browser, network requests or user-data writes.
const require=createRequire(import.meta.url);
const cache=new Map();
function component(file){
  const filename=path.resolve(file);
  if(cache.has(filename))return cache.get(filename).exports;
  const module={exports:{}};cache.set(filename,module);
  const {outputText}=ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
  const resolve=id=>{
    if(!id.startsWith("."))return require(id);
    const base=path.resolve(path.dirname(filename),id);
    const found=[base,base+".ts",base+".tsx"].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
    if(!found)throw new Error("Missing component dependency: "+id);
    return component(found);
  };
  new Function("require","module","exports",outputText)(resolve,module,module.exports);
  return module.exports;
}
const {MobileHome}=component("app/components/mobile-home.tsx");
const {MobileProfileView}=component("app/components/mobile-profile.tsx");
const {ScenicOverview}=component("app/components/scenic-overview.tsx");
const {MobileOnboarding}=component("app/components/mobile-onboarding.tsx");
const {DigitalGuide}=component("app/components/digital-guide.tsx");
const render=(type,props)=>renderToStaticMarkup(React.createElement(type,props));
const text=html=>html.replace(/<[^>]*>/g,"").replace(/&[a-z]+;/g,"");

test("every city opens a map with direct links to all of its scenic details",()=>{
  for(const city of CITIES){
    const html=render(MobileHome,{city:city.id,data:EMPTY_STATE,onGuide(){}});
    assert.match(html,new RegExp(city.name+"景区探索地图"));
    for(const scenic of cityScenics(city.id))assert.ok(html.includes('href="/scenic/'+scenic.id+'"'));
    assert.doesNotMatch(text(html),/[A-Za-z]|黔行有知|小知/);
  }
});
test("map progress and detail present the new in-product article overview",()=>{
  const scenic=getScenic("huangguoshu");
  const visit={scenic_id:scenic.id,listened:["story"],checked_at:"2026-08-28",quiz_score:0,answers:[0,0,0,0,0],journal_at:"2026-08-28",updated_at:"2026-08-28"};
  const media=[{id:"saved-card",scenic_id:scenic.id,kind:"postcard"}];
  const home=render(MobileHome,{city:"anshun",data:{...EMPTY_STATE,visits:[visit],media},onGuide(){}});
  assert.match(home,/已探索 100%/);
  const detail=render(ScenicOverview,{scenic,onGuide(){}});
  for(const label of ["景区介绍","一分钟认识这一站","小探知识库","阅读全文"])assert.ok(detail.includes(label));
  for(const removed of ["待人工复核","主来源","采集流程","target=\"_blank\""])assert.ok(!detail.includes(removed));
  assert.doesNotMatch(detail,/发现清单|旅行明信片/);
});
test("passport begins with nine stamps and exposes all 65 scenic entries",()=>{
  const html=render(MobileProfileView,{data:EMPTY_STATE,city:"anshun"});
  assert.equal((html.match(/尚未盖章/g)||[]).length,9);
  assert.match(text(html),/已收录 65 处景区/);
  assert.match(text(html),/第 1 页，共 8 页/);
  assert.match(html,/aria-label="上一页印章"[^>]*disabled|disabled=""[^>]*aria-label="上一页印章"/);
  for(const label of ["贵州印章","趣味成绩","电子相册"])assert.ok(html.includes(label));
  for(const removed of ["旅行作品","探索足迹"])assert.ok(!html.includes(removed));
});
test("onboarding and digital guide use the renamed Chinese identity",()=>{
  const onboarding=render(MobileOnboarding,{initial:null,busy:false,onComplete:async()=>true});
  const guide=render(DigitalGuide,{open:true,scenic:getScenic("huangguoshu"),onClose(){}});
  assert.match(onboarding,/黔小探/);assert.match(guide,/我是小探/);
  assert.match(fs.readFileSync("app/components/mobile-onboarding.tsx","utf8"),/请选择你的身份/);
  assert.match(guide,/小探会结合当前景区内容回答/);
  assert.doesNotMatch(guide,/互动演示|未接入实时智能服务|二维形象动效/);
  assert.doesNotMatch(text(onboarding+guide),/[A-Za-z]|黔行有知|小知/);
});
test("interface literals contain no decorative English or former brand names",()=>{
  const failures=[];
  function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue}if(!file.endsWith(".tsx"))continue;
    const source=fs.readFileSync(file,"utf8");assert.doesNotMatch(source,/黔行有知|小知/,file);
    const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(node){
      if(ts.isJsxText(node)&&/[a-z]/i.test(node.text))failures.push(file+": "+node.text.trim());
      if(ts.isJsxAttribute(node)&&/^(alt|title|placeholder|aria-label)$/.test(node.name.text)&&node.initializer&&ts.isStringLiteral(node.initializer)&&/[a-z]/i.test(node.initializer.text))failures.push(file+": "+node.initializer.text);
      ts.forEachChild(node,visit);
    }visit(tree);
  }}walk("app");assert.deepEqual(failures,[]);
});

test("public component copy contains no internal editorial workflow labels",()=>{
  const source=fs.readdirSync("app/components").filter(file=>file.endsWith(".tsx")).map(file=>fs.readFileSync(path.join("app/components",file),"utf8")).join("\n");
  assert.doesNotMatch(source,/待人工复核|示例脚本|预置知识演示|未接入实时智能服务|资料来源与智能采集流程|互动演示/);
});
