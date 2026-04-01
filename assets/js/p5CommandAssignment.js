/**
 * p5CommandAssignment — an assignment statement (x = x + 50;).
 *
 * Evaluates the right-hand side and updates the variable.
 * Steps: (1) highlight line, (2) evaluate + update variable display.
 */
class p5CommandAssignment extends p5Command
{
    constructor(parent, varName, operator, exprText)
    {
        super(parent);
        this.varName  = varName;    // "x"
        this.operator = operator;   // "=", "+=", etc.
        this.exprText = exprText;   // "x + 50" or "50" (right-hand side)
    }

    render(container)
    {
        this.elmt = $('<p class="command"></p>');
        this.elmt.append(`<span class="cm-variable">${this._escapeHtml(this.varName)}</span>`);
        this.elmt.append(` ${this._escapeHtml(this.operator)} `);
        this.elmt.append(`<span class="cm-expression">${this._escapeHtml(this.exprText)}</span>;`);
        container.append(this.elmt);
    }

    async execute(controller)
    {
        this.highlight();
        await controller.gate();  // step: see assignment highlighted

        // Resolve this.* references for evaluation
        let resolvedExpr = this._resolveThisRefs(this.exprText);
        let resolvedVar  = this._resolveThisRefs(this.varName);

        let newValue;
        try
        {
            if (this.operator === "=")
                newValue = eval(resolvedExpr);
            else if (this.operator === "+=")
                newValue = eval(resolvedVar) + eval(resolvedExpr);
            else if (this.operator === "-=")
                newValue = eval(resolvedVar) - eval(resolvedExpr);
            else if (this.operator === "*=")
                newValue = eval(resolvedVar) * eval(resolvedExpr);
            else if (this.operator === "/=")
                newValue = eval(resolvedVar) / eval(resolvedExpr);
            else
                newValue = eval(`${resolvedVar} ${this.operator} ${resolvedExpr}`);
        }
        catch (e) { newValue = 0; }

        // Store with the original name (this.x or plain x)
        window[this.varName] = newValue;
        g.interpreter.updateVariableValue(this.varName, newValue);
    }

    /**
     * Replace this.prop references with window["this.prop"] so eval() works
     * when "this.prop" is stored as a flat variable name on window.
     */
    _resolveThisRefs(expr)
    {
        return expr.replace(/this\.(\w+)/g, 'window["this.$1"]');
    }

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}
