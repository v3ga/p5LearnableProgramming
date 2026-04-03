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
        this.rotAxe         = 0; // degrees
        this.scaleAxe       = createVector(1.,1.);

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
        this.rotAxe=0;
        this.scaleAxe.set(1.,1.);
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
        translate(this.posAxe.x,this.posAxe.y);
        rotate(this.rotAxe);
        scale(this.scaleAxe.x,this.scaleAxe.y);
        stroke( this.colorGrid );
        strokeWeight(1/this.scaleAxe.x);

        let step = this.dim.x / this.resGrid;
        let xMin = -this.dim.x-step;
        let xMax = this.dim.x+step;
        let yMin = -this.dim.y-step;
        let yMax = this.dim.y+step;


        for (let x=xMin; x<=xMax; x+=step)
            line(x,yMin,x,yMax);

        step = this.dim.y / this.resGrid;
        for (let y=yMin; y<=yMax; y+=step)
            line(xMin,y,xMax,y);

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
                strokeWeight(1/this.scaleAxe.x);
        
                // Mark X
                push();
                translate(this.posAxe.x+x,this.posAxe.y);
                rotate(this.rotAxe);
                scale(this.scaleAxe.x,1);
                line(0,0,0,this.lenAxe/2);
                pop();
        
                // Mark Y
                push();
                translate(this.posAxe.x,this.posAxe.y+y);
                rotate(this.rotAxe);
                scale(1,this.scaleAxe.y);
                line(0,0,this.lenAxe/2,0);
                pop();

                // Cross
                push();
                translate(this.posAxe.x,this.posAxe.y);
                rotate(this.rotAxe);
                scale(this.scaleAxe.x,this.scaleAxe.y);
                line(x,y-this.lenAxe/4,x,y+this.lenAxe/4);
                line(x-this.lenAxe/4,y,x+this.lenAxe/4,y);
                pop();

            pop();
        }

        g.font.textSize(this.fontSize);

        // TODO : check is scale is too small

        let sx = `${int(x)}`;
        let wX = g.font.textWidth(sx);
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor("x", x)})`);
        push();
        translate(this.scaleAxe.x*this.posAxe.x+x-wX/2,this.scaleAxe.y*this.posAxe.y-this.padding-5);
        rotate(this.rotAxe);
        g.font.text(sx,0,0);
        pop();

        let sy = `${int(y)}`;
        let wY = g.font.textWidth(sy);
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor("y",y)})`);
        push();
        translate(this.scaleAxe.x*this.posAxe.x-this.padding-wY-2,this.scaleAxe.y*this.posAxe.y+y+4);
        rotate(this.rotAxe);
        g.font.text(sy,0,0);
        pop();

        this.endDraw();
    }

    getFontAlphaFor(axe, pos)
    {
        let o = this.options;
        if (o.drawAxes)
        {
            let a = axe=="x" ? pos : 0; 
            let b = axe=="x" ? 0 : pos; 
            if (dist(this.posAxe.x+a,this.posAxe.y+b,this.posAxe.x,this.posAxe.y)<=1.1*this.lenAxe)
                return 0;
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
        rotate(this.rotAxe);

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
            strokeWeight(1/this.scaleAxe.x);
            translate(0,-this.lenAxe/4);
            push();
            scale(this.scaleAxe.x,this.scaleAxe.y);
            line(0,0,l,0)
            line(l,0,l-this.sizeArrow,-this.sizeArrow);
            line(l,0,l-this.sizeArrow,this.sizeArrow);
            pop();
            g.font.text("x",this.scaleAxe.x*(l-wX/2),this.scaleAxe.y*(-this.padding));
            pop();
            
            push();
            stroke(0);
            strokeWeight(1/this.scaleAxe.x);
            translate(-this.lenAxe/4,0);
            push();
            scale(this.scaleAxe.x,this.scaleAxe.y);
            line(0,0,0,l);
            line(0,l,-this.sizeArrow,l-this.sizeArrow);
            line(0,l,this.sizeArrow,l-this.sizeArrow);
            pop();
    
            g.font.text("y",this.scaleAxe.x*(-this.padding-wY),this.scaleAxe.y*(l-wY/2));
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