// ホーム画面の生き物を three.js で3D表示する。広場・ランキング・箱は2D(SVG)のまま。
// 透明な外膜 / 乳白色のもや(レイマーチングの体積表現) / 泡 / 細い光の筋 / 60器官の3D版。
window.M3=(function(){
if(!window.THREE)return null;
var T=THREE,PI=Math.PI,TAU=PI*2,UP=new T.Vector3(0,1,0);
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var TH={sen:190,flo:235,cry:330,spl:140,res:45};
function rngS(n){var a=n>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
function hsl(h,s,l){return new T.Color().setHSL(((h%360)+360)%360/360,s,l);}

// ---------------- シェーダー ----------------
var NOISE=[
"vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}",
"vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}",
"vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}",
"vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}",
"float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);",
" vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);",
" vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);",
" vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));",
" float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);",
" vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);",
" vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;",
" vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);",
" vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;",
" vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;",
" return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}"].join("\n");
var DESAT="vec3 desat(vec3 c,float s){float g=dot(c,vec3(.299,.587,.114));return mix(vec3(g),c,s);}";

// 外膜: ふちが白く、正面はほぼ透明。薄膜の虹色と、下側が少し厚い。
var MEM_V=[
"uniform float uT,uWob;varying vec3 vN,vV,vP;",
"void main(){vec3 p=position;float w=sin(uT*.8+p.x*3.1+p.y*1.7)*.5+sin(uT*1.13+p.z*2.6-p.y*2.2)*.5;p+=normal*w*uWob;",
" vec4 mv=modelViewMatrix*vec4(p,1.);vV=normalize(-mv.xyz);vN=normalize(normalMatrix*normal);vP=p;gl_Position=projectionMatrix*mv;}"].join("\n");
var MEM_F=[
"uniform vec3 uTint,uGlow;uniform float uAlpha,uSat,uGlowAmt;varying vec3 vN,vV,vP;",DESAT,
"void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float f=pow(1.-abs(dot(n,vV)),2.3);",
" vec3 L=normalize(vec3(-.55,.7,.6));float sp=pow(max(dot(n,normalize(L+vV)),0.),90.)*1.3;",
" float sp2=pow(max(dot(n,normalize(normalize(vec3(.7,-.55,.4))+vV)),0.),24.)*.22;",
" vec3 irid=.5+.5*cos(6.2831*(f*1.4+vec3(0.,.33,.67)));",
" float low=smoothstep(.0,-1.,vP.y)*smoothstep(-.2,.9,vP.x)*.5;",
" vec3 col=mix(uTint,vec3(1.),.6)*(f*.95+low*f)+irid*f*.2+vec3(sp+sp2)+uGlow*uGlowAmt*(.25+f);",
" float a=clamp(.02+f*.72+low*f*.7+sp+sp2+uGlowAmt*.25,0.,1.)*uAlpha;",
" gl_FragColor=vec4(desat(col,uSat),a);}"].join("\n");

// 乳白色のもや: 球の中をレイマーチングして、ゆっくり渦巻く体積を描く
var NUC_V="varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
var NUC_F=[
"uniform vec3 uCam,uC1,uC2,uOff;uniform float uT,uDen,uSat,uCore,uR;varying vec3 vP;",NOISE,DESAT,
"float dens(vec3 p){vec3 q=p+uOff;",
" vec3 w=vec3(snoise(q*1.2+vec3(0.,0.,uT*.06)),snoise(q*1.2+vec3(5.2,1.3,-uT*.05)),0.);",
" float n=snoise(q*1.9+w*.9+vec3(0.,uT*.05,0.))*.6+snoise(q*3.9+w*1.3)*.3;",
" float r=length(p*vec3(1.,1.08,1.));",
" float core=smoothstep(uCore+.1,uCore-.28,r+n*.24);",
" float wisp=pow(1.-abs(snoise(q*2.4+w*1.5+vec3(uT*.03))),8.)*smoothstep(uR,uCore*.8,r)*.35;",
" return clamp(core*(.5+.7*(n*.5+.5))+wisp,0.,1.);}",
"void main(){vec3 ro=uCam;vec3 rd=normalize(vP-uCam);float b=dot(ro,rd);float c=dot(ro,ro)-uR*uR;float h=b*b-c;if(h<0.)discard;",
" h=sqrt(h);float t0=max(-b-h,0.),t1=-b+h;const int N=26;float dt=(t1-t0)/float(N);",
" float t=t0+dt*fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);vec3 col=vec3(0.);float a=0.;",
" vec3 L=normalize(vec3(-.45,.65,.6));",
" for(int i=0;i<N;i++){vec3 p=ro+rd*t;float d=dens(p)*uDen;",
"  if(d>.003){vec3 cc=mix(uC2,uC1,clamp(d*1.5,0.,1.));cc*=.78+.42*clamp(dot(normalize(p+1e-4),L)*.5+.5,0.,1.);",
"   float aa=clamp(d*dt*4.4,0.,1.);col+=(1.-a)*aa*cc;a+=(1.-a)*aa;if(a>.96)break;}",
"  t+=dt;}",
" if(a<.004)discard;gl_FragColor=vec4(desat(col/a,uSat),a);}"].join("\n");

// 泡と小さなガラス質の器官
var GL_V=[
"varying vec3 vN,vV;void main(){",
"#ifdef USE_INSTANCING",
" vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.);vN=normalize(normalMatrix*mat3(instanceMatrix)*normal);",
"#else",
" vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);",
"#endif",
" vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}"].join("\n");
var GL_F=[
"uniform vec3 uC;uniform float uBase,uRim,uSat;varying vec3 vN,vV;",DESAT,
"void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float f=pow(1.-abs(dot(n,vV)),2.);",
" vec3 L=normalize(vec3(-.5,.7,.6));float sp=pow(max(dot(n,normalize(L+vV)),0.),70.);float di=.55+.45*max(dot(n,L),0.);",
" vec3 col=uC*di*(1.-f*.35)+vec3(1.)*f*uRim+sp;float a=clamp(uBase+f*uRim+sp,0.,1.);",
" gl_FragColor=vec4(desat(col,uSat),a);}"].join("\n");

// ---------------- 状態 ----------------
var renderer=null,scene,camera,canvas,box,root,spin,creature=null,U,key="",ok=false,W=1,H=1,onscreen=true,shown=true;
var poke=-9,absorbT=-9,absorbCol=new T.Color(1,1,1),dead=false,lastT=0,tAcc=0,frames=0,frameMs=16,dpr=1.5;
var dragX=0,dragY=0,tgtX=0,tgtY=0,drag=null,wasDrag=false;
var anim=[];   // 毎フレーム呼ぶ関数(器官の動き)
var bub=null,bubData=[],nucMesh=null,filMat=null,blink=0,eyes=[];

var glowTex=(function(){var c=document.createElement("canvas");c.width=c.height=128;var g=c.getContext("2d"),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.25,"rgba(255,255,255,.55)");gr.addColorStop(.6,"rgba(255,255,255,.12)");gr.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=gr;g.fillRect(0,0,128,128);var t=new T.CanvasTexture(c);return t;})();

function glass(col,base,rim){return new T.ShaderMaterial({uniforms:{uC:{value:col},uBase:{value:base==null?.12:base},uRim:{value:rim==null?.75:rim},uSat:U.uSat},vertexShader:GL_V,fragmentShader:GL_F,transparent:true,depthWrite:false,side:T.DoubleSide});}
function glow(col,op){return new T.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?.9:op,blending:T.AdditiveBlending,depthWrite:false});}
function sprite(col,size,op){var m=new T.SpriteMaterial({map:glowTex,color:col,transparent:true,opacity:op==null?1:op,blending:T.AdditiveBlending,depthWrite:false});var s=new T.Sprite(m);s.scale.set(size,size,1);return s;}
function mesh(geo,mat,order){var m=new T.Mesh(geo,mat);m.renderOrder=order==null?4:order;return m;}

// ---------------- 初期化 ----------------
function init(b){
  box=b;canvas=document.createElement("canvas");canvas.className="m3";canvas.setAttribute("aria-hidden","true");
  try{renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:"high-performance"});}catch(e){renderer=null;return false;}
  if(!renderer||!renderer.getContext()){renderer=null;return false;}
  renderer.setClearColor(0x000000,0);
  b.appendChild(canvas);
  scene=new T.Scene();camera=new T.PerspectiveCamera(28,1,.1,60);camera.position.set(0,0,9);
  root=new T.Group();spin=new T.Group();root.add(spin);scene.add(root);
  U={uT:{value:0},uSat:{value:1},uGlowAmt:{value:0},uGlow:{value:new T.Color(1,1,1)}};
  dpr=Math.min(1.75,window.devicePixelRatio||1);
  window.addEventListener("resize",place);
  if(window.IntersectionObserver)new IntersectionObserver(function(e){onscreen=e[0].isIntersecting;}).observe(b);
  document.addEventListener("visibilitychange",function(){if(!document.hidden)lastT=0;});
  // ドラッグで少し回せる(タップはそのまま「なでる」)
  b.addEventListener("pointerdown",function(e){drag={x:e.clientX,y:e.clientY,bx:tgtX,by:tgtY,moved:false};});
  window.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)drag.moved=true;tgtY=drag.by+dx*.012;tgtX=Math.max(-.6,Math.min(.6,drag.bx+dy*.008));});
  window.addEventListener("pointerup",function(){if(drag){wasDrag=drag.moved;drag=null;}});
  window.addEventListener("pointercancel",function(){drag=null;});
  b.addEventListener("click",function(e){if(wasDrag){wasDrag=false;e.stopPropagation();}},true);
  ok=true;requestAnimationFrame(loop);return true;
}
function place(){
  if(!ok)return;var sv=box.querySelector("svg.pet");if(!sv)return;
  var cr=canvas.getBoundingClientRect(),r=sv.getBoundingClientRect();W=Math.max(1,cr.width);H=Math.max(1,cr.height);
  renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
  camera.aspect=W/H;var cx=r.left-cr.left+r.width/2,cy=r.top-cr.top+r.height*.54;
  camera.setViewOffset(W,H,W/2-cx,H/2-cy,W,H);camera.updateProjectionMatrix();
  var Rpx=(creature?creature.R:40)*r.width/200,hW=2*camera.position.z*Math.tan(camera.fov*PI/360);
  root.scale.setScalar(Rpx/H*hW*1.3);
}

// ---------------- 体の形(2Dと同じ遺伝子から) ----------------
function shapeFn(pi,sd){
  var bf=window.BODYF(pi.G),gx=pi.gx||1,gy=pi.gy||1,amp=pi.amp||.04,r=rngS(sd*11+7),L=[];
  for(var i=0;i<7;i++){var v=new T.Vector3(r()*2-1,r()*2-1,r()*2-1).normalize();L.push([v,1.5+r()*2.5,r()*TAU,(r()*2-1)]);}
  return function(d){var a=Math.atan2(-d.y,d.x),m=bf(a),n=0;for(var i=0;i<L.length;i++)n+=Math.sin(d.dot(L[i][0])*L[i][1]+L[i][2])*L[i][3];
    m*=1+amp*1.1*n/2.2;return new T.Vector3(d.x*m*gx,d.y*m*gy,d.z*m*(gx+gy)/2);};
}

// ---------------- 器官(60種を形のタイプに対応) ----------------
// [タイプ, 本数, 長さ, 太さ]
var OM=[
["ant",3,.5,.02],["pore",3,.1],["fin",1,.55,.5],["bead",6,.05],["eye"],
["ten",3,.85,.022],["ring",1,1.35],["fin",1,.6,.55,1],["sat",2,1.55],["ten",1,.7,.03,1],
["plate",5,.2],["shell",2],["spike",5,.32,.05],["pore",9,.05],["frill",5,.22],
["core",1,.32],["vein",3,.7],["core",2,.18],["inner",1,.62],["core",4,.07,1],
["halo",1,.55],["helix",1,.7],["antler",1,.45],["bud",1,.3],["vein",1,1.2,1],
["antler",2,.55],["bud",1,.27,1],["cells",4,.2],["pore",1,.24,1],["ten",1,.9,.06,2],
["ant",5,.45,.016],["dots",8,.035],["fin",2,.32,.35,2],["flower",1,.45],["whisk",3,.85],["window",1,.28],
["tail",1,1.1],["frill",7,.18],["ten",5,.6,.018],["bcrown",6,.09],["vein",4,.5,2],["fin",2,.65,.45,3],
["horn",1,.6],["vein",1,.8,3],["scale",12,.07],["spike",7,.26,.04,1],["icicle",4,.42],["gem",1,.2],
["bud",2,.22],["antler",2,.5],["vein",1,.7,4],["sat",3,1.3,1],["pod",3,.4],["seg",4],
["halo",2,.6],["fork",1,.5],["ring",1,1.45,1],["arcs",3],["fly",9],["ripple",3]];

function buildOrgans(c,pi,grp,shape){
  var PARTS=window.MD.PARTS,sd=c.seed||1,gv=c.gv||{len:.5},parts=c.parts||{};
  for(var i=0;i<PARTS.length;i++){
    var L0=Math.min(1,parts[i]||0);if(L0<=.12)continue;
    var p=PARTS[i],r=rngS(sd*31+i*977),A=r()*TAU,vv=r(),mc=p[3]?1:(vv<.5?1:vv<.8?2:3),sc=.85+r()*.45,hr=r()<.45?Math.round((r()-.5)*100):0;
    var L=Math.min(1.25,L0*(.75+.6*gv.len));
    var col=hsl(TH[p[2]]+hr,.8,.74);
    for(var k=0;k<mc;k++){
      var A2=k?A+(mc===2?PI*(.5+r()*.9):k*2.1+(r()-.5)*.5):A,rr=rngS(sd*31+i*977+k*131);
      var dir=new T.Vector3(Math.cos(A2),-Math.sin(A2),(rr()-.3)*1.1).normalize();
      if(OM[i][0]==="eye"){if(k===0)makeEye(c,pi,grp,shape,L0);continue;}
      var g=organ(OM[i],L*(mc>1?Math.min(sc,1):sc),dir,rr,col,shape,!!p[3]);
      if(g)grp.add(g);
    }
  }
}
function surfAt(shape,dir){return shape(dir);}
function attach(g,shape,dir,inset){var s=surfAt(shape,dir);g.position.copy(s.multiplyScalar(inset==null?.96:inset));g.quaternion.setFromUnitVectors(UP,dir);return g;}
function perp(dir){var a=Math.abs(dir.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0);return new T.Vector3().crossVectors(dir,a).normalize();}
function spread(dir,ang,rot){var p=perp(dir).applyAxisAngle(dir,rot);return dir.clone().applyAxisAngle(p,ang).normalize();}
function tube(points,rad,mat,seg){var cv=new T.CatmullRomCurve3(points);return mesh(new T.TubeGeometry(cv,seg||32,rad,7,false),mat);}
function sway(o,amp,spd,ph){anim.push(function(t){o.rotation.z=Math.sin(t*spd+ph)*amp;o.rotation.x=Math.cos(t*spd*.8+ph)*amp*.6;});}

function organ(def,L,dir,r,col,shape,inner){
  var tp=def[0],n=def[1]||1,len=(def[2]||.4)*L,th=def[3]||.03,v=def[4]||0,g=new T.Group(),i,m,sub;
  var gm=glass(col,.14,.8),lm=glow(col,.9);
  switch(tp){
  case "ant":case "whisk":
    for(i=0;i<n;i++){var d=spread(dir,(i-(n-1)/2)*(tp==="ant"?.26:.18),0),base=surfAt(shape,d).multiplyScalar(.97),bend=perp(d).multiplyScalar((tp==="whisk"?.35:.12)*(i%2?1:-1)*len);
      var p1=base.clone().add(d.clone().multiplyScalar(len*.5)).add(bend),p2=base.clone().add(d.clone().multiplyScalar(len*(tp==="whisk"?1.1:1)));
      sub=new T.Group();sub.add(tube([base,p1,p2],tp==="whisk"?.008:th,glass(new T.Color(1,1,1),.25,.6)));
      if(tp==="ant"){var tip=mesh(new T.SphereGeometry(.045+.03*L,14,10),glow(col,.95));tip.position.copy(p2);sub.add(tip);var sp=sprite(col,.3,.8);sp.position.copy(p2);sub.add(sp);}
      sway(sub,.06,1.2+r(),r()*6);g.add(sub);}
    return g;
  case "ten":
    for(i=0;i<n;i++){var d2=spread(dir,(i-(n-1)/2)*.22,r()*.6),b2=surfAt(shape,d2).multiplyScalar(.95),pts=[b2];
      for(var s=1;s<=5;s++){var q=b2.clone().add(d2.clone().multiplyScalar(len*s/5));q.add(perp(d2).multiplyScalar(Math.sin(s*1.3+i)*.12*len*(v===1?2:1)));if(v===1&&s%2)q.add(perp(d2).applyAxisAngle(d2,1.5).multiplyScalar(.1*len));pts.push(q);}
      sub=new T.Group();sub.add(tube(pts,th*(v===2?1.6:1),glass(col,.22,.7),40));
      if(v===2){var bl=mesh(new T.SphereGeometry(.1,18,12),glass(col,.2,.9));bl.position.copy(pts[pts.length-1]);sub.add(bl);}
      var tp2=mesh(new T.SphereGeometry(th*1.4,10,8),glow(col,.9));tp2.position.copy(pts[pts.length-1]);sub.add(tp2);
      sub.userData.pivot=b2;sway(sub,.09,.9+r()*.6,r()*6);g.add(sub);}
    return g;
  case "fin":case "tail":
    var cnt=tp==="tail"?1:(v===2||v===3?2:1);
    for(i=0;i<cnt;i++){var sh=new T.Shape(),wd=(def[3]||.4)*L,ll=len*(tp==="tail"?1:1);
      sh.moveTo(-wd*.35,0);sh.quadraticCurveTo(-wd*.9,ll*.55,0,ll);sh.quadraticCurveTo(wd*.9,ll*.55,wd*.35,0);sh.lineTo(-wd*.35,0);
      m=mesh(new T.ShapeGeometry(sh,24),glass(col,.1,.6));sub=new T.Group();sub.add(m);
      var dd=v===1?dir.clone().negate():(cnt>1?spread(dir,(i?1:-1)*.5,0):dir);
      attach(sub,shape,dd,.93);m.rotation.y=r()*PI;if(v===3)m.rotation.z=(i?-1:1)*.4;
      var inner_=new T.Group();inner_.add(sub);sway(m,.12,1+r(),r()*6);g.add(sub);}
    return g;
  case "frill":
    for(i=0;i<n;i++){var df=spread(dir,(i-(n-1)/2)*.17,PI/2),sf=new T.Shape(),hh=len*(i%2?1:.7);sf.moveTo(-.06,0);sf.lineTo(0,hh);sf.lineTo(.06,0);sf.lineTo(-.06,0);
      m=mesh(new T.ShapeGeometry(sf),glass(col,.14,.6));sub=new T.Group();sub.add(m);attach(sub,shape,df,.94);g.add(sub);}
    sway(g,.04,1.4,r()*6);return g;
  case "ring":case "halo":
    for(i=0;i<n;i++){var rad=tp==="halo"?(def[2]||.55)*(1+i*.18):(def[2]||1.35),tor=mesh(new T.TorusGeometry(rad,.012+.008*L,8,120),glow(col,.55-i*.15));
      var tg=new T.Group();tg.add(tor);
      if(tp==="halo"){tg.position.y=1.25+i*.14;tor.rotation.x=PI/2;var hs=sprite(col,rad*2.4,.18);tg.add(hs);anim.push((function(o,ph){return function(t){o.position.y+=Math.sin(t*1.1+ph)*.0008;o.rotation.z=Math.sin(t*.7+ph)*.08;};})(tg,i));}
      else{tor.rotation.x=PI/2;tg.rotation.z=(r()-.5)*.9;tg.rotation.x=(r()-.5)*.6;
        if(v===1)for(var st=0;st<5;st++){var sx=sprite(col,.22,1);sx.position.set(Math.cos(st*TAU/5)*rad,0,Math.sin(st*TAU/5)*rad);tor.add(sx);}
        else{var bead=mesh(new T.SphereGeometry(.05,12,8),glow(col,.95));bead.position.set(rad,0,0);tor.add(bead);}
        anim.push((function(o,s){return function(t){o.rotation.z=t*s;};})(tor,.25+r()*.2));}
      g.add(tg);}
    return g;
  case "sat":
    for(i=0;i<n;i++){var og=new T.Group(),ds=(def[2]||1.5),sr=.08+.06*L+(v===1?-.02:.03);
      var sm=mesh(new T.SphereGeometry(sr,20,14),glass(col,.18,.85));sm.position.set(ds,0,0);og.add(sm);var sg=sprite(col,sr*5,.5);sg.position.copy(sm.position);og.add(sg);
      if(v===1){og.add(tube([new T.Vector3(.95,0,0),new T.Vector3((ds+.95)/2,.05,0),new T.Vector3(ds-sr,0,0)],.005,glow(new T.Color(1,1,1),.4),8));}
      og.rotation.set((r()-.5)*1.2,r()*TAU,(r()-.5)*.8);
      anim.push((function(o,s,ph){return function(t){o.rotation.y=ph+t*s;};})(og,.3+r()*.3,r()*TAU));g.add(og);}
    return g;
  case "spike":case "icicle":case "horn":
    var cn=tp==="horn"?1:n;
    for(i=0;i<cn;i++){var dk=v===1?spread(dir,.32,i/cn*TAU):spread(dir,(i-(cn-1)/2)*(tp==="icicle"?.2:.24),r()*.4);
      var hl=len*(tp==="icicle"?(i%2?1.4:.9):1)*(.8+r()*.4),cg=new T.ConeGeometry(tp==="horn"?.11:(def[3]||.04)*1.4,hl,tp==="horn"?6:8,1);cg.translate(0,hl/2,0);
      m=mesh(cg,glass(tp==="icicle"?hsl(195,.6,.88):col,.2,.85));sub=new T.Group();sub.add(m);attach(sub,shape,dk,.93);
      if(tp==="horn"){var ln=sprite(col,.25,.8);ln.position.y=hl*.95;sub.add(ln);}
      g.add(sub);}
    return g;
  case "plate":case "gem":
    for(i=0;i<(tp==="gem"?1:n);i++){var og2=new T.OctahedronGeometry(1,0);og2.computeVertexNormals();
      m=mesh(og2,tp==="gem"?glass(col,.4,.9):glass(col,.18,.85));
      if(tp==="gem"){m.scale.set(.13*L+.06,.2*L+.08,.13*L+.06);m.position.copy(dir.clone().multiplyScalar(.32));m.renderOrder=2;var gg=sprite(col,.6,.6);gg.position.copy(m.position);g.add(gg);anim.push((function(o){return function(t){o.rotation.y=t*.4;};})(m));}
      else{var dp=spread(dir,(i-(n-1)/2)*.22,r()*TAU);m.scale.set(.07,.16*L+.04,.04);sub=new T.Group();sub.add(m);attach(sub,shape,dp,.98);m.position.y=.04;g.add(sub);continue;}
      g.add(m);}
    return g;
  case "shell":
    for(i=0;i<n;i++){var shg=new T.SphereGeometry(1.06+i*.07,40,20,0,TAU,0,PI*(.35+.1*L));m=mesh(shg,glass(col,.06,.55),5);
      var sh2=new T.Group();sh2.add(m);sh2.quaternion.setFromUnitVectors(UP,dir);g.add(sh2);}
    return g;
  case "pore":case "window":
    for(i=0;i<n;i++){var dpo=spread(dir,i?(.18+.12*(i%3)):0,i*2.4),pr=(def[2]||.08)*(v===1?1:(.7+.6*r())),pg=new T.Group();
      var disk=mesh(new T.CircleGeometry(pr,24),new T.MeshBasicMaterial({color:tp==="window"?0xffffff:0x0c0a20,transparent:true,opacity:tp==="window"?.12:.55,depthWrite:false}),5);disk.rotation.x=-PI/2;pg.add(disk);
      var rim=mesh(new T.TorusGeometry(pr,.008,6,40),glow(col,.7),5);rim.rotation.x=PI/2;pg.add(rim);
      if(tp==="pore"&&v!==1){var pd=sprite(col,pr*3,.5);pd.position.y=-.02;pg.add(pd);}
      attach(pg,shape,dpo,1.0);g.add(pg);}
    return g;
  case "bead":case "dots":case "fly":
    for(i=0;i<n;i++){var db=tp==="fly"?spread(dir,r()*1.2,r()*TAU):spread(dir,tp==="bead"?.45:r()*.7,i/n*TAU),bs=sprite(col,tp==="fly"?.16:(def[2]||.05)*5,1);
      if(tp==="fly"){var fp=surfAt(shape,db).multiplyScalar(1.15+r()*.6);bs.position.copy(fp);anim.push((function(o,b,ph){return function(t){o.position.set(b.x+Math.sin(t*.9+ph)*.08,b.y+Math.sin(t*.7+ph*2)*.1,b.z+Math.cos(t*.8+ph)*.08);o.material.opacity=.5+.5*Math.sin(t*2.3+ph);};})(bs,fp.clone(),r()*TAU));}
      else bs.position.copy(surfAt(shape,db).multiplyScalar(tp==="dots"?.6+r()*.3:.99));
      if(tp==="dots")anim.push((function(o,ph){return function(t){o.material.opacity=.45+.55*Math.abs(Math.sin(t*1.4+ph));};})(bs,r()*6));
      g.add(bs);}
    return g;
  case "core":
    for(i=0;i<n;i++){var cpos=dir.clone().multiplyScalar(.2+.25*r()).add(new T.Vector3((r()-.5)*.3,(r()-.5)*.3,(r()-.5)*.3)),cs=sprite(col,(def[2]||.2)*3.2*L+.15,.85);cs.position.copy(cpos);cs.renderOrder=2;
      var cm=mesh(new T.SphereGeometry((def[2]||.2)*.45,16,12),glow(col,.6),2);cm.position.copy(cpos);g.add(cm);g.add(cs);
      anim.push((function(o,ph,sp_){return function(t){var k=1+.15*Math.sin(t*sp_+ph);o.scale.set(o.userData.s*k,o.userData.s*k,1);};})(cs,r()*6,v===1?3.2:1.3));cs.userData.s=cs.scale.x;}
    if(n===2){var a_=g.children[0].position,b_=g.children[2].position;g.add(tube([a_,a_.clone().lerp(b_,.5).add(new T.Vector3(0,.05,0)),b_],.006,glow(col,.6)));}
    return g;
  case "inner":case "cells":
    for(i=0;i<(tp==="inner"?1:n);i++){var ir=tp==="inner"?(def[2]||.6):(def[2]||.2)*(.8+r()*.5),im=mesh(new T.SphereGeometry(ir,30,20),glass(col,.04,.45),2);
      if(tp==="cells")im.position.copy(dir.clone().multiplyScalar(.25).add(new T.Vector3((r()-.5)*.5,(r()-.5)*.5,(r()-.5)*.4)));
      g.add(im);}
    return g;
  case "vein":
    for(i=0;i<n;i++){var dv=spread(dir,(i-(n-1)/2)*.4,r()*TAU),pts2=[],seg=6;
      for(var s2=0;s2<=seg;s2++){var tt=s2/seg,rr2=v===1?(-.85+1.7*tt):(.1+.75*tt),q2=dv.clone().multiplyScalar(rr2);
        if(v!==1)q2.add(perp(dv).multiplyScalar(Math.sin(tt*4+i)*(v===3?.18:.1)*(v===3?(s2%2?1:-1):1)));if(v===2)q2.multiplyScalar(1.12).setLength(Math.min(.9,q2.length()));pts2.push(q2);}
      m=tube(pts2,v===4?.012:.008,glow(v===4?hsl(300,.9,.85):col,v===1||v===4?.9:.6),48);m.renderOrder=2;g.add(m);}
    anim.push((function(o,ph){return function(t){o.children.forEach(function(c){c.material.opacity=.45+.4*Math.abs(Math.sin(t*.9+ph));});};})(g,r()*6));
    return g;
  case "helix":
    var hp=[],hb=surfAt(shape,dir).multiplyScalar(.95),ax2=perp(dir),ay2=new T.Vector3().crossVectors(dir,ax2);
    for(i=0;i<=40;i++){var u=i/40,rho=.1*L*u+.02;hp.push(hb.clone().add(dir.clone().multiplyScalar(len*u)).add(ax2.clone().multiplyScalar(Math.cos(u*14)*rho)).add(ay2.clone().multiplyScalar(Math.sin(u*14)*rho)));}
    g.add(tube(hp,.014,glow(col,.85),120));return g;
  case "antler":
    for(i=0;i<n;i++){var da=n>1?spread(dir,(i?1:-1)*.3,0):dir,ab=surfAt(shape,da).multiplyScalar(.96),at=ab.clone().add(da.clone().multiplyScalar(len));
      var am=glass(new T.Color(1,1,1),.3,.6);g.add(tube([ab,ab.clone().lerp(at,.5).add(perp(da).multiplyScalar(.05)),at],.022,am,12));
      for(var br=0;br<3;br++){var bp=ab.clone().lerp(at,.35+br*.22),bd2=spread(da,(br%2?1:-1)*.7,0),be=bp.clone().add(bd2.multiplyScalar(len*.35));g.add(tube([bp,be],.014,am,4));var bt=sprite(col,.14,.9);bt.position.copy(be);g.add(bt);}}
    return g;
  case "bud":
    for(i=0;i<n;i++){var dbu=n>1?spread(dir,(i?1:-1)*.28,0):dir,brad=(def[2]||.25)*(.7+.5*L),bp2=surfAt(shape,dbu).multiplyScalar(v===1?1.12+brad:.98+brad*.55);
      var bm=mesh(new T.SphereGeometry(brad,28,20),glass(col,.1,.8),3);bm.position.copy(bp2);g.add(bm);var bg2=sprite(col,brad*2.2,.35);bg2.position.copy(bp2);g.add(bg2);
      if(v===1)g.add(tube([surfAt(shape,dbu).multiplyScalar(.97),bp2],.02,glass(col,.2,.7),4));
      anim.push((function(o,ph){return function(t){var k=1+.04*Math.sin(t*1.6+ph);o.scale.set(k,k,k);};})(bm,r()*6));}
    return g;
  case "flower":
    var fb=surfAt(shape,dir).multiplyScalar(.96),ft=fb.clone().add(dir.clone().multiplyScalar(len));g.add(tube([fb,fb.clone().lerp(ft,.5).add(perp(dir).multiplyScalar(.06)),ft],.012,glass(new T.Color(1,1,1),.3,.6),12));
    var fl=new T.Group();fl.position.copy(ft);fl.quaternion.setFromUnitVectors(UP,dir);
    for(i=0;i<6;i++){var pe=mesh(new T.SphereGeometry(.06,12,8),glass(col,.3,.8));pe.scale.set(1.6,.35,.8);pe.position.set(Math.cos(i*PI/3)*.09,0,Math.sin(i*PI/3)*.09);pe.rotation.y=-i*PI/3;fl.add(pe);}
    var fc=sprite(new T.Color(1,1,1),.18,1);fl.add(fc);g.add(fl);anim.push(function(t){fl.rotation.y=t*.3;});return g;
  case "bcrown":
    for(i=0;i<n;i++){var dbc=spread(dir,.15+.1*(i%2),i/n*TAU),bcr=(def[2]||.08)*(.8+.6*r()),bcm=mesh(new T.SphereGeometry(bcr,18,12),glass(hsl(200,.5,.9),.05,.9),5);bcm.position.copy(surfAt(shape,dbc).multiplyScalar(1+bcr*.7));g.add(bcm);}
    return g;
  case "scale":
    for(i=0;i<n;i++){var dsc=spread(dir,.1+(i/4|0)*.12,(i%4)*.5),scm=mesh(new T.CircleGeometry(.06,12,0,PI),glass(col,.2,.6),5);var sg3=new T.Group();sg3.add(scm);scm.rotation.x=-PI/2.4;attach(sg3,shape,dsc,1.005);g.add(sg3);}
    return g;
  case "pod":
    for(i=0;i<n;i++){var dpd=spread(dir,(i-1)*.3,0),pb=surfAt(shape,dpd).multiplyScalar(.97),pt2=pb.clone().add(dpd.clone().multiplyScalar(len*(.8+.3*(i%2))));
      g.add(tube([pb,pb.clone().lerp(pt2,.5).add(perp(dpd).multiplyScalar(.05*(i-1))),pt2],.01,glass(new T.Color(1,1,1),.3,.6),10));
      var pm=mesh(new T.SphereGeometry(.07+.04*L,16,12),glass(col,.35,.8));pm.scale.y=1.3;pm.position.copy(pt2);g.add(pm);var pg2=sprite(col,.2,.6);pg2.position.copy(pt2);g.add(pg2);}
    sway(g,.03,1.1,r()*6);return g;
  case "seg":case "ripple":case "arcs":
    for(i=0;i<n;i++){var rr3,tr3;
      if(tp==="arcs"){rr3=1.08+i*.1;tr3=mesh(new T.TorusGeometry(rr3,.01,6,40,PI*.5),glow(col,.7-i*.18));var ag=new T.Group();ag.add(tr3);ag.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),dir);tr3.rotation.z=-PI*.25;g.add(ag);
        anim.push((function(o,ph){return function(t){o.material.opacity=.15+.6*Math.max(0,Math.sin(t*2-ph));};})(tr3,i*.8));continue;}
      rr3=tp==="seg"?.55-.0*i:.12+i*.1;tr3=mesh(new T.TorusGeometry(rr3,.008,6,60),glow(col,.5),2);
      var sgp=new T.Group();sgp.add(tr3);sgp.quaternion.setFromUnitVectors(UP,dir);
      if(tp==="seg"){tr3.rotation.x=PI/2;tr3.position.y=-.45+i*.3;tr3.scale.setScalar(Math.sqrt(Math.max(.05,1-Math.pow(-.45+i*.3,2)))*1.3);}
      else{tr3.position.y=.5;tr3.rotation.x=PI/2;anim.push((function(o,ph){return function(t){var k=(t*.4+ph)%1;o.scale.setScalar(.3+k*1.2);o.material.opacity=.7*(1-k);};})(tr3,i/n));}
      g.add(sgp);}
    return g;
  case "fork":
    var fk=new T.Group(),fm=glass(new T.Color(1,1,1),.35,.7);fk.add(tube([new T.Vector3(0,0,0),new T.Vector3(0,len*.5,0)],.02,fm,2));
    fk.add(tube([new T.Vector3(-.07,len*.45,0),new T.Vector3(-.08,len*.5,0),new T.Vector3(0,len*.5,0),new T.Vector3(.08,len*.5,0),new T.Vector3(.07,len*.45,0)],.018,fm,12));
    fk.add(tube([new T.Vector3(-.075,len*.48,0),new T.Vector3(-.075,len,0)],.018,fm,2));fk.add(tube([new T.Vector3(.075,len*.48,0),new T.Vector3(.075,len,0)],.018,fm,2));
    for(i=0;i<2;i++){var wv=mesh(new T.TorusGeometry(.15+i*.1,.006,6,30,PI*.6),glow(col,.6));wv.position.y=len*1.05;wv.rotation.z=PI*.2;fk.add(wv);anim.push((function(o,ph){return function(t){o.material.opacity=.2+.6*Math.max(0,Math.sin(t*3-ph));};})(wv,i));}
    attach(fk,shape,dir,.95);g.add(fk);return g;
  }
  return null;
}

function makeEye(c,pi,grp,shape,L){
  var fv=pi.fv||0,single=fv===1||fv===5||fv===8,G=pi.G,ex=(G.ex*.9+.05),ey=-(.04+G.ey*.4),z=.17*(single?1.55:1)*(.5+.5*L);
  var IC=hsl(pi.tot<.5?255:pi.h,.95,.72);
  var xs=single?[0]:[-ex,ex];eyes=[];
  xs.forEach(function(x){
    var d=new T.Vector3(x,ey,Math.sqrt(Math.max(.1,1-x*x-ey*ey))).normalize(),pos=shape(d).multiplyScalar(.93),e=new T.Group();
    var ball=mesh(new T.SphereGeometry(z,32,24),glass(new T.Color(.05,.04,.14),.92,.5),6);ball.scale.z=.55;e.add(ball);
    var iris=mesh(new T.TorusGeometry(z*.62,z*.1,10,48),glow(IC,.95),7);iris.position.z=z*.5;e.add(iris);
    if(fv===1||fv===2){iris.scale.set(.55,1.25,1);}
    if(fv===7){var ir2=mesh(new T.TorusGeometry(z*.36,z*.06,8,40),glow(IC,.8),7);ir2.position.z=z*.52;e.add(ir2);}
    if(fv===5){for(var k=0;k<6;k++){var pt=mesh(new T.SphereGeometry(z*.14,10,8),glow(IC,.9),7);pt.position.set(Math.cos(k*PI/3)*z*.62,Math.sin(k*PI/3)*z*.62,z*.5);pt.scale.set(.7,1.6,.7);pt.rotation.z=k*PI/3-PI/2;e.add(pt);}}
    var pup=mesh(new T.CircleGeometry(z*(fv===1||fv===2?.12:.3),24),new T.MeshBasicMaterial({color:0x05030f,transparent:true,opacity:.95,depthWrite:false}),8);pup.position.z=z*.56;if(fv===1)pup.scale.set(.5,3,1);e.add(pup);
    var hlt=sprite(new T.Color(1,1,1),z*.7,1);hlt.position.set(z*.28,z*.3,z*.62);hlt.renderOrder=9;e.add(hlt);
    var gl=sprite(IC,z*4,.35);gl.renderOrder=5;e.add(gl);
    e.position.copy(pos);e.lookAt(pos.clone().multiplyScalar(3).add(new T.Vector3(0,0,2)));grp.add(e);eyes.push(e);
  });
}

// ---------------- 属性の3D飾り ----------------
function buildElement(c,grp,shape,r){
  var el=c.el,i,m;if(!el)return;
  if(el==="g"){for(i=0;i<16;i++){var d=new T.Vector3(r()*2-1,r()*2-1,r()*1.6-.4).normalize(),sh=new T.Shape(),lz=.16+r()*.08;sh.moveTo(0,0);sh.quadraticCurveTo(lz*.55,lz*.5,0,lz*1.5);sh.quadraticCurveTo(-lz*.55,lz*.5,0,0);
    m=mesh(new T.ShapeGeometry(sh,8),glass(hsl(105+r()*45,.55,.55),.55,.5),6);var lg=new T.Group();lg.add(m);attach(lg,shape,d,.98);m.rotation.y=r()*PI;m.rotation.x=-.5;grp.add(lg);
    if(i<3)anim.push((function(o,ph){return function(t){var k=((t*.06+ph)%1);o.position.y=k*.9;o.position.x=k*.6;o.rotation.z=k*6;o.material.opacity=k<.85?1:(1-k)/.15;};})(m,i/3));}}
  if(el==="f"){for(i=0;i<9;i++){var fd=new T.Vector3(Math.cos(PI*(.08+i*.105)),Math.sin(PI*(.08+i*.105)),.2).normalize(),fs=sprite(hsl(14+(i%3)*12,1,.58),.55+.25*Math.sin(i/8*PI),.75);fs.position.copy(shape(fd).multiplyScalar(1.12));fs.scale.y*=1.6;grp.add(fs);
      anim.push((function(o,b,ph){return function(t){o.position.y=b.y+Math.sin(t*9+ph)*.03;o.material.opacity=.55+.3*Math.sin(t*13+ph);o.scale.y=o.userData.h*(1+.2*Math.sin(t*11+ph));};})(fs,fs.position.clone(),r()*6));fs.userData.h=fs.scale.y;}
    var fg=sprite(hsl(25,1,.55),5.5,.35);fg.renderOrder=0;grp.add(fg);}
  if(el==="i"){for(i=0;i<10;i++){var id=new T.Vector3(r()*2-1,.2+r()*.8,r()*1.4-.3).normalize(),og=new T.OctahedronGeometry(1,0);og.computeVertexNormals();m=mesh(og,glass(hsl(195,.6,.92),.3,.9),6);var hh=.12+r()*.18;m.scale.set(.045,hh,.045);var ig=new T.Group();ig.add(m);m.position.y=hh*.7;attach(ig,shape,id,.97);grp.add(ig);}
    grp.add(sprite(hsl(190,.9,.8),5,.25));}
  if(el==="t"){for(i=0;i<5;i++){var td=new T.Vector3(r()*2-1,r()*2-1,r()*1.2-.2).normalize(),pts=[],b=shape(td).multiplyScalar(1.02);for(var k=0;k<5;k++){pts.push(b.clone().add(td.clone().multiplyScalar(k*.12)).add(new T.Vector3(r()-.5,r()-.5,r()-.5).multiplyScalar(.12)));}
      m=tube(pts,.012,glow(hsl(52,1,.72),0),10);grp.add(m);anim.push((function(o,ph,sp){return function(t){var k=(t*sp+ph)%1;o.material.opacity=k>.9?(k>.95?1:.2):0;};})(m,r(),.35+r()*.3));}
    grp.add(sprite(hsl(52,1,.7),4.6,.22));}
  if(el==="s"){var ring=new T.Group();ring.rotation.set(.35,0,-.3);for(i=0;i<7;i++){var ss=sprite(hsl(250+i*15,1,.85),.28,1);ss.position.set(Math.cos(i/7*TAU)*1.55,0,Math.sin(i/7*TAU)*1.55);ring.add(ss);}
    ring.add(mesh(new T.TorusGeometry(1.55,.004,4,120),glow(hsl(265,.8,.8),.25)));ring.children[ring.children.length-1].rotation.x=PI/2;grp.add(ring);anim.push(function(t){ring.rotation.y=t*.12;});
    grp.add(sprite(hsl(268,.9,.7),5.2,.25));}
  if(el==="w"){grp.add(sprite(hsl(200,.9,.75),4.6,.18));}
}

// ---------------- 生き物を組み立てる ----------------
function dispose(o){o.traverse(function(n){if(n.geometry)n.geometry.dispose();if(n.material){if(n.material.dispose)n.material.dispose();}});}
function build(c,pi){
  if(creature){spin.remove(creature.g);dispose(creature.g);}
  anim=[];eyes=[];
  var sd=c.seed||1,r=rngS(sd*13+5),gv=c.gv||{dis:.5,tra:.5,glo:.5,flt:.5,den:.5},g=new T.Group(),shape=shapeFn(pi,sd);
  dead=!!c.dead;U.uSat.value=dead?0:1;
  var h=pi.tot<.5?200:pi.h,nh=pi.tot<.5?196:pi.h,sat=Math.min(.75,Math.max(.25,(pi.tot||0)*.07));
  // 外膜
  var geo=new T.SphereGeometry(1,120,80),pos=geo.attributes.position,v=new T.Vector3();
  for(var i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).normalize();var q=shape(v);pos.setXYZ(i,q.x,q.y,q.z);}
  geo.computeVertexNormals();
  var memU={uT:U.uT,uSat:U.uSat,uGlow:U.uGlow,uGlowAmt:U.uGlowAmt,uWob:{value:dead?0:.012+.03*gv.dis},uTint:{value:hsl(h,sat,.85)},uAlpha:{value:.6+.35*(1-gv.tra)}};
  var back=new T.ShaderMaterial({uniforms:Object.assign({},memU,{uAlpha:{value:memU.uAlpha.value*.45}}),vertexShader:MEM_V,fragmentShader:MEM_F,transparent:true,depthWrite:false,side:T.BackSide});
  var front=new T.ShaderMaterial({uniforms:memU,vertexShader:MEM_V,fragmentShader:MEM_F,transparent:true,depthWrite:false,side:T.FrontSide});
  g.add(mesh(geo,back,1));g.add(mesh(geo,front,7));
  // もや(体積)
  var nucR=.88,nuc=new T.ShaderMaterial({uniforms:{uT:U.uT,uSat:U.uSat,uCam:{value:new T.Vector3()},uC1:{value:hsl(nh,.45,.88)},uC2:{value:hsl(nh,.65,.52)},uOff:{value:new T.Vector3(r()*20,r()*20,r()*20)},
    uDen:{value:(.75+.4*gv.den)*(dead?.6:1)},uCore:{value:.52+.1*gv.glo},uR:{value:nucR}},vertexShader:NUC_V,fragmentShader:NUC_F,transparent:true,depthWrite:false,side:T.FrontSide});
  nucMesh=mesh(new T.SphereGeometry(nucR,48,32),nuc,2);nucMesh.position.set((r()-.5)*.12,(r()-.5)*.1,0);g.add(nucMesh);
  var core=sprite(hsl(nh,.6,.8),.9+.6*gv.glo,.12+.2*gv.glo);core.renderOrder=3;g.add(core);
  // 泡
  var NB=56,bm=new T.ShaderMaterial({uniforms:{uC:{value:new T.Color(.9,.95,1)},uBase:{value:.02},uRim:{value:.85},uSat:U.uSat},vertexShader:GL_V,fragmentShader:GL_F,transparent:true,depthWrite:false});
  bub=new T.InstancedMesh(new T.SphereGeometry(1,14,10),bm,NB);bub.renderOrder=4;bubData=[];
  for(i=0;i<NB;i++)bubData.push(newBub(r,true));g.add(bub);
  // 細い光の筋
  var fa=r()*TAU,fstart=new T.Vector3(Math.cos(fa),Math.sin(fa)*.8,.35).normalize().multiplyScalar(.97),fp=[fstart];
  for(i=1;i<=6;i++){fp.push(fstart.clone().multiplyScalar(1-i*.11).add(new T.Vector3(r()-.5,r()-.5,r()-.5).multiplyScalar(.1)));}
  filMat=glow(hsl(nh+150,.8,.78),.5);var fil=tube(fp,.006,filMat,60);fil.renderOrder=5;g.add(fil);
  var fil2=tube(fp,.02,glow(hsl(nh+150,.8,.7),.12),60);fil2.renderOrder=5;g.add(fil2);
  // 後光
  var halo=sprite(hsl(h,.7,.8),4.4+gv.glo*1.4,.22+.25*gv.glo);halo.renderOrder=0;g.add(halo);
  // 器官と属性
  buildOrgans(c,pi,g,shape);buildElement(c,g,shape,rngS(sd+21));
  spin.add(g);
  creature={g:g,R:pi.R||33,flt:gv.flt,front:front};
  place();
}
function newBub(r,init){var inNuc=r()<.75,ang=inNuc?(-.3+r()*1.6):r()*TAU,dd=inNuc?.15+r()*.55:.7+r()*.18,s=.008+r()*r()*.035;
  var p=new T.Vector3(Math.cos(ang)*dd,(init?Math.sin(ang)*dd:-.8+r()*.2),(r()-.5)*.9*Math.sqrt(Math.max(0,1-dd*dd)));
  if(!inNuc)p.set(Math.cos(ang)*dd,Math.sin(ang)*dd,(r()-.5)*.4);
  return {p:p,s:s,v:.01+r()*.03,ph:r()*TAU,rim:!inNuc};}

// ---------------- 毎フレーム ----------------
var tmpM=new T.Matrix4(),tmpQ=new T.Quaternion(),tmpS=new T.Vector3(),camL=new T.Vector3(),rnd=rngS(99);
function loop(now){
  requestAnimationFrame(loop);
  if(!ok||!creature||!shown||!onscreen||document.hidden){lastT=0;return;}
  var dt=lastT?Math.min(.05,(now-lastT)/1000):.016;lastT=now;
  // 重いときは解像度を下げる
  frameMs=frameMs*.95+dt*1000*.05;frames++;
  if(frames%90===0){if(frameMs>26&&dpr>.8){dpr=Math.max(.8,dpr-.25);place();}else if(frameMs<15&&dpr<Math.min(1.75,window.devicePixelRatio||1)){dpr=Math.min(1.75,dpr+.25);place();}}
  var sp=dead?0:(RM?.15:1);tAcc+=dt*sp;var t=tAcc;U.uT.value=t;
  // 浮遊・呼吸・つつき・回転
  var fa=.45+1.5*(creature.flt||.5);
  root.position.y=RM||dead?0:Math.sin(t*.55)*.05*fa;
  var br=1+.022*Math.sin(t*1.25),pk=now/1000-poke,sx=1,sy=1;
  if(pk<1){var e=Math.exp(-pk*5)*Math.cos(pk*18);sx=1+.1*e;sy=1-.12*e;}
  spin.scale.set(br*sx,(2-br)*sy,br*sx);
  if(!drag){tgtY*=.97;tgtX*=.95;}
  dragY+=(tgtY-dragY)*.12;dragX+=(tgtX-dragX)*.12;
  spin.rotation.y=dragY+(RM||dead?0:Math.sin(t*.22)*.35);spin.rotation.x=dragX+(RM||dead?0:Math.sin(t*.17)*.06);
  // 吸収の光
  var ab=now/1000-absorbT;U.uGlowAmt.value=ab<1.4?Math.sin(Math.min(1,ab/1.4)*PI)*.9:0;
  // 泡
  if(bub){for(var i=0;i<bubData.length;i++){var b=bubData[i];if(!dead){b.p.y+=b.v*dt*(b.rim?.3:1);b.p.x+=Math.sin(t*1.3+b.ph)*.0006;}
      if(b.p.length()>(b.rim?.9:.82)){bubData[i]=newBub(rnd,false);b=bubData[i];}
      tmpS.setScalar(b.s);tmpM.compose(b.p,tmpQ,tmpS);bub.setMatrixAt(i,tmpM);}bub.instanceMatrix.needsUpdate=true;}
  if(filMat)filMat.opacity=dead?.1:.25+.6*Math.pow(Math.max(0,Math.sin(t*.8)),8)+.1*Math.random()*(Math.sin(t*.8)>.9?1:0);
  // まばたき
  if(eyes.length&&!dead){blink-=dt;var bk=1;if(blink<0){if(blink<-.16)blink=3+Math.random()*4;else bk=.12;}eyes.forEach(function(e){e.scale.y+=(bk-e.scale.y)*.5;});}
  for(var k=0;k<anim.length;k++)anim[k](t);
  if(nucMesh){nucMesh.updateMatrixWorld();camL.copy(camera.position);nucMesh.worldToLocal(camL);nucMesh.material.uniforms.uCam.value.copy(camL);}
  renderer.render(scene,camera);
}

// ---------------- 外から呼ぶ ----------------
return {
  init:function(b){return init(b);},
  ok:function(){return ok;},
  show:function(v){shown=v;if(canvas)canvas.style.display=v?"":"none";if(v){lastT=0;place();}},
  update:function(c,pi){if(!ok)return;var k=JSON.stringify([c.seed,c.parts,c.tr,c.el,c.gv,!!c.dead,pi.R,pi.h]);if(k===key){place();return;}key=k;build(c,pi);},
  place:place,
  poke:function(){poke=performance.now()/1000;},
  absorb:function(col){absorbT=performance.now()/1000;try{U.uGlow.value.set(col.replace(/hsl\((\d+) (\d+)% (\d+)%\)/,"hsl($1, $2%, $3%)"));}catch(e){}}
};
})();
