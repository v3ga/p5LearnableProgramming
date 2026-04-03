class p5GraphicElement
{
    constructor(command)
    {
        this.command     = command;
        this.posOptions  = 
        {
            axes : { display : true, sync : true }
        };
        this.timeline = null;
        this.pause = 0;
        this.durationWait = 1000;
        this.diameterOpacity = 0;
    }

    

    makeTimeline()
    {
        let t = anime.timeline({easing : "easeOutQuad", duration : 500, autoplay: false });
        return t;
    }

    beginAnimation()
    {
        return new Promise( (resolve,reject) => {
            resolve();
        } );
    }

    _playTimeline(t)
    {
        if (g.controller && g.controller.runMode)
        {
            t.seek(t.duration);
            return Promise.resolve();
        }
        if (g.controller) g.controller.registerTimeline(t);
        t.play();
        return t.finished.then(() => {
            if (g.controller) g.controller.unregisterTimeline();
        });
    }

    draw(){}
    drawDiameterH(x,y,d)
    {
        push();
        stroke(200,0,0,this.diameterOpacity);
        let a = this._s(g.myCanvas.sizeArrow);
        let v = int(d);
        let pad = this._s(1);
        let x1 = -d/2+pad, x2 = d/2 - pad;

        line(x1,0,x2,0);
        line(x2,0,x2-a,-a);
        line(x2,0,x2-a,a);
        line(x1,0,x1+a,-a);
        line(x1,0,x1+a,a);
        

        g.font.textSize(this._s(g.myCanvas.fontSize));
        let vW = g.font.textWidth(""+v);
        g.font.fill(`rgba(200,0.0,0.0,${this.diameterOpacity/255.0})`);
        g.font.text(""+v,-vW/2,this._s(-g.myCanvas.padding));

        pop();
    }
    
    _s(v)
    {
        if (g.myCanvas.scaleAxe.x!=0)
            return v/g.myCanvas.scaleAxe.x;
        return v;
    }
}

class p5AngleMode extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        let m = this.command.getParameterValue("mode");
        this.mode = (m === "DEGREES" || m === DEGREES) ? DEGREES : RADIANS;
    }

    draw()
    {
        angleMode(this.mode);
    }
}

class p5Background extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }

    draw()
    {
        //g.myCanvas.beginDraw();
        push();
        noStroke();
        fill( this.command.getParameterValue("grey") );
        rect(0,0,g.myCanvas.dim.x,g.myCanvas.dim.y);
        pop();
        //g.myCanvas.endDraw();

    }
}

class p5StrokeWeight extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }
    
    draw()
    {
        this.v = this.command.getParameterValue("v");
        strokeWeight(this.v);
    }
}


class p5Stroke extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.values = command.getParameterValues();
    }

    draw()
    {
        stroke(...this.values);
    }
}

class p5NoStroke extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }

    draw()
    {
        noStroke();
    }
}

class p5Fill extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }

    draw()
    {
        this.values = this.command.getParameterValues();
        fill(...this.values);
    }
}

class p5NoFill extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }

    draw()
    {
        noFill();
    }
}


class p5Line extends p5GraphicElement
{
    constructor(command)
    {
        super(command);

        this.x1 = command.getParameterValue("x1");
        this.y1 = command.getParameterValue("y1");
        this.x2 = this.x1;
        this.y2 = this.y1;
    
        this.x2Target = command.getParameterValue("x2");
        this.y2Target = command.getParameterValue("y2");
    }
    
    beginAnimation()
    {
        let t = this.makeTimeline();

        t.add({
            targets : g.myCanvas.posLines,
            x : this.x1,
            y : this.y1,
            begin : () => { this.command.highlightParameters( ["x1","y1"] ) }
        })
        .add({targets : this, pause : 0, duration : 1000})
        .add({
            targets : this,
            x2 : this.x2Target,
            y2 : this.y2Target,
            duration : 1000,
            begin : () => { this.command.highlightParameters( ["x2","y2"] ) },
            update : () => {         
                g.myCanvas.posLines.x = this.x2;        
                g.myCanvas.posLines.y = this.y2;       
            }
        })

        return this._playTimeline(t);
    }

    draw()
    {
        if (dist(this.x1,this.y1,this.x2,this.y2)>=1)
            line(this.x1,this.y1,this.x2,this.y2);
    }

}

class p5Circle extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.bDrawDiameter = true;

        this.x = command.getParameterValue("x");
        this.y = command.getParameterValue("y");
        this.d = 0;
        this.dTarget = command.getParameterValue("d");
    }

    beginAnimation()
    {
        let t = this.makeTimeline();
            t
            .add({
                targets : g.myCanvas.posLines,
                x : this.x,
                y : this.y,
                begin : () => { this.command.highlightParameters( ["x","y"] ) }
            })
            .add({
                    targets : this,
                    d : this.dTarget,
                    duration : 500,
                    begin : () => { this.diameterOpacity = 255; this.command.highlightParameters( ["d"] ) },
                }
            )
            .add({targets : this, pause : 0, duration : this.durationWait, complete: () => { anime( {targets:this, duration : 100, easing : 'linear', diameterOpacity:0} ) }
        })

        return this._playTimeline(t);
    }

    draw()
    {
        circle(this.x, this.y, this.d );
        push();
        stroke(200,0,0);
        strokeWeight(1/g.myCanvas.scaleAxe.x);
        fill(200,0,0);
        translate(this.x,this.y);
        if (this.bDrawDiameter && this.d>=5)
        {
            this.drawDiameterH(0,0,this.d);
        }
        pop();
    }
}

class p5Rect extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.bDrawDimensions = true;

        this.x = command.getParameterValue("x");
        this.y = command.getParameterValue("y");
        this.w = 0;
        this.h = 0;
        this.wTarget = command.getParameterValue("w");
        this.hTarget = command.getParameterValue("h");
    }
    
    beginAnimation()
    {
        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas.posLines,
            x : this.x,
            y : this.y,
            begin : () => { this.command.highlightParameters( ["x","y"] ) }
        })
        .add({
            targets : this,
            w : this.wTarget,
            h : this.hTarget,
            duration : 500,
            begin : () => { this.command.highlightParameters( ["w", "h"] ) },
        }
        )
        .add({targets : this, pause : 0, duration : this.durationWait, complete: () => { this.bDrawDimensions = false}
        })

        return this._playTimeline(t);
    }

    draw()
    {
        //g.myCanvas.beginDraw();

        push();
        translate(this.x,this.y);

        rect(0, 0, this.w, this.h );
        if (this.bDrawDimensions && this.w>=5 && this.h>=5)
        {
            let a = g.myCanvas.sizeArrow;
            let pad  = a*2;
            stroke(200,0,0);
            strokeWeight(1/g.myCanvas.scaleAxe.x);
            fill(200,0,0);
    
            let xOffset = 0, yOffset=0;
            if (g.interpreter.p5State.rectMode == "CENTER")
            {
                xOffset = -0.5*this.w;
                yOffset = -0.5*this.h;
            }

            push();
            translate(xOffset,yOffset-pad)
            line(0,0,this.w,0);

            line(this.w,0,this.w-a,-a);
            line(this.w,0,this.w-a,a);

            line(0,0,a,-a);
            line(0,0,a,a);

            g.font.textSize(this._s(g.myCanvas.fontSize));
            let iw = int(this.w);
            let sw = `${iw}`;
            let w = g.font.textWidth(sw);
            g.font.text(sw,(this.w-w)/2,this._s(-g.myCanvas.padding));

            pop();

            
            push();
            translate(xOffset-pad,yOffset);
            line(0,0,0,this.h);
            line(0,this.h,-a,this.h-a);
            line(0,this.h,a,this.h-a);

            line(0,0,-a,a);
            line(0,0,a,a);

            g.font.textSize(this._s(g.myCanvas.fontSize));
            let ih= int(this.h);
            let sh = `${ih}`;
            w = g.font.textWidth(sh);
            g.font.text(sh,-w-this._s(g.myCanvas.padding), this.h/2+this._s(g.myCanvas.fontSize)/2);

            
            pop();

        }
        pop();
        //g.myCanvas.endDraw();
    }
}

class p5RectMode extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        let m = this.command.getParameterValue("mode");
        this.mode = (m === "CENTER" || m === CENTER) ? CENTER : CORNER;
    }

    draw()
    {
        rectMode(this.mode);
    }
}

class p5Square extends p5Rect
{
    constructor(command)
    {
        super(command);
        this.h = this.w;
        this.hTarget = this.wTarget = command.getParameterValue("w");
    }
}

class p5Triangle extends p5GraphicElement
{
    constructor(command)
    {
        super(command);

        this.x = [];
        this.y = [];
        for (let i=0;i<3;i++) 
        { 
            this.x[i] = command.getParameterValue(`x${i+1}`);
            this.y[i] = command.getParameterValue(`y${i+1}`);
        }
        this.index = 0;
        this.contourDone = false;
    }
    
    beginAnimation()
    {
        let t = this.makeTimeline();
        for (let i=0;i<4;i++) { 

        t
        .add({
            targets : g.myCanvas.posLines,
            x : this.x[i%3],
            y : this.y[i%3],
            duration : 1000,
            begin : () => { this.index = i; this.command.highlightParameters( [`x${(i+1)%4}`,`y${(i+1)%4}`] ) },
            complete : () => { if (i==3) this.contourDone = true; }
        })

        }

        t.add({targets : this, pause : 0, duration : this.durationWait, complete: () => { this.bDrawDimensions = false}
        })

        return this._playTimeline(t);
    }

    draw()
    {

        g.myCanvas.beginDraw();
        push();
        translate(this.x,this.y);
        if (this.contourDone == false)
        {
            let nbLinesComplete = max(0,this.index-1);
            for (let i=0;i<nbLinesComplete;i++)
            {
                line(this.x[i],this.y[i],this.x[(i+1)%3],this.y[(i+1)%3]);
            }
            if (this.index>0)
                line(this.x[this.index-1],this.y[this.index-1], g.myCanvas.posLines.x,g.myCanvas.posLines.y);
        }
        else
        {
            triangle(this.x[0],this.y[0],this.x[1],this.y[1],this.x[2],this.y[2]);
        }
        pop();
        g.myCanvas.endDraw();
    }
}

class p5Arc extends p5GraphicElement
{
    constructor(command)
    {
        super(command);

        this.x              = command.getParameterValue("x");
        this.y              = command.getParameterValue("y");
        this.w              = 0;
        this.wTarget        = command.getParameterValue("w");
        this.h              = 0;
        this.hTarget        = command.getParameterValue("h");
        this.astart         = command.getParameterValue("astart");
        this.aend           = this.astart;
        this.aendTarget     = command.getParameterValue("aend");
        this.bDrawEllipse   = false;
        this.bDrawDiameter  = false;
        this.bDrawAngle     = true;
        this.drawAngleDiam  = 40;
    }

    beginAnimation()
    {
        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas.posLines,
            x : this.x,
            y : this.y,
            begin : () => { this.command.highlightParameters( ["x","y"] ) }
        })
        .add({
            targets : this,
            w : this.wTarget,
            h : this.hTarget,
            duration : 1000,
            begin : () => { this.bDrawEllipse = true; this.bDrawDiameter = true; this.bDrawAngle=true; this.command.highlightParameters( ["w", "h"] ) }
        })
        .add({
            targets : this,
            aend : this.aendTarget,
            duration : 500,
            begin : () => { this.command.highlightParameters( ["astart", "aend"] ) },
            complete: () => {this.bDrawEllipse=false ; this.bDrawDiameter = false;  }
        }
        )
        .add({targets : this, pause : 0, duration : this.durationWait, complete: () => { this.bDrawDiameter = false; this.bDrawAngle = false;}
        })

        return this._playTimeline(t);
    }

    draw()
    {
        g.myCanvas.beginDraw();

        push();
        translate(this.x,this.y);

        if (this.bDrawEllipse && this.w>=5 && this.h>=5)
        {
            push();
            noFill();
            stroke(0,30);
            strokeWeight(1/g.myCanvas.scaleAxe.x);
            ellipse(0,0,this.w,this.h);
            pop();            
        }

        if (this.aend >= this.astart+0.5)
        {
            //let s = g.interpreter.p5State;
            arc(0, 0, this.w, this.h, this.astart,this.aend);
        }


        if (this.bDrawAngle && abs(this.aend-this.astart) >= 1)
        {
            push();

                push();
                stroke(200,0,0);
                strokeWeight(1/g.myCanvas.scaleAxe.x);
                noFill();
                line(0,0,0.5*this.w*cos(this.astart),0.5*this.h*sin(this.astart))
                line(0,0,0.5*this.w*cos(this.aend),0.5*this.h*sin(this.aend))
                arc( 0, 0, this.drawAngleDiam, this.drawAngleDiam, this.astart,this.aend );
                pop();

            pop();
        
            if ( this.w > (this.drawAngleDiam + 60) )
            {
                push();
                stroke(200,0,0);
                strokeWeight(1/g.myCanvas.scaleAxe.x);
                fill(255,0,0,255);
                rotate(this.aend);
                
                let str_aend = ""+int(this.aend)+"°";
                g.font.textSize(g.myCanvas.fontSize);
                g.font.text(str_aend,this.drawAngleDiam/2+4,-4);
        
                pop();
    
            }
        
        }



        if (this.bDrawDiameter && this.w >= .5)
        {
            this.drawDiameterH(0,0,this.w);
        }            
            


        pop();
        g.myCanvas.endDraw();
    }
}

class p5BeginShape extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.positionVertex = 0;
        this.vertices = [];
        this.verticesGfx = [];
    }
    
    beginAnimation()
    {
        g.myCanvas.addShapeGfx(this);
        g.myCanvas.shapeGfxCurrent = this;
        return super.beginAnimation();
    }

    newVertex(p5v)
    {
        p5v.position = this.positionVertex;
        this.vertices.push( createVector(p5v.x,p5v.y) );
        this.verticesGfx.push(p5v);
        this.positionVertex++;
    }

    draw()
    {
        g.myCanvas.shapeGfxCurrent = this;
    }
}

class p5Vertex extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.x = command.getParameterValue(`x`);
        this.y = command.getParameterValue(`y`);
        this.bAnimDone = false;
        this.bDraw     = true;
        this.position = 0;
    }

    beginAnimation()
    {
        g.myCanvas.shapeGfxCurrent.newVertex(this);

        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas.posLines,
            x : this.x,
            y : this.y,
            duration : 500,
            begin :     () => { this.command.highlightParameters( [`x`,`y`] ) },
            complete :  () => { this.bAnimDone = true }
        })

        return this._playTimeline(t);
    }

    draw()
    {
        if (this.bDraw == false) 
            return;

        let vertices    = g.myCanvas.shapeGfxCurrent.vertices;

        if (this.position>=1)
        {
            let x1 = vertices[this.position-1].x;
            let y1 = vertices[this.position-1].y;
            let x2 = this.bAnimDone ? this.x : g.myCanvas.posLines.x;
            let y2 = this.bAnimDone ? this.y : g.myCanvas.posLines.y;

            g.myCanvas.beginDraw();
            noFill();
            line(x1,y1,x2,y2);
            g.myCanvas.endDraw();
        }
    }

}

class p5EndShape extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        let mode = this.command.getParameterValue("mode");
        this.closeMode = (mode === "CLOSE" || mode === CLOSE);

        this.bAnimDone = this.closeMode ? false : true;
    }

    beginAnimation()
    {
        // Close mode -> animate to first vertex
        if (this.closeMode)
        {
            let vFirst = g.myCanvas.shapeGfxCurrent.vertices[0];
            let t = this.makeTimeline();
            t
            .add({
                targets : g.myCanvas.posLines,
                x : vFirst.x,
                y : vFirst.y,
                duration : 500,
                begin :     () => { this.command.highlightParameters([`mode`])},
                complete :  () => { this.bAnimDone = true }
            })

            return this._playTimeline(t);
        }

        return super.beginAnimation();
    }

    draw()
    {
        if (this.bAnimDone)
        {
            let verticesGfx = g.myCanvas.shapeGfxCurrent.verticesGfx;
            verticesGfx.forEach( vGfx=>vGfx.bDraw=false )
            g.myCanvas.beginDraw();
                beginShape();
                verticesGfx.forEach( vGfx=>vertex(vGfx.x,vGfx.y) );
                endShape(this.closeMode ? CLOSE : null);
            g.myCanvas.endDraw();
        }
        else 
        {
            if (this.closeMode)
            {
                let vertices = g.myCanvas.shapeGfxCurrent.vertices;
                let x1 = vertices[vertices.length-1].x;
                let y1 = vertices[vertices.length-1].y;
                let x2 = g.myCanvas.posLines.x;
                let y2 = g.myCanvas.posLines.y;

                g.myCanvas.beginDraw();
                noFill();
                line(x1,y1,x2,y2);
                g.myCanvas.endDraw();
            }
        }
    }
}

class p5Translate extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.x = command.getParameterValue(`x`);
        this.y = command.getParameterValue(`y`);
        this.bAnimDone = false;
    }

    beginAnimation()
    {
        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas.posAxe,
            x : g.myCanvas.scaleAxe.x*(g.myCanvas.posAxe.x+this.x),
            y : g.myCanvas.scaleAxe.y*(g.myCanvas.posAxe.y+this.y),
            duration : 750,
            begin : () => { this.command.highlightParameters( ["x","y"] ) },
            complete: () => { this.bAnimDone = true }
        })

        return this._playTimeline(t);        
    }

    draw()
    {
        translate(
                this.bAnimDone ? this.x : g.myCanvas.posAxe.x, 
                this.bAnimDone ? this.y : g.myCanvas.posAxe.y
        );
    }

}

class p5Rotate extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.angle = command.getParameterValue(`angle`);
        this.bAnimDone = false;
    }

    beginAnimation()
    {
        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas,
            rotAxe : g.myCanvas.rotAxe + this.angle,
            duration : 750,
            begin : () => { this.command.highlightParameters( ["angle"] ) },
            complete: () => { this.bAnimDone = true }
        })

        return this._playTimeline(t);        
    }

    draw()
    {
        rotate(this.bAnimDone ? this.angle : g.myCanvas.rotAxe);
    }
}

class p5Scale extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.sx = command.getParameterValue(`sx`);
        this.sy = command.getParameterValue(`sy`);
        if (this.sy==0) this.sy=this.sx;
        this.bAnimDone = false;
    }

    beginAnimation()
    {
        let t = this.makeTimeline();
        t
        .add({
            targets     : g.myCanvas.scaleAxe,
            x           : g.myCanvas.scaleAxe.x * this.sx,
            y           : g.myCanvas.scaleAxe.y * this.sy,
            duration    : 750,
            begin : () => { this.command.highlightParameters( ["angle"] ) },
            complete: () => { this.bAnimDone = true }
        })

        return this._playTimeline(t);        
    }

    draw()
    {
        scale(
            this.bAnimDone ? this.sx : g.myCanvas.scaleAxe.x,
            this.bAnimDone ? this.sy : g.myCanvas.scaleAxe.y
        );
    }
}




class p5Push extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }
    draw(){push()}
}

class p5Pop extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
    }
    draw(){pop()}
}


// ── Registry registrations ─────────────────────────────────────
// Each p5 function is registered with its parameter names and
// a factory function. To add a new function, just add a register() call.

p5Reg.register("angleMode",    { params: ["mode"],                               createGraphic: cmd => new p5AngleMode(cmd) });
p5Reg.register("background",   { params: ["grey"],                               createGraphic: cmd => new p5Background(cmd) });
p5Reg.register("stroke",       { params: ["v1","v2","v3","v4"],                  createGraphic: cmd => new p5Stroke(cmd) });
p5Reg.register("noStroke",     { params: [],                                     createGraphic: cmd => new p5NoStroke(cmd) });
p5Reg.register("strokeWeight", { params: ["v"],                                  createGraphic: cmd => new p5StrokeWeight(cmd) });
p5Reg.register("fill",         { params: ["v1","v2","v3","v4"],                  createGraphic: cmd => new p5Fill(cmd) });
p5Reg.register("noFill",       { params: [],                                     createGraphic: cmd => new p5NoFill(cmd) });
p5Reg.register("line",         { params: ["x1","y1","x2","y2"],                  createGraphic: cmd => new p5Line(cmd) });
p5Reg.register("circle",       { params: ["x","y","d"],                          createGraphic: cmd => new p5Circle(cmd) });
p5Reg.register("rect",         { params: ["x","y","w","h"],                      createGraphic: cmd => new p5Rect(cmd) });
p5Reg.register("rectMode",     { params: ["mode"],                               createGraphic: cmd => new p5RectMode(cmd) });
p5Reg.register("square",       { params: ["x","y","w"],                         createGraphic: cmd => new p5Square(cmd) });
p5Reg.register("triangle",     { params: ["x1","y1","x2","y2","x3","y3"],        createGraphic: cmd => new p5Triangle(cmd) });
p5Reg.register("arc",          { params: ["x","y","w","h","astart","aend"],      createGraphic: cmd => new p5Arc(cmd) });
p5Reg.register("beginShape",   { params: [],                                     createGraphic: cmd => new p5BeginShape(cmd) });
p5Reg.register("vertex",       { params: ["x","y"],                              createGraphic: cmd => new p5Vertex(cmd) });
p5Reg.register("endShape",     { params: ["mode"],                               createGraphic: cmd => new p5EndShape(cmd) });
p5Reg.register("translate",    { params: ["x","y"],                              createGraphic: cmd => new p5Translate(cmd) });
p5Reg.register("rotate",       { params: ["angle"],                              createGraphic: cmd => new p5Rotate(cmd) });
p5Reg.register("scale",        { params: ["sx","sy"],                            createGraphic: cmd => new p5Scale(cmd) });
p5Reg.register("push",         { params: [],                                     createGraphic: cmd => new p5Push(cmd) });
p5Reg.register("pop",          { params: [],                                     createGraphic: cmd => new p5Pop(cmd) });
