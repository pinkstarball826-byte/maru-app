// 描画の部品: 追加30器官 / 体の形・模様の「遺伝子」 / 名前と希少度。
(function(){
var PI=Math.PI;
function rngS(n){var a=n>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
function f1(v){return (+v).toFixed(1);}

// ---- 追加の器官(30〜59番) ----
window.ORG2=function(H){
  var R=H.R,cx=H.cx,cy=H.cy,pt=H.pt,ln=H.ln,dt=H.dt,cu=H.cu,AC=H.AC,ST=H.ST,GL=H.GL;
  function J(p){return p[0]+" "+p[1];}
  function path(d,f,s,w,o){return '<path d="'+d+'" fill="'+(f||"none")+'" stroke="'+(s||"none")+'" stroke-width="'+(w||1)+'"'+(o!=null?' opacity="'+o+'"':"")+' stroke-linecap="round" stroke-linejoin="round"/>';}
  function tri(a,wd,d0,d1,f,s){return path("M"+J(pt(a-wd,d0))+"L"+J(pt(a,d1))+"L"+J(pt(a+wd,d0))+"Z",f,s||ST,.8);}
  return [
  // 30 触角扇
  function(L,A){var o="";for(var i=0;i<5;i++){var a=A+(i-2)*.22,l=R+(12+9*(2-Math.abs(i-2)))*L;o+=ln(a,R*.95,l,1.3,ST)+dt(a,l,1.1+1.5*L,AC("sen",84));}return o;},
  // 31 感覚斑点
  function(L,A,r){var o="";for(var i=0;i<8;i++){var a=A+r()*1.8-.9,d=R*(.2+r()*.55);o+=dt(a,d,.7+r()*2.2*L,AC("sen",86),.85);}return '<g class="pulse">'+o+'</g>';},
  // 32 集音耳
  function(L,A){var o="";[-.38,.38].forEach(function(k){var p=pt(A+k,R*.96),q=pt(A+k*1.45,R+22*L),m=pt(A+k*2.1,R+9*L),n=pt(A+k*.55,R+13*L);o+=path("M"+J(p)+"Q"+J(m)+" "+J(q)+"Q"+J(n)+" "+J(p)+"Z",GL,ST,1);});return o;},
  // 33 受光花
  function(L,A){var t=pt(A,R+22*L),o=ln(A,R*.95,R+22*L,1.5,ST);for(var i=0;i<6;i++){var a=i*PI/3,x=t[0]+Math.cos(a)*(3+3*L),y=t[1]+Math.sin(a)*(3+3*L);o+='<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f1(2+2*L)+'" ry="'+f1(1.2+L)+'" transform="rotate('+Math.round(a*57.3)+' '+f1(x)+' '+f1(y)+')" fill="'+AC("sen",86)+'" opacity=".85"/>';}return o+'<circle cx="'+t[0]+'" cy="'+t[1]+'" r="'+f1(1.6+L)+'" fill="#fff"/>';},
  // 34 気配ひげ
  function(L,A){var o="";for(var i=0;i<3;i++)o+=cu(A+(i-1)*.18,R*.95,R+(26+i*6)*L,(i-1)*.8,1,"rgba(255,255,255,.65)");return o;},
  // 35 透視窓
  function(L,A){var p=pt(A,R*.35);return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(R*.24*L+4)+'" fill="rgba(255,255,255,.12)" stroke="'+AC("sen",85)+'" stroke-width="1.2"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(R*.12*L+2)+'" fill="none" stroke="'+ST+'" stroke-width=".8" stroke-dasharray="2 2"/>';},
  // 36 長尾びれ
  function(L,A){var p=pt(A,R*.95),m=pt(A+.5,R+30*L),q=pt(A-.3,R+58*L),n=pt(A-.45,R+24*L);return path("M"+J(p)+"Q"+J(m)+" "+J(q)+"Q"+J(n)+" "+J(p)+"Z","hsla(205,90%,85%,.35)",ST,1)+path("M"+J(p)+"Q"+J(pt(A,R+28*L))+" "+J(q),null,"rgba(255,255,255,.4)",.8);},
  // 37 波打つひれ
  function(L,A){var o="";for(var i=0;i<7;i++){var a=A-.6+i*.2;o+=tri(a+.1,.1,R*.98,R+(7+(i%2)*6)*L,"hsla(200,90%,88%,.3)");}return o;},
  // 38 触手房
  function(L,A){var o="";for(var i=0;i<5;i++)o+=cu(A+(i-2)*.14,R*.95,R+(20+i%3*8)*L,(i%2?.9:-.9)*(.6+i*.1),1.6,"rgba(255,255,255,.55)")+dt(A+(i-2)*.14+(i%2?.9:-.9)*.5,R+(18+i%3*8)*L,1.5,"hsl(200 90% 88%)",.8);return o;},
  // 39 水泡冠
  function(L,A){var o="";for(var i=0;i<6;i++){var a=A+(i-2.5)*.16,d=R+(3+(i%3)*4)*L,p=pt(a,d);o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(2+(i%3)*1.4*L+L)+'" fill="rgba(255,255,255,.16)" stroke="'+ST+'" stroke-width=".8"/>';}return o;},
  // 40 流線紋
  function(L,A){var o="";for(var i=0;i<4;i++){var a=A+(i-1.5)*.3;o+='<path d="M'+J(pt(a-.5,R*.2))+"Q"+J(pt(a,R*.75))+" "+J(pt(a+.4,R*.92))+'" stroke="'+AC("flo",72)+'" stroke-width="1" fill="none" opacity="'+f1(.25+.5*L)+'"/>';}return o;},
  // 41 薄翅
  function(L,A){var o="";[-.28,.28].forEach(function(k){var p=pt(A+k*.4,R*.92),q=pt(A+k*2.2,R+34*L),m=pt(A+k*1.6,R+6*L),n=pt(A+k*.2,R+22*L);o+=path("M"+J(p)+"Q"+J(m)+" "+J(q)+"Q"+J(n)+" "+J(p)+"Z","hsla(190,80%,92%,.28)",ST,.9)+path("M"+J(p)+"L"+J(q),null,"rgba(255,255,255,.5)",.6);});return o;},
  // 42 結晶角
  function(L,A){var l=R+(20+10*L),p=pt(A-.2,R*.96),q=pt(A,l),w=pt(A+.2,R*.96),m=pt(A+.02,R*1.1);return path("M"+J(p)+"L"+J(q)+"L"+J(w)+"Z","hsla(330,90%,92%,"+f1(.3+.4*L)+")",ST,1)+path("M"+J(q)+"L"+J(m),null,"rgba(255,255,255,.7)",.8);},
  // 43 鉱脈
  function(L,A,r){var d="M"+J(pt(A-.8,R*.3)),o="";for(var i=1;i<=6;i++){var p=pt(A-.8+i*.28,R*(.3+r()*.55));d+="L"+J(p);if(i%2)o+=dt(A-.8+i*.28,R*.45,1.2+L,"#fff",.9);}return '<path d="'+d+'" stroke="'+AC("cry",84)+'" stroke-width="'+f1(1+L)+'" fill="none" opacity=".75" stroke-linejoin="round"/>'+o;},
  // 44 鱗
  function(L,A){var o="";for(var i=0;i<12;i++){var a=A+(i%4-1.5)*.2,d=R*(.5+(i/4|0)*.17),p=pt(a,d);o+='<path d="M'+f1(p[0]-3.2)+" "+f1(p[1])+"q3.2 4.6 6.4 0"+'" stroke="rgba(255,255,255,'+f1(.3+.5*L)+')" stroke-width="1" fill="none"/>';}return o;},
  // 45 棘冠
  function(L,A,r){var o="";for(var i=0;i<7;i++){var a=A+(i-3)*.17;o+=tri(a,.07,R*.98,R+(9+r()*9)*L,"rgba(255,255,255,.55)");}return o;},
  // 46 氷柱突起
  function(L,A){var o="";for(var i=0;i<4;i++){var a=A+(i-1.5)*.24;o+=tri(a,.05,R*.98,R+(16+(i%2)*12)*L,"hsla(195,90%,92%,.55)");}return o;},
  // 47 宝石核
  function(L,A){var p=pt(A,R*.3),r=R*.2*L+4,x=p[0],y=p[1];return '<path d="M'+f1(x)+" "+f1(y-r*1.2)+"L"+f1(x+r)+" "+f1(y-r*.2)+"L"+f1(x)+" "+f1(y+r*1.2)+"L"+f1(x-r)+" "+f1(y-r*.2)+'Z" fill="'+AC("cry",86)+'" fill-opacity=".45" stroke="'+ST+'" stroke-width="1"/><path d="M'+f1(x-r)+" "+f1(y-r*.2)+"L"+f1(x+r)+" "+f1(y-r*.2)+"M"+f1(x)+" "+f1(y-r*1.2)+"L"+f1(x)+" "+f1(y+r*1.2)+'" stroke="rgba(255,255,255,.55)" stroke-width=".7"/>';},
  // 48 双頭芽
  function(L,A){var o="";[-.2,.2].forEach(function(k){var p=pt(A+k,R+6*L);o+=ln(A+k,R*.95,R+4*L,3,ST)+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(5+5*L)+'" fill="'+GL+'" stroke="'+ST+'" stroke-width="1"/>';});return o;},
  // 49 枝角
  function(L,A){var o="";[-1,1].forEach(function(k){var a=A+k*.3,p=pt(a,R*.96),q=pt(a+k*.1,R+(24*L)),m1=pt(a+k*.02,R+10*L),b1=pt(a+k*.28,R+(24*L)),m2=pt(a+k*.06,R+16*L),b2=pt(a-k*.1,R+(30*L));o+=path("M"+J(p)+"L"+J(q),null,ST,1.6)+path("M"+J(m1)+"L"+J(b1),null,ST,1.2)+path("M"+J(m2)+"L"+J(b2),null,ST,1.2);});return o;},
  // 50 裂け目
  function(L,A,r){var d="M"+J(pt(A,R*.1)),o="";for(var i=1;i<=5;i++){d+="L"+J(pt(A+(r()-.5)*.8,R*(.1+i*.17)));}return '<path d="'+d+'" stroke="'+AC("spl",86)+'" stroke-width="'+f1(1.2+L)+'" fill="none" opacity=".85" stroke-linejoin="round"/><path d="'+d+'" stroke="#fff" stroke-width=".6" fill="none" opacity=".9"/>';},
  // 51 小分身
  function(L,A){var o="";for(var i=0;i<3;i++){var a=A+(i-1)*.55,d=R+(10+i%2*10)*L,p=pt(a,d);o+=ln(a,R*.97,d-3,.8,"rgba(255,255,255,.5)")+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(3+(2-i%2)*L+1)+'" fill="'+GL+'" stroke="'+ST+'" stroke-width=".9"/>';}return o;},
  // 52 胞子嚢
  function(L,A){var o="";for(var i=0;i<3;i++){var a=A+(i-1)*.3,d=R+(10+i%2*8)*L,p=pt(a,d);o+=cu(a,R*.96,d,.2*(i-1),1.2,"rgba(255,255,255,.6)")+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(2.6+2*L)+'" fill="'+AC("spl",84)+'" fill-opacity=".6" stroke="'+ST+'" stroke-width=".7"/>'+dt(a+.05,d,.9,"#fff");}return o;},
  // 53 分節環
  function(L,A){var o="";for(var i=0;i<4;i++){var d=R*(.25+i*.19),p=pt(A-.5,d),q=pt(A+.5,d);o+='<path d="M'+J(p)+"Q"+J(pt(A,d+R*.1))+" "+J(q)+'" stroke="'+AC("spl",82)+'" stroke-width="1.1" fill="none" opacity="'+f1(.3+.5*L)+'"/>';}return o;},
  // 54 光輪
  function(L,A){var o="";[0,1].forEach(function(k){o+='<ellipse cx="'+cx+'" cy="'+f1(cy-R-10-k*5)+'" rx="'+f1(R*(.5+k*.1))+'" ry="'+(5+k)+'" fill="none" stroke="'+AC("res",78)+'" stroke-width="'+f1(2-k*.7)+'" opacity="'+f1((.4+.6*L)*(1-k*.35))+'"/>';});return '<g class="pulse">'+o+'</g>';},
  // 55 音叉
  function(L,A){var b=pt(A,R*.95),t=pt(A,R+22*L),e=pt(A,R+34*L),l1=pt(A-.1,R+34*L),r1=pt(A+.1,R+34*L);return ln(A,R*.95,R+18*L,2,ST)+path("M"+J(pt(A-.1,R+16*L))+"L"+J(l1)+"M"+J(pt(A+.1,R+16*L))+"L"+J(r1),null,ST,1.8)+path("M"+J(pt(A-.1,R+16*L))+"Q"+J(pt(A,R+14*L))+" "+J(pt(A+.1,R+16*L)),null,ST,1.8)+'<g class="pulse">'+path("M"+J(pt(A-.3,R+30*L))+"Q"+J(pt(A,R+42*L))+" "+J(pt(A+.3,R+30*L)),null,AC("res",84),1)+'</g>';},
  // 56 星環
  function(L,A){var t=(A*30)%50-25,o="";for(var i=0;i<5;i++){var a=i*PI*2/5,x=cx+Math.cos(a)*R*1.4,y=cy+Math.sin(a)*R*.38;o+='<path d="M'+f1(x-3)+" "+f1(y)+"L"+f1(x+3)+" "+f1(y)+"M"+f1(x)+" "+f1(y-3)+"L"+f1(x)+" "+f1(y+3)+'" stroke="'+AC("res",88)+'" stroke-width="1.2" opacity=".9"/>';}return '<g class="spin" style="animation-duration:20s"><g transform="rotate('+t+" "+cx+" "+cy+')"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+f1(R*1.4)+'" ry="'+f1(R*.38)+'" fill="none" stroke="rgba(255,255,255,.15)"/>'+o+'</g></g>';},
  // 57 響板
  function(L,A){var o="";for(var k=1;k<=3;k++){var d=R+k*6*L,p=pt(A-.45,d),q=pt(A+.45,d);o+='<path d="M'+J(p)+"A"+f1(d)+" "+f1(d)+" 0 0 1 "+J(q)+'" stroke="'+AC("res",82)+'" stroke-width="1.2" fill="none" opacity="'+f1((.9-k*.22)*L)+'"/>';}return o;},
  // 58 蛍群
  function(L,A,r){var o="";for(var i=0;i<9;i++){var a=A+r()*2.4-1.2,d=R*(.6+r()*.9);o+='<circle class="bub" style="animation-delay:-'+f1(r()*5)+'s;animation-duration:'+f1(3+r()*4)+'s" cx="'+pt(a,d)[0]+'" cy="'+pt(a,d)[1]+'" r="'+f1(1+r()*1.5)+'" fill="'+AC("res",86)+'"/>';}return o;},
  // 59 波紋器
  function(L,A){var p=pt(A,R*.35),o="";for(var k=1;k<=3;k++)o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+f1(k*(3+4*L))+'" fill="none" stroke="'+AC("res",84)+'" stroke-width="1" opacity="'+f1((1-k*.25)*(.4+.6*L))+'"/>';return o;}
  ];
};

// ---- 遺伝子: 体の形・模様・色・目 ----
// 体の形 10種(丸 / しずく / たまご / ぺたん / 星 / 冠 / ふたご / くも / まめ / かど)
var PREF={sen:[1,2,8,0],flo:[7,3,8,0],cry:[4,5,9,2],spl:[6,8,4,7],res:[0,4,7,5]};
window.GENE=function(c,dom,sec,stage){
  var sd=c.seed||1,r=rngS(sd*7+13);
  var pool=PREF[dom]||[0,1,2,3,4,5,6,7,8,9];
  var form=r()<.7?pool[Math.floor(r()*pool.length)]:Math.floor(r()*10);
  var g={form:form,k:3+Math.floor(r()*4),rot:r()*2*PI,phi:r()*2*PI,
    sx:1,sy:1,dh:Math.round((r()-.5)*44),sz:.93+r()*.14,
    pat:r()<.12?0:1+Math.floor(r()*9),h2:Math.round((sec!=null?sec:r()*360)+(r()-.5)*70)%360,
    ex:.23+r()*.14,ey:-.08+r()*.22,pseed:Math.floor(r()*1e9),fv:0,lean:(r()-.5)*0.12};
  if(form===2){g.sx=.9;g.sy=1.12;}
  if(form===3){g.sx=1.14;g.sy=.86;}
  g.sy*=.97+r()*.06;
  // 段階が低いうちは球体に近い(最初は白い球体)
  g.s=stage<=0?0:Math.min(1,.35+stage*.22);
  return g;
};
// 形の関数: 角度 -> 半径の倍率
window.BODYF=function(g){
  var f=g.form,k=g.k,rot=g.rot,s=g.s;
  return function(a){
    var m=1,t=Math.max(0,Math.cos(a+PI/2));
    switch(f){
      case 1:m=1+.3*Math.pow(t,3)-.05*Math.cos(a-PI/2);break;
      case 4:m=1+.15*Math.cos(k*(a+rot));break;
      case 5:m=1+.17*t*(.5+.5*Math.cos((k+3)*a));break;
      case 6:m=1+.14*Math.cos(2*a)+.05*Math.cos(4*a);break;
      case 7:m=1+.07*Math.cos((k+4)*(a+rot))+.04*Math.sin(3*a+rot);break;
      case 8:m=1-.15*Math.exp(-Math.pow(Math.atan2(Math.sin(a-g.phi),Math.cos(a-g.phi)),2)/.28);break;
      case 9:m=1+.1*Math.cos(4*a+PI/4)+.02*Math.cos(8*a);break;
    }
    return 1+(m-1)*s;
  };
};

// ---- 模様(体の内側に重ねる) ----
window.PATTERN=function(g,H){
  if(!g.pat||g.s<=0)return "";
  var cx=H.cx,cy=H.cy,R=H.R,r=rngS(g.pseed),h=g.h2,W=H.W,a=(W?.34:.5)*Math.min(1,g.s+.1),o="",i,col="hsl("+h+" 80% "+(W?82:66)+"%)",col2="hsl("+((h+40)%360)+" 85% 86%)";
  switch(g.pat){
   case 1:for(i=0;i<8+Math.floor(r()*6);i++){var x=cx+(r()-.5)*R*1.5,y=cy+(r()-.5)*R*1.5;o+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(1.8+r()*R*.12)+'" fill="'+col+'" opacity="'+f1(a)+'"/>';}break;
   case 2:for(i=-5;i<=5;i++)o+='<path d="M'+f1(cx+i*R*.3-R)+" "+f1(cy+R)+"l"+f1(R*1.4)+" "+f1(-R*2)+'" stroke="'+col+'" stroke-width="'+f1(2+r()*3)+'" opacity="'+f1(a*.8)+'"/>';break;
   case 3:{var ox=cx+(r()-.5)*R*.8,oy=cy+(r()-.5)*R*.8;for(i=1;i<=6;i++)o+='<circle cx="'+f1(ox)+'" cy="'+f1(oy)+'" r="'+f1(i*R*.22)+'" fill="none" stroke="'+col+'" stroke-width="1.4" opacity="'+f1(a*(1-i*.1))+'"/>';break;}
   case 4:for(i=0;i<34;i++)o+='<circle cx="'+f1(cx+(r()-.5)*R*2)+'" cy="'+f1(cy+(r()-.5)*R*2)+'" r="'+f1(.6+r()*1.1)+'" fill="'+col+'" opacity="'+f1(a+.15)+'"/>';break;
   case 5:for(i=0;i<3;i++){var yy=cy+(i-1)*R*.5+(r()-.5)*8;o+='<path d="M'+f1(cx-R)+" "+f1(yy)+"q"+f1(R*.5)+" "+f1(-9-r()*8)+" "+f1(R)+" 0t"+f1(R)+' 0" stroke="'+col+'" stroke-width="'+f1(3+r()*4)+'" fill="none" opacity="'+f1(a*.8)+'"/>';}break;
   case 6:for(var yy2=-4;yy2<=4;yy2++)for(var xx=-4;xx<=4;xx++){var px=cx+xx*9+(yy2%2)*4.5,py=cy+yy2*8;o+='<path d="M'+f1(px-4)+" "+f1(py)+"q4 5.4 8 0"+'" stroke="'+col+'" stroke-width=".9" fill="none" opacity="'+f1(a)+'"/>';}break;
   case 7:for(i=0;i<5;i++){var an=r()*2*PI;o+='<path d="M'+cx+" "+cy+"Q"+f1(cx+Math.cos(an+.6)*R*.5)+" "+f1(cy+Math.sin(an+.6)*R*.5)+" "+f1(cx+Math.cos(an)*R)+" "+f1(cy+Math.sin(an)*R)+'" stroke="'+col+'" stroke-width="1.3" fill="none" opacity="'+f1(a)+'"/>';}break;
   case 8:{var gx=cx+(r()-.5)*R,gy=cy+(r()-.5)*R;o+='<circle cx="'+f1(gx)+'" cy="'+f1(gy)+'" r="'+f1(R*.8)+'" fill="url(#'+H.id+'p)"/>';break;}
   case 9:{var pts=[];for(i=0;i<7;i++)pts.push([cx+(r()-.5)*R*1.5,cy+(r()-.5)*R*1.5]);var d="M"+pts.map(function(p){return f1(p[0])+" "+f1(p[1]);}).join("L");o+='<path d="'+d+'" stroke="'+col2+'" stroke-width=".8" fill="none" opacity="'+f1(a+.1)+'"/>';pts.forEach(function(p){o+='<circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="'+f1(1.2+r()*1.5)+'" fill="#fff" opacity=".8"/>';});break;}
  }
  return o;
};
window.PATDEF=function(g,id){return '<radialGradient id="'+id+'p"><stop offset="0" stop-color="hsl('+g.h2+' 85% 72%)" stop-opacity=".55"/><stop offset="1" stop-color="hsl('+g.h2+' 85% 72%)" stop-opacity="0"/></radialGradient>';};

// ---- 名前・希少度・個体コード ----
window.IDENT=function(c,dom,g,visN,mirrored,shifted){
  var MDx=window.MD,sd=c.seed||1,r=rngS(sd*3+1);
  var adj=(MDx.ADJ[dom]||MDx.ADJ.sen)[Math.floor(r()*5)];
  var el=c.el?MDx.EN[c.el]+"の":"";
  var noun=MDx.NOUN[g.form];
  var code=((sd*2654435761)>>>0).toString(16).toUpperCase().slice(-4);
  var stars=1+(g.pat?1:0)+(g.form?1:0)+(mirrored>0?1:0)+(c.el?1:0)+(visN>=5?1:0)+(shifted>=2?1:0);
  stars=Math.max(1,Math.min(5,Math.floor((stars-1)*4/6)+1));
  return {name:adj+el+noun,code:code,stars:stars};
};
})();
