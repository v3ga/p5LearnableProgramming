/**
 * p5WhileLoop — a while-loop statement.
 *
 * Steps per iteration:
 *   1. Highlight while line
 *   2. Evaluate condition → 👌 or 👎
 *   3. Execute body commands (each has its own steps)
 *   4. Back to 1
 */
class p5WhileLoop extends p5Command
{
    constructor(parent, data)
    {
        super(parent);
        this.conditionText = data.conditionText;  // "x < 500"
        this.conditionNode = data.conditionNode;  // AST node

        this.commandList = new p5CommandList(this);

        this.durationCondition = 500;
        this.loopId = "while-" + (++p5WhileLoop._counter);

        // Safety: max iterations to prevent infinite loops
        this.maxIterations = 1000;

        // DOM (set in render)
        this.elmtCondition = null;
        this.mark_ok       = null;
        this.mark_no       = null;
    }

    render(container)
    {
        this.elmt = $(`<p class="command while-loop" id="${this.loopId}"></p>`);

        let loopSpan = $('<span class="cm-p5-loop"></span>');
        loopSpan.append('<span class="cm-p5-keyword">while</span>(');
        this.elmtCondition = $(`<span class="cm-p5-condition">${this._escapeHtml(this.conditionText)}</span>`);
        loopSpan.append(this.elmtCondition);
        loopSpan.append(')');
        this.elmt.append(loopSpan);

        let blockDiv = $(`<div class="command block" data-parent="${this.loopId}"></div>`);
        blockDiv.append('<p class="block-start">{</p>');
        this.commandList.render(blockDiv);
        blockDiv.append('<p class="block-end">}</p>');
        this.elmt.append(blockDiv);

        container.append(this.elmt);

        // Overlay marks
        this.mark_ok = $('<div class="mark mark-ok">👌</div>');
        this.mark_no = $('<div class="mark mark-no">👎</div>');
        $("body").append(this.mark_ok).append(this.mark_no);
    }

    async execute(controller)
    {
        if (!controller.runMode) this.highlight();
        await controller.gate();  // step 1: see while highlighted

        let iteration = 0;
        while (iteration < this.maxIterations)
        {
            let behavior = controller.getLoopBehavior(iteration, this.maxIterations);
            controller.currentBehavior = behavior;

            if (behavior.mode === "skip" && iteration > 0)
                break;

            // Eval condition
            let condOk = this._evalCondition();
            if (!controller.runMode)
            {
                await this._animateCondition(condOk, controller);
                await controller.gate();  // step: see condition result
            }

            if (!condOk) break;

            // Run body
            if (!controller.runMode) this.unhighlight();
            await this.commandList.executeCommands(controller);
            if (!controller.runMode) this.highlight();

            iteration++;
        }

        controller.currentBehavior = { mode: "detail", speed: 1.0 };
    }

    _evalCondition()
    {
        try { return !!eval(this.conditionText); }
        catch (e) { return false; }
    }

    async _animateCondition(ok, controller)
    {
        let mark     = ok ? this.mark_ok : this.mark_no;
        let duration = controller.scaleDuration(this.durationCondition);

        anime({
            targets    : mark.get(),
            scale      : [1, 1.25],
            opacity    : [0.0, 1.0],
            translateY : '-0px',
            duration   : duration,
            begin      : () => mark.show().offset({
                left : this.elmtCondition.offset().left + this.elmtCondition.width() + 5,
                top  : this.elmtCondition.offset().top - 25
            }),
            complete   : () => mark.fadeOut("fast")
        });

        await new Promise(resolve =>
            setTimeout(resolve, controller.scaleDuration(this.waitDuration))
        );
    }

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}

p5WhileLoop._counter = 0;
