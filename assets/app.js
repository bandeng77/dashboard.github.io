/* Mainmenu Genetek — kantor 3D (dipakai oleh / dan /admin) */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const MODE=document.body.dataset.mode==="admin"?"admin":"public";
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0}

/* =========================================================
   BUILDING GEOMETRY (sesuai layout_kantor.docx)
   r = arah atas-bawah denah, c = arah kiri-kanan denah
   ========================================================= */
const DD=16, WW=16, TW=56, TH=28, FH=84, WALLH=74, PH=16, FLOORS=4;
const FZ=f=>8+f*FH;
const ENTRANCE=[7.5,10]; // pintu masuk (2) di sisi depan Lt 1

/* Denah gedung persegi 16 x 16 (1:1). r = atas-bawah denah, c = kiri-kanan denah */
const ROOM_DEFS=[
  // ---------- LANTAI 1 ----------
  {id:"7",f:0,name:"Pantry",type:"pantry",r0:0,c0:0,dr:4,dc:6.5,doors:[{s:"B",at:5.5}]},
  {id:"6",f:0,name:"Toilet",type:"toilet",r0:0,c0:7,dr:4,dc:3,doors:[{s:"B",at:8.5}]},
  {id:"8",f:0,name:"Tangga naik & turun",type:"stairs",r0:0,c0:13,dr:3,dc:3,both:true},
  {id:"1",f:0,name:"Ruang meeting",type:"meeting",r0:5,c0:0,dr:5.5,dc:6.5,doors:[{s:"R",at:7.5}]},
  {id:"RT",f:0,name:"Ruang tunggu",type:"waiting",open:true,r0:11,c0:0,dr:5,dc:6.5},
  {id:"5",f:0,name:"Area kerja",type:"cluster",open:true,r0:4.5,c0:11.5,dr:3.8,dc:4.5,clusters:[{r0:4.9,c0:12.5,rows:2,n:2,sp:1.2}],rug:true},
  {id:"4",f:0,name:"Resepsionis",type:"reception",open:true,r0:10,c0:12.5,dr:3.5,dc:3.5},
  {id:"3",f:0,name:"Meja logbook",type:"logbook",open:true,r0:14.4,c0:10.5,dr:1.6,dc:1.6},
  // ---------- LANTAI 2 ----------
  {id:"9",f:1,name:"Toilet",type:"toilet",r0:0,c0:0,dr:3.5,dc:8.5,doors:[{s:"R",at:2}]},
  {id:"10",f:1,name:"Ruang direktur",type:"exec",r0:3.5,c0:0,dr:4,dc:8.5,doors:[{s:"R",at:5.5}]},
  {id:"11",f:1,name:"Ruang meeting",type:"meeting",r0:7.5,c0:0,dr:4,dc:8.5,doors:[{s:"R",at:9.5}]},
  {id:"12",f:1,name:"Ruang komisaris",type:"exec",r0:11.5,c0:0,dr:4.5,dc:8.5,doors:[{s:"R",at:13}]},
  {id:"14",f:1,name:"Tangga turun",type:"stairs",r0:0,c0:12.5,dr:3,dc:1.75,down:true},
  {id:"13",f:1,name:"Tangga naik",type:"stairs",r0:0,c0:14.25,dr:3,dc:1.75},
  {id:"15",f:1,name:"Ruang finance",type:"cluster",r0:9,c0:10,dr:7,dc:6,doors:[{s:"L",at:10}],clusters:[{r0:9.7,c0:10.8,rows:2,n:3,sp:1.2},{r0:12.6,c0:10.8,rows:2,n:3,sp:1.2}],cabinets:true},
  // ---------- LANTAI 3 ----------
  {id:"20",f:2,name:"Ruang server",type:"server",r0:0,c0:0,dr:3.5,dc:3.5,doors:[{s:"B",at:2.5}]},
  {id:"19",f:2,name:"Ruang Manager SCM",type:"exec",r0:0,c0:3.5,dr:3.5,dc:3.5,doors:[{s:"B",at:6.5}]},
  {id:"18",f:2,name:"Toilet",type:"toilet",r0:0,c0:7.5,dr:3.5,dc:3.5,doors:[{s:"B",at:9}]},
  {id:"17",f:2,name:"Tangga turun",type:"stairs",r0:0,c0:12,dr:3,dc:1.75,down:true},
  {id:"16",f:2,name:"Tangga naik",type:"stairs",r0:0,c0:14,dr:3,dc:1.75},
  {id:"21",f:2,name:"Ruang finance",type:"office",r0:4.5,c0:0,dr:3.5,dc:3.5,doors:[{s:"R",at:6}]},
  {id:"22",f:2,name:"Ruang SCM",type:"office",r0:8,c0:0,dr:3.5,dc:3.5,doors:[{s:"R",at:10}]},
  {id:"27",f:2,name:"Ruang kerja Sales & Engineering",type:"cluster",r0:4.5,c0:5,dr:7,dc:10.5,doors:[{s:"L",at:6},{s:"B",at:10}],
    clusters:[{dir:"v",r0:6.1,c0:6.2,n:3,sp:1.2,group:"Engineering"},{dir:"v",r0:6.1,c0:11.3,n:3,sp:1.2,group:"Sales"}]},
  {id:"23",f:2,name:"Ruang Manager Engineering",type:"exec",r0:12.5,c0:0,dr:3.5,dc:3.5,doors:[{s:"T",at:2.5}]},
  {id:"24",f:2,name:"Ruang Manager Sales",type:"exec",r0:12.5,c0:4,dr:3.5,dc:3.5,doors:[{s:"T",at:6.5}]},
  {id:"25",f:2,name:"Ruang finance",type:"office",r0:12.5,c0:8,dr:3.5,dc:3.5,doors:[{s:"T",at:10.5}]},
  {id:"26",f:2,name:"Ruang HCCS",type:"office",r0:12.5,c0:12,dr:3.5,dc:3.5,doors:[{s:"T",at:14.5}]},
  // ---------- LANTAI 4 ----------
  {id:"34",f:3,name:"Service area",type:"service",r0:0,c0:0,dr:2.5,dc:10,doors:[{s:"R",at:1}]},
  {id:"33",f:3,name:"Gudang / arsip",type:"arsip",r0:2.5,c0:0,dr:3,dc:10,doors:[{s:"R",at:4}]},
  {id:"32",f:3,name:"Area kerja",type:"area",r0:5.5,c0:0,dr:10.5,dc:10,doors:[{s:"R",at:7},{s:"R",at:13.5}]},
  {id:"32.A",f:3,name:"Area kerja A",type:"cluster",open:true,zone:true,r0:5.8,c0:3.6,dr:2.7,dc:6,clusters:[{r0:5.9,c0:5.3,rows:2,n:2,sp:1.2}]},
  {id:"32.B",f:3,name:"Area kerja B",type:"cluster",open:true,zone:true,r0:9,c0:.5,dr:2.7,dc:9.2,clusters:[{r0:9.1,c0:2.85,rows:2,n:3,sp:1.5}]},
  {id:"32.C",f:3,name:"Area kerja C",type:"cluster",open:true,zone:true,r0:12.8,c0:.4,dr:2.9,dc:9.4,clusters:[{r0:13.6,c0:2.3,rows:1,n:3,sp:1.8}]},
  {id:"28",f:3,name:"Tangga turun & naik",type:"stairs",r0:0,c0:12.5,dr:3,dc:2.5,both:true},
  {id:"29",f:3,name:"Ruang meeting",type:"meeting",r0:3.5,c0:12,dr:4.5,dc:4,doors:[{s:"L",at:5.5}]},
  {id:"30",f:3,name:"Mushola",type:"mushola",r0:8.5,c0:12,dr:2,dc:4,doors:[{s:"L",at:9.5}]},
  {id:"31",f:3,name:"Area pantry",type:"pantry",r0:11,c0:10.5,dr:5,dc:5.5,doors:[{s:"L",at:13}]},
];
const DECO_WALLS=[{f:0,line:"h",at:9,from:12,to:15.5}];
const EDITABLE=new Set(["cluster","office","exec","reception","logbook","server","arsip","service"]);
const TYPE={
  meeting:{name:"Ruang meeting",floor:"#c4d2e3",chip:"#6f8fb8"},toilet:{name:"Toilet",floor:"#e3ecef",chip:"#8fb3c2"},stairs:{name:"Tangga",floor:"#d3cab8",chip:"#a99b78"},
  pantry:{name:"Pantry",floor:"#f0e9db",chip:"#e3a24a"},exec:{name:"Ruang pimpinan",floor:"#b8915f",chip:"#7b2f3b"},office:{name:"Ruang kerja",floor:"#e6d3b1",chip:"#c7a46a"},
  cluster:{name:"Area kerja",floor:"#e8d6b5",chip:"#c7a46a"},reception:{name:"Resepsionis",floor:"#e9e1d0",chip:"#0f7c72"},logbook:{name:"Meja logbook",floor:"#e9e1d0",chip:"#0f7c72"},
  server:{name:"Ruang server",floor:"#cfd5da",chip:"#3a4450"},arsip:{name:"Gudang / arsip",floor:"#d9d2c0",chip:"#a99b78"},service:{name:"Service area",floor:"#d5dad5",chip:"#6b7a86"},
  mushola:{name:"Mushola",floor:"#d7e6d2",chip:"#2f7d58"},waiting:{name:"Ruang tunggu",floor:"#e9e1d0",chip:"#7f9fb3"},area:{name:"Area kerja",floor:"#e8d6b5",chip:"#c7a46a"},
};
const HOME_ACT={cluster:"Bekerja",office:"Bekerja",exec:"Bekerja",reception:"Melayani tamu",logbook:"Jaga meja logbook",server:"Memantau server",arsip:"Mengurus arsip",service:"Siaga di service area",pantry:"Bertugas di pantry",meeting:"Rapat",mushola:"Di mushola"};
const JABATAN=["Direktur","Komisaris","Manager","Supervisor","Staf"];
const RANK=j=>{const i=JABATAN.indexOf(j);return i<0?9:i};
const PALETTE=["#3b3f8f","#c2477a","#2e8b57","#d17f22","#2f6fd6","#7b4fc4","#d14b3c","#168f9c","#8a6d2f","#5b6b7a","#b5368f","#4f8a2b"];
const ACT_COL={work:"#2fae61",meet:"#3b82f6",brk:"#f2a20c",talk:"#a35be0",move:"#8a95a0",out:"#f97316",home:"#64748b",none:"#8a95a0"};
const ACT_NAME={work:"Bekerja",meet:"Rapat",brk:"Istirahat",talk:"Diskusi",move:"Berjalan",out:"Di luar kantor",home:"Sudah pulang",none:"Belum punya kursi"};

/* =========================================================
   MESIN 3D (WebGL)
   Perabot tetap dibangun dengan fungsi lama (prism, poly, line, teks),
   tapi semuanya direkam menjadi geometri 3D: x = c, y = tinggi, z = r.
   1 satuan = 1 petak denah; tinggi 36 px gambar lama = 1 satuan.
   ========================================================= */
const stage=$("stage"),cv=$("cv"),ctx2=cv.getContext("2d");let ctx=ctx2;
let SW=0,SH=0,DPR=1;
const PXU=36,PS=.62,FOV=.52;
const P=(r,c,z=0)=>[r,c,z];
let ZF=0;const Q=(r,c,z=0)=>[r,c,ZF+z];
const W3=p=>[p[1],p[2]/PXU,p[0]];
const M4={
  id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  mul(a,b){const o=new Array(16);for(let i=0;i<4;i++){const b0=b[i*4],b1=b[i*4+1],b2=b[i*4+2],b3=b[i*4+3];for(let j=0;j<4;j++)o[i*4+j]=a[j]*b0+a[4+j]*b1+a[8+j]*b2+a[12+j]*b3}return o},
  T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
  S:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
  RX(a){const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
  RY(a){const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
  RZ(a){const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]},
  persp(fy,as,n,f){const t=1/Math.tan(fy/2);return[t/as,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]},
  look(e,t,u){const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],nrm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)},cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    const z=nrm(sub(e,t)),x=nrm(cr(u,z)),y=cr(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dt(x,e),-dt(y,e),-dt(z,e),1]},
  nmat(m){const a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],g=m[8],h=m[9],i=m[10];const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C||1e-9;
    return[A/det,B/det,C/det,-(b*i-c*h)/det,(a*i-c*g)/det,-(a*h-b*g)/det,(b*f-c*e)/det,-(a*f-c*d)/det,(a*e-b*d)/det]},
  app(m,v){return[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14],m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15]]},
  inv(m){const o=new Array(16),[a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=m;
    const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
    const det=1/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
    o[0]=(a11*b11-a12*b10+a13*b09)*det;o[1]=(a02*b10-a01*b11-a03*b09)*det;o[2]=(a31*b05-a32*b04+a33*b03)*det;o[3]=(a22*b04-a21*b05-a23*b03)*det;
    o[4]=(a12*b08-a10*b11-a13*b07)*det;o[5]=(a00*b11-a02*b08+a03*b07)*det;o[6]=(a32*b02-a30*b05-a33*b01)*det;o[7]=(a20*b05-a22*b02+a23*b01)*det;
    o[8]=(a10*b10-a11*b08+a13*b06)*det;o[9]=(a01*b08-a00*b10-a03*b06)*det;o[10]=(a30*b04-a31*b02+a33*b00)*det;o[11]=(a21*b02-a20*b04-a23*b00)*det;
    o[12]=(a11*b07-a10*b09-a12*b06)*det;o[13]=(a00*b09-a01*b07+a02*b06)*det;o[14]=(a31*b01-a30*b03-a32*b00)*det;o[15]=(a20*b03-a21*b01+a22*b00)*det;return o}
};
/* ---- bentuk dasar ---- */
function surf(fn,nu,nv){const Pp=[],Nn=[],I=[],e=1e-3;
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv,p=fn(u,v);Pp.push(...p);
    const pu=fn(Math.min(1,u+e),v),pu2=fn(Math.max(0,u-e),v),pv=fn(u,Math.min(1,v+e)),pv2=fn(u,Math.max(0,v-e));
    const du=[pu[0]-pu2[0],pu[1]-pu2[1],pu[2]-pu2[2]],dv=[pv[0]-pv2[0],pv[1]-pv2[1],pv[2]-pv2[2]];
    let n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]],l=Math.hypot(...n);
    if(l<1e-9){n=p.slice();l=Math.hypot(...n)||1}n=n.map(x=>x/l);if(n[0]*p[0]+n[1]*p[1]+n[2]*p[2]<0)n=n.map(x=>-x);Nn.push(...n)}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;I.push(a,c,b,b,c,d)}
  return{P:new Float32Array(Pp),N:new Float32Array(Nn),I:new Uint16Array(I)}}
const sgp=(x,e)=>Math.sign(x)*Math.pow(Math.abs(x),e);
const superE=(eu,ev,nu,nv)=>surf((u,v)=>{const U=u*Math.PI*2,V=(v-.5)*Math.PI;return[sgp(Math.cos(V),ev)*sgp(Math.cos(U),eu),sgp(Math.sin(V),ev),sgp(Math.cos(V),ev)*sgp(Math.sin(U),eu)]},nu,nv);
function boxMesh(){const Pp=[],Nn=[],I=[];const F=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,-1],[1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
  for(const[n,a,b]of F){const o=Pp.length/3;for(const[s,t]of[[-1,-1],[1,-1],[1,1],[-1,1]]){Pp.push(n[0]+a[0]*s+b[0]*t,n[1]+a[1]*s+b[1]*t,n[2]+a[2]*s+b[2]*t);Nn.push(...n)}I.push(o,o+1,o+2,o,o+2,o+3)}
  return{P:new Float32Array(Pp),N:new Float32Array(Nn),I:new Uint16Array(I)}}
function discMesh(n=24,inner=0){const Pp=[],Nn=[],I=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);Pp.push(c,0,s,c*inner,0,s*inner);Nn.push(0,1,0,0,1,0);if(i<n){const k=i*2;I.push(k,k+2,k+1,k+1,k+2,k+3)}}
  return{P:new Float32Array(Pp),N:new Float32Array(Nn),I:new Uint16Array(I)}}
const MESH={sph:superE(1,1,16,10),sphL:superE(1,1,10,7),rb:superE(.35,.35,14,10),soft:superE(.6,.6,14,10),limb:superE(1,.45,10,8),cyl:superE(1,.15,16,8),box:boxMesh(),disc:discMesh(24,0),ring:discMesh(32,.72)};
/* ---- warna ---- */
const COLC=new Map();
function parseCol(s){let k=COLC.get(s);if(k)return k;let em=0,t=String(s);if(t[0]==="!"){em=1;t=t.slice(1)}let r=0,g=0,b=0,a=1;
  if(t[0]==="#"){const n=parseInt(t.slice(1,7),16);r=n>>16;g=n>>8&255;b=n&255}else{const m=t.match(/[\d.]+/g)||[0,0,0];r=+m[0];g=+m[1];b=+m[2];if(m[3]!=null)a=+m[3]}
  k=[r/255,g/255,b/255,a,em];COLC.set(s,k);return k}
/* ---- penampung geometri (batch) ---- */
const newB=()=>({P:[],N:[],C:[],I:[],n:0,parts:[]});
function bFlush(B){if(B.n){B.parts.push({P:new Float32Array(B.P),N:new Float32Array(B.N),C:new Float32Array(B.C),I:new Uint16Array(B.I)});B.P=[];B.N=[];B.C=[];B.I=[];B.n=0}}
function bPoly(B,w,c){const n=w.length;if(n<3)return;let nx=0,ny=0,nz=0;for(let i=0;i<n;i++){const a=w[i],b=w[(i+1)%n];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
  const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;if(B.n+n>65000)bFlush(B);const o=B.n,al=c[4]?-Math.max(.01,c[3]):c[3];
  for(const p of w){B.P.push(p[0],p[1],p[2]);B.N.push(nx,ny,nz);B.C.push(c[0],c[1],c[2],al)}for(let i=1;i<n-1;i++)B.I.push(o,o+i,o+i+1);B.n+=n}
function bMesh(B,m,M,c){const nv=m.P.length/3;if(B.n+nv>65000)bFlush(B);const o=B.n,NM=M4.nmat(M),al=c[4]?-c[3]:c[3];
  for(let i=0;i<nv;i++){const x=m.P[i*3],y=m.P[i*3+1],z=m.P[i*3+2],a=m.N[i*3],b=m.N[i*3+1],d=m.N[i*3+2];
    B.P.push(M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]);
    let nx=NM[0]*a+NM[3]*b+NM[6]*d,ny=NM[1]*a+NM[4]*b+NM[7]*d,nz=NM[2]*a+NM[5]*b+NM[8]*d;const l=Math.hypot(nx,ny,nz)||1;B.N.push(nx/l,ny/l,nz/l);B.C.push(c[0],c[1],c[2],al)}
  for(const i of m.I)B.I.push(o+i);B.n+=nv}
/* ---- perekam: fungsi gambar lama → geometri 3D ---- */
let REC=null,BV=0;
const STUB=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:()=>STUB,set:(o,k,v)=>{o[k]=v;return true}});
const withA=(c,a)=>a>=.999?c:[c[0],c[1],c[2],c[3]*a,c[4]];
const recBin=(c,low)=>low?REC.decal:(c[3]<.99?REC.trans:REC.solid);
function poly(pts,fill,stroke,lw){if(!REC)return;
  if(fill){const c=withA(parseCol(fill),STUB.globalAlpha),z0=pts[0][2],flat=pts.every(p=>Math.abs(p[2]-z0)<1e-6);bPoly(recBin(c,flat&&z0-ZF<=.35),pts.map(W3),c)}
  if(stroke)for(let i=0;i<pts.length;i++)line(pts[i],pts[(i+1)%pts.length],stroke,lw||1)}
function line(a,b,col,w){if(!REC)return;const c=withA(parseCol(col),STUB.globalAlpha),A=W3(a),B=W3(b),ww=Math.max(.014,(w||1)/44);
  if(Math.abs(a[2]-b[2])<1e-6){const dx=B[0]-A[0],dz=B[2]-A[2],l=Math.hypot(dx,dz)||1,px=-dz/l*ww/2,pz=dx/l*ww/2;
    bPoly(recBin(c,a[2]-ZF<=.35),[[A[0]+px,A[1],A[2]+pz],[B[0]+px,B[1],B[2]+pz],[B[0]-px,B[1],B[2]-pz],[A[0]-px,A[1],A[2]-pz]],c);return}
  const bin=recBin(c,false),h=ww/2;bPoly(bin,[[A[0]-h,A[1],A[2]],[B[0]-h,B[1],B[2]],[B[0]+h,B[1],B[2]],[A[0]+h,A[1],A[2]]],c);bPoly(bin,[[A[0],A[1],A[2]-h],[B[0],B[1],B[2]-h],[B[0],B[1],B[2]+h],[A[0],A[1],A[2]+h]],c)}
const shadeCache={};
function shade(hex,f){const k=hex+f;if(shadeCache[k])return shadeCache[k];
  let r,g,b;if(hex[0]==="#"){const n=parseInt(hex.slice(1,7),16);r=n>>16;g=n>>8&255;b=n&255}else{const m2=hex.match(/[\d.]+/g)||[0,0,0];r=+m2[0];g=+m2[1];b=+m2[2]}const m=f<0?0:255,a=Math.abs(f);
  r=Math.round(r+(m-r)*a);g=Math.round(g+(m-g)*a);b=Math.round(b+(m-b)*a);return shadeCache[k]=`rgb(${r},${g},${b})`}
function prism(r0,c0,dr,dc,z0,h,col,opt={}){if(!REC)return;const r1=r0+dr,c1=c0+dc,z1=z0+h;const sideL=opt.left||col,sideR=opt.right||col,top=opt.top||col;
  const q=(r,c,z)=>[r,c,ZF+z];
  poly([q(r1,c0,z0),q(r1,c1,z0),q(r1,c1,z1),q(r1,c0,z1)],sideL);poly([q(r0,c0,z0),q(r0,c1,z0),q(r0,c1,z1),q(r0,c0,z1)],sideL);
  poly([q(r0,c1,z0),q(r1,c1,z0),q(r1,c1,z1),q(r0,c1,z1)],sideR);poly([q(r0,c0,z0),q(r1,c0,z0),q(r1,c0,z1),q(r0,c0,z1)],sideR);
  if(!opt.noTop){if(h<.01){const c=withA(parseCol(top),STUB.globalAlpha);bPoly(recBin(c,false),[q(r0,c0,z1),q(r0,c1,z1),q(r1,c1,z1),q(r1,c0,z1)].map(W3),c)}else poly([q(r0,c0,z1),q(r0,c1,z1),q(r1,c1,z1),q(r1,c0,z1)],top)}}
const faceL=(rr,c1,c2,z1,z2,f)=>poly([Q(rr,c1,z1),Q(rr,c2,z1),Q(rr,c2,z2),Q(rr,c1,z2)],f);
const faceR=(cc,r1,r2,z1,z2,f)=>poly([Q(r1,cc,z1),Q(r2,cc,z1),Q(r2,cc,z2),Q(r1,cc,z2)],f);
const floorQ=(r1,c1,r2,c2,z,f,s,lw)=>poly([Q(r1,c1,z),Q(r1,c2,z),Q(r2,c2,z),Q(r2,c1,z)],f,s,lw);
/* benda bulat (tanaman, kursi bundar, dll.) langsung sebagai mesh */
function g3(mesh,r,c,z,sc,sh,sr,col,rotY=0){if(!REC)return;const k=withA(parseCol(col),STUB.globalAlpha);
  const M=M4.mul(M4.T(c,(ZF+z)/PXU,r),M4.mul(M4.RY(rotY),M4.S(sc,sh/PXU,sr)));bMesh(k[3]<.99?REC.trans:REC.solid,MESH[mesh],M,k)}
/* teks di bidang (lantai / dinding) jadi tekstur */
const TEXC=new Map();let TEXGEN=0;
function textTex(text,color,weight=800){const key=text+"|"+color+"|"+weight+"|"+TEXGEN;let t=TEXC.get(key);if(t)return t;
  const c=document.createElement("canvas"),x=c.getContext("2d");x.font=`${weight} 64px Manrope, sans-serif`;const w=Math.ceil(x.measureText(text).width)+16;c.width=w;c.height=84;
  x.font=`${weight} 64px Manrope, sans-serif`;x.fillStyle=color;x.textAlign="center";x.textBaseline="middle";x.fillText(text,w/2,44);t={c,w,h:84,tex:null};TEXC.set(key,t);return t}
function recText(o,u,v,kx,ky,text,color,decal,weight){if(!REC)return;const t=textTex(text,color,weight),hw=t.w*kx/2,hh=t.h*ky/2;
  const p=(a,b)=>[o[0]+u[0]*a+v[0]*b,o[1]+u[1]*a+v[1]*b,o[2]+u[2]*a+v[2]*b];REC.texts.push({t,decal,q:[p(-hw,-hh),p(hw,-hh),p(hw,hh),p(-hw,hh)]})}
const TXV=Math.hypot(TW/2,TH/2)*.62/64;
function textL(rr,c,z,text,s,color){recText(W3(Q(rr,c,z)),[1,0,0],[0,-1,0],s/64,TXV*s/PXU,text,color,false)}
function textR(cc,r,z,text,s,color){recText(W3(Q(r,cc,z)),[0,0,-1],[0,-1,0],s/64,TXV*s/PXU,text,color,false)}
function textFloor(r,c,text,s,color,z=0){recText(W3(Q(r,c,z+.05)),[1,0,0],[0,0,1],s/64,s/64,text,color,true)}
function planeText(){}
function signL(rr,c1,c2,z,h,bg,text,fg="#fff"){faceL(rr,c1,c2,z,z+h,bg);const s=Math.min((c2-c1)*.86/(Math.max(1,text.length)*.6),h*.034);textL(rr+.012,(c1+c2)/2,z+h/2,text,s,fg)}
function signR(cc,r1,r2,z,h,bg,text,fg="#fff"){faceR(cc,r1,r2,z,z+h,bg);const s=Math.min((r2-r1)*.86/(Math.max(1,text.length)*.6),h*.034);textR(cc+.012,(r1+r2)/2,z+h/2,text,s,fg)}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function record(fn){const prev=ctx;REC={solid:newB(),decal:newB(),trans:newB(),texts:[],zf:ZF};const z0=ZF;STUB.globalAlpha=1;ctx=STUB;
  try{fn()}catch(e){console.error(e)}finally{ctx=prev;ZF=z0}const r=REC;REC=null;return glUpload(r)}
/* ---- WebGL ---- */
let gl=null;const GLS={};
function glInit(canvas){try{gl=canvas.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:false})||canvas.getContext("experimental-webgl")}catch{gl=null}if(!gl)return false;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
  const prog=(vs,fs)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);return p};
  GLS.L=prog(`attribute vec3 p,n;attribute vec4 c;uniform mat4 M,VP;uniform mat3 NM;uniform vec4 C;uniform float VC;varying vec3 vN,vW;varying vec4 vC;
void main(){vec4 w=M*vec4(p,1.);vW=w.xyz;vN=NM*n;vC=VC>.5?c:C;gl_Position=VP*w;}`,
  `precision mediump float;varying vec3 vN,vW;varying vec4 vC;uniform vec3 L,E,SKY,GND;uniform float DI,AM,AL;
void main(){float a=abs(vC.a)*AL;if(vC.a<0.){gl_FragColor=vec4(vC.rgb,a);return;}vec3 n=normalize(vN);vec3 v=normalize(E-vW);if(dot(n,v)<0.)n=-n;
float d=max(dot(n,L),0.);vec3 hm=mix(GND,SKY,n.y*.5+.5);vec3 h=normalize(L+v);float sp=pow(max(dot(n,h),0.),32.)*.1*DI;float rim=pow(1.-max(dot(n,v),0.),3.)*.1;
gl_FragColor=vec4(vC.rgb*(hm*AM+d*DI)+sp+rim*SKY*.6,a);}`);
  GLS.T=prog(`attribute vec3 p;attribute vec2 uv;uniform mat4 VP;varying vec2 vU;void main(){vU=uv;gl_Position=VP*vec4(p,1.);}`,
  `precision mediump float;uniform sampler2D T;uniform float AL;varying vec2 vU;void main(){vec4 t=texture2D(T,vU);gl_FragColor=vec4(t.rgb,t.a*AL);}`);
  const L={};for(const k of["M","VP","NM","C","VC","L","E","SKY","GND","DI","AM","AL"])L[k]=gl.getUniformLocation(GLS.L,k);for(const k of["p","n","c"])L["a"+k]=gl.getAttribLocation(GLS.L,k);GLS.l=L;
  const T={};for(const k of["VP","T","AL"])T[k]=gl.getUniformLocation(GLS.T,k);T.ap=gl.getAttribLocation(GLS.T,"p");T.auv=gl.getAttribLocation(GLS.T,"uv");GLS.t=T;
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);GLS.mb=new Map();return true}
function glBuf(data,el){const b=gl.createBuffer(),t=el?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER;gl.bindBuffer(t,b);gl.bufferData(t,data,gl.STATIC_DRAW);return b}
function glUpload(r){const up=B=>{bFlush(B);return B.parts.map(p=>gl?{p:glBuf(p.P),n:glBuf(p.N),c:glBuf(p.C),i:glBuf(p.I,true),k:p.I.length}:null).filter(Boolean)};
  const out={solid:up(r.solid),decal:up(r.decal),trans:up(r.trans),texts:[]};
  if(gl&&r.texts.length){const V=[];for(const x of r.texts){const[a,b,c,d]=x.q;V.push(...a,0,0,...b,1,0,...c,1,1,...a,0,0,...c,1,1,...d,0,1)}out.tbuf=glBuf(new Float32Array(V));
    out.texts=r.texts.map((x,i)=>({t:x.t,decal:x.decal,first:i*6}))}
  return out}
function glFree(b){if(!b||!gl)return;for(const k of["solid","decal","trans"])for(const p of b[k]||[]){gl.deleteBuffer(p.p);gl.deleteBuffer(p.n);gl.deleteBuffer(p.c);gl.deleteBuffer(p.i)}if(b.tbuf)gl.deleteBuffer(b.tbuf)}
const ID4=M4.id(),ID3=[1,0,0,0,1,0,0,0,1];
function drawParts(parts,al=1){const L=GLS.l;if(!parts||!parts.length)return;gl.uniformMatrix4fv(L.M,false,ID4);gl.uniformMatrix3fv(L.NM,false,ID3);gl.uniform1f(L.VC,1);gl.uniform1f(L.AL,al);gl.enableVertexAttribArray(L.ap);gl.enableVertexAttribArray(L.an);gl.enableVertexAttribArray(L.ac);
  for(const p of parts){gl.bindBuffer(gl.ARRAY_BUFFER,p.p);gl.vertexAttribPointer(L.ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,p.n);gl.vertexAttribPointer(L.an,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,p.c);gl.vertexAttribPointer(L.ac,4,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,p.i);gl.drawElements(gl.TRIANGLES,p.k,gl.UNSIGNED_SHORT,0)}}
function texOf(t){if(!t.tex){t.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.c);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}return t.tex}
function drawTexts(b,VP,decal,al=1){if(!b||!b.texts.length)return;const T=GLS.t;gl.useProgram(GLS.T);gl.uniformMatrix4fv(T.VP,false,VP);gl.uniform1f(T.AL,al);gl.uniform1i(T.T,0);gl.activeTexture(gl.TEXTURE0);
  gl.bindBuffer(gl.ARRAY_BUFFER,b.tbuf);gl.enableVertexAttribArray(T.ap);gl.enableVertexAttribArray(T.auv);gl.vertexAttribPointer(T.ap,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(T.auv,2,gl.FLOAT,false,20,12);
  for(const x of b.texts){if(x.decal!==decal)continue;gl.bindTexture(gl.TEXTURE_2D,texOf(x.t));gl.drawArrays(gl.TRIANGLES,x.first,6)}
  gl.disableVertexAttribArray(T.auv);gl.useProgram(GLS.L)}
function meshBuf(m){let b=GLS.mb.get(m);if(!b){b={p:glBuf(m.P),n:glBuf(m.N),i:glBuf(m.I,true),k:m.I.length};GLS.mb.set(m,b)}return b}
/* daftar gambar objek bergerak (karakter), dikelompokkan per bentuk */
function drawNodes(list){const L=GLS.l;if(!list.length)return;gl.enableVertexAttribArray(L.ap);gl.enableVertexAttribArray(L.an);gl.uniform1f(L.VC,0);gl.disableVertexAttribArray(L.ac);gl.vertexAttrib4f(L.ac,1,1,1,1);
  gl.uniform1f(L.AL,1);list.sort((a,b)=>a.m===b.m?0:a.m.I.length-b.m.I.length);let cur=null;
  for(const d of list){if(d.m!==cur){cur=d.m;const b=meshBuf(cur);gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.vertexAttribPointer(L.ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.vertexAttribPointer(L.an,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.i)}
    gl.uniformMatrix4fv(L.M,false,d.M);gl.uniformMatrix3fv(L.NM,false,M4.nmat(d.M));gl.uniform4f(L.C,d.c[0],d.c[1],d.c[2],d.c[4]?-d.a:d.a);gl.drawElements(gl.TRIANGLES,GLS.mb.get(cur).k,gl.UNSIGNED_SHORT,0)}
  gl.enableVertexAttribArray(L.ac)}

/* =========================================================
   FURNITURE BUILDERS — each returns drawables, walk-blocks, seats, spots
   ========================================================= */
/* Model kursi & meja yang bisa dipilih di /admin → Atur meja & kursi */
const CHAIR_STYLES={office:{name:"Kantor",col:"#37404d",back:15},mesh:{name:"Jaring",col:"#1f8f86",back:17},boss:{name:"Pimpinan",col:"#2a2a2e",back:24},
  guest:{name:"Tamu",col:"#7b2f3b",back:13,legs:true},stool:{name:"Stool",col:"#e3a24a",stool:true}};
function chairItems(out,s,col="#37404d"){const{r,c,face}=s;const st=CHAIR_STYLES[s.cs]||(s.boss?CHAIR_STYLES.boss:null),cc=st?st.col:col;
  if(st&&st.stool){out.push({k:r+c-.06,d:()=>{g3("cyl",r,c,5.5,.03,5.5,.03,"#7a8590");g3("cyl",r,c,.5,.16,.5,.16,"#7a8590");g3("cyl",r,c,11,.2,1.2,.2,cc)}});return}
  out.push({k:r+c-.06,d:()=>{prism(r-.2,c-.2,.4,.4,9,3,cc,{top:shade(cc,.14)});
    if(st&&st.legs){for(const[a,b]of[[-.17,-.17],[-.17,.17],[.17,-.17],[.17,.17]])prism(r+a-.02,c+b-.02,.04,.04,0,9,"#4a3a30")}
    else{g3("cyl",r,c,4.5,.025,4.5,.025,"#59616b");for(let i=0;i<5;i++){const a=i/5*Math.PI*2;g3("box",r+Math.cos(a)*.1,c+Math.sin(a)*.1,.6,.11,.6,.02,"#3a3f45",-a)}}}});
  let br,bc,dr,dc;
  if(face==="up"){br=r+.2;bc=c-.2;dr=.07;dc=.4}else if(face==="down"){br=r-.27;bc=c-.2;dr=.07;dc=.4}
  else if(face==="left"){br=r-.2;bc=c+.2;dr=.4;dc=.07}else{br=r-.2;bc=c-.27;dr=.4;dc=.07}
  const hh=st?st.back:(s.boss?22:15);out.push({k:br+dr/2+bc+dc/2,d:()=>prism(br,bc,dr,dc,11,hh,cc,{top:shade(cc,.14)})});
}
const scr=seed=>["!#8ec9ee","!#9fd3f2","!#a9c7f3"][Math.abs(Math.round(seed*7))%3];
function monitor(r,c,screenVisible,seed){prism(r,c-.3,.06,.6,14,15,"#2b2f36");
  if(screenVisible)faceL(r+.064,c-.25,c+.25,17,27,scr(seed));else faceL(r-.004,c-.25,c+.25,17,27,scr(seed))}
function monitorV(c,r,screenVisible,seed){prism(r-.3,c,.6,.06,14,15,"#2b2f36");
  if(screenVisible)faceR(c+.064,r-.25,r+.25,17,27,scr(seed));else faceR(c-.004,r-.25,r+.25,17,27,scr(seed))}
function plantItem(out,r,c,s=1){out.push({k:r+c,d:()=>{prism(r-.14*s,c-.14*s,.28*s,.28*s,0,9*s,"#b56a3e");g3("sph",r,c,17*s,.22*s,9*s,.22*s,"#3d8b4a");g3("sph",r-.06*s,c-.08*s,24*s,.14*s,6*s,.14*s,"#57a95f")}})}
function sofaItem(out,r0,c0,dr,dc,col,backSide="B"){out.push({k:r0+c0+.05,d:()=>{prism(r0,c0,dr,dc,0,9,col);const bk=shade(col,-.05),arm=shade(col,.06);
  if(backSide==="B")prism(r0+dr-.16,c0,.16,dc,9,10,bk);else if(backSide==="T")prism(r0,c0,.16,dc,9,10,bk);else prism(r0,c0,dr,.16,9,10,bk);
  if(backSide==="L"){prism(r0,c0,.16,dc,9,6,arm);prism(r0+dr-.16,c0,.16,dc,9,6,arm)}else{prism(r0,c0,dr,.16,9,6,arm);prism(r0,c0+dc-.16,dr,.16,9,6,arm)}}})}
function dispenserItem(out,r,c){out.push({k:r+c,d:()=>{prism(r-.18,c-.18,.36,.36,0,18,"#e9eef1");g3("cyl",r,c,25,.12,7,.12,"rgba(90,170,230,.85)")}})}
/* satu set meja + kursi yang bisa diatur manual (beberapa model meja) */
const DESK_STYLES={std:{name:"Standar",w:1.0,d:.55,top:"#efe9de",side:"#c8b693",mon:[0]},dual:{name:"2 monitor",w:1.3,d:.58,top:"#efe9de",side:"#c8b693",mon:[-.3,.3]},
  laptop:{name:"Laptop",w:.8,d:.45,top:"#f4f6f7",side:"#c9d0d6",laptop:true},L:{name:"Sudut (L)",w:1.3,d:.55,top:"#efe9de",side:"#c8b693",mon:[0],ret:true},
  exec:{name:"Pimpinan",w:1.6,d:.68,top:"#7d5a3f",side:"#5e3f2a",laptop:true,exec:true}};
const FV={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},RV={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]};
const lpt=(s,f,l)=>{const F=FV[s.face]||FV.up,V=RV[s.face]||RV.up;return[s.r+f*F[0]+l*V[0],s.c+f*F[1]+l*V[1]]};
function lrect(s,f1,f2,l1,l2){const p=[lpt(s,f1,l1),lpt(s,f2,l2)];return[Math.min(p[0][0],p[1][0]),Math.min(p[0][1],p[1][1]),Math.max(p[0][0],p[1][0]),Math.max(p[0][1],p[1][1])]}
function deskRects(s){const D=DESK_STYLES[s.ds]||DESK_STYLES.std,g=.47,out=[lrect(s,g,g+D.d,-D.w/2,D.w/2)];if(D.ret)out.push(lrect(s,-.3,g,D.w/2-.42,D.w/2));return out}
function unitDesk(s){const rs=deskRects(s);return[Math.min(...rs.map(x=>x[0])),Math.min(...rs.map(x=>x[1])),Math.max(...rs.map(x=>x[2])),Math.max(...rs.map(x=>x[3]))]}
function drawUnitDesk(s,seed){const D=DESK_STYLES[s.ds]||DESK_STYLES.std,zt=D.exec?15:14,far=.47+D.d;
  for(const[a,b,c,d]of deskRects(s).sort((x,y)=>(x[0]+x[1]+x[2]+x[3])-(y[0]+y[1]+y[2]+y[3])))prism(a,b,c-a,d-b,0,zt,D.side,{top:D.top});
  if(D.mon)for(const l of D.mon){const f=s.face;
    if(f==="up")monitor(s.r-far+.1,s.c+l,true,seed+l);else if(f==="down")monitor(s.r+far-.16,s.c-l,false,seed+l);
    else if(f==="left")monitorV(s.c-far+.1,s.r-l,true,seed+l);else monitorV(s.c+far-.16,s.r+l,false,seed+l)}
  if(D.laptop){const fm=.47+D.d*.5,[a,b,c,d]=lrect(s,fm-.13,fm+.08,-.18,.18);floorQ(a,b,c,d,zt+.2,"#3a3f45");
    const[sa,sb,sc,sd]=lrect(s,fm+.08,fm+.12,-.18,.18);prism(sa,sb,sc-sa,sd-sb,zt,7,"#2b2f36");
    if(s.face==="up")faceL(sc+.003,sb+.02,sd-.02,zt+1,zt+6.5,scr(seed));else if(s.face==="left")faceR(sd+.003,sa+.02,sc-.02,zt+1,zt+6.5,scr(seed));else if(s.face==="down")faceL(sa-.003,sb+.02,sd-.02,zt+1,zt+6.5,scr(seed));else faceR(sb-.003,sa+.02,sc-.02,zt+1,zt+6.5,scr(seed))}
  if(D.exec){const[a,b,c,d]=lrect(s,.5,.56,-.2,.2);floorQ(a,b,c,d,zt+.2,"#d9b26a");const p=lpt(s,.47+D.d-.15,D.w/2-.15);g3("sph",p[0],p[1],zt+5,.13,5,.13,"#3d8b4a")}}
function itemExt(it){let a=it.r-.25,b=it.c-.25,c=it.r+.25,d=it.c+.25;if(it.t==="desk"){const u=unitDesk(it);a=Math.min(a,u[0]);b=Math.min(b,u[1]);c=Math.max(c,u[2]);d=Math.max(d,u[3])}return[a,b,c,d]}
const DESK_ICON={std:'<rect x="4" y="5" width="20" height="8" rx="1.5"/>',dual:'<rect x="2" y="6" width="24" height="7" rx="1.5"/><rect x="7" y="2" width="5" height="3"/><rect x="16" y="2" width="5" height="3"/>',
  laptop:'<rect x="7" y="6" width="14" height="7" rx="1.5"/><rect x="11" y="4" width="6" height="2"/>',L:'<path d="M3 4h22v7H17v6h-6v-6H3z" rx="1"/>',exec:'<rect x="1" y="4" width="26" height="10" rx="2"/>'};
const deskIcon=k=>`<svg width="28" height="18" viewBox="0 0 28 18" fill="${(DESK_STYLES[k]||{}).exec?"#7d5a3f":"#c8b693"}" aria-hidden="true">${DESK_ICON[k]||""}</svg>`;

function buildRoom(R){
  const out=[],blocks=[],seats=[],spots=[];const blk=(r0,c0,r1,c1)=>blocks.push([r0,c0,r1,c1]);
  const{r0,c0,dr,dc}=R,r1=r0+dr,c1=c0+dc,cxm=c0+dc/2,crm=r0+dr/2,seed=hash(R.id),D=!R.custom;
  const home=(s,o={})=>{seats.push({...s,sit:true,chair:true,...o});};
  const spot=(r,c,face,sit,label,kind,o={})=>spots.push({r,c,face,sit,label,kind,room:R,...o});
  const doorOut=d=>d.s==="B"?[r1+.4,d.at,"down"]:d.s==="T"?[r0-.4,d.at,"up"]:d.s==="L"?[d.at,c0-.4,"left"]:[d.at,c1+.4,"right"];
  if(R.type==="cluster"){
    if(D)for(const cl of R.clusters){const n=cl.n,sp=cl.sp,dw=Math.min(1.02,sp-.1),cw=n*sp,x0=cl.c0;
      if(cl.dir==="v"){const y0=cl.r0,dA=cl.c0+.62,dB=cl.c0+1.17,dE=cl.c0+1.72;
        out.push({k:y0+cw/2+dB,d:()=>{for(let i=0;i<n;i++){const rc=y0+i*sp+sp/2;prism(rc-dw/2,dA,dw,dE-dA,0,14,"#c8b693",{top:"#efe9de"})}
          prism(y0+sp/2-dw/2,dB-.02,cw-sp+dw,.04,14,13,"#9fb6c4",{top:"#cfe0e8",left:"#8fa6b4",right:"rgba(170,200,215,.85)"});
          for(let i=0;i<n;i++){const rc=y0+i*sp+sp/2;monitorV(dA+.38,rc,false,seed+i);monitorV(dB+.1,rc,true,seed+i*3);
            floorQ(rc-.2,dA+.12,rc+.2,dA+.24,14.1,"#d4dade");floorQ(rc-.2,dB+.32,rc+.2,dB+.44,14.1,"#d4dade")}}});
        blk(y0+sp/2-dw/2,dA,y0+cw-sp/2+dw/2,dE);
        for(let i=0;i<n;i++)home({r:y0+i*sp+sp/2,c:cl.c0+.3,face:"right",group:cl.group,desk:true});
        for(let i=0;i<n;i++)home({r:y0+i*sp+sp/2,c:cl.c0+2.05,face:"left",group:cl.group,desk:true});
        if(cl.group)out.push({k:-1e3,floor:true,d:()=>textFloor(y0-.55,cl.c0+.4,cl.group.toUpperCase(),.42,"rgba(70,50,20,.45)")});
      }else if(cl.rows===2){const dA=cl.r0+.62,dB=cl.r0+1.17,dE=cl.r0+1.72;
        out.push({k:cl.r0+1.17+x0+cw/2,d:()=>{
          for(let i=0;i<n;i++){const cc=x0+i*sp+sp/2;prism(dA,cc-dw/2,dE-dA,dw,0,14,"#c8b693",{top:"#efe9de"})}
          prism(dB-.02,x0+sp/2-dw/2,.04,cw-sp+dw,14,13,"#9fb6c4",{top:"#cfe0e8",left:"rgba(170,200,215,.85)",right:"#8fa6b4"});
          for(let i=0;i<n;i++){const cc=x0+i*sp+sp/2;monitor(dA+.38,cc,false,seed+i);monitor(dB+.1,cc,true,seed+i*3);
            floorQ(dA+.12,cc-.2,dA+.24,cc+.2,14.1,"#d4dade");floorQ(dB+.32,cc-.2,dB+.44,cc+.2,14.1,"#d4dade");
            if((seed+i)%3===0)prism(dB+.3,cc+.32,.1,.1,14,5,"#ffffff",{top:"#6b3e2a"})}}});
        blk(dA,x0+sp/2-dw/2,dE,x0+cw-sp/2+dw/2);
        for(let i=0;i<n;i++)home({r:cl.r0+.3,c:x0+i*sp+sp/2,face:"down",group:cl.group,desk:true});
        for(let i=0;i<n;i++)home({r:cl.r0+2.05,c:x0+i*sp+sp/2,face:"up",group:cl.group,desk:true});
        if(cl.group){const gx=x0+cw/2;out.push({k:-1e3,floor:true,d:()=>textFloor(cl.r0-.22,gx-.5,cl.group.toUpperCase(),.42,"rgba(70,50,20,.45)")})}
      }else{const dA=cl.r0,dE=cl.r0+.55;
        out.push({k:cl.r0+.3+x0+cw/2,d:()=>{for(let i=0;i<n;i++){const cc=x0+i*sp+sp/2;prism(dA,cc-dw/2,dE-dA,dw,0,14,"#c8b693",{top:"#efe9de"});monitor(dA+.1,cc,true,seed+i*5);floorQ(dA+.32,cc-.2,dA+.44,cc+.2,14.1,"#d4dade")}}});
        for(let i=0;i<n;i++){const cc=x0+i*sp+sp/2;blk(dA,cc-dw/2,dE,cc+dw/2);home({r:cl.r0+.9,c:cc,face:"up",group:cl.group,desk:true})}
      }
    }
    if(R.rug)out.push({k:-1e3,floor:true,d:()=>{floorQ(r0+.2,c0+.4,r1-.2,c1-.3,0,"#d9c7a3");floorQ(r0+.3,c0+.5,r1-.3,c1-.4,.05,null,"#b89e6d",1)}});
    if(R.cabinets){const cc=c1-.6;out.push({k:r0+2+cc,d:()=>{for(let i=0;i<4;i++)prism(r0+.5+i*.62,cc,.6,.5,0,30,"#b9c2c9",{top:"#d2d9de"})}});blk(r0+.5,cc,r0+3,cc+.5);
      plantItem(out,r1-.4,c1-.4);blk(r1-.6,c1-.6,r1-.2,c1-.2)}
    if(!R.open)plantItem(out,r0+.35,c0+.35);
  }
  else if(R.type==="office"){if(D){const n=Math.max(1,Math.min(4,Math.floor((dc-.9)/1.15)));
    for(let i=0;i<n;i++){const cc=c0+.3+i*1.15+.55;out.push({k:r0+.6+cc,d:()=>{prism(r0+.3,cc-.5,.65,1.0,0,14,"#c8b693",{top:"#efe9de"});monitor(r0+.42,cc,true,seed+i)}});blk(r0+.3,cc-.5,r0+.95,cc+.5);home({r:r0+1.35,c:cc,face:"up",desk:true})}}
    const cc=c1-.75;out.push({k:r0+.4+cc,d:()=>{prism(r0+.1,cc,.5,.55,0,32,"#b9c2c9",{top:"#d2d9de"});for(let z=6;z<30;z+=8)line(Q(r0+.601,cc+.1,z),Q(r0+.601,cc+.45,z),"#8f99a1",.8)}});blk(r0+.1,cc,r0+.6,cc+.55);
    plantItem(out,r1-.35,c0+.35,.85);
  }
  else if(R.type==="exec"){const big=dc>=7,cx=big?c0+dc*.42:c0+dc*.55;
    out.push({k:-1e3,floor:true,d:()=>{floorQ(r0+.25,cx-1.5,r1-.25,cx+1.5,0,"#7b2f3b");floorQ(r0+.35,cx-1.4,r1-.35,cx+1.4,.05,null,"#d9b26a",1)}});
    if(D){out.push({k:r0+1+cx,d:()=>{prism(r0+.72,cx-.95,.58,1.9,0,15,"#5e3f2a",{top:"#7d5a3f"});prism(r0+.85,cx-.55,.35,.5,15,1.2,"#c9cdd2");
        prism(r0+.86,cx-.53,.03,.46,16,7,"#2b2f36");faceL(r0+.858,cx-.51,cx-.09,16.6,22.4,scr(seed));floorQ(r0+1.1,cx+.3,r0+1.2,cx+.75,15.1,"#d9b26a");g3("sph",r0+.9,cx+.7,20,.12,4.5,.12,"#3d8b4a")}});
      blk(r0+.72,cx-.95,r0+1.3,cx+.95);home({r:r0+.42,c:cx,face:"down",boss:true,label:"Kursi pimpinan"});
      for(const dx of[-.45,.45]){const s={r:r0+1.68,c:cx+dx,face:"up"};chairItems(out,s,"#7b2f3b");spot(s.r,s.c,"up",true,"Menghadap ke "+R.name,"meet",{w:.4})}}
    out.push({k:r0+.25+c0+.9,d:()=>{prism(r0+.08,c0+.2,.34,1.1,0,42,"#5a3d2a",{top:"#6d4a33"});
      for(let z=6;z<40;z+=11)for(let i=0;i<6;i++)faceL(r0+.422,c0+.28+i*.16,c0+.4+i*.16,z,z+8,["#c0392b","#2f6fd6","#e9b11f","#2e8b57","#f4f1ea"][(i+z)%5])}});
    blk(r0+.08,c0+.2,r0+.42,c0+1.3);
    if(big){sofaItem(out,r1-.8,c1-3.4,.62,2.4,"#d8cbb5");blk(r1-.8,c1-3.4,r1-.18,c1-1);out.push({k:r1-1.2+c1-2.2,d:()=>prism(r1-1.35,c1-2.9,.35,1.4,0,7,"#5e3f2a",{top:"#7d5a3f"})});blk(r1-1.35,c1-2.9,r1-1,c1-1.5);
      spot(r1-.55,c1-2.8,"up",true,"Duduk di sofa "+R.name,"talk",{w:.2});plantItem(out,r0+.4,c1-.4)}
    else plantItem(out,r1-.35,c1-.35,.85);
  }
  else if(R.type==="meeting"){const horiz=dc>=dr;
    if(horiz){const td=Math.min(2,Math.max(.8,dr-1.7)),tl=Math.max(1,dc-1.8),ta=crm-td/2,tc=c0+.9;
      out.push({k:crm+tc+tl/2,d:()=>{prism(ta,tc,td,tl,0,13,"#6d4f37",{top:"#8a6748"});for(let x=.5;x<tl-.2;x+=.8)floorQ(ta+.15,tc+x-.12,ta+.33,tc+x+.12,13.1,"#f4f1ea")}});
      blk(ta,tc,ta+td,tc+tl);const n=Math.max(1,Math.floor(tl/.8));
      for(let i=0;i<n;i++){const cc=tc+tl*(i+.5)/n;for(const s of[{r:ta-.38,c:cc,face:"down"},{r:ta+td+.38,c:cc,face:"up"}]){chairItems(out,s,"#2f4f6f");spot(s.r,s.c,s.face,true,"Rapat di "+R.name+" ("+R.id+")","meet",{w:1.6/(2*n)})}}
      out.push({k:r0+.1+tc+tl/2,d:()=>{prism(r0+.08,tc+tl*.25,.06,Math.min(2.4,tl*.5),6,34,"#ffffff",{left:"#f7f9fa",right:"#cfd6db",top:"#9aa4ad"});
        line(Q(r0+.145,tc+tl*.25+.3,26),Q(r0+.145,tc+tl*.25+1.1,30),"#2f6fd6",1.3);line(Q(r0+.145,tc+tl*.25+.3,19),Q(r0+.145,tc+tl*.25+1.5,21),"#d14b3c",1.2)}});
    }else{const tw=Math.min(1.4,dc-1.8),tl=Math.max(1,dr-1.4),ta=r0+.7,tc=cxm-tw/2;
      out.push({k:ta+tl/2+cxm,d:()=>prism(ta,tc,tl,tw,0,13,"#6d4f37",{top:"#8a6748"})});blk(ta,tc,ta+tl,tc+tw);const n=Math.max(1,Math.floor(tl/.8));
      for(let i=0;i<n;i++){const rr=ta+tl*(i+.5)/n;for(const s of[{r:rr,c:tc-.38,face:"right"},{r:rr,c:tc+tw+.38,face:"left"}]){chairItems(out,s,"#2f4f6f");spot(s.r,s.c,s.face,true,"Rapat di "+R.name+" ("+R.id+")","meet",{w:1.2/(2*n)})}}}
    plantItem(out,r1-.35,c0+.35,.85);
  }
  else if(R.type==="pantry"){
    out.push({k:-1e3,floor:true,d:()=>{for(let r=r0;r<r1;r+=.5)for(let c=c0;c<c1;c+=.5)if(((r+c)*2)%2)floorQ(r,c,r+.5,c+.5,0,"rgba(0,0,0,.05)")}});
    out.push({k:r0+.4+c0+.5,d:()=>{prism(r0+.1,c0+.15,.62,.7,0,44,"#f2f4f5",{top:"#dfe3e6"});line(Q(r0+.721,c0+.7,10),Q(r0+.721,c0+.7,40),"#9aa3ab",1.4)}});blk(r0+.1,c0+.15,r0+.72,c0+.85);
    const kc=c0+1.1,kl=Math.min(dc-1.6,4.2);
    out.push({k:r0+.4+kc+kl/2,d:()=>{prism(r0+.1,kc,.6,kl,0,15,"#e6e1d6",{top:"#8f9aa1"});floorQ(r0+.25,kc+.9,r0+.55,kc+1.4,15.1,"#cfd6dc");
      prism(r0+.12,kc+.15,.35,.5,15,9,"#3a3f45");prism(r0+.12,kc+kl-.55,.32,.4,15,13,"#2b2f36");
      }});
    blk(r0+.1,kc,r0+.7,kc+kl);
    spot(r0+1.0,kc+.9,"up",false,"Bikin kopi di "+R.name,"brk",{w:.6});spot(r0+1.0,kc+kl-.5,"up",false,"Ambil makan di "+R.name,"brk",{w:.6});
    const nt=Math.max(1,Math.min(3,Math.floor((dc-1)/2.4))),nr=dr>=4.5?2:1;
    for(let j=0;j<nr;j++)for(let i=0;i<nt;i++){const tr=r0+.85+(dr-.85)*(j+.5)/nr,tc=c0+1+(dc-1)*(i+.5)/nt;
      out.push({k:tr+tc,d:()=>{g3("cyl",tr,tc,6.5,.04,6.5,.04,"#7a8590");g3("cyl",tr,tc,.4,.18,.4,.18,"#7a8590");g3("cyl",tr,tc,13,.36,.8,.36,"#f4efe6")}});
      blk(tr-.3,tc-.3,tr+.3,tc+.3);
      for(const[dr2,dc2,face]of[[0,-.68,"right"],[0,.68,"left"],[.6,0,"up"],[-.6,0,"down"]]){const sr=tr+dr2,sc=tc+dc2;if(sr>r1-.25||sr<r0+.8)continue;
        out.push({k:sr+sc-.06,d:()=>{g3("cyl",sr,sc,5,.025,5,.025,"#7a8590");g3("cyl",sr,sc,10,.11,1,.11,"#e3a24a")}});
        spot(sr,sc,face,true,"Istirahat di "+R.name,"brk",{w:2.4/(nt*nr*4)})}}
    seats.push({r:r0+1.0,c:c1-.6,face:"up",sit:false,chair:false,label:"Petugas pantry"});
  }
  else if(R.type==="toilet"){const d=R.doors[0];
    out.push({k:crm+cxm+dr/2,d:()=>{prism(r0+.05,c0+.05,dr-.1,dc-.1,0,56,"#dfe7ea",{top:"#c5d0d5"});
      for(let x=c0+.6;x<c1-.3;x+=.8)line(Q(r1-.049,x,0),Q(r1-.049,x,56),"rgba(0,0,0,.05)",.8);
      if(d.s==="B"){faceL(r1-.048,d.at-.4,d.at+.4,0,40,"#8fb3c2");signL(r1-.047,d.at-.9,d.at+.9,44,9,"#2f4656","TOILET")}
      else if(d.s==="R"){faceR(c1-.048,d.at-.4,d.at+.4,0,40,"#8fb3c2");signR(c1-.047,d.at-.9,d.at+.9,44,9,"#2f4656","TOILET")}
      else signL(r1-.047,cxm-.9,cxm+.9,30,10,"#2f4656","TOILET")}});
    blk(r0,c0,r1,c1);const o=doorOut(d);spot(o[0],o[1],o[2]==="down"?"up":o[2]==="up"?"down":o[2]==="left"?"right":"left",false,"Ke toilet","brk",{w:1.2,hide:true});
  }
  else if(R.type==="stairs"){
    const up=(cA,cB)=>out.push({k:crm+(cA+cB)/2+.5,d:()=>{for(let i=0;i<6;i++)prism(r0+i*dr/6,cA,dr/6,cB-cA,0,(6-i)*10,"#c4b59a",{top:"#d8cbb2"});line(Q(r0,cB-.05,60),Q(r1,cB-.05,8),"#6b747c",1.4);line(Q(r0,cB-.05,72),Q(r1,cB-.05,20),"#6b747c",1.2)}});
    const down=(cA,cB)=>out.push({k:-1e3,floor:true,d:()=>{floorQ(r0+.05,cA,r1-.05,cB,0,"#4a4f55");for(let i=1;i<6;i++)floorQ(r0+i*dr/6,cA+.05,r0+i*dr/6+.05,cB-.05,0,"rgba(255,255,255,.18)");
      textFloor(crm-.2,(cA+cB)/2-.5,"TURUN",.36,"rgba(255,255,255,.75)")}});
    if(R.both){up(c0+.1,cxm-.05);down(cxm+.05,c1-.1)}else if(R.down)down(c0+.1,c1-.1);else up(c0+.1,c1-.1);
    blk(r0,c0,r1,c1);spot(r1+.4,cxm,"up",false,"Ke lantai lain","move",{w:.7,hide:true});
  }
  else if(R.type==="reception"){const kc=c0+.45;
    out.push({k:r0+1.5+kc+.3,d:()=>{prism(r0+.3,kc,2.3,.55,0,20,"#f1ede4",{top:"#c7a27a"});faceR(kc+.551,r0+.3,r0+2.6,6,10,"#0f7c72");
      prism(r0+.7,kc+.1,.5,.06,20,10,"#2b2f36");prism(r0+1.7,kc+.1,.5,.06,20,10,"#2b2f36");
      faceR(kc+.163,r0+.72,r0+1.18,21,29,scr(seed));faceR(kc+.163,r0+1.72,r0+2.18,21,29,scr(seed+1));g3("sph",r0+2.45,kc+.3,24,.07,4,.07,"#e85d8a")}});
    blk(r0+.3,kc,r0+2.6,kc+.55);
    if(D){home({r:r0+.95,c:kc+1.05,face:"left"});home({r:r0+1.95,c:kc+1.05,face:"left"})}
    spot(r0+1.45,kc-.45,"right",false,"Ke resepsionis","talk",{w:.5});plantItem(out,r1-.3,c1-.4);
  }
  else if(R.type==="logbook"){
    out.push({k:r0+.4+c0+.8,d:()=>{prism(r0+.15,c0+.2,.5,1.2,0,15,"#8a6748",{top:"#a98260"});floorQ(r0+.25,c0+.45,r0+.5,c0+.95,15.1,"#f4f1ea");line(Q(r0+.25,c0+.7,15.2),Q(r0+.5,c0+.7,15.2),"#9aa3ab",.8);
      signL(r0+.651,c0+.25,c0+1.35,5,7,"#0f7c72","LOGBOOK")}});
    blk(r0+.15,c0+.2,r0+.65,c0+1.4);if(D)home({r:r0+1.05,c:c0+.8,face:"up",label:"Petugas logbook"});
  }
  else if(R.type==="server"){
    out.push({k:-1e3,floor:true,d:()=>{for(let r=r0;r<r1;r+=.5)line(Q(r,c0),Q(r,c1),"rgba(0,0,0,.08)",.8);for(let c=c0;c<c1;c+=.5)line(Q(r0,c),Q(r1,c),"rgba(0,0,0,.08)",.8)}});
    for(let i=0;i<3;i++){const rc=c0+.3+i*.82;out.push({k:r0+.42+rc+.37,d:()=>{prism(r0+.15,rc,.55,.74,0,50,"#2a3038",{top:"#3a414b"});
      for(let a=0;a<6;a++)for(let j=0;j<3;j++){const on=(hash(rc*100+a*3+j)%3)!==0;faceL(r0+.703,rc+.12+j*.22,rc+.18+j*.22,7.5+a*7,9.5+a*7,on?(j===2?"!#f2a20c":"!#3ee07a"):"#1b2026")}}})}
    blk(r0+.15,c0+.3,r0+.7,c0+2.8);
    out.push({k:r0+.4+c1-.6,d:()=>{prism(r0+.1,c1-.75,.4,.65,0,40,"#e8eef1");for(let z=24;z<36;z+=3)line(Q(r0+.501,c1-.7,z),Q(r0+.501,c1-.15,z),"#aab3ba",.7)}});blk(r0+.1,c1-.75,r0+.5,c1-.1);
    if(D){out.push({k:r0+1.5+c0+1,d:()=>{prism(r0+1.3,c0+.4,.42,1.2,0,14,"#9aa5ae",{top:"#e8edf0"});monitor(r0+1.38,c0+1,true,seed)}});blk(r0+1.3,c0+.4,r0+1.72,c0+1.6);
      home({r:r0+2.08,c:c0+1,face:"up",desk:true})}
    spot(r0+1.0,c0+2.9,"up",false,"Cek ruang server","talk",{w:.25});
  }
  else if(R.type==="arsip"){const segs=Math.max(1,Math.floor((dc-2.4)/2.7));
    for(let i=0;i<segs;i++){const sc=c0+.3+i*2.7;out.push({k:r0+.4+sc+1.25,d:()=>{prism(r0+.1,sc,.52,2.5,0,42,"#b9c2c9",{top:"#d2d9de"});
      for(let z=4;z<40;z+=9.5)for(let j=0;j<13;j++)faceL(r0+.622,sc+.1+j*.18,sc+.24+j*.18,z,z+7,["#2f6fd6","#e9b11f","#2e8b57","#c0392b","#7b4fc4","#e6e1d6"][(j*7+z|0)%6])}});blk(r0+.1,sc,r0+.62,sc+2.5)}
    if(D){const bc=c1-2;out.push({k:r0+1.1+bc+.5,d:()=>{prism(r0+.8,bc,.4,1.2,0,14,"#c8b693",{top:"#efe9de"});monitor(r0+.86,bc+.6,true,seed)}});blk(r0+.8,bc,r0+1.2,bc+1.2);
      home({r:r0+1.55,c:bc+.6,face:"up",desk:true})}
    for(let i=0;i<3;i++)out.push({k:r0+1.4+c0+1+i*.5,d:()=>{for(let k=0;k<2;k++)prism(r0+1.15,c0+.6+i*.55,.45,.45,k*9,9,["#c79a5f","#d6ab70"][k])}});blk(r0+1.15,c0+.6,r0+1.6,c0+2.2);
    spot(r0+.95,c0+5.5,"up",false,"Cari dokumen di gudang","talk",{w:.3});
  }
  else if(R.type==="service"){
    out.push({k:r0+.5+c0+1.5,d:()=>{for(let i=0;i<2;i++){const x=c0+.6+i*1.1;prism(r0+.15,x,.6,.85,0,20,"#e9ecef",{top:"#cfd5da"});floorQ(r0+.25,x+.1,r0+.4,x+.7,20.1,"#2b2f36")}}});blk(r0+.15,c0+.6,r0+.75,c0+2.6);
    out.push({k:r0+.4+c0+4.2,d:()=>{for(let i=0;i<4;i++){const x=c0+3+i*.62;prism(r0+.1,x,.5,.6,0,46,"#7f95a6",{top:"#9fb2c0"});faceL(r0+.601,x+.25,x+.35,28,31,"#d9dde0")}}});blk(r0+.1,c0+3,r0+.6,c0+5.5);
    out.push({k:r0+.4+c0+6.8,d:()=>{prism(r0+.1,c0+5.9,.6,1.8,0,15,"#e6e1d6",{top:"#8f9aa1"});floorQ(r0+.25,c0+6.4,r0+.55,c0+6.9,15.1,"#cfd6dc")}});blk(r0+.1,c0+5.9,r0+.7,c0+7.7);
    out.push({k:r0+1.3+c0+4.5,d:()=>{prism(r0+1.1,c0+4.3,.4,.6,4,14,"#f2b632");prism(r0+1.2,c0+4.5,.2,.2,18,10,"#2f6fd6")}});
    if(D){out.push({k:r0+.6+c1-1.6,d:()=>prism(r0+.35,c1-2.1,.45,1.3,0,14,"#8a6748",{top:"#a98260"})});blk(r0+.35,c1-2.1,r0+.8,c1-.8);
      home({r:r0+1.25,c:c1-1.8,face:"up",label:"Kursi 1"});home({r:r0+1.25,c:c1-1.1,face:"up",label:"Kursi 2"})}
    spot(r0+1.0,c0+1.6,"up",false,"Fotokopi dokumen","talk",{w:.6});
  }
  else if(R.type==="mushola"){
    out.push({k:-1e3,floor:true,d:()=>{floorQ(r0+.2,c0+.9,r1-.2,c1-.15,0,"#2f7d58");for(let x=c0+.95;x<c1-.2;x+=.55)poly([Q(r0+.3,x+.27,.12),Q(r0+.55,x+.06,.12),Q(r0+.55,x+.48,.12)],"#3f9a6c");floorQ(r0+.25,c0+.95,r1-.25,c1-.2,.1,null,"#d9c27a",.8)}});
    out.push({k:r0+.3+c1-.6,d:()=>{prism(r0+.08,c1-1.1,.3,1,0,22,"#8a6748",{top:"#a98260"})}});blk(r0+.08,c1-1.1,r0+.38,c1-.1);
    out.push({k:r1-.3+c0+.4,d:()=>prism(r1-.5,c0+.15,.35,.6,0,9,"#a98260")});
    for(const x of[1.4,2.2,2.95])spot(r0+.8,c0+x,"up",false,"Ibadah di mushola","brk",{w:.4});
  }
  else if(R.type==="waiting"){
    out.push({k:-1e3,floor:true,d:()=>{floorQ(r0+.3,c0+.2,r1-.3,c1-.4,0,"#cdb995");floorQ(r0+.4,c0+.3,r1-.4,c1-.5,.05,null,"#a98a5a",1);
      textFloor(r1-.75,c0+2.6,"RUANG TUNGGU",.4,"rgba(90,60,30,.45)")}});
    sofaItem(out,r0+.4,c0+1.1,.62,3.6,"#7f9fb3","T");blk(r0+.4,c0+1.1,r0+1.02,c0+4.7);
    sofaItem(out,r0+1.5,c0+.25,2.9,.62,"#7f9fb3","L");blk(r0+1.5,c0+.25,r0+4.4,c0+.87);
    out.push({k:r0+2.4+c0+2.9,d:()=>{prism(r0+1.8,c0+1.9,1.1,2.2,0,8,"#5e3f2a",{top:"#7d5a3f"});floorQ(r0+2.0,c0+2.2,r0+2.35,c0+2.75,8.1,"#e85d4a");floorQ(r0+2.3,c0+3.1,r0+2.6,c0+3.6,8.1,"#2f6fd6");
      g3("sph",r0+2.5,c0+3.8,12,.1,4,.1,"#57a95f")}});blk(r0+1.8,c0+1.9,r0+2.9,c0+4.1);
    plantItem(out,r0+.45,c0+.45);plantItem(out,r1-.45,c1-.6);plantItem(out,r0+.45,c1-.6,.9);
    dispenserItem(out,r0+1.5,c1-.45);blk(r0+1.3,c1-.65,r0+1.7,c1-.25);spot(r0+1.5,c1-1.0,"right",false,"Ambil minum di ruang tunggu","brk",{w:.4});
    out.push({k:r0+3.6+c1-.5,d:()=>{prism(r0+3.1,c1-.75,.9,.45,0,24,"#8a6748",{top:"#a98260"});for(let i=0;i<3;i++)faceR(c1-.299,r0+3.2+i*.27,r0+3.42+i*.27,12+i*3,20+i*3,["#e9b11f","#c0392b","#2f6fd6"][i])}});blk(r0+3.1,c1-.75,r0+4,c1-.3);
    for(const x of[1.6,2.9,4.2])spot(r0+.85,c0+x,"down",true,"Menemui tamu di ruang tunggu","talk",{w:.12});
    for(const y of[2.1,3.3])spot(r0+y,c0+.75,"right",true,"Menemui tamu di ruang tunggu","talk",{w:.12});
  }
  if(R.custom){R.custom.forEach((it,i)=>{const s={r:it.r,c:it.c,face:it.face||"up",desk:it.t==="desk",ds:it.ds||"std",cs:it.cs||"office",label:"Kursi "+(i+1)};
    if(s.desk){const u=unitDesk(s);out.push({k:(u[0]+u[2])/2+(u[1]+u[3])/2,d:()=>drawUnitDesk(s,seed+i)});for(const q of deskRects(s))blk(q[0],q[1],q[2],q[3])}
    home(s)})}
  if(R.noSeats)seats.length=0;
  if(!seats.length&&EDITABLE.has(R.type)){const pts=[];
    for(let rr=r0+.6;rr<r1-.4;rr+=.9)for(let cc=c0+.6;cc<c1-.4;cc+=1.1){if(blocks.some(b=>rr>=b[0]-.2&&rr<=b[2]+.2&&cc>=b[1]-.2&&cc<=b[3]+.2))continue;pts.push([rr,cc])}
    const pick=pts.filter((_,i)=>i%Math.max(1,Math.floor(pts.length/4))===0).slice(0,4);
    for(const[rr,cc]of pick)spot(rr,cc,(hash(R.id+rr+cc)%2)?"up":"left",false,"Mampir ke "+R.name,"talk",{w:.6/Math.max(1,pick.length)})}
  return{items:out,blocks,seats,spots,doorOut};
}

/* =========================================================
   FLOOR SETUP: rooms, walls, walk grid, decor (dibangun ulang saat tata letak berubah)
   ========================================================= */
const ROOMS={},FL=[];let TOTAL_SEATS=0;
function addIv(map,key,a,b){if(b-a<1e-6)return;const l=map.get(key)||[];l.push([a,b]);map.set(key,l)}
function subIv(list,a,b){const out=[];for(const[x,y]of list){if(b<=x||a>=y){out.push([x,y]);continue}if(a>x)out.push([x,a]);if(b<y)out.push([b,y])}return out}
function mergeIv(list){list.sort((p,q)=>p[0]-q[0]);const o=[];for(const iv of list){const l=o[o.length-1];if(l&&iv[0]<=l[1]+1e-6)l[1]=Math.max(l[1],iv[1]);else o.push([...iv])}return o}
const GI=DD*2,GJ=WW*2;
function buildFloors(){
  for(const k in ROOMS)delete ROOMS[k];
  for(let f=0;f<FLOORS;f++)FL[f]={rooms:[],items:[],floorItems:[],blocks:[],spots:[],hw:new Map(),vw:new Map()};
  for(const d of ROOM_DEFS){const Rm={...d,doors:d.doors||[]};
    Rm.noSeats=!!R.rooms[d.id]?.noSeats;
    Rm.custom=S.edit&&S.edit.room===d.id?S.edit.items:(EDITABLE.has(d.type)&&Array.isArray(R.layouts[d.id]?.items)?R.layouts[d.id].items:null);
    const b=buildRoom(Rm);Rm.seats=b.seats.map((s,i)=>({...s,i,label:s.label||((s.group?s.group+" · ":"")+"Kursi "+(i+1))}));Rm.spots=b.spots;Rm.doorOut=b.doorOut;
    ROOMS[Rm.id]=Rm;const F=FL[Rm.f];F.rooms.push(Rm);for(const it of b.items)(it.floor?F.floorItems:F.items).push(it);F.blocks.push(...b.blocks);F.spots.push(...b.spots);
    for(const s of Rm.seats)if(s.chair)chairItems(F.items,s,Rm.type==="exec"&&s.boss?"#2a2a2e":"#37404d");
    if(!Rm.open&&Rm.type!=="toilet"&&Rm.type!=="stairs"){const k2=v=>Math.round(v*2);
      addIv(F.hw,k2(Rm.r0),Rm.c0,Rm.c0+Rm.dc);addIv(F.hw,k2(Rm.r0+Rm.dr),Rm.c0,Rm.c0+Rm.dc);addIv(F.vw,k2(Rm.c0),Rm.r0,Rm.r0+Rm.dr);addIv(F.vw,k2(Rm.c0+Rm.dc),Rm.r0,Rm.r0+Rm.dr)}}
  for(const w of DECO_WALLS){const F=FL[w.f];addIv(w.line==="h"?F.hw:F.vw,Math.round(w.at*2),w.from,w.to)}
  for(const F of FL){for(const m of[F.hw,F.vw])for(const[k,l]of m)m.set(k,mergeIv(l));
    for(const Rm of F.rooms)for(const d of Rm.doors){const k2=v=>Math.round(v*2);
      if(d.s==="B"||d.s==="T"){const key=k2(d.s==="B"?Rm.r0+Rm.dr:Rm.r0);F.hw.set(key,subIv(F.hw.get(key)||[],d.at-.5,d.at+.5))}
      else{const key=k2(d.s==="R"?Rm.c0+Rm.dc:Rm.c0);F.vw.set(key,subIv(F.vw.get(key)||[],d.at-.5,d.at+.5))}}}
  decor();
  for(const F of FL){const g=new Uint8Array(GI*GJ);for(const[a,b,c,d]of F.blocks)for(let i=0;i<GI;i++){const rc=(i+.5)/2;if(rc<a||rc>c)continue;for(let j=0;j<GJ;j++){const cc=(j+.5)/2;if(cc>=b&&cc<=d)g[i*GJ+j]=1}}
    F.grid=g;F.pcache=new Map();F.walls=wallItems(F)}
  TOTAL_SEATS=Object.values(ROOMS).reduce((a,Rm)=>a+Rm.seats.length,0);BV++;
}
// dekorasi lobi & koridor per lantai
function decor(){
  const F=FL;const blk=(f,a,b,c,d)=>F[f].blocks.push([a,b,c,d]);const sp=(f,r,c,face,label,kind,w,o={})=>F[f].spots.push({r,c,face,sit:false,label,kind,w,room:null,...o});
  // Lt 1
  plantItem(F[0].items,15.6,7.1);plantItem(F[0].items,15.6,10.2,.9);blk(0,15.4,6.9,15.8,7.3);
  dispenserItem(F[0].items,4.5,10.6);blk(0,4.3,10.4,4.7,10.8);sp(0,4.5,10.05,"right","Ambil minum","brk",1);
  F[0].floorItems.push({k:-1e3,d:()=>{floorQ(DD-.8,ENTRANCE[0],DD,ENTRANCE[1],0,"#3a4650");textFloor(DD-.6,(ENTRANCE[0]+ENTRANCE[1])/2-.5,"SELAMAT DATANG",.3,"rgba(255,255,255,.6)")}});
  // Lt 2
  sofaItem(F[1].items,4.2,10.5,.62,2.4,"#9ab7c9","T");blk(1,4.2,10.5,4.82,12.9);plantItem(F[1].items,4.3,13.5);blk(1,4.1,13.3,4.5,13.7);
  dispenserItem(F[1].items,3.6,15.6);blk(1,3.4,15.4,3.8,15.8);sp(1,3.6,15.05,"right","Ambil minum","brk",1);
  // Lt 3
  dispenserItem(F[2].items,4.0,15.65);blk(2,3.8,15.45,4.2,15.85);sp(2,4.0,15.1,"right","Ambil minum","brk",1);plantItem(F[2].items,12.0,15.6);plantItem(F[2].items,3.95,4.25);
  // Lt 4
  dispenserItem(F[3].items,.4,10.6);blk(3,.2,10.4,.6,10.8);sp(3,.95,10.6,"up","Ambil minum","brk",1);plantItem(F[3].items,3.2,15.6);plantItem(F[3].items,10.75,15.6);
}
function canMove(F,i,j,ni,nj,goal){if(ni<0||nj<0||ni>=GI||nj>=GJ)return false;const id=ni*GJ+nj;if(F.grid[id]&&id!==goal)return false;
  if(ni!==i){const iv=F.hw.get(Math.max(i,ni));if(iv){const c=(j+.5)/2;for(const[a,b]of iv)if(c>a&&c<b)return false}}
  else{const iv=F.vw.get(Math.max(j,nj));if(iv){const r=(i+.5)/2;for(const[a,b]of iv)if(r>a&&r<b)return false}}
  return true}
const cellOf=(r,c)=>[Math.max(0,Math.min(GI-1,Math.floor(r*2))),Math.max(0,Math.min(GJ-1,Math.floor(c*2)))];
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function gridPath(F,A,B){
  const[ai,aj]=cellOf(A.r,A.c),[bi,bj]=cellOf(B.r,B.c),start=ai*GJ+aj,goal=bi*GJ+bj;
  const key=start+">"+goal;let cells=F.pcache.get(key);
  if(!cells){const N=GI*GJ*4,dist=new Float32Array(N).fill(1e9),prev=new Int32Array(N).fill(-1);const heap=[];
    const push=(d,s)=>{heap.push([d,s]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top};
    for(let d=0;d<4;d++){dist[start*4+d]=0;push(0,start*4+d)}let end=-1;
    while(heap.length){const[d,s]=pop();if(d>dist[s])continue;const cell=s>>2,dir=s&3;if(cell===goal){end=s;break}const i=(cell/GJ)|0,j=cell%GJ;
      for(let nd=0;nd<4;nd++){const ni=i+DIRS[nd][0],nj=j+DIRS[nd][1];if(!canMove(F,i,j,ni,nj,goal))continue;const ns=(ni*GJ+nj)*4+nd,c=d+1+(nd!==dir?.6:0);if(c<dist[ns]){dist[ns]=c;prev[ns]=s;push(c,ns)}}}
    cells=[];if(end>=0){let s=end;while(s>=0){cells.unshift(s>>2);s=prev[s]}}
    if(F.pcache.size>3000)F.pcache.clear();F.pcache.set(key,cells)}
  const pts=[[A.r,A.c]];for(const cl of cells){pts.push([((cl/GJ|0)+.5)/2,(cl%GJ+.5)/2])}pts.push([B.r,B.c]);
  return mkPath(simplify(pts));
}
function simplify(pts){const o=[];for(const p of pts){const l=o[o.length-1];if(l&&Math.abs(l[0]-p[0])<1e-6&&Math.abs(l[1]-p[1])<1e-6)continue;o.push(p)}
  const r=[o[0]];for(let i=1;i<o.length-1;i++){const a=r[r.length-1],b=o[i],c=o[i+1];const cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cr)<1e-6)continue;r.push(b)}if(o.length>1)r.push(o[o.length-1]);return r}
function mkPath(pts){let len=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);len+=l}return{pts,seg,len}}
function along(Pt,d){const p=Pt.pts;if(p.length<2)return{r:p[0][0],c:p[0][1],dr:0,dc:1};d=Math.max(0,Math.min(Pt.len,d));
  for(let i=1;i<p.length;i++){const l=Pt.seg[i-1];if(d<=l||i===p.length-1){const k=l?Math.min(1,d/l):1;return{r:p[i-1][0]+(p[i][0]-p[i-1][0])*k,c:p[i-1][1]+(p[i][1]-p[i-1][1])*k,dr:p[i][0]-p[i-1][0],dc:p[i][1]-p[i-1][1]}}d-=l}}
const faceOf=(dr,dc)=>Math.abs(dr)>Math.abs(dc)?(dr>0?"down":"up"):(dc>0?"right":"left");

/* =========================================================
   STATE & DATA
   ========================================================= */
const R={divs:{},people:[],layouts:{},rooms:{}};
const S={afilter:"",hub:null,focusDiv:null,view:0,lab:"full",plaques:true,dayMode:"auto",tab:"sum",sel:null,hover:null,follow:null,form:null,armed:null,
  live:false,loaded:false,q:"",fdiv:"",ffl:"",editDiv:null,divDraft:null,newDiv:{name:"",color:PALETTE[0]},
  seat:{},roomPeople:{},seatOcc:{},divCount:{},poses:[],pending:false,cache:new Map(),edit:null,ghost:null};
buildFloors();
let store=null;
const divOf=id=>R.divs[id]||{name:"Tanpa divisi",color:"#7d8a90"};
const personBy=id=>R.people.find(p=>p.id===id);
const roomTitle=id=>{const r=ROOMS[id];return r?r.name:"—"};
const divList=()=>Object.entries(R.divs).map(([id,d])=>({id,...d})).sort((a,b)=>(a.order??99)-(b.order??99)||a.name.localeCompare(b.name));

function recompute(){
  S.seat={};S.roomPeople={};S.seatOcc={};S.divCount={};S.cache=new Map();S.floorCount=[0,0,0,0];
  for(const p of R.people){S.divCount[p.div]=(S.divCount[p.div]||0)+1;p._h=hash(p.id+p.name);p._col=divOf(p.div).color}
  const byRoom={};for(const p of R.people)if(p.room&&ROOMS[p.room]&&ROOMS[p.room].type!=="toilet"&&ROOMS[p.room].type!=="stairs")(byRoom[p.room]=byRoom[p.room]||[]).push(p);
  for(const id in byRoom){const room=ROOMS[id],list=byRoom[id].sort((a,b)=>RANK(a.jabatan)-RANK(b.jabatan)||(a.createdAt||0)-(b.createdAt||0)||a.name.localeCompare(b.name));
    S.roomPeople[id]=list;const occ=new Array(room.seats.length).fill(null);const rest=[];
    for(const p of list){const si=Number.isInteger(p.seat)?p.seat:-1;if(si>=0&&si<occ.length&&!occ[si])occ[si]=p;else rest.push(p)}
    let k=0;for(const p of rest){const free=occ.indexOf(null);if(free>=0){occ[free]=p}else{const s={r:room.r0+.45+Math.floor(k/5)*.7,c:room.c0+.6+(k%5)*.7,face:"down",sit:false,over:true};S.seat[p.id]={...s,room,f:room.f};k++}}
    occ.forEach((p,i)=>{if(p){S.seat[p.id]={...room.seats[i],room,f:room.f,si:i}}});S.seatOcc[id]=occ;
  }
  let k=0;for(const p of R.people)if(!S.seat[p.id]){S.seat[p.id]={r:7.6+(k%3)*.6,c:9.4+Math.floor(k/3)*.7,face:"down",sit:false,room:null,f:0,none:true};k++}
  for(const p of R.people){const h=S.seat[p.id];if(h&&!h.none)S.floorCount[h.f]++}
  for(const F of FL)for(const s of F.spots){s.taken=false;if(s.room){const occ=S.seatOcc[s.room.id];if(occ&&s.room.seats.some((x,i)=>occ[i]&&Math.abs(x.r-s.r)<.01&&Math.abs(x.c-s.c)<.01))s.taken=true}}
}

/* schedule — karyawan boleh lintas lantai lewat tangga; jam 12:00–14:00 istirahat makan siang */
const SPEED=1.2,cycleT=p=>96+(p._h%70);
const EMO_HOME={cluster:"💻",office:"💻",exec:"💼",reception:"🛎️",logbook:"📒",server:"🖥️",arsip:"📁",service:"🧹",pantry:"🍳",meeting:"🗣️",mushola:"🤲"};
function emoOf(label,kind){const l=String(label||"").toLowerCase();
  if(l.includes("makan siang di luar"))return"🍜";if(l.includes("makan"))return"🍱";if(l.includes("kopi"))return"☕";if(l.includes("minum"))return"💧";
  if(l.includes("toilet"))return"🚻";if(l.includes("ibadah")||l.includes("mushola"))return"🤲";if(l.includes("rapat")||l.includes("menghadap"))return"🗣️";
  if(l.includes("diskusi"))return"💬";if(l.includes("resepsionis"))return"👋";if(l.includes("tamu"))return"🤝";if(l.includes("server"))return"🖥️";
  if(l.includes("dokumen")||l.includes("arsip")||l.includes("gudang"))return"📁";if(l.includes("fotokopi"))return"🖨️";if(l.includes("sofa"))return"🛋️";
  if(l.includes("istirahat"))return"☕";if(l.includes("mampir"))return"👀";return kind==="move"?"🚶":"🙂"}
const stairsOf=f=>FL[f]?.spots.find(s=>s.kind==="move"&&s.hide);
function legsTo(home,dest){
  if(dest.f===home.f){const p=gridPath(FL[home.f],home,dest);return[{f:home.f,path:p,dur:p.len/SPEED}]}
  const s1=stairsOf(home.f),s2=stairsOf(dest.f);if(!s1||!s2)return null;
  const a=gridPath(FL[home.f],home,s1),b=gridPath(FL[dest.f],s2,dest);
  return[{f:home.f,path:a,dur:a.len/SPEED},{st:true,from:home.f,to:dest.f,dur:3+3.5*Math.abs(dest.f-home.f)},{f:dest.f,path:b,dur:b.len/SPEED}]}
const legsDur=L=>L.reduce((a,x)=>a+x.dur,0);
function legPose(base,L,k,back,dest,home){
  if(L.st){const to=back?L.from:L.to,from=back?L.to:L.from,up=to>from;
    return{...base,f:from,r:0,c:0,hidden:true,pose:"walk",act:(up?"Naik":"Turun")+" tangga ke Lt "+(to+1),ak:"move",emo:up?"⬆️":"⬇️"}}
  const a=along(L.path,back?L.path.len-k*SPEED:k*SPEED);
  return{...base,f:L.f,r:a.r,c:a.c,face:back?faceOf(-a.dr,-a.dc):faceOf(a.dr,a.dc),pose:"walk",act:back?"Kembali ke "+home.room.name:"Menuju: "+dest.label,ak:"move",emo:"🚶"}}
function tripPose(base,home,legs,dest,stay,u){
  for(const L of legs){if(u<L.dur)return legPose(base,L,u,false,dest,home);u-=L.dur}
  if(u<stay)return{...base,f:dest.f,r:dest.r,c:dest.c,face:dest.face,pose:dest.sit?"sit":"stand",hidden:!!dest.hide,act:dest.label,ak:dest.kind,talking:dest.kind==="talk",emo:dest.emo||emoOf(dest.label,dest.kind)};
  u-=stay;for(let i=legs.length-1;i>=0;i--){const L=legs[i];if(u<L.dur)return legPose(base,L,u,true,dest,home);u-=L.dur}
  return null}
function candidates(p,home){const out=[];
  for(let f=0;f<FLOORS;f++){const cross=f!==home.f;
    for(const s of FL[f].spots){if(s.taken||s.kind==="move"||(s.room&&s.room===home.room))continue;
      if(cross&&!(s.kind==="brk"||s.kind==="meet"||s.room?.type==="reception"))continue;
      out.push({...s,f,w:(s.w||0)*(cross?.22:1)})}}
  for(const q of R.people){if(q.id===p.id)continue;const s=S.seat[q.id];if(!s||s.none||!s.desk)continue;const cross=s.f!==home.f;
    if(cross&&q.div!==p.div)continue;if(!cross&&q.div!==p.div&&hash(q.id+p.id)%4!==0)continue;
    const off=s.face==="down"?-.45:.45;out.push({f:s.f,r:s.r+off,c:s.c+.38,face:s.face==="down"?"down":"up",sit:false,label:"Diskusi dengan "+q.name.split(" ")[0],kind:"talk",w:cross?.12:(q.div===p.div?.45:.2)})}
  return out}
function planFor(p,n,home){
  const key=p.id+":"+n;let pl=S.cache.get(key);if(pl)return pl;const h=hash(key);pl={trip:null};
  if(h%5!==0&&!home.none){const cands=candidates(p,home);let tot=0;for(const c of cands)tot+=c.w||0;
    if(tot>0){let x=(h>>>4)%10000/10000*tot,dest=null;for(const c of cands){x-=c.w||0;if(x<=0){dest=c;break}}dest=dest||cands[cands.length-1];
      const legs=legsTo(home,dest);if(legs){const D=legsDur(legs),stay=dest.sit?16+h%12:7+h%7,work=cycleT(p)-2*D-stay;if(D>.3&&work>10)pl={trip:{dest,legs,stay,work}}}}}
  if(S.cache.size>4000)S.cache.clear();S.cache.set(key,pl);return pl;
}
const LUNCH0=12*3600,LUNCH1=14*3600,WORK0=7.5*3600,WORK1=17*3600;
const EXIT=()=>({f:0,r:DD-.3,c:(ENTRANCE[0]+ENTRANCE[1])/2,face:"down",sit:false,hide:true,label:"Pulang",kind:"out",room:null});
function exitLegs(p,home){const key="X:"+p.id;let v=S.cache.get(key);if(v===undefined){v=legsTo(home,EXIT());S.cache.set(key,v)}return v}
function lunchPlan(p,home,day){
  const key="L:"+p.id+":"+day;let pl=S.cache.get(key);if(pl)return pl;const h=hash(key),start=LUNCH0+(h%35)*60+((h>>>6)%60),mode=h%10;
  pl={start,end:start+(20+h%20)*60,dest:null,legs:null};
  if(mode<5){let best=null;for(let f=0;f<FLOORS;f++){const st=FL[f].spots.filter(s=>s.sit&&s.room?.type==="pantry");if(st.length&&(!best||Math.abs(f-home.f)<Math.abs(best.f-home.f)))best={f,st}}
    if(best){const s=best.st[(h>>>3)%best.st.length];pl.dest={...s,f:best.f,label:"Makan siang di "+s.room.name,kind:"brk",emo:"🍱"};pl.end=start+(25+h%20)*60}}
  else if(mode<8){pl.dest={f:0,r:DD-.3,c:(ENTRANCE[0]+ENTRANCE[1])/2,face:"down",sit:false,hide:true,label:"Makan siang di luar kantor",kind:"out",emo:"🍜",room:null};pl.end=Math.min(LUNCH1-60,start+(40+h%25)*60)}
  if(pl.dest){pl.legs=legsTo(home,pl.dest);if(!pl.legs)pl.dest=null}
  S.cache.set(key,pl);return pl}
/* =========================================================
   TAMU (NPC) — datang dari pintu masuk, ke resepsionis, menunggu di ruang tunggu, lalu pulang.
   Paling banyak 2 tamu sekaligus; jadwal mengikuti jam supaya semua orang melihat hal yang sama.
   ========================================================= */
const GUEST_COLS=["#6b7280","#b45309","#0f766e","#7c3aed","#be123c","#1d4ed8"];
const GUEST_TRACKS=[{P:180,off:0},{P:240,off:113}];
function guestPoses(tSec){const out=[],F=FL[0],R4=ROOMS["4"],RT=ROOMS["RT"];if(!F||!R4||!RT)return out;
  {const d=new Date(tSec*1000),h=d.getHours()+d.getMinutes()/60;if(h<8.25||h>=16.75)return out}
  const ent={r:DD-.25,c:(ENTRANCE[0]+ENTRANCE[1])/2},desk={r:R4.r0+1.45,c:R4.c0},seats=RT.spots.filter(s=>s.sit);if(!seats.length)return out;
  GUEST_TRACKS.forEach((tr,ti)=>{const x=tSec+tr.off,n=Math.floor(x/tr.P),u=x-n*tr.P,h=hash("tamu"+ti+":"+n);if(h%3===0)return;
    const seat=seats[(h+ti*2)%seats.length],p1=gridPath(F,ent,desk),p2=gridPath(F,desk,seat),p3=gridPath(F,seat,ent),sp=1.0;
    const t1=p1.len/sp,w1=5+h%4,t2=p2.len/sp,w2=18+h%14,t3=p3.len/sp,total=t1+w1+t2+w2+t3;if(u>total)return;
    let r,c,face,pose,act,k=u;
    if(k<t1){const a=along(p1,k*sp);r=a.r;c=a.c;face=faceOf(a.dr,a.dc);pose="walk";act="Datang ke resepsionis"}
    else if((k-=t1)<w1){r=desk.r;c=desk.c-.45;face="right";pose="stand";act="Melapor di resepsionis"}
    else if((k-=w1)<t2){const a=along(p2,k*sp);r=a.r;c=a.c;face=faceOf(a.dr,a.dc);pose="walk";act="Menuju ruang tunggu"}
    else if((k-=t2)<w2){r=seat.r;c=seat.c;face=seat.face;pose="sit";act="Menunggu di ruang tunggu"}
    else{k-=w2;const a=along(p3,k*sp);r=a.r;c=a.c;face=faceOf(a.dr,a.dc);pose="walk";act="Pulang"}
    const alpha=Math.max(0,Math.min(1,u/1.5,(total-u)/1.5));
    out.push({p:{id:"tamu"+ti,_h:h,_col:GUEST_COLS[h%GUEST_COLS.length],gender:h%2?"L":"P",name:"Tamu"},f:0,r,c,face,pose,act,alpha,guest:true})});
  return out}

function poseOf(p,tSec){
  const home=S.seat[p.id];if(!home)return null;const base={p,f:home.f};
  if(home.none)return{...base,r:home.r,c:home.c,face:"down",pose:"stand",act:"Belum ditempatkan di kursi",ak:"none",emo:"❔"};
  const kind=home.room.type;
  const atHome={...base,r:home.r,c:home.c,face:home.face,pose:home.sit?"sit":"stand",typing:home.sit&&!!(home.desk||home.boss||kind==="reception"),act:home.over?(home.room.seats.length?"Berdiri (ruangan penuh)":"Di "+home.room.name):HOME_ACT[kind]||"Bekerja",ak:kind==="meeting"?"meet":kind==="pantry"||kind==="mushola"?"brk":"work",emo:home.over?"🧍":EMO_HOME[kind]||"💻"};
  // istirahat makan siang 12:00–14:00 (jam lokal)
  const d=new Date(tSec*1000),sod=d.getHours()*3600+d.getMinutes()*60+d.getSeconds()+(tSec%1);
  // jam kerja 07.30–17.00: datang bergiliran pagi, pulang mulai jam 17.00
  {const h=p._h||0,dep=WORK1+(h%25)*60+((h>>>7)%60),arr=WORK0+((h>>>3)%40)*60+((h>>>9)%60);
    if(sod>=dep||sod<arr+200){const X=exitLegs(p,home),D=X?legsDur(X):0,dest=EXIT();
      if(X&&sod>=dep&&sod<dep+D){const r=tripPose(base,home,X,dest,1e9,sod-dep);if(r)return{...r,act:"Pulang ke rumah",ak:"move",emo:"👋"}}
      if(X&&sod>=arr&&sod<arr+D){const r=tripPose(base,home,X,dest,0,D+(sod-arr));if(r)return{...r,act:"Datang ke kantor",ak:"move",emo:"☀️"}}
      if(sod>=dep||sod<arr)return{...base,r:home.r,c:home.c,face:home.face||"down",pose:"stand",hidden:true,away:true,act:"Sudah pulang",ak:"home",emo:"🏠"}}}
  if(sod>=LUNCH0&&sod<LUNCH1){const L=lunchPlan(p,home,d.toDateString());
    if(sod>=L.start&&sod<L.end){if(!L.dest)return{...atHome,typing:false,act:"Makan siang di meja",ak:"brk",emo:"🍱"};
      const D=legsDur(L.legs),stay=Math.max(30,L.end-L.start-2*D),r=tripPose(base,home,L.legs,L.dest,stay,sod-L.start);if(r)return r}
    else if(sod>=L.start-120&&sod<L.end+120)return atHome}
  const T=cycleT(p),x=tSec+(p._h%997)/997*T,n=Math.floor(x/T),u=x-n*T,pl=planFor(p,n,home);
  if(!pl.trip||u<pl.trip.work)return atHome;
  return tripPose(base,home,pl.trip.legs,pl.trip.dest,pl.trip.stay,u-pl.trip.work)||atHome;
}

/* =========================================================
   SIANG / MALAM, LINGKUNGAN, FASAD
   ========================================================= */
let NIGHT=false;
function isNight(){if(S.dayMode==="day")return false;if(S.dayMode==="night")return true;const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=18||h<5.75}
const PAL=()=>NIGHT?{sky1:"#16213a",sky2:"#2d3f5e",grass:"#2e5a3c",grass2:"#2a5337",pave:"#6f747b",paveL:"#7d828a",road:"#363d47",wall:"#b9c1c8",wallR:"#9aa3ab",inWin:"#22324d"}
  :{sky1:"#a9d8ea",sky2:"#e2f2f2",grass:"#8ccc6a",grass2:"#84c464",pave:"#d4d1c6",paveL:"#dedbd0",road:"#5a636e",wall:"#e4e8eb",wallR:"#c9d0d6",inWin:"#bfe4f3"};
const TREES=[{r:18.6,c:1.5,s:1},{r:18.8,c:4.8,s:.9},{r:18.6,c:14.2,s:1.1},{r:-2,c:3,s:1},{r:-2.3,c:8.5,s:1.1},{r:-2,c:14,s:.9},{r:2,c:-2.2,s:1},{r:7.5,c:-2.4,s:1.05},{r:13,c:-2.2,s:.95},{r:18.2,c:-1.8,s:.9},{r:-2.4,c:18.6,s:.9}];
const CARS=[{r:1.2,c:17.85,col:"#e8e9ec"},{r:2.7,c:17.85,col:"#c0392b"},{r:7.2,c:17.85,col:"#2c3e57"},{r:8.7,c:17.85,col:"#8a9aa8"},{r:13.2,c:17.85,col:"#3f7f5a"}];
function recWorld(){const pal=PAL();ZF=0;
  prism(-6,-6,28,32,-40,39.5,pal.grass,{top:pal.grass});
  poly([P(-6,-6),P(-6,26),P(22,26),P(22,-6)],pal.grass);
  for(let r=-6;r<22;r+=2)for(let c=-6;c<26;c+=2)if(((r+c)/2)%2===0)floorQ(r,c,r+2,c+2,0,pal.grass2);
  floorQ(-.9,-.9,DD+1.8,WW+3,0,pal.pave);for(let c=-.9;c<WW+3;c+=1.5)line(Q(-.9,c),Q(DD+1.8,c),"rgba(0,0,0,.05)",.8);
  floorQ(DD,ENTRANCE[0],DD+1.8,ENTRANCE[1],0,pal.paveL);
  floorQ(-6,WW+3,22,WW+3.35,0,"#bfc3c4");floorQ(-6,WW+3.35,22,WW+6.6,0,pal.road);for(let r=-6;r<22;r+=1.6)line(Q(r,WW+4.97),Q(r+.8,WW+4.97),"#f1e7b8",1.4);
  for(const r of[.45,1.95,3.45,6.45,7.95,9.45,12.45,13.95])line(Q(r,WW+1),Q(r,WW+2.7),"#ffffff",1);
  for(const t of TREES){const s=t.s,g=NIGHT?["#24563a","#2e6a47"]:["#3f9a4a","#5bb862"];STUB.globalAlpha=.2;g3("disc",t.r+.15,t.c+.1,.2,.55*s,1,.4*s,"#123018");STUB.globalAlpha=1;
    g3("cyl",t.r,t.c,8*s,.07*s,8*s,.07*s,"#7a5434");g3("sph",t.r,t.c,26*s,.5*s,13*s,.5*s,g[0]);g3("sph",t.r-.12*s,t.c-.15*s,32*s,.32*s,8*s,.32*s,g[1])}
  for(const car of CARS){const r0=car.r-.38,c0=car.c-.62;prism(r0,c0,.76,1.24,2,8,car.col);prism(r0+.08,c0+.3,.6,.62,10,6,car.col,{left:"#9fd0ea",right:"#86bcd9",top:car.col});
    for(const[a,b]of[[0,.25],[0,1],[.76,.25],[.76,1]])g3("cyl",r0+a,c0+b,3,.11,1.4,.11,"#1d1f22",Math.PI/2)}
  prism(DD+1.4,11,.3,1.8,0,22,"#3a4450");signL(DD+1.701,11.1,12.7,6,13,"#0f7c72","EFFRENSINDO");
  for(const r of[-3.5,3.5,10.5,17.5]){prism(r-.05,WW+3.05,.1,.1,0,92,"#5a636e");prism(r-.04,WW+3.05,.08,.6,90,3,"#5a636e");g3("sph",r,WW+3.55,88,.12,4,.12,NIGHT?"!#ffe9a8":"#e8eef2");if(NIGHT){STUB.globalAlpha=.16;g3("disc",r,WW+3.6,.3,.9,1,.9,"!#ffe9a8");STUB.globalAlpha=1}}}
const winCol=(lit,k)=>NIGHT?(lit?"!#ffd77a":"#2d3d55"):(k%3===0?"#a9d6ea":"#8ec6e0");
function recFacade(nf){const pal=PAL();ZF=0;if(nf<=0)return;const top=FZ(nf);
  prism(0,0,DD,WW,0,top-.6,pal.wall,{left:pal.wall,right:pal.wallR,top:"#98a3ac"});prism(-.02,-.02,DD+.04,WW+.04,0,8,"#6f7a84",{noTop:true});
  for(let g=0;g<nf;g++){const z1=FZ(g)+10,z2=FZ(g+1)-16,busy=((S.present||S.floorCount)?.[g]||0)>0;
    for(let k=0,c=.3;c+1.1<=WW-.1;k++,c+=1.48){const lit=busy&&hash(g*31+k)%4!==0;if(!(g===0&&c+1.12>ENTRANCE[0]-.2&&c<ENTRANCE[1]+.2))faceL(DD+.01,c,c+1.12,z1,z2,winCol(lit,k+g));faceL(-.01,c,c+1.12,z1,z2,winCol(busy&&hash(g*13+k)%4!==0,k+g+2))}
    for(let k=0,r=.3;r+1.05<=DD-.1;k++,r+=1.45){faceR(WW+.01,r,r+1.05,z1,z2,winCol(busy&&hash(g*17+k)%3!==0,k+g+1));faceR(-.01,r,r+1.05,z1,z2,winCol(busy&&hash(g*7+k)%3!==0,k+g))}
    const b1=FZ(g+1)-8,b2=Math.min(FZ(g+1),top-.7);faceL(DD+.012,0,WW,b1,b2,"#56636f");faceL(-.012,0,WW,b1,b2,"#56636f");faceR(WW+.012,0,DD,b1,b2,"#4a5560");faceR(-.012,0,DD,b1,b2,"#4a5560")}
  const[a,b]=ENTRANCE;faceL(DD+.014,a,b,FZ(0),FZ(0)+54,NIGHT?"!#e9c46a":"#2f4656");for(const x of[a,a+1,a+2,b])line(Q(DD+.016,x,FZ(0)),Q(DD+.016,x,FZ(0)+54),"#cfd6dc",1.3);
  prism(DD,a-.4,1.1,b-a+.8,FZ(0)+56,5,"#56636f");signL(DD+1.11,a+.2,b-.2,FZ(0)+56,5,"#0f7c72","PINTU MASUK")}
function recRoof(){const top=FZ(4);ZF=top;
  for(let c=0;c<WW;c+=1)line(Q(0,c,.1),Q(DD,c,.1),"rgba(0,0,0,.05)",.8);
  prism(.3,12.4,2.2,3.2,0,30,"#c9d0d6",{top:"#b0b9c0"});
  for(const[r,c]of[[1,3],[1,5],[1,7],[3.4,3],[3.4,5],[6,3],[6,5]]){prism(r,c,1.2,1.5,0,14,"#e3e7ea");g3("cyl",r+.6,c+.75,15,.3,1,.3,"#7f8a93")}
  g3("cyl",2,10.4,19,.45,19,.45,"#3f6f9a");
  prism(-.05,-.05,.2,WW+.1,0,10,"#cfd6db");prism(-.05,-.05,DD+.1,.2,0,10,"#cfd6db");
  prism(DD-1.4,2.5,.12,11,0,40,"#56636f");signL(DD-1.27,2.5,13.5,14,24,"#0f7c72","PT EFFRENSINDO KENCANA","#ffffff");
  prism(DD-.2,-.05,.25,WW+.1,0,10,"#bcc5cc");prism(-.05,WW-.2,DD+.1,.25,0,10,"#bcc5cc")}

/* =========================================================
   KARAKTER 3D
   ========================================================= */
const SKIN=["#f1c9a5","#e3b089","#cf9467","#b07a4c","#8d5a36"],HAIR=["#1f1a17","#2e231c","#3d2b1f","#4c3627","#141414"],PANTS=["#2f3a48","#3b3f46","#4a4f5a","#26303b","#5a4a3a"];
const HIJAB=["#7c5aa6","#2f6f8f","#a0522d","#3f6b4f","#8b3a5a","#c08a3e"];
const ND=(mesh,col,p,s,r,x)=>Object.assign({mesh,col,p:p||[0,0,0],s:s||[1,1,1],r:r||[0,0,0],kids:[]},x||{});
const ADD=(a,...k)=>{a.kids.push(...k);return a};
function makePerson(o){
  const sk=o.skin,sh=o.shirt,pa=o.pants,hr=o.hair,D={det:true};
  const root=ND(),hips=ND("rb",pa,[0,.80,0],[.17,.10,.12]);ADD(root,hips);root.k=PS;
  const leg=sx=>{const top=ND(null,0,[sx*.088,-.03,0]),th=ND("limb",pa,[0,-.18,0],[.078,.2,.085]),knee=ND(null,0,[0,-.36,0]),
      sn=ND("limb",pa,[0,-.17,0],[.068,.19,.074]),ft=ND(null,0,[0,-.35,0]),sho=ND("soft","#26221f",[0,-.035,.045],[.075,.045,.125]);
    ADD(ft,sho);ADD(knee,sn,ft);ADD(top,th,knee);top.knee=knee;return top};
  const lL=leg(-1),lR=leg(1);ADD(hips,lL,lR);
  const spine=ND(null,0,[0,.03,0]);ADD(hips,spine);
  ADD(spine,ND("soft",sh,[0,.23,0],[.2,.25,.135]),ND("rb","#2b2623",[0,0,0],[.185,.03,.128],0,D),ND("soft","#f5f3ee",[0,.445,.045],[.1,.035,.07],0,D),
    ND("box","#1d3557",[0,.36,.128],[.012,.06,.004],0,D),ND("box","#ffffff",[0,.27,.136],[.045,.055,.006],0,D),ND("limb",sk,[0,.49,0],[.07,.06,.07]));
  const head=ND(null,0,[0,.71,0]);ADD(spine,head);const hijab=o.style==="hijab";
  ADD(head,ND("sph",sk,[0,0,0],[.27,.27,.255]));
  if(hijab)ADD(head,ND("sph",sk,[0,-.02,.1],[.19,.215,.17]));else ADD(head,ND("sphL",sk,[-.268,-.01,0],[.04,.06,.035],0,D),ND("sphL",sk,[.268,-.01,0],[.04,.06,.035],0,D));
  const fz=hijab?.262:.238;
  for(const sx of[-1,1])ADD(head,ND("sphL","#231d1a",[sx*.095,0,fz],[.036,.046,.02]),ND("sphL","#ffffff",[sx*.095+.012,.016,fz+.016],[.011,.011,.006],0,D),
    ND("rb",hijab?"#5b4637":hr,[sx*.095,.085,fz-.004],[.046,.011,.012],[0,0,-sx*.12],D),ND("sphL","#f2a594",[sx*.15,-.07,fz-.04],[.042,.024,.02],0,{det:true,a:.55}));
  ADD(head,ND("sphL",o.fem?"#c4536a":"#a64e3f",[0,-.105,fz-.002],[.042,.015,.012],0,D));
  if(o.glasses){for(const sx of[-1,1]){const g=ND(null,0,[sx*.095,0,fz+.022],0,0,D);ADD(head,g);
    ADD(g,ND("box","#1e2328",[0,.052,0],[.072,.009,.006]),ND("box","#1e2328",[0,-.05,0],[.072,.009,.006]),ND("box","#1e2328",[-.068,0,0],[.009,.052,.006]),ND("box","#1e2328",[.068,0,0],[.009,.052,.006]))}
    ADD(head,ND("box","#1e2328",[0,.02,fz+.022],[.03,.007,.006],0,D))}
  if(hijab){const hj=o.hijab;ADD(head,ND("sph",hj,[0,.02,-.06],[.305,.31,.30]),ND("soft",hj,[0,-.25,-.03],[.29,.15,.25]),ND("soft",hj,[0,-.27,.06],[.21,.1,.15]))}
  else if(o.style==="buzz")ADD(head,ND("sph",hr,[0,.07,-.025],[.278,.255,.27]));
  else{ADD(head,ND("sph",hr,[0,.055,-.04],[.287,.27,.275]));
    if(o.style==="long")ADD(head,ND("soft",hr,[0,-.14,-.13],[.25,.25,.13]),ND("soft",hr,[-.22,-.08,.02],[.06,.2,.1]),ND("soft",hr,[.22,-.08,.02],[.06,.2,.1]),ND("soft",hr,[0,.17,.15],[.24,.075,.1],[-.45,0,0]));
    else if(o.style==="bob")ADD(head,ND("soft",hr,[-.215,-.06,-.05],[.085,.16,.17]),ND("soft",hr,[.215,-.06,-.05],[.085,.16,.17]),ND("soft",hr,[0,-.06,-.12],[.27,.18,.16]),ND("soft",hr,[0,.17,.15],[.25,.075,.1],[-.45,0,0]));
    else if(o.style==="bun")ADD(head,ND("sph",hr,[0,.29,-.09],[.125,.115,.115]),ND("soft",hr,[0,.17,.15],[.24,.07,.1],[-.5,0,0]));
    else ADD(head,ND("soft",hr,[.03,.19,.15],[.2,.06,.085],[-.75,0,.1]))}
  if(o.beard)ADD(head,ND("soft",hr,[0,-.17,.08],[.19,.09,.15]),ND("soft",hr,[0,-.075,.225],[.07,.016,.016],0,D));
  if(o.peci)ADD(head,ND("cyl","#1c1c1f",[0,.2,-.01],[.245,.075,.245],[-.12,0,0]));
  const arm=sx=>{const s0=ND(null,0,[sx*.245,.40,0],0,[0,0,sx*.1]),el=ND(null,0,[0,-.25,0]);ADD(el,ND("limb",sk,[0,-.1,0],[.055,.12,.055]),ND("sphL",sk,[0,-.235,0],[.058,.066,.052]));
    ADD(s0,ND("limb",sh,[0,-.12,0],[.072,.15,.072]),el);s0.el=el;return s0};
  const aL=arm(-1),aR=arm(1);ADD(spine,aL,aR);
  const shadow=ND("disc","#000000",[0,.006,0],[.32,1,.26],0,{a:.2});ADD(root,shadow);
  root.j={hips,lL,lR,spine,head,aL,aR,shadow};root.ph=o.ph||0;return root}
function poseP(Pn,mode,t,yaw){const j=Pn.j,ph=Pn.ph;Pn.r[1]=yaw;
  j.hips.p[1]=.80;j.spine.r[0]=0;j.head.r=[0,0,0];j.shadow.hide=false;
  for(const[a,sx]of[[j.aL,-1],[j.aR,1]]){a.r=[0,0,sx*.1];a.el.r=[0,0,0]}
  for(const l of[j.lL,j.lR]){l.r=[0,0,0];l.knee.r=[0,0,0]}
  if(mode==="walk"){const w=t*7.5+ph,s=Math.sin(w);j.hips.p[1]=.80+Math.abs(Math.cos(w))*.025;
    j.lL.r[0]=s*.55;j.lR.r[0]=-s*.55;j.lL.knee.r[0]=Math.max(0,Math.sin(w-1.3))*.85;j.lR.knee.r[0]=Math.max(0,-Math.sin(w-1.3))*.85;
    j.aL.r[0]=-s*.5;j.aR.r[0]=s*.5;j.aL.el.r[0]=-.3;j.aR.el.r[0]=-.3;j.spine.r[0]=.05}
  else if(mode==="sit"||mode==="type"){j.hips.p[1]=.53;j.lL.r[0]=j.lR.r[0]=-1.5;j.lL.knee.r[0]=j.lR.knee.r[0]=1.45;j.lL.r[2]=-.04;j.lR.r[2]=.04;j.shadow.hide=true;
    if(mode==="type"){const k=t*14+ph;j.aL.r[0]=j.aR.r[0]=-.55;j.aL.el.r[0]=-1+Math.sin(k)*.06;j.aR.el.r[0]=-1+Math.sin(k+2.1)*.06;j.aL.r[2]=.06;j.aR.r[2]=-.06;j.head.r[0]=.12+Math.sin(t*.7+ph)*.03;j.head.r[1]=Math.sin(t*.4+ph)*.08}
    else{j.aL.r[0]=j.aR.r[0]=-.3;j.aL.el.r[0]=j.aR.el.r[0]=-.9;j.head.r[1]=Math.sin(t*.5+ph)*.2}}
  else if(mode==="talk"){const k=t*2.2+ph;j.aR.r[0]=-.6+Math.sin(k)*.15;j.aR.el.r[0]=-1.2+Math.sin(k*1.7)*.25;j.aR.r[2]=.25;j.aL.r[0]=-.15;j.aL.el.r[0]=-.25;j.head.r[1]=Math.sin(k*.6)*.18}
  else if(mode==="drink"){const k=(t*.6+ph)%4,lift=k<1.4?Math.sin(k/1.4*Math.PI):0;j.aR.r[0]=-.5-lift*.6;j.aR.el.r[0]=-1.6-lift*.5;j.head.r[0]=-lift*.18}
  else{j.spine.r[0]=Math.sin(t*1.6+ph)*.012;j.head.r[1]=Math.sin(t*.5+ph)*.22}}
/* pilihan karakter (diatur per karyawan di /admin) */
const LOOKS={
  pria:{name:"Pria",style:"short"},pria_kc:{name:"Pria berkacamata",style:"short",glasses:true},pria_cepak:{name:"Pria cepak",style:"buzz"},
  pria_jenggot:{name:"Pria berjenggot",style:"short",beard:true},pria_peci:{name:"Pria berpeci",style:"buzz",peci:true},pria_jkc:{name:"Pria jenggot & kacamata",style:"buzz",beard:true,glasses:true},
  wanita:{name:"Wanita rambut panjang",style:"long",fem:true},wanita_kc:{name:"Wanita berkacamata",style:"long",glasses:true,fem:true},wanita_bob:{name:"Wanita rambut pendek",style:"bob",fem:true},
  wanita_cepol:{name:"Wanita rambut dicepol",style:"bun",fem:true},hijab:{name:"Berhijab",style:"hijab",fem:true},hijab_kc:{name:"Berhijab berkacamata",style:"hijab",glasses:true,fem:true}};
const LOOK_AUTO={L:["pria","pria","pria_kc","pria_cepak","pria_jenggot","pria_kc"],P:["hijab","hijab","hijab_kc","wanita","wanita_kc","wanita_cepol","hijab","wanita_bob"]};
const HAIRC=[["#1f1a17","Hitam"],["#3d2b1f","Coklat tua"],["#6b4428","Coklat"],["#8a4b2a","Merah bata"],["#8d8d8d","Abu-abu"]];
const HIJABC=[["#7c5aa6","Ungu"],["#2f6f8f","Biru"],["#a0522d","Coklat"],["#3f6b4f","Hijau"],["#8b3a5a","Marun"],["#c08a3e","Mustard"],["#1f2430","Hitam"],["#d8c7ad","Krem"]];
const SKINN=["Terang","Kuning langsat","Sawo matang","Coklat","Gelap"];
function lookOf(p){const h=p._h||0,g=p.gender==="L"||p.gender==="P"?p.gender:(h>>>15)%2?"L":"P";
  const key=LOOKS[p.look]?p.look:LOOK_AUTO[g][(h>>>9)%LOOK_AUTO[g].length],L=LOOKS[key];
  const skin=Number.isInteger(+p.skin)&&p.skin!==""&&p.skin!=null&&SKIN[+p.skin]?+p.skin:h%5;
  const hc=Number.isInteger(+p.hc)&&p.hc!==""&&p.hc!=null?+p.hc:-1;
  return{key,...L,skin,hair:HAIRC[(hc>=0&&hc<HAIRC.length?hc:(h>>>3)%3)][0],hijab:HIJABC[(hc>=0&&hc<HIJABC.length?hc:(h>>>11)%HIJABC.length)][0]}}
function buildPerson(p){const h=p._h||0,L=lookOf(p);
  return makePerson({shirt:p._col||"#7d8a90",pants:PANTS[(h>>>6)%5],skin:SKIN[L.skin],hair:L.hair,style:L.style,hijab:L.hijab,glasses:!!L.glasses,beard:!!L.beard,peci:!!L.peci,fem:!!L.fem,ph:(h%97)/10})}
const PEEPS=new Map();
function personOf(p){const key=[p._col,p.gender,p._h,p.look,p.skin,p.hc].join("|");let e=PEEPS.get(p.id);if(e&&e.key===key)return e.node;
  const node=buildPerson(p);PEEPS.set(p.id,{key,node});return node}
/* gambar kecil karakter untuk menu pilihan (dirender di luar layar) */
const THUMBS=new Map();let THF=null;
function avatarThumb(p,W=128,H=160){const key=[p._col,p.gender,p._h,p.look,p.skin,p.hc,W,H].join("|");if(THUMBS.has(key))return THUMBS.get(key);if(!GL_OK)return"";
  if(!THF||THF.w!==W||THF.h!==H){const fb=gl.createFramebuffer(),tx=gl.createTexture(),rb=gl.createRenderbuffer();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,W,H);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);THF={fb,w:W,h:H}}
  const node=buildPerson(p);poseP(node,"idle",.6,.42);node.j.shadow.hide=true;node.p=[0,0,0];
  gl.bindFramebuffer(gl.FRAMEBUFFER,THF.fb);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(GLS.L);const L=GLS.l,eye=[0,.92,2.45];
  gl.uniformMatrix4fv(L.VP,false,M4.mul(M4.persp(.52,W/H,.3,20),M4.look(eye,[0,.6,0],[0,1,0])));gl.uniform3fv(L.E,eye);gl.uniform3f(L.L,.42,.84,.34);gl.uniform3f(L.SKY,1,.98,.95);gl.uniform3f(L.GND,.56,.53,.56);gl.uniform1f(L.AM,.62);gl.uniform1f(L.DI,.55);
  gl.depthMask(true);const op=[],tr=[];nodeDraws(node,ID4,1,true,op,tr);drawNodes(op);gl.depthMask(false);drawNodes(tr);gl.depthMask(true);
  const px=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d"),img=x.createImageData(W,H);for(let y=0;y<H;y++)img.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4);x.putImageData(img,0,0);
  const url=c.toDataURL();if(THUMBS.size>300)THUMBS.clear();THUMBS.set(key,url);return url}
const YAW={down:0,right:Math.PI/2,up:Math.PI,left:-Math.PI/2};
function nodeDraws(node,Pm,al,lod,op,tr){if(node.hide||(node.det&&!lod))return;let W=M4.mul(Pm,M4.T(node.p[0],node.p[1],node.p[2]));
  if(node.r[1])W=M4.mul(W,M4.RY(node.r[1]));if(node.r[0])W=M4.mul(W,M4.RX(node.r[0]));if(node.r[2])W=M4.mul(W,M4.RZ(node.r[2]));if(node.k)W=M4.mul(W,M4.S(node.k,node.k,node.k));
  if(node.mesh){const a=(node.a??1)*al;(a<.99?tr:op).push({m:MESH[node.mesh],M:M4.mul(W,M4.S(node.s[0],node.s[1],node.s[2])),c:parseCol(node.col),a})}
  for(const k of node.kids)nodeDraws(k,W,al,lod,op,tr)}
/* =========================================================
   SUASANA LUAR GEDUNG: mobil & motor lewat, pejalan kaki, burung, kucing, awan
   ========================================================= */
const AMB={};
function mkCar(col){const r=ND(),L=[],T=[];
  ADD(r,ND("rb",col,[0,.23,0],[.34,.13,.66]),ND("rb",col,[0,.42,-.06],[.3,.12,.38]),ND("rb","#1d2228",[0,.12,0],[.33,.03,.6]),
    ND("box","#9fd0ea",[0,.43,.315],[.27,.08,.01]),ND("box","#86bcd9",[0,.43,-.435],[.27,.08,.01]),ND("box","#8ec6e0",[.302,.43,-.06],[.004,.08,.3]),ND("box","#8ec6e0",[-.302,.43,-.06],[.004,.08,.3]));
  for(const sx of[-1,1])for(const sz of[-1,1])ADD(r,ND("cyl","#1d1f22",[sx*.31,.11,sz*.42],[.11,.05,.11],[0,0,Math.PI/2]));
  for(const sx of[-1,1]){const h=ND("sphL","#fff6d0",[sx*.22,.25,.655],[.06,.035,.015]),t=ND("sphL","#b42318",[sx*.24,.26,-.655],[.05,.03,.015]);L.push(h);T.push(t);ADD(r,h,t)}
  r.L=L;r.T=T;return r}
function mkMotor(col,look){const r=ND(),bike=ND();ADD(r,bike);
  ADD(bike,ND("rb",col,[0,.3,.02],[.07,.09,.34]),ND("rb","#20242a",[0,.4,-.1],[.075,.03,.17]),ND("box","#30353c",[0,.52,.3],[.17,.012,.012]),ND("box","#30353c",[0,.4,.3],[.012,.12,.012]));
  for(const z of[-.33,.33])ADD(bike,ND("cyl","#1d1f22",[0,.15,z],[.15,.03,.15],[0,0,Math.PI/2]));
  const h=ND("sphL","#fff6d0",[0,.44,.37],[.045,.045,.02]);ADD(bike,h);r.L=[h];r.T=[];
  const rider=buildPerson({_col:"#2f6fd6",gender:"L",_h:4242,look});ADD(rider.j.head,ND("sph",col==="#1f2430"?"#c0392b":"#f2f4f5",[0,.07,-.01],[.31,.3,.31]));rider.p=[0,.08,-.06];r.rider=rider;ADD(r,rider);return r}
function mkBird(col){const r=ND(),wl=ND(null,0,[-.05,.02,0]),wr=ND(null,0,[.05,.02,0]);
  ADD(wl,ND("box",col,[-.15,0,0],[.15,.008,.07]));ADD(wr,ND("box",col,[.15,0,0],[.15,.008,.07]));
  ADD(r,ND("sphL",col,[0,0,0],[.08,.065,.16]),ND("sphL",col,[0,.04,.14],[.055,.055,.055]),ND("box","#e0a030",[0,.035,.2],[.012,.01,.03]),ND("box",col,[0,.005,-.19],[.05,.006,.06]),wl,wr);r.wl=wl;r.wr=wr;return r}
function mkCat(col,dark){const r=ND(),legs=[],tail=ND(null,0,[0,.2,-.18]);
  ADD(r,ND("soft",col,[0,.17,0],[.085,.08,.19]),ND("sph",col,[0,.28,.19],[.085,.078,.078]),ND("rb",col,[-.05,.36,.19],[.024,.04,.014],[0,0,.2]),ND("rb",col,[.05,.36,.19],[.024,.04,.014],[0,0,-.2]),
    ND("sphL","#2a2a2a",[-.03,.29,.262],[.012,.016,.006]),ND("sphL","#2a2a2a",[.03,.29,.262],[.012,.016,.006]),ND("sphL","#e8a0a0",[0,.265,.268],[.01,.008,.006]),ND("soft",dark,[0,.24,.02],[.07,.02,.12]));
  ADD(tail,ND("limb",col,[0,.1,-.04],[.022,.11,.022],[-.4,0,0]));
  for(const[x,z]of[[-.05,.12],[.05,.12],[-.05,-.12],[.05,-.12]]){const l=ND(null,0,[x,.13,z]);ADD(l,ND("limb",col,[0,-.065,0],[.024,.07,.024]));legs.push(l);ADD(r,l)}
  ADD(r,tail);r.legs=legs;r.tail=tail;return r}
function mkCloud(){const r=ND();for(const[x,y,z,s]of[[0,0,0,1],[.9,-.1,.2,.75],[-.85,-.15,-.1,.7],[.3,.35,-.2,.65],[-.3,.25,.3,.6]])ADD(r,ND("sph","#ffffff",[x,y,z],[s*1.1,s*.6,s*.8]));return r}
function ambInit(){if(AMB.ok)return;AMB.ok=true;
  AMB.cars=[{n:mkCar("#e9ecef"),lane:0,P:24,o:0},{n:mkMotor("#c0392b","hijab"),lane:0,P:24,o:6,moto:true},{n:mkCar("#c0392b"),lane:0,P:24,o:12},{n:mkCar("#3f7f5a"),lane:0,P:24,o:18},
    {n:mkCar("#2c3e57"),lane:1,P:21,o:0},{n:mkMotor("#1f2430","pria_kc"),lane:1,P:21,o:7,moto:true},{n:mkCar("#f2b632"),lane:1,P:21,o:14}];
  AMB.peds=[{n:buildPerson({_col:"#e76f51",gender:"P",_h:91,look:"hijab"}),P:46,o:0},{n:buildPerson({_col:"#457b9d",gender:"L",_h:1234,look:"pria_peci"}),P:58,o:20},{n:buildPerson({_col:"#2a9d8f",gender:"P",_h:555,look:"wanita"}),P:52,o:38}];
  AMB.birds=Array.from({length:6},(_,i)=>({n:mkBird(["#3b3f46","#5a4a3a","#2f3640"][i%3]),i}));
  AMB.cats=[{n:mkCat("#e39b4f","#b8692a"),walk:true},{n:mkCat("#6b6f76","#43474d"),walk:false}];
  AMB.clouds=Array.from({length:5},(_,i)=>({n:mkCloud(),i}))}
const LANE=[WW+4.2,WW+5.8];
function ambientDraws(t,op,tr){ambInit();const push=(n,lod=false)=>nodeDraws(n,ID4,1,lod,op,tr),R0=-5.6,R1=21.6,len=R1-R0;
  for(const c of AMB.cars){const u=((t+c.o)%c.P)/c.P,r=c.lane===0?R0+u*len:R1-u*len,n=c.n;
    n.p=[LANE[c.lane],0,r];n.r[1]=c.lane===0?0:Math.PI;n.k=c.moto?1:1;
    for(const h of n.L)h.col=NIGHT?"!#fff2b0":"#f5f1dc";for(const x of n.T)x.col=NIGHT?"!#ff4d4d":"#b42318";
    if(c.moto){poseP(n.rider,"type",t,0);n.rider.j.head.r=[-.05,0,0];n.rider.j.aL.el.r[0]=n.rider.j.aR.el.r[0]=-.7;n.rider.j.aL.r[0]=n.rider.j.aR.r[0]=-.9;n.r[2]=Math.sin(t*1.3+c.o)*.03}
    push(n);if(NIGHT){STUB.globalAlpha=1;tr.push({m:MESH.disc,M:M4.mul(M4.T(LANE[c.lane],.02,r+(c.lane===0?1.3:-1.3)),M4.S(.45,1,.9)),c:parseCol("!#fff2b0"),a:.18})}}
  for(const p of AMB.peds){const u=((t+p.o)%p.P)/p.P,fw=u<.5,k=fw?u*2:(1-u)*2,r=R0+.5+k*(len-1);const n=p.n;poseP(n,"walk",t,fw?0:Math.PI);n.p=[WW+3.17,0,r];push(n)}
  if(!NIGHT){for(const b of AMB.birds){const a=t*.22+b.i*.55,R=11+Math.sin(b.i*1.7)*2.5,cx=WW/2,cz=DD/2,y=11.5+Math.sin(t*.7+b.i)*.5+b.i*.25;const n=b.n;
      n.p=[cx+Math.cos(a)*R,y,cz+Math.sin(a)*R];n.r[1]=Math.atan2(-Math.sin(a),Math.cos(a));n.r[2]=-.25;const f=Math.sin(t*13+b.i*2)*.75;n.wl.r[2]=f;n.wr.r[2]=-f;push(n)}
    for(const c of AMB.clouds){const ang=cam.az+Math.PI+(c.i-2)*.42+Math.sin(t*.03+c.i*1.3)*.12,R=38+c.i%2*6,n=c.n;n.p=[WW/2+Math.sin(ang)*R,16+c.i%3*3,DD/2+Math.cos(ang)*R];n.r[1]=c.i;n.k=2+c.i%2*.6;push(n)}}
  {const cat=AMB.cats[0],n=cat.n,P=34,u=(t%P);let c=0,face=Math.PI/2,walk=false;
    if(u<12){c=.6+u/12*6;walk=true}else if(u<17){c=6.6;face=0}else if(u<29){c=6.6-(u-17)/12*6;walk=true;face=-Math.PI/2}else{c=.6;face=0}
    n.p=[c,0,18.5];n.r[1]=face;const w=t*9;n.legs.forEach((l,i)=>l.r[0]=walk?Math.sin(w+(i%2?Math.PI:0)+(i>1?Math.PI:0))*.5:0);n.tail.r[0]=walk?.2:Math.sin(t*2)*.3;n.tail.r[1]=Math.sin(t*1.7)*.4;push(n,true)}
  {const n=AMB.cats[1].n;n.p=[ENTRANCE[1]+1.2,0,DD+1.1];n.r[1]=-.6;n.legs[2].r[0]=n.legs[3].r[0]=-1.2;n.tail.r[1]=Math.sin(t*1.5)*.6;push(n,true)}}
function personDraws(o,t,al,op,tr){const Pn=personOf(o.p),sit=o.pose==="sit";
  const mode=sit?(o.typing?"type":"sit"):o.pose==="walk"?"walk":o.talking?"talk":o.ak==="brk"?"drink":"idle";
  poseP(Pn,mode,t,YAW[o.face]??0);const y=FZ(o.f)/PXU;Pn.p=[o.c,y,o.r];
  const feet=toScreen([o.r,o.c,FZ(o.f)]),head=toScreen([o.r,o.c,FZ(o.f)+(sit?35:42)]);o.head=[o.r,o.c,FZ(o.f)+(sit?35:42)];
  if(feet[0]<-80||feet[0]>SW+80||head[1]>SH+80||feet[1]<-80)return;
  nodeDraws(Pn,ID4,al,feet[1]-head[1]>30,op,tr);
  if(o.sel||o.hov)op.push({m:MESH.ring,M:M4.mul(M4.T(o.c,y+.012,o.r),M4.S(.36,1,.36)),c:parseCol(o.sel?"!#12c08a":"!#ffffff"),a:1})}

/* =========================================================
   LANTAI (dibangun sekali, dibangun ulang saat tata letak berubah)
   ========================================================= */
function wallItems(F){const out=[];
  for(const[key,ivs]of F.hw){const r=key/2;if(r<=0||r>=DD)continue;for(const[a,b]of ivs)for(let c=a;c<b-1e-6;){const e=Math.min(b,Math.floor(c+1));out.push({k:r+(c+e)/2,d:((r,c,e)=>()=>prism(r-.05,c,.1,e-c,0,PH,"#f4f1ea",{top:"#cdbfa6"}))(r,c,e)});c=e}}
  for(const[key,ivs]of F.vw){const cc=key/2;if(cc<=0||cc>=WW)continue;for(const[a,b]of ivs)for(let r=a;r<b-1e-6;){const e=Math.min(b,Math.floor(r+1));out.push({k:cc+(r+e)/2,d:((cc,r,e)=>()=>prism(r,cc-.05,e-r,.1,0,PH,"#f4f1ea",{top:"#cdbfa6"}))(cc,r,e)});r=e}}
  return out}
function recFloorCore(f){const F=FL[f];ZF=FZ(f);
  prism(0,0,DD,WW,-8,7.4,"#b9bdb9");
  floorQ(0,0,DD,WW,0,"#d7dad6");for(let c=1;c<WW;c+=1)line(Q(0,c),Q(DD,c),"rgba(0,0,0,.035)",.7);for(let r=1;r<DD;r+=1)line(Q(r,0),Q(r,WW),"rgba(0,0,0,.035)",.7);
  for(const Rm of F.rooms){if(Rm.type==="toilet"||Rm.type==="stairs")continue;const T=TYPE[Rm.type];
    if(Rm.zone){floorQ(Rm.r0,Rm.c0,Rm.r0+Rm.dr,Rm.c0+Rm.dc,.05,"rgba(200,170,110,.18)","rgba(140,110,60,.55)",1.2);textFloor(Rm.r0+Rm.dr-.38,Rm.c0+.35,Rm.id.replace(/^\d+\./,""),.42,"rgba(110,80,40,.65)")}
    else if(Rm.open&&Rm.type!=="cluster")floorQ(Rm.r0,Rm.c0,Rm.r0+Rm.dr,Rm.c0+Rm.dc,0,T.floor);
    else if(!Rm.open){floorQ(Rm.r0,Rm.c0,Rm.r0+Rm.dr,Rm.c0+Rm.dc,0,T.floor);if(["exec","office","cluster","area"].includes(Rm.type)){for(let r=Rm.r0+.5;r<Rm.r0+Rm.dr;r+=.5)line(Q(r,Rm.c0),Q(r,Rm.c0+Rm.dc),"rgba(90,61,32,.12)",.8)}
      for(const d of Rm.doors){const o=d.s==="B"?[Rm.r0+Rm.dr-.4,d.at-.5,Rm.r0+Rm.dr,d.at+.5]:d.s==="T"?[Rm.r0,d.at-.5,Rm.r0+.4,d.at+.5]:d.s==="L"?[d.at-.5,Rm.c0,d.at+.5,Rm.c0+.4]:[d.at-.5,Rm.c0+Rm.dc-.4,d.at+.5,Rm.c0+Rm.dc];floorQ(o[0],o[1],o[2],o[3],.03,"rgba(0,0,0,.08)")}}}
  for(const it of F.floorItems)it.d();
  for(const it of F.items)it.d();for(const it of F.walls)it.d();
  if(f===0){const[a,b]=ENTRANCE;for(const x of[a,b])prism(DD-.08,x-.06,.08,.12,0,54,"#56636f");prism(DD-.1,a-.1,.12,b-a+.2,54,5,"#56636f");signL(DD+.021,a+.3,b-.3,44,8,"#0f7c72","2  PINTU MASUK")}}
/* dinding luar per sisi: utuh (jauh dari kamera) atau pagar kaca rendah (dekat kamera) */
function recSide(f,side,full){ZF=FZ(f);const pal=PAL(),gap=f===0&&side==="S";
  const wallH=(r0,c0,dr,dc)=>prism(r0,c0,dr,dc,0,WALLH,side==="N"||side==="S"?"#efe9df":"#e6dfd2",{top:"#cbbfa9"});
  if(full){
    if(side==="N"){wallH(-.15,-.15,.15,WW+.3);for(let c=.4;c+1.1<WW;c+=1.6){faceL(.004,c,c+1.2,22,WALLH-10,pal.inWin);faceL(.006,c,c+1.2,22,24,"#cfd6db")}}
    if(side==="S"){if(gap){wallH(DD,-.15,.15,ENTRANCE[0]+.15);wallH(DD,ENTRANCE[1],.15,WW-ENTRANCE[1]+.15)}else wallH(DD,-.15,.15,WW+.3);
      for(let c=.4;c+1.1<WW;c+=1.6){if(gap&&c+1.2>ENTRANCE[0]&&c<ENTRANCE[1])continue;faceL(DD-.004,c,c+1.2,22,WALLH-10,pal.inWin);faceL(DD-.006,c,c+1.2,22,24,"#cfd6db")}}
    if(side==="W"){wallH(-.15,-.15,DD+.3,.15);for(let r=.4;r+1.1<DD;r+=1.6){faceR(.004,r,r+1.2,22,WALLH-10,pal.inWin);faceR(.006,r,r+1.2,22,24,"#cfd6db")}}
    if(side==="E"){wallH(-.15,WW,DD+.3,.15);for(let r=.4;r+1.1<DD;r+=1.6){faceR(WW-.004,r,r+1.2,22,WALLH-10,pal.inWin);faceR(WW-.006,r,r+1.2,22,24,"#cfd6db")}}
    return}
  const glass="rgba(191,227,242,.32)",rim="#9fc3d3";
  if(side==="N"){faceL(0,0,WW,0,14,glass);line(Q(0,0,14),Q(0,WW,14),rim,1.4)}
  if(side==="W"){faceR(0,0,DD,0,14,glass);line(Q(0,0,14),Q(DD,0,14),rim,1.4)}
  if(side==="E"){faceR(WW,0,DD,0,14,glass);line(Q(0,WW,14),Q(DD,WW,14),rim,1.4)}
  if(side==="S"){if(gap){faceL(DD,0,ENTRANCE[0],0,14,glass);faceL(DD,ENTRANCE[1],WW,0,14,glass);line(Q(DD,0,14),Q(DD,ENTRANCE[0],14),rim,1.4);line(Q(DD,ENTRANCE[1],14),Q(DD,WW,14),rim,1.4)}
    else{faceL(DD,0,WW,0,14,glass);line(Q(DD,0,14),Q(DD,WW,14),rim,1.4)}}}

/* =========================================================
   KAMERA & PROYEKSI
   ========================================================= */
const cam={x:WW/2,y:1,w:DD/2,tx:WW/2,ty:1,tw:DD/2,az:Math.PI/4,taz:Math.PI/4,el:.62,tel:.62,z:1,dist:30,inited:false};
let VPm=M4.id(),IVP=M4.id(),EYE=[0,0,0];
function toScreen(p){const v=M4.app(VPm,W3(p));if(v[3]<=.05)return[-9999,-9999];return[(v[0]/v[3]*.5+.5)*SW,(1-(v[1]/v[3]*.5+.5))*SH]}
function baseDist(){const asp=SW/Math.max(1,SH),t=Math.tan(FOV/2);return S.view==="out"?Math.max(18/(t*asp),14.5/t):Math.max((asp<1?12.2:14)/(t*asp),8.4/t)}
function viewCenter(){return S.view==="out"?[WW/2,FZ(2)/PXU,DD/2]:[WW/2,FZ(S.view)/PXU+.5,DD/2]}
function fit(instant){const c=viewCenter();cam.tx=c[0];cam.ty=c[1];cam.tw=c[2];if(instant){cam.x=cam.tx;cam.y=cam.ty;cam.w=cam.tw;cam.dist=baseDist()/cam.z}}
const glc=document.createElement("canvas");glc.setAttribute("aria-hidden","true");Object.assign(glc.style,{position:"absolute",left:"0",top:"0",width:"100%",height:"100%",pointerEvents:"none"});
stage.insertBefore(glc,cv);cv.style.position="relative";cv.style.background="transparent";
const GL_OK=glInit(glc);
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);SW=stage.clientWidth;SH=stage.clientHeight;for(const c of[cv,glc]){c.width=Math.round(SW*DPR);c.height=Math.round(SH*DPR)}if(!cam.inited){cam.inited=true;fit(true)}}
new ResizeObserver(resize).observe(stage);resize();
function rayAt(mx,my){const x=mx/SW*2-1,y=1-my/SH*2,a=M4.app(IVP,[x,y,-1,1]),b=M4.app(IVP,[x,y,1,1]);const A=[a[0]/a[3],a[1]/a[3],a[2]/a[3]],B=[b[0]/b[3],b[1]/b[3],b[2]/b[3]];return{o:A,d:[B[0]-A[0],B[1]-A[1],B[2]-A[2]]}}
function planeRC(mx,my,zpx){const R0=rayAt(mx,my),y=(zpx??FZ(S.view==="out"?0:S.view))/PXU;if(Math.abs(R0.d[1])<1e-9)return[-99,-99];const t=(y-R0.o[1])/R0.d[1];if(t<0)return[-99,-99];return[R0.o[2]+R0.d[2]*t,R0.o[0]+R0.d[0]*t]}
function rayFloor(mx,my){const R0=rayAt(mx,my),lo=[0,FZ(0)/PXU,0],hi=[WW,FZ(4)/PXU,DD];let t0=0,t1=1e9;
  for(let i=0;i<3;i++){const o=R0.o[i],d=R0.d[i];if(Math.abs(d)<1e-9){if(o<lo[i]||o>hi[i])return -1;continue}let a=(lo[i]-o)/d,b=(hi[i]-o)/d;if(a>b)[a,b]=[b,a];t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1)return -1}
  const y=(R0.o[1]+R0.d[1]*t0)*PXU;return Math.max(0,Math.min(FLOORS-1,Math.floor((y-8)/FH)))}

/* =========================================================
   GAMBAR PER FRAME
   ========================================================= */
const BAT={world:null,wkey:"",fac:null,fkey:"",roof:null,rkey:"",floor:[],gh:null,gkey:""};
function sideNear(side){const e=EYE;return side==="N"?e[2]<0:side==="S"?e[2]>DD:side==="W"?e[0]<0:e[0]>WW}
function ensureBatches(){const nk=NIGHT?"n":"d";
  if(BAT.wkey!==nk+TEXGEN){glFree(BAT.world);BAT.world=record(recWorld);BAT.wkey=nk+TEXGEN}
  const nf=S.view==="out"?4:S.view,fk=nf+nk+(S.present||S.floorCount||[]).map(x=>x>0?1:0).join("")+TEXGEN;
  if(BAT.fkey!==fk){glFree(BAT.fac);BAT.fac=record(()=>recFacade(nf));BAT.fkey=fk}
  if(S.view==="out"){if(BAT.rkey!==nk+TEXGEN){glFree(BAT.roof);BAT.roof=record(recRoof);BAT.rkey=nk+TEXGEN}return}
  const f=S.view,key=BV+nk+TEXGEN;let b=BAT.floor[f];
  if(!b||b.key!==key){if(b){glFree(b.core);for(const s in b.sides){glFree(b.sides[s].full);glFree(b.sides[s].rail)}}
    b={key,core:record(()=>recFloorCore(f)),sides:{}};for(const s of["N","S","W","E"])b.sides[s]={full:record(()=>recSide(f,s,true)),rail:record(()=>recSide(f,s,false))};BAT.floor[f]=b}
  const g=S.edit&&S.ghost&&ROOMS[S.edit.room]?.f===f?S.ghost:null,gk=g?JSON.stringify(g)+f:"";
  if(BAT.gkey!==gk){glFree(BAT.gh);BAT.gh=g?record(()=>{ZF=FZ(f);const tmp=[];if(g.t==="desk")tmp.push({d:()=>drawUnitDesk(g,0)});chairItems(tmp,g);tmp.forEach(x=>x.d())}):null;BAT.gkey=gk}}
function draw(t){
  const was=NIGHT;NIGHT=isNight();const pal=PAL(),tSec=Date.now()/1000;
  if(was!==NIGHT||!stage.dataset.sky){stage.style.background=`linear-gradient(${pal.sky1},${pal.sky2})`;stage.dataset.sky="1"}
  S.poses=R.people.map(p=>poseOf(p,tSec)).filter(Boolean);S.present=[0,0,0,0];for(const o of S.poses)if(!o.away&&o.f>=0&&o.f<4)S.present[o.f]++;
  S.guestPoses=S.view===0?guestPoses(tSec):[];
  if(S.follow){const o=S.poses.find(o=>o.p.id===S.follow);if(o){if(S.view!==o.f)setView(o.f,true);if(!o.hidden){cam.tx=o.c;cam.tw=o.r;cam.ty=FZ(o.f)/PXU+.5}}}
  const k=.14;cam.x+=(cam.tx-cam.x)*k;cam.y+=(cam.ty-cam.y)*k;cam.w+=(cam.tw-cam.w)*k;
  let da=cam.taz-cam.az;da=Math.atan2(Math.sin(da),Math.cos(da));cam.az+=da*.18;cam.el+=(cam.tel-cam.el)*.18;cam.dist+=(baseDist()/cam.z-cam.dist)*k;
  const ce=Math.cos(cam.el);EYE=[cam.x+Math.sin(cam.az)*ce*cam.dist,cam.y+Math.sin(cam.el)*cam.dist,cam.w+Math.cos(cam.az)*ce*cam.dist];
  VPm=M4.mul(M4.persp(FOV,SW/Math.max(1,SH),Math.max(.5,cam.dist*.05),cam.dist*4+80),M4.look(EYE,[cam.x,cam.y,cam.w],[0,1,0]));IVP=M4.inv(VPm);
  ctx=ctx2;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,SW,SH);
  if(!GL_OK){ctx.fillStyle="#14232b";ctx.font="700 15px Manrope, sans-serif";ctx.textAlign="center";ctx.fillText("Browser ini belum mendukung tampilan 3D (WebGL).",SW/2,SH/2);ctx.textAlign="start";return}
  ensureBatches();
  gl.viewport(0,0,glc.width,glc.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(GLS.L);const L=GLS.l;
  gl.uniformMatrix4fv(L.VP,false,VPm);gl.uniform3fv(L.E,EYE);gl.uniform3f(L.L,.42,.84,.34);
  if(NIGHT){gl.uniform3f(L.SKY,.62,.68,.9);gl.uniform3f(L.GND,.3,.3,.38);gl.uniform1f(L.AM,.55);gl.uniform1f(L.DI,.22)}else{gl.uniform3f(L.SKY,1,.98,.95);gl.uniform3f(L.GND,.56,.53,.56);gl.uniform1f(L.AM,.6);gl.uniform1f(L.DI,.52)}
  const fb=S.view==="out"?null:BAT.floor[S.view],sides=fb?["N","S","W","E"].map(s=>sideNear(s)?fb.sides[s].rail:fb.sides[s].full):[];
  const stat=[BAT.world,BAT.fac,S.view==="out"?BAT.roof:null,fb?.core,...sides].filter(Boolean);
  gl.depthMask(true);for(const b of stat)drawParts(b.solid);
  const op=[],tr=[];
  if(fb){for(const o of S.poses){if(o.f!==S.view||o.hidden)continue;o.sel=S.sel?.type==="person"&&S.sel.id===o.p.id;o.hov=S.hover?.type==="person"&&S.hover.id===o.p.id;
      const dim=!!(S.focusDiv&&o.p.div!==S.focusDiv);o.dim=dim;personDraws(o,t/1000,dim?.28:1,op,tr)}
    if(S.view===0)for(const g of S.guestPoses||[])personDraws(g,t/1000,g.alpha*(S.focusDiv?.28:1)*.999,op,tr)}
  ambientDraws(t/1000,op,tr);drawNodes(op);gl.depthMask(false);
  for(const b of stat)drawParts(b.decal);for(const b of stat)drawTexts(b,VPm,true);gl.useProgram(GLS.L);
  for(const b of stat)drawParts(b.trans);for(const b of stat)drawTexts(b,VPm,false);gl.useProgram(GLS.L);
  drawNodes(tr);if(BAT.gh){drawParts(BAT.gh.solid,.5);drawParts(BAT.gh.trans,.5)}
  gl.depthMask(true);
  if(S.view==="out"){HIT_BUBBLES=[];HIT_PEOPLE=[];HIT_PLAQ=[];HIT_DIVS=[];drawFloorBadges(S.hover?.type==="floor"?S.hover.f:-1)}
  else{ZF=FZ(S.view);drawRoomMarks(S.view,t);drawPlaques(S.view);const bub=S.poses.filter(o=>o.f===S.view&&!o.hidden&&!o.dim&&o.head);drawBubbles(bub,t);if(S.view===0)drawGuestTags(S.guestPoses||[])}
}
function loop(t){try{draw(t)}catch(e){console.error(e)}requestAnimationFrame(loop)}
if(document.fonts?.ready)document.fonts.ready.then(()=>{TEXGEN++;BV++});

/* =========================================================
   OVERLAY: papan nama ruang, label karyawan, tanda lantai
   ========================================================= */
let HIT_BUBBLES=[],HIT_PEOPLE=[],HIT_FLOORS=[],HIT_PLAQ=[],HIT_DIVS=[];
function fitText(t,max){if(ctx.measureText(t).width<=max)return t;while(t.length>2&&ctx.measureText(t+"…").width>max)t=t.slice(0,-1);return t+"…"}
function pathPts(pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
function drawRoomMarks(f,t){ZF=FZ(f);
  for(const Rm of FL[f].rooms){const sel=S.sel?.type==="room"&&S.sel.id===Rm.id,hov=S.hover?.type==="room"&&S.hover.id===Rm.id;if(!sel&&!hov)continue;
    const a=.04,pts=[Q(Rm.r0+a,Rm.c0+a,1),Q(Rm.r0+a,Rm.c0+Rm.dc-a,1),Q(Rm.r0+Rm.dr-a,Rm.c0+Rm.dc-a,1),Q(Rm.r0+Rm.dr-a,Rm.c0+a,1)].map(toScreen);
    pathPts(pts);ctx.strokeStyle=sel?"#12c08a":"rgba(255,255,255,.95)";ctx.lineWidth=2.6;ctx.stroke();ctx.fillStyle=sel?"rgba(18,192,138,.10)":"rgba(255,255,255,.08)";ctx.fill();
    if(sel){const occ=S.seatOcc[Rm.id]||[];Rm.seats.forEach((s,i)=>{if(occ[i])return;const b=toScreen(Q(s.r,s.c,30+Math.sin(t/300+i)*2));ctx.fillStyle="rgba(18,192,138,.9)";ctx.beginPath();ctx.arc(b[0],b[1],5,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(b[0]-2.6,b[1]-.7,5.2,1.4);ctx.fillRect(b[0]-.7,b[1]-2.6,1.4,5.2)})}}
  if(S.edit&&ROOMS[S.edit.room]?.f===f){const E=S.edit,it=E.items[E.sel];
    E.items.forEach((x,i)=>{const b=toScreen(Q(x.r,x.c,34));ctx.fillStyle=i===E.sel?"#12c08a":"rgba(20,34,40,.75)";ctx.beginPath();ctx.arc(b[0],b[1],6.5,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.font="800 7.5px Manrope, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(i+1),b[0],b[1]+.5)});
    if(it){ctx.save();ctx.setLineDash([4,3]);ctx.strokeStyle="#12c08a";ctx.lineWidth=2;const ring=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;ring.push(toScreen(Q(it.r+Math.cos(a)*.32,it.c+Math.sin(a)*.32,.5)))}pathPts(ring);ctx.stroke();
      if(it.t==="desk"){const u=unitDesk(it);pathPts([Q(u[0],u[1],14.5),Q(u[0],u[3],14.5),Q(u[2],u[3],14.5),Q(u[2],u[1],14.5)].map(toScreen));ctx.stroke()}ctx.restore()}}}
function drawPlaques(f){HIT_PLAQ=[];HIT_DIVS=[];if(!S.plaques)return;ctx.textBaseline="middle";ZF=FZ(f);
  for(const Rm of FL[f].rooms){if(Rm.type==="area")continue;
    const s=toScreen(Q(Rm.r0+Rm.dr*.5,Rm.c0+Rm.dc*.5,Rm.type==="toilet"?64:Rm.type==="stairs"?70:Rm.zone||Rm.open?2:44));if(s[0]<-200||s[0]>SW+200||s[1]<-60||s[1]>SH+60)continue;
    ctx.font="800 11px Manrope, sans-serif";const t1=fitText(Rm.name,150),w1=ctx.measureText(t1).width;
    ctx.font="800 9.5px Manrope, sans-serif";const chips=roomDivs(Rm.id).map(id=>{const d=R.divs[id],t=fitText(d.name,90);return{id,t,c:d.color,w:ctx.measureText(t).width+22}});
    const cw=chips.reduce((a,c)=>a+c.w,0)+Math.max(0,chips.length-1)*4;
    const bw=Math.max(w1,cw)+16,bh=18+(chips.length?19:0),x=s[0]-bw/2,y=s[1]-bh/2;
    ctx.globalAlpha=.88;ctx.fillStyle="rgba(20,34,40,1)";rrect(x,y,bw,bh,8);ctx.fill();ctx.globalAlpha=1;
    ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font="800 11px Manrope, sans-serif";ctx.fillText(t1,x+8,y+9.5);const yy=y+17;
    let cx=x+8;for(const ch of chips){const hov=S.hover?.type==="div"&&S.hover.id===ch.id&&S.hover.room===Rm.id;
      ctx.fillStyle=ch.c;rrect(cx,yy,ch.w,15,7.5);ctx.fill();if(hov){ctx.strokeStyle="#fff";ctx.lineWidth=1.5;rrect(cx,yy,ch.w,15,7.5);ctx.stroke()}
      ctx.fillStyle="#fff";ctx.font="800 9.5px Manrope, sans-serif";ctx.fillText(ch.t,cx+7,yy+8);ctx.font="800 10px Manrope, sans-serif";ctx.fillText("›",cx+ch.w-10,yy+7.5);
      HIT_DIVS.push({id:ch.id,room:Rm.id,x:cx,y:yy,w:ch.w,h:15});cx+=ch.w+4}
    HIT_PLAQ.push({id:Rm.id,x,y,w:bw,h:bh})}}
function drawBubbles(list,t){
  HIT_BUBBLES=[];HIT_PEOPLE=[];if(!list.length)return;
  const items=list.map(o=>({o,s:toScreen(o.head),b:toScreen(Q(o.r,o.c,0))})).filter(it=>it.b[0]>-60&&it.b[0]<SW+60&&it.b[1]>-60&&it.s[1]<SH+60);
  for(const it of items){const hh=Math.max(12,it.b[1]-it.s[1]);HIT_PEOPLE.push({id:it.o.p.id,x:it.b[0]-hh*.32,y:it.s[1]-2,w:hh*.64,h:hh+4})}
  let show=items;if(S.lab==="off")show=items.filter(it=>it.o.sel||it.o.hov);
  show.sort((a,b)=>b.s[1]-a.s[1]);const placed=[];
  for(const it of show){const o=it.o,dv=divOf(o.p.div),byName=S.lab==="name",full=S.lab==="full"||o.sel||o.hov,showName=(o.sel||o.hov)&&!byName;
    ctx.font="800 10px Manrope, sans-serif";const l1=byName?fitText(o.p.name,150):fitText(dv.name.toUpperCase(),130),w1=ctx.measureText(l1).width;
    ctx.font="700 10.5px Manrope, sans-serif";const l2=full?fitText(o.p.bagian||o.p.jabatan||"—",140):"",w2=full?ctx.measureText(l2).width+12:0;
    ctx.font="800 12px Manrope, sans-serif";const l0=showName?fitText(o.p.name,160):"",w0=showName?ctx.measureText(l0).width:0;
    const bw=Math.max(w1+14,w2+12,w0+14),hTop=showName?17:0,bh=hTop+15+(full?16:0),bobY=Math.sin(t/600+(o.p._h%50))*1.6;
    let x=it.s[0]-bw/2,y=it.s[1]-bh-9+bobY;
    for(let pass=0;pass<6;pass++){let moved=false;for(const r of placed){if(x<r.x+r.w+2&&x+bw+2>r.x&&y<r.y+r.h+2&&y+bh+2>r.y){y=r.y-bh-3;moved=true}}if(!moved)break}
    placed.push({x:x-18,y,w:bw+18,h:bh});const ax=it.s[0],ay=it.s[1]+bobY-4;
    if(y+bh<ay-8){ctx.strokeStyle="rgba(20,34,40,.45)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,y+bh);ctx.lineTo(ax,ay);ctx.stroke()}
    ctx.save();ctx.shadowColor="rgba(0,0,0,.22)";ctx.shadowBlur=6;ctx.shadowOffsetY=2;ctx.fillStyle="#ffffff";rrect(x,y,bw,bh,7);ctx.fill();ctx.restore();
    if(o.sel){ctx.strokeStyle="#12c08a";ctx.lineWidth=2;rrect(x,y,bw,bh,7);ctx.stroke()}
    ctx.fillStyle="#ffffff";ctx.beginPath();ctx.moveTo(Math.min(Math.max(ax-5,x+6),x+bw-16),y+bh-.5);ctx.lineTo(Math.min(Math.max(ax+5,x+16),x+bw-6),y+bh-.5);ctx.lineTo(ax,Math.min(ay,y+bh+6));ctx.fill();
    ctx.textBaseline="middle";ctx.textAlign="center";
    if(showName){ctx.fillStyle="#1a2a2e";ctx.font="800 12px Manrope, sans-serif";ctx.fillText(l0,x+bw/2,y+9.5)}
    ctx.fillStyle=dv.color;rrect(x+3,y+hTop+2,bw-6,13,5);ctx.fill();ctx.fillStyle="#ffffff";ctx.font="800 10px Manrope, sans-serif";ctx.fillText(l1,x+bw/2,y+hTop+9);
    if(full){ctx.fillStyle=ACT_COL[o.ak]||"#8a95a0";ctx.beginPath();ctx.arc(x+bw/2-w2/2+3,y+hTop+24,3,0,7);ctx.fill();ctx.fillStyle="#2b3a40";ctx.font="700 10.5px Manrope, sans-serif";ctx.textAlign="left";ctx.fillText(l2,x+bw/2-w2/2+10,y+hTop+24.5)}
    if(o.emo){const ex=x-7,ey=y+bh/2;ctx.save();ctx.shadowColor="rgba(0,0,0,.25)";ctx.shadowBlur=5;ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(ex,ey,10.5,0,7);ctx.fill();ctx.restore();
      ctx.font='13px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(o.emo,ex,ey+1)}
    HIT_BUBBLES.push({id:o.p.id,x,y,w:bw,h:bh})}}
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(const p of pts.reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  return lo.slice(0,-1).concat(up.slice(0,-1))}
function drawFloorBadges(hover){HIT_FLOORS=[];ctx.textBaseline="middle";
  const cs=[[0,0],[0,WW],[DD,0],[DD,WW]];let best=cs[0],bd=-1e9;for(const[r,c]of cs){const d=(c-WW/2)*(EYE[0]-WW/2)+(r-DD/2)*(EYE[2]-DD/2);if(d>bd){bd=d;best=[r,c]}}
  for(let g=0;g<FLOORS;g++){if(hover===g){const pts=[];for(const[r,c]of cs)for(const z of[FZ(g)-8,FZ(g+1)-8])pts.push(toScreen([r,c,z]));pathPts(hull(pts));ctx.fillStyle="rgba(51,209,185,.28)";ctx.fill();ctx.strokeStyle="#33d1b9";ctx.lineWidth=2;ctx.stroke()}
    const n=S.floorCount?.[g]||0,cap=FL[g].rooms.reduce((a,r)=>a+r.seats.length,0);
    const a=toScreen([best[0]+(best[0]?.3:-.3),best[1]+(best[1]?.3:-.3),FZ(g)+FH/2-6]);const t1=`Lantai ${g+1}`,t2=`${n} orang · ${cap} kursi`;ctx.font="700 11px Manrope, sans-serif";
    const bw=Math.max(ctx.measureText(t2).width,70)+22,bh=36,x=Math.min(SW-bw-8,a[0]+10),y=a[1]-bh/2;
    ctx.fillStyle=hover===g?"#0f7c72":"rgba(20,34,40,.86)";rrect(x,y,bw,bh,10);ctx.fill();ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font="800 13px Manrope, sans-serif";ctx.fillText(t1,x+11,y+12);
    ctx.fillStyle="rgba(255,255,255,.75)";ctx.font="700 11px Manrope, sans-serif";ctx.fillText(t2,x+11,y+26);HIT_FLOORS.push({f:g,badge:{x,y,w:bw,h:bh}})}}
function drawGuestTags(list){if(S.lab==="off")return;ctx.textBaseline="middle";ctx.textAlign="center";ctx.font="800 9.5px Manrope, sans-serif";
  for(const g of list){if(!g.head)continue;const s=toScreen(g.head),w=40,x=s[0]-w/2,y=s[1]-24;ctx.globalAlpha=g.alpha;
    ctx.fillStyle="#64748b";rrect(x,y,w,15,7.5);ctx.fill();ctx.fillStyle="#fff";ctx.fillText("TAMU",s[0],y+8);ctx.globalAlpha=1}}

/* =========================================================
   INPUT: seret = putar kamera, klik kanan/Shift/dua jari = geser, gulir/cubit = zoom
   ========================================================= */
const ptrs=new Map();let drag=null,pinch=null,itemDrag=null;
const inRect=(x,y,r)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
function pick(mx,my){
  if(S.view==="out"){for(const fl of HIT_FLOORS)if(inRect(mx,my,fl.badge))return{type:"floor",f:fl.f};const f=rayFloor(mx,my);return f>=0?{type:"floor",f}:null}
  for(let i=HIT_DIVS.length-1;i>=0;i--)if(inRect(mx,my,HIT_DIVS[i]))return{type:"div",id:HIT_DIVS[i].id,room:HIT_DIVS[i].room};
  for(let i=HIT_BUBBLES.length-1;i>=0;i--)if(inRect(mx,my,HIT_BUBBLES[i]))return{type:"person",id:HIT_BUBBLES[i].id};
  let best=null;for(const h of HIT_PEOPLE)if(inRect(mx,my,h)){if(!best||h.y+h.h>best.y+best.h)best=h}if(best)return{type:"person",id:best.id};
  for(let i=HIT_PLAQ.length-1;i>=0;i--)if(inRect(mx,my,HIT_PLAQ[i]))return{type:"room",id:HIT_PLAQ[i].id};
  const[r,c]=planeRC(mx,my);
  const rooms=FL[S.view].rooms.filter(R=>r>=R.r0&&r<=R.r0+R.dr&&c>=R.c0&&c<=R.c0+R.dc).sort((x,y)=>x.dr*x.dc-y.dr*y.dc);
  return rooms.length?{type:"room",id:rooms[0].id}:null}
const tip=$("tip");
function showTip(h,mx,my){if(!h){tip.hidden=true;return}let html="";
  if(h.type==="person"){const p=personBy(h.id),o=S.poses.find(o=>o.p.id===h.id);if(!p){tip.hidden=true;return}const dv=divOf(p.div),st=S.seat[p.id];
    html=`<b>${esc(p.name)}</b><br><span class="divpill" style="background:${dv.color}">${esc(dv.name)}</span><br>${esc(p.bagian||"—")}${p.jabatan?` · ${esc(p.jabatan)}`:""}<br><span style="color:var(--muted)">${st&&!st.none?esc(`Lt ${st.f+1} · ${roomTitle(st.room.id)}`):"Belum punya kursi"}</span>${o?`<br><span class="act"><i class="dot" style="background:${ACT_COL[o.ak]}"></i>${o.emo?o.emo+" ":""}${esc(o.act)}</span>`:""}`}
  else if(h.type==="room"){const Rm=ROOMS[h.id];html=`<b>${esc(Rm.name)}</b><br><span style="color:var(--muted)">${MODE==="admin"?"Klik untuk mengatur ruangan ini":esc(TYPE[Rm.type].name)}</span>`}
  else if(h.type==="div"){const d=R.divs[h.id],n=appsOf(h.id).length;html=`<b>${esc(d?.name||"")}</b><br><span style="color:var(--muted)">${n?`Klik untuk membuka ${n} aplikasi divisi ini`:"Divisi ini belum punya aplikasi khusus"}</span>`}
  else if(h.type==="floor")html=`<b>Lantai ${h.f+1}</b><br><span style="color:var(--muted)">Klik untuk masuk ke lantai ini</span>`;
  tip.innerHTML=html;tip.hidden=false;const tw=tip.offsetWidth,th=tip.offsetHeight;tip.style.left=Math.min(SW-tw-8,mx+14)+"px";tip.style.top=Math.max(8,Math.min(SH-th-8,my+14))+"px"}
function panBy(dx,dy){const s=2*cam.dist*Math.tan(FOV/2)/Math.max(1,SH),ca=Math.cos(cam.az),sa=Math.sin(cam.az),k=1/Math.max(.45,Math.sin(cam.el));
  const mx=-dx*s*ca-dy*s*k*sa,mw=dx*s*sa-dy*s*k*ca;cam.tx+=mx;cam.tw+=mw;cam.x+=mx;cam.w+=mw;
  cam.tx=Math.max(-4,Math.min(WW+4,cam.tx));cam.tw=Math.max(-4,Math.min(DD+4,cam.tw))}
function orbitBy(dx,dy){cam.taz-=dx*.0075;cam.az-=dx*.0075;cam.tel=Math.max(.2,Math.min(1.42,cam.tel+dy*.005));cam.el=cam.tel}
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};drag=null;itemDrag=null;return}
  if(S.edit&&S.view===editRoom()?.f&&e.button===0){const[r,c]=planeRC(e.offsetX,e.offsetY),i=hitItem(r,c);if(i>=0){const it=S.edit.items[i];S.edit.sel=i;itemDrag={i,dr:r-it.r,dc:c-it.c};drag=null;S.ghost=null;renderDrawer();return}}
  drag={x:e.offsetX,y:e.offsetY,moved:false,pan:e.button===2||e.button===1||e.shiftKey||e.ctrlKey||e.metaKey}});
cv.addEventListener("pointermove",e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(itemDrag&&S.edit){const[r,c]=planeRC(e.offsetX,e.offsetY),it=S.edit.items[itemDrag.i];if(!it){itemDrag=null;return}const nr=snap(r-itemDrag.dr),nc=snap(c-itemDrag.dc);
    if(nr!==it.r||nc!==it.c){it.r=nr;it.c=nc;clampItem(editRoom(),it);S.edit.dirty=true;buildFloors();recompute()}return}
  if(pinch&&ptrs.size===2){const[a,b]=[...ptrs.values()];cam.z=Math.max(.45,Math.min(4,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;panBy(mx-pinch.mx,my-pinch.my);pinch.mx=mx;pinch.my=my;stopFollow();return}
  if(drag){const dx=e.offsetX-drag.x,dy=e.offsetY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>5){drag.moved=true;cv.classList.add("drag");if(drag.pan)stopFollow()}
    if(drag.moved){if(drag.pan)panBy(dx,dy);else orbitBy(dx,dy);drag.x=e.offsetX;drag.y=e.offsetY;tip.hidden=true;return}}
  if(S.edit){const Rm=editRoom();S.hover=null;tip.hidden=true;if(S.view!==Rm.f){S.ghost=null;return}const[r,c]=planeRC(e.offsetX,e.offsetY);
    const over=hitItem(r,c);S.ghost=inRoom(Rm,r,c)&&over<0?clampItem(Rm,{t:S.edit.tool,r:snap(r),c:snap(c),face:S.edit.face,ds:S.edit.ds,cs:S.edit.cs}):null;cv.classList.toggle("pt",over>=0||!!S.ghost);return}
  const h=pick(e.offsetX,e.offsetY);S.hover=h;cv.classList.toggle("pt",!!h);showTip(h,e.offsetX,e.offsetY)});
cv.addEventListener("pointerup",e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;cv.classList.remove("drag");
  if(itemDrag){itemDrag=null;renderDrawer();return}
  if(drag&&!drag.moved&&e.button===0){if(S.edit){const Rm=editRoom(),[r,c]=planeRC(e.offsetX,e.offsetY);if(S.view===Rm.f&&inRoom(Rm,r,c)){S.ghost=null;editAdd(r,c)}else toast("Klik di dalam ruangan yang sedang diatur, atau tekan Simpan / Batal dulu")}
    else onPick(pick(e.offsetX,e.offsetY))}drag=null});
cv.addEventListener("pointercancel",e=>{ptrs.delete(e.pointerId);pinch=null;drag=null;cv.classList.remove("drag")});
cv.addEventListener("pointerleave",()=>{S.hover=null;S.ghost=null;tip.hidden=true});
cv.addEventListener("wheel",e=>{e.preventDefault();cam.z=Math.max(.45,Math.min(4,cam.z*Math.exp(-e.deltaY*.0015)))},{passive:false});
function onPick(h){if(!h){if(S.hub){closeHub();return}if(S.form)return;if(S.sel){S.sel=null;renderDrawer();renderBody()}return}
  if(h.type==="floor"){setView(h.f);return}if(h.type==="div"){openHub(h.id,null,false);return}if(h.type==="person"){const p=personBy(h.id);selectPerson(h.id,false);if(p)openHub(p.div,p.id,false);return}if(h.type==="room")selectRoom(h.id,false)}
$("zin").onclick=()=>cam.z=Math.min(4,cam.z*1.25);$("zout").onclick=()=>cam.z=Math.max(.45,cam.z/1.25);
$("zfit").onclick=()=>{stopFollow();cam.z=1;cam.taz=Math.PI/4;cam.tel=.62;fit(false)};
{const zo=$("zout");if(zo){const mk=(id,txt,lab,d)=>{const b=document.createElement("button");b.className="hudbtn";b.id=id;b.textContent=txt;b.setAttribute("aria-label",lab);b.title=lab;b.onclick=()=>{cam.taz+=d};return b};
  zo.after(mk("rotL","⟲","Putar ke kiri",-Math.PI/4),mk("rotR","⟳","Putar ke kanan",Math.PI/4))}}
function setView(v,keepFollow){S.view=v;if(!keepFollow)stopFollow();document.querySelectorAll("#floorSeg button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.view===String(v))));
  if(!keepFollow){cam.z=1;fit(false)}S.hover=null;tip.hidden=true}
document.querySelectorAll("#floorSeg button").forEach(b=>b.onclick=()=>setView(b.dataset.view==="out"?"out":+b.dataset.view));
document.querySelectorAll("#labelSeg button[data-lab]").forEach(b=>b.onclick=()=>{S.lab=b.dataset.lab;document.querySelectorAll("#labelSeg button[data-lab]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));try{localStorage.setItem("ke-lab",S.lab)}catch{}});
$("plaqBtn").onclick=()=>{S.plaques=!S.plaques;$("plaqBtn").setAttribute("aria-pressed",String(S.plaques))};
document.querySelectorAll("#daySeg button").forEach(b=>b.onclick=()=>{S.dayMode=b.dataset.day;document.querySelectorAll("#daySeg button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});
try{const l=localStorage.getItem("ke-lab");if(l&&["full","div","name","off"].includes(l)){S.lab=l;document.querySelectorAll("#labelSeg button[data-lab]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.lab===l)))}}catch{}
const followEl=$("follow");
function stopFollow(){if(!S.follow)return;S.follow=null;followEl.hidden=true}
function startFollow(id){const p=personBy(id);if(!p)return;S.follow=id;cam.z=Math.max(cam.z,1.8);followEl.hidden=false;
  followEl.innerHTML=`<span>Mengikuti <b>${esc(p.name)}</b></span><button class="btn sm" id="unfollow">Berhenti</button>`;$("unfollow").onclick=()=>{stopFollow();renderDrawer()}}
function selectPerson(id,go){S.sel={type:"person",id};S.form=null;S.armed=null;const h=S.seat[id];if(go&&h){if(S.view!==h.f)setView(h.f);startFollow(id)}renderDrawer();renderBody()}
function lookAtRoom(Rm,z){cam.tx=Rm.c0+Rm.dc/2;cam.tw=Rm.r0+Rm.dr/2;cam.ty=FZ(Rm.f)/PXU+.3;cam.z=z}
function selectRoom(id,go){const Rm=ROOMS[id];S.sel={type:"room",id};S.form=null;S.armed=null;
  if(go){stopFollow();setView(Rm.f);lookAtRoom(Rm,1.6)}
  renderDrawer();renderBody();if(window.innerWidth<1000)$("panel")?.scrollIntoView({behavior:"smooth",block:"start"})}

/* =========================================================
   MODE ATUR MEJA & KURSI (tata letak manual per ruangan)
   ========================================================= */
const snap=v=>Math.round(v*4)/4;
const editRoom=()=>S.edit?ROOMS[S.edit.room]:null;
const inRoom=(Rm,r,c)=>r>=Rm.r0&&r<=Rm.r0+Rm.dr&&c>=Rm.c0&&c<=Rm.c0+Rm.dc;
function clampItem(Rm,it){const e=itemExt(it);let dr=0,dc=0;
  if(e[0]<Rm.r0+.05)dr=Rm.r0+.05-e[0];else if(e[2]>Rm.r0+Rm.dr-.05)dr=Rm.r0+Rm.dr-.05-e[2];
  if(e[1]<Rm.c0+.05)dc=Rm.c0+.05-e[1];else if(e[3]>Rm.c0+Rm.dc-.05)dc=Rm.c0+Rm.dc-.05-e[3];
  it.r=Math.round((it.r+dr)*100)/100;it.c=Math.round((it.c+dc)*100)/100;return it}
function hitItem(r,c){const E=S.edit;for(let i=E.items.length-1;i>=0;i--){const it=E.items[i];if(Math.hypot(it.r-r,it.c-c)<.4)return i;
  if(it.t==="desk"){const u=unitDesk(it);if(r>=u[0]&&r<=u[2]&&c>=u[1]&&c<=u[3])return i}}return -1}
function startEdit(id){const Rm=ROOMS[id];if(!Rm||!EDITABLE.has(Rm.type))return;const saved=R.layouts[id]?.items;
  const items=(Array.isArray(saved)?saved:Rm.seats.map(s=>({t:s.desk||s.boss?"desk":"chair",r:s.r,c:s.c,face:s.face||"up",ds:s.boss?"exec":"std",cs:s.boss?"boss":"office"}))).map(x=>({t:x.t==="chair"?"chair":"desk",r:+x.r,c:+x.c,face:["up","down","left","right"].includes(x.face)?x.face:"up",ds:DESK_STYLES[x.ds]?x.ds:"std",cs:CHAIR_STYLES[x.cs]?x.cs:"office"}));
  stopFollow();S.form=null;S.armed=null;S.sel={type:"room",id};S.edit={room:id,items,sel:-1,tool:"desk",face:"up",ds:"std",cs:"office",dirty:false};
  if(S.view!==Rm.f)setView(Rm.f);lookAtRoom(Rm,Math.max(1.4,Math.min(2.6,11/Math.max(Rm.dr,Rm.dc))));cam.tel=1.05;
  buildFloors();recompute();renderDrawer();if(window.innerWidth<1000)$("panel")?.scrollIntoView({behavior:"smooth",block:"start"})}

function editChange(){S.edit.dirty=true;buildFloors();recompute();renderDrawer()}
function endEdit(){S.edit=null;S.ghost=null;S.armed=null;buildFloors();recompute();renderDrawer();renderBody();renderKpis()}
function editAdd(r,c){const it=clampItem(editRoom(),{t:S.edit.tool,r:snap(r),c:snap(c),face:S.edit.face,ds:S.edit.ds,cs:S.edit.cs});S.edit.items.push(it);S.edit.sel=S.edit.items.length-1;editChange()}
function editMove(dr,dc){const E=S.edit,it=E.items[E.sel];if(!it)return;it.r+=dr;it.c+=dc;clampItem(editRoom(),it);editChange()}
const ROT={up:"right",right:"down",down:"left",left:"up"};
function editRotate(){const E=S.edit,it=E.items[E.sel];if(!it)return;it.face=ROT[it.face];clampItem(editRoom(),it);E.face=it.face;editChange()}
function editDelete(){const E=S.edit;if(E.sel<0)return;E.items.splice(E.sel,1);E.sel=-1;editChange()}
window.addEventListener("keydown",e=>{if(!S.edit||/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||""))return;const k=e.key;
  if(k==="ArrowUp")editMove(-.25,0);else if(k==="ArrowDown")editMove(.25,0);else if(k==="ArrowLeft")editMove(0,-.25);else if(k==="ArrowRight")editMove(0,.25);
  else if(k==="Delete"||k==="Backspace")editDelete();else if(k==="r"||k==="R")editRotate();else if(k==="Escape"){S.edit.sel=-1;renderDrawer()}else return;e.preventDefault()});
function editorHTML(){const E=S.edit,Rm=ROOMS[E.room],it=E.items[E.sel],nd=E.items.filter(x=>x.t==="desk").length,cur=it?it.face:E.face;
  const dirBtn=(f,lab)=>`<button data-act="eFace" data-f="${f}" aria-pressed="${cur===f}">${lab}</button>`;
  return`<div class="row"><div style="min-width:0"><div class="sec" style="margin:0">Atur meja & kursi · Lt ${Rm.f+1}</div><h3>${esc(Rm.name)}</h3></div><button class="x" data-act="eCancel" aria-label="Tutup">×</button></div>
  <div class="meta">Klik lantai di dalam ruangan untuk menaruh barang. Klik barang untuk memilih, lalu seret untuk memindahkan. Arah mengikuti denah: <b>atas</b> = sisi belakang gedung.</div>
  <div class="sec">Barang baru</div><div class="kinds" style="grid-template-columns:repeat(2,1fr)"><button data-act="eTool" data-t="desk" aria-pressed="${E.tool==="desk"}">Meja + kursi</button><button data-act="eTool" data-t="chair" aria-pressed="${E.tool==="chair"}">Kursi saja</button></div>
  <div class="sec">${it?(it.t==="desk"?"Model meja terpilih":"Model meja (pilih barang meja dulu)"):"Model meja"}</div><div class="kinds" style="grid-template-columns:repeat(5,1fr)">${Object.entries(DESK_STYLES).map(([k,v])=>`<button data-act="eDs" data-k="${k}" aria-pressed="${(it?it.ds:E.ds)===k&&(!it||it.t==="desk")}" ${it&&it.t!=="desk"?"disabled":""} title="Meja ${esc(v.name)}">${deskIcon(k)}<span>${esc(v.name)}</span></button>`).join("")}</div>
  <div class="sec">${it?"Model kursi terpilih":"Model kursi"}</div><div class="kinds" style="grid-template-columns:repeat(5,1fr)">${Object.entries(CHAIR_STYLES).map(([k,v])=>`<button data-act="eCs" data-k="${k}" aria-pressed="${(it?it.cs:E.cs)===k}" title="Kursi ${esc(v.name)}"><span style="width:18px;height:18px;border-radius:${v.stool?"50%":"5px 5px 3px 3px"};background:${v.col};display:block;box-shadow:inset 0 ${v.stool?0:6}px 0 rgba(255,255,255,.18)"></span><span>${esc(v.name)}</span></button>`).join("")}</div>
  <div class="sec">${it?"Arah hadap barang terpilih":"Arah hadap barang baru"}</div><div class="kinds">${dirBtn("up","↑ Atas")}${dirBtn("down","↓ Bawah")}${dirBtn("left","← Kiri")}${dirBtn("right","→ Kanan")}</div>
  ${it?`<div class="sec">Terpilih: ${it.t==="desk"?"meja + kursi":"kursi"} no. ${E.sel+1}</div>
    <div class="acts"><button class="btn sm" data-act="eMove" data-d="u" aria-label="Geser ke atas">↑</button><button class="btn sm" data-act="eMove" data-d="d" aria-label="Geser ke bawah">↓</button><button class="btn sm" data-act="eMove" data-d="l" aria-label="Geser ke kiri">←</button><button class="btn sm" data-act="eMove" data-d="r" aria-label="Geser ke kanan">→</button>
    <button class="btn sm" data-act="eRot">Putar</button><button class="btn sm danger" data-act="eDel">Hapus</button></div>
    <div class="meta">Di keyboard: tombol panah untuk menggeser, R untuk memutar, Delete untuk menghapus.</div>`:""}
  <div class="meta">${E.items.length?`<b>${nd}</b> meja · <b>${E.items.length}</b> kursi kerja`:`<b>Tanpa kursi.</b> Ruangan tetap bisa didatangi karyawan, seperti ruang meeting.`}${E.dirty?` · <span style="color:var(--warn);font-weight:700">belum disimpan</span>`:""}</div>
  <div class="acts"><button class="btn primary" data-act="eSave">Simpan tata letak</button><button class="btn" data-act="eCancel">Batal</button>
  ${E.items.length?`<button class="btn danger${S.armed==="eclr"?" armed":""}" data-act="eClear">${S.armed==="eclr"?"Klik lagi untuk menghapus semua":"Hapus semua kursi"}</button>`:""}
  ${R.layouts[Rm.id]?`<button class="btn danger${S.armed==="erst"?" armed":""}" data-act="eReset">${S.armed==="erst"?"Klik lagi untuk mengembalikan":"Kembalikan ke bawaan"}</button>`:""}</div>`}

/* =========================================================
   STORES
   ========================================================= */
function localStore(){let n=1;const arr=c=>c==="people"?R.people:c==="apps"?APPS:c==="slides"?SLIDES:null,obj=c=>c==="layouts"?R.layouts:c==="rooms"?R.rooms:R.divs;return{
  add:async(c,d)=>{const id="loc"+Date.now().toString(36)+(n++),a=arr(c);if(a)a.push({...d,id});else obj(c)[id]=d;changed();return id},
  set:async(c,id,d)=>{const a=arr(c);if(a){const i=a.findIndex(x=>x.id===id);if(i>=0)a[i]={...d,id};else a.push({...d,id})}else obj(c)[id]=d;changed()},
  update:async(c,id,p)=>{const a=arr(c);if(a){const x=a.find(x=>x.id===id);if(x)Object.assign(x,p)}else if(obj(c)[id])Object.assign(obj(c)[id],p);changed()},
  del:async(c,id)=>{const a=arr(c);if(a){const i=a.findIndex(x=>x.id===id);if(i>=0)a.splice(i,1)}else delete obj(c)[id];changed()}}}
function dbStore(db){const C=c=>db.collection(c);return{add:async(c,d)=>(await C(c).add(d)).id,set:(c,id,d)=>C(c).doc(id).set(d),update:(c,id,p)=>C(c).doc(id).update(p),del:(c,id)=>C(c).doc(id).delete()}}
store=localStore();
let toastT;function toast(m){const t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2800)}
async function safe(fn,msg){try{await fn();if(msg)toast(msg);return true}catch(err){const c=err&&err.code;
  toast(c==="invalid_argument"||c==="not_granted"?"Anda tidak punya izin mengubah data ini":c==="quota_exceeded"?"Penyimpanan penuh. Hapus data lama dulu.":"Gagal menyimpan. Coba lagi sebentar.");return false}}
function armed(key){if(S.armed===key){S.armed=null;return true}S.armed=key;setTimeout(()=>{if(S.armed===key){S.armed=null;renderDrawer();renderBody()}},3500);renderDrawer();renderBody();return false}

/* =========================================================
   PANEL UI
   ========================================================= */
const body=$("body"),drawer=$("drawer"),panel=$("panel");
function setTab(t){S.tab=t;document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===t)));renderBody(true)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
const initials=n=>String(n||"?").split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
const opt=(v,label,sel)=>`<option value="${esc(v)}"${String(v)===String(sel)?" selected":""}>${esc(label)}</option>`;
function divOptions(sel,empty="— Pilih divisi —"){return opt("",empty,sel)+divList().map(d=>opt(d.id,d.name,sel)).join("")}
function roomOptions(f,sel){const rooms=FL[f]?.rooms.filter(r=>r.seats.length)||[];return opt("","— Pilih ruangan —",sel)+rooms.map(r=>{const n=(S.roomPeople[r.id]||[]).length;return opt(r.id,`${r.id} · ${r.name} (${n}/${r.seats.length})`,sel)}).join("")}
function seatOptions(roomId,sel,selfId){const Rm=ROOMS[roomId];if(!Rm)return opt("","— Pilih ruangan dulu —","");const occ=S.seatOcc[roomId]||[];
  return opt("auto","Otomatis (kursi kosong pertama)",sel)+Rm.seats.map((s,i)=>{const p=occ[i];return opt(i,`${s.label} — ${p?(p.id===selfId?"(kursi saat ini)":"terisi: "+p.name):"kosong"}`,sel)}).join("")}
function personRow(p){const dv=divOf(p.div),sel=S.sel?.type==="person"&&S.sel.id===p.id,h=S.seat[p.id];
  return`<button class="prow${sel?" sel":""}" data-act="pickPerson" data-id="${esc(p.id)}"><span class="av" style="background:${dv.color}">${esc(initials(p.name))}</span>
    <div><div class="nm">${esc(p.name)}</div><div class="sb">${esc(dv.name)} · ${esc(p.bagian||p.jabatan||"—")}</div></div><span class="loc">${h&&!h.none?"Lt "+(h.f+1):"—"}</span></button>`}
function renderKpis(){const n=R.people.length,seated=R.people.filter(p=>{const s=S.seat[p.id];return s&&!s.none&&!s.over}).length,unassigned=R.people.filter(p=>S.seat[p.id]?.none).length;
  const counts={work:0,meet:0,brk:0,talk:0,move:0,out:0,none:0};for(const o of S.poses)counts[o.ak]=(counts[o.ak]||0)+1;
  $("kpis").innerHTML=`<div class="kpi"><span>Karyawan</span><b>${n}</b><small>${n?unassigned?unassigned+" belum punya kursi":"semua sudah punya kursi":"belum ada data"}</small></div>
  <div class="kpi"><span>Divisi</span><b>${divList().length}</b><small>${esc(divList().slice(0,3).map(d=>d.name).join(", "))||"belum ada"}</small></div>
  <div class="kpi"><span>Kursi terisi</span><b>${seated}<small style="font-size:14px"> / ${TOTAL_SEATS}</small></b><small>di 4 lantai</small></div>
  <div class="kpi"><span>Kursi kosong</span><b>${TOTAL_SEATS-seated}</b><small>siap diisi</small></div>
  <div class="kpi"><span>Sedang bekerja</span><b>${counts.work}</b><small>${n?Math.round(counts.work/n*100)+"% dari karyawan":"—"}</small></div>
  <div class="kpi"><span>Lainnya sekarang</span><div class="dots" style="margin-top:4px"><span><i style="background:${ACT_COL.meet}"></i>Rapat ${counts.meet}</span><span><i style="background:${ACT_COL.brk}"></i>Istirahat ${counts.brk}</span><span><i style="background:${ACT_COL.talk}"></i>Diskusi ${counts.talk}</span><span><i style="background:${ACT_COL.move}"></i>Jalan ${counts.move}</span><span><i style="background:${ACT_COL.out}"></i>Di luar ${counts.out||0}</span>${counts.home?`<span><i style="background:${ACT_COL.home}"></i>Pulang ${counts.home}</span>`:""}</div></div>`}
function newForm(pre={}){return{kind:"person",id:null,d:{name:"",nik:"",gender:"",div:"",bagian:"",jabatan:"Staf",f:String(S.view==="out"?0:S.view),room:"",seat:"auto",look:"",skin:"",hc:"",...pre}}}
function lookPicker(d){const base={_col:divOf(d.div).color,gender:d.gender,_h:hash((S.form?.id||"baru")+d.name),skin:d.skin,hc:d.hc};
  const keys=Object.keys(LOOKS).filter(k=>d.gender==="L"?!LOOKS[k].fem:d.gender==="P"?LOOKS[k].fem:true),cur=LOOKS[d.look]?d.look:"";const L=lookOf({...base,look:cur}),isHij=L.style==="hijab";
  const card=(k,lab)=>{const url=avatarThumb({...base,look:k});return`<button type="button" data-act="pickLook" data-k="${k}" aria-pressed="${cur===k}" title="${esc(lab)}">${url?`<img src="${url}" alt="" width="64" height="80">`:""}<span>${esc(lab)}</span></button>`};
  return`<div class="sec" style="margin-top:4px">Karakter di gedung</div><div class="looks">${card("","Otomatis")}${keys.map(k=>card(k,LOOKS[k].name)).join("")}</div>
  <div class="swrow"><span>Warna kulit</span>${SKIN.map((c,i)=>`<button type="button" class="sw" data-act="pickSkin" data-k="${i}" aria-pressed="${String(d.skin)===String(i)}" title="${SKINN[i]}" style="background:${c}"></button>`).join("")}<button type="button" class="sw auto" data-act="pickSkin" data-k="" aria-pressed="${d.skin===""||d.skin==null}" title="Otomatis">A</button></div>
  <div class="swrow"><span>${isHij?"Warna hijab":"Warna rambut"}</span>${(isHij?HIJABC:HAIRC).map(([c,n],i)=>`<button type="button" class="sw" data-act="pickHc" data-k="${i}" aria-pressed="${String(d.hc)===String(i)}" title="${n}" style="background:${c}"></button>`).join("")}<button type="button" class="sw auto" data-act="pickHc" data-k="" aria-pressed="${d.hc===""||d.hc==null}" title="Otomatis">A</button></div>`}
function renderDrawer(){if(!drawer)return;
  if(MODE==="admin"&&!S.edit){const ad=adminDrawer();if(ad){drawer.hidden=false;drawer.innerHTML=ad;return}}
  if(S.edit){drawer.hidden=false;drawer.innerHTML=editorHTML();return}
  if(!S.sel&&!S.form){drawer.hidden=true;drawer.innerHTML="";return}drawer.hidden=false;
  if(S.form?.kind==="person"){const d=S.form.d;
    drawer.innerHTML=`<div class="row"><h3>${S.form.id?"Ubah data karyawan":"Tambah karyawan"}</h3><button class="x" data-act="close" aria-label="Tutup">×</button></div>
    <div class="form">
      <div class="two"><label>Nama lengkap<input id="f-name" data-f="name" value="${esc(d.name)}" placeholder="Nama karyawan" autocomplete="off"></label>
      <label>ID karyawan <small>opsional, NIK / ID Talenta</small><input id="f-nik" data-f="nik" value="${esc(d.nik)}" autocomplete="off"></label></div>
      <div class="two"><label>Divisi<select id="f-div" data-f="div">${divOptions(d.div)}</select></label>
      <label>Jabatan<select id="f-jab" data-f="jabatan">${opt("","— Pilih —",d.jabatan)+JABATAN.map(j=>opt(j,j,d.jabatan)).join("")}</select></label></div>
      <label>Jenis kelamin<select id="f-gen" data-f="gender" data-re="1">${opt("","— Pilih —",d.gender)+opt("L","Laki-laki",d.gender)+opt("P","Perempuan",d.gender)}</select></label>
      ${lookPicker(d)}
      <label>Bagian <small>tampil di label atas kepala</small><input id="f-bag" data-f="bagian" value="${esc(d.bagian)}" placeholder="mis. Pajak, Rekrutmen, Drafter" autocomplete="off"></label>
      <div class="two"><label>Lantai<select id="f-fl" data-f="f" data-re="1">${[0,1,2,3].map(f=>opt(f,"Lantai "+(f+1),d.f)).join("")}</select></label>
      <label>Ruangan<select id="f-room" data-f="room" data-re="1">${roomOptions(+d.f,d.room)}</select></label></div>
      <label>Kursi<select id="f-seat" data-f="seat">${seatOptions(d.room,d.seat,S.form.id)}</select></label>
      ${divList().length?"":`<div class="note">Belum ada divisi. Buat dulu di tab <b>Divisi</b>.</div>`}
      <div class="acts"><button class="btn primary" data-act="savePerson">${S.form.id?"Simpan perubahan":"Simpan"}</button>${S.form.id?"":`<button class="btn" data-act="savePersonMore">Simpan & tambah lagi</button>`}<button class="btn" data-act="close">Batal</button></div>
    </div>`;return}
  if(S.sel?.type==="person"){const p=personBy(S.sel.id);if(!p){S.sel=null;renderDrawer();return}
    const dv=divOf(p.div),o=S.poses.find(o=>o.p.id===p.id),following=S.follow===p.id,st=S.seat[p.id];
    drawer.innerHTML=`<div class="row"><div style="display:flex;gap:10px;align-items:center;min-width:0">${(()=>{const u=avatarThumb({...p,_col:dv.color});return u?`<img class="avimg" src="${u}" alt="" width="48" height="60">`:`<span class="av" style="background:${dv.color};width:40px;height:40px;font-size:14px">${esc(initials(p.name))}</span>`})()}<div style="min-width:0"><h3>${esc(p.name)}</h3><span class="divpill" style="background:${dv.color}">${esc(dv.name)}</span></div></div><button class="x" data-act="close" aria-label="Tutup">×</button></div>
    <div class="kv"><span>ID karyawan</span><b>${esc(p.nik||"—")}</b><span>Jenis kelamin</span><b>${p.gender==="L"?"Laki-laki":p.gender==="P"?"Perempuan":"—"}</b><span>Bagian</span><b>${esc(p.bagian||"—")}</b><span>Jabatan</span><b>${esc(p.jabatan||"—")}</b>
      <span>Tempat</span><b>${st&&!st.none?esc(`Lt ${st.f+1} · ${roomTitle(st.room.id)}`)+(st.over?" (berdiri, ruangan penuh)":st.si!=null?" · "+esc(st.room.seats[st.si].label):""):"Belum punya kursi"}</b>
      <span>Sekarang</span><b id="nowAct"><i class="dot" style="background:${o?ACT_COL[o.ak]:"#8a95a0"}"></i> ${o?.emo||""} ${esc(o?o.act:"—")}</b></div>
    <div class="acts"><button class="btn primary" data-act="${following?"unfollow":"follow"}">${following?"Berhenti mengikuti":"Ikuti di gedung"}</button><button class="btn" data-act="editPerson">Ubah</button>
      <button class="btn danger${S.armed==="delp"?" armed":""}" data-act="delPerson">${S.armed==="delp"?"Klik lagi untuk hapus":"Hapus"}</button></div>`;return}
  if(S.sel?.type==="room"){const Rm=ROOMS[S.sel.id],occ=S.seatOcc[Rm.id]||[],extra=(S.roomPeople[Rm.id]||[]).filter(p=>S.seat[p.id]?.over);
    drawer.innerHTML=`<div class="row"><div style="min-width:0"><div class="sec" style="margin:0">Lantai ${Rm.f+1}</div><h3>${esc(Rm.name)}</h3></div><button class="x" data-act="close" aria-label="Tutup">×</button></div>
    ${roomDivEditor(Rm)}
    ${SEATABLE.has(Rm.type)?`<div class="sec">Kursi kerja</div><div class="kinds" style="grid-template-columns:repeat(2,1fr)"><button data-act="seatMode" data-v="on" aria-pressed="${!Rm.noSeats}">Ada kursi kerja</button><button data-act="seatMode" data-v="off" aria-pressed="${!!Rm.noSeats}">Tanpa kursi kerja</button></div><div class="meta">${Rm.noSeats?"Ruangan ini tidak dihitung sebagai tempat duduk. Karyawan tetap bisa datang ke sini.":"Pilih <b>Tanpa kursi kerja</b> untuk ruangan seperti pantry yang tidak perlu diisi karyawan."}</div>`:""}
    ${EDITABLE.has(Rm.type)?`<div class="acts" style="align-items:center"><button class="btn" data-act="startEdit">Atur meja & kursi</button>${R.layouts[Rm.id]?`<span class="pill">Tata letak manual</span>`:""}</div>`:""}
    ${Rm.seats.length?`<div class="meta">${occ.filter(Boolean).length} dari ${Rm.seats.length} kursi terisi. Kursi kosong ditandai <b style="color:#12c08a">+</b> di gedung.</div>
    <div class="plist">${Rm.seats.map((s,i)=>{const p=occ[i];return p?`<button class="prow" data-act="pickPerson" data-id="${esc(p.id)}"><span class="av" style="background:${divOf(p.div).color}">${esc(initials(p.name))}</span><div><div class="nm">${esc(p.name)}</div><div class="sb">${esc(s.label)} · ${esc(divOf(p.div).name)}</div></div><span class="loc">${esc(p.bagian||"")}</span></button>`
      :`<div class="prow" style="cursor:default"><span class="av" style="background:var(--panel-2);color:var(--muted);border:1.5px dashed var(--line)">+</span><div><div class="nm" style="color:var(--muted)">${esc(s.label)}</div><div class="sb">Kosong</div></div><button class="btn sm primary" data-act="fillSeat" data-room="${esc(Rm.id)}" data-seat="${i}">Isi</button></div>`}).join("")}
      ${extra.map(p=>`<button class="prow" data-act="pickPerson" data-id="${esc(p.id)}"><span class="av" style="background:${divOf(p.div).color}">${esc(initials(p.name))}</span><div><div class="nm">${esc(p.name)}</div><div class="sb" style="color:var(--warn)">Tanpa kursi, ruangan penuh</div></div><span></span></button>`).join("")}</div>`
      :`<div class="meta">${esc(TYPE[Rm.type].name)} ini tidak memiliki kursi kerja. Karyawan akan datang ke sini sesekali (istirahat, rapat, atau ke toilet).</div>`}`;return}
  drawer.hidden=true}
function renderBody(force){if(!body)return;
  if(!force&&panel.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName)&&body.contains(document.activeElement)){S.pending=true;return}
  S.pending=false;let h="";
  if(!S.loaded){body.innerHTML=`<div class="empty">Memuat data kantor…</div>`;return}
  if(S.tab==="sum"){
    if(!S.live)h+=`<div class="note"><b>Mode lokal.</b> Halaman ini tidak terhubung ke database, jadi data hilang saat halaman dimuat ulang.</div>`;
    if(!R.people.length)h+=`<div class="note"><b>Gedung siap diisi.</b> Semua ruangan sudah ditata sesuai layout, tinggal menambahkan karyawan.
      <ol style="margin:6px 0 0;padding-left:18px"><li>Cek daftar divisi di tab <b>Divisi</b>.</li><li>Tambah karyawan lewat tombol di bawah, atau klik ruangan di gedung lalu pilih kursi kosong.</li></ol>
      <div class="acts"><button class="btn primary" data-act="newPerson">+ Tambah karyawan</button></div></div>`;
    else h+=`<div class="note">Klik orang di gedung untuk melihat datanya, atau klik ruangan untuk melihat kursi kosong. Seret untuk menggeser, gulir untuk zoom.</div>`;
    const dl=divList(),max=Math.max(1,...dl.map(d=>S.divCount[d.id]||0));
    h+=`<div class="sec">Karyawan per divisi</div>`+(dl.length?dl.map(d=>{const n=S.divCount[d.id]||0;return`<div style="display:flex;flex-direction:column;gap:4px"><div class="row" style="font-size:13px"><span style="display:flex;gap:7px;align-items:center;font-weight:700"><i class="sw" style="background:${d.color}"></i>${esc(d.name)}</span><span style="font-family:var(--f-mono);font-variant-numeric:tabular-nums">${n}</span></div><div class="bar"><i style="width:${n/max*100}%;background:${d.color}"></i></div></div>`}).join(""):`<div class="empty">Belum ada divisi.</div>`);
    h+=`<div class="sec">Per lantai</div><div class="tbl"><table><thead><tr><th>Lantai</th><th class="num">Ruangan</th><th class="num">Kursi</th><th class="num">Terisi</th><th></th></tr></thead><tbody>`;
    for(let f=FLOORS-1;f>=0;f--){const rooms=FL[f].rooms.filter(r=>r.type!=="area"),cap=rooms.reduce((a,r)=>a+r.seats.length,0),n=rooms.reduce((a,r)=>a+(S.seatOcc[r.id]||[]).filter(Boolean).length,0);
      h+=`<tr class="click" data-act="goFloor" data-f="${f}"><td><b>Lantai ${f+1}</b></td><td class="num">${rooms.length}</td><td class="num">${cap}</td><td class="num">${n}</td><td style="color:var(--accent);font-weight:800">Lihat →</td></tr>`}
    h+=`</tbody></table></div><div class="sec">Arti titik di label</div><div class="meta" style="display:flex;gap:12px;flex-wrap:wrap">${["work","meet","brk","talk","move"].map(k=>`<span style="display:inline-flex;gap:5px;align-items:center"><i class="dot" style="background:${ACT_COL[k]}"></i>${ACT_NAME[k]}</span>`).join("")}</div>`}
  else if(S.tab==="ppl"){
    h+=`<button class="btn primary wide" data-act="newPerson">+ Tambah karyawan</button>`;
    h+=`<div class="filters"><input id="q" placeholder="Cari nama, ID, atau bagian…" value="${esc(S.q)}" autocomplete="off"><select id="fdiv">${divOptions(S.fdiv,"Semua divisi")}</select>
      <select id="ffl">${opt("","Semua lantai",S.ffl)}${[0,1,2,3].map(f=>opt(f,"Lantai "+(f+1),S.ffl)).join("")}${opt("none","Belum punya kursi",S.ffl)}</select></div>`;
    const q=S.q.trim().toLowerCase();
    const list=R.people.filter(p=>(!q||(p.name+" "+(p.nik||"")+" "+(p.bagian||"")+" "+divOf(p.div).name).toLowerCase().includes(q))&&(!S.fdiv||p.div===S.fdiv)&&
      (!S.ffl||(S.ffl==="none"?S.seat[p.id]?.none:!S.seat[p.id]?.none&&String(S.seat[p.id]?.f)===S.ffl)))
      .sort((a,b)=>(divOf(a.div).order??99)-(divOf(b.div).order??99)||RANK(a.jabatan)-RANK(b.jabatan)||a.name.localeCompare(b.name));
    h+=`<div class="sec">${list.length} karyawan</div>`+(list.length?`<div class="plist">${list.map(personRow).join("")}</div>`:`<div class="empty">${R.people.length?"Tidak ada yang cocok dengan pencarian.":"Belum ada karyawan. Tambahkan yang pertama."}</div>`)}
  else if(S.tab==="room"){
    h+=`<div class="note">Ruangan mengikuti layout kantor. Klik ruangan untuk melihat kursi dan mengisinya.</div>`;
    for(let f=FLOORS-1;f>=0;f--){h+=`<div class="sec">Lantai ${f+1}<button class="btn sm" data-act="goFloor" data-f="${f}">Lihat lantai</button></div>`;
      h+=FL[f].rooms.filter(r=>r.type!=="area").map(Rm=>{const n=(S.seatOcc[Rm.id]||[]).filter(Boolean).length,cap=Rm.seats.length,sel=S.sel?.type==="room"&&S.sel.id===Rm.id;
        return`<button class="card click${sel?" sel":""}" data-act="pickRoom" data-id="${esc(Rm.id)}"><div class="top"><h3><i class="sw" style="background:${TYPE[Rm.type].chip}"></i>${esc(Rm.name)}</h3>${cap?`<span class="pill" style="${n>=cap?"color:var(--ok)":""}">${n}/${cap} kursi</span>`:`<span class="pill">${esc(TYPE[Rm.type].name)}</span>`}</div></button>`}).join("")}}
  else if(S.tab==="div"){const nd=S.newDiv;
    h+=`<div class="card"><div class="sec" style="margin:0">Tambah divisi</div><div class="form"><label>Nama divisi<input id="nd-name" value="${esc(nd.name)}" placeholder="mis. QHSE" autocomplete="off"></label>
      <div class="swatches" role="group" aria-label="Warna divisi">${PALETTE.map(c=>`<button data-act="ndColor" data-c="${c}" style="background:${c}" aria-label="Warna ${c}" aria-pressed="${nd.color===c}"></button>`).join("")}</div>
      <div class="acts"><button class="btn primary" data-act="addDiv">Tambah divisi</button></div></div></div>`;
    const dl=divList();h+=`<div class="sec">${dl.length} divisi</div>`;
    h+=dl.length?dl.map(d=>{const n=S.divCount[d.id]||0;
      if(S.editDiv===d.id){const dd=S.divDraft;return`<div class="card sel"><div class="form"><label>Nama divisi<input id="ed-name" value="${esc(dd.name)}" autocomplete="off"></label>
        <div class="swatches">${PALETTE.map(c=>`<button data-act="edColor" data-c="${c}" style="background:${c}" aria-label="Warna ${c}" aria-pressed="${dd.color===c}"></button>`).join("")}</div>
        <div class="acts"><button class="btn primary" data-act="saveDiv">Simpan</button><button class="btn" data-act="cancelDiv">Batal</button>
        <button class="btn danger${S.armed==="deld"?" armed":""}" data-act="delDiv" ${n?"disabled":""}>${n?"Masih ada "+n+" orang":S.armed==="deld"?"Klik lagi untuk hapus":"Hapus"}</button></div></div></div>`}
      return`<div class="card"><div class="top"><h3><i class="sw" style="background:${d.color};width:14px;height:14px"></i>${esc(d.name)}</h3><div class="acts"><span class="pill">${n} orang</span><button class="btn sm" data-act="editDiv" data-id="${esc(d.id)}">Ubah</button></div></div></div>`}).join(""):`<div class="empty">Belum ada divisi.</div>`}
  if(MODE==="admin"&&S.tab==="set")h+=adminTabs();
  body.innerHTML=h}
panel?.addEventListener("focusout",()=>setTimeout(()=>{if(S.pending&&!(panel.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement?.tagName||"")))renderBody(true)},0));
panel?.addEventListener("input",e=>{const el=e.target;
  if(el.dataset.f&&S.form){S.form.d[el.dataset.f]=el.value;if(el.dataset.f==="f"){S.form.d.room="";S.form.d.seat="auto"}if(el.dataset.f==="room")S.form.d.seat="auto";
    if(el.dataset.re){renderDrawer();const n=$(el.id);n&&n.focus()}return}
  if(el.id==="q"){S.q=el.value;const pos=el.selectionStart;renderBody(true);const n=$("q");n.focus();n.setSelectionRange(pos,pos);return}
  if(el.id==="fdiv"){S.fdiv=el.value;renderBody(true);return}if(el.id==="ffl"){S.ffl=el.value;renderBody(true);return}
  if(el.id==="nd-name"){S.newDiv.name=el.value;return}if(el.id==="ed-name"&&S.divDraft)S.divDraft.name=el.value});
async function savePerson(more){const d=S.form.d,name=d.name.trim();if(!name){toast("Isi nama karyawan dulu");$("f-name")?.focus();return}
  if(!d.div){toast("Pilih divisinya dulu");return}
  const seat=d.room&&d.seat!=="auto"&&d.seat!==""?+d.seat:null;const editId=S.form.id;
  if(seat!=null){const occ=(S.seatOcc[d.room]||[])[seat];if(occ&&occ.id!==editId){toast(`Kursi itu sudah dipakai ${occ.name}. Pilih kursi lain.`);return}}
  const doc={name,nik:d.nik.trim(),gender:d.gender||"",div:d.div,bagian:d.bagian.trim(),jabatan:d.jabatan||"",room:d.room||"",seat,look:LOOKS[d.look]?d.look:"",skin:d.skin===""||d.skin==null?"":+d.skin,hc:d.hc===""||d.hc==null?"":+d.hc};
  let newId=null;const ok=await safe(async()=>{if(editId)await store.update("people",editId,doc);else{doc.createdAt=Date.now();newId=await store.add("people",doc)}},editId?"Perubahan disimpan":`${name} ditambahkan`);
  if(!ok)return;
  if(more){S.form=newForm({div:d.div,f:d.f,room:d.room,jabatan:d.jabatan});renderDrawer();$("f-name")?.focus();return}
  S.form=null;const id=editId||newId;S.sel=id?{type:"person",id}:null;renderDrawer();renderBody()}
panel?.addEventListener("click",async e=>{const b=e.target.closest("[data-act]");if(!b||!panel.contains(b))return;const a=b.dataset.act;
  if(S.form&&(a==="pickLook"||a==="pickSkin"||a==="pickHc")){const f=a==="pickLook"?"look":a==="pickSkin"?"skin":"hc";S.form.d[f]=b.dataset.k;if(f==="look")S.form.d.hc="";renderDrawer();return}
  if(MODE==="admin"&&await adminAction(a,b))return;
  if(a==="startEdit"){startEdit(S.sel.id);return}
  if(a==="eTool"){S.edit.tool=b.dataset.t;renderDrawer();return}
  if(a==="eDs"){const it=S.edit.items[S.edit.sel],k=b.dataset.k;if(it){if(it.t!=="desk")return;it.ds=k;clampItem(editRoom(),it);S.edit.ds=k;editChange()}else{S.edit.ds=k;S.edit.tool="desk";renderDrawer()}return}
  if(a==="eCs"){const it=S.edit.items[S.edit.sel],k=b.dataset.k;if(it){it.cs=k;S.edit.cs=k;editChange()}else{S.edit.cs=k;renderDrawer()}return}
  if(a==="eFace"){const it=S.edit.items[S.edit.sel];if(it){it.face=b.dataset.f;clampItem(editRoom(),it);S.edit.face=it.face;editChange()}else{S.edit.face=b.dataset.f;renderDrawer()}return}
  if(a==="eMove"){const d=b.dataset.d;editMove(d==="u"?-.25:d==="d"?.25:0,d==="l"?-.25:d==="r"?.25:0);return}
  if(a==="eRot"){editRotate();return}
  if(a==="eDel"){editDelete();return}
  if(a==="eClear"){if(!armed("eclr"))return;S.edit.items=[];S.edit.sel=-1;editChange();return}
  if(a==="eCancel"){endEdit();return}
  if(a==="eSave"){const id=S.edit.room,items=S.edit.items.map(({t,r,c,face,ds,cs})=>({t,r,c,face,ds:ds||"std",cs:cs||"office"}));if(await safe(()=>store.set("layouts",id,{items,updatedAt:Date.now()}),"Tata letak disimpan"))endEdit();return}
  if(a==="eReset"){if(!armed("erst"))return;const id=S.edit.room;if(await safe(()=>store.del("layouts",id),"Tata letak dikembalikan ke bawaan"))endEdit();return}
  if(a==="close"){S.sel=null;S.form=null;S.armed=null;renderDrawer();renderBody();return}
  if(a==="pickPerson"){selectPerson(b.dataset.id,true);return}
  if(a==="pickRoom"){selectRoom(b.dataset.id,true);return}
  if(a==="goFloor"){setView(+b.dataset.f);return}
  if(a==="follow"){startFollow(S.sel.id);const h=S.seat[S.sel.id];if(h&&S.view!==h.f)setView(h.f,true);renderDrawer();return}
  if(a==="unfollow"){stopFollow();renderDrawer();return}
  if(a==="newPerson"){S.sel=null;S.form=newForm();renderDrawer();$("f-name")?.focus();panel.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(a==="fillSeat"){const Rm=ROOMS[b.dataset.room];const dv=divList().find(d=>Rm.seats[+b.dataset.seat]?.group&&d.name.toLowerCase()===Rm.seats[+b.dataset.seat].group.toLowerCase());
    S.sel=null;S.form=newForm({f:String(Rm.f),room:Rm.id,seat:b.dataset.seat,div:dv?dv.id:""});renderDrawer();$("f-name")?.focus();return}
  if(a==="editPerson"){const p=personBy(S.sel.id),st=S.seat[p.id];S.form={kind:"person",id:p.id,d:{name:p.name,nik:p.nik||"",gender:p.gender||"",div:p.div||"",bagian:p.bagian||"",jabatan:p.jabatan||"",f:String(ROOMS[p.room]?.f??0),room:p.room||"",seat:Number.isInteger(p.seat)?String(p.seat):st?.si!=null?String(st.si):"auto",look:p.look||"",skin:p.skin??"",hc:p.hc??""}};S.sel=null;renderDrawer();return}
  if(a==="savePerson"){await savePerson(false);return}
  if(a==="savePersonMore"){await savePerson(true);return}
  if(a==="delPerson"){if(!armed("delp"))return;const id=S.sel.id;if(await safe(()=>store.del("people",id),"Karyawan dihapus")){if(S.follow===id)stopFollow();S.sel=null;renderDrawer();renderBody()}return}
  if(a==="ndColor"){S.newDiv.color=b.dataset.c;renderBody(true);return}
  if(a==="edColor"){S.divDraft.color=b.dataset.c;renderBody(true);return}
  if(a==="addDiv"){const name=S.newDiv.name.trim();if(!name){toast("Isi nama divisi dulu");return}if(divList().some(d=>d.name.toLowerCase()===name.toLowerCase())){toast("Divisi dengan nama itu sudah ada");return}
    const order=Math.max(-1,...divList().map(d=>d.order??0))+1;if(await safe(()=>store.add("divisions",{name,color:S.newDiv.color,order}),"Divisi ditambahkan")){S.newDiv={name:"",color:PALETTE[(PALETTE.indexOf(S.newDiv.color)+1)%PALETTE.length]};renderBody(true)}return}
  if(a==="editDiv"){const d=R.divs[b.dataset.id];S.editDiv=b.dataset.id;S.divDraft={name:d.name,color:d.color};renderBody(true);return}
  if(a==="cancelDiv"){S.editDiv=null;S.divDraft=null;renderBody(true);return}
  if(a==="saveDiv"){const name=S.divDraft.name.trim();if(!name){toast("Nama divisi tidak boleh kosong");return}if(await safe(()=>store.update("divisions",S.editDiv,{name,color:S.divDraft.color}),"Divisi disimpan")){S.editDiv=null;S.divDraft=null;renderBody(true)}return}
  if(a==="delDiv"){if(!armed("deld"))return;const id=S.editDiv;if(await safe(()=>store.del("divisions",id),"Divisi dihapus")){S.editDiv=null;S.divDraft=null;renderBody(true)}return}
});

/* =========================================================
   APLIKASI PER DIVISI (menu utama Genetek)
   ========================================================= */
const IC={
  book:'<path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5Z"/><path d="M12 6v13.5"/>',
  box:'<path d="m3 7 9-4 9 4v10l-9 4-9-4Z"/><path d="m3 7 9 4 9-4M12 11v10M7.5 5l9 4"/>',
  building:'<path d="M4 21V4h11v17M15 9h5v12"/><path d="M8 8h3M8 12h3M8 16h3M2 21h20"/>',
  shield:'<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z"/><path d="m9 12 2 2 4-4"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
  check:'<path d="M10 6h11M10 12h11M10 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="9.5" y="9.5" width="5" height="5"/>',
  truck:'<path d="M2 5h11v11H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  heart:'<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M7 12h2.5l1.5-3 2 6 1.5-3H17"/>',
  pie:'<path d="M21 12A9 9 0 1 1 12 3v9Z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15Z"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
};
const svg=(k,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||""}</svg>`;
/* Daftar aplikasi & divisi pemiliknya — ubah di sini bila ada aplikasi baru */
/* Data bawaan mainmenu — dipakai untuk "Isi data awal" di /admin dan untuk mode demo */
const DEFAULT_DIVS={
  direksi:{name:"Direksi",color:"#3b3f8f",order:0},komisaris:{name:"Komisaris",color:"#8a6d2f",order:1},finance:{name:"Finance",color:"#2e8b57",order:2},
  scm:{name:"SCM",color:"#d17f22",order:3},engineering:{name:"Engineering",color:"#7b4fc4",order:4},sales:{name:"Sales",color:"#d14b3c",order:5},
  hccs:{name:"HCCS",color:"#c2477a",order:6},teknik:{name:"Teknik",color:"#168f9c",order:7}};
const DEFAULT_APPS=[
  {id:"guides",title:"Guides & Manuals",icon:"book",color:"#3b82f6",href:"https://panduan.genetek.co.id",desc:"Akses cepat ke panduan pengguna dan manual operasional lengkap.",divId:"hccs",order:0},
  {id:"atk",title:"Office Supply (ATK)",icon:"box",color:"#10b981",href:"https://orderatk.genetek.co.id",desc:"Pengelolaan dan permintaan alat tulis kantor secara terstruktur.",divId:"hccs",order:1},
  {id:"ga",title:"General Affair",icon:"building",color:"#f59e0b",href:"https://ga.genetek.co.id",desc:"Layanan fasilitas umum dan pengelolaan kebutuhan umum kantor.",divId:"hccs",order:2},
  {id:"apd",title:"Secure Gear (APD)",icon:"shield",color:"#f97316",href:"https://formapd.genetek.co.id",desc:"Manajemen peminjaman Alat Pelindung Diri & standar K3.",divId:"hccs",order:3},
  {id:"pipelines",title:"Pipeline Sales Manager",icon:"chart",color:"#a855f7",href:"https://pipelines.genetek.co.id",desc:"Monitoring dan manajemen proyek peluang sales secara real-time.",divId:"sales",order:4},
  {id:"engmon",title:"Engineering Monitor",icon:"chip",color:"#6366f1",href:"https://monitoringeng.genetek.co.id",desc:"Monitoring teknis operasi engineering & keandalan alat.",divId:"engineering",order:5},
  {id:"supplychain",title:"Supply Chain App",icon:"truck",color:"#0ea5e9",href:"https://supplychain.genetek.co.id",desc:"Pelacakan arus kargo, rantai pasok, dan stok gudang.",divId:"scm",order:6},
  {id:"workorder",title:"Work Order",icon:"check",color:"#06b6d4",href:"https://workorder.genetek.co.id",desc:"Sistem tiket instruksi kerja dan penugasan maintenance teknis.",divId:"teknik",order:7},
  {id:"medical",title:"Medical Claim",icon:"heart",color:"#f43f5e",href:"https://medicalclaim.genetek.co.id",desc:"Pengajuan penggantian klaim medis dan biaya kesehatan.",divId:"finance",order:8},
  {id:"monfinance",title:"Monitoring Finance",icon:"pie",color:"#14b8a6",href:"https://monfinance.genetek.co.id",desc:"Pemantauan arus kas dan pelaporan keuangan terpadu.",divId:"finance",order:9},
];
const DEFAULT_SLIDES=[
  {id:"signature",tag:"Feature Highlight",tone:"feature",title:"Email Signature Generator",desc:"Format standar tanda tangan email resmi Genetek. Buat profil profesional Anda secara otomatis hanya dalam beberapa klik.",cta:"Buat Signature",href:"https://forms.gle/PrdDHmJugaxzD4mW9",img:"https://i.imgur.com/AYL5RTd.png",order:0},
  {id:"iso14001",tag:"Certification",tone:"cert",title:"ISO 14001:2015 Accredited",desc:"Environmental Management Systems",cta:"Unduh Sertifikat PDF",href:"https://mainmenu.genetek.co.id/Amtivo%20Certificate%20PT%20Effrensindo%20Kencana%2014%20IA.pdf",img:"https://i.imgur.com/crcDAJA.png",order:1},
  {id:"iso9001",tag:"Certification",tone:"cert",title:"ISO 9001:2015 Accredited",desc:"Quality Management Systems",cta:"Unduh Sertifikat PDF",href:"https://mainmenu.genetek.co.id/Amtivo%20Certificate%20PT%20Effrensindo%20Kencana%209K%20IA.pdf",img:"https://i.imgur.com/P4fLT1j.png",order:2},
  {id:"iso45001",tag:"Certification",tone:"cert",title:"ISO 45001:2018 Accredited",desc:"Health And Safety Management Systems",cta:"Unduh Sertifikat PDF",href:"https://mainmenu.genetek.co.id/Amtivo%20Certificate%20PT%20Effrensindo%20Kencana%2045K%20IA.pdf",img:"https://i.imgur.com/BPEP5C0.png",order:3},
];
/* Label divisi bawaan per ruangan (bisa diubah di /admin → klik ruangan) */
const DEFAULT_ROOM_DIVS={"3":["hccs"],"4":["hccs"],"10":["direksi"],"12":["komisaris"],"15":["finance"],"19":["scm"],"21":["finance"],"22":["scm"],"23":["engineering"],"24":["sales"],"25":["finance"],"26":["hccs"],"27":["engineering","sales"],"34":["hccs"]};
const roomDivs=id=>[...new Set((Array.isArray(R.rooms[id]?.divs)?R.rooms[id].divs:DEFAULT_ROOM_DIVS[id]||[]).map(resolveDiv).filter(Boolean))];
/* Daftar aplikasi & info ditulis langsung di kode (link langsung), tidak diambil dari database. */
let APPS=DEFAULT_APPS.map(a=>({...a})),SLIDES=DEFAULT_SLIDES.map(x=>({...x}));
const byOrder=(a,b)=>(a.order??99)-(b.order??99)||String(a.title).localeCompare(String(b.title));
const appsSorted=()=>[...APPS].sort(byOrder);
const DIV_HINT={hccs:["humancapital","hrd","hrga","hr"],scm:["supplychain","procurement","logistik"],teknik:["teknik","technical","maintenance"],finance:["keuangan","accounting"]};
const DIV_ALIAS={hr:"hccs",humancapital:"hccs",humancapitalcorporateservice:"hccs",humancapitalcorporateservices:"hccs",hrd:"hccs",hrga:"hccs",hrdga:"hccs",supplychain:"scm",supplychainmanagement:"scm",engineer:"engineering",tehnik:"teknik"};
const divKey=n=>{const k=String(n||"").toLowerCase().replace(/[^a-z]/g,"");return DIV_ALIAS[k]||k};
/* cocokkan kode divisi bawaan (mis. "hccs") ke divisi di database, lewat ID atau nama */
const resolveDiv=key=>{if(!key)return null;if(R.divs[key])return key;const k=divKey(key);
  for(const id in R.divs)if(divKey(R.divs[id].name)===k||divKey(id)===k)return id;
  if(k.length>=3)for(const id in R.divs){const n=String(R.divs[id].name||"").toLowerCase().replace(/[^a-z]/g,"");if(n.includes(k)||(DIV_HINT[k]||[]).some(x=>n.includes(x)))return id}
  return null};
const appOwner=a=>resolveDiv(a.divId);
const appsOf=divId=>appsSorted().filter(a=>appOwner(a)===divId);
const divOfApp=a=>{const id=appOwner(a);return id?{id,...R.divs[id]}:null};
const ICON_KEYS=["book","box","building","shield","chart","check","chip","truck","heart","pie","pen","award"];
const abbr=n=>{n=String(n||"?").trim();if(n.length<=4)return n.toUpperCase();const w=n.split(/[\s&]+/).filter(Boolean);return(w.length>1?w[0][0]+w[1][0]:n.slice(0,2)).toUpperCase()};
const appTile=a=>`<a class="happ" style="--c:${a.color}" href="${esc(a.href)}" target="_blank" rel="noopener"><span class="ic">${svg(a.icon,22)}</span><div><b>${esc(a.title)}</b><small>${esc(a.desc)}</small></div><span class="go">${svg("arrow",14)}</span></a>`;

function renderDivbar(){const el=$("divbar"),dl=divList();if(!el)return;
  el.innerHTML=dl.length?dl.map(d=>{const na=appsOf(d.id).length,np=S.divCount[d.id]||0;
    return`<button class="dchip" style="--c:${d.color}" data-div="${esc(d.id)}" aria-pressed="${S.hub?.div===d.id}"><span class="ic">${esc(abbr(d.name))}</span><span><b>${esc(d.name)}</b><small>${na?na+" aplikasi":"Tanpa aplikasi"} · ${np} orang</small></span></button>`}).join("")
    :`<span class="meta">Belum ada divisi. Tambahkan di tab Divisi.</span>`}
$("divbar")?.addEventListener("click",e=>{const b=e.target.closest("[data-div]");if(!b)return;const id=b.dataset.div;if(S.hub?.div===id&&!S.hub.person)closeHub();else openHub(id,null,true)});
function openHub(div,person,moveCam){S.hub={div,person:person||null};S.focusDiv=div;
  if(moveCam&&!S.follow){const cnt=[0,0,0,0];for(const p of R.people)if(p.div===div){const s=S.seat[p.id];if(s&&!s.none)cnt[s.f]++}
    const mx=Math.max(...cnt);if(mx>0){const best=cnt.indexOf(mx);if(S.view!==best)setView(best)}}
  renderHub();renderDivbar()}
function closeHub(){S.hub=null;S.focusDiv=null;renderHub();renderDivbar()}
function personMini(p){const dv=divOf(p.div),st=S.seat[p.id],o=S.poses.find(o=>o.p.id===p.id);
  return`<div class="hub-person"><span class="av" style="background:${dv.color}">${esc(initials(p.name))}</span><div><div style="font-weight:800">${esc(p.name)}</div><div class="meta">${esc([p.bagian,p.jabatan].filter(Boolean).join(" · ")||"—")} · ${st&&!st.none?esc("Lt "+(st.f+1)+" · "+st.room.name):"belum punya kursi"}</div></div>${o?`<span class="pill"><i class="dot" style="background:${ACT_COL[o.ak]}"></i>${o.emo||""} ${esc(ACT_NAME[o.ak]||"")}</span>`:""}</div>`}
function renderHub(){const el=$("hub");if(!S.hub){el.hidden=true;el.innerHTML="";return}const d=R.divs[S.hub.div];if(!d){S.hub=null;S.focusDiv=null;el.hidden=true;return}
  const apps=appsOf(S.hub.div),p=S.hub.person?personBy(S.hub.person):null,np=S.divCount[S.hub.div]||0;el.style.setProperty("--c",d.color);el.hidden=false;
  el.innerHTML=`<div class="hub-head"><span class="big">${esc(abbr(d.name))}</span><div style="min-width:0"><div class="eb">Menu divisi</div><h3>${esc(d.name)}</h3><div class="meta">${np} karyawan · ${apps.length} aplikasi</div></div><button class="x" data-hub="close" aria-label="Tutup menu divisi">×</button></div>
  ${p?personMini(p):""}
  ${apps.length?`<div class="hub-apps">${apps.map(appTile).join("")}</div>`:`<div class="hub-empty">Divisi ini belum punya aplikasi khusus. Semua aplikasi tetap bisa dibuka dari <b>Aplikasi Utama</b> di bawah.</div>`}
  <div class="hub-foot"><span class="meta" style="flex:1;min-width:140px">${np?"Karyawan divisi ini disorot di gedung.":"Belum ada karyawan di divisi ini."}</span>
  ${p?`<button class="btn sm" data-hub="follow">${S.follow===p.id?"Berhenti mengikuti":"Ikuti "+esc(p.name.split(" ")[0])}</button>${MODE==="admin"?`<button class="btn sm" data-hub="detail">Detail</button>`:""}`:""}<button class="btn sm" data-hub="all">Semua aplikasi</button></div>`}
$("hub").addEventListener("click",e=>{const b=e.target.closest("[data-hub]");if(!b)return;const a=b.dataset.hub;
  if(a==="close")closeHub();
  else if(a==="all"){const d=R.divs[S.hub.div];S.afilter=appsOf(S.hub.div).length?S.hub.div:"";renderApps();$("apps").scrollIntoView({behavior:"smooth",block:"start"})}
  else if(a==="follow"){const id=S.hub.person;if(S.follow===id)stopFollow();else startFollow(id);renderHub()}
  else if(a==="detail"){selectPerson(S.hub.person,false);$("panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})}});

function renderApps(){if(!$("appsGrid"))return;const dl=divList(),keys=dl.map(d=>d.id).filter(id=>appsOf(id).length),f=S.afilter||"";
  $("afilter").innerHTML=`<button data-af="" aria-pressed="${!f}">Semua</button>`+keys.map(k=>{const d=R.divs[k];
    return`<button data-af="${k}" style="--c:${d?d.color:"#8a95a0"}" aria-pressed="${f===k}"><i></i>${esc(d?d.name:k.toUpperCase())}</button>`}).join("");
  const list=appsSorted().filter(a=>!f||appOwner(a)===f);$("appCount").textContent=list.length+" Aplikasi";
  $("appsGrid").innerHTML=list.map(a=>{const d=divOfApp(a);return`<article class="app" style="--c:${a.color};--dc:${d?d.color:a.color}">
    <div class="app-top"><span class="ghost">${svg(a.icon,104)}</span><div class="app-ic">${svg(a.icon,24)}</div><span class="app-div"><i></i>${esc(d?d.name:"Umum")}</span></div>
    <div class="app-body"><h4>${esc(a.title)}</h4><p>${esc(a.desc)}</p></div>
    <a class="app-go" href="${esc(a.href)}" target="_blank" rel="noopener" aria-label="Buka aplikasi ${esc(a.title)}"><span>Buka Aplikasi</span><span class="ci">${svg("arrow",13)}</span></a></article>`}).join("")}
$("afilter")?.addEventListener("click",e=>{const b=e.target.closest("[data-af]");if(!b)return;S.afilter=b.dataset.af;renderApps()});
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  $("appsGrid")?.addEventListener("pointermove",e=>{const card=e.target.closest(".app");if(!card||e.pointerType!=="mouse")return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty("--ry",x*10+"deg");card.style.setProperty("--rx",-y*10+"deg")});
  $("appsGrid")?.addEventListener("pointerout",e=>{const card=e.target.closest(".app");if(card&&!card.contains(e.relatedTarget)){card.style.setProperty("--rx","0deg");card.style.setProperty("--ry","0deg")}})}
function renderInfo(){const el=$("info");if(!el)return;const list=[...SLIDES].sort(byOrder);
  el.innerHTML=list.map(s=>`<a class="icard ${s.tone==="cert"?"cert":"feature"}" href="${esc(s.href||"#")}" target="_blank" rel="noopener">${s.img?`<img src="${esc(s.img)}" alt="" loading="lazy" onerror="this.remove()"><span class="shade"></span>`:`<span class="bg">${svg(s.tone==="cert"?"award":"pen",120)}</span>`}<span class="tag">${esc(s.tag||"")}</span><h4>${esc(s.title)}</h4><p>${esc(s.desc||"")}</p><span class="cta">${esc(s.cta||"Buka")} ${svg(s.tone==="cert"?"download":"arrow",14)}</span></a>`).join("")||`<div class="meta">Belum ada info.</div>`}

/* pencarian cepat */
const gs=$("gsearch"),gr=$("gres");
function renderSearch(){const q=gs.value.trim().toLowerCase();if(!q){gr.hidden=true;return}
  const apps=appsSorted().filter(a=>(a.title+" "+(a.desc||"")+" "+(divOfApp(a)?.name||"")).toLowerCase().includes(q)).slice(0,6);
  const divs=divList().filter(d=>d.name.toLowerCase().includes(q)).slice(0,4);
  const ppl=R.people.filter(p=>(p.name+" "+(p.bagian||"")+" "+(p.nik||"")).toLowerCase().includes(q)).slice(0,6);
  let h="";
  if(apps.length)h+=`<div class="grp">Aplikasi</div>`+apps.map(a=>`<a href="${esc(a.href)}" target="_blank" rel="noopener"><span class="ic" style="background:${a.color}">${svg(a.icon,15)}</span><span><span class="t">${esc(a.title)}</span><br><span class="d">${esc(divOfApp(a)?.name||"")} · buka di tab baru</span></span></a>`).join("");
  if(divs.length)h+=`<div class="grp">Divisi</div>`+divs.map(d=>`<button data-sdiv="${esc(d.id)}"><span class="ic" style="background:${d.color};font:800 11px var(--f-body)">${esc(abbr(d.name))}</span><span><span class="t">${esc(d.name)}</span><br><span class="d">${appsOf(d.id).length} aplikasi · ${S.divCount[d.id]||0} orang</span></span></button>`).join("");
  if(ppl.length)h+=`<div class="grp">Karyawan</div>`+ppl.map(p=>{const d=divOf(p.div);return`<button data-sp="${esc(p.id)}"><span class="ic" style="background:${d.color};font:800 11px var(--f-body)">${esc(initials(p.name))}</span><span><span class="t">${esc(p.name)}</span><br><span class="d">${esc(d.name)} · ${esc(p.bagian||"")}</span></span></button>`}).join("");
  gr.innerHTML=h||`<div class="grp">Tidak ada yang cocok</div>`;gr.hidden=false}
gs.addEventListener("input",renderSearch);gs.addEventListener("focus",renderSearch);
gs.addEventListener("keydown",e=>{if(e.key==="Escape"){gs.value="";gr.hidden=true;gs.blur()}else if(e.key==="Enter"){const f=gr.querySelector("a,button");if(f){e.preventDefault();f.click()}}});
gr.addEventListener("click",e=>{const d=e.target.closest("[data-sdiv]"),p=e.target.closest("[data-sp]");
  if(d){openHub(d.dataset.sdiv,null,true);$("stage").scrollIntoView({behavior:"smooth",block:"center"})}
  if(p){const per=personBy(p.dataset.sp);if(per){selectPerson(per.id,true);openHub(per.div,per.id,false);$("stage").scrollIntoView({behavior:"smooth",block:"center"})}}
  gr.hidden=true;if(d||p)gs.value=""});
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".search"))gr.hidden=true});
/* tema gelap / terang */
try{const t=localStorage.getItem("gt-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch{}
$("themeBtn").onclick=()=>{const root=document.documentElement,cur=root.dataset.theme||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"),next=cur==="dark"?"light":"dark";
  root.dataset.theme=next;try{localStorage.setItem("gt-theme",next)}catch{}toast(next==="dark"?"Mode gelap aktif":"Mode terang aktif")};

/* =========================================================
   ADMIN: aplikasi, info & sertifikat, pengaturan, login
   ========================================================= */
const SEATABLE=new Set(["cluster","office","exec","reception","logbook","server","arsip","service","pantry"]);
function roomDivEditor(Rm){const mine=S.rdiv&&S.rdiv.room===Rm.id,cur=mine?S.rdiv.list:roomDivs(Rm.id),dirty=mine&&S.rdiv.dirty;
  return`<div class="sec">Label divisi ruangan</div><div class="acts">${divList().map(d=>{const on=cur.includes(d.id);return`<button class="btn sm" data-act="rdiv" data-id="${esc(d.id)}" aria-pressed="${on}" style="${on?`background:${d.color};color:#fff;border-color:${d.color}`:""}">${esc(d.name)}</button>`}).join("")||`<span class="meta">Belum ada divisi.</span>`}</div>
  ${dirty?`<div class="acts"><button class="btn primary sm" data-act="saveRdiv">Simpan label divisi</button><button class="btn sm" data-act="cancelRdiv">Batal</button></div>`:`<div class="meta">Klik divisi untuk memasang atau melepas label. Di halaman utama, klik label ini membuka menu aplikasi divisinya.</div>`}`}
const APP_COLORS=["#3b82f6","#10b981","#f59e0b","#f97316","#a855f7","#6366f1","#0ea5e9","#06b6d4","#f43f5e","#14b8a6","#8b5cf6","#64748b"];
function appForm(d){return`<div class="form">
  <label>Nama aplikasi<input id="a-title" data-f="title" value="${esc(d.title)}" placeholder="mis. Work Order" autocomplete="off"></label>
  <label>Deskripsi singkat<input id="a-desc" data-f="desc" value="${esc(d.desc)}" autocomplete="off"></label>
  <label>Link aplikasi<input id="a-href" data-f="href" value="${esc(d.href)}" placeholder="https://…" autocomplete="off" inputmode="url"></label>
  <label>Divisi pemilik<select id="a-div" data-f="divId">${opt("","Umum (tanpa divisi)",d.divId)+divList().map(x=>opt(x.id,x.name,d.divId)).join("")}</select></label>
  <div class="sec">Ikon</div><div class="kinds" style="grid-template-columns:repeat(6,1fr)">${ICON_KEYS.map(k=>`<button data-act="aIcon" data-k="${k}" aria-pressed="${d.icon===k}" aria-label="Ikon ${k}" style="color:${d.color}">${svg(k,20)}</button>`).join("")}</div>
  <div class="sec">Warna</div><div class="swatches">${APP_COLORS.map(c=>`<button data-act="aColor" data-c="${c}" style="background:${c}" aria-label="Warna ${c}" aria-pressed="${d.color===c}"></button>`).join("")}</div>
  <div class="acts"><button class="btn primary" data-act="saveApp">Simpan aplikasi</button><button class="btn" data-act="close">Batal</button>
  ${S.form.id?`<button class="btn danger${S.armed==="dela"?" armed":""}" data-act="delApp">${S.armed==="dela"?"Klik lagi untuk hapus":"Hapus"}</button>`:""}</div></div>`}
function slideForm(d){return`<div class="form">
  <div class="two"><label>Label kecil<input id="s-tag" data-f="tag" value="${esc(d.tag)}" placeholder="mis. Certification" autocomplete="off"></label>
  <label>Jenis<select id="s-tone" data-f="tone">${opt("feature","Fitur / pengumuman",d.tone)+opt("cert","Sertifikat",d.tone)}</select></label></div>
  <label>Judul<input id="s-title" data-f="title" value="${esc(d.title)}" autocomplete="off"></label>
  <label>Deskripsi<input id="s-desc" data-f="desc" value="${esc(d.desc)}" autocomplete="off"></label>
  <div class="two"><label>Teks tombol<input id="s-cta" data-f="cta" value="${esc(d.cta)}" placeholder="mis. Unduh Sertifikat PDF" autocomplete="off"></label>
  <label>Link<input id="s-href" data-f="href" value="${esc(d.href)}" placeholder="https://…" autocomplete="off" inputmode="url"></label></div>
  <label>Gambar latar <small>opsional, link gambar</small><input id="s-img" data-f="img" value="${esc(d.img)}" placeholder="https://…/gambar.png" autocomplete="off" inputmode="url"></label>
  <div class="acts"><button class="btn primary" data-act="saveSlide">Simpan</button><button class="btn" data-act="close">Batal</button>
  ${S.form.id?`<button class="btn danger${S.armed==="dels"?" armed":""}" data-act="delSlide">${S.armed==="dels"?"Klik lagi untuk hapus":"Hapus"}</button>`:""}</div></div>`}
function adminDrawer(){
  if(S.form?.kind==="app")return`<div class="row"><h3>${S.form.id?"Ubah aplikasi":"Tambah aplikasi"}</h3><button class="x" data-act="close" aria-label="Tutup">×</button></div>${appForm(S.form.d)}`;
  if(S.form?.kind==="slide")return`<div class="row"><h3>${S.form.id?"Ubah info":"Tambah info"}</h3><button class="x" data-act="close" aria-label="Tutup">×</button></div>${slideForm(S.form.d)}`;
  return null}
function adminTabs(){let h="";
  if(S.tab==="app"){const list=appsSorted();
    h+=`<button class="btn primary wide" data-act="newApp">+ Tambah aplikasi</button><div class="sec">${list.length} aplikasi · urutan tampil di mainmenu</div>`;
    h+=list.length?list.map((a,i)=>{const d=divOfApp(a);return`<div class="card"><div class="top"><h3><span class="av" style="background:color-mix(in srgb,${a.color} 18%,var(--panel));color:${a.color};width:30px;height:30px">${svg(a.icon,15)}</span>${esc(a.title)}</h3>
      <div class="acts"><button class="btn sm" data-act="mvApp" data-id="${esc(a.id)}" data-d="-1" ${i===0?"disabled":""} aria-label="Naikkan">↑</button><button class="btn sm" data-act="mvApp" data-id="${esc(a.id)}" data-d="1" ${i===list.length-1?"disabled":""} aria-label="Turunkan">↓</button><button class="btn sm" data-act="editApp" data-id="${esc(a.id)}">Ubah</button></div></div>
      <div class="meta">${d?`<span class="divpill" style="background:${d.color}">${esc(d.name)}</span>`:"Umum"} · ${esc(String(a.href||"").replace(/^https?:\/\//,""))}</div></div>`}).join(""):`<div class="empty">Belum ada aplikasi. Pakai <b>Pengaturan → Isi data awal</b> atau tambah manual.</div>`}
  else if(S.tab==="info"){const list=[...SLIDES].sort(byOrder);
    h+=`<button class="btn primary wide" data-act="newSlide">+ Tambah info / sertifikat</button><div class="sec">${list.length} kartu</div>`;
    h+=list.length?list.map((s,i)=>`<div class="card"><div class="top"><h3>${esc(s.title)}</h3><div class="acts"><button class="btn sm" data-act="mvSlide" data-id="${esc(s.id)}" data-d="-1" ${i===0?"disabled":""} aria-label="Naikkan">↑</button><button class="btn sm" data-act="mvSlide" data-id="${esc(s.id)}" data-d="1" ${i===list.length-1?"disabled":""} aria-label="Turunkan">↓</button><button class="btn sm" data-act="editSlide" data-id="${esc(s.id)}">Ubah</button></div></div><div class="meta">${esc(s.tag||"")} · ${esc(s.desc||"")}</div></div>`).join(""):`<div class="empty">Belum ada kartu info.</div>`}
  else if(S.tab==="set"){const nD=Object.keys(R.divs).length,nA=APPS.length,nS=SLIDES.length;
    h+=`<div class="note">${S.live?`Masuk sebagai <b>${esc(S.admin||"—")}</b>. Semua perubahan langsung tampil di mainmenu.genetek.co.id.`:`<b>Mode demo.</b> Firebase belum diatur di <code>assets/firebase-config.js</code>, jadi perubahan tidak tersimpan.`}</div>`;
    h+=`<div class="sec">Isi database</div><div class="tbl"><table><tbody>
      <tr><td>Divisi</td><td class="num">${nD}</td></tr>
      <tr><td>Karyawan</td><td class="num">${R.people.length}</td></tr><tr><td>Tata letak manual</td><td class="num">${Object.keys(R.layouts).length}</td></tr></tbody></table></div>`;
    h+=`<div class="card"><h3>Data awal mainmenu</h3><div class="meta">Mengisi 8 divisi (Direksi, Komisaris, Finance, SCM, Engineering, Sales, HCCS, Teknik). Data yang sudah ada tidak ditimpa. Daftar aplikasi dan info sudah tertulis di kode mainmenu.</div><div class="acts"><button class="btn primary" data-act="seed">Isi data awal</button></div></div>`;
    h+=`<div class="card"><h3>Menambah admin</h3><div class="meta">Buat akun di Firebase Console → Authentication, lalu tambahkan emailnya di fungsi <b>isMainmenuAdmin()</b> pada Firestore rules dan publish ulang.</div></div>`;
    h+=`<a class="btn wide" href="/" style="text-align:center;text-decoration:none">Lihat halaman utama</a>`}
  return h}
async function seedDefaults(){let n=0;toast("Mengisi data awal…");
  const ok=await safe(async()=>{for(const[id,d]of Object.entries(DEFAULT_DIVS)){const byName=divList().some(x=>x.name.toLowerCase()===d.name.toLowerCase());if(!R.divs[id]&&!byName){await store.set("divisions",id,d);n++}}
  });
  if(ok)toast(n?`${n} data awal ditambahkan`:"Semua data awal sudah ada");renderBody(true)}
async function moveItem(col,list,id,dir){const arr=[...list].sort(byOrder);arr.forEach((x,i)=>x._o=i);const i=arr.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=arr.length)return;
  const a=arr[i],b=arr[j];await safe(async()=>{await store.update(col,a.id,{order:j});await store.update(col,b.id,{order:i});
    for(const x of arr)if(x!==a&&x!==b&&x.order!==x._o)await store.update(col,x.id,{order:x._o})})}
async function adminAction(a,b){
  if(a==="rdiv"){const id=S.sel?.id;if(!id)return true;if(!S.rdiv||S.rdiv.room!==id)S.rdiv={room:id,list:[...roomDivs(id)],dirty:false};const l=S.rdiv.list,k=l.indexOf(b.dataset.id);if(k>=0)l.splice(k,1);else l.push(b.dataset.id);S.rdiv.dirty=true;renderDrawer();return true}
  if(a==="saveRdiv"){const r=S.rdiv;if(!r)return true;if(await safe(()=>store.set("rooms",r.room,{...(R.rooms[r.room]||{}),divs:r.list,updatedAt:Date.now()}),"Label divisi disimpan")){S.rdiv=null;renderDrawer()}return true}
  if(a==="cancelRdiv"){S.rdiv=null;renderDrawer();return true}
  if(a==="seatMode"){const id=S.sel?.id;if(!id)return true;const off=b.dataset.v==="off";if(!!ROOMS[id]?.noSeats===off)return true;
    if(await safe(()=>store.set("rooms",id,{...(R.rooms[id]||{}),noSeats:off,updatedAt:Date.now()}),off?"Kursi kerja di ruangan ini dihilangkan":"Kursi kerja diaktifkan lagi"))renderDrawer();return true}
  if(a==="newApp"){S.sel=null;S.form={kind:"app",id:null,d:{title:"",desc:"",href:"https://",divId:"",icon:"book",color:APP_COLORS[0]}};renderDrawer();$("a-title")?.focus();return true}
  if(a==="editApp"){const x=APPS.find(z=>z.id===b.dataset.id);if(!x)return true;S.sel=null;S.form={kind:"app",id:x.id,d:{title:x.title||"",desc:x.desc||"",href:x.href||"",divId:x.divId||"",icon:x.icon||"book",color:x.color||APP_COLORS[0]}};renderDrawer();return true}
  if(a==="aIcon"){S.form.d.icon=b.dataset.k;renderDrawer();return true}
  if(a==="aColor"){S.form.d.color=b.dataset.c;renderDrawer();return true}
  if(a==="saveApp"){const d=S.form.d,title=d.title.trim(),href=d.href.trim();if(!title){toast("Isi nama aplikasi dulu");return true}if(!/^https?:\/\/\S+\.\S+/.test(href)){toast("Isi link aplikasi yang lengkap, diawali https://");return true}
    const doc={title,desc:d.desc.trim(),href,divId:d.divId||"",icon:d.icon,color:d.color};const id=S.form.id;
    if(await safe(async()=>{if(id)await store.update("apps",id,doc);else await store.add("apps",{...doc,order:APPS.length?Math.max(...APPS.map(x=>x.order??0))+1:0})},id?"Aplikasi disimpan":"Aplikasi ditambahkan")){S.form=null;renderDrawer();renderBody(true)}return true}
  if(a==="delApp"){if(!armed("dela"))return true;const id=S.form.id;if(await safe(()=>store.del("apps",id),"Aplikasi dihapus")){S.form=null;renderDrawer();renderBody(true)}return true}
  if(a==="mvApp"){await moveItem("apps",APPS,b.dataset.id,+b.dataset.d);return true}
  if(a==="newSlide"){S.sel=null;S.form={kind:"slide",id:null,d:{tag:"Info",tone:"feature",title:"",desc:"",cta:"Buka",href:"https://",img:""}};renderDrawer();$("s-title")?.focus();return true}
  if(a==="editSlide"){const x=SLIDES.find(z=>z.id===b.dataset.id);if(!x)return true;S.sel=null;S.form={kind:"slide",id:x.id,d:{tag:x.tag||"",tone:x.tone||"feature",title:x.title||"",desc:x.desc||"",cta:x.cta||"",href:x.href||"",img:x.img||""}};renderDrawer();return true}
  if(a==="saveSlide"){const d=S.form.d,title=d.title.trim();if(!title){toast("Isi judul dulu");return true}
    const doc={tag:d.tag.trim(),tone:d.tone,title,desc:d.desc.trim(),cta:d.cta.trim()||"Buka",href:d.href.trim(),img:d.img.trim()};const id=S.form.id;
    if(await safe(async()=>{if(id)await store.update("slides",id,doc);else await store.add("slides",{...doc,order:SLIDES.length?Math.max(...SLIDES.map(x=>x.order??0))+1:0})},id?"Info disimpan":"Info ditambahkan")){S.form=null;renderDrawer();renderBody(true)}return true}
  if(a==="delSlide"){if(!armed("dels"))return true;const id=S.form.id;if(await safe(()=>store.del("slides",id),"Info dihapus")){S.form=null;renderDrawer();renderBody(true)}return true}
  if(a==="mvSlide"){await moveItem("slides",SLIDES,b.dataset.id,+b.dataset.d);return true}
  if(a==="seed"){await seedDefaults();return true}
  return false}
const authMsg=e=>{const c=String(e?.code||"");return c.includes("invalid-credential")||c.includes("wrong-password")||c.includes("user-not-found")?"Email atau password salah.":c.includes("too-many-requests")?"Terlalu banyak percobaan. Coba lagi beberapa menit lagi.":c.includes("network")?"Tidak ada koneksi internet.":"Gagal masuk. Coba lagi."};
function setupAdminGate(G){const gate=$("gate");if(!gate)return;
  if(!G){gate.hidden=true;S.admin="mode demo";$("who").textContent="Mode demo";return}
  $("gateForm").addEventListener("submit",async e=>{e.preventDefault();$("gateErr").textContent="";$("gateBtn").disabled=true;
    try{await G.auth.signIn($("g-email").value.trim(),$("g-pass").value)}catch(err){$("gateErr").textContent=authMsg(err)}$("gateBtn").disabled=false});
  $("gateReset").onclick=async()=>{const em=$("g-email").value.trim();if(!em){$("gateErr").textContent="Isi email dulu, lalu klik lagi.";return}
    try{await G.auth.reset(em);$("gateErr").textContent="Link reset password sudah dikirim ke "+em+"."}catch(err){$("gateErr").textContent=authMsg(err)}};
  $("logout").onclick=()=>G.auth.signOut();
  G.auth.onChange(async u=>{if(!u){S.admin=null;gate.hidden=false;$("who").textContent="";return}
    let ok=false;try{ok=await G.isAdmin(u.email)}catch{ok=false}
    if(!ok){$("gateErr").textContent=`Akun ${u.email} belum terdaftar sebagai admin.`;await G.auth.signOut();return}
    S.admin=u.email;$("who").textContent=u.email;gate.hidden=true;renderBody(true)})}

/* =========================================================
   DATA CHANGES & BOOT
   ========================================================= */
function changed(){buildFloors();recompute();S.poses=R.people.map(p=>poseOf(p,Date.now()/1000)).filter(Boolean);
  if(S.sel?.type==="person"&&!personBy(S.sel.id))S.sel=null;
  renderKpis();if(!(S.form&&drawer.contains(document.activeElement)))renderDrawer();renderBody();renderDivbar();renderApps();renderInfo();renderHub()}
setInterval(()=>{renderKpis();if(S.sel?.type==="person"){const o=S.poses.find(o=>o.p.id===S.sel.id),el=$("nowAct");if(o&&el)el.innerHTML=`<i class="dot" style="background:${ACT_COL[o.ak]}"></i> ${o.emo||""} ${esc(o.act)}`}},1500);
function tickClock(){const d=new Date();$("clockTime").textContent=d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});$("clockDay").textContent=d.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"short"});
  $("sun").style.background=isNight()?"radial-gradient(circle at 35% 35%,#f2f4ff,#9aa7d6)":"radial-gradient(circle at 35% 35%,#ffe58a,#f6b52e)"}
tickClock();setInterval(tickClock,1000);
const modeEl=$("mode");
function setMode(t,show){if(!modeEl)return;modeEl.textContent=t;modeEl.hidden=MODE==="public"&&!show}
recompute();renderKpis();renderBody(true);renderDivbar();renderApps();renderInfo();requestAnimationFrame(loop);
function useLocal(msg){R.divs=JSON.parse(JSON.stringify(DEFAULT_DIVS));APPS=DEFAULT_APPS.map(a=>({...a}));SLIDES=DEFAULT_SLIDES.map(x=>({...x}));store=localStore();S.loaded=true;S.live=false;setMode(msg,true);changed()}
function startFirestore(G){store=dbStore(G.db);S.live=true;setMode("Tersinkron",false);
  const need=new Set(["divisions","people","layouts","rooms"]);const done=c=>{if(need.delete(c)&&!need.size)S.loaded=true;if(S.loaded)changed()};
  const err=e=>{console.error(e);setMode("Gagal memuat data · muat ulang halaman",true)};
  const list=s=>s.docs.map(d=>({id:d.id,...d.data()})),map=s=>{const o={};for(const d of s.docs)o[d.id]=d.data();return o};
  const pub=MODE==="public";
  G.db.collection("divisions").onSnapshot(s=>{const m=map(s);R.divs=Object.keys(m).length||!pub?m:JSON.parse(JSON.stringify(DEFAULT_DIVS));done("divisions")},err);
  G.db.collection("layouts").onSnapshot(s=>{R.layouts=map(s);done("layouts")},err);
  G.db.collection("rooms").onSnapshot(s=>{R.rooms=map(s);done("rooms")},err);
  G.db.collection("people").onSnapshot(s=>{R.people=list(s);done("people")},err);}
const gtReady=()=>new Promise(res=>{if(window.GT!==undefined)return res(window.GT);addEventListener("gt-ready",()=>res(window.GT),{once:true});setTimeout(()=>res(window.GT||null),9000)});
(async()=>{const G=await gtReady(),ok=!!(G&&G.db);if(MODE==="admin")setupAdminGate(ok?G:null);if(!ok){useLocal("Mode demo · Firebase belum diatur");return}startFirestore(G)})();

})();
