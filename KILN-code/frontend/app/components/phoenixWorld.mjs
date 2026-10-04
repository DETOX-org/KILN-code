import * as THREE from 'three';
import { journeyState, SCREEN } from './phoenixJourney.mjs';

// Procedural artwork: no external models, textures, accounts, or asset requests.
export function createPhoenixWorld() {
 const scene=new THREE.Scene();scene.background=new THREE.Color('#080e18');scene.fog=new THREE.Fog('#080e18',13,30);
 const camera=new THREE.PerspectiveCamera(40,1,.04,60);
 const materials=[];const geometries=[];
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.08,...extra});materials.push(m);return m};
 const mat={floor:material('#101c2c'),edge:material('#263851'),wood:material('#65564a'),gold:material('#e7b96e',{metalness:.55,roughness:.35}),navy:material('#253d60'),dark:material('#101b2b'),skin:material('#bc8b6d'),hair:material('#172333'),metal:material('#6b7d95',{metalness:.7,roughness:.38}),leaf:material('#43766d'),leaf2:material('#72917b'),pot:material('#ad775b'),coffee:material('#261a17'),cream:material('#c1c4b9'),blue:material('#60a8d9',{emissive:'#20518b',emissiveIntensity:.4}),screen:material('#0a1c30',{emissive:'#163c5c',emissiveIntensity:.7}),flame:material('#f0c271',{emissive:'#e7832a',emissiveIntensity:.48,metalness:.4,roughness:.3}),feather:material('#29486f',{metalness:.5,roughness:.4})};
 function mesh(geometry,m,parent=scene,pos=[0,0,0]) {geometries.push(geometry);const obj=new THREE.Mesh(geometry,m);obj.position.set(...pos);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
 const box=(w,h,d,m,p,pos)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,pos);
 const sphere=(r,m,p,pos,scale=[1,1,1])=>{const o=mesh(new THREE.SphereGeometry(r,16,12),m,p,pos);o.scale.set(...scale);return o};
 const cylinder=(r1,r2,h,m,p,pos,n=20)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),m,p,pos);
 function rod(a,b,r,m,parent=scene){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b);const o=cylinder(r,r,va.distanceTo(vb),m,parent,va.clone().add(vb).multiplyScalar(.5).toArray(),12);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize());return o;}
 function torus(r,t,m,parent,pos,rotation=[0,0,0]){const o=mesh(new THREE.TorusGeometry(r,t,8,40),m,parent,pos);o.rotation.set(...rotation);return o;}
 const hemi=new THREE.HemisphereLight('#bacce9','#233146',2.6);scene.add(hemi);
 const key=new THREE.DirectionalLight('#ffe1b6',3.8);key.position.set(3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;scene.add(key);
 const rim=new THREE.DirectionalLight('#719fff',2.4);rim.position.set(-5,4,-5);scene.add(rim);
 const screenLight=new THREE.PointLight('#76b8ff',1.4,4);screenLight.position.set(0,2.15,-.35);scene.add(screenLight);
 const island=cylinder(3.7,3.85,.18,mat.floor,scene,[0,-.13,0],80);
 torus(3.73,.012,mat.gold,scene,[0,-.032,0],[Math.PI/2,0,0]);
 const ground=mesh(new THREE.PlaneGeometry(200,200),mat.dark,scene,[0,-.24,0]);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 // Desk, legs and a subtle woven rug.
 box(3.45,.14,1.42,mat.wood,scene,[0,1.48,-.35]);
 for(const x of [-1.45,1.45])for(const z of [-.87,.17])rod([x,1.42,z],[x*1.07,.02,z],.046,mat.metal);
 box(2.4,.015,2.8,mat.edge,scene,[0,-.028,.7]);
 for(let i=0;i<18;i++)box(2.35,.005,.009,mat.navy,scene,[0,-.018,-.62+i*.155]);
 // Laptop facing the seated coder (+Z). Surface is visible from every angle.
 const laptop=new THREE.Group();laptop.position.set(0,1.58,-.52);scene.add(laptop);
 box(1.12,.045,.67,mat.metal,laptop,[0,0,.22]);
 const lid=new THREE.Group();lid.position.set(0,.03,-.11);lid.rotation.x=-.12;laptop.add(lid);
 box(1.12,.74,.045,mat.dark,lid,[0,.37,0]);
 box(1.01,.63,.013,mat.screen,lid,[0,.37,.029]);
 sphere(.018,mat.metal,lid,[0,.704,.027]);
 for(let row=0;row<10;row++){
  const line=box(.16+(row%4)*.115,.009,.006,row%3===0?mat.gold:mat.blue,lid,[-.37+((row%3)*.03),.63-row*.047,.039]);
  if(row%2===0)box(.14,.009,.006,mat.leaf2,lid,[.22,.63-row*.047,.039]);
 }
 for(let r=0;r<4;r++)for(let c=0;c<11;c++)box(.067,.012,.046,mat.dark,laptop,[-.43+c*.086,.031,.02+r*.074]);
 box(.3,.006,.12,mat.edge,laptop,[0,.029,.43]);
 // Cup, dark coffee surface, rounded handle, saucer and animated steam wisps.
 cylinder(.25,.26,.025,mat.cream,scene,[1.02,1.568,.02],32);
 cylinder(.145,.113,.25,mat.cream,scene,[1.02,1.705,.02],32);
 cylinder(.131,.131,.009,mat.coffee,scene,[1.02,1.835,.02],32);
 torus(.092,.024,mat.cream,scene,[1.187,1.72,.02],[0,0,0]);
 const steam=[];
 const steamMat=material('#b1c4d9',{transparent:true,opacity:.18,depthWrite:false});
 for(let i=0;i<5;i++){const o=sphere(.035,steamMat,scene,[1.02,1.95+i*.08,.02],[1,1.8,1]);o.castShadow=false;steam.push(o)}
 // Rounded books and a small brass desk lamp.
 box(.4,.045,.52,mat.navy,scene,[-1.18,1.58,-.1]);box(.37,.04,.49,mat.gold,scene,[-1.16,1.624,-.12]);
 cylinder(.18,.2,.035,mat.dark,scene,[1.34,1.585,-.82]);rod([1.34,1.6,-.82],[1.34,2.4,-.82],.022,mat.gold);rod([1.34,2.4,-.82],[.91,2.62,-.82],.022,mat.gold);
 const shade=mesh(new THREE.ConeGeometry(.2,.2,24,1,true),mat.navy,scene,[.91,2.53,-.82]);shade.rotation.z=.2;
 const lamp=new THREE.PointLight('#ffd293',.65,3);lamp.position.set(.91,2.42,-.82);scene.add(lamp);
 // Chair and full 3D coder: hoodie, legs, shoes, face, hair and headphones.
 cylinder(.065,.065,.58,mat.metal,scene,[0,.42,1.15]);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod([0,.17,1.15],[Math.cos(a)*.52,.1,1.15+Math.sin(a)*.52],.03,mat.metal);sphere(.055,mat.dark,scene,[Math.cos(a)*.52,.075,1.15+Math.sin(a)*.52])}
 const seat=box(.83,.14,.78,mat.dark,scene,[0,.79,1.12]);
 const back=box(.78,.97,.14,mat.navy,scene,[0,1.25,1.49]);back.rotation.x=-.08;
 const coder=new THREE.Group();scene.add(coder);
 sphere(.43,mat.navy,coder,[0,1.38,1.02],[1,1.35,.65]);
 sphere(.28,mat.navy,coder,[0,1.87,1.1],[1,.46,1]);
 cylinder(.105,.12,.2,mat.skin,coder,[0,1.91,.99]);
 sphere(.26,mat.skin,coder,[0,2.19,.94],[.86,1.13,.87]);
 sphere(.27,mat.hair,coder,[0,2.32,1.005],[.9,.78,.91]);
 sphere(.065,mat.skin,coder,[0,2.17,.708],[.65,.75,1.15]);
 for(const x of [-.085,.085]){sphere(.018,mat.dark,coder,[x,2.224,.737],[1,.5,.45]);rod([x-.035,2.267,.751],[x+.026,2.264,.751],.008,mat.hair,coder)}
 rod([-.048,2.093,.733],[.048,2.093,.733],.007,mat.hair,coder);
 const band=torus(.262,.028,mat.metal,coder,[0,2.22,.967],[0,0,0]);band.scale.y=1.15;
 for(const sign of [-1,1]){
  sphere(.083,mat.dark,coder,[sign*.246,2.21,.97],[.5,1,1]);
  rod([sign*.22,1.01,1.04],[sign*.26,.85,.52],.145,mat.dark,coder);
  rod([sign*.26,.85,.52],[sign*.26,.25,.57],.11,mat.dark,coder);
  sphere(.14,mat.metal,coder,[sign*.26,.17,.43],[.82,.48,1.5]);
  rod([sign*.3,1.64,.96],[sign*.46,1.43,.62],.105,mat.navy,coder);
  rod([sign*.46,1.43,.62],[sign*.28,1.64,.08],.083,mat.navy,coder);
 }
 const hands=[];
 for(const sign of [-1,1]){const hand=new THREE.Group();hand.position.set(sign*.27,1.635,.08);coder.add(hand);sphere(.083,mat.skin,hand,[0,0,0],[1,.42,1.25]);for(let f=0;f<4;f++)rod([-.053+f*.034,0,-.025],[-.053+f*.034,0,-.13],.012,mat.skin,hand);hands.push(hand)}
 // A small tree with a real trunk and branches; flight is naturally occluded by leaves.
 cylinder(.38,.29,.58,mat.pot,scene,[-2.35,.27,-.6],24);
 cylinder(.34,.34,.025,mat.wood,scene,[-2.35,.56,-.6],24);
 rod([-2.35,.57,-.6],[-2.35,2.55,-.6],.055,mat.wood);
 const leaves=[];
 for(let i=0;i<11;i++){
  const a=i*2.399, y=1.15+i*.125, reach=.4+(i%3)*.08;
  const end=[-2.35+Math.cos(a)*reach,y+.2,-.6+Math.sin(a)*reach];rod([-2.35,y-.12,-.6],end,.018,mat.wood);
  const leaf=sphere(.22,i%2?mat.leaf:mat.leaf2,scene,end,[1.5,.22,.65]);leaf.rotation.set(.3,a,.45);leaves.push(leaf);
 }
 sphere(.25,mat.leaf,scene,[-2.35,2.6,-.6],[.7,1.2,.7]);
 // Phoenix: tapered body, articulated wings, layered feathers, beak and long tail.
 const bird=new THREE.Group();bird.name='phoenix';scene.add(bird);
 sphere(.18,mat.flame,bird,[0,0,0],[.75,1,1.6]);sphere(.13,mat.flame,bird,[0,.17,-.22],[.8,1.1,1]);
 const beak=mesh(new THREE.ConeGeometry(.05,.18,8),mat.gold,bird,[0,.155,-.4]);beak.rotation.x=-Math.PI/2;
 for(const sign of [-1,1])sphere(.014,mat.dark,bird,[sign*.089,.198,-.27]);
 const crest=mesh(new THREE.ConeGeometry(.06,.28,8),mat.gold,bird,[0,.39,-.19]);crest.rotation.x=.38;
 const wings=[];
 for(const sign of [-1,1]){
  const wing=new THREE.Group();wing.position.set(sign*.11,.03,0);bird.add(wing);wings.push(wing);
  const shape=new THREE.Shape();shape.moveTo(0,-.12);shape.quadraticCurveTo(.4,-.22,1.04,.06);shape.lineTo(.9,.33);shape.quadraticCurveTo(.42,.44,.04,.23);shape.closePath();
  const membrane=mesh(new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false,curveSegments:10}),mat.flame,wing);membrane.rotation.x=Math.PI/2;membrane.scale.x=sign;
  rod([0,0,0],[sign*.85,.13,.08],.045,mat.flame,wing);
  for(let i=0;i<8;i++){
   const feather=mesh(new THREE.ConeGeometry(.095,.76-i*.042,5),i%3===1?mat.feather:mat.flame,wing,[sign*(.2+i*.108),.01-i*.018,.16+i*.028]);
   feather.rotation.x=Math.PI/2+.22;feather.rotation.z=sign*(-.18-i*.055);feather.scale.z=.35;
   const edge=rod([sign*(.13+i*.108),0,.02],[sign*(.2+i*.108),-.01,.43+i*.009],.006,mat.gold,wing);
  }
 }
 const tails=[];
 for(let i=0;i<5;i++){const tail=new THREE.Group();bird.add(tail);const f=mesh(new THREE.ConeGeometry(.067,.95+i*.1,6),i%2?mat.feather:mat.flame,tail,[(i-2)*.075,-.07,.7]);f.rotation.x=-Math.PI/2;f.rotation.z=(i-2)*.1;f.scale.z=.45;tails.push(tail)}
 const birdLight=new THREE.PointLight('#f8bc60',.9,3.5);bird.add(birdLight);
 const embers=[];
 for(let i=0;i<22;i++){const e=sphere(.014+(i%3)*.004,mat.flame,scene,[0,0,0]);e.castShadow=false;embers.push(e)}
 const haloMat=material('#efb95f',{transparent:true,opacity:0,depthWrite:false,emissive:'#d38b31',emissiveIntensity:1});
 const halo=sphere(.62,haloMat,scene,SCREEN,[1,.65,.2]);halo.castShadow=false;
 const next=new THREE.Vector3(),position=new THREE.Vector3(),direction=new THREE.Vector3();
 function update(p,time=0,aspect=1.6){
  const state=journeyState(p);
  position.set(...state.bird);bird.position.copy(position);bird.scale.setScalar(state.scale);
  const ahead=journeyState(Math.min(.938,p+.001)).bird;direction.set(...ahead).sub(position);
  if(direction.lengthSq()>.0000001){next.copy(position).add(direction);bird.lookAt(next);bird.rotateY(Math.PI)}
  wings.forEach((w,i)=>{w.rotation.z=(i===0?-1:1)*(.18+Math.sin(time*7)*.42);w.rotation.x=Math.sin(time*7+.4)*.13});
  tails.forEach((t,i)=>{t.rotation.x=Math.sin(time*4+i*.45)*.13;t.rotation.y=Math.sin(time*3+i)*.06});
  hands.forEach((h,i)=>{h.position.y=1.635+Math.sin(time*11+i*2)*.009;h.rotation.x=Math.sin(time*11+i)*.06});
  steam.forEach((o,i)=>{const f=(time*.23+i*.18)%1;o.position.set(1.02+Math.sin(time*1.5+i)*.035,1.89+f*.48,.02+Math.cos(time+i)*.025);o.scale.set(.7+f,.9+f*1.3,.7+f)});
  leaves.forEach((leaf,i)=>{leaf.rotation.z=.45+Math.sin(time*.8+i)*.045});
  embers.forEach((e,i)=>{const prior=journeyState(Math.max(0,p-i*.0015));e.position.set(...prior.bird);e.position.x+=Math.sin(time*2+i)*.035;e.position.y+=Math.cos(time*3+i)*.04;e.scale.setScalar(state.scale*(1-i/24)*1.8);e.visible=p<.945});
  const cam=new THREE.Vector3(...state.camera),target=new THREE.Vector3(...state.target);
  if(aspect<1)cam.sub(target).multiplyScalar(1.35).add(target);
  camera.position.copy(cam);camera.lookAt(target);camera.aspect=aspect;camera.updateProjectionMatrix();
  mat.screen.emissiveIntensity=.7+state.glow*2;haloMat.opacity=state.glow*.18;
  scene.updateMatrixWorld(true);return state;
 }
 function dispose(){new Set(geometries).forEach(g=>g.dispose());new Set(materials).forEach(m=>m.dispose());key.shadow.dispose();scene.clear()}
 update(0,0);return {scene,camera,update,dispose,bird,hands,wings,key};
}

export function mountPhoenixWorld(host, getProgress, getPaused, onError) {
 const world=createPhoenixWorld();let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch(error){world.dispose();throw error}
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 let disposed=false,frame=0,elapsed=0,last=0,visible=true,aspect=1.5,dirty=true;
 const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);aspect=w/h;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<700?1.25:1.6));renderer.setSize(w,h,false);renderer.shadowMap.enabled=w>=700;dirty=true};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting; if(visible)start()});visibility.observe(host);
 const onVisibility=()=>{last=0;if(!document.hidden)start()};document.addEventListener('visibilitychange',onVisibility);
 function tick(now){frame=0;if(disposed||document.hidden||!visible){last=0;return}const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  const p=getProgress();if(!getPaused())elapsed+=dt;
  if(!getPaused()||dirty){world.update(p,elapsed,aspect);renderer.render(world.scene,world.camera);dirty=false}
  if(p<.995&&!getPaused())frame=requestAnimationFrame(tick);else last=0;
 }
 function start(){if(!disposed&&!frame){dirty=true;frame=requestAnimationFrame(tick)}}
 const scroll=()=>start();window.addEventListener('scroll',scroll,{passive:true});
 const lost=(event)=>{event.preventDefault();dispose();onError()};renderer.domElement.addEventListener('webglcontextlost',lost);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',onVisibility);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();world.dispose()}
 start();return {dispose,refresh:start};
}
