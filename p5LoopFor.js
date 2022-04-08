class p5LoopFor extends p5Command
{
    constructor(list, elmt)
    {
        super(list, elmt);

        this.durationUpdateCheck        = 1000/2;
        this.durationUpdateCondition    = 1000/2;
        
        let id                  = elmt.attr("id");
        this.commandList        = new p5CommandList(list, $(`div[data-parent="${id}"]`));
        this.variable           = new p5CommandVariableDef(this, this.elmt.find(".var-def"));
        this.elmtUpdate         = elmt.find(".update");
        this.updateExpression   = this.elmtUpdate.text();
        this.variableInitial    = this.variable.copy();
        this.elmtNbLoop         = elmt.find(".nb-loop");
        this.nbLoopMax          = parseInt(this.elmtNbLoop.text());
        this.nbLoop             = 0;

        this.mark_ok            = $(`<div class="mark mark-ok">👌</div>`)
        this.mark_no            = $(`<div class="mark mark-no">👎</div>`)
        this.update_check       = $(`<div class="update_check"></div>`)

        $("body")
        .append(this.mark_ok)
        .append(this.mark_no)
        .append(this.update_check);

        console.log(`p5LoopFor, id=${id}`);
        console.log(list);
        console.log(` nb commands = ${this.commandList.commands.length}`);
    }
    
    execute()
    {
        this.highlight();

        return this.initVariable()
        .then( () => this.beginLoop() )
    }
    
    initVariable()
    {
      return new Promise ( (resolve,reject) => 
      {
          this.variable.value = this.variableInitial.value;
          g.interpreter.defineVariable( this.variableInitial.name, this.variableInitial.value );
          setTimeout(resolve,this.durationWait);
        })
    }    

    evalCondition()
    {
      return new Promise ( (resolve,reject) => {
        this.conditionVerified = this.variable.value < this.nbLoopMax ? true : false; 

        let markClass = this.conditionVerified ? '.mark-ok' : ".mark-no";
        let mark = this.conditionVerified ? this.mark_ok : this.mark_no;

        anime({
            targets: mark.get(),
            scale: [1,1.25],
            opacity: [0.0,1.0],
            translateY: '-0px',
            duration : this.durationUpdateCondition,
            begin :     _=> mark.show().offset( {left : this.elmtNbLoop.offset().left-15, top : this.elmtNbLoop.offset().top-25}  ),
            complete :  _=> { mark.fadeOut("fast"); this.update_check.fadeOut("fast") }

          });


        setTimeout(resolve,this.waitDuration);
      })
    }

    evalUpdate()
    {
        return new Promise ( (resolve,reject) => 
        {
            let var_value_old = this.variable.value;
            eval( this.updateExpression );
            this.variable.value++; // TEMP

            this.update_check
            .hide()
            .css( {left : this.elmtUpdate.offset().left, top : this.elmtUpdate.offset().top-18} )
            .html(`${this.variable.name}=<span class="cm-number">${this.variable.value}</span>`)

            anime({
                targets: ".update_check",
                opacity: [0.0,1.0],
                scale: [1,1.25],
                duration : this.durationUpdateCheck,
                begin :     _=> this.update_check.show()
            });

            g.interpreter.updateVariableValue(this.variable.name, this.variable.value);

            setTimeout(resolve,2000);
        });
    }

    beginLoop()
    {
        return new Promise( (resolve,reject)=>
        {
            this.executeLoop(resolve);
        })

    }

    executeLoop(resolve)
    {
        this.evalCondition().then( ()=>
        { 
            // console.log(`after eval condition, this.conditionVerified=${this.conditionVerified}`);
            if (this.conditionVerified)
            {
                // console.log("executing block");
                this.unhighlight();
                this.commandList.executeCommands().then( () => 
                {
                    this.highlight();
                    this.evalUpdate().then( () => this.executeLoop(resolve) );
                });
            }
            else
            {
                // console.log("resolving promise");

                g.interpreter.removeVariable( this.variable.name );
                setTimeout(resolve,this.waitDuration);
            }
        })
    }    
    
}
