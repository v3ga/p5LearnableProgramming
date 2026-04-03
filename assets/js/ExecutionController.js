/**
 * ExecutionController — controls playback of the step-by-step execution.
 * 
 * Features:
 *   - play / pause / step
 *   - speed multiplier
 *   - loop strategy (detail N first iterations, then rush/skip/accelerate)
 *   - abort (for reset / code change)
 */

class ExecutionController
{
    constructor()
    {
        this.paused     = false;
        this.speed      = 1.0;
        this.runMode    = false;
        this._resolve   = null;
        this._stepMode  = false;
        this._aborted   = false;
        this._activeTimeline = null;

        this.loopStrategy = {
            detailSteps : 3,
            thenMode    : "rush"    // "rush" | "skip" | "accelerate"
        };

        // Current behavior — set by the loop before executing its body
        this.currentBehavior = { mode: "detail", speed: 1.0 };
    }

    // ── Playback controls ──────────────────────────────────────────

    play()
    {
        this.paused = false;
        this._stepMode = false;
        if (this._activeTimeline) this._activeTimeline.play();
        if (this._resolve) { this._resolve(); this._resolve = null; }
    }

    pause()
    {
        this.paused = true;
        if (this._activeTimeline) this._activeTimeline.pause();
    }

    step()
    {
        this._stepMode = true;
        this.paused = false;
        if (this._activeTimeline) this._activeTimeline.play();
        if (this._resolve) { this._resolve(); this._resolve = null; }
    }

    abort()
    {
        this._aborted = true;
        // Finish any running animation immediately
        if (this._activeTimeline)
        {
            this._activeTimeline.seek(this._activeTimeline.duration);
            this._activeTimeline = null;
        }
        // Unblock any pending gate
        if (this._resolve) { this._resolve(); this._resolve = null; }
    }

    isAborted()
    {
        return this._aborted;
    }

    reset()
    {
        this._aborted   = false;
        this.paused     = false;
        this.runMode    = false;
        this._stepMode  = false;
        this._resolve   = null;
        this._activeTimeline = null;
        this.currentBehavior = { mode: "detail", speed: 1.0 };
    }

    // ── Active timeline tracking ───────────────────────────────────

    registerTimeline(timeline)
    {
        this._activeTimeline = timeline;
        if (this.paused) timeline.pause();
    }

    unregisterTimeline()
    {
        this._activeTimeline = null;
    }

    // ── Gate: awaited between commands ──────────────────────────────

    async gate()
    {
        if (this._aborted) throw new AbortError();
        if (this.runMode) return;

        if (this._stepMode)
        {
            this.paused = true;
            this._stepMode = false;
        }

        if (this.paused)
        {
            await new Promise(resolve => { this._resolve = resolve; });
            if (this._aborted) throw new AbortError();
        }
    }

    // ── Duration scaling ───────────────────────────────────────────

    /** Scale a base duration by current speed + behavior speed */
    scaleDuration(baseDuration)
    {
        if (this.runMode) return 0;
        let behaviorSpeed = this.currentBehavior.speed || 1.0;
        return Math.max(10, baseDuration / (this.speed * behaviorSpeed));
    }

    // ── Loop behavior ──────────────────────────────────────────────

    getLoopBehavior(iteration, total)
    {
        if (this.runMode)
            return { mode: "detail", speed: 1000 };

        if (iteration < this.loopStrategy.detailSteps)
        {
            return { mode: "detail", speed: this.speed };
        }

        switch (this.loopStrategy.thenMode)
        {
            case "rush":
                return { mode: "detail", speed: 20 };
            case "skip":
                return { mode: "skip" };
            case "accelerate":
                let factor = 1 + (iteration - this.loopStrategy.detailSteps) * 2;
                return { mode: "detail", speed: factor };
            default:
                return { mode: "detail", speed: this.speed };
        }
    }
}

/** Thrown when execution is aborted (reset / code change) */
class AbortError extends Error
{
    constructor() { super("Execution aborted"); this.name = "AbortError"; }
}
