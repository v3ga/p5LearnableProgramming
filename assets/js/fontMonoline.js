class FontMonoLine
{
    constructor(canvasId)
    {
        this.canvas     = document.getElementById(canvasId);
        this.context    = this.canvas.getContext("2d");
        this.fontFamily = "relief-single";
        this.textSize(20);
    }

    textSize(size)
    {
        this.size = parseInt(size);
        this.context.font = `${this.size}px ${this.fontFamily}`;
    }

    textWidth(str)
    {
        return this.context.measureText(str).width;
    }

    fill(c)
    {
        this.context.fillStyle = c;        
    }

    text(str,x,y)
    {
        this.context.fillText(str, x, y);
    }
}