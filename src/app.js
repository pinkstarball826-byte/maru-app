(function(){
var INSTANT=false; // テスト用: 答え・食事の変化をその場で反映(本番では false)
var RV=5; // 値を上げると、一度だけ今週の個体が白い球体に戻る
var LOOK="w";try{LOOK=localStorage.getItem("maru-look")||"w";}catch(e){}
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var KEY="maru-v5",DECAY=2,PI=Math.PI,VIS=.12;
var DN=["月","火","水","木","金","土","日"];
var STG=["未分化","発生","形成","成熟"];
var TH={sen:190,flo:235,cry:330,spl:140,res:45};
var MD=window.MD,PARTS=MD.PARTS;
function weekKeyInit(){var d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));var p=function(n){return n<10?"0"+n:""+n;};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());}
var TR=["sen","flo","cry","spl","res"];
var Q=MD.weekQ(weekKeyInit()),OMEN=MD.OMEN,EOMEN=MD.EOMEN,EN=MD.EN,FOODS=MD.FOODS;

function pad(n){return n<10?"0"+n:""+n;}
function fmt(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function today(){return fmt(new Date());}
function dayIdx(){return (new Date().getDay()+6)%7;}
function weekKey(){var d=new Date();d.setDate(d.getDate()-dayIdx());return fmt(d);}
function dlabel(k){var a=k.split("-");return (+a[1])+"/"+(+a[2])+"の週";}
function rngS(n){var a=n>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
function fresh(w,hist,box){var sd=Math.floor(Math.random()*2147483000)+1;return {rv:RV,act:[],name:"",day:w,xp:0,ans:{},seed:sd,rs:sd+77,tr:{sen:0,flo:0,cry:0,spl:0,res:0},parts:{},pend:{},hg:70,at:Date.now(),applied:today(),news:"",log:[],hist:hist||[],box:box||[]};}
function load(){var s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(e){}if(s&&s.day&&s.parts){if(s.rv===RV)return s;return fresh(weekKey(),s.hist,s.box);}return fresh(weekKey());}
var st=load(),uid=0;
function snap(c){return {id:c.day,day:c.day,name:c.name,xp:c.xp,seed:c.seed,tr:c.tr,parts:c.parts,el:c.el||null};}
function vis(c){var o=[];PARTS.forEach(function(p,i){if(((c.parts||{})[i]||0)>VIS)o.push(i);});return o;}
function stageOf(c){var n=vis(c).length;return n===0?0:n<=2?1:n<=4?2:3;}
function applyPending(){
  var slow=(!INSTANT&&hunger()<15)?.5:1,before={},gr=[],nw=[];
  for(var k in st.parts)before[k]=st.parts[k];
  // 1週間で持てる性質は最大3つ。4つ目以降の種は、すでにある性質を深める
  if(!st.act)st.act=TR.filter(function(t){return st.tr[t]>0;}).sort(function(a,b){return st.tr[b]-st.tr[a];}).slice(0,3);
  var red=false,elNews="";if(st.pendEl){st.el=st.pendEl;st.pendEl=null;elNews=EN[st.el]+"の気配をまとった。";}
  TR.slice().sort(function(a,b){return (st.pend[b]||0)-(st.pend[a]||0);}).forEach(function(t){
    var v=st.pend[t]||0;if(v<=0||st.act.indexOf(t)>=0)return;
    if(st.act.length<3){if(v>=1)st.act.push(t);}
    else{var tg=st.act.slice().sort(function(a,b){return st.tr[b]-st.tr[a];})[0];st.pend[tg]=(st.pend[tg]||0)+v;st.pend[t]=0;red=true;}});
  var rs=st.rs;var rnd=function(){rs=(rs+0x6D2B79F5)|0;var t=Math.imul(rs^rs>>>15,1|rs);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};
  TR.forEach(function(t){
    var c=(st.pend[t]||0)*slow,w=Math.floor(c);st.pend[t]=c-w;st.tr[t]+=w;
    for(var i=0;i<w;i++){
      var ids=[],own=[];PARTS.forEach(function(p,j){if(p[2]===t){ids.push(j);if((st.parts[j]||0)>0)own.push(j);}});
      var pool=own.length>=2||(own.length&&rnd()<.6)?own:ids.filter(function(j){return !(st.parts[j]>0);});
      if(t==="sen"&&!(st.parts[4]>0)&&own.length<2&&rnd()<.5)pool=[4];
      if(!pool.length)pool=ids;
      var j=pool[Math.floor(rnd()*pool.length)];
      st.parts[j]=Math.min(1,(st.parts[j]||0)+((st.parts[j]||0)>0?.25:.2));
    }
  });
  st.rs=rs;
  PARTS.forEach(function(p,i){var b=before[i]||0,a=st.parts[i]||0;
    if(a>VIS&&b<=VIS)nw.push(p[0]);else if(a>b+.01&&b>VIS)gr.push(p[0]);});
  var base=nw.length?"新しい器官ができた!"+nw.slice(0,2).join("、")+"。":gr.length?gr.slice(0,2).join("、")+"がちょっと育ってる。":"まだ変化なし。";
  var stB=0;for(var kk in before)if(before[kk]>VIS)stB++;stB=stB===0?0:stB<=2?1:stB<=4?2:3;
  st.evo={nw:nw.slice(),gr:gr.slice(),el:elNews?st.el:null,up:stageOf(st)>stB?stageOf(st):0};
  st.news=elNews+(red?"これ以上、性質は増えない。いまの性質が深まった。":"")+base;
}
function hasShape(){return st.xp>0||vis(st).length>0||Object.keys(st.ans).length>0;}
function tick(){
  var w=weekKey(),td=today();
  if(st.day!==w){Q=MD.weekQ(w);applyPending();var h=st.hist||[];if(hasShape())h.push(snap(st));st=fresh(w,h.slice(-6),st.box);return "week";}
  if(st.applied!==td){applyPending();st.applied=td;return "day";}
  return null;
}
var first=tick();
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}queueSync();}
function hunger(){return Math.max(0,st.hg-(Date.now()-st.at)/60000*DECAY);}
function nAns(){return Object.keys(st.ans).length;}

// ---- 描画 ----
function petSVG(c,cls){
  var W=LOOK==="w",id="g"+(uid++),sd=c.seed||1,xp=c.xp||0,parts=c.parts||{},tr=c.tr||{},st_=stageOf(c);
  var ord=TR.slice().sort(function(a,b){return (tr[b]||0)-(tr[a]||0);}),dom=(tr[ord[0]]||0)>0?ord[0]:"sen",sec=(tr[ord[1]]||0)>0?TH[ord[1]]:null,G=GENE(c,dom,sec,st_);
  var R=(33+Math.min(xp,500)/500*20)*(1+(G.sz-1)*G.s),cx=100,cy=108,s="",hsh=0,mirN=0,shN=0;
  var tot=0,vx=0,vy=0;TR.forEach(function(t){var v=tr[t]||0;tot+=v;vx+=v*Math.cos(TH[t]*PI/180);vy+=v*Math.sin(TH[t]*PI/180);});
  if(c.el){var eh=MD.EHUE[c.el]*PI/180;tot+=3;vx+=3*Math.cos(eh);vy+=3*Math.sin(eh);}
  var h=tot<.5?(W?200:0):(Math.round((Math.atan2(vy,vx)*180/PI+360)%360)+Math.round(G.dh*G.s)+360)%360,sat=Math.max(W?24:0,Math.min(75,tot*7));
  var lt="hsl("+h+" "+(sat*.5)+"% 97%)",md="hsl("+h+" "+sat+"% 88%)",ed="hsl("+h+" "+(sat*.9)+"% 74%)";
  var ST="rgba(255,255,255,.8)",GL="rgba(255,255,255,.28)";
  function pt(a,d){return [+(cx+Math.cos(a)*d).toFixed(1),+(cy+Math.sin(a)*d*.97).toFixed(1)];}
  function AC(t,l){return "hsl("+((TH[t]+hsh)%360)+" 85% "+(l||78)+"%)";}
  function ln(a,d0,d1,w,c){var p=pt(a,d0),q=pt(a,d1);return '<path d="M'+p[0]+' '+p[1]+'L'+q[0]+' '+q[1]+'" stroke="'+c+'" stroke-width="'+w+'" fill="none" stroke-linecap="round"/>';}
  function dt(a,d,r,c,o){var p=pt(a,d);return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+r+'" fill="'+c+'"'+(o?' opacity="'+o+'"':'')+'/>';}
  function cu(a,d0,d1,b,w,c){var p=pt(a,d0),q=pt(a+b,d1),m=pt(a+b*1.7,(d0+d1)/2);return '<path d="M'+p[0]+' '+p[1]+'Q'+m[0]+' '+m[1]+' '+q[0]+' '+q[1]+'" stroke="'+c+'" stroke-width="'+w+'" fill="none" stroke-linecap="round"/>';}
  function mb(a,wd,d,f,sc){var p=pt(a-wd,R*.98),q=pt(a+wd,R*.98),m=pt(a,R+d);return '<path d="M'+p[0]+' '+p[1]+'Q'+m[0]+' '+m[1]+' '+q[0]+' '+q[1]+'Z" fill="'+f+'" stroke="'+sc+'" stroke-width="1"/>';}
  var D=[
   function(L,A){var o="";for(var i=0;i<3;i++){var a=A+(i-1)*.32;o+=ln(a,R*.96,R+22*L,1.6,ST)+dt(a,R+22*L,1.5+2*L,AC("sen"));}return o;},
   function(L,A){var o="";for(var i=0;i<3;i++){var a=A+i*.7;o+=dt(a,R*.45+i*3,3+2*L,"rgba(12,14,23,.3)")+dt(a,R*.45+i*3,1+L,AC("sen",85));}return o;},
   function(L,A){return mb(A,.5,30*L,GL,ST);},
   function(L,A){var o="";for(var i=0;i<6;i++)o+=dt(A+i*.42,R*.88,1.6+1.2*L,AC("res",84));return o;},
   function(L,A){return "";},
   function(L,A){var o="";for(var i=0;i<3;i++)o+=cu(A+i*.25,R*.95,R+40*L,.5-.3*i,1.5,"rgba(255,255,255,.55)");return o;},
   function(L,A){var t=(A*30)%60-30;return '<g class="spin"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(R*1.3)+'" ry="'+(R*.28)+'" transform="rotate('+t+' '+cx+' '+cy+')" fill="none" stroke="'+AC("res")+'" stroke-width="1.4" opacity="'+(.4+.5*L)+'"/></g>';},
   function(L,A){return mb(A+PI,.45,34*L,"hsl(235 50% 85% / .3)",ST);},
   function(L,A){var t=(A*20)%50-25;return '<g class="spin" style="animation-duration:11s"><g transform="rotate('+t+' '+cx+' '+cy+')"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(R*1.45)+'" ry="'+(R*.5)+'" fill="none" stroke="rgba(255,255,255,.18)"/><circle cx="'+(cx+R*1.45)+'" cy="'+cy+'" r="'+(2+3*L)+'" fill="'+AC("res",84)+'"/><circle cx="'+(cx-R*1.45)+'" cy="'+cy+'" r="'+(1.5+2*L)+'" fill="#fff" opacity=".8"/></g></g>';},
   function(L,A){var d="M"+pt(A,R*.95).join(" "),o="";for(var i=1;i<=4;i++){var p=pt(A+Math.sin(i*1.3)*.5,R+i*8*L);d+="L"+p.join(" ");o+=dt(A+Math.sin(i*1.3)*.5,R+i*8*L,1.8,AC("spl",85));}return '<path d="'+d+'" stroke="'+ST+'" stroke-width="2" fill="none" stroke-linejoin="round"/>'+o;},
   function(L,A){var o="";for(var i=0;i<5;i++){var a=A+i*.35-.7,p=pt(a,R*.7),q=pt(a+.18,R*.95),w=pt(a-.18,R*.9);o+='<path d="M'+p.join(" ")+'L'+q.join(" ")+'L'+w.join(" ")+'Z" fill="rgba(255,255,255,'+(.2+.3*L)+')" stroke="'+ST+'" stroke-width=".8"/>';}return o;},
   function(L,A){var o="";for(var k=1;k<=3;k++){var rr=R*(1+.06*k),p=pt(A,rr),q=pt(A+2,rr);o+='<path d="M'+p.join(" ")+'A'+rr+' '+rr+' 0 0 1 '+q.join(" ")+'" stroke="'+ST+'" stroke-width="1.2" fill="none" opacity="'+(.8-k*.15)*L+'"/>';}return o;},
   function(L,A,r){var o="";for(var i=0;i<5;i++){var a=A+(i-2)*.3,w=.13,p=pt(a-w,R*.98),q=pt(a+w,R*.98),t=pt(a,R+(8+r()*10)*L);o+='<path d="M'+p.join(" ")+'L'+t.join(" ")+'L'+q.join(" ")+'Z" fill="rgba(255,255,255,.55)" stroke="'+ST+'" stroke-width=".8"/>';}return o;},
   function(L,A,r){var o="";for(var i=0;i<9;i++){var a=r()*2*PI,d=r()*R*.75;o+=dt(a,d,(1.5+r()*2)*L+.5,"rgba(12,14,23,.18)");}return o;},
   function(L,A){var d="M"+pt(A-.7,R*1.05).join(" ");for(var i=1;i<=6;i++)d+="L"+pt(A-.7+i*.233,R*(i%2?1.22:1.06)+4*L*(i%2)).join(" ");return '<path d="'+d+'" fill="'+GL+'" stroke="'+ST+'" stroke-width="1" stroke-linejoin="round" opacity="'+(.5+.5*L)+'"/>';},
   function(L,A){return dt(A,R*.25,R*.5*L+3,AC("res",85),.28)+dt(A,R*.25,R*.22*L+2,"#fff",.75);},
   function(L,A){var o="";for(var i=0;i<3;i++){var p=pt(A+i*.9,R*.95),m=pt(A+i*.9+.5,R*.5);o+='<path d="M'+cx+' '+cy+'Q'+m.join(" ")+' '+p.join(" ")+'" stroke="'+AC("flo",70)+'" stroke-width="1.2" fill="none" opacity="'+(.3+.5*L)+'"/>';}return o;},
   function(L,A){var p=pt(A,R*.3),q=pt(A+.9,R*.35);return '<path d="M'+p.join(" ")+'L'+q.join(" ")+'" stroke="'+AC("spl",80)+'" stroke-width="1" opacity=".6"/>'+dt(A,R*.3,3+3*L,AC("spl",85),.85)+dt(A+.9,R*.35,2+3*L,AC("spl",85),.85);},
   function(L,A){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(R*.62)+'" ry="'+(R*.44)+'" transform="rotate('+(A*57%180)+' '+cx+' '+cy+')" fill="none" stroke="'+AC("cry",80)+'" stroke-width="1.2" opacity="'+(.3+.6*L)+'"/>';},
   function(L,A){var o="";for(var i=0;i<4;i++)o+=dt(A+i*.35,R*.55,1.5+1.5*L,AC("sen",85));return '<g class="pulse">'+o+'</g>';},
   function(L,A){return '<ellipse cx="'+cx+'" cy="'+(cy-R-12)+'" rx="'+(R*.55)+'" ry="6" fill="none" stroke="'+AC("res",76)+'" stroke-width="2" opacity="'+(.4+.6*L)+'"/>';},
   function(L,A){var d="",b=pt(A,R*.95);for(var t=0;t<=14;t++){var rho=t/14*8*L,th=t*.9,p=pt(A,R*.95+t*2.2*L);d+=(t?"L":"M")+(p[0]+rho*Math.cos(th)).toFixed(1)+" "+(p[1]+rho*Math.sin(th)).toFixed(1);}return '<path d="'+d+'" stroke="'+AC("res")+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>';},
   function(L,A){return ln(A-.25,R*.95,R+16*L,1.4,ST)+ln(A,R*.95,R+26*L,1.6,ST)+ln(A+.25,R*.95,R+16*L,1.4,ST)+dt(A,R+26*L,1.8,AC("spl",85))+dt(A-.25,R+16*L,1.4,"#fff")+dt(A+.25,R+16*L,1.4,"#fff");},
   function(L,A){var p=pt(A,R+10*L);return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(8+8*L)+'" fill="'+GL+'" stroke="'+ST+'" stroke-width="1"/>'+dt(A-.15,R+10*L+3,2,"#fff",.7);},
   function(L,A){return ln(A,R*.9,R*-.9,1.4,AC("sen",85)).replace("stroke-linecap","opacity=\""+(.3+.6*L)+"\" stroke-linecap")+dt(A,R*.55,1.8,"#fff")+dt(A+PI,R*.55,1.8,"#fff");},
   function(L,A){return ln(A,R*.9,R+20*L,2.4,ST)+ln(A-.22,R+14*L,R+28*L,1.5,ST)+ln(A+.22,R+14*L,R+28*L,1.5,ST)+dt(A-.22,R+30*L,2+2*L,"rgba(255,255,255,.75)")+dt(A+.22,R+30*L,2+2*L,"rgba(255,255,255,.75)");},
   function(L,A){var p=pt(A,R+8+10*L);return ln(A,R*.95,R+6,3,ST)+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(5+9*L)+'" fill="'+GL+'" stroke="'+ST+'" stroke-width="1"/>'+dt(A-.1,R+8+10*L,2+2*L,"#fff",.6);},
   function(L,A){var o="";for(var i=0;i<4;i++)o+=dt(A+i*.9,R*.3+(i%2)*R*.12,4+4*L-i*.6,GL).replace('fill="'+GL+'"','fill="'+GL+'" stroke="'+ST+'" stroke-width=".8"');return o;},
   function(L,A){var p=pt(A,R*.4);return '<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="'+(6+6*L)+'" ry="'+(4+4*L)+'" transform="rotate('+(A*50%180)+' '+p[0]+' '+p[1]+')" fill="#0c0e17" opacity=".55" stroke="'+ST+'" stroke-width="1.5"/>';},
   function(L,A){var p=pt(A,R*.95),q=pt(A+.5,R+44*L),m=pt(A+.9,R+20*L);return '<path d="M'+p.join(" ")+'Q'+m.join(" ")+' '+q.join(" ")+'" stroke="rgba(255,255,255,.5)" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(4+3*L)+'" fill="rgba(255,255,255,.8)"/>';}
  ];
  D=D.concat(ORG2({R:R,cx:cx,cy:cy,pt:pt,ln:ln,dt:dt,cu:cu,AC:AC,ST:ST,GL:GL}));
  s+='<defs><radialGradient id="'+id+'b" cx=".38" cy=".32" r=".8">'+(W?'<stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="'+lt+'" stop-opacity=".1"/><stop offset=".86" stop-color="'+md+'" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity=".78"/>':'<stop offset="0" stop-color="#fff" stop-opacity=".98"/><stop offset=".55" stop-color="'+lt+'" stop-opacity=".9"/><stop offset="1" stop-color="'+md+'" stop-opacity=".72"/>')+'</radialGradient><radialGradient id="'+id+'c"><stop offset="0" stop-color="#fff" stop-opacity="'+(W?.55:.95)+'"/><stop offset="1" stop-color="'+ed+'" stop-opacity="0"/></radialGradient><radialGradient id="'+id+'a"><stop offset=".45" stop-color="'+md+'" stop-opacity=".3"/><stop offset="1" stop-color="'+md+'" stop-opacity="0"/></radialGradient>'+(W?'<radialGradient id="'+id+'w"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>':"")+(c.el==="f"?'<radialGradient id="'+id+'f"><stop offset=".3" stop-color="hsl(25 100% 60%)" stop-opacity=".4"/><stop offset="1" stop-color="hsl(25 100% 60%)" stop-opacity="0"/></radialGradient>':"")+'</defs>';
  s+=W?'<ellipse cx="100" cy="198" rx="'+(R*.8)+'" ry="4" fill="#000" opacity=".25"/><ellipse cx="100" cy="197" rx="'+(R*.55)+'" ry="2.6" fill="hsl(190 100% 85%)" opacity=".55"/>':'<ellipse cx="100" cy="198" rx="'+(R*.75)+'" ry="3.5" fill="#000" opacity=".4"/>';
  var inner="",outer="",bm="";
  PARTS.forEach(function(p,i){var L=Math.min(1,parts[i]||0);if(L<=VIS)return;
    // 同じ器官でも、数・向き・大きさ・色みが個体ごとに変わる
    var r=rngS(sd*31+i*977),A=r()*2*PI,vv=r(),mc=p[3]?1:(vv<.5?1:vv<.8?2:3),sc=.85+r()*.45,hr=r()<.45?Math.round((r()-.5)*100):0,g="",k;
    if(mc>1)mirN++;if(hr)shN++;
    for(k=0;k<mc;k++){
      var A2=k?A+(mc===2?PI*(.5+r()*.9):k*2.1+(r()-.5)*.5):A,rr=rngS(sd*31+i*977+k*131);
      hsh=hr;var gg=D[i](L,A2,rr);hsh=0;
      var an=pt(A2,R*.95);
      if(!p[3]&&sc!==1)gg='<g transform="translate('+an[0]+' '+an[1]+') scale('+(mc>1?Math.min(sc,1):sc).toFixed(2)+') translate('+(-an[0])+' '+(-an[1])+')">'+gg+'</g>';
      if(cls&&gg.indexOf('class="spin"')<0){gg='<g class="'+(p[3]?"wob":"sway")+'" style="transform-origin:'+(p[3]?cx+"px "+cy+"px":an[0]+"px "+an[1]+"px")+';animation-duration:'+(3.2+rr()*2.6).toFixed(1)+'s;animation-delay:-'+(rr()*4).toFixed(1)+'s">'+gg+'</g>';}
      g+=gg;}
    if(p[3])inner+=g;else outer+=g;});
  var rb=rngS(sd),amp=(.03+.016*st_)*(G.s>0?.7:1),n=G.s>0?22:11,sq=.97+rb()*.06,base=[],bf=BODYF(G),gx_=1+(G.sx-1)*G.s,gy_=1+(G.sy-1)*G.s;
  for(var i=0;i<n;i++)base.push(rb()*2-1);
  function blobD(ph){var pts=[];for(var i=0;i<n;i++){var a=i/n*2*PI,rr=R*(1+amp*1.4*base[i]+ph*.035*Math.sin(i*1.7+ph*3));rr*=bf(a);pts.push([cx+Math.cos(a)*rr*gx_,cy+Math.sin(a)*rr*sq*gy_]);}
    var d="M"+pts[0][0].toFixed(1)+" "+pts[0][1].toFixed(1);
    for(var i=0;i<n;i++){var p0=pts[(i+n-1)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
      d+="C"+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+" "+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+" "+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+" "+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+" "+p2[0].toFixed(1)+" "+p2[1].toFixed(1);}
    return d+"Z";}
  var d=blobD(0);
  var EL=c.el,elBack="",elFront="",dry=cls&&c===st&&hunger()<30,ovf=cls&&c===st&&hunger()>=80,re_=rngS(sd+21),ek;
  function ax(a,r){return [cx+Math.cos(a)*r,cy+Math.sin(a)*r*.97];}
  function f1(v){return v.toFixed(1);}
  if(EL==="w"){
    var gy=198;
    elBack+='<ellipse cx="'+cx+'" cy="'+gy+'" rx="'+(R*.95)+'" ry="3.4" fill="hsl(200 90% 75%)" opacity=".28"/>';
    for(ek=0;ek<3;ek++){var dx=cx+(ek-1)*R*.38,dy0=cy+R*.93,dd=Math.max(12,gy-dy0-4),dl=(ek*1.1).toFixed(1);
      elBack+='<ellipse class="'+(cls?"rip":"")+'" style="animation-delay:'+dl+'s" cx="'+f1(dx)+'" cy="'+(gy-1)+'" rx="'+(R*.26)+'" ry="2" fill="none" stroke="hsl(195 100% 85%)" stroke-width="1" opacity="'+(cls?0:.4)+'"/>';
      elBack+='<g transform="translate('+f1(dx)+' '+f1(dy0)+')"><path class="'+(cls?"drip":"")+'" style="animation-delay:'+dl+'s;--dd:'+Math.round(dd)+'px" d="M0 -4Q2.4 0 0 2.6Q-2.4 0 0 -4Z" fill="hsl(195 100% 85%)" opacity="'+(cls?0:.8)+'"/></g>';}
    var rsr=R*1.03;
    function ap(a){var q=ax(a,rsr);return f1(q[0])+" "+f1(q[1]);}
    elFront+='<path class="'+(cls?"flow":"")+'" d="M'+ap(PI*.86)+'A'+rsr+' '+rsr+' 0 0 0 '+ap(PI*.6)+'" stroke="hsl(195 100% 88%)" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="7 13" opacity="'+(ovf?.9:.3)+'"/><path class="'+(cls?"flow":"")+'" style="animation-delay:-.7s" d="M'+ap(PI*.14)+'A'+rsr+' '+rsr+' 0 0 1 '+ap(PI*.4)+'" stroke="hsl(195 100% 88%)" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="7 13" opacity="'+(ovf?.9:.3)+'"/>';
  }
  if(EL==="g"){
    var NL=Math.round(14+R*.15),lv_="",blowIdx=[2,7,12];
    function leaf(x,y,rot,lz,hue,sat,lig){return '<g transform="translate('+f1(x)+' '+f1(y)+') rotate('+Math.round(rot)+')"><path d="M0 0Q'+f1(lz*.55)+' '+f1(-lz*.5)+' 0 '+f1(-lz*1.5)+'Q'+f1(-lz*.55)+' '+f1(-lz*.5)+' 0 0Z" fill="hsl('+hue+' '+sat+'% '+lig+'%)" stroke="hsl('+hue+' 40% 36%)" stroke-width=".6"/></g>';}
    for(ek=0;ek<NL;ek++){var la=ek/NL*2*PI+(re_()-.5)*.3,lr=R*(.9+re_()*.14),lp=ax(la,lr),lh=105+Math.floor(re_()*45),lf=leaf(lp[0],lp[1],la*57.3+90+(re_()-.5)*40,R*(.2+re_()*.1),lh,40+Math.floor(re_()*20),52+Math.floor(re_()*16));
      if(cls&&blowIdx.indexOf(ek)>=0)lf='<g class="blow" style="transform-origin:'+f1(lp[0])+'px '+f1(lp[1])+'px;animation-delay:-'+(ek*1.3).toFixed(1)+'s;animation-duration:'+(13+ek%3*3)+'s">'+lf+'</g>';
      lv_+=lf;}
    for(ek=0;ek<7;ek++){var ia=PI*(.12+re_()*.76),ir=R*(.35+re_()*.5),ip=ax(ia,ir),ih_=105+Math.floor(re_()*45);
      lv_+=leaf(ip[0],ip[1],ia*57.3+90+(re_()-.5)*60,R*(.18+re_()*.08),ih_,45,56);}
    elFront+=lv_;
  }
  if(EL==="f"){
    var fl="",sc_=dry?.55:1;
    for(ek=0;ek<7;ek++){var fa=-PI*.92+ek*(PI*.84/6),len=R*(.5+.45*Math.sin(ek/6*PI)+re_()*.15),wd=R*.2,fp=ax(fa,R*.9),fd1=(re_()*2).toFixed(2),fd2=(.9+re_()*.8).toFixed(2);
      fl+='<g transform="translate('+f1(fp[0])+' '+f1(fp[1])+') rotate('+Math.round(fa*57.3+90)+')"><path class="'+(cls?"flick":"")+'" style="animation-delay:-'+fd1+'s;animation-duration:'+fd2+'s" d="M'+f1(-wd)+' 0Q'+f1(-wd*.9)+' '+f1(-len*.5)+' 0 '+f1(-len)+'Q'+f1(wd*.9)+' '+f1(-len*.5)+' '+f1(wd)+' 0Z" fill="hsl('+(14+ek%3*8)+' 100% 58%)" opacity=".92"/><path class="'+(cls?"flick":"")+'" style="animation-delay:-'+fd1+'s;animation-duration:'+fd2+'s" d="M'+f1(-wd*.5)+' 0Q'+f1(-wd*.45)+' '+f1(-len*.35)+' 0 '+f1(-len*.62)+'Q'+f1(wd*.45)+' '+f1(-len*.35)+' '+f1(wd*.5)+' 0Z" fill="hsl(48 100% 68%)"/></g>';}
    elBack+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*1.7)+'" fill="url(#'+id+'f)"/><ellipse cx="'+cx+'" cy="198" rx="'+(R*1.1)+'" ry="4" fill="hsl(25 100% 60%)" opacity=".25"/><g class="fire" style="transform-origin:'+cx+'px '+cy+'px;transform:scale('+sc_+')">'+fl+'</g>';
    for(ek=0;ek<6;ek++){elFront+='<circle class="'+(cls?"ember":"")+'" style="animation-delay:-'+(re_()*2.6).toFixed(2)+'s;animation-duration:'+(2+re_()*1.6).toFixed(2)+'s;--dx:'+Math.round((re_()-.5)*34)+'px" cx="'+f1(cx+(re_()-.5)*R*1.2)+'" cy="'+f1(cy-R*.7)+'" r="'+f1(1.2+re_()*1.4)+'" fill="hsl(40 100% 70%)" opacity="'+(cls?0:.8)+'"/>';}
  }
  if(EL==="i"){
    var gyi=198;elBack+='<ellipse cx="'+cx+'" cy="'+gyi+'" rx="'+(R*1.05)+'" ry="3.6" fill="hsl(195 100% 90%)" opacity=".32"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(R*1.7)+'" fill="url(#'+id+'e)"/>';
    for(ek=0;ek<6;ek++){var xi=cx+(ek-2.5)*R*.36+(re_()-.5)*6,hi=6+re_()*13;elBack+='<path d="M'+f1(xi-3.2)+' '+gyi+'L'+f1(xi)+' '+f1(gyi-hi)+'L'+f1(xi+3.2)+' '+gyi+'Z" fill="hsla(195,100%,92%,.55)" stroke="rgba(255,255,255,.8)" stroke-width=".6"/>';}
    for(ek=0;ek<9;ek++){var ia2=-PI*(.05+re_()*.9),ip2=ax(ia2,R*(.97+re_()*.04)),il2=5+re_()*10;elFront+='<g transform="translate('+f1(ip2[0])+' '+f1(ip2[1])+') rotate('+Math.round(ia2*57.3+90)+')"><path d="M-2.6 0L0 '+f1(-il2)+'L2.6 0L0 2Z" fill="hsla(195,100%,94%,.6)" stroke="rgba(255,255,255,.9)" stroke-width=".6"/></g>';}
    for(ek=0;ek<5;ek++){var tp=ax(re_()*2*PI,R*(.2+re_()*.75));elFront+='<path class="'+(cls?"twk":"")+'" style="animation-delay:-'+f1(re_()*3)+'s;transform-box:fill-box;transform-origin:center" d="M'+f1(tp[0]-3)+' '+f1(tp[1])+'h6M'+f1(tp[0])+' '+f1(tp[1]-3)+'v6" stroke="#fff" stroke-width="1" opacity="'+(cls?0:.8)+'"/>';}
    for(ek=0;ek<5;ek++)elFront+='<circle class="'+(cls?"snow":"")+'" style="animation-delay:-'+f1(re_()*5)+'s;animation-duration:'+f1(4+re_()*3)+'s;--dx:'+Math.round((re_()-.5)*24)+'px" cx="'+f1(cx+(re_()-.5)*R*2.4)+'" cy="'+f1(cy-R*1.3)+'" r="'+f1(1+re_()*1.2)+'" fill="#fff" opacity="'+(cls?0:.7)+'"/>';
  }
  if(EL==="t"){
    elBack+='<circle class="'+(cls?"pulse":"")+'" cx="'+cx+'" cy="'+cy+'" r="'+(R*1.75)+'" fill="url(#'+id+'e)"/>';
    for(ek=0;ek<5;ek++){var za=ek/5*2*PI+re_()*.8,zp=ax(za,R*1.04),dz="M"+f1(zp[0])+" "+f1(zp[1]),zr=R*1.04;for(var zk=1;zk<=4;zk++){zr+=R*(.1+re_()*.08);var zq=ax(za+(re_()-.5)*.35,zr);dz+="L"+f1(zq[0])+" "+f1(zq[1]);}
      elFront+='<path class="'+(cls?"zap":"")+'" style="animation-delay:-'+f1(re_()*3)+'s;animation-duration:'+f1(2+re_()*2)+'s" d="'+dz+'" stroke="hsl(52 100% 72%)" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="'+(cls?0:.8)+'"/><path class="'+(cls?"zap":"")+'" style="animation-delay:-'+f1(re_()*3)+'s;animation-duration:'+f1(2+re_()*2)+'s" d="'+dz+'" stroke="#fff" stroke-width=".7" fill="none" opacity="'+(cls?0:.8)+'"/>';}
    for(ek=0;ek<6;ek++){var sp2=ax(re_()*2*PI,R*(1.05+re_()*.4));elFront+='<circle class="'+(cls?"twk":"")+'" style="animation-delay:-'+f1(re_()*2)+'s;animation-duration:'+f1(.7+re_()*.9)+'s;transform-box:fill-box;transform-origin:center" cx="'+f1(sp2[0])+'" cy="'+f1(sp2[1])+'" r="1.6" fill="hsl(52 100% 80%)" opacity="'+(cls?0:.8)+'"/>';}
  }
  if(EL==="s"){
    elBack+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*1.8)+'" fill="url(#'+id+'e)"/>';
    var so="";for(ek=0;ek<6;ek++){var sa=ek/6*2*PI,sx2=cx+Math.cos(sa)*R*1.5,sy2=cy+Math.sin(sa)*R*.45,zs=2.4+(ek%3)*1.4;so+='<path d="M'+f1(sx2)+' '+f1(sy2-zs*1.6)+'Q'+f1(sx2)+' '+f1(sy2)+' '+f1(sx2+zs*1.6)+' '+f1(sy2)+'Q'+f1(sx2)+' '+f1(sy2)+' '+f1(sx2)+' '+f1(sy2+zs*1.6)+'Q'+f1(sx2)+' '+f1(sy2)+' '+f1(sx2-zs*1.6)+' '+f1(sy2)+'Q'+f1(sx2)+' '+f1(sy2)+' '+f1(sx2)+' '+f1(sy2-zs*1.6)+'Z" fill="hsl('+(250+ek*18)+' 100% 86%)"/>';}
    elFront+='<g class="spin" style="animation-duration:26s"><g transform="rotate(-18 '+cx+' '+cy+')"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+f1(R*1.5)+'" ry="'+f1(R*.45)+'" fill="none" stroke="rgba(200,180,255,.22)"/>'+so+'</g></g>';
    for(ek=0;ek<8;ek++){var tq=ax(re_()*2*PI,R*(.2+re_()*1.3));elFront+='<circle class="'+(cls?"twk":"")+'" style="animation-delay:-'+f1(re_()*3)+'s;animation-duration:'+f1(1.4+re_()*2)+'s;transform-box:fill-box;transform-origin:center" cx="'+f1(tq[0])+'" cy="'+f1(tq[1])+'" r="'+f1(.7+re_()*1.2)+'" fill="hsl('+(250+Math.floor(re_()*90))+' 100% 90%)" opacity="'+(cls?0:.8)+'"/>';}
    if(cls)elFront+='<path class="shoot" d="M'+(cx+R*1.5)+' '+(cy-R*1.4)+'l-26 12" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0"/>';
  }
  s+='<defs>'+PATDEF(G,id)+(c.el&&"its".indexOf(c.el)>=0?'<radialGradient id="'+id+'e"><stop offset="0" stop-color="hsl('+MD.EHUE[c.el]+' 100% 75%)" stop-opacity="0"/><stop offset=".55" stop-color="hsl('+MD.EHUE[c.el]+' 100% 75%)" stop-opacity=".2"/><stop offset="1" stop-color="hsl('+MD.EHUE[c.el]+' 100% 75%)" stop-opacity="0"/></radialGradient>':'')+'</defs>';
  s+='<g class="'+(c.el==="g"&&cls?"still":(cls||""))+(cls&&c===st&&hunger()<30?" weak":"")+'"><g class="'+(cls?"breathe":"")+'">';
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*1.9)+'" fill="url(#'+id+'a)"/>'+outer+elBack;
  var morph=cls&&!RM?'<animate attributeName="d" dur="'+(7+rb()*3).toFixed(1)+'s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.33;.66;1" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1" values="'+d+';'+blobD(1)+';'+blobD(-1)+';'+d+'"/>':"";
  var wat="";
  if(W){var rw=rngS(sd+9),bb="",cl="",j;
    for(j=0;j<5;j++){var ba=rw()*2*PI,bd=rw()*R*.55,bx=cx+Math.cos(ba)*bd,by=cy+Math.sin(ba)*bd+R*.1,br=1.4+rw()*2.4;
      bb+='<circle class="'+(cls?"bub":"")+'" style="animation-delay:-'+(rw()*6).toFixed(1)+'s;animation-duration:'+(5+rw()*4).toFixed(1)+'s" cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" r="'+br.toFixed(1)+'" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width=".8" opacity=".6"/>';}
    for(j=0;j<3;j++)cl+='<path class="'+(cls?"caus":"")+'" style="animation-delay:-'+(j*1.3)+'s" d="M'+(cx-R*.7)+' '+(cy-R*.1+j*R*.28)+'q'+(R*.35)+' '+(-R*.22)+' '+(R*.7)+' 0t'+(R*.7)+' 0" stroke="#fff" stroke-width="1" fill="none" opacity=".3"/>';
    wat='<clipPath id="'+id+'k"><path d="'+d+'">'+morph+'</path></clipPath><g clip-path="url(#'+id+'k)"><ellipse cx="'+cx+'" cy="'+(cy+R*.74)+'" rx="'+(R*.62)+'" ry="'+(R*.3)+'" fill="url(#'+id+'w)"/>'+cl+bb+'</g>';}
  s+='<path d="'+d+'" fill="url(#'+id+'b)" stroke="rgba(255,255,255,'+(W?.75:.55)+')" stroke-width="'+(W?1.6:1)+'">'+morph+'</path>'+wat+(G.s>0&&G.pat?'<clipPath id="'+id+'q"><path d="'+d+'">'+morph+'</path></clipPath><g clip-path="url(#'+id+'q)">'+PATTERN(G,{cx:cx,cy:cy,R:R,W:W,id:id})+'</g>':'');
  var ex=R*(G.ex*.9+.05),ey=cy+R*(.04+G.ey*.4),er=R*.17,fv=sd%10,single=fv===1||fv===5||fv===8,weak=cls&&c===st&&hunger()<30,ih=tot<.5?255:h,IC="hsl("+ih+" 95% 74%)",DK="#120d2e";
  var EP=single?[[cx,ey]]:[[cx-ex,ey],[cx+ex,ey]],eL=Math.min(1,parts[4]||0),zz=(single?er*1.55:er)*(.5+.5*eL);
  function eye(x,y,z){var o="",k;
    if(fv===0){o='<circle cx="'+x+'" cy="'+y+'" r="'+z+'" fill="'+DK+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.78)+'" fill="none" stroke="'+IC+'" stroke-width="'+(z*.18)+'"/><path d="M'+x+' '+(y-z*.36)+'L'+(x+z*.28)+' '+y+'L'+x+' '+(y+z*.36)+'L'+(x-z*.28)+' '+y+'Z" fill="'+IC+'"/><circle cx="'+(x+z*.56)+'" cy="'+(y-z*.54)+'" r="'+(z*.12)+'" fill="#fff"/>';}
    else if(fv===1){o='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(z*.7)+'" ry="'+(z*1.25)+'" fill="'+DK+'"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+(z*.9)+'" ry="'+(z*1.45)+'" fill="none" stroke="'+IC+'" stroke-width="1" opacity=".6"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+(z*.55)+'" ry="'+(z*.1)+'" fill="'+IC+'"/><circle cx="'+x+'" cy="'+(y-z*.62)+'" r="'+(z*.1)+'" fill="'+IC+'"/><circle cx="'+x+'" cy="'+(y+z*.62)+'" r="'+(z*.1)+'" fill="'+IC+'"/>';}
    else if(fv===2){o='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(z*.62)+'" ry="'+(z*1.7)+'" fill="'+DK+'"/>';for(k=0;k<3;k++)o+='<circle cx="'+x+'" cy="'+(y-z*1.0+k*z)+'" r="'+(z*(.42-.1*k))+'" fill="'+IC+'" opacity="'+(1-k*.2)+'"/>';}
    else if(fv===3){o='<path d="M'+x+' '+(y-z*1.3)+'L'+(x+z*.9)+' '+y+'L'+x+' '+(y+z*1.3)+'L'+(x-z*.9)+' '+y+'Z" fill="'+DK+'" stroke="'+IC+'" stroke-width="1"/><path d="M'+x+' '+(y-z*.8)+'V'+(y+z*.8)+'" stroke="'+IC+'" stroke-width="'+(z*.16)+'" stroke-linecap="round"/><circle cx="'+(x-z*.42)+'" cy="'+y+'" r="'+(z*.08)+'" fill="'+IC+'"/><circle cx="'+(x+z*.42)+'" cy="'+y+'" r="'+(z*.08)+'" fill="'+IC+'"/>';}
    else if(fv===4){var d="M"+x+" "+y;for(k=1;k<=26;k++){d+="L"+(x+Math.cos(k*.6)*z*.85*k/26).toFixed(1)+" "+(y+Math.sin(k*.6)*z*.85*k/26).toFixed(1);}o='<circle cx="'+x+'" cy="'+y+'" r="'+z+'" fill="'+DK+'"/><path d="'+d+'" stroke="'+IC+'" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.12)+'" fill="#fff"/>';}
    else if(fv===6){o='<circle cx="'+x+'" cy="'+y+'" r="'+z+'" fill="'+DK+'"/><path d="M'+(x+z*.15)+' '+(y-z*.78)+'A'+(z*.78)+' '+(z*.78)+' 0 1 0 '+(x+z*.15)+' '+(y+z*.78)+'A'+(z*.56)+' '+(z*.56)+' 0 1 1 '+(x+z*.15)+' '+(y-z*.78)+'Z" fill="'+IC+'"/><circle cx="'+(x+z*.5)+'" cy="'+(y-z*.45)+'" r="'+(z*.11)+'" fill="#fff"/>';}
    else if(fv===7){o='<circle cx="'+x+'" cy="'+y+'" r="'+z+'" fill="'+DK+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.8)+'" fill="none" stroke="'+IC+'" stroke-width="'+(z*.12)+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.5)+'" fill="none" stroke="'+IC+'" stroke-width="'+(z*.1)+'" opacity=".7"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.2)+'" fill="'+IC+'"/><circle cx="'+(x+z*.35)+'" cy="'+(y-z*.35)+'" r="'+(z*.1)+'" fill="#fff"/>';}
    else if(fv===8){o='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(z*1.05)+'" ry="'+(z*.78)+'" fill="'+DK+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.5)+'" fill="'+IC+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.22)+'" fill="'+DK+'"/><path d="M'+(x-z*1.05)+' '+y+'H'+(x-z*.6)+'M'+(x+z*.6)+' '+y+'H'+(x+z*1.05)+'" stroke="'+IC+'" stroke-width="1.2"/><circle cx="'+(x+z*.25)+'" cy="'+(y-z*.22)+'" r="'+(z*.1)+'" fill="#fff"/>';}
    else if(fv===9){o='<path d="M'+x+' '+(y-z*1.15)+'Q'+(x+z*1.05)+' '+(y+z*.1)+' '+x+' '+(y+z*.95)+'Q'+(x-z*1.05)+' '+(y+z*.1)+' '+x+' '+(y-z*1.15)+'Z" fill="'+DK+'"/><circle cx="'+x+'" cy="'+(y+z*.15)+'" r="'+(z*.45)+'" fill="'+IC+'"/><path d="M'+(x-z*.18)+' '+(y-z*.1)+'h'+(z*.36)+'M'+x+' '+(y-z*.28)+'v'+(z*.36)+'" stroke="#fff" stroke-width="'+(z*.1)+'" stroke-linecap="round"/>';}
    else{for(k=0;k<6;k++)o+='<ellipse cx="'+x+'" cy="'+(y-z*.55)+'" rx="'+(z*.2)+'" ry="'+(z*.6)+'" transform="rotate('+(k*60)+' '+x+' '+y+')" fill="'+IC+'" opacity=".85"/>';o+='<circle cx="'+x+'" cy="'+y+'" r="'+(z*.38)+'" fill="'+DK+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(z*.12)+'" fill="#fff"/>';}
    return o;}
  function sl(x){return '<path d="M'+(x-er*1.1)+' '+ey+'q'+(er*1.1)+' '+(er*.8)+' '+(er*2.2)+' 0" stroke="'+IC+'" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';}
  var halo="",hap="",es="",sls="";
  EP.forEach(function(q){halo+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(zz*1.7)+'" fill="'+IC+'" opacity=".16"/>';hap+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(zz*2.2)+'" fill="'+IC+'" opacity=".3"/>';es+=eye(q[0],q[1],zz);sls+=sl(q[0]);});
  var face=eL<=VIS?"":'<g class="'+(cls?"look":"")+'">'+(weak?'<g>'+sls+'</g>':'<g class="'+(cls?"opn":"")+'" style="transform-origin:'+cx+'px '+ey+'px">'+halo+es+'</g><g class="hap">'+hap+'</g>')+'</g>';
  var HL=W?(function(){var a1=PI*1.1,a2=PI*1.45,a3=PI*.12,a4=PI*.36,rr=R*.82;
    function q(a,r){return (cx+Math.cos(a)*r).toFixed(1)+" "+(cy+Math.sin(a)*r).toFixed(1);}
    return '<path d="M'+q(a1,rr)+'A'+rr+' '+rr+' 0 0 1 '+q(a2,rr)+'" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".85"/><path d="M'+q(a3,R*.86)+'A'+(R*.86)+' '+(R*.86)+' 0 0 1 '+q(a4,R*.86)+'" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".45"/><circle cx="'+(cx+R*.5)+'" cy="'+(cy-R*.5)+'" r="1.8" fill="#fff" opacity=".85"/>';})():'<ellipse cx="'+(cx-R*.25)+'" cy="'+(cy-R*.5)+'" rx="'+(R*.3)+'" ry="'+(R*.13)+'" transform="rotate(-28 '+(cx-R*.25)+' '+(cy-R*.5)+')" fill="#fff" opacity=".4"/>';
  var sp="",rk=rngS(sd+5);for(var i=0;i<7;i++){var a=rk()*2*PI,dd=rk()*R*.7;sp+=dt(a,dd,.8+rk()*1.6,"#fff",.22+rk()*.2);}
  s+=sp+'<circle class="'+(cls?"heart":"")+'" style="transform-origin:'+cx+'px '+(cy-1)+'px" cx="'+cx+'" cy="'+(cy-1)+'" r="'+(R*.5)+'" fill="url(#'+id+'c)" opacity="'+(W?.4:.8)+'"/>'+inner+elFront+face+HL;
  s+='</g></g>';
  window.__pi={dom:dom,G:G,mirN:mirN,shN:shN,n:vis(c).length};
  return '<svg class="pet" viewBox="0 0 200 200" role="img" aria-label="未知の生命体">'+s+'</svg>';
}

var $=function(i){return document.getElementById(i);};
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function pick(sz,p){var d=el("div");d.innerHTML=petSVG(p,"float");d.firstChild.style.width=sz+"px";return d;}
var sayT=null;
function say(m){var e=$("say");clearInterval(sayT);if(RM||m.length<3){e.textContent=m;return;}var i=0;e.textContent="";sayT=setInterval(function(){i++;e.textContent=m.slice(0,i);if(i>=m.length)clearInterval(sayT);},26);}
function identOf(c){var pi=window.__pi;return IDENT(c,pi.dom,pi.G,pi.n,pi.mirN,pi.shN);}
function starStr(n){var o="";for(var i=0;i<5;i++)o+=i<n?"★":"☆";return o;}
function petCenter(){var sv=$("pet").firstChild,bx=$("petbox");if(!sv)return [100,100,40];var b=bx.getBoundingClientRect(),r=sv.getBoundingClientRect(),sc=r.width/200;return [r.left-b.left+r.width/2,r.top-b.top+r.height*.54,(33+Math.min(st.xp,500)/500*20)*sc];}
function elHue(){return st.el?MD.EHUE[st.el]:(window.__pi?TH[window.__pi.dom]:330);}
function inBox(id){return st.box.some(function(b){return b.id===id;});}
function topNames(c,k){return vis(c).sort(function(a,b){return c.parts[b]-c.parts[a];}).slice(0,k).map(function(i){return PARTS[i][0];});}

// ---- 進化の演出 ----
function playEvo(){
  var e=st.evo;st.evo=null;
  if(!e||(!e.nw.length&&!e.el&&!e.up)){save();return;}
  var sub=e.nw.length?"新しい器官: "+e.nw.slice(0,3).join("、"):(e.el?"":"");
  var title=e.up?STG[e.up]+"になった!":(e.nw.length?e.nw[0]+"が生まれた":EN[e.el]+"の気配をまとった");
  if(e.up&&e.el)sub=EN[e.el]+"の気配をまとった。"+sub;
  FX.evo({kicker:e.up?"ステージアップ!":(e.el&&!e.nw.length?"めざめ":"しんか!"),title:title,sub:sub,hue:elHue()},function(){renderPet();});
  save();
}
// ---- 今週の子 ----
var cool=false,qsig="";
function renderPet(){
  $("pet").innerHTML=petSVG(st,"float");
  var idn=identOf(st);FX.setEl(st.el);
  $("ttl").innerHTML=stageOf(st)===0?'<span class="tn">まだ名もない球体</span>':'<span class="tn">'+idn.name+'</span><span class="ts" title="めずらしさ">'+starStr(idn.stars)+'</span><span class="tc">No.'+idn.code+'</span>';
  $("info").textContent=(dayIdx()+1)+"日目 / 7 ・ "+STG[stageOf(st)]+" ・ 器官 "+vis(st).length+" ・ 性質 "+((st.act||[]).length)+"/3"+(st.el?" ・ "+EN[st.el]+"属性":"");
  $("hb").style.width=hunger()+"%";
  var f=$("foods");if(!f.children.length)FOODS.forEach(function(x,i){var b=el("button","ch",x.n);b.dataset.i=i;b.insertBefore(el("i","fi "+x.k),b.firstChild);b.title=x.n+"(おもに"+({sen:"感知",flo:"流動",cry:"集積",spl:"分裂",res:"共鳴"})[x.t]+"がかたむく)";f.appendChild(b);});
  Array.prototype.forEach.call(f.children,function(b){b.disabled=cool;});
  $("sv").textContent=inBox(st.day)?"保存を更新する":"この子をとっておく";
  renderDex();
}
function openQ(){
  var hr=new Date().getHours(),di=dayIdx();
  for(var s=0;s<2;s++){var qi=di*2+s;if(st.ans[qi]==null&&hr>=(s?19:6))return qi;}
  return -1;
}
function renderQ(force){
  var oi=openQ(),sg=oi+"|"+nAns()+"|"+dayIdx();
  if(!force&&sg===qsig)return;qsig=sg;
  var di=dayIdx(),h='<div class="tl">';
  for(var i=0;i<7;i++){h+='<div class="'+(i===di?"today":"")+'">'+DN[i]+'<br>';
    for(var s=0;s<2;s++){var qi=i*2+s,c=st.ans[qi]!=null?"ok":(qi===oi?"now":(i<di?"miss":""));h+='<i class="'+c+'"></i>';}
    h+='</div>';}
  h+='</div>';
  if(oi>=0){h+='<h2>'+(oi%2?"夜":"朝")+'の質問 ・ '+Q[oi].q+'</h2><div class="row">';Q[oi].o.forEach(function(o,i){h+='<button class="ch" data-i="'+i+'">'+o[0]+'</button>';});
    h+='</div><p class="sub">何が起きるかは、明日の朝までわかんない。</p>';}
  else{var hr=new Date().getHours();
    if(hr<6)h+='<h2>次の質問まで</h2><p class="sub" style="margin:0">6:00ごろ、朝の質問が来るよ。</p>';
    else if(st.ans[di*2]==null||st.ans[di*2+1]==null)h+='<h2>次の質問まで</h2><p class="sub" style="margin:0">19:00ごろ、夜の質問が来るよ。</p>';
    else h+='<h2>今日の質問はおしまい!</h2><p class="sub" style="margin:0">'+(di===6?"明日、完成した子が「さいきんの子」に入るよ。":"今日の答えとごはんの影響は、明日の朝に姿に出るよ。")+'</p>';}
  $("q").innerHTML=h;
}
function renderLog(){
  var u=$("log");u.innerHTML="";
  st.log.slice().reverse().slice(0,8).forEach(function(l){var li=el("li");li.appendChild(el("span","",DN[l.d]+(l.s?" 夜":" 朝")));li.appendChild(document.createTextNode(l.t));u.appendChild(li);});
  $("lnote").textContent=st.log.length?"":"質問に答えると、この子の気配がここに残るよ。";
}
$("q").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;
  var qi=openQ();if(qi<0)return;var i=+b.dataset.i,t=Q[qi].o[i][1],isEl=t.indexOf("el:")===0,tx=isEl?EOMEN[t.slice(3)][qi%2]:OMEN[t][qi%6];
  st.ans[qi]=i;if(isEl)st.pendEl=t.slice(3);else st.pend[t]=(st.pend[t]||0)+1;st.xp+=10;if(INSTANT){applyPending();setTimeout(playEvo,300);}
  st.log.push({d:Math.floor(qi/2),s:qi%2,t:tx});st.log=st.log.slice(-20);
  say(tx+(INSTANT?" "+st.news:""));save();renderQ(true);renderPet();renderLog();
});
$("foods").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b||cool)return;var f=FOODS[+b.dataset.i],h=hunger(),x0=st.xp;
  st.hg=Math.min(100,h+30);st.at=Date.now();st.xp+=h<40?14:h<75?9:3;st.pend[f.t]=(st.pend[f.t]||0)+(INSTANT?1:.5);if(INSTANT)applyPending();
  say((h>=90?"いまはおなかいっぱい!":f.n+"をあげた!"+f.m)+(INSTANT?" "+st.news:""));eat(f,st.xp-x0);
  cool=true;setTimeout(function(){cool=false;renderPet();},3000);
  save();renderPet();
});
function pokeSvg(){var sv=$("pet").firstChild;if(!sv)return false;sv.classList.remove("poke");void sv.getBoundingClientRect();sv.classList.add("poke");
  sv.addEventListener("animationend",function f(e){if(e.animationName==="poke"){sv.classList.remove("poke");sv.removeEventListener("animationend",f);}});return true;}
function absorbSvg(col){var sv=$("pet").firstChild;if(!sv)return;sv.style.setProperty("--gc",col);sv.classList.remove("absorb");void sv.getBoundingClientRect();sv.classList.add("absorb");
  sv.addEventListener("animationend",function f(e){if(e.animationName==="absorb"){sv.classList.remove("absorb");sv.removeEventListener("animationend",f);}});}
function eat(f,gain){var fh=+f.col.match(/hsl\((\d+)/)[1];fx(f.k);FX.vib(12);
  setTimeout(function(){absorbSvg(f.col);var c=petCenter();FX.shock(fh,2);FX.burst(c[0],c[1],fh,22,3);FX.flash(fh);FX.pop($("petbox"),"+"+gain,"hsl("+fh+" 100% 80%)");$("hb").classList.add("glow");setTimeout(function(){$("hb").classList.remove("glow");},900);},RM?0:f.at);}
function fx(k){
  var sv=$("pet").firstChild,bx=$("petbox");if(!sv||RM)return;
  if("pmdh".indexOf(k)>=0)return FX.food(k,sv,bx,st.xp);
  var b=bx.getBoundingClientRect(),r=sv.getBoundingClientRect(),W=b.width,H=b.height,sc=r.width/200,
    cx=r.left-b.left+r.width/2,cy=r.top-b.top+r.height*.54,BR=(33+Math.min(st.xp,500)/500*20)*sc,S=Math.min(W,H)*.46;
  var cv=document.createElement("canvas"),dp=window.devicePixelRatio||1;
  cv.width=W*dp;cv.height=H*dp;cv.style.cssText="position:absolute;left:0;top:0;width:"+W+"px;height:"+H+"px;pointer-events:none;z-index:5";
  bx.appendChild(cv);var g=cv.getContext("2d");g.scale(dp,dp);
  var rnd=rngS(Math.floor(Math.random()*1e9)),P=[],N=k==="s"?22:k==="l"?30:k==="c"?7:1,DUR=2.1,i;
  function hs(h,s,l,a){return "hsla("+h+","+s+"%,"+l+"%,"+a+")";}
  function soft(x,y,rad,h,s,l,a){var gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,hs(h,s,l,a));gr.addColorStop(1,hs(h,s,l,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,2*PI);g.fill();}
  function star(x,y,z,a,h){g.strokeStyle=hs(h,100,92,a);g.lineWidth=1.3;g.beginPath();g.moveTo(x-z,y);g.lineTo(x+z,y);g.moveTo(x,y-z);g.lineTo(x,y+z);g.stroke();soft(x,y,z*.7,h,100,90,a*.6);}
  function ring(x,y,rx,ry,h,s,l,a,lw){g.strokeStyle=hs(h,s,l,a);g.lineWidth=lw;g.beginPath();g.ellipse(x,y,rx,ry,0,0,2*PI);g.stroke();}
  for(i=0;i<N;i++)P.push({a:rnd()*2*PI,d:.55+rnd()*.45,del:rnd()*.5,du:.8+rnd()*.3,h:rnd(),w:rnd()-.5});
  function lp(p,u){var e=u*u,rr=S*p.d*(1-e),aa=p.a+(1-e)*2.4;return [cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr*.9];}
  function sp(p,u){var e=u*u,rr=S*p.d*(1-e),aa=p.a+Math.sin(u*5+p.h*6)*.5+(1-e)*1.2;return [cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr*.9];}
  var t0=null;
  function frame(now){
    if(t0===null)t0=now;var t=(now-t0)/1000,i,p,u,q,a,x,y;g.clearRect(0,0,W,H);
    if(k==="l"){g.globalCompositeOperation="lighter";
      for(i=0;i<N;i++){p=P[i];u=(t-p.del)/p.du;if(u<0||u>1)continue;
        var c1=lp(p,u),c0=lp(p,Math.max(0,u-.08));g.strokeStyle=hs(46,100,80,.3);g.lineWidth=1.2;g.beginPath();g.moveTo(c0[0],c0[1]);g.lineTo(c1[0],c1[1]);g.stroke();
        soft(c1[0],c1[1],3+4*(1-u),38+p.h*22,100,80,Math.min(1,u*4)*.95);}
      q=(t-.95)/.8;if(q>0&&q<1){ring(cx,cy,BR*(1+.7*q),BR*(1+.7*q)*.97,46,100,82,.8*(1-q),2*(1-q)+.5);soft(cx,cy,BR*(.5+.7*q),46,100,86,.35*(1-q));}
    }else if(k==="c"){g.globalCompositeOperation="lighter";
      for(i=0;i<N;i++){p=P[i];var del=i*.09,ang=-PI/2+p.w*1.5,tx=cx+Math.cos(ang)*BR,ty=cy+Math.sin(ang)*BR*.97,sx=cx+p.w*S*1.3,sy=cy-S;
        u=(t-del)/.65;
        if(u>0&&u<1){x=sx+(tx-sx)*u+Math.sin(u*PI)*p.w*40;y=sy+(ty-sy)*u*u*u;soft(x,y,11,200,100,85,.35);
          g.save();g.translate(x,y);g.rotate(u*8*p.w+p.a);g.beginPath();g.moveTo(0,-8);g.lineTo(4,0);g.lineTo(0,8);g.lineTo(-4,0);g.closePath();g.fillStyle=hs(330,80,93,.95);g.fill();g.strokeStyle=hs(190,95,85,.9);g.lineWidth=1;g.stroke();g.restore();}
        q=(t-del-.65)/.55;
        if(q>=0&&q<1){star(tx,ty,11*(1-q*.4),1-q,330);g.fillStyle=hs(200,90,92,1-q);for(var j=0;j<5;j++){g.beginPath();g.arc(tx+Math.cos(j*1.26+p.a)*q*20,ty+Math.sin(j*1.26+p.a)*q*20,1.7,0,2*PI);g.fill();}}}
      q=(t-1.2)/.8;if(q>0&&q<1){var sn=Math.sin(q*PI);for(i=0;i<10;i++){a=i*PI/5+.3;star(cx+Math.cos(a)*BR*1.2,cy+Math.sin(a)*BR*1.18,3+5*sn,sn*((i+Math.floor(q*6))%2?.9:.4),i%2?330:190);}}
    }else if(k==="w"){g.globalCompositeOperation="lighter";
      var ty2=cy-BR*.97;u=t/.75;
      if(u>0&&u<1){x=cx;y=cy-S+(ty2-(cy-S))*u*u;g.beginPath();g.moveTo(x,y-10);g.bezierCurveTo(x+7,y-1,x+7,y+7,x,y+7);g.bezierCurveTo(x-7,y+7,x-7,y-1,x,y-10);g.fillStyle=hs(205,90,76,.92);g.fill();soft(x-2,y,3,0,0,100,.8);}
      for(i=0;i<3;i++){q=(t-.75-i*.16)/.85;if(q>0&&q<1){var rw=BR*(.3+1.05*q);ring(cx,cy-BR*.5,rw,rw*.34,200,90,82,.8*(1-q),2*(1-q)+.5);}}
      q=(t-.75)/.8;if(q>0&&q<1){g.fillStyle=hs(205,90,84,1-q);for(i=0;i<9;i++){a=(i-4)*.3;g.beginPath();g.arc(cx+Math.sin(a)*70*q,ty2-Math.cos(a)*55*q+85*q*q,2.4*(1-q*.5),0,2*PI);g.fill();}}
    }else{
      for(i=0;i<N;i++){p=P[i];u=(t-p.del)/(p.du+.2);if(u<0||u>1)continue;var c2=sp(p,u),al=Math.min(1,u*4);
        g.globalCompositeOperation="source-over";soft(c2[0],c2[1],8+7*(1-u),268,55,26,.55*al);
        g.globalCompositeOperation="lighter";soft(c2[0],c2[1],5+3*(1-u),320,90,70,.22*al);}
      g.globalCompositeOperation="lighter";q=(t-1)/.85;
      if(q>0&&q<1){ring(cx,cy,BR*(1+.5*q),BR*(1+.5*q)*.97,280,70,60,(1-q)*.7,3*(1-q)+.5);ring(cx,cy,BR*(1.15+.6*q),BR*(1.15+.6*q)*.97,320,90,75,(1-q)*.5,2*(1-q)+.4);}
    }
    if(t<DUR)requestAnimationFrame(frame);else cv.remove();
  }
  requestAnimationFrame(frame);
}
var POKE=["びくっと縮こまった。","触ったほうに、ゆっくり向いた。","光がぷるっとふるえた。","表面がさざ波みたいにゆれた。","器官がちょっと動いた。"],lp=0;
$("pet").addEventListener("click",function(e){if(!pokeSvg())return;var bb=$("petbox").getBoundingClientRect();FX.burst(e.clientX-bb.left,e.clientY-bb.top,elHue(),9,2);FX.vib(8);if(Date.now()-lp>1500){lp=Date.now();say(POKE[Math.floor(Math.random()*POKE.length)]);}});
var AMB=["ゆっくり息してる。","表面がふわっと波うった。","中の光がとくとく脈うってる。","じーっとこっちを感じてる。","ちょっとだけ浮いた。","形をたしかめるようにゆれてる。"];
function amb(){var v=vis(st),a;if(hunger()<30)a="動きがにぶくなってる…。";else if(!v.length||Math.random()<.4)a=AMB[Math.floor(Math.random()*AMB.length)];else a=PARTS[v[Math.floor(Math.random()*v.length)]][0]+"がちょっと動いた。";$("amb").textContent=a;}
amb();setInterval(amb,11000);
function lkTxt(){$("lk").textContent=LOOK==="w"?"見た目: 水(タップで切替)":"見た目: ふつう(タップで切替)";}
lkTxt();
$("lk").addEventListener("click",function(){LOOK=LOOK==="w"?"n":"w";try{localStorage.setItem("maru-look",LOOK);}catch(e){}lkTxt();renderPet();sig="";renderBoxes();drawRank(PL.slice());});
$("nm").addEventListener("input",function(e){st.name=e.target.value;save();});
var rt=null;
$("rs").addEventListener("click",function(){
  var b=$("rs");
  if(!rt){b.textContent="ほんとに戻す?(もう一回タップ)";rt=setTimeout(function(){rt=null;b.textContent="今週の子をやり直す";},4000);return;}
  clearTimeout(rt);rt=null;b.textContent="今週の子をやり直す";
  st=fresh(weekKey(),st.hist,st.box);sel=null;sig="";$("nm").value="";
  say("まっしろな球体から、やり直し!");save();renderQ(true);renderPet();renderLog();
});
$("sv").addEventListener("click",function(){
  var it=JSON.parse(JSON.stringify(snap(st))),k=-1;
  st.box.forEach(function(b,i){if(b.id===it.id)k=i;});
  if(k>=0)st.box[k]=it;else st.box.push(it);
  st.box=st.box.slice(-60);say("この姿、とっておいたよ。");save();renderPet();renderBoxes();
});

// ---- とっておく場所 ----
function card(p,ops){
  var c=el("div","bx");c.appendChild(pick(100,p));var idn=identOf(p);
  c.appendChild(el("div","",p.name||"名もなき子"));if(stageOf(p)>0)c.appendChild(el("small","tg",idn.name+" "+starStr(idn.stars)));
  c.appendChild(el("small","",dlabel(p.day)+" ・ "+STG[stageOf(p)]+" ・ 器官 "+vis(p).length));
  var o=el("div","ops");ops.forEach(function(x){var b=el("button","ch sm",x[0]);b.disabled=!!x[2];b.onclick=x[1];o.appendChild(b);});
  c.appendChild(o);return c;
}
function renderBoxes(){
  var bx=$("box"),hs_=$("hist");bx.innerHTML="";hs_.innerHTML="";
  st.box.slice().reverse().forEach(function(p){
    bx.appendChild(card(p,[["手放す",function(){st.box=st.box.filter(function(b){return b.id!==p.id;});save();renderBoxes();renderPet();}]]));});
  $("bnote").textContent=st.box.length?"":"まだ空っぽ。気に入った子を「とっておく」と、ここに入るよ。";
  st.hist.slice().reverse().forEach(function(p){
    hs_.appendChild(card(p,[[inBox(p.id)?"保存済み":"とっておく",function(){st.box.push(snap(p));st.box=st.box.slice(-60);save();renderBoxes();renderPet();},inBox(p.id)]]));});
}

// ---- 広場・比較・観察 ----
var PL=[],sel=null,sig="";
function hs(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function drawPlaza(){
  var g=$("plaza"),s=JSON.stringify(PL.map(function(p){return [p.id,p.xp,p.parts,p.name,sel,p.seed];}));
  if(s===sig)return;sig=s;g.innerHTML="";
  var pos=PL.map(function(p){var h=hs(p.id||"me");return {x:10+h%80,y:2+(h>>>8)%52};});
  PL.forEach(function(p,i){
    var near=pos.some(function(q,j){return j!==i&&Math.abs(q.x-pos[i].x)<20&&Math.abs(q.y-pos[i].y)<26;});
    var b=el("button","pz"+(p.me?" me":"")+(sel===p.id?" on":"")+(near?" near":""));
    b.style.left=pos[i].x+"%";b.style.bottom=pos[i].y+"px";b.style.zIndex=100-pos[i].y;
    var w=el("div","wd");w.style.animationDuration=(8+pos[i].x%7)+"s";w.style.animationDelay="-"+(pos[i].x%9)+"s";
    w.appendChild(pick(Math.round(96-pos[i].y*.7),p));b.appendChild(w);
    b.appendChild(el("small","",(p.name||"名もなき子")+(p.me?"(あなた)":"")));
    b.onclick=function(){sel=p.id;sig="";drawPlaza();drawCompare();};
    g.appendChild(b);});
}
function drawCompare(){
  var c=$("cmp"),me=null,o=null;
  PL.forEach(function(p){if(p.me)me=p;if(p.id===sel)o=p;});
  if(!o||!me){c.style.display="none";return;}
  c.style.display="block";c.innerHTML="";
  if(o.me){c.appendChild(el("p","sub","これは自分の子だよ。ほかの子を選ぶと見比べられる。"));return;}
  var g=el("div","cg");g.appendChild(el("span"));
  [me,o].forEach(function(p){var d=el("div");d.appendChild(pick(96,p));d.appendChild(el("div","",(p.name||"名もなき子")+(p.me?"(あなた)":"")));g.appendChild(d);});
  var a=vis(me),b=vis(o);
  function row(k,x,y,same){g.appendChild(el("span","k",k));g.appendChild(el("span",same?"same":"",x));g.appendChild(el("span",same?"same":"",y));}
  var i1=(petSVG(me),identOf(me)),i2=(petSVG(o),identOf(o));row("種類",stageOf(me)?i1.name:"球体",stageOf(o)?i2.name:"球体",false);
  row("属性",EN[me.el]||"まだ無い",EN[o.el]||"まだ無い",!!me.el&&me.el===o.el);
  row("段階",STG[stageOf(me)],STG[stageOf(o)],stageOf(me)===stageOf(o));
  row("器官",a.length+"個",b.length+"個",a.length===b.length);
  row("主な器官",topNames(me,2).join("・")||"まだ無い",topNames(o,2).join("・")||"まだ無い",false);
  c.appendChild(g);
  var sh=a.filter(function(i){return b.indexOf(i)>=0;}).map(function(i){return PARTS[i][0];});
  c.appendChild(el("p","sub",sh.length?"同じ器官: "+sh.join("、")+"!":"同じ器官はまだなし。同じスタートから、ちがう姿に!"));
}
function renderDex(){
  var seen={},els={},all=[st].concat(st.hist||[],st.box||[]);
  all.forEach(function(c){vis(c).forEach(function(i){seen[i]=1;});if(c.el)els[c.el]=1;});
  var n=Object.keys(seen).length,g=$("dex");g.innerHTML="";
  PARTS.forEach(function(p,i){var d=el("div","dx t-"+p[2]+(seen[i]?" on":""),seen[i]?p[0]:"???");d.title=seen[i]?p[1]:"まだ出会っていない器官";g.appendChild(d);});
  $("dexn").textContent="器官 "+n+" / "+PARTS.length+" ・ 属性 "+Object.keys(els).length+" / 6";
  var e=$("dexe");e.innerHTML="";Object.keys(EN).forEach(function(k){e.appendChild(el("span","de e-"+k+(els[k]?" on":""),els[k]?EN[k]:"?"));});
}
function score(p){return vis(p).length*50+(p.xp||0);}
function drawRank(list){
  PL=list;drawPlaza();drawCompare();
  var ol=$("rank");ol.innerHTML="";
  list.forEach(function(p,i){
    var li=el("li",(p.me?"me":"")+(i<3?" g"+(i+1):""));li.style.cursor="pointer";li.onclick=function(){sel=p.id;sig="";drawPlaza();drawCompare();};
    li.appendChild(el("span","n",i+1));
    var ic=el("span");ic.innerHTML=petSVG(p).replace('viewBox="0 0 200 200"','viewBox="25 25 150 160"');li.appendChild(ic);
    var t=el("span","t",(p.name||"名もなき子")+(p.me?"(あなた)":""));t.appendChild(el("small","",STG[stageOf(p)]+" ・ 器官 "+vis(p).length));li.appendChild(t);
    ol.appendChild(li);});
  $("rnote").textContent=list.length<2?"このリンクを友達に送ると、ここに並ぶよ。":"";
}
var db=null,myId=null,timer=null,remote=false;
function me(){var o=snap(st);o.me=true;o.id=myId||"me";return o;}
function refreshLocal(){if(!remote)drawRank([me()]);}
function queueSync(){
  refreshLocal();
  if(!db||!myId)return;clearTimeout(timer);
  timer=setTimeout(function(){
    var o=snap(st);delete o.id;o.name=st.name||"名もなき子";o.at=Date.now();
    db.collection("players").doc(myId).set(o).catch(function(){});
    db.collection("data/users/"+myId).doc("box").set({items:st.box}).catch(function(){});
  },1500);
}

// ---- 起動 ----
$("nm").value=st.name;
if(first==="week")say("新しい1週間!まだ何者でもない、まるい子がぷかぷかしてる。");
else if(first==="day")say("夜のあいだに、変わったみたい。"+st.news);
else say(!hasShape()?"まだ何者でもない、まるい子がぷかぷかしてる。":(hunger()<15?"動きがゆっくりになってる…おなかすいたかも。":st.news));
if(first)save();
setInterval(function(){
  var r=tick();
  if(r){qsig="";$("nm").value=st.name;say(r==="week"?"新しい1週間!まだ何者でもない、まるい子がぷかぷかしてる。":"夜のあいだに、変わったみたい。"+st.news);save();renderQ(true);renderPet();renderLog();renderBoxes();sel=null;sig="";}
  else{renderQ();$("hb").style.width=hunger()+"%";}
},30000);
renderPet();renderQ(true);renderLog();renderBoxes();renderDex();FX.bg();
FX.setupAmb($("petbox"),petCenter);
if(st.evo)setTimeout(playEvo,INSTANT?200:900);
$("rnote").textContent="友達から送られたリンクを開くと、くらべられるよ。";
refreshLocal();
(async function(){
  try{
    var u=await claude.use("user"),d=await claude.use("db");
    if(!u||!d)return;myId=await u.id();if(!myId)return;db=d;remote=true;
    db.collection("data/users/"+myId).doc("box").get().then(function(s){
      if(!s.exists)return;var items=(s.data().items)||[],ch=false;
      items.forEach(function(it){if(it&&it.id&&it.parts&&!inBox(it.id)){st.box.push(it);ch=true;}});
      if(ch){st.box=st.box.slice(-60);save();renderBoxes();renderPet();}
    }).catch(function(){});
    queueSync();
    var to=setTimeout(function(){remote=false;refreshLocal();$("rnote").textContent="読み込めなかった…。";},10000);
    db.collection("players").orderBy("xp","desc").limit(40).onSnapshot(function(s){
      clearTimeout(to);var w=weekKey();
      var l=s.docs.map(function(d){var p=d.data();p.me=d.id===myId;p.id=d.id;return p;}).filter(function(p){return p.day===w&&p.parts&&p.seed;});
      if(!l.some(function(p){return p.me;}))l.push(me());
      l.sort(function(a,b){return score(b)-score(a);});drawRank(l);
    },function(){clearTimeout(to);});
  }catch(e){}
})();
})();
