class p5CommandList extends p5Command
{
    constructor(parent,elmt)
    {
        super(parent,elmt)

        this.commands       = [];
        this.pc             = 0;
        this.elmt.children("p.command").each( (index,c) => this.addCommand(c) )
        this.nbLoopMax      = 0;
        this.nbLoop         = 0;
        this.loopDoneCb     = null; 
        this.listDoneCb     = null;
    }

    isLoop()
    {
        return this.nbLoopMax > 0;
    }

    getLastCommand()
    {
        return this.commands[this.commands.length-1];
    }
    
    addCommand(c)
    {
        let command = makeCommand(this,c);
        if (command instanceof p5CommandVariableDef)
            g.interpreter.defineVariable(command.name, command.value);
        this.commands.push( command );
    }

    getVariableValue(name)
    {
        return g.interpreter.getVariableValue(name);
    }
    
    executeCommand(resolve)
    {
        if (this.pc < this.commands.length)
        {
            // Current command
            let command = this.commands[this.pc];
            // Execute command
            command.execute()
            .then ( _=> command.wait())
            .then ( _=> 
            {  
                this.pc++;
                this.executeCommand(resolve);
            })
        } else resolve();
    }

    executeLoop(resolve)
    {
        if (this.nbLoop < this.nbLoopMax)
        {
            this.executeCommands().then( () => 
            {
                if (this.loopDoneCb) this.loopDoneCb();  
                this.nbLoop++; 
                this.executeLoop(resolve);
//                this.wait();
            });
        }
        else resolve();
    }
    
    loop(nb,cb)
    {
        this.nbLoopMax = max(0,nb);
        this.loopDoneCb = cb;
        if (nb == 0)
        {
            return this.executeCommands();
        }
        else
        {
            this.nbLoop = 0;
            return new Promise ( (resolve,reject) => this.executeLoop(resolve) );
        }
    }

    executeCommands()
    {
        this.pc = 0;
        return new Promise ( (resolve,reject) => 
        {
          this.executeCommand(resolve);
        })
    }

    execute()
    {
        return this.loop(0);
    }
}