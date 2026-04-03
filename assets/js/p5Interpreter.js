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
        this._drawRunning = false;
        this._p5Instance = null;
        this._sourceCode = null;

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
        console.log('p5Interpreter.run()')
        try
        {
            // Clear user variables from previous run
            for (let name of this.variablesDef.keys())
            {
                window[name] = undefined;
            }
            this.variablesDef.clear();
            this.variables.userTable.find('tr:not(.empty-slot)').remove();
            this.variables.userVars.clear();
            this.p5State = this._defaultP5State();

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

            if (this.controller.runMode)
            {
                this.startRunMode();
            }

            while(!this.controller.runMode)
            {
                this.reset();
                await this.fnDraw.execute(this.controller);
            }
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

    async draw()
    {

        // In runMode, just blit the instance canvas
        if (this._p5Instance)
        {
            let src = this._p5Instance.canvas || (this._p5Instance._renderer && this._p5Instance._renderer.elt);
            if (src)
            {
                background(255);
                drawingContext.drawImage(src, this.myCanvas.pos.x, this.myCanvas.pos.y, 500,500);
            }
        }
        else 
        {
            push();
            g.myCanvas.beginDraw();
            g.myCanvas.draw();
            this.graphics.forEach(gfx => gfx.draw()); // animated elements
            g.myCanvas.endDraw();
            pop();

        }


        {
            push();
            g.myCanvas.drawGrid();
            g.myCanvas.drawAxes();
            if (this.controller && !this.controller.runMode)
                g.myCanvas.drawPosition();
            pop();

        }


        // Update values
        this.refreshReservedVariables();
    }

    startRunMode()
    {
        this.stopRunMode();
        let code = this._sourceCode;
        let drawW = this.myCanvas.dim.x;
        let drawH = this.myCanvas.dim.y;
        let self = this;

        this._p5Instance = new p5(function(p)
        {
            // Evaluate the user code in the instance context
            // Extract setup and draw via Function constructor
            let fn = new Function("p",
                "with(p){" + code + ";"
                + "if(typeof setup==='function') p._setupFn=setup;"
                + "if(typeof draw==='function') p._drawFn=draw;"
                + "}"
            );
            fn(p);

            p.setup = function()
            {
                p.createCanvas(drawW, drawH);
                if (p._setupFn) p._setupFn.call(p);
            };

            if (p._drawFn)
            {
                p.draw = function() { p._drawFn.call(p); };
            }
        });

        // Hide the instance's own canvas — we blit it onto the main canvas
        if (this._p5Instance.canvas)
            this._p5Instance.canvas.style.display = "none";
    }

    stopRunMode()
    {
        if (this._p5Instance)
        {
            this._p5Instance.remove();
            this._p5Instance = null;
            console.log(`removing p5 instance`)
        }
    }
}