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
        this.beginShapeGfx  = null;

        this.lenAxe         = this.dim.x / this.resGrid;

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

         console.log(this.colorGrid);
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
            noFill();
            stroke(this.colorLinePos);
            push();
            translate(x,0);
            line(0,0,0,this.lenAxe/2);
            line(0,y-this.lenAxe/4,0,y+this.lenAxe/4);
            pop();
    
            push();
            translate(0,y);
            line(0,0,this.lenAxe/2,0);
            line(x-this.lenAxe/4,0,x+this.lenAxe/4,0);
            pop();
        }

        g.font.textSize(this.fontSize);

        let wX = g.font.textWidth(""+int(x));
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor(x)})`);
        g.font.text(""+int(x),x-wX/2,-this.padding-5);

        let wY = g.font.textWidth(""+int(y));
        g.font.fill(`rgba(0,0,0,${this.getFontAlphaFor(y)})`);
        g.font.text(""+int(y),-this.padding-wY-2,y+4);

        this.endDraw();
    }

    getFontAlphaFor(pos)
    {
        let o = this.options;
        if (o.drawAxes)
        {
            let th = 1.1*this.lenAxe;
            if (pos <= 1.1*this.lenAxe )
                return 0.0;
        }
        return 1.0;        
    }

    drawAxes()
    {
        let l = this.lenAxe;
        let o = this.options;

        this.beginDraw();
        g.font.textSize(this.fontSize);
        g.font.fill("rgba(0,0,0,1.0)");

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
            translate(0,-this.lenAxe/4);
            line(0,0,l,0)
            line(l,0,l-this.sizeArrow,-this.sizeArrow);
            line(l,0,l-this.sizeArrow,this.sizeArrow);
            g.font.text("x",l-wX/2,-this.padding);
            pop();
            
            push();
            translate(-this.lenAxe/4,0);
            line(0,0,0,l);
            line(0,l,-this.sizeArrow,l-this.sizeArrow);
            line(0,l,this.sizeArrow,l-this.sizeArrow);
    
            g.font.text("y",-this.padding-wY,l-wY/2);
            pop();
        }

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