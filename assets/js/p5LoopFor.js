/**
 * p5LoopFor — a for-loop statement.
 * 
 * Receives loop data from the parser, renders its own DOM,
 * executes with async/await and loop strategy from controller.
 */
class p5LoopFor extends p5Command
{
    constructor(parent, data)
    {
        super(parent);
        this.varName    = data.varName;
        this.varKind    = data.varKind || "let";
        this.initVal    = data.initVal;
        this.nbLoopMax  = data.nbLoopMax;
        this.updateText = data.updateText;

        this.commandList = new p5CommandList(this);

        this.durationUpdateCheck     = 500;
        this.durationUpdateCondition = 500;
        this.variableValue           = this.initVal;

        this.loopId = "loop-" + (++p5LoopFor._counter);

        // DOM references (set in render)
        this.elmtNbLoop   = null;
        this.elmtUpdate   = null;
        this.mark_ok      = null;
        this.mark_no      = null;
        this.update_check = null;
    }

    render(container)
    {
        this.elmt = $(`<p class="command loop-for" id="${this.loopId}"></p>`);

        let loopSpan = $('<span class="cm-p5-loop"></span>');
        loopSpan.append(`<span class="cm-p5-keyword">for</span>(`);

        let varDef = $('<span class="var-def"></span>');
        varDef.append(`<span class="cm-p5-keyword">${this.varKind}</span> `);
        varDef.append(`<span class="cm-def" data-name="${this._escapeAttr(this.varName)}">${this._escapeHtml(this.varName)}</span>`);
        varDef.append(`=<span class="cm-number">${this._escapeHtml(String(this.initVal))}</span>`);
        loopSpan.append(varDef);

        loopSpan.append("; ");
        loopSpan.append(`${this._escapeHtml(this.varName)}&lt;`);
        this.elmtNbLoop = $(`<span class="cm-number nb-loop">${this._escapeHtml(String(this.nbLoopMax))}</span>`);
        loopSpan.append(this.elmtNbLoop);
        loopSpan.append("; ");

        this.elmtUpdate = $(`<span class="update">${this._escapeHtml(this.updateText)}</span>`);
        loopSpan.append(this.elmtUpdate);
        loopSpan.append(")");

        this.elmt.append(loopSpan);

        let blockDiv = $(`<div class="command block" data-parent="${this.loopId}"></div>`);
        blockDiv.append('<p class="block-start">{</p>');
        this.commandList.render(blockDiv);
        blockDiv.append('<p class="block-end">}</p>');
        this.elmt.append(blockDiv);

        container.append(this.elmt);

        // Create overlay marks
        this.mark_ok      = $('<div class="mark mark-ok">👌</div>');
        this.mark_no      = $('<div class="mark mark-no">👎</div>');
        this.update_check = $('<div class="update_check"></div>');
        $("body").append(this.mark_ok).append(this.mark_no).append(this.update_check);
    }

    async execute(controller)
    {
        if (!controller.runMode) this.highlight();

        // Step 1: init variable
        this.variableValue = this.initVal;
        g.interpreter.defineVariable(this.varName, this.initVal);
        window[this.varName] = this.initVal;
        await controller.gate();  // see for-loop highlighted + var init

        // Loop
        let iteration = 0;
        while (true)
        {
            let behavior = controller.getLoopBehavior(iteration, this.nbLoopMax - this.initVal);
            controller.currentBehavior = behavior;

            if (behavior.mode === "skip" && iteration > 0)
            {
                while (this.variableValue < this.nbLoopMax)
                {
                    this.variableValue++;
                    window[this.varName] = this.variableValue;
                }
                g.interpreter.updateVariableValue(this.varName, this.variableValue);
                break;
            }

            // Step N: eval condition
            let condOk = this.variableValue < this.nbLoopMax;
            if (!controller.runMode)
            {
                await this.animateCondition(condOk, controller);
                await controller.gate();
            }

            if (!condOk) break;

            // Step N+1..M: run body commands (each has its own gates)
            if (!controller.runMode) this.unhighlight();
            await this.commandList.executeCommands(controller);
            if (!controller.runMode) this.highlight();

            // Step M+1: eval update (i++)
            if (!controller.runMode)
            {
                await this.evalUpdate(controller);
                await controller.gate();
            }
            else
            {
                this.variableValue++;
                window[this.varName] = this.variableValue;
                g.interpreter.updateVariableValue(this.varName, this.variableValue);
            }

            iteration++;
        }

        g.interpreter.removeVariable(this.varName);
        controller.currentBehavior = { mode: "detail", speed: 1.0 };
    }

    async animateCondition(ok, controller)
    {
        let mark     = ok ? this.mark_ok : this.mark_no;
        let duration = controller.scaleDuration(this.durationUpdateCondition);

        anime({
            targets    : mark.get(),
            scale      : [1, 1.05],
            opacity    : [0.0, 1.0],
            translateY : '-0px',
            duration   : duration,
            begin      : () => mark.show().offset({
                left : this.elmtNbLoop.offset().left - 15,
                top  : this.elmtNbLoop.offset().top - 30
            }),
            complete   : () => { mark.fadeOut("fast"); this.update_check.fadeOut("fast"); }
        });

        await new Promise(resolve =>
            setTimeout(resolve, controller.scaleDuration(this.waitDuration))
        );
    }

    async evalUpdate(controller)
    {
        // Increment variable (i++ pattern)
        this.variableValue++;
        window[this.varName] = this.variableValue;

        this.update_check
            .hide()
            .css({
                left : this.elmtUpdate.offset().left,
                top  : this.elmtUpdate.offset().top - 30
            })
            .html(`${this.varName}=<span class="cm-number">${this.variableValue}</span>`);

        let duration = controller.scaleDuration(this.durationUpdateCheck);
        anime({
            targets : ".update_check",
            opacity : [0.0, 1.0],
            scale   : [1, 1.05],
            duration : duration,
            begin   : () => this.update_check.show()
        });

        g.interpreter.updateVariableValue(this.varName, this.variableValue);

        await new Promise(resolve =>
            setTimeout(resolve, controller.scaleDuration(2000))
        );
    }

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    _escapeAttr(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}

p5LoopFor._counter = 0;