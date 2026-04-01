/**
 * p5Interpreter — orchestrates canvas, variables, graphics, and execution.
 */
class p5Interpreter
{
    constructor(canvasId, drawW = 500, drawH = 500)
    {
        this.canvasId   = canvasId;
        this.margin     = 50;
        this.canvas     = createCanvas(drawW + this.margin * 2, drawH + this.margin * 2);
        this.myCanvas   = new MyCanvas(this.margin, this.margin, drawW, drawH);
        this._ensureCanvasParent();
        this.canvas.id("p5Canvas");

        this.variablesDef = new Map();
        this.graphics     = [];
        this.variables    = new Variables($(".container-variables"));
        this.p5State      = this._defaultP5State();
        this.controller   = null;
        this.fnSetup      = null;
        this.fnDraw       = null;
        this.setupHasCreateCanvas = false;

        g.interpreter = this;
        g.myCanvas    = this.myCanvas;
        this.applyP5State();
        this.refreshReservedVariables();
    }

    _defaultP5State()
    {
        return {
            angleMode    : "RADIANS",
            rectMode     : "CORNER",
            strokeWeight : 1,
            stroke       : 0,
            fill         : 255,
            useStroke    : true,
            useFill      : true
        };
    }

    _isStateCall(name)
    {
        return ["stroke", "fill", "noStroke", "noFill", "strokeWeight", "angleMode", "rectMode"].includes(name);
    }

    _normalizeStateValue(args)
    {
        if (!args || args.length === 0) return null;
        if (args.length === 1) return args[0];
        return args;
    }

    updateP5StateFromCall(name, args)
    {
        if (!this._isStateCall(name)) return;

        if (name === "strokeWeight" && args.length > 0)
            this.p5State.strokeWeight = Number(args[0]);
        else if (name === "stroke")
        {
            this.p5State.stroke = this._normalizeStateValue(args);
            this.p5State.useStroke = true;
        }
        else if (name === "fill")
        {
            this.p5State.fill = this._normalizeStateValue(args);
            this.p5State.useFill = true;
        }
        else if (name === "noStroke")
        {
            this.p5State.useStroke = false;
        }
        else if (name === "noFill")
        {
            this.p5State.useFill = false;
        }
        else if (name === "angleMode")
        {
            let mode = args.length > 0 ? args[0] : null;
            if (mode === DEGREES) this.p5State.angleMode = "DEGREES";
            else if (mode === RADIANS) this.p5State.angleMode = "RADIANS";
        }
        else if (name === "rectMode")
        {
            this.p5State.rectMode = "CORNER";
            let mode = args.length > 0 ? args[0] : null;
            if (mode === CENTER) this.p5State.rectMode = "CENTER";
        }

        this.applyP5State();
        this.refreshReservedVariables();
    }

    _applyStyleValue(fn, value)
    {
        if (Array.isArray(value)) fn.apply(null, value);
        else if (value !== null && value !== undefined) fn(value);
    }

    applyP5State()
    {
//        if (this.p5State.angleMode === "DEGREES") angleMode(DEGREES);
//        else angleMode(RADIANS);

//        if (this.p5State.useStroke) this._applyStyleValue(stroke, this.p5State.stroke);
//        else noStroke();

//        if (this.p5State.useFill) this._applyStyleValue(fill, this.p5State.fill);
  //      else noFill();

//        if (Number.isFinite(this.p5State.strokeWeight))
//            strokeWeight(this.p5State.strokeWeight);
    }

    _ensureCanvasParent()
    {
        let parent = document.getElementById(this.canvasId);
        if (parent && this.canvas && this.canvas.elt && this.canvas.elt.parentNode !== parent)
        {
            this.canvas.parent(this.canvasId);
        }
    }

    showCanvas()
    {
        this._ensureCanvasParent();
        if (this.canvas && this.canvas.elt) $(this.canvas.elt).show();
    }

    hideCanvas()
    {
        if (this.canvas && this.canvas.elt) $(this.canvas.elt).hide();
    }

    applyUserCanvasSize(drawW, drawH)
    {
        if (!Number.isFinite(drawW) || !Number.isFinite(drawH)) return;
        resizeCanvas(drawW + this.margin * 2, drawH + this.margin * 2);
        this.myCanvas = new MyCanvas(this.margin, this.margin, drawW, drawH);
        g.myCanvas = this.myCanvas;
        this._ensureCanvasParent();
        this.refreshReservedVariables();
    }

    setP5State(name, value)
    {
        this.p5State[name] = value;
        this.variables.updateP5Value(name, value);
    }

    refreshReservedVariables()
    {
        this.variables.updateP5Value("width", typeof width !== "undefined" ? width : "-");
        this.variables.updateP5Value("height", typeof height !== "undefined" ? height : "-");
        this.variables.updateP5Value("angleMode", this.p5State.angleMode || "RADIANS");
        this.variables.updateP5Value("rectMode", this.p5State.rectMode || "CORNER");

        this.variables.updateP5Value("strokeWeight", this.p5State.strokeWeight);
        this.variables.updateP5Value("stroke", this.p5State.useStroke ? (this.p5State.stroke || 0) : "off");
        this.variables.updateP5Value("fill", this.p5State.useFill ? (this.p5State.fill || 0) : "off");
    }

    async compile(setupCommands, drawCommands, controller, setupHasCreateCanvas = false, globalCommands = [])
    {
        this.fnSetup    = setupCommands;
        this.fnDraw     = drawCommands;
        this.fnGlobal   = globalCommands;
        this.controller = controller;
        this.setupHasCreateCanvas = setupHasCreateCanvas;
        await this.run();
    }

    async run()
    {
        try
        {
            if (this.setupHasCreateCanvas) this.hideCanvas();
            else this.showCanvas();

            // Execute global variable declarations
            for (let cmd of this.fnGlobal)
                await cmd.execute(this.controller);

            this.reset();
            if (this.fnSetup)
            {
                if (g.callStack) { g.callStack.clear(); g.callStack.push("setup()", 0); }
                await this.fnSetup.execute(this.controller);
            }

            this.showCanvas();
            if (g.callStack) { g.callStack.clear(); g.callStack.push("draw()", 0); }

            for (let i = 0; i < 5; i++)
            {
                this.reset();
                await this.fnDraw.execute(this.controller);
            }
            console.log("done!");
        }
        catch (e)
        {
            if (e instanceof AbortError) console.log("Execution aborted");
            else throw e;
        }
    }

    reset()
    {
        this._ensureCanvasParent();
        this.graphics = [];
        this.myCanvas.reset();
        this.applyP5State();
        this.refreshReservedVariables();
    }

    defineVariable(name, value)
    {
        if (this.variablesDef.has(name))
        {
            this.updateVariableValue(name, value);
        }
        else
        {
            this.variablesDef.set(name, value);
            this.addVariableToTable(name, value);
            window[name] = value;
        }
    }

    removeVariable(name)
    {
        this.variablesDef.delete(name);
        this.variables.removeVariable(name);
        window[name] = null;
    }

    updateVariableValue(name, value)
    {
        this.variablesDef.set(name, value);
        this.variables.updateValue(name, value);
        window[name] = value;
    }

    getVariableValue(name)
    {
        return this.variablesDef.get(name);
    }

    addVariableToTable(name, value)
    {
        this.variables.addVariable(name, value);
    }

    draw()
    {

        
        // Background
        push();
        g.myCanvas.draw();
        // Animated elements
        this.graphics.forEach(gfx => gfx.draw());
        pop();

        // Sketches elements
        push();
        g.myCanvas.drawGrid();
        g.myCanvas.drawAxes();
        g.myCanvas.drawPosition();
        pop();


        // Update values
        this.refreshReservedVariables();
    }
}