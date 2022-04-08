class p5Program
{
  constructor(id)
  {
    this.interval = null;
    this.intervalExecute = 1000;
  }
  
  addCommand(c)
  {
    this.commands.push( new p5Command(this,$(c)) );
  }
  
  run()
  {
    let p = new Promise( async (resolve,reject)=>
    {
        if (this.pc < this.commands.length)
        {
          await this.commands[this.pc].execute();          
          
        }
    })
/*
    if (this.interval == null)
    {
      if (this.commands.length > 0)
        this.interval = setInterval( this.execute.bind(this),this.intervalExecute );
    }
    else
    {
      clearInterval(this.interval);
      this.interval = null;
      this.pc = 0;
      this.run();
    }
*/  }
  
  execute()
  {
    
/*  
    this.commands.forEach( c => c.elmt.removeClass("current") );
    let commandCurrent = this.commands[this.pc];
    commandCurrent.highlight();
    commandCurrent.execute();
    this.pc = (this.pc+1)%this.commands.length;
*/  
  }
}
