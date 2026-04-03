/**
 * p5IfElse — an if / else-if / else statement chain.
 *
 * Supports N branches:  if (...) { } else if (...) { } ... else { }
 *
 * Steps per iteration:
 *   1. Highlight the branch line
 *   2. Evaluate condition → 👌 or 👎
 *   3. Execute the first matching branch
 */
class p5IfElse extends p5Command
{
    /**
     * @param parent
     * @param branches  Array of { conditionText, conditionNode, commands }
     *                  Last entry may have conditionText===null → pure else.
     */
    constructor(parent, branches)
    {
        super(parent);
        this.branches = branches;

        this.durationCondition = 500;
        this.branchId = "if-" + (++p5IfElse._counter);

        // DOM refs filled in render()
        this.elmtConditions = [];  // one per branch (null for pure else)
        this.mark_ok = null;
        this.mark_no = null;
    }

    render(container)
    {
        this.elmt = $(`<p class="command if-else" id="${this.branchId}"></p>`);

        this.branches.forEach((branch, idx) =>
        {
            let isFirst = (idx === 0);
            let isElse  = (branch.conditionText === null);

            // ── keyword label ──
            let labelSpan = $('<span class="cm-p5-branch"></span>');
            if (isFirst)
            {
                labelSpan.append('<span class="cm-p5-keyword">if</span>(');
                let condSpan = $(`<span class="cm-p5-condition">${this._escapeHtml(branch.conditionText)}</span>`);
                labelSpan.append(condSpan);
                labelSpan.append(')');
                this.elmtConditions.push(condSpan);
            }
            else if (!isElse)
            {
                labelSpan.append('<span class="cm-p5-keyword">else if</span>(');
                let condSpan = $(`<span class="cm-p5-condition">${this._escapeHtml(branch.conditionText)}</span>`);
                labelSpan.append(condSpan);
                labelSpan.append(')');
                this.elmtConditions.push(condSpan);
            }
            else
            {
                labelSpan.append('<span class="cm-p5-keyword">else</span>');
                this.elmtConditions.push(null);
            }
            this.elmt.append(labelSpan);

            // ── block body ──
            let blockDiv = $(`<div class="command block" data-parent="${this.branchId}-${idx}"></div>`);
            blockDiv.append('<p class="block-start">{</p>');
            branch.commands.render(blockDiv);
            blockDiv.append('<p class="block-end">}</p>');
            this.elmt.append(blockDiv);
        });

        container.append(this.elmt);

        // Overlay marks
        this.mark_ok = $('<div class="mark mark-ok">👌</div>');
        this.mark_no = $('<div class="mark mark-no">👎</div>');
        $("body").append(this.mark_ok).append(this.mark_no);
    }

    async execute(controller)
    {
        for (let i = 0; i < this.branches.length; i++)
        {
            let branch = this.branches[i];
            let isElse = (branch.conditionText === null);

            if (!controller.runMode) this.highlight();
            await controller.gate();

            if (isElse)
            {
                // Pure else — always runs if we reach it
                if (!controller.runMode) this.unhighlight();
                await branch.commands.executeCommands(controller);
                if (!controller.runMode) this.highlight();
                return;
            }

            let condOk = this._evalCondition(branch.conditionText);
            if (!controller.runMode)
            {
                await this._animateCondition(condOk, controller, this.elmtConditions[i]);
                await controller.gate();
            }

            if (condOk)
            {
                if (!controller.runMode) this.unhighlight();
                await branch.commands.executeCommands(controller);
                if (!controller.runMode) this.highlight();
                return;
            }

            // Condition false → move to next branch
            if (!controller.runMode) this.unhighlight();
        }
    }

    _evalCondition(condText)
    {
        let resolved = condText.replace(/this\.(\w+)/g, 'window["this.$1"]');
        try { return !!eval(resolved); }
        catch (e) { return false; }
    }

    async _animateCondition(ok, controller, condElmt)
    {
        let mark     = ok ? this.mark_ok : this.mark_no;
        let duration = controller.scaleDuration(this.durationCondition);

        if (condElmt && condElmt.length)
        {
            anime({
                targets    : mark.get(),
                scale      : [1, 1.25],
                opacity    : [0.0, 1.0],
                translateY : '-0px',
                duration   : duration,
                begin      : () => mark.show().offset({
                    left : condElmt.offset().left + condElmt.width() + 5,
                    top  : condElmt.offset().top - 25
                }),
                complete   : () => mark.fadeOut("fast")
            });
        }

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

p5IfElse._counter = 0;
