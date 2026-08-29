export type Progress = { listened: string[]; tasks: Record<string,string>; answers: number[]; quizCompleted: boolean; completedAt?: string; updatedAt?:string };
export const emptyProgress = (): Progress => ({listened:[],tasks:{},answers:[],quizCompleted:false});
export function percent(progress: Progress): number {
  return Math.round(Math.min(progress.listened.length/2,1)*20 + Math.min(Object.keys(progress.tasks).length/3,1)*50 + (progress.quizCompleted?30:0));
}
export function score(answers: number[], correct: number[]): number {
  return answers.length===0?0:Math.round(answers.filter((value,index)=>value===correct[index]).length/correct.length*100);
}
export function project(lat:number,lon:number,zoom:number) {
  const size=256*2**zoom, rad=lat*Math.PI/180;
  return {x:(lon+180)/360*size,y:(1-Math.log(Math.tan(rad)+1/Math.cos(rad))/Math.PI)/2*size};
}

// Browser storage is untrusted: retain only known tasks, chapters and option indices.
export function restoreProgress(input:unknown,optionCounts:number[]):Progress {
  if(!input||typeof input!=="object")return emptyProgress();
  const old=input as Record<string,unknown>;
  const answers:number[]=[];
  if(Array.isArray(old.answers))for(let i=0;i<Math.min(old.answers.length,optionCounts.length);i++){
    const value=old.answers[i];if(!Number.isInteger(value)||value<0||value>=optionCounts[i])break;answers.push(value);
  }
  const tasks:Record<string,string>={};
  if(old.tasks&&typeof old.tasks==="object")for(const id of ["look","together","question"]){const value=(old.tasks as Record<string,unknown>)[id];if(typeof value==="string"&&value.trim().length>=2)tasks[id]=value.slice(0,500)}
  const restored:Progress={listened:Array.isArray(old.listened)?[...new Set(old.listened.filter(id=>id==="story"||id==="observe"))]:[],tasks,answers,quizCompleted:answers.length===optionCounts.length};
  if(typeof old.updatedAt==="string"&&Number.isFinite(Date.parse(old.updatedAt)))restored.updatedAt=old.updatedAt;
  if(percent(restored)===100&&typeof old.completedAt==="string"&&Number.isFinite(Date.parse(old.completedAt)))restored.completedAt=old.completedAt;
  return restored;
}
