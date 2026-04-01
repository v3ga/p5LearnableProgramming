/**
 * p5CallStack — visual breadcrumb showing the current call stack.
 * 
 * Displays entries like: draw() › ball.update(3, 2)
 * Each entry is clickable (future: navigate panels).
 */
class p5CallStack
{
    constructor(containerSelector)
    {
        this.container = $(containerSelector);
        this.stack = [];  // [{label, panelIndex}]
        this._render();
    }

    push(label, panelIndex)
    {
        this.stack.push({ label, panelIndex });
        this._render();
    }

    pop()
    {
        this.stack.pop();
        this._render();
    }

    clear()
    {
        this.stack = [];
        this._render();
    }

    depth()
    {
        return this.stack.length;
    }

    _render()
    {
        this.container.empty();
        if (this.stack.length === 0)
        {
            this.container.append('<span class="stack-placeholder">—</span>');
            return;
        }
        this.stack.forEach((entry, i) =>
        {
            if (i > 0)
                this.container.append('<span class="stack-separator"> › </span>');

            let cls = (i === this.stack.length - 1) ? "stack-entry active" : "stack-entry";
            this.container.append(
                `<span class="${cls}" data-index="${entry.panelIndex}">${this._escapeHtml(entry.label)}</span>`
            );
        });
    }

    _escapeHtml(str)
    {
        return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
}
