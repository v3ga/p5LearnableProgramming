/**
 * p5CommandVariableDef — a variable declaration statement (let x = 5;).
 * 
 * Receives name + value from the parser.
 * Renders its own DOM, registers the variable on execute.
 */
class p5CommandVariableDef extends p5Command
{
    constructor(parent, name, value, kind, exprText, displayHtml, embeddedCalls)
    {
        super(parent);
        this.name          = name;
        this.type          = "number";
        this.value         = value;          // static value, or null if expression
        this.kind          = kind || "let";
        this.exprText      = exprText || null;  // expression string for runtime eval
        this.displayHtml   = displayHtml || null;
        this.embeddedCalls = embeddedCalls || null;
        this.elmtValue     = null;
    }

    render(container)
    {
        this.elmt = $('<p class="command"></p>');
        this.elmt.append(`<span class="cm-p5-keyword">${this.kind}</span> `);
        this.elmt.append(`<span class="cm-def" data-name="${this.name}">${this.name}</span> = `);
        if (this.exprText)
        {
            this.elmtValue = $(`<span class="cm-p5-function">${this.displayHtml}</span>`);
        }
        else
        {
            this.elmtValue = $(`<span class="cm-number">${this.value}</span>`);
        }
        this.elmt.append(this.elmtValue);
        this.elmt.append(';');
        container.append(this.elmt);
    }

    async execute(controller)
    {
        if (!controller.runMode) this.highlight();
        await controller.gate();  // step: see declaration highlighted

        // Resolve embedded steppable calls if any
        if (this.embeddedCalls)
        {
            for (let call of this.embeddedCalls)
            {
                let args = call.argTexts.map(t => eval(t));
                let result;
                if (call.isUserFunction)
                    result = await p5UserFunctionRunner.execute(call.funcName, args, controller);
                else if (call.funcName === "random")
                {
                    let fn = window[call.funcName];
                    result = (typeof fn === "function") ? fn(...args) : 0;
                    if (!controller.runMode)
                        await p5FunctionParameter.animateRandom(result, args, controller, this.elmtValue);
                }
                else
                {
                    let fn = window[call.funcName];
                    result = (typeof fn === "function") ? fn(...args) : 0;
                }
                window[`__ec${call.id}`] = result;
            }
        }

        let val = this.value;
        if (this.exprText)
        {
            try { val = eval(this.exprText); } catch(e) { val = 0; }
        }

        // Clean up embedded call placeholders
        if (this.embeddedCalls)
        {
            for (let call of this.embeddedCalls)
                delete window[`__ec${call.id}`];
        }

        g.interpreter.defineVariable(this.name, val);
    }

    copy()
    {
        return { name: this.name, value: this.value, kind: this.kind };
    }
}