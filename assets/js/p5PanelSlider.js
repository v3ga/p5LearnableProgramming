/**
 * p5PanelSlider — manages sliding code panels in the sketch column.
 * 
 * The #p5Sketch container clips overflow. Inside, a .panel-track div
 * holds side-by-side panels. translateX() slides between them via anime.js.
 * 
 * Panel 0 = main draw() code.
 * Panels 1..N = illustrated function bodies (created on step-into).
 */
class p5PanelSlider
{
    constructor(sketchContainer)
    {
        this.container = $(sketchContainer);
        this.container.css("overflow", "hidden");

        this.track = $('<div class="panel-track"></div>');
        // Move existing content into the first panel
        let firstPanel = $('<div class="panel panel-0"></div>');
        this.container.children().each(function() {
            firstPanel.append($(this));
        });
        this.container.empty().append(this.track);
        this.track.append(firstPanel);

        this.panels = [firstPanel];
        this.currentIndex = 0;
    }

    /** Get the first (main) panel for rendering draw() into. */
    getMainPanel()
    {
        return this.panels[0];
    }

    /** Create a new panel for an illustrated function, returns the panel jQuery element. */
    createPanel()
    {
        let index = this.panels.length;
        let panel = $(`<div class="panel panel-${index}"></div>`);
        this.track.append(panel);
        this.panels.push(panel);
        return { panel, index };
    }

    /** Remove a panel by index (used when stepping out). */
    removePanel(index)
    {
        if (index > 0 && index < this.panels.length)
        {
            this.panels[index].remove();
            this.panels.splice(index, 1);
        }
    }

    /** Slide to panel at given index with animation. Returns a Promise. */
    async slideTo(index)
    {
        if (index < 0 || index >= this.panels.length) return;
        this.currentIndex = index;
        let offset = -index * 100;

        return new Promise(resolve =>
        {
            anime({
                targets: this.track[0],
                translateX: `${offset}%`,
                duration: 350,
                easing: 'easeInOutCubic',
                complete: resolve
            });
        });
    }

    /** Slide forward to the last panel. */
    async slideForward()
    {
        await this.slideTo(this.panels.length - 1);
    }

    /** Slide back one panel. */
    async slideBack()
    {
        await this.slideTo(this.currentIndex - 1);
    }

    /** Reset: remove all panels except the first, slide to 0. */
    reset()
    {
        while (this.panels.length > 1)
        {
            this.panels.pop().remove();
        }
        this.currentIndex = 0;
        this.track.css("transform", "translateX(0%)");
    }
}
