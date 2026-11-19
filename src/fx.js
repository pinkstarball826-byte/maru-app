// 演出まわり: 背景の星空 / 生き物のまわりの空気 / 追加の餌エフェクト / 進化の演出。
window.FX=(function(){
var PI=Math.PI,TAU=PI*2;
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function hs(h,s,l,a){return "hsla("+h+","+s+"%,"+l+"%,"+a+")";}
function rngS(n){var a=n>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
function soft(g,x,y,rad,h,s,l,a){var gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,hs(h,s,l,a));gr.addColorStop(1,hs(h,s,l,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,TAU);g.fill();}
function star4(g,x,y,z,a,h){g.strokeStyle=hs(h,100,92,a);g.lineWidth=1.2;g.beginPath();g.moveTo(x-z,y);g.lineTo(x+z,y);g.moveTo(x,y-z);g.lineTo(x,y+z);g.stroke();soft(g,x,y,z*.7,h,100,90,a*.6);}
function ring(g,x,y,rx,ry,h,s,l,a,lw){g.strokeStyle=hs(h,s,l,a);g.lineWidth=lw;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.stroke();}
function vib(p){try{if(navigator.vibrate&&!RM)navigator.vibrate(p);}catch(e){}}
var vis=true;document.addEventListener("visibilitychange",function(){vis=!document.hidden;});

// ---- 背景(星空・流れ星) ----
function bg(){
  var cv=document.getElementById("bg");if(!cv)return;var g=cv.getContext("2d"),W=0,H=0,dp=1,S=[],sh=null,last=0;
  function size(){dp=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;cv.width=W*dp;cv.height=H*dp;cv.style.width=W+"px";cv.style.height=H+"px";g.setTransform(dp,0,0,dp,0,0);
    var n=Math.round(Math.min(130,W*H/7500)),r=rngS(7);S=[];for(var i=0;i<n;i++)S.push({x:r()*W,y:r()*H,z:.2+r()*.8,r:.4+r()*1.2,t:r()*TAU,h:r()<.3?330:r()<.5?200:48});}
  size();window.addEventListener("resize",size);
  function draw(now){
    requestAnimationFrame(draw);if(!vis||now-last<33)return;last=now;
    g.clearRect(0,0,W,H);var sy=(window.scrollY||0),i,s;
    for(i=0;i<S.length;i++){s=S[i];var y=((s.y-sy*s.z*.18)%H+H)%H,a=RM?.6:.35+.55*(.5+.5*Math.sin(now/900*s.z+s.t));
      g.fillStyle=hs(s.h,70,92,a*s.z);g.beginPath();g.arc(s.x,y,s.r,0,TAU);g.fill();
      if(s.r>1.2){g.strokeStyle=hs(s.h,80,95,a*.4);g.lineWidth=.6;g.beginPath();g.moveTo(s.x-3,y);g.lineTo(s.x+3,y);g.moveTo(s.x,y-3);g.lineTo(s.x,y+3);g.stroke();}}
    if(!RM){
      if(!sh&&Math.random()<.004)sh={x:Math.random()*W*.8+W*.2,y:Math.random()*H*.4,vx:-6-Math.random()*4,vy:3+Math.random()*2,l:0};
      if(sh){sh.x+=sh.vx;sh.y+=sh.vy;sh.l++;var gr=g.createLinearGradient(sh.x,sh.y,sh.x-sh.vx*9,sh.y-sh.vy*9);gr.addColorStop(0,"rgba(255,255,255,.9)");gr.addColorStop(1,"rgba(255,255,255,0)");
        g.strokeStyle=gr;g.lineWidth=1.6;g.beginPath();g.moveTo(sh.x,sh.y);g.lineTo(sh.x-sh.vx*9,sh.y-sh.vy*9);g.stroke();if(sh.l>60||sh.x<-40||sh.y>H+40)sh=null;}}
  }
  requestAnimationFrame(draw);
}

// ---- 生き物のまわりの空気(粒子) + タップ・衝撃波 ----
var box=null,cv2=null,g2=null,P=[],R2=[],bw=0,bh=0,elem=null,center=function(){return [bw/2,bh*.55,40];},lastT=0,onscreen=true;
function setupAmb(b,cf){
  box=b;center=cf;cv2=document.createElement("canvas");cv2.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4";b.appendChild(cv2);g2=cv2.getContext("2d");
  function size(){var r=b.getBoundingClientRect(),dp=Math.min(2,window.devicePixelRatio||1);bw=r.width;bh=r.height;cv2.width=bw*dp;cv2.height=bh*dp;g2.setTransform(dp,0,0,dp,0,0);}
  size();window.addEventListener("resize",size);
  if(window.IntersectionObserver)new IntersectionObserver(function(e){onscreen=e[0].isIntersecting;}).observe(b);
  requestAnimationFrame(loop);
}
function spawn(){
  var c=center(),R=c[2],a=Math.random()*TAU,d=R*(1.1+Math.random()*1.2),x=c[0]+Math.cos(a)*d,y=c[1]+Math.sin(a)*d*.8,p={x:x,y:y,vx:0,vy:0,l:0,m:3+Math.random()*3,r:1+Math.random()*2,h:200,k:"d",rot:Math.random()*TAU};
  switch(elem){
   case "w":p.k="b";p.vy=-.35-Math.random()*.3;p.vx=(Math.random()-.5)*.2;p.h=195;p.y=c[1]+R*.6+Math.random()*R;break;
   case "g":p.k="l";p.vy=.2+Math.random()*.2;p.vx=(Math.random()-.5)*.5;p.h=100+Math.random()*40;p.y=c[1]-R*1.4;break;
   case "f":p.k="e";p.vy=-.6-Math.random()*.6;p.vx=(Math.random()-.5)*.4;p.h=20+Math.random()*30;p.x=c[0]+(Math.random()-.5)*R*1.6;p.y=c[1]+R*.2;p.m=1.6+Math.random()*1.6;break;
   case "i":p.k="s";p.vy=.3+Math.random()*.3;p.vx=(Math.random()-.5)*.3;p.h=195;p.y=c[1]-R*1.5;p.r=1.6+Math.random()*2;break;
   case "t":p.k="z";p.h=52;p.m=.35;p.x=c[0]+Math.cos(a)*R*(1.1+Math.random()*.5);p.y=c[1]+Math.sin(a)*R*(1.1+Math.random()*.5);break;
   case "s":p.k="t";p.h=250+Math.random()*80;p.m=2.5+Math.random()*2;p.r=2+Math.random()*3;break;
   default:p.k="d";p.vy=-.1-Math.random()*.1;p.vx=(Math.random()-.5)*.1;p.h=200+Math.random()*140;
  }
  P.push(p);
}
function loop(now){
  requestAnimationFrame(loop);if(!vis||!onscreen||!g2)return;var dt=Math.min(.05,(now-lastT)/1000||.016);lastT=now;
  g2.clearRect(0,0,bw,bh);g2.globalCompositeOperation="lighter";
  if(!RM&&P.length<(elem==="t"?10:26)&&Math.random()<(elem==="t"?.12:.35))spawn();
  var i,p;
  for(i=P.length-1;i>=0;i--){p=P[i];p.l+=dt;if(p.l>p.m){P.splice(i,1);continue;}
    var u=p.l/p.m,a=Math.sin(u*PI);p.x+=p.vx+(p.k==="l"?Math.sin(p.l*3+p.rot)*.4:0);p.y+=p.vy;if(p.g)p.vy+=p.g*dt*60;
    switch(p.k){
     case "b":g2.strokeStyle=hs(p.h,90,88,a*.6);g2.lineWidth=.8;g2.beginPath();g2.arc(p.x,p.y,p.r+1.5,0,TAU);g2.stroke();soft(g2,p.x-.5,p.y-.5,p.r,p.h,90,90,a*.3);break;
     case "l":g2.save();g2.translate(p.x,p.y);g2.rotate(p.rot+p.l*1.5);g2.fillStyle=hs(p.h,60,62,a*.7);g2.beginPath();g2.ellipse(0,0,p.r*1.8,p.r*.8,0,0,TAU);g2.fill();g2.restore();break;
     case "e":soft(g2,p.x,p.y,p.r*2.4,p.h,100,62,a*.7);soft(g2,p.x,p.y,p.r,45,100,80,a);break;
     case "s":g2.strokeStyle=hs(p.h,80,92,a*.8);g2.lineWidth=.8;g2.beginPath();for(var k=0;k<3;k++){var an=k*PI/3+p.rot;g2.moveTo(p.x-Math.cos(an)*p.r*1.6,p.y-Math.sin(an)*p.r*1.6);g2.lineTo(p.x+Math.cos(an)*p.r*1.6,p.y+Math.sin(an)*p.r*1.6);}g2.stroke();break;
     case "z":g2.strokeStyle=hs(p.h,100,75,a);g2.lineWidth=1.2;g2.beginPath();g2.moveTo(p.x,p.y);g2.lineTo(p.x+(Math.random()-.5)*14,p.y+(Math.random()-.5)*14);g2.lineTo(p.x+(Math.random()-.5)*20,p.y+(Math.random()-.5)*20);g2.stroke();soft(g2,p.x,p.y,6,p.h,100,70,a*.5);break;
     case "t":star4(g2,p.x,p.y,p.r*(.6+.6*a),a*.9,p.h);break;
     case "f":soft(g2,p.x,p.y,p.r,p.h,90,80,a);break;
     case "q":g2.fillStyle=hs(p.h,90,85,a);g2.beginPath();g2.arc(p.x,p.y,p.r*(1-u*.5),0,TAU);g2.fill();break;
     default:soft(g2,p.x,p.y,p.r*2.2,p.h,80,88,a*.4);
    }}
  for(i=R2.length-1;i>=0;i--){var r=R2[i];r.l+=dt;var q=r.l/r.m;if(q>=1){R2.splice(i,1);continue;}
    var c=center();ring(g2,c[0],c[1],r.r0+(r.r1-r.r0)*q,(r.r0+(r.r1-r.r0)*q)*.9,r.h,90,80,(1-q)*.8,3*(1-q)+.5);}
}
function burst(x,y,h,n,spd){
  if(RM||!g2)return;n=n||14;spd=spd||2.4;
  for(var i=0;i<n;i++){var a=Math.random()*TAU,v=spd*(.4+Math.random());P.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.6,g:.03,l:0,m:.6+Math.random()*.7,r:1.2+Math.random()*2,h:h+(Math.random()-.5)*30,k:Math.random()<.4?"t":"q",rot:0});}
}
function shock(h,n){if(RM||!g2)return;var c=center();for(var i=0;i<(n||2);i++)R2.push({l:-i*.12,m:.9,r0:c[2]*.9,r1:c[2]*(1.9+i*.4),h:h});}
function setEl(e){elem=e||null;}
function pop(b,txt,col,dx){
  if(RM)return;var e=document.createElement("div");e.className="pop";e.textContent=txt;e.style.color=col||"#ffd166";var c=center();e.style.left=(c[0]+(dx||0))+"px";e.style.top=(c[1]-c[2]*1.1)+"px";b.appendChild(e);setTimeout(function(){e.remove();},1600);
}
function flash(h){var f=document.getElementById("flash");if(!f||RM)return;f.style.background="radial-gradient(circle at 50% 30%,"+hs(h,100,85,.55)+",transparent 65%)";f.classList.remove("on");void f.offsetWidth;f.classList.add("on");}

// ---- 追加の餌エフェクト(風の羽根 p / 夢のけむり m / 星くず d / 琥珀の蜜 h) ----
function food(k,sv,bx,xp){
  if(!sv||RM)return;
  var b=bx.getBoundingClientRect(),r=sv.getBoundingClientRect(),W=b.width,H=b.height,sc=r.width/200,
    cx=r.left-b.left+r.width/2,cy=r.top-b.top+r.height*.54,BR=(33+Math.min(xp,500)/500*20)*sc,S=Math.min(W,H)*.48;
  var cv=document.createElement("canvas"),dp=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*dp;cv.height=H*dp;cv.style.cssText="position:absolute;left:0;top:0;width:"+W+"px;height:"+H+"px;pointer-events:none;z-index:6";
  bx.appendChild(cv);var g=cv.getContext("2d");g.scale(dp,dp);
  var rnd=rngS(Math.floor(Math.random()*1e9)),N=k==="p"?18:k==="m"?12:k==="d"?30:1,Q=[],i,DUR=2.4;
  for(i=0;i<N;i++)Q.push({a:rnd()*TAU,d:.6+rnd()*.5,del:rnd()*.55,du:.8+rnd()*.35,h:rnd(),w:rnd()-.5,side:rnd()<.5?-1:1});
  var t0=null;
  function frame(now){
    if(t0===null)t0=now;var t=(now-t0)/1000,p,u,q,x,y;g.clearRect(0,0,W,H);g.globalCompositeOperation="lighter";
    if(k==="p"){
      for(i=0;i<N;i++){p=Q[i];u=(t-p.del)/p.du;if(u<0||u>1)continue;var e=u*u,rr=S*p.d*(1-e),aa=p.a+(1-e)*3.2*p.side;x=cx+Math.cos(aa)*rr;y=cy+Math.sin(aa)*rr*.8-Math.sin(u*PI)*14;
        var x0=cx+Math.cos(aa-.35*p.side)*rr*1.08,y0=cy+Math.sin(aa-.35*p.side)*rr*.86;
        g.strokeStyle=hs(170,70,88,.22*Math.min(1,u*5));g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x,y);g.stroke();
        g.save();g.translate(x,y);g.rotate(aa+PI/2+u*4*p.w);g.globalAlpha=Math.min(1,u*5)*(1-u*.4);
        g.fillStyle=hs(165+p.h*30,70,90,.9);g.beginPath();g.ellipse(0,0,2,8,0,0,TAU);g.fill();g.strokeStyle=hs(180,60,98,.9);g.lineWidth=.8;g.beginPath();g.moveTo(0,-8);g.lineTo(0,10);g.stroke();g.restore();}
      q=(t-.95)/.9;if(q>0&&q<1){for(var j=0;j<4;j++){var ra=BR*(1.1+.9*q)+j*5;g.strokeStyle=hs(175,80,92,(1-q)*.55);g.lineWidth=1.4;g.beginPath();g.arc(cx,cy,ra,t*3+j*1.6,t*3+j*1.6+1.2);g.stroke();}soft(g,cx,cy,BR*(.6+.8*q),170,80,90,.25*(1-q));}
    }else if(k==="m"){
      for(i=0;i<N;i++){p=Q[i];u=(t-p.del*.6)/(p.du+.55);if(u<0||u>1)continue;var e2=u*u,rr2=S*(.75+p.d*.4)*(1-e2)+BR*.5*e2,a2=p.a+u*3.4*p.side;x=cx+Math.cos(a2)*rr2;y=cy+Math.sin(a2)*rr2*.82;
        var al=Math.sin(u*PI);g.globalCompositeOperation="source-over";soft(g,x,y,26+16*(1-u),295+p.h*40,55,70,.22*al);g.globalCompositeOperation="lighter";soft(g,x,y,10,300+p.h*40,90,85,.18*al);
        if(i%3===0){star4(g,x+Math.cos(a2+1)*18,y+Math.sin(a2+1)*18,3+3*al,al*.9,300);}}
      q=(t-1.1)/.9;if(q>0&&q<1){soft(g,cx,cy,BR*(1+.8*q),300,90,82,.3*(1-q));ring(g,cx,cy,BR*(1+.6*q),BR*(1+.6*q)*.97,310,90,86,(1-q)*.7,2.5*(1-q)+.5);
        for(i=0;i<8;i++){var an=i/8*TAU+q*2;star4(g,cx+Math.cos(an)*BR*(1.2+.5*q),cy+Math.sin(an)*BR*(1.2+.5*q)*.9,3+4*Math.sin(q*PI),(1-q)*.8,i%2?300:50);}}
    }else if(k==="d"){
      var land=[];
      for(i=0;i<N;i++){p=Q[i];var del2=p.del*1.2,ang=p.a,tx=cx+Math.cos(ang)*BR*(1.05+.35*p.d),ty=cy+Math.sin(ang)*BR*(1.0+.3*p.d)*.95,sx=tx+S*.9+p.w*40,sy=ty-S*1.1;u=(t-del2)/.55;
        if(u>0&&u<1){var e3=u*u;x=sx+(tx-sx)*e3;y=sy+(ty-sy)*e3;var tl=24,gr=g.createLinearGradient(x,y,x+(sx-tx)/ S*tl*2,y+(sy-ty)/S*tl*2);gr.addColorStop(0,hs(52,100,88,.95));gr.addColorStop(1,hs(52,100,88,0));g.strokeStyle=gr;g.lineWidth=1.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+(sx-tx)/S*tl*2,y+(sy-ty)/S*tl*2);g.stroke();soft(g,x,y,5,52,100,85,.8);}
        q=(t-del2-.55)/.6;if(q>=0){land.push([tx,ty]);if(q<1)star4(g,tx,ty,10*(1-q*.5),1-q,i%2?52:200);else star4(g,tx,ty,3,.55+.35*Math.sin(t*6+i),52);}}
      if(land.length>3){var lq=Math.min(1,Math.max(0,(t-1.15)/.5)),lf=Math.max(0,1-Math.max(0,(t-1.8)/.5));g.strokeStyle=hs(52,100,88,.35*lq*lf);g.lineWidth=.8;g.beginPath();for(i=0;i<land.length;i++){if(i)g.lineTo(land[i][0],land[i][1]);else g.moveTo(land[i][0],land[i][1]);}g.stroke();}
      q=(t-1.15)/.7;if(q>0&&q<1)soft(g,cx,cy,BR*(1+.5*q),52,100,85,.3*(1-q));
    }else{
      var hx=cx,hy0=cy-S,hy1=cy-BR*.97;u=t/.8;
      if(u>0&&u<1){var e4=u*u;y=hy0+(hy1-hy0)*e4;var st=1+1.4*Math.sin(u*PI)*(1-u)*2;g.beginPath();g.ellipse(hx,y,7,10*st,0,0,TAU);g.fillStyle=hs(40,100,60,.95);g.fill();soft(g,hx-2,y-2,4,50,100,90,.8);soft(g,hx,y,16,38,100,60,.25);}
      q=(t-.8)/.9;if(q>0&&q<1){g.fillStyle=hs(40,100,64,1-q);for(i=0;i<14;i++){var an2=PI+(i/13)*PI,v=40+((i*37)%30);g.beginPath();g.arc(cx+Math.cos(an2)*v*q*1.1,hy1+Math.sin(an2)*v*q*1.2+80*q*q,2.8*(1-q*.6),0,TAU);g.fill();}
        ring(g,cx,cy-BR*.4,BR*(.4+.9*q),BR*(.4+.9*q)*.5,42,100,70,(1-q)*.8,2.6*(1-q)+.5);}
      q=(t-.9)/1.3;if(q>0&&q<1){for(i=0;i<5;i++){var dx2=(i-2)*BR*.38,len=(18+((i*13)%20))*Math.sin(q*PI);g.strokeStyle=hs(40,100,62,.7*(1-q));g.lineWidth=2.2;g.beginPath();g.moveTo(cx+dx2,cy-BR*.5+i%2*6);g.lineTo(cx+dx2*1.05,cy-BR*.5+i%2*6+len);g.stroke();soft(g,cx+dx2*1.05,cy-BR*.5+i%2*6+len,4,40,100,70,.7*(1-q));}
        soft(g,cx,cy,BR*1.1,40,100,65,.22*Math.sin(q*PI));}
    }
    if(t<DUR)requestAnimationFrame(frame);else cv.remove();
  }
  requestAnimationFrame(frame);
}

// ---- 進化の演出(全画面) ----
function evo(o,done){
  var ov=document.createElement("div");ov.className="evo";
  ov.innerHTML='<canvas></canvas><div class="evo-t"><div class="evo-k">'+(o.kicker||"しんか!")+'</div><div class="evo-n"></div><div class="evo-s"></div></div>';
  ov.querySelector(".evo-n").textContent=o.title||"";ov.querySelector(".evo-s").textContent=o.sub||"";
  document.body.appendChild(ov);
  var cv=ov.querySelector("canvas"),g=cv.getContext("2d"),dp=Math.min(2,window.devicePixelRatio||1),W=window.innerWidth,H=window.innerHeight;
  cv.width=W*dp;cv.height=H*dp;cv.style.width=W+"px";cv.style.height=H+"px";g.scale(dp,dp);
  var h=o.hue==null?200:o.hue,cx=W/2,cy=H*.4,rnd=rngS(Math.floor(Math.random()*1e9)),N=70,Pa=[],i,t0=null,fin=false;
  for(i=0;i<N;i++){var a=rnd()*TAU,d=Math.max(W,H)*(.45+rnd()*.35);Pa.push({a:a,d:d,del:rnd()*.7,du:.6+rnd()*.5,h:h+(rnd()-.5)*70,s:1+rnd()*2.4});}
  vib([20,40,20,40,90]);
  function end(){if(fin)return;fin=true;ov.classList.add("out");setTimeout(function(){ov.remove();if(done)done();},600);}
  ov.addEventListener("click",end);
  if(RM){setTimeout(end,1800);ov.classList.add("rm");return;}
  function frame(now){
    if(fin)return;if(t0===null)t0=now;var t=(now-t0)/1000;g.clearRect(0,0,W,H);
    g.fillStyle="rgba(10,6,28,"+Math.min(.82,t*1.6)+")";g.fillRect(0,0,W,H);g.globalCompositeOperation="lighter";
    var gl=Math.min(1,t/1.3);soft(g,cx,cy,60+160*gl*gl,h,100,70,.25+.5*gl);
    for(i=0;i<N;i++){var p=Pa[i],u=(t-p.del)/p.du;if(u<0||u>1)continue;var e=u*u*u,rr=p.d*(1-e),aa=p.a+(1-e)*1.6,x=cx+Math.cos(aa)*rr,y=cy+Math.sin(aa)*rr,rr2=p.d*(1-Math.pow(Math.max(0,u-.06),3)),a2=p.a+(1-Math.pow(Math.max(0,u-.06),3))*1.6;
      g.strokeStyle=hs(p.h,90,80,.45*u);g.lineWidth=p.s*.6;g.beginPath();g.moveTo(cx+Math.cos(a2)*rr2,cy+Math.sin(a2)*rr2);g.lineTo(x,y);g.stroke();soft(g,x,y,3+p.s*2,p.h,100,85,.9*u);}
    var q=(t-1.35)/1.2;
    if(t>=1.3&&t<1.45){g.fillStyle="rgba(255,255,255,"+(1-(t-1.3)/.15)*.95+")";g.fillRect(0,0,W,H);}
    if(q>0){var fade=Math.max(0,1-Math.max(0,(t-2.8)/.8));
      for(i=0;i<3;i++){var qq=Math.min(1,Math.max(0,(t-1.35-i*.14)/1.1));if(qq>0&&qq<1)ring(g,cx,cy,40+Math.max(W,H)*.6*qq,(40+Math.max(W,H)*.6*qq)*.8,h+i*25,90,82,(1-qq)*.8,5*(1-qq)+.6);}
      g.save();g.translate(cx,cy);g.rotate(t*.35);for(i=0;i<14;i++){g.rotate(TAU/14);var ln=(110+((i*53)%90))*Math.min(1,q*1.6)+Math.sin(t*3+i)*10,gr=g.createLinearGradient(0,0,ln*2.2,0);gr.addColorStop(0,hs(h+i*6,100,88,.5*fade));gr.addColorStop(1,hs(h+i*6,100,88,0));g.fillStyle=gr;g.beginPath();g.moveTo(0,-3);g.lineTo(ln*2.2,0);g.lineTo(0,3);g.fill();}g.restore();
      soft(g,cx,cy,110+40*Math.sin(t*4),h,100,82,.35*fade);
      for(i=0;i<22;i++){var an=i*2.4+t*.4,dd=70+((i*41)%160)*Math.min(1,q),yy=cy+Math.sin(an)*dd*.7-((t*30+i*17)%60);star4(g,cx+Math.cos(an)*dd,yy,2+((i*7)%4),(.4+.5*Math.sin(t*5+i))*fade,h+i*8);}}
    if(t>4.2)end();else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(function(){ov.classList.add("show");},1350);
}

return {bg:bg,setupAmb:setupAmb,setEl:setEl,burst:burst,shock:shock,pop:pop,flash:flash,food:food,evo:evo,vib:vib};
})();
