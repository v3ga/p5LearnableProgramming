class p5Command
{
  constructor(list,elmt)
  {
    this.list         = list;
    this.elmt         = elmt;
    this.waitDuration = 750.0;
  }
  
  execute()
  {
    this.highlight();
    return this.wait();
  }

  wait()
  {
    return new Promise( (resolve,reject)=>
    {
      setTimeout( this.waitDone.bind(this,resolve), this.waitDuration );
    })
  }

  waitDone(resolve)
  {
    this.unhighlight();
    resolve();
  }  

  highlight()
  {
    this.elmt.addClass("current");
  }

  unhighlight()
  {
    this.elmt.removeClass("current");
  }

  draw()
  {}

}