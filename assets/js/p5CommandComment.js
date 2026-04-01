/**
 * p5CommandComment — displays a comment line in the code view.
 * 
 * Comments are non-executable; they render but do nothing on execute.
 */
class p5CommandComment extends p5Command
{
    constructor(parent, text, isBlock)
    {
        super(parent);
        this.text    = text;
        this.isBlock = isBlock;
    }

    render(container)
    {
        let html = this.isBlock
            ? `/*${this._escapeHtml(this.text)}*/`
            : `//${this._escapeHtml(this.text)}`;

        this.elmt = $(`<p class="command comment">${html}</p>`);
        container.append(this.elmt);
    }

    async execute(controller)
    {
        // Comments are not executed — skip silently
    }

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}
