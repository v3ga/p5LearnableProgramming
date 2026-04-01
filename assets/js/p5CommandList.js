/**
 * p5CommandList — ordered list of commands (function body, loop body).
 * 
 * Uses async/await for sequential execution with ExecutionController gates.
 */
class p5CommandList extends p5Command
{
    constructor(parent)
    {
        super(parent);
        this.commands = [];
    }

    addCommand(cmd)
    {
        this.commands.push(cmd);
    }

    render(container)
    {
        this.elmt = container;
        this.commands.forEach(cmd => cmd.render(container));
    }

    renderAsFunction(container, funcName, paramNames)
    {
        let paramsStr = paramNames ? paramNames.join(", ") : "";
        let wrapper = $(`<div class="function" id="fn-${funcName}"></div>`);
        wrapper.append(
            `<span class="cm-p5-keyword">function</span> ` +
            `<span class="cm-p5-function">${funcName}</span>(${paramsStr}){\n`
        );
        this.commands.forEach(cmd => cmd.render(wrapper));
        wrapper.append("}\n");
        container.append(wrapper);
        this.elmt = wrapper;
    }

    async executeCommands(controller)
    {
        for (let cmd of this.commands)
        {
            await cmd.execute(controller);
            await cmd.wait(controller);
            cmd.unhighlight();
        }
    }

    async execute(controller)
    {
        await this.executeCommands(controller);
    }
}