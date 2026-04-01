/**
 * p5ReturnValue — sentinel thrown by return statements
 * to propagate a return value up the call stack.
 */
class p5ReturnValue
{
    constructor(value) { this.value = value; }
}

/**
 * p5UserFunctionRunner — shared utility for executing user-defined functions.
 * 
 * Used by:
 *  - p5CommandFunctionCall (top-level user function calls)
 *  - p5FunctionParameter (embedded calls in expressions)
 *  - p5CommandVariableDef (embedded calls in variable init)
 */
const p5UserFunctionRunner = {

    async execute(funcName, argValues, controller)
    {
        // Check for user-defined function
        if (g.userFunctions && g.userFunctions[funcName])
            return await this._runUserFunction(funcName, argValues, controller);

        // Fallback: call as global function (e.g. random, int, floor...)
        let fn = window[funcName];
        if (typeof fn === "function") return fn(...argValues);
        return 0;
    },

    async _runUserFunction(funcName, argValues, controller)
    {
        let fnDef = g.userFunctions[funcName];

        // Push call stack
        let argStr = argValues.map(v => JSON.stringify(v)).join(", ");
        let callLabel = `${funcName}(${argStr})`;
        if (g.callStack) g.callStack.push(callLabel, 0);

        // Scroll into view
        let fnElmt = fnDef.commands.elmt;
        if (fnElmt && fnElmt[0])
            fnElmt[0].scrollIntoView({ behavior: "smooth", block: "nearest" });

        // Dim outer scope variables
        let dimmedVars = null;
        if (g.interpreter && g.interpreter.variables)
            dimmedVars = g.interpreter.variables.dimUserVariables();

        // Track variables defined before entering to detect locals
        let varsBefore = new Set(g.interpreter.variablesDef.keys());

        // Save & set parameter variables
        let savedVars = new Map();
        let paramNames = fnDef.paramNames || [];
        paramNames.forEach((name, i) =>
        {
            savedVars.set(name, window[name]);
            window[name] = argValues[i];
            g.interpreter.defineVariable(name, argValues[i]);
        });

        let returnValue = undefined;
        try
        {
            await fnDef.commands.execute(controller);
        }
        catch (e)
        {
            if (e instanceof p5ReturnValue)
                returnValue = e.value;
            else
                throw e;
        }
        finally
        {
            // Remove local variables created inside the function
            let varsAfter = new Set(g.interpreter.variablesDef.keys());
            for (let name of varsAfter)
            {
                if (!varsBefore.has(name))
                {
                    g.interpreter.removeVariable(name);
                    delete window[name];
                }
            }

            // Restore parameter variables
            paramNames.forEach(name =>
            {
                g.interpreter.removeVariable(name);
                window[name] = savedVars.get(name);
            });
            if (g.callStack) g.callStack.pop();

            // Undim outer scope variables
            if (dimmedVars && g.interpreter && g.interpreter.variables)
                g.interpreter.variables.undimUserVariables(dimmedVars);
        }

        if (g.interpreter)
            g.interpreter.refreshReservedVariables();

        return returnValue;
    }
};
