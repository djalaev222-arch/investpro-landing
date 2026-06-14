/* ====================================================
   ANIMATED CANVAS BACKGROUNDS — InvestPro Landing
   Single-palette: dark green bg + #00E5A0 teal accent
   ==================================================== */
(function () {
  'use strict';

  const R   = (a, b) => Math.random() * (b - a) + a;
  const C   = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
  const TAU = Math.PI * 2;

  const isMobile = () => window.innerWidth < 768;

  /* ──────────────────────────────────────────────────
     SCENE 1 · HERO — soft flowing chart lines + orbs
  ─────────────────────────────────────────────────── */
  class HeroScene {
    constructor(cv) { this.cv = cv; this.cx = cv.getContext('2d'); this.t = 0; this.rebuild(); }
    rebuild() {
      const W = this.cv.width, H = this.cv.height; this.W = W; this.H = H;
      const mob = isMobile();
      const lineCount = mob ? 3 : 5;

      this.lines = Array.from({length: lineCount}, (_, i) => {
        const pts = [];
        let y = H * (0.2 + i * 0.16);
        for (let x = 0; x <= W + 350; x += 3) {
          y += R(-2.2, 3.0);
          y = Math.max(H * 0.06, Math.min(H * 0.92, y));
          pts.push({x, y});
        }
        return {
          pts, offset: R(-240, 0),
          speed: 0.28 + i * 0.08,
          opacity: mob ? (0.03 + (lineCount - i) * 0.015) : (0.04 + (lineCount - i) * 0.018),
          r: i % 2 === 0 ? [0,229,160] : [0,184,122]
        };
      });

      this.orbs = [
        {x: W*0.15, y: H*0.3, r: mob?55:110, al:0.055, col:[0,229,160]},
        {x: W*0.85, y: H*0.65, r: mob?40:85, al:0.038, col:[0,184,122]},
        {x: W*0.5, y: H*0.8, r: mob?30:65, al:0.025, col:[0,229,160]},
      ];

      this.dots = Array.from({length: mob ? 28 : 65}, () => ({
        x: R(0,W), y: R(0,H),
        r: R(0.6, 2),
        al: R(0.025, 0.10),
        vx: R(-0.06,0.06), vy: R(-0.06,0.06)
      }));
    }

    draw() {
      const cv=this.cv, cx=this.cx, W=this.W, H=this.H;
      if (cv.width !== W || cv.height !== H) { this.rebuild(); return; }
      cx.clearRect(0, 0, W, H);

      /* soft glow orbs */
      this.orbs.forEach(o => {
        const g = cx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.col[0]},${o.col[1]},${o.col[2]},${o.al})`);
        g.addColorStop(1, `rgba(${o.col[0]},${o.col[1]},${o.col[2]},0)`);
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(o.x, o.y, o.r, 0, TAU); cx.fill();
      });

      /* flowing chart lines */
      this.lines.forEach(line => {
        line.offset -= line.speed;
        if (line.offset < -280) { line.offset = 0; }
        const [r,g,b] = line.r;
        const grad = cx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.12, `rgba(${r},${g},${b},${line.opacity})`);
        grad.addColorStop(0.88, `rgba(${r},${g},${b},${line.opacity})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        cx.strokeStyle = grad; cx.lineWidth = 1.5;
        cx.beginPath();
        let first = true;
        line.pts.forEach(p => {
          const x = p.x + line.offset;
          if (x < -8 || x > W + 8) { first = true; return; }
          first ? cx.moveTo(x, p.y) : cx.lineTo(x, p.y);
          first = false;
        });
        cx.stroke();
      });

      /* ambient drifting dots */
      this.dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        cx.globalAlpha = d.al; cx.fillStyle = '#00E5A0';
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, TAU); cx.fill();
      });
      cx.globalAlpha = 1;
      this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     SCENE 2 · PAIN — red declining chart + sparks
  ─────────────────────────────────────────────────── */
  class PainScene {
    constructor(cv) { this.cv=cv; this.cx=cv.getContext('2d'); this.t=0; this.rebuild(); }
    _buildLine() {
      const W=this.W,H=this.H; const pts=[]; let y=H*.35;
      for(let x=0;x<=W+100;x+=4){y+=R(-1.5,2.5);y=Math.max(H*.15,Math.min(H*.55,y));pts.push({x,y});}
      return pts;
    }
    rebuild() {
      const W=this.cv.width, H=this.cv.height; this.W=W; this.H=H;
      this.redPts=this._buildLine();
      this.lineX=0;
      const mob=isMobile();
      this.sparks=Array.from({length:mob?20:55},()=>({
        x:R(0,W),y:R(0,H),vx:R(-.6,.6),vy:R(-1.5,.5),life:R(0,1),dec:R(.004,.012),r:R(1.5,4)
      }));
      const slots=Math.max(mob?1:2,Math.floor(W/260));
      this.people=Array.from({length:slots},(_,i)=>({
        x:W/(slots+1)*(i+1),y:H*.72,screenR:Math.random()>.5,blink:0,blinkT:Math.floor(R(60,200))
      }));
      this.numbers=Array.from({length:mob?8:18},()=>({
        x:R(0,W),y:R(0,H),vy:R(.2,.8),al:R(.05,.2),val:`-${R(1,15).toFixed(1)}%`,size:R(10,18)
      }));
    }
    _drawPerson(px,py,screenGlow){
      const cx=this.cx;
      cx.fillStyle=C(10,20,14,.9); cx.beginPath(); cx.roundRect(px-70,py+10,140,6,3); cx.fill();
      cx.fillStyle=C(5,12,8,.95); cx.fillRect(px-3,py+16,6,30);
      cx.fillStyle=C(4,10,7,.98); cx.beginPath(); cx.roundRect(px-35,py-28,70,40,4); cx.fill();
      cx.strokeStyle=C(0,229,160,.25); cx.lineWidth=1.5; cx.stroke();
      cx.fillStyle=screenGlow; cx.beginPath(); cx.roundRect(px-31,py-24,62,32,2); cx.fill();
      cx.strokeStyle=C(239,68,68,.9); cx.lineWidth=1.5;
      cx.beginPath(); cx.moveTo(px-25,py-10);
      for(let i=1;i<=8;i++) cx.lineTo(px-25+i*7,(py-10)+i*1.8+R(-2,2));
      cx.stroke();
      cx.fillStyle=C(40,80,60,.4);
      cx.beginPath(); cx.ellipse(px-45,py-18,9,11,-.2,0,TAU); cx.fill();
      cx.fillStyle=C(30,60,45,.4);
      cx.beginPath(); cx.moveTo(px-50,py-8); cx.bezierCurveTo(px-55,py+5,px-30,py+8,px-35,py-5); cx.closePath(); cx.fill();
      cx.strokeStyle=C(40,80,60,.3); cx.lineWidth=6; cx.lineCap='round';
      cx.beginPath(); cx.moveTo(px-42,py-2); cx.quadraticCurveTo(px-20,py+5,px-10,py+2); cx.stroke();
    }
    draw(){
      const cx=this.cx,W=this.W,H=this.H;
      cx.clearRect(0,0,W,H);
      const bg=cx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);
      bg.addColorStop(0,C(10,5,5,.12)); bg.addColorStop(1,C(4,2,5,.38));
      cx.fillStyle=bg; cx.fillRect(0,0,W,H);
      this.numbers.forEach(n=>{
        n.y+=n.vy; if(n.y>H+20){n.y=-20;n.x=R(0,W);}
        cx.globalAlpha=n.al; cx.font=`600 ${n.size}px monospace`;
        cx.fillStyle='#EF4444'; cx.fillText(n.val,n.x,n.y);
      });
      cx.globalAlpha=1;
      this.lineX-=.6;
      if(this.lineX<-200){this.lineX=0;this.redPts=this._buildLine();}
      const rg=cx.createLinearGradient(0,0,W,H);
      rg.addColorStop(0,'rgba(239,68,68,.16)'); rg.addColorStop(1,'rgba(239,68,68,.04)');
      cx.strokeStyle=rg; cx.lineWidth=2.5;
      cx.beginPath();
      this.redPts.forEach((pt,i)=>{const x=pt.x+this.lineX; i===0?cx.moveTo(x,pt.y):cx.lineTo(x,pt.y);});
      cx.stroke();
      cx.lineTo(W,H); cx.lineTo(0,H); cx.closePath();
      cx.fillStyle='rgba(239,68,68,.04)'; cx.fill();
      this.sparks.forEach(s=>{
        s.x+=s.vx; s.y+=s.vy; s.vy+=.02; s.life-=s.dec;
        if(s.life<=0){s.life=R(.5,1);s.x=R(0,W);s.y=R(0,H*.6);s.vx=R(-.6,.6);s.vy=R(-1,.5);}
        cx.globalAlpha=Math.max(0,s.life)*0.6;
        cx.fillStyle='#EF4444'; cx.beginPath(); cx.arc(s.x,s.y,s.r,0,TAU); cx.fill();
      });
      cx.globalAlpha=1;
      this.people.forEach(per=>{
        per.blink++; if(per.blink>per.blinkT){per.blink=0;per.blinkT=Math.floor(R(60,200));per.screenR=!per.screenR;}
        const glow=per.screenR?C(239,68,68,.14):C(180,30,30,.10);
        this._drawPerson(per.x,per.y,glow);
      });
      const fl=cx.createLinearGradient(0,H*.8,0,H);
      fl.addColorStop(0,C(6,12,8,0)); fl.addColorStop(1,C(6,12,8,.9));
      cx.fillStyle=fl; cx.fillRect(0,H*.8,W,H*.2);
      this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     SCENE 3 · PROGRAM — rising teal chart + bars
  ─────────────────────────────────────────────────── */
  class ProgramScene {
    constructor(cv){this.cv=cv;this.cx=cv.getContext('2d');this.t=0;this.rebuild();}
    _buildLine(){
      const W=this.W,H=this.H; const pts=[]; let y=H*.7;
      for(let x=0;x<=W+50;x+=3){y+=R(-2,3.5);y=Math.max(H*.1,Math.min(H*.75,y));pts.push({x,y});}
      return pts;
    }
    rebuild(){
      const W=this.cv.width,H=this.cv.height; this.W=W;this.H=H;
      this.linePts=this._buildLine();
      this.scrollX=0;
      const mob=isMobile();
      const slots=Math.max(mob?1:2,Math.floor(W/280));
      this.students=Array.from({length:slots},(_,i)=>({
        x:W/(slots+1)*(i+1),y:H*.75,bobOff:R(0,TAU),armAng:R(-.3,.3)
      }));
      this.arrows=Array.from({length:mob?4:8},()=>({x:R(0,W),y:R(H*.3,H*.9),vy:R(-1,-2.5),al:R(.08,.22),size:R(16,32)}));
      const barCount=mob?6:10;
      this.bars=Array.from({length:barCount},(_,i)=>({
        x:W*.05+i*(W*.9/barCount),targetH:R(H*.1,H*.45),curH:0,
        col:i%2===0?C(0,229,160,.52):C(0,184,122,.48)
      }));
    }
    _drawStudent(sx,sy,t){
      const cx=this.cx;
      const bob=Math.sin(t*.025+sx)*.5;
      cx.fillStyle=C(0,229,160,.40);
      cx.beginPath(); cx.ellipse(sx,sy-22+bob,9,11,0,0,TAU); cx.fill();
      cx.strokeStyle=C(0,184,122,.36); cx.lineWidth=5; cx.lineCap='round';
      cx.beginPath(); cx.moveTo(sx,sy-12+bob); cx.lineTo(sx,sy+12+bob); cx.stroke();
      cx.lineWidth=4;
      cx.beginPath(); cx.moveTo(sx-12,sy-2+bob); cx.lineTo(sx+12,sy-8+bob); cx.stroke();
      cx.beginPath(); cx.moveTo(sx,sy+12+bob); cx.lineTo(sx-8,sy+28+bob); cx.stroke();
      cx.beginPath(); cx.moveTo(sx,sy+12+bob); cx.lineTo(sx+8,sy+28+bob); cx.stroke();
    }
    draw(){
      const cx=this.cx,W=this.W,H=this.H;
      cx.clearRect(0,0,W,H);
      cx.strokeStyle='rgba(0,229,160,.04)'; cx.lineWidth=1;
      for(let x=0;x<W;x+=40){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();}
      for(let y=0;y<H;y+=40){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
      const baseY=H*.85;
      this.bars.forEach(b=>{
        b.curH+=(b.targetH-b.curH)*.03;
        if(Math.abs(b.curH-b.targetH)<1){b.targetH=R(H*.08,H*.45);}
        const grad=cx.createLinearGradient(b.x,baseY-b.curH,b.x,baseY);
        grad.addColorStop(0,b.col); grad.addColorStop(1,'rgba(0,0,0,0)');
        cx.fillStyle=grad; cx.fillRect(b.x,baseY-b.curH,W*.9/10-4,b.curH);
      });
      this.scrollX-=.7;
      if(this.scrollX<-200){this.scrollX=0;this.linePts=this._buildLine();}
      const lg=cx.createLinearGradient(0,0,W,0);
      lg.addColorStop(0,'rgba(0,229,160,0)'); lg.addColorStop(.3,'rgba(0,229,160,.7)'); lg.addColorStop(1,'rgba(0,229,160,.7)');
      cx.strokeStyle=lg; cx.lineWidth=2.5;
      cx.beginPath();
      this.linePts.forEach((p,i)=>{const x=p.x+this.scrollX; i===0?cx.moveTo(x,p.y):cx.lineTo(x,p.y);});
      cx.stroke();
      const lastP=this.linePts.at(-1);
      if(lastP){cx.lineTo(W,H);cx.lineTo(0,H);cx.closePath();cx.fillStyle='rgba(0,229,160,.04)';cx.fill();}
      this.arrows.forEach(a=>{
        a.y+=a.vy; if(a.y<-40){a.y=H+40;a.x=R(0,W);}
        cx.globalAlpha=a.al; cx.fillStyle='#00E5A0';
        cx.font=`${a.size}px sans-serif`; cx.fillText('↑',a.x,a.y);
      });
      cx.globalAlpha=1;
      this.students.forEach(s=>this._drawStudent(s.x,s.y,this.t));
      const fl=cx.createLinearGradient(0,H*.8,0,H);
      fl.addColorStop(0,C(6,12,8,0)); fl.addColorStop(1,C(6,12,8,.85));
      cx.fillStyle=fl; cx.fillRect(0,H*.8,W,H*.2);
      this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     SCENE 4 · REVIEWS — network nodes + chat bubbles
  ─────────────────────────────────────────────────── */
  class ReviewsScene {
    constructor(cv){this.cv=cv;this.cx=cv.getContext('2d');this.t=0;this.rebuild();}
    rebuild(){
      const W=this.cv.width,H=this.cv.height; this.W=W;this.H=H;
      const mob=isMobile();
      const COLORS=['#00E5A0','#00B87A','#007A50','#4DFFBC','#00C48A','#005538'];
      this.nodes=Array.from({length:mob?10:20},(_,i)=>({
        x:R(W*.05,W*.95),y:R(H*.05,H*.85),r:R(14,26),
        vx:R(-.25,.25),vy:R(-.2,.2),col:COLORS[i%COLORS.length],
        al:R(.15,.4),label:['М','А','О','И','Д','С','К','Е','Р','Н','П','В'][i%12]
      }));
      this.bubbles=Array.from({length:mob?3:6},(_,i)=>({
        x:R(W*.1,W*.85),y:R(H*.3,H*.7),vy:R(-0.4,-1),
        al:R(.06,.18),size:R(40,90),t:R(0,TAU),
        text:['★★★★★','Супер!','100%','✓ Окупилось','Рекомендую','Отличный курс!'][i]
      }));
      this.stars=Array.from({length:mob?12:25},()=>({
        x:R(0,W),y:R(0,H),vy:R(-0.3,-1),al:R(.05,.25),size:R(10,22)
      }));
    }
    draw(){
      const cx=this.cx,W=this.W,H=this.H;
      cx.clearRect(0,0,W,H);
      this.nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<20||n.x>W-20)n.vx*=-1;if(n.y<20||n.y>H-20)n.vy*=-1;});
      for(let i=0;i<this.nodes.length;i++){
        for(let j=i+1;j<this.nodes.length;j++){
          const a=this.nodes[i],b=this.nodes[j];
          const dist=Math.hypot(a.x-b.x,a.y-b.y);
          if(dist>180) continue;
          cx.strokeStyle=C(0,229,160,(1-dist/180)*.13);
          cx.lineWidth=1; cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.stroke();
        }
      }
      this.nodes.forEach(n=>{
        cx.globalAlpha=n.al;
        const g=cx.createRadialGradient(n.x-n.r*.3,n.y-n.r*.3,0,n.x,n.y,n.r);
        g.addColorStop(0,n.col+'FF'); g.addColorStop(1,n.col+'44');
        cx.beginPath(); cx.arc(n.x,n.y,n.r,0,TAU); cx.fillStyle=g; cx.fill();
        cx.globalAlpha=n.al*2.5; cx.fillStyle='#060C0A';
        cx.font=`700 ${Math.floor(n.r)}px sans-serif`;
        cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(n.label,n.x,n.y);
      });
      cx.globalAlpha=1; cx.textAlign='left'; cx.textBaseline='alphabetic';
      this.bubbles.forEach(b=>{
        b.y+=b.vy; if(b.y<-60){b.y=H+60;b.x=R(W*.1,W*.85);}
        cx.globalAlpha=b.al;
        cx.fillStyle=C(0,229,160,.12);
        cx.strokeStyle=C(0,229,160,.28); cx.lineWidth=1.5;
        cx.beginPath(); cx.roundRect(b.x,b.y,b.size,26,12); cx.fill(); cx.stroke();
        cx.globalAlpha=b.al*3; cx.fillStyle='#00E5A0';
        cx.font='600 9px sans-serif'; cx.textAlign='center'; cx.textBaseline='middle';
        cx.fillText(b.text,b.x+b.size/2,b.y+13);
      });
      cx.globalAlpha=1; cx.textAlign='left'; cx.textBaseline='alphabetic';
      this.stars.forEach(s=>{
        s.y+=s.vy; if(s.y<-20){s.y=H+20;s.x=R(0,W);}
        cx.globalAlpha=s.al; cx.fillStyle='#00E5A0';
        cx.font=`${s.size}px sans-serif`; cx.fillText('★',s.x,s.y);
      });
      cx.globalAlpha=1; this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     SCENE 5 · PRICING — teal coin shower + stacks
  ─────────────────────────────────────────────────── */
  class PricingScene {
    constructor(cv){this.cv=cv;this.cx=cv.getContext('2d');this.t=0;this.rebuild();}
    rebuild(){
      const W=this.cv.width,H=this.cv.height; this.W=W;this.H=H;
      const mob=isMobile();
      this.coins=Array.from({length:mob?14:30},()=>({
        x:R(0,W),y:R(-H,H*.5),vy:R(.6,2),vx:R(-.3,.3),
        r:R(8,mob?16:22),ang:R(0,TAU),asp:R(-.03,.03),al:R(.12,.35)
      }));
      this.symbols=Array.from({length:mob?6:12},()=>({
        x:R(0,W),y:R(0,H),vy:R(-0.5,-1.5),al:R(.04,.15),
        sym:['₽','$','€','¥','₿','%'][Math.floor(Math.random()*6)],size:R(14,36)
      }));
      this.stacks=mob
        ?[{x:W*.5,count:5}]
        :[{x:W*.2,count:5},{x:W*.5,count:8},{x:W*.78,count:4}];
    }
    draw(){
      const cx=this.cx,W=this.W,H=this.H;
      cx.clearRect(0,0,W,H);
      const gg=cx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.6);
      gg.addColorStop(0,C(0,229,160,.06)); gg.addColorStop(1,C(0,229,160,0));
      cx.fillStyle=gg; cx.fillRect(0,0,W,H);
      this.symbols.forEach(s=>{
        s.y+=s.vy; if(s.y<-30){s.y=H+30;s.x=R(0,W);}
        cx.globalAlpha=s.al; cx.fillStyle='#00B87A';
        cx.font=`700 ${s.size}px sans-serif`; cx.fillText(s.sym,s.x,s.y);
      });
      cx.globalAlpha=1;
      this.coins.forEach(c=>{
        c.y+=c.vy; c.x+=c.vx; c.ang+=c.asp;
        if(c.y>H+40){c.y=R(-60,-10);c.x=R(0,W);}
        cx.save(); cx.translate(c.x,c.y); cx.rotate(c.ang); cx.globalAlpha=c.al;
        const scaleX=Math.abs(Math.cos(c.ang))+.2;
        cx.scale(scaleX,1);
        const cg=cx.createRadialGradient(-c.r*.25,-c.r*.3,0,0,0,c.r);
        cg.addColorStop(0,'#4DFFBC'); cg.addColorStop(.6,'#00E5A0'); cg.addColorStop(1,'#007A50');
        cx.beginPath(); cx.arc(0,0,c.r,0,TAU); cx.fillStyle=cg; cx.fill();
        cx.strokeStyle='rgba(255,255,255,.22)'; cx.lineWidth=1; cx.stroke();
        cx.globalAlpha=c.al*3; cx.fillStyle='rgba(6,12,10,.9)';
        cx.font=`bold ${c.r*.8}px sans-serif`; cx.textAlign='center'; cx.textBaseline='middle';
        cx.fillText('₽',0,0); cx.restore();
      });
      cx.globalAlpha=1; cx.textAlign='left'; cx.textBaseline='alphabetic';
      this.stacks.forEach(st=>{
        for(let i=0;i<st.count;i++){
          const ry=H*.88-i*10;
          const sg=cx.createRadialGradient(st.x,ry,0,st.x,ry,32);
          sg.addColorStop(0,'rgba(0,229,160,.38)'); sg.addColorStop(1,'rgba(0,184,122,.12)');
          cx.fillStyle=sg; cx.beginPath(); cx.ellipse(st.x,ry,32,8,0,0,TAU); cx.fill();
          cx.strokeStyle='rgba(0,229,160,.22)'; cx.lineWidth=1; cx.stroke();
        }
      });
      const fl=cx.createLinearGradient(0,H*.75,0,H);
      fl.addColorStop(0,C(6,12,10,0)); fl.addColorStop(1,C(6,12,10,.9));
      cx.fillStyle=fl; cx.fillRect(0,H*.75,W,H*.25);
      this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     SCENE 6 · FINAL CTA — compound growth chart
  ─────────────────────────────────────────────────── */
  class CtaScene {
    constructor(cv){this.cv=cv;this.cx=cv.getContext('2d');this.t=0;this.rebuild();}
    rebuild(){
      const W=this.cv.width,H=this.cv.height; this.W=W;this.H=H;
      this.pts=[];
      const YEARS=20,START=100000,RATE=0.14;
      for(let i=0;i<=YEARS*60;i++){const t=i/(YEARS*60);this.pts.push({t,v:START*Math.pow(1+RATE,t*YEARS)});}
      this.maxV=this.pts.at(-1).v;
      this.prog=0; this.speed=0.0012;
      this.milestones=[
        {t:0,label:'Старт',val:'100 000 ₽'},{t:.25,label:'5 лет',val:'193 000 ₽'},
        {t:.5,label:'10 лет',val:'371 000 ₽'},{t:.75,label:'15 лет',val:'714 000 ₽'},
        {t:1,label:'20 лет',val:'3 700 000 ₽'},
      ];
      this.bars=[
        {frac:.027,col:'rgba(0,229,160,.32)'},{frac:.052,col:'rgba(0,229,160,.36)'},
        {frac:.1,col:'rgba(0,229,160,.38)'},{frac:.193,col:'rgba(0,229,160,.42)'},
        {frac:.371,col:'rgba(0,184,122,.36)'},{frac:.714,col:'rgba(0,184,122,.40)'},
        {frac:1,col:'rgba(0,184,122,.48)'},
      ];
      const mob=isMobile();
      this.coins=Array.from({length:mob?8:18},()=>({
        x:R(0,W),y:R(H*.2,H),vy:R(-1,-2.8),r:R(7,mob?14:18),al:R(.1,.32)
      }));
      this.sparks=Array.from({length:mob?14:30},()=>({
        x:R(0,W),y:R(0,H),vx:R(-.3,.3),vy:R(-.6,-1.8),r:R(1.5,3.5),al:R(.06,.22),
        col:['#00E5A0','#00B87A','#4DFFBC','#007A50'][Math.floor(Math.random()*4)]
      }));
      this.candles=[];
      let cp=200000;
      for(let i=0;i<(mob?20:40);i++){
        const o=cp,c=o+R(-8000,9000);
        this.candles.push({o,c,h:Math.max(o,c)+R(1000,5000),l:Math.min(o,c)-R(1000,5000)});
        cp=c;
      }
    }
    draw(){
      const cx=this.cx,W=this.W,H=this.H;
      cx.clearRect(0,0,W,H);
      const g1=cx.createRadialGradient(W*.25,H*.5,0,W*.25,H*.5,W*.55);
      g1.addColorStop(0,C(0,229,160,.08)); g1.addColorStop(1,C(0,229,160,0));
      cx.fillStyle=g1; cx.fillRect(0,0,W,H);
      const g2=cx.createRadialGradient(W*.8,H*.4,0,W*.8,H*.4,W*.45);
      g2.addColorStop(0,C(0,184,122,.06)); g2.addColorStop(1,C(0,184,122,0));
      cx.fillStyle=g2; cx.fillRect(0,0,W,H);
      const CL=W*.07,CR=W*.91,CB=H*.78,CT=H*.1;
      const CW=CR-CL,CH=CB-CT;
      const px=t=>CL+t*CW;
      const py=v=>CB-(v/this.maxV)*CH;
      cx.strokeStyle=C(0,229,160,.06); cx.lineWidth=1;
      for(let i=0;i<=4;i++){
        const x=CL+i*(CW/4);cx.beginPath();cx.moveTo(x,CT);cx.lineTo(x,CB);cx.stroke();
        const y=CT+i*(CH/4);cx.beginPath();cx.moveTo(CL,y);cx.lineTo(CR,y);cx.stroke();
      }
      const cw=CW/this.candles.length;
      this.candles.forEach((c,i)=>{
        const x=CL+i*cw,up=c.c>=c.o;
        cx.strokeStyle=up?C(0,229,160,.16):C(239,68,68,.14);cx.lineWidth=1;
        cx.beginPath();cx.moveTo(x+cw/2,py(c.h));cx.lineTo(x+cw/2,py(c.l));cx.stroke();
        cx.fillStyle=up?C(0,229,160,.16):C(239,68,68,.14);
        cx.fillRect(x+1,Math.min(py(c.o),py(c.c)),cw-2,Math.max(Math.abs(py(c.o)-py(c.c)),1));
      });
      if(this.t%70===0){
        this.candles.shift();
        const last=this.candles.at(-1).c,nc={o:last,c:last+R(-7000,8000)};
        nc.h=Math.max(nc.o,nc.c)+R(1000,4000);nc.l=Math.min(nc.o,nc.c)-R(1000,4000);
        this.candles.push(nc);
      }
      const barW=CW/(this.bars.length+1);
      this.bars.forEach((b,i)=>{
        const bh=CH*b.frac*Math.min(this.prog/(b.frac||0.001),1);
        const bx=CL+(i+.5)*barW;
        const barGrad=cx.createLinearGradient(bx,CB-bh,bx,CB);
        barGrad.addColorStop(0,b.col);barGrad.addColorStop(1,'rgba(0,0,0,0)');
        cx.fillStyle=barGrad;cx.fillRect(bx-barW*.35,CB-bh,barW*.7,bh);
      });
      this.prog+=this.speed; if(this.prog>1.15) this.prog=0;
      const p=Math.min(this.prog,1);
      const vis=this.pts.filter(pt=>pt.t<=p);
      if(vis.length>1){
        cx.beginPath();cx.moveTo(CL,CB);
        vis.forEach(pt=>cx.lineTo(px(pt.t),py(pt.v)));
        cx.lineTo(px(vis.at(-1).t),CB);cx.closePath();
        const ag=cx.createLinearGradient(0,CT,0,CB);
        ag.addColorStop(0,C(0,229,160,.28));ag.addColorStop(1,C(0,229,160,0));
        cx.fillStyle=ag;cx.fill();
        cx.beginPath();
        vis.forEach((pt,i)=>i===0?cx.moveTo(px(pt.t),py(pt.v)):cx.lineTo(px(pt.t),py(pt.v)));
        const lg=cx.createLinearGradient(CL,0,CR,0);
        lg.addColorStop(0,C(0,229,160,.6));lg.addColorStop(.5,C(0,229,160,.85));lg.addColorStop(1,C(0,184,122,.9));
        cx.strokeStyle=lg;cx.lineWidth=3;cx.lineJoin='round';cx.lineCap='round';cx.stroke();
        const lp=vis.at(-1),ex=px(lp.t),ey=py(lp.v);
        const rg=cx.createRadialGradient(ex,ey,0,ex,ey,24);
        rg.addColorStop(0,C(0,229,160,.82));rg.addColorStop(1,C(0,229,160,0));
        cx.fillStyle=rg;cx.beginPath();cx.arc(ex,ey,24,0,TAU);cx.fill();
        cx.fillStyle='#00E5A0';cx.beginPath();cx.arc(ex,ey,6,0,TAU);cx.fill();
        cx.fillStyle='#fff';cx.beginPath();cx.arc(ex,ey,3,0,TAU);cx.fill();
        const pulse=(this.t%80)/80;
        cx.globalAlpha=1-pulse;cx.strokeStyle='#00E5A0';cx.lineWidth=2;
        cx.beginPath();cx.arc(ex,ey,8+pulse*22,0,TAU);cx.stroke();cx.globalAlpha=1;
      }
      cx.font='600 10px Montserrat,sans-serif';cx.textAlign='center';
      this.milestones.forEach(m=>{
        if(m.t>p+.04) return;
        const x=px(m.t),y=CB+16;
        cx.strokeStyle=C(0,229,160,.22);cx.lineWidth=1;
        cx.beginPath();cx.moveTo(x,CT);cx.lineTo(x,CB);cx.stroke();
        cx.fillStyle=C(0,229,160,.58);cx.fillText(m.label,x,y);
        if(m.t===0||m.t<=p){
          const bw=cx.measureText(m.val).width+16,bh=20;
          const bx=x-bw/2,by=py(this.maxV*m.frac||CT)-30;
          if(by>CT+10&&by<CB-10){
            cx.fillStyle=C(0,20,12,.75);cx.beginPath();cx.roundRect(bx,by,bw,bh,5);cx.fill();
            cx.strokeStyle=C(0,229,160,.28);cx.lineWidth=1;cx.stroke();
            cx.fillStyle=C(0,184,122,.9);cx.fillText(m.val,x,by+13);
          }
        }
      });
      cx.textAlign='left';
      this.coins.forEach(c=>{
        c.y+=c.vy;if(c.y<-35){c.y=H+35;c.x=R(W*.05,W*.95);}
        cx.save();cx.translate(c.x,c.y);cx.globalAlpha=c.al;
        const cg=cx.createRadialGradient(-c.r*.3,-c.r*.3,0,0,0,c.r);
        cg.addColorStop(0,'#4DFFBC');cg.addColorStop(1,'#00A066');
        cx.beginPath();cx.arc(0,0,c.r,0,TAU);cx.fillStyle=cg;cx.fill();
        cx.strokeStyle='rgba(255,255,255,.2)';cx.lineWidth=1;cx.stroke();
        cx.globalAlpha=c.al*3.5;cx.fillStyle='rgba(6,12,10,.9)';
        cx.font=`bold ${Math.ceil(c.r*.9)}px sans-serif`;cx.textAlign='center';cx.textBaseline='middle';
        cx.fillText('₽',0,0);cx.restore();
      });
      cx.globalAlpha=1;cx.textAlign='left';cx.textBaseline='alphabetic';
      this.sparks.forEach(s=>{
        s.x+=s.vx;s.y+=s.vy;if(s.y<-10){s.y=H+10;s.x=R(0,W);}
        cx.globalAlpha=s.al;cx.fillStyle=s.col;
        cx.beginPath();cx.arc(s.x,s.y,s.r,0,TAU);cx.fill();
      });
      cx.globalAlpha=1;
      const fl=cx.createLinearGradient(0,H*.72,0,H);
      fl.addColorStop(0,C(4,10,6,0));fl.addColorStop(1,C(4,10,6,.9));
      cx.fillStyle=fl;cx.fillRect(0,H*.72,W,H*.28);
      this.t++;
    }
  }

  /* ──────────────────────────────────────────────────
     INIT & ANIMATION LOOP
  ─────────────────────────────────────────────────── */
  const scenes = {};

  function setupCanvas(sectionSel, id, SceneClass) {
    const section = document.querySelector(sectionSel);
    if (!section) return;
    const cv = document.createElement('canvas');
    cv.className = 'bg-canvas'; cv.id = id;
    section.insertBefore(cv, section.firstChild);
    cv.width  = section.offsetWidth  || window.innerWidth;
    cv.height = section.offsetHeight || 600;
    scenes[id] = { cv, scene: new SceneClass(cv), section };
  }

  function resizeAll() {
    Object.values(scenes).forEach(({cv, scene, section}) => {
      cv.width  = section.offsetWidth  || window.innerWidth;
      cv.height = section.offsetHeight || 600;
      if (scene.rebuild) scene.rebuild();
    });
  }

  function isNearViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > -200 && rect.top < window.innerHeight + 200;
  }

  let lastRaf = 0;
  function loop(now) {
    if (now - lastRaf > 14) {
      lastRaf = now;
      Object.values(scenes).forEach(({cv, scene, section}) => {
        if (isNearViewport(section)) scene.draw();
      });
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('DOMContentLoaded', () => {
    setupCanvas('section.hero',      'bgHero',    HeroScene);
    setupCanvas('section.program',   'bgProgram', ProgramScene);
    setupCanvas('section.reviews',   'bgReviews', ReviewsScene);
    setupCanvas('section.pricing',   'bgPricing', PricingScene);
    setupCanvas('section.final-cta', 'bgCta',     CtaScene);
    requestAnimationFrame(loop);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeAll, 200);
  });

})();
