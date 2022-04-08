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
        return anime.timeline({easing : "easeOutSine", duration : 250 });
    }

    beginAnimation()
    {
        return new Promise( (resolve,reject) => {
            resolve();
            //setTimeout(resolve,0);
        } );
    }

    draw(){}
    drawDiameterH(x,y,d)
    {
        push();
        stroke(200,0,0,this.diameterOpacity);
        let a = g.myCanvas.sizeArrow;
        let v = int(d);
        let pad = 1;
        let x1 = -d/2+pad, x2 = d/2 - pad;

        line(x1,0,x2,0);
        line(x2,0,x2-a,-a);
        line(x2,0,x2-a,a);
        line(x1,0,x1+a,-a);
        line(x1,0,x1+a,a);
        

        g.font.textSize(g.myCanvas.fontSize);
        let vW = g.font.textWidth(""+v);
        g.font.fill(`rgba(200,0.0,0.0,${this.diameterOpacity/255.0})`);
        g.font.text(""+v,-vW/2,-g.myCanvas.padding);

        pop();
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
        g.myCanvas.beginDraw();
        push();
        noStroke();
        fill( this.command.getParameterValue("grey") );
        rect(0,0,g.myCanvas.dim.x,g.myCanvas.dim.y);
        pop();
        g.myCanvas.endDraw();

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
        strokeWeight( this.command.getParameterValue("v") );
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
        // TODO : colors
        fill( this.command.getParameterValue("grey") );
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

        return t.finished;
    }

    draw()
    {

        g.myCanvas.beginDraw();
        stroke(0);
        if (dist(this.x1,this.y1,this.x2,this.y2)>=1)
            line(this.x1,this.y1,this.x2,this.y2);
        g.myCanvas.endDraw();
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

        return t.finished;
    }

    draw()
    {
        g.myCanvas.beginDraw();
        circle(this.x, this.y, this.d );
        push();
        stroke(200,0,0);
        fill(200,0,0);
        translate(this.x,this.y);
        if (this.bDrawDiameter && this.d>=5)
        {
            this.drawDiameterH(0,0,this.d);
        }
        pop();
        g.myCanvas.endDraw();
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

        return t.finished;
    }

    draw()
    {
        g.myCanvas.beginDraw();

        push();
        translate(this.x,this.y);

        stroke(0); // TODO : state stroke
        fill(255); // TODO : state fill
        rect(0, 0, this.w, this.h );
        if (this.bDrawDimensions && this.w>=5 && this.h>=5)
        {
            let a = g.myCanvas.sizeArrow;
            let pad  = a*2;
            stroke(200,0,0);
            fill(200,0,0);
    
            push();
            translate(0,-pad)
            line(0,0,this.w,0);
            line(this.w,0,this.w-a,-a);
            line(this.w,0,this.w-a,a);

            g.font.textSize(g.myCanvas.fontSize);
            let iw = int(this.w);
            let w = g.font.textWidth(""+iw);
            g.font.text(""+iw,(this.w-w)/2,-g.myCanvas.padding);

            pop();

            
            push();
            translate(-pad,0)
            line(0,0,0,this.h);
            line(0,this.h,-a,this.h-a);
            line(0,this.h,a,this.h-a);

            g.font.textSize(g.myCanvas.fontSize);
            let ih= int(this.h);
            w = g.font.textWidth(""+ih);
            g.font.text(""+ih,-w-g.myCanvas.padding, this.h/2+g.myCanvas.fontSize/2);

            
            pop();

        }
        pop();
        g.myCanvas.endDraw();
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

        return t.finished;
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
            begin : () => { this.bDrawEllipse = true; this.bDrawDiameter = true; this.command.highlightParameters( ["w", "h"] ) }
        })
        .add({
            targets : this,
            aend : this.aendTarget,
            duration : 500,
            begin : () => { this.command.highlightParameters( ["astart", "aend"] ) },
            complete: () => {this.bDrawEllipse=false ; this.bDrawDiameter = false; }
        }
        )
        .add({targets : this, pause : 0, duration : this.durationWait, complete: () => { this.bDrawDiameter = false}
        })

        return t.finished;
    }

    draw()
    {
        angleMode(DEGREES); // TODO : temp, should have been executed in setup()
        g.myCanvas.beginDraw();

        push();
        translate(this.x,this.y);

        if (this.bDrawEllipse && this.w>=5 && this.h>=5)
        {
            push();
            noFill();
            stroke(0,30); // TODO : state stroke
            ellipse(0,0,this.w,this.h);
            pop();            
        }

        stroke(0); // TODO : state stroke
        fill(255); // TODO : state fill
        if (this.aend >= this.astart+0.5)
            arc(0, 0, this.w, this.h, this.astart,this.aend);

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
        this.vertices = [];
        this.vertexGfx =[];
    }
    
    beginAnimation()
    {
        g.myCanvas.beginShapeGfx = this;
        return super.beginAnimation();
    }

    push(vertexGfx)
    {
        this.vertices.push( createVector(vertexGfx.x,vertexGfx.y) );
        this.vertexGfx.push(vertexGfx);
    }
}

class p5EndShape extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.beginShapeGfx = g.myCanvas.beginShapeGfx;
    }

    beginAnimation()
    {
        this.beginShapeGfx.vertexGfx.forEach( vGfx => vGfx.bDrawLine = false  )        
        return super.beginAnimation();
    }

    draw()
    {
        let vertices =  this.beginShapeGfx.vertices;

        g.myCanvas.beginDraw();
        stroke(0);
        beginShape();
        vertices.forEach(  v => vertex(v.x,v.y) )
        endShape();
        g.myCanvas.endDraw();
    }
}


class p5Vertex extends p5GraphicElement
{
    constructor(command)
    {
        super(command);
        this.x = command.getParameterValue(`x`);
        this.y = command.getParameterValue(`y`);
        this.contourDone = false;
        this.bDrawLine = true;
    }

    beginAnimation()
    {
        this.beginShapeGfx = g.myCanvas.beginShapeGfx;
        this.beginShapeGfx.push(this);

        let t = this.makeTimeline();
        t
        .add({
            targets : g.myCanvas.posLines,
            x : this.x,
            y : this.y,
            duration : 500,
            begin :     () => { this.command.highlightParameters( [`x`,`y`] ) },
            complete :  () => { this.contourDone = true }
        })

        return t.finished;
    }

    draw()
    {
        if (this.bDrawLine == false)
            return;

        let vertices = g.myCanvas.beginShapeGfx.vertices;
        let nb = vertices.length;
        console.log(nb);
        if (this.contourDone == false)
        {
            if (nb>=2)
            {
                g.myCanvas.beginDraw();
                line(vertices[nb-2].x,vertices[nb-2].y,g.myCanvas.posLines.x,g.myCanvas.posLines.y);
                g.myCanvas.endDraw();
            }
        }
        else
        {
            if (nb>=2)
            {
                g.myCanvas.beginDraw();
                line(vertices[nb-2].x,vertices[nb-2].y,this.x,this.y);
                g.myCanvas.endDraw();
            }
        }
    }

}

