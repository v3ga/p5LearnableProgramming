/**
 * p5CommandMethodCall — a method call on an object (e.g. ball.update()).
 * 
 * If the method is in the illustrated functions registry, it will:
 *   1. Highlight the call line
 *   2. Create a new panel with the method body
 *   3. Show arguments + this properties in variables panel
 *   4. Slide to the panel and execute step-by-step
 *   5. Slide back when done
 * 
 * Otherwise, it calls the method directly.
 */
class p5CommandMethodCall extends p5Command
{
    constructor(parent, objectName, methodName, args, argsDisplayParts)
    {
        super(parent);
        this.objectName       = objectName;       // "ball"
        this.methodName       = methodName;        // "update"
        this.args             = args;              // [{exprText, displayHtml}]
        this.argsDisplayParts = argsDisplayParts;  // for rendering
        this.fullName         = `${objectName}.${methodName}`;
    }

    render(container)
    {
        this.elmt = $('<p class="command"></p>');
        this.elmt.append(
            `<span class="cm-def">${this._escapeHtml(this.objectName)}</span>.` +
            `<span class="cm-p5-function">${this._escapeHtml(this.methodName)}</span>(`
        );
        this.args.forEach((arg, i) =>
        {
            if (i > 0) this.elmt.append(",");
            this.elmt.append(`<span>${arg.displayHtml}</span>`);
        });
        this.elmt.append(");");
        container.append(this.elmt);
    }

    async execute(controller)
    {
        this.highlight();
        await controller.gate();  // step 1: see the call highlighted

        // Resolve the object at runtime
        let obj = window[this.objectName];
        if (!obj) { this.unhighlight(); return; }

        // Evaluate arguments
        let argValues = this.args.map(a => {
            try { return eval(a.exprText); } catch(e) { return undefined; }
        });

        // Check if this method is illustrated
        let className = obj.constructor ? obj.constructor.name : null;
        let illustratedKey = className ? `${className}.${this.methodName}` : null;
        let fnDef = illustratedKey ? g.illustratedFunctions[illustratedKey] : null;

        if (fnDef && g.panelSlider && g.callStack)
        {
            await this._executeIllustrated(controller, obj, argValues, fnDef);
        }
        else
        {
            // Direct call — not illustrated
            if (typeof obj[this.methodName] === "function")
            {
                obj[this.methodName].apply(obj, argValues);
            }
        }
    }

    async _executeIllustrated(controller, obj, argValues, fnDef)
    {
        // Build a label for the call stack
        let argStr = argValues.map(v => JSON.stringify(v)).join(", ");
        let callLabel = `${this.objectName}.${this.methodName}(${argStr})`;

        // Create a new panel
        let { panel, index } = g.panelSlider.createPanel();

        // Push call stack
        g.callStack.push(callLabel, index);

        // Show context: this.* properties + params as variables
        let savedVars = new Map();
        let paramNames = fnDef.paramNames || [];

        // Save & set parameter variables
        paramNames.forEach((name, i) =>
        {
            savedVars.set(name, window[name]);
            window[name] = argValues[i];
            g.interpreter.defineVariable(name, argValues[i]);
        });

        // Show this.* properties in variables
        let thisProps = [];
        if (obj)
        {
            for (let key of Object.keys(obj))
            {
                let propName = `this.${key}`;
                thisProps.push(propName);
                g.interpreter.defineVariable(propName, obj[key]);
            }
        }

        // Re-create command list from the stored definition, render into panel
        let bodyCommands = fnDef.createCommands();
        bodyCommands.renderAsFunction(panel, `${this.objectName}.${this.methodName}`);

        // Slide to the new panel
        await g.panelSlider.slideForward();

        // Execute body step-by-step
        try
        {
            await bodyCommands.execute(controller);
        }
        finally
        {
            // Sync this.* back from window to the real object
            if (obj)
            {
                for (let key of Object.keys(obj))
                {
                    let propName = `this.${key}`;
                    let currentVal = g.interpreter.getVariableValue(propName);
                    if (currentVal !== undefined) obj[key] = currentVal;
                    g.interpreter.removeVariable(propName);
                }
            }

            // Restore parameter variables
            paramNames.forEach(name =>
            {
                g.interpreter.removeVariable(name);
                window[name] = savedVars.get(name);
            });

            // Slide back
            await g.panelSlider.slideBack();
            g.panelSlider.removePanel(index);

            // Pop call stack
            g.callStack.pop();
        }
    }

    _escapeHtml(str)
    {
        return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
}
