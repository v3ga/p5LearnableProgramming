/**
 * p5FunctionParameter — represents a single argument to a p5 function call.
 * 
 * Receives pre-computed data from the parser (AST-based),
 * renders its own DOM element, evaluates at runtime.
 */
class p5FunctionParameter
{
    constructor(command, name, data)
    {
        this.command       = command;
        this.name          = name;
        this.index         = 0;  // set by p5CommandFunctionCall after construction
        this.type          = data.isVariable ? "variable" : "number";
        this.exprText      = data.exprText;
        this.displayHtml   = data.displayHtml;
        this.value         = data.isVariable ? null : parseFloat(data.exprText);
        this.embeddedCalls = data.embeddedCalls || null;
        this.elmt          = null;
        this.mark_value    = null;
    }

    render(container)
    {
        let dataName = this.name ? ` data-name="${this.name}"` : "";
        let cssClass = this.type === "variable" ? "cm-variable" : "cm-number";
        this.elmt = $(`<span class="param ${cssClass}"${dataName}>${this.displayHtml}</span>`);
        container.append(this.elmt);

        if (this.type === "variable")
        {
            this.mark_value = $('<div class="mark mark-value"></div>');
            $("body").append(this.mark_value);
        }
    }

    getValue()
    {
        if (this._cachedValue !== undefined) return this._cachedValue;
        if (this.type === "number")
        {
            if (isNaN(this.value)) return eval(this._resolveThisRefs(this.exprText));
            return this.value;
        }
        return eval(this._resolveThisRefs(this.exprText));
    }

    /**
     * Evaluate and cache the value. Subsequent getValue() calls
     * return the same result until clearCache() is called.
     */
    evaluate()
    {
        this._cachedValue = undefined;  // force fresh eval
        this._cachedValue = this.getValue();
        return this._cachedValue;
    }

    clearCache()
    {
        this._cachedValue = undefined;
        // Clean up embedded call placeholder variables
        if (this.embeddedCalls)
        {
            for (let call of this.embeddedCalls)
                delete window[`__ec${call.id}`];
        }
    }

    /**
     * Resolve embedded steppable calls (random, user functions) in this
     * parameter's expression. Sets window.__ecN for each, then caches
     * the final evaluated value. Must be awaited before getValue().
     */
    async resolveAndCache(controller)
    {
        for (let call of this.embeddedCalls)
        {
            let args = call.argTexts.map(t => eval(this._resolveThisRefs(t)));
            let result;
            if (call.isUserFunction)
            {
                result = await p5UserFunctionRunner.execute(call.funcName, args, controller);
            }
            else if (call.funcName === "random")
            {
                // Call the real random function
                let fn = window[call.funcName];
                result = (typeof fn === "function") ? fn(...args) : 0;

                // Animate the random value selection
                if (!controller.runMode)
                    await this._animateRandom(result, args, controller);
            }
            else
            {
                let fn = window[call.funcName];
                result = (typeof fn === "function") ? fn(...args) : 0;
            }
            window[`__ec${call.id}`] = result;
        }
        // Cache the final value (expression with __ecN placeholders)
        this.evaluate();
    }

    /**
     * Animate a random() call: show a ticker of random values that
     * converges on the final chosen value, displayed under the
     * random() span in the code.
     * Can also be called statically for any anchor element.
     */
    async _animateRandom(finalValue, args, controller)
    {
        return p5FunctionParameter.animateRandom(finalValue, args, controller, this.elmt);
    }

    /**
     * Static version: animate a random() call on any anchor element.
     */
    static async animateRandom(finalValue, args, controller, anchorElmt)
    {
        // Find the random() span in the anchor's DOM
        let randomSpan = anchorElmt
            ? anchorElmt.find('.cm-p5-function').filter(function() {
                return $(this).text() === "random";
              }).first()
            : null;

        let anchor = randomSpan && randomSpan.length ? randomSpan : anchorElmt;
        if (!anchor || !anchor.length) return;

        // Highlight the random() part
        if (randomSpan && randomSpan.length)
            randomSpan.addClass("highlight");

        // Create a temporary mark with dice emoji
        let mark = $('<div class="mark mark-random">🎲</div>');
        $("body").append(mark);
        mark.show().offset({
            left : anchor.offset().left,
            top  : anchor.offset().top + 25
        });

        // Shake the dice for ~1 second
        mark.addClass("mark-random-shake");
        await new Promise(r => setTimeout(r, controller.scaleDuration(1000)));
        mark.removeClass("mark-random-shake");

        // Show the final value
        let formattedFinal = Number.isInteger(finalValue)
            ? finalValue
            : Number(finalValue.toFixed(2));
        mark.text(formattedFinal);
        mark.addClass("mark-random-final");
        mark.offset({
            left : anchor.offset().left,
            top  : anchor.offset().top + 25
        });

        // Wait for user to see the result
        await controller.gate();

        // Clean up
        mark.remove();
        if (randomSpan && randomSpan.length)
            randomSpan.removeClass("highlight");
    }

    _resolveThisRefs(expr)
    {
        return expr.replace(/this\.(\w+)/g, 'window["this.$1"]');
    }

    /**
     * Compute the vertical offset for the mark based on param index.
     * Even indices: below (+25), odd indices: above (-18).
     */
    _markTopOffset()
    {
        return (this.index % 2 === 0) ? 25 : -25;
    }

    highlight()
    {
        if (this.elmt) this.elmt.addClass("highlight");
        if (this.mark_value)
        {
            this.mark_value.text(this.evaluate());
            this.mark_value.show().offset({
                left : this.elmt.offset().left,
                top  : this.elmt.offset().top + this._markTopOffset()
            });
        }
    }

    unhighlight()
    {
        if (this.elmt) this.elmt.removeClass("highlight");
        if (this.mark_value) this.mark_value.hide();
    }
}