function ContextMenu(elem, options){
    this.enabled=true;
    this.container=elem;
    this.options=options;    
    this.menu=new Element('div',{id:'webtronics_context_menu',zIndex:100});
    for(var i=0;i<this.options.length;i++){
        this.options[i].enabled=true;
        var op=new Element('a',{Title:this.options[i].label,id:'webtronics_context_option',class:'enabled'})
            .observe('click',this.activate.bindAsEventListener(this,this.options[i]))
            .observe('contextmenu', Event.stop)
            .update(this.options[i].label);           
        this.menu.insert(op);
        this.menu.insert(new Element('br'));
    }     
    
}
ContextMenu.prototype.activate=function(e){
	var data = $A(arguments);
	data.shift();							
    if(Event.element(e).className==='enabled'){
        data[0].cb();
    }
}

ContextMenu.prototype.attach=function(elem){
    elem.observe('contextmenu', this.show.bind(this))
        .observe('mousedown',this.hide.bind(this));
    this.container.insert(this.menu);
    
}

ContextMenu.prototype.show=function(e){
    if(this.enabled===true){
        this.menu.style.left=Event.pointerX(e)+'px';
        this.menu.style.top=Event.pointerY(e)+'px';
        this.menu.style.display='block';    
    }
    e.stop();
}
ContextMenu.prototype.hide=function(){
    if(Event.isLeftClick){
    this.menu.style.display='none';    
    }
}
