/**
 * p5CommandFunctionCall — a p5 function call statement.
 * 
 * Receives function name + parameter objects from the parser.
 * Renders its own DOM, uses the registry to create graphics.
 */
class p5CommandFunctionCall extends p5Command
{
    constructor(parent, name, params)
    {
        super(parent);
        this.name       = name;
        this.parameters = params;   // array of p5FunctionParameter
        this.gfx        = null;
    }

    render(container)
    {
        this.elmt = $('<p class="command"></p>');
        this.elmt.append(`<span class="cm-p5-function">${this._escapeHtml(this.name)}</span>(`);

        this.parameters.forEach((param, i) =>
        {
            if (i > 0) this.elmt.append(",");
            param.render(this.elmt);
        });

        this.elmt.append(");");
        container.append(this.elmt);
    }

    async execute(controller)
    {
        this.highlight();
        await controller.gate();  // step 1: see highlighted line

        // Resolve embedded steppable calls in parameters (random, user functions)
        for (let param of this.parameters)
        {
            if (param.embeddedCalls)
                await param.resolveAndCache(controller);
        }

        // createCanvas is managed by p5Interpreter: reveal canvas and sync size.
        if (this.name === "createCanvas" && g.interpreter)
        {
            let args = this.parameters.map(p => p.getValue());
            if (args.length >= 2)
                g.interpreter.applyUserCanvasSize(Number(args[0]), Number(args[1]));
            g.interpreter.showCanvas();
            g.interpreter.refreshReservedVariables();
            return;
        }

        let args = this.parameters.map(p => p.getValue());

        // User-defined function: step into the function body
        if (this.isUserFunction && g.userFunctions && g.userFunctions[this.name])
        {
            await p5UserFunctionRunner.execute(this.name, args, controller);
            return;
        }

        if (g.interpreter)
            g.interpreter.updateP5StateFromCall(this.name, args);

        let def = p5Reg.get(this.name);
        if (def && def.createGraphic)
        {
            this.gfx = def.createGraphic(this);
            g.interpreter.graphics.push(this.gfx);
            await this.gfx.beginAnimation();
        }
        else
        {
            // Unregistered function: execute it directly if it exists as a global
            let fn = window[this.name];
            if (typeof fn === "function")
            {
                fn.apply(null, args);
            }
        }

        if (g.interpreter)
            g.interpreter.refreshReservedVariables();
    }

    getParameter(name)
    {
        for (let i = 0; i < this.parameters.length; i++)
            if (this.parameters[i].name === name) return this.parameters[i];
        return null;
    }

    getParameterValue(name)
    {
        let param = this.getParameter(name);
        return param ? param.getValue() : 0;
    }

    getParameterValues()
    {
        return this.parameters.map(p => p.getValue());
    }

    highlightParameters(paramNames)
    {
        paramNames.forEach(name =>
        {
            let param = this.getParameter(name);
            if (param) param.highlight();
        });
    }

    unhighlightParameters(paramNames)
    {
        paramNames.forEach(name =>
        {
            let param = this.getParameter(name);
            if (param) param.unhighlight();
        });
    }

    unhighlight()
    {
        super.unhighlight();
        this.unhighlightParameters(this.parameters.map(p => p.name));
        this.parameters.forEach(p => p.clearCache());
    }

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}