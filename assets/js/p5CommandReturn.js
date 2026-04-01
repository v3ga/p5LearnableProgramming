/**
 * p5CommandReturn — a return statement inside a user function.
 * 
 * Evaluates the return expression and throws p5ReturnValue
 * to unwind the call stack back to the caller.
 */
class p5CommandReturn extends p5Command
{
    constructor(parent, exprText, displayHtml, embeddedCalls)
    {
        super(parent);
        this.exprText      = exprText;
        this.displayHtml   = displayHtml;
        this.embeddedCalls = embeddedCalls;
    }

    render(container)
    {
        this.elmt = $('<p class="command"></p>');
        this.elmt.append('<span class="cm-p5-keyword">return</span>');
        if (this.displayHtml)
        {
            this.elmt.append(' ');
            this.elmtExpr = $(`<span class="return-expr">${this.displayHtml}</span>`);
            this.elmt.append(this.elmtExpr);
        }
        this.elmt.append(';');

        // Mark for showing the evaluated return value
        this.mark_value = $('<div class="mark mark-value"></div>');
        $("body").append(this.mark_value);

        container.append(this.elmt);
    }

    async execute(controller)
    {
        this.highlight();
        await controller.gate();

        // Resolve embedded calls if any
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
                    await p5FunctionParameter.animateRandom(result, args, controller, this.elmtExpr);
                }
                else
                {
                    let fn = window[call.funcName];
                    result = (typeof fn === "function") ? fn(...args) : 0;
                }
                window[`__ec${call.id}`] = result;
            }
        }

        let val = undefined;
        if (this.exprText)
        {
            try { val = eval(this.exprText); } catch(e) { val = 0; }
        }

        // Show the evaluated value next to the expression
        if (this.elmtExpr && val !== undefined)
        {
            // Ensure return line is visible before showing mark
            if (this.elmt && this.elmt[0])
                this.elmt[0].scrollIntoView({ behavior: "smooth", block: "nearest" });

            this.elmtExpr.addClass("highlight");
            let formattedVal = (typeof val === "number" && Number.isFinite(val))
                ? Number(val.toFixed(3)).toString()
                : String(val);
            this.mark_value.text(formattedVal);
            this.mark_value.show().offset({
                left : this.elmtExpr.offset().left,
                top  : this.elmtExpr.offset().top + 25
            });
            await controller.gate();  // let user see the return value
            this.mark_value.hide();
            this.elmtExpr.removeClass("highlight");
        }

        // Clean up embedded call placeholders
        if (this.embeddedCalls)
        {
            for (let call of this.embeddedCalls)
                delete window[`__ec${call.id}`];
        }

        this.unhighlight();
        throw new p5ReturnValue(val);
    }
}
