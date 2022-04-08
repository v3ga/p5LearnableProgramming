class p5Interpreter
{
    constructor(canvasId, sketchId)
    {
        this.canvas     = createCanvas(600,600);
        this.myCanvas   = new MyCanvas(50,50,500,500);
        this.canvas.parent(canvasId);
        this.canvas.id("p5Canvas");
        this.sketchId   = sketchId;

        this.variablesDef = new Map();
        this.graphics = [];


        this.variables = new Variables($(".container-variables"));

        g.interpreter   = this;
        g.myCanvas      = this.myCanvas;
    }

    compile()
    {
        this.fnDraw = new p5CommandList(this, $(`#fn-draw`));
        //console.log(`p5Interpreter.compile(), found ${this.fnDraw.commands.length} command(s)`);
        this.fnDraw
        .loop(5, _=>this.reset.bind(this))
        .then( _=> console.log("done!") )
    }

    reset()
    {
        this.graphics = [];
    }

    defineVariable(name,value)
    {
        // console.log(`defineVariable(${name},${value})`);
        this.variablesDef.set(name, value);
        this.addVariableToTable(name,value);
        window[name] = value;
    }
    
    removeVariable(name)
    {
        console.log(`removeVariable(${name})`);
        this.variablesDef.delete(name);
        this.variables.removeVariable(name);
        window[name] = null;
    }

    updateVariableValue(name,value)
    {
        console.log( `updateVariableValue(${name},${value})` )
        this.variables.updateValue(name,value);
    }
 
    getVariableValue(name)
    {
        return this.variablesDef.get(name);
    }

    addVariableToTable(name, value)
    {
        this.variables.addVariable(name,value);
    }

    draw()
    {
        push();
        g.myCanvas.draw();
        this.graphics.forEach( g => g.draw() );
        pop();
        g.myCanvas.drawGrid();
        g.myCanvas.drawAxes()
        g.myCanvas.drawPosition();
    }
}