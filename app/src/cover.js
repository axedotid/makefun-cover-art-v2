// Cover renderer: multi-panel layouts + GTA-style colour grades
export const LAYOUTS = ['duo','trio','quad','hero'];
export const GRADES = {
  sunset:{name:'sunset',a:'#ff6b35',b:'#f7931e',c:'#6a0572'},
  neon:{name:'neon',a:'#00f5ff',b:'#ff006e',c:'#3a0ca3'},
  miami:{name:'miami',a:'#f72585',b:'#7209b7',c:'#3a0ca3'}
};

function coverFit(ctx,img,x,y,w,h){
  const ir=img.width/img.height, br=w/h;
  let sx=0,sy=0,sw=img.width,sh=img.height;
  if(ir>br){ sw=img.height*br; sx=(img.width-sw)/2; }
  else { sh=img.width/br; sy=(img.height-sh)/2; }
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}

function panels(layout,w,h){
  const g=6;
  if(layout==='duo') return [[0,0,w/2-g/2,h],[w/2+g/2,0,w/2-g/2,h]];
  if(layout==='trio') return [[0,0,w,h/2-g/2],[0,h/2+g/2,w/2-g/2,h/2-g/2],[w/2+g/2,h/2+g/2,w/2-g/2,h/2-g/2]];
  if(layout==='quad') return [[0,0,w/2-g/2,h/2-g/2],[w/2+g/2,0,w/2-g/2,h/2-g/2],[0,h/2+g/2,w/2-g/2,h/2-g/2],[w/2+g/2,h/2+g/2,w/2-g/2,h/2-g/2]];
  return [[0,0,w*0.6-g/2,h],[w*0.6+g/2,0,w*0.4-g/2,h/2-g/2],[w*0.6+g/2,h/2+g/2,w*0.4-g/2,h/2-g/2]];
}

function gradeOverlay(ctx,w,h,grade){
  const gr=GRADES[grade]||GRADES.sunset;
  const lin=ctx.createLinearGradient(0,0,w,h);
  lin.addColorStop(0,gr.a+'cc'); lin.addColorStop(0.5,gr.b+'88'); lin.addColorStop(1,gr.c+'cc');
  ctx.save(); ctx.globalCompositeOperation='overlay'; ctx.fillStyle=lin; ctx.fillRect(0,0,w,h); ctx.restore();
  const rad=ctx.createRadialGradient(w*0.75,h*0.15,0,w*0.75,h*0.15,Math.max(w,h)*0.7);
  rad.addColorStop(0,gr.a+'66'); rad.addColorStop(1,'#00000000');
  ctx.save(); ctx.globalCompositeOperation='screen'; ctx.fillStyle=rad; ctx.fillRect(0,0,w,h); ctx.restore();
  const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.75);
  vg.addColorStop(0,'#00000000'); vg.addColorStop(1,'#000000aa');
  ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
}

function wrap(ctx,text,maxW){
  const words=text.split(' '); const lines=[]; let cur='';
  for(const w of words){ const t=cur?cur+' '+w:w; if(ctx.measureText(t).width>maxW&&cur){ lines.push(cur); cur=w; } else cur=t; }
  if(cur) lines.push(cur); return lines;
}

function caption(ctx,text,w,h,grade){
  if(!text) return;
  const gr=GRADES[grade]||GRADES.sunset;
  const fs=Math.floor(Math.min(w,h)*0.085);
  ctx.font='900 '+fs+'px system-ui,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  const lines=wrap(ctx,text.toUpperCase(),w*0.86);
  const lh=fs*1.06, y0=h-lines.length*lh/2+lh/2;
  const grad=ctx.createLinearGradient(0,0,w,0);
  grad.addColorStop(0,'#ffffff'); grad.addColorStop(0.5,gr.a); grad.addColorStop(1,gr.b);
  lines.forEach((ln,i)=>{
    const y=y0+i*lh;
    ctx.lineWidth=fs*0.16; ctx.strokeStyle='rgba(0,0,0,0.85)'; ctx.lineJoin='round';
    ctx.strokeText(ln,w/2,y);
    ctx.fillStyle=grad; ctx.fillText(ln,w/2,y);
  });
}

export function renderCover(canvas,opts){
  const {photos,layout,grade,captionText,width,height}=opts;
  canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#05050a'; ctx.fillRect(0,0,width,height);
  const ps=panels(layout,width,height);
  const list=photos&&photos.length?photos:[];
  ps.forEach((p,i)=>{
    const img=list.length?list[i%list.length]:null;
    if(img){ coverFit(ctx,img,p[0],p[1],p[2],p[3]); }
    else {
      const ph=ctx.createLinearGradient(p[0],p[1],p[0]+p[2],p[1]+p[3]);
      ph.addColorStop(0,'#1a1a2e'); ph.addColorStop(1,'#16213e');
      ctx.fillStyle=ph; ctx.fillRect(p[0],p[1],p[2],p[3]);
    }
  });
  gradeOverlay(ctx,width,height,grade);
  caption(ctx,captionText,width,height,grade);
}
