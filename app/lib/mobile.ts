export type TravelPhase = "before" | "during" | "after";
export type MobileProfile = { nickname:string; role:"父亲"|"母亲"|"其他"; city:string };
export type MobileVisit = { scenic_id:string; listened:string[]; checked_at:string|null; journal_at:string|null; answers:number[]; quiz_score:number|null; updated_at:string };
export type MobileMedia = {id:string;scenic_id:string;kind:"photo"|"postcard";style:string;created_at:string};
export type MobileState = {profile:MobileProfile|null;visits:MobileVisit[];media:MobileMedia[]};
export const EMPTY_STATE:MobileState={profile:null,visits:[],media:[]};
export const PHASES:{id:TravelPhase;name:string;subtitle:string}[]=[
  {id:"before",name:"旅行前",subtitle:"让好奇，先出发"},
  {id:"during",name:"旅行中",subtitle:"把风景变成发现"},
  {id:"after",name:"旅行后",subtitle:"让回忆继续生长"},
];
export const PHOTO_STYLES=[
  {id:"natural",name:"自然纪实",color:"#6b8c5c",filter:"none"},
  {id:"film",name:"复古胶片",color:"#bc9672",filter:"sepia(.32) saturate(.8) contrast(1.05)"},
  {id:"forest",name:"森系手账",color:"#789b89",filter:"saturate(.7) hue-rotate(12deg) contrast(.95)"},
  {id:"mono",name:"黑白印记",color:"#899187",filter:"grayscale(1) contrast(1.13)"},
] as const;
export function travelProgress(visit:MobileVisit|undefined,media:MobileMedia[]=[]){
  void media;
  return [!!visit?.listened.length,!!visit?.checked_at,visit?.quiz_score!=null,!!visit?.journal_at].filter(Boolean).length;
}
export function validatePhoto(file:{type:string;size:number}){
  if(!["image/jpeg","image/png","image/webp"].includes(file.type))return "请选择普通照片或截图；手机高效格式请先转成兼容格式。";
  if(file.size>8*1024*1024)return "这张照片超过 8 兆字节，请压缩后重试。";
  if(file.size===0)return "照片为空，请重新选择。";
  return null;
}
export function personalLeaderboard(visits:MobileVisit[]){
  return visits.filter(v=>v.quiz_score!==null).slice().sort((a,b)=>(b.quiz_score||0)-(a.quiz_score||0)||b.updated_at.localeCompare(a.updated_at));
}
