/**
 * p5Command — base class for all executable statements.
 * 
 * In the new architecture, commands receive data from the AST (not DOM).
 * Each command creates its own DOM element for display + highlight.
 */
class p5Command
{
    constructor(parent)
    {
        this.parent       = parent;     // parent p5CommandList or p5LoopFor
        this.elmt         = null;       // jQuery DOM element (created by render())
        this.waitDuration = 750.0;
    }

    /** Create DOM element inside container. Override in subclasses. */
    render(container)
    {
        // Default: create empty <p>
        this.elmt = $('<p class="command"></p>');
        container.append(this.elmt);
    }

    async execute(controller)
    {
        this.highlight();
        await this.wait(controller);
    }

    wait(controller)
    {
        let duration = controller
            ? controller.scaleDuration(this.waitDuration)
            : this.waitDuration;
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    highlight()
    {
        if (this.elmt)
        {
            this.elmt.addClass("current");
            // Scroll the header line (first child span) into view for block
            // commands (for, if) so we scroll to the declaration, not the
            // full block container.
            let target = this.elmt.children("span").first();
            if (!target.length) target = this.elmt;
            target[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    unhighlight()
    {
        if (this.elmt) this.elmt.removeClass("current");
    }

    draw() {}
}