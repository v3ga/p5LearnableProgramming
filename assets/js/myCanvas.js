class MyCanvas
{
    constructor(x,y,w,h)
    {
        this.pos = createVector(x,y);
        this.dim = createVector(w,h);

        this.bgColor        = color(255);
        this.colorLinePos   = color(0,100);
        this.colorGrid      = color(0,25);  
        this.resGrid        = 10;     
        this.sizePoint      = 3;
        this.font           = "Inconsolata,monospace";
        this.fontSize       = 14;
        this.fontSizeDim    = 10;
        this.padding        = 8;
        this.sizeArrow      = 5;


        this.posLines       = createVector();
        
        // Used for beginShape / endShape
        this.beginShapeGfx  = [];

        // Axe length
        this.lenAxe         = 0.5*this.dim.x / this.resGrid;
        this.posAxe         = createVector();

        // Drawing options
        this.options        = 
        {
            drawOrigin : isOptions() ? options.drawOrigin : true,
            drawAxes : isOptions() ? options.drawAxes : true,
            drawCrossPosition : isOptions() ? options.drawCrossPosition : true
        };

        if (isOptions() && options.colorGrid)
        {
            this.colorGrid = color(options.colorGrid[0],options.colorGrid[1],options.colorGrid[2],25);             
        }
    }
    
    reset()
    {
        this.shapeGfx  = [];
        this.posAxe.set(0,0);
        this.posLines.set(0,0);
    }

    addShapeGfx(shapeGfx)
    {
        this.shapeGfx.push(shapeGfx);
    }

    lastShapeGfx()
    {
        if (this.shapeGfx.length>0)
            return this.shapeGfx[this.shapeGfx.length-1];
        return null;
    }


    background(r,g,b)
    {
        if (g == undefined && b == undefined)
            this.bgColor = color(r);
        else 
            this.bgColor = color(r,g,b);
    }

    draw()
    {
        background(this.bgColor);
    }

    drawGrid()
    {
        this.beginDraw();

        push();
        
        stroke( this.colorGrid );
        strokeWeight(1);

        let step = this.dim.x / this.resGrid;
        for (let x=0; x<=this.dim.x; x+=step)
            line(x,0,x,this.dim.y);

        step = this.dim.y / this.resGrid;
        for (let y=0; y<=this.dim.y; y+=step)
            line(0,y,this.dim.x,y);

        pop();

        this.endDraw();
    }    

    drawPosition()
    {
        let o = this.options;
        let x = this.posLines.x;
        let y = this.posLines.y;

        this.beginDraw();

        if (o.drawCrossPosition)
        {
            push();
            
                noFill();
                stroke(this.colorLinePos);
                strokeWeight(1);
        
                // Mark X
                push();
                translate(this.posAxe.x+x,0);
                line(0,0,0,this.lenAxe/2);
                pop();
        
                // Mark Y
                push();
                translate(0,this.posAxe.y+y);
                line(0,0,this.lenAxe/2,0);
                pop();

                // Cross
                push();
                translate(this.posAxe.x,this.posAxe.y);
                line(x,y-this.lenAxe/4,x,y+this.lenAxe/4);
                line(x-this.lenAxe/4,y,x+this.lenAxe/4,y);
                pop();

            pop();
        }

        g.font.textSize(this.fontSize);

        let sx = `${int(x)}`;
        let wX = g.font.textWidth(sx);
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor("x", x)})`);
        g.font.text(sx,this.posAxe.x+x-wX/2,-this.padding-5);

        let sy = `${int(x)}`;
        let wY = g.font.textWidth(sy);
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor("y",y)})`);
        g.font.text(sy,-this.padding-wY-2,this.posAxe.y+y+4);

        this.endDraw();
    }

    getFontAlphaFor(axe, pos)
    {
        let o = this.options;
        if (o.drawAxes)
        {
            let a = axe=="x" ? pos : 0; 
            let b = axe=="x" ? 0 : pos; 
            if (dist(a,b,this.posAxe.x,this.posAxe.y)<=1.1*this.lenAxe)
                return 0;
//            if (Math.abs(pos) <= 1.1*this.lenAxe )
  //              return 0.0;
        }

        return 1.0;        
    }

    translateAxes(x,y)
    {
        this.posAxe.set(x,y);
    }

    drawAxes()
    {
        let l = this.lenAxe;
        let o = this.options;

        this.beginDraw();
        g.font.textSize(this.fontSize);
        g.font.fill("rgba(0,0,0,1.0)");

        push();
        translate( this.posAxe.x, this.posAxe.y);

        if (o.drawOrigin)
        {
            push();
            noStroke();
            fill(0);
            rectMode(CENTER);
            rect(0,0,3,3);

            let wOrigin = g.font.textWidth("O");
            g.font.text("O",-3/2*wOrigin,-this.padding+2);
            pop();
        }

        if (o.drawAxes)
        {
            let wX = g.font.textWidth("x");
            let wY = g.font.textWidth("y");
    
            push();
            stroke(0);
            strokeWeight(1);
            translate(0,-this.lenAxe/4);
            line(0,0,l,0)
            line(l,0,l-this.sizeArrow,-this.sizeArrow);
            line(l,0,l-this.sizeArrow,this.sizeArrow);
            g.font.text("x",l-wX/2,-this.padding);
            pop();
            
            push();
            stroke(0);
            strokeWeight(1);
            translate(-this.lenAxe/4,0);
            line(0,0,0,l);
            line(0,l,-this.sizeArrow,l-this.sizeArrow);
            line(0,l,this.sizeArrow,l-this.sizeArrow);
    
            g.font.text("y",-this.padding-wY,l-wY/2);
            pop();
        }
        pop();

        this.endDraw();
    }

    beginDraw()
    {
        push();
        translate(this.pos.x,this.pos.y);
    }

    endDraw()
    {
        pop();
    }

}