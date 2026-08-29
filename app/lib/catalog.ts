import {articleByTopic,questionsFromArticle} from "./notion-articles.ts";
import {topicsForScenic} from "./notion-content.ts";

export type CityId = "guiyang" | "anshun" | "zunyi" | "liupanshui" | "bijie" | "tongren" | "qiandongnan" | "qiannan" | "qianxinan";
export type City = { id: CityId; name: string; fullName: string; english: string; theme: string; line: string };
export type Scenic = { id: string; cityId: CityId; name: string; lat: number; lon: number; kind: "water" | "culture" | "nature"; summary: string; image?: string; demo: boolean };
export type Question = { id: string; type: "single" | "boolean"; prompt: string; options: string[]; correct: number; explanation: string };
export type Quest = { id: string; title: string; prompt: string; hint: string; label: string };
export type Chapter = { id: string; title: string; text: string };
export const CITY_SOURCE = "https://mzt.guizhou.gov.cn/xwzx/tzgg/202601/t20260128_89347775.html";
export const WATERFALL_SOURCE = "https://mzt.guizhou.gov.cn/ztzl/rdzt/gzdmgs/202506/t20250615_88143272.html";
export const ANSHUN_SOURCE = "https://www.anshun.gov.cn/xwzx/asyw/202409/t20240925_85755859.html";
export const CITIES: City[] = [
  { id:"guiyang",name:"贵阳",fullName:"贵阳市",english:"GUIYANG",theme:"古镇与城市",line:"在石板路与城市山林之间，找到新的故事。" },
  { id:"anshun",name:"安顺",fullName:"安顺市",english:"ANSHUN",theme:"瀑布与屯堡",line:"跟着水声与石头的线索，认识另一面的贵州。" },
  { id:"zunyi",name:"遵义",fullName:"遵义市",english:"ZUNYI",theme:"历史与赤水",line:"走进历史现场，也走进赤水的青山绿水。" },
  { id:"liupanshui",name:"六盘水",fullName:"六盘水市",english:"LIUPANSHUI",theme:"高原与草地",line:"在高原的风里，发现草地与山峦的层次。" },
  { id:"bijie",name:"毕节",fullName:"毕节市",english:"BIJIE",theme:"溶洞与花海",line:"从洞穴里的纹理，读到山野里的颜色。" },
  { id:"tongren",name:"铜仁",fullName:"铜仁市",english:"TONGREN",theme:"山岳与生态",line:"用放慢的脚步，认识山林里的生命。" },
  { id:"qiandongnan",name:"黔东南",fullName:"黔东南苗族侗族自治州",english:"QIANDONGNAN",theme:"苗寨与侗乡",line:"沿着屋檐、鼓楼与歌声，走近苗侗文化。" },
  { id:"qiannan",name:"黔南",fullName:"黔南布依族苗族自治州",english:"QIANNAN",theme:"山水与星空",line:"在桥、水与星空之间，让好奇心走远一点。" },
  { id:"qianxinan",name:"黔西南",fullName:"黔西南布依族苗族自治州",english:"QIANXINAN",theme:"峰林与峡谷",line:"从一座山峰开始，读懂大地的起伏。" },
];
const waterfall = "https://p7.itc.cn/q_70/images03/20231016/51d551ef51b04341bdb717ccf799e055.jpeg";
const village = "https://hlhbsc.org/upload/download/Spot_pic/Spot_picfile_000738_New.jpg";
export const SCENICS: Scenic[] = [
  {id:"huangguoshu",cityId:"anshun",name:"黄果树瀑布",lat:25.992,lon:105.668,kind:"water",summary:"听水声、看水雾，在白水河的瀑布前开启一场亲子观察。",image:waterfall,demo:false},
  {id:"longgong",cityId:"anshun",name:"龙宫",lat:26.103,lon:105.882,kind:"water",summary:"从洞口的光线与水面倒影，认识地下山水的另一种模样。",demo:true},
  {id:"tianlong",cityId:"anshun",name:"天龙屯堡",lat:26.291,lon:106.113,kind:"culture",summary:"走进屯堡的石头街巷，观察建筑与生活中的文化线索。",demo:true},
  {id:"getuhe",cityId:"anshun",name:"格凸河",lat:25.68,lon:106.263,kind:"nature",summary:"一起观察河流与岩壁，发现山水之间的形状和层次。",demo:true},
  {id:"jiuzhou",cityId:"anshun",name:"旧州古镇",lat:26.244,lon:106.019,kind:"culture",summary:"在古镇的门、窗与街道上，记录一处值得追问的细节。",demo:true},
  {id:"qingyan",cityId:"guiyang",name:"青岩古镇",lat:26.328,lon:106.678,kind:"culture",summary:"从城门与石板街出发，用观察认识古镇建筑。",demo:true},
  {id:"qianlingshan",cityId:"guiyang",name:"黔灵山公园",lat:26.601,lon:106.689,kind:"nature",summary:"在城市山林里，观察树叶、光线与自然的声音。",demo:true},
  {id:"tianhetan",cityId:"guiyang",name:"天河潭",lat:26.427,lon:106.576,kind:"water",summary:"跟着水流寻找山水线索，记录水面与岩石的不同。",demo:true},
  {id:"zunyihuiyi",cityId:"zunyi",name:"遵义会议会址",lat:27.686,lon:106.921,kind:"culture",summary:"阅读现场说明，学习从建筑与展陈中寻找历史证据。",demo:true},
  {id:"chishui",cityId:"zunyi",name:"赤水大瀑布",lat:28.369,lon:105.734,kind:"water",summary:"在安全观景区比较岩石、水流与林木的颜色。",demo:true},
  {id:"hailongtun",cityId:"zunyi",name:"海龙屯",lat:27.824,lon:106.928,kind:"culture",summary:"观察山地遗址的布局，想一想地形与建筑有什么关系。",demo:true},
  {id:"yushe",cityId:"liupanshui",name:"玉舍国家森林公园",lat:26.47,lon:104.788,kind:"nature",summary:"在森林步道上，用三种感官记录山林。",demo:true},
  {id:"wumeng",cityId:"liupanshui",name:"乌蒙大草原",lat:26.144,lon:104.648,kind:"nature",summary:"观察草地的颜色、风的方向和远山的轮廓。",demo:true},
  {id:"minghu",cityId:"liupanshui",name:"明湖湿地公园",lat:26.573,lon:104.789,kind:"water",summary:"在湿地边放慢脚步，找出水与植物相处的线索。",demo:true},
  {id:"zhijindong",cityId:"bijie",name:"织金洞",lat:26.773,lon:105.875,kind:"nature",summary:"观察洞穴里的形态与纹理，用语言描述一处发现。",demo:true},
  {id:"bailidujuan",cityId:"bijie",name:"百里杜鹃",lat:27.221,lon:105.868,kind:"nature",summary:"寻找植物的不同层次，认识季节如何改变山野。",demo:true},
  {id:"caohai",cityId:"bijie",name:"草海",lat:26.854,lon:104.246,kind:"water",summary:"从岸边观察湿地，不打扰地记录自然。",demo:true},
  {id:"fanjingshan",cityId:"tongren",name:"梵净山",lat:27.907,lon:108.692,kind:"nature",summary:"观察山岳与森林，在指定步道上寻找生态细节。",demo:true},
  {id:"yamugou",cityId:"tongren",name:"亚木沟",lat:27.829,lon:108.771,kind:"nature",summary:"在溪谷里倾听环境声，比较植物与石头的纹理。",demo:true},
  {id:"zhushaguzhen",cityId:"tongren",name:"朱砂古镇",lat:27.523,lon:109.217,kind:"culture",summary:"阅读工业记忆的线索，记录一个想了解的故事。",demo:true},
  {id:"xijiang",cityId:"qiandongnan",name:"西江千户苗寨",lat:26.493,lon:108.172,kind:"culture",summary:"看吊脚楼如何顺着山势排列，走近苗寨生活。",image:village,demo:true},
  {id:"zhaoxing",cityId:"qiandongnan",name:"肇兴侗寨",lat:25.911,lon:109.179,kind:"culture",summary:"寻找鼓楼与风雨桥，观察公共建筑的作用。",demo:true},
  {id:"zhenyuan",cityId:"qiandongnan",name:"镇远古城",lat:27.052,lon:108.423,kind:"culture",summary:"沿舞阳河观察街巷与山水，收集古城的线索。",demo:true},
  {id:"xiaoqikong",cityId:"qiannan",name:"荔波小七孔",lat:25.265,lon:107.747,kind:"water",summary:"从桥与水出发，观察水色、植物与岩石。",demo:true},
  {id:"tianyan",cityId:"qiannan",name:"中国天眼科普基地",lat:25.831,lon:106.859,kind:"culture",summary:"阅读科普展陈，把对宇宙的好奇变成一个问题。",demo:true},
  {id:"douyun",cityId:"qiannan",name:"都匀石板古街",lat:26.262,lon:107.515,kind:"culture",summary:"在石板路与沿街建筑中，找到城市的生活记忆。",demo:true},
  {id:"wanfenglin",cityId:"qianxinan",name:"万峰林",lat:25.025,lon:104.941,kind:"nature",summary:"比较山峰的轮廓，记录峰林与田野的关系。",demo:true},
  {id:"malinghe",cityId:"qianxinan",name:"马岭河峡谷",lat:25.148,lon:104.966,kind:"water",summary:"观察峡谷的岩壁和水流，寻找地貌变化的线索。",demo:true},
  {id:"wanfenghu",cityId:"qianxinan",name:"万峰湖",lat:24.891,lon:105.11,kind:"water",summary:"看湖面如何映出群山，用一句话描述水与山。",demo:true},
  {id:"jiaxiulou",cityId:"guiyang",name:"甲秀楼",lat:26.567,lon:106.72,kind:"culture",summary:"观察楼阁、石桥与南明河怎样组合成一处城市地标。",demo:true},
  {id:"yelanggu",cityId:"guiyang",name:"花溪夜郎谷",lat:26.37,lon:106.63,kind:"culture",summary:"分辨艺术创作与历史遗址，用提问认识一座石头艺术园。",demo:true},
  {id:"yangming",cityId:"guiyang",name:"阳明文化园",lat:26.84,lon:106.59,kind:"culture",summary:"从文字、空间与人物故事出发，理解“知行合一”的线索。",demo:true},
  {id:"houer",cityId:"guiyang",name:"猴耳天坑",lat:27.05,lon:106.95,kind:"nature",summary:"从安全观景位置观察喀斯特地貌像怎样打开了一扇地面之门。",demo:true},
  {id:"guanlingfossil",cityId:"anshun",name:"关岭化石群",lat:25.94,lon:105.62,kind:"nature",summary:"从古生物化石寻找贵州曾被海洋覆盖的遥远证据。",demo:true},
  {id:"anshunwenmiao",cityId:"anshun",name:"安顺文庙",lat:26.25,lon:105.93,kind:"culture",summary:"观察石雕龙柱的纹理与结构，认识古建筑中的工艺。",demo:true},
  {id:"baojiatun",cityId:"anshun",name:"鲍家屯",lat:26.31,lon:106.09,kind:"culture",summary:"跟着水渠观察古老水利怎样在村落里分流与使用。",demo:true},
  {id:"anshundixi",cityId:"anshun",name:"安顺地戏",lat:26.22,lon:105.94,kind:"culture",summary:"从面具、动作与声音认识一项仍在生活中的民间表演。",demo:true},
  {id:"loushanguan",cityId:"zunyi",name:"娄山关",lat:27.97,lon:106.84,kind:"culture",summary:"观察山势与关隘位置，理解这里为什么成为黔北要塞。",demo:true},
  {id:"maotai",cityId:"zunyi",name:"茅台镇",lat:27.85,lon:106.36,kind:"culture",summary:"沿赤水河认识地理环境、酿造传统与地方生活的关系。",demo:true},
  {id:"suoluo",cityId:"zunyi",name:"赤水桫椤保护区",lat:28.43,lon:106.02,kind:"nature",summary:"在不触碰植物的前提下，认识古老植物与森林生态。",demo:true},
  {id:"wujiangzhai",cityId:"zunyi",name:"乌江寨",lat:27.57,lon:107.02,kind:"culture",summary:"从河谷、建筑与夜间生活观察一处山水聚落。",demo:true},
  {id:"tuole",cityId:"liupanshui",name:"妥乐古银杏",lat:25.78,lon:104.65,kind:"nature",summary:"观察古银杏与村落如何共同构成季节性的风景。",demo:true},
  {id:"panxiandong",cityId:"liupanshui",name:"盘县大洞",lat:25.66,lon:104.75,kind:"culture",summary:"从考古线索想象古人类如何在洞穴环境中生活。",demo:true},
  {id:"beipanjiang",cityId:"liupanshui",name:"北盘江峡谷",lat:26.38,lon:104.72,kind:"nature",summary:"从峡谷地形理解高桥为什么需要跨越巨大的高差。",demo:true},
  {id:"sanxian",cityId:"liupanshui",name:"三线建设博物馆",lat:26.59,lon:104.83,kind:"culture",summary:"通过机器、照片与档案认识一座工业城市的来路。",demo:true},
  {id:"jiudongtian",cityId:"bijie",name:"九洞天",lat:27.2,lon:105.13,kind:"nature",summary:"观察洞穴、河流与天窗相互连接的喀斯特奇观。",demo:true},
  {id:"guanyindong",cityId:"bijie",name:"黔西观音洞",lat:26.98,lon:106.0,kind:"culture",summary:"从考古发现认识远古人类在贵州生活的证据。",demo:true},
  {id:"kele",cityId:"bijie",name:"赫章可乐遗址",lat:27.12,lon:104.72,kind:"culture",summary:"从地下出土的遗物寻找区域交流与古代生活的线索。",demo:true},
  {id:"shexiang",cityId:"bijie",name:"奢香博物馆",lat:27.14,lon:105.61,kind:"culture",summary:"认识奢香夫人与龙场九驿，把道路与地方历史连起来。",demo:true},
  {id:"zhongnanmen",cityId:"tongren",name:"中南门古城",lat:27.72,lon:109.19,kind:"culture",summary:"在街巷与河岸之间观察铜仁城市生活留下的痕迹。",demo:true},
  {id:"yuping",cityId:"tongren",name:"玉屏箫笛馆",lat:27.24,lon:108.91,kind:"culture",summary:"看一根竹子如何经过选择、打孔与调音变成乐器。",demo:true},
  {id:"yinjiang",cityId:"tongren",name:"印江造纸村",lat:27.99,lon:108.41,kind:"culture",summary:"从树皮到纸张，认识一项依靠时间和手艺的传统工艺。",demo:true},
  {id:"yunshe",cityId:"tongren",name:"云舍村",lat:27.78,lon:108.77,kind:"culture",summary:"沿河观察村落、水与日常生活怎样彼此相连。",demo:true},
  {id:"danzhai",cityId:"qiandongnan",name:"丹寨非遗小镇",lat:26.2,lon:107.79,kind:"culture",summary:"从造纸、蜡染等手艺中寻找材料变化的线索。",demo:true},
  {id:"jiabang",cityId:"qiandongnan",name:"加榜梯田",lat:25.72,lon:108.64,kind:"nature",summary:"观察水怎样沿山坡逐层流动，并在梯田里被留下。",demo:true},
  {id:"leigongshan",cityId:"qiandongnan",name:"雷公山",lat:26.38,lon:108.2,kind:"nature",summary:"在指定步道观察森林层次，认识丰富生物的家园。",demo:true},
  {id:"langde",cityId:"qiandongnan",name:"朗德苗寨",lat:26.49,lon:108.05,kind:"culture",summary:"从寨门、风雨桥和服饰纹样认识苗族村寨生活。",demo:true},
  {id:"maolan",cityId:"qiannan",name:"茂兰喀斯特森林",lat:25.28,lon:107.9,kind:"nature",summary:"观察森林如何在裸露岩石与薄土之间生长。",demo:true},
  {id:"duyunmaojian",cityId:"qiannan",name:"都匀毛尖茶园",lat:26.19,lon:107.48,kind:"nature",summary:"观察茶芽的形态，认识“一芽一叶”背后的采摘标准。",demo:true},
  {id:"shuizu",cityId:"qiannan",name:"水族文化博物馆",lat:25.99,lon:107.87,kind:"culture",summary:"从水书与马尾绣认识文字、材料和族群记忆。",demo:true},
  {id:"dushan",cityId:"qiannan",name:"独山净心谷",lat:25.83,lon:107.54,kind:"nature",summary:"从山地步道观察峰丛、植被与光线的变化。",demo:true},
  {id:"ershisidaoguai",cityId:"qianxinan",name:"二十四道拐",lat:25.84,lon:105.22,kind:"culture",summary:"观察道路连续转弯的形状，理解坡度与交通的关系。",demo:true},
  {id:"liushizhuangyuan",cityId:"qianxinan",name:"刘氏庄园",lat:25.1,lon:104.9,kind:"culture",summary:"从建筑与展陈认识地方家族、社会与时代变迁。",demo:true},
  {id:"xingyifossil",cityId:"qianxinan",name:"兴义化石馆",lat:25.09,lon:104.9,kind:"nature",summary:"从古海洋动物化石读出贵州地貌漫长变化的一页。",demo:true},
  {id:"wanfenglakegeo",cityId:"qianxinan",name:"兴义地质公园",lat:25.08,lon:104.95,kind:"nature",summary:"从峰林与化石两条线索认识喀斯特大地的形成。",demo:true},
];
export const getCity = (id: string) => CITIES.find(city => city.id === id) ?? CITIES[1];
export const getScenic = (id: string) => SCENICS.find(scenic => scenic.id === id);
export const cityScenics = (cityId: string) => SCENICS.filter(scenic => scenic.cityId === cityId);
export const kindLabel = (kind: Scenic["kind"]) => ({water:"山水发现",culture:"文化寻踪",nature:"自然观察"}[kind]);
export function hotspotsFor(scenic: Scenic){
  const featured:Record<string,string[]>={
    huangguoshu:["找到一处能同时看见水帘与水雾的安全观察点","听十秒瀑布声，用三个词形容它","阅读一块现场说明牌，记住“白水河”这个名字"],
    qingyan:["找到一段保存完整的石板路","观察城门或屋檐上的一种建筑细节","找一块说明牌，认识古镇过去的用途"],
    xijiang:["从观景处观察吊脚楼怎样顺山排列","找到一处苗族纹样，描述它的形状","在不打扰居民的前提下听一段寨子里的声音"],
    fanjingshan:["在开放步道观察一种山地植物","从安全位置辨认蘑菇石的轮廓","阅读一块生态保护提示牌并说出原因"],
    xiaoqikong:["从安全步道观察古桥的桥孔","比较近处与远处水色的变化","找到一种与水边环境有关的植物"],
  };
  return featured[scenic.id]||[
    `找到${scenic.name}最有辨识度的一处景观`,
    scenic.kind==="culture"?"观察一种建筑或纹样细节，并说出它像什么":"停下来听十秒环境声，说出最明显的一种声音",
    "阅读一块现场说明牌，记住一个新名字或关键词",
  ];
}

export function chaptersFor(scenic: Scenic): Chapter[] {
  const articles=topicsForScenic(scenic,2).map(topic=>articleByTopic(topic.title)).filter(Boolean);
  if(articles.length)return articles.map((article,index)=>({id:index===0?"story":"observe",title:article!.headline,text:[article!.lead,...article!.sections.filter(section=>!["听完挑战","你还可以问小知"].includes(section.heading)).slice(0,3).map(section=>section.body)].filter(Boolean).join("\n\n")})).slice(0,2);
  return [
    {id:"story",title:`先认识${scenic.name}`,text:`欢迎来到${getCity(scenic.cityId).name}的${scenic.name}。${scenic.summary} 先读一读现场的介绍牌，记下一个名字或关键词。关于具体年代、人物和开放安排，请以景区正式说明为准。`},
    {id:"observe",title:"一起做一个细心的观察者",text:scenic.kind==="culture"?"走进文化景点，除了拍照，我们还可以观察建筑材料、空间布局和现场展陈。先记录自己真正看见的细节，再区分哪些是观察，哪些只是猜测。不要触摸禁止触碰的文物，尊重当地居民的生活。接下来，请家长和孩子各选一处细节，交换自己的发现。":"在自然景点，先停在安全、允许停留的位置。看一看远处和近处，听一听连续的声音和偶尔出现的声音。记录植物、岩石、水或光线的一种变化。观察不需要采摘、投喂或离开指定步道。接下来，请和家人交换各自注意到的细节。"},
  ];
}
export function tasksFor(scenic: Scenic): Quest[] {
  return [
    {id:"look",title:scenic.kind==="culture"?"寻找一处建筑细节":"寻找一处自然细节",prompt:scenic.id==="huangguoshu"?"比较左、中、右三段水帘。你觉得哪一段更密集？说说你看到的线索。":`在${scenic.name}找到一处吸引你的细节，用一句话描述形状、材料或颜色。`,hint:"先说看到了什么，再说你是怎么判断的。",label:"现场观察"},
    {id:"together",title:"交换一次亲子发现",prompt:"家长和孩子各说出一个刚才注意到的细节。你们的发现相同吗？",hint:"可以这样写：孩子发现……，家长发现……。",label:"共同作答"},
    {id:"question",title:"带走一个新问题",prompt:"读一读现场介绍，或听一段讲解。记录一个新学到的词，再提出一个问题。",hint:"问题没有标准答案。一个真实的好奇，就值得被记录。",label:"文化与知识"},
  ];
}
export function questionsFor(scenic: Scenic): Question[] {
  const article=articleByTopic(topicsForScenic(scenic,1)[0]?.title||"");
  const articleQuestions=questionsFromArticle(article) as Question[];
  if(articleQuestions.length>=3)return articleQuestions;
  const city=getCity(scenic.cityId);
  return [
    {id:"city",type:"single",prompt:`${scenic.name}属于贵州哪个市州？`,options:[city.name,...CITIES.filter(c=>c.id!==city.id).slice(0,2).map(c=>c.name)],correct:0,explanation:`景区概要与地图标注显示：${scenic.name}位于${city.fullName}。`},
    scenic.id==="huangguoshu"?{id:"history",type:"single",prompt:"讲解中提到，黄果树瀑布原来的名字是什么？",options:["红水河瀑布","白水河瀑布","银水河瀑布"],correct:1,explanation:"黄果树瀑布原名白水河瀑布。"}:{id:"observe",type:"single",prompt:"怎样让一条观察记录更有说服力？",options:["只写好看","只抄一个结论","描述真实看到的细节"],correct:2,explanation:"先描述颜色、形状或材料等细节，再提出猜测，是这次任务鼓励的观察方法。"},
    {id:"knowledge",type:"single",prompt:scenic.kind==="water"?"水雾主要由什么组成？":"遇到不知道的景区历史，应怎样确认？",options:scenic.kind==="water"?["细小的水滴","烟尘","石头粉末"]:["只凭外观猜测","查看正式介绍与可靠资料","把所有传说当作事实"],correct:scenic.kind==="water"?0:1,explanation:scenic.kind==="water"?"水流撞击后分散成细小水滴，飘散在空气中就形成水雾。":"把观察、推测和有来源的事实区分开，能更准确地认识一个地方。"},
    {id:"safe",type:"boolean",prompt:"为了完成探索任务，可以跨过护栏或离开指定步道。",options:["正确","错误"],correct:1,explanation:"安全始终优先。所有观察任务都应在允许停留的区域完成。"},
    {id:"family",type:"boolean",prompt:"家长和孩子观察到不同细节，也是一种有价值的发现。",options:["正确","错误"],correct:0,explanation:"交换各自看到的细节，可以让一次探索拥有更多视角。"},
  ];
}
export function answerFromDemo(scenic: Scenic, question: string): string {
  if(/简单|孩子/.test(question)) return `可以这样和孩子说：${scenic.summary} 我们先找一个细节，再用自己的话说出来。`;
  if(/任务|做什么/.test(question)) return tasksFor(scenic)[0].prompt;
  if(/水雾|白色/.test(question)&&scenic.kind==="water") return "水流撞击岩石和水面，会分散成细小水滴。许多水滴飘在空气里，就形成了水雾。";
  if(/名字|原名|白水河/.test(question)&&scenic.id==="huangguoshu") return "黄果树瀑布原名白水河瀑布。你还可以打开景区文章继续了解它的名字与故事。";
  if(/哪里|哪个市|位置/.test(question)) return `${scenic.name}属于${getCity(scenic.cityId).fullName}。首页地图展示的是景区大致位置，不用于现场导航。`;
  return "这个问题暂时没有找到可靠答案。可以先记下来，再查看景区文章或现场正式介绍。";
}
