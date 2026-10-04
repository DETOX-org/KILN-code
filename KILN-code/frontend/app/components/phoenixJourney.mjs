export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = t => { const x = clamp(t); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const span = (p,a,b) => smooth((p-a)/(b-a));
const TAU = Math.PI * 2;
const TREE = [-2.35, 2.35, -.6];
export const SCREEN = [0, 2.03, -.65];
function tree(t) { const a = .4 + TAU*t; return [TREE[0]+Math.cos(a)*.92, TREE[1]+Math.sin(t*Math.PI)*.4, TREE[2]+Math.sin(a)*.92]; }
function cup(t) { const a = -Math.PI*.8 + Math.PI*1.65*t; return [1.02+Math.cos(a)*.48, 2.12+Math.sin(t*Math.PI)*.17, .02+Math.sin(a)*.48]; }
function orbit(t) { const a = .75 + TAU*t; return [Math.sin(a)*1.65,2.5+Math.sin(t*TAU)*.2, .85+Math.cos(a)*1.65]; }
function cameraOrbit(t) { const a = .75 + TAU*t; return [Math.sin(a)*5.5,3.6+Math.sin(t*Math.PI)*.45,.5+Math.cos(a)*5.5]; }
export function journeyState(value) {
 const p=clamp(value); let bird, camera, target, orbitAngle=null;
 if(p<=.24) {bird=tree(p/.24);camera=mix([4.8,3.8,6.8],[3.7,3.4,5.7],span(p,0,.24));target=[-.6,1.55,0];}
 else if(p<=.31) {const t=span(p,.24,.31);bird=mix(tree(1),cup(0),t);bird[1]+=.35*Math.sin(t*Math.PI);camera=mix([3.7,3.4,5.7],[3,2.85,3.7],t);target=mix([-.6,1.55,0],[.6,1.85,.1],t);}
 else if(p<=.43) {const t=(p-.31)/.12;bird=cup(t);camera=[3,2.85,3.7];target=[.6,1.85,.1];}
 else if(p<=.49) {const t=span(p,.43,.49);bird=mix(cup(1),orbit(0),t);camera=mix([3,2.85,3.7],cameraOrbit(0),t);target=mix([.6,1.85,.1],[0,1.55,.5],t);}
 else if(p<=.81) {const t=(p-.49)/.32;bird=orbit(t);camera=cameraOrbit(t);target=[0,1.55,.5];orbitAngle=t*TAU;}
 else {const t=span(p,.81,.935);bird=mix(orbit(1),SCREEN,t);bird[1]+=.3*Math.sin(t*Math.PI);camera=mix(cameraOrbit(1),[0,2.06,.01],span(p,.81,.97));target=mix([0,1.55,.5],SCREEN,span(p,.81,.93));}
 return {p,bird,camera,target,orbitAngle,scale:(.12+.24*span(p,0,.08))*(1-span(p,.885,.94)),reveal:span(p,.945,.99),glow:span(p,.88,.94),stage:p<.27?0:p<.45?1:p<.81?2:p<.945?3:4};
}
