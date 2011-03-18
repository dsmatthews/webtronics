/*----------------------------------------------------------------------------
 Webtronics 1.0
 SVG schematic drawing Script
 -----------------------------------------------------------------------------
 Created by an electronics hobbyist
 Based on Richdraw by Mark Finkle 
 Also with help from svg-edit 
 -----------------------------------------------------------------------------
 Copyright (c) 2006 Mark Finkle

 This program is  free software;  you can redistribute  it and/or  modify it
 under the terms of the MIT License.

 Permission  is hereby granted,  free of charge, to  any person  obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the  Software without restriction,  including without limitation
 the  rights to use, copy, modify,  merge, publish, distribute,  sublicense,
 and/or  sell copies  of the  Software, and to  permit persons to  whom  the
 Software is  furnished  to do  so, subject  to  the  following  conditions:
 The above copyright notice and this  permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS",  WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED,  INCLUDING BUT NOT LIMITED TO  THE WARRANTIES  OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR  COPYRIGHT  HOLDERS BE  LIABLE FOR  ANY CLAIM,  DAMAGES OR OTHER
 LIABILITY, WHETHER  IN AN  ACTION OF CONTRACT, TORT OR  OTHERWISE,  ARISING
 FROM,  OUT OF OR  IN  CONNECTION  WITH  THE  SOFTWARE OR THE  USE OR  OTHER
 DEALINGS IN THE SOFTWARE.
 -----------------------------------------------------------------------------
 History:
 2006-04-05 | Created
 --------------------------------------------------------------------------*/


 
function Schematic(elem) {
	this.svgNs = 'http://www.w3.org/2000/svg';
	this.container = elem;
	this.grid = 10;
/*main svg element*/	
	this.svgRoot = null;
/*group to display information*/
	this.info=null;
	this.connections=false;
	this.zoomRatio=1;
	this.mode = '';
/*array of nodes*/
	this.selected = Array();
/*selecting rectangle*/
	this.drag=0;	
	this.selectionRect = { x:0, y:0, width:0, height: 0 };

	this.mouseDown={x:0,y:0};
	this.viewoffset={x:0,y:0};
	
	this.init(this.container);

	this.onMouseDownListener = this.onMouseDown.bindAsEventListener(this);
	this.onMouseUpListener = this.onMouseUp.bindAsEventListener(this);
	this.onDragListener = this.onDrag.bindAsEventListener(this);

	Event.observe(this.container, "mousemove", this.onDragListener); 
	Event.observe(this.container, "mousedown", this.onMouseDownListener);
	Event.observe(this.container, "mouseup", this.onMouseUpListener);

}




Schematic.prototype.zoomtorect = function(rect){
	if(rect.width<0){
		rect.width=Math.abs(rect.width);
		rect.x=rect.x-rect.width;
	}
	if(rect.height<0){
		rect.height=Math.abs(rect.height);
		rect.y=rect.y-rect.height;
	}



	var maxv =Math.max(rect.width,rect.height)
	this.zoomRatio=this.container.offsetWidth/maxv;
	if(this.zoomRatio>8){
		this.zoomRatio=1;
		this.viewoffset.x=0;
		this.viewoffset.y=0;
		this.svgRoot.setAttributeNS(null,'viewBox',0+' '+ 0 +' '+ this.container.offsetWidth +' '+this.container.offsetWidth );
		this.svgRoot.setAttributeNS(null,'width',this.container.offsetWidth);
		this.svgRoot.setAttributeNS(null,'height',this.container.offsetWidth);
 	}
	else{
		this.viewoffset.x=rect.x*this.zoomRatio;
		this.viewoffset.y=rect.y*this.zoomRatio;
		this.svgRoot.setAttributeNS(null,'width',this.container.offsetWidth);
		this.svgRoot.setAttributeNS(null,'height',this.container.offsetWidth);
		this.svgRoot.setAttributeNS(null,'viewBox',rect.x+' '+ rect.y +' '+ maxv +' '+maxv );
	}
}
	
Schematic.prototype.setzoom=function(reset){
	var svgsize=this.tracker(this.svgRoot);

	if(this.zoomRatio<.5||this.zoomRatio>1||reset){
		this.zoomRatio=1;
		this.viewoffset.x=0;
		this.viewoffset.y=0;
		this.svgRoot.setAttributeNS(null,'viewBox',0+' '+ 0 +' '+ this.container.offsetWidth +' '+this.container.offsetWidth );
		this.svgRoot.setAttributeNS(null,'width',this.container.offsetWidth);
		this.svgRoot.setAttributeNS(null,'height',this.container.offsetWidth);
 	}
	else{
		this.zoomRatio-=.1;
		this.viewoffset.x=0;
		this.viewoffset.y=0;
		this.svgRoot.setAttributeNS(null,'width',this.container.offsetWidth);
		this.svgRoot.setAttributeNS(null,'height',this.container.offsetWidth);
		var zoom=this.container.offsetWidth/this.zoomRatio;
		this.svgRoot.setAttributeNS(null,'viewBox',0+' '+ 0 +' '+ zoom +' '+zoom );
	}


}


Schematic.prototype.init = function(elem) {

	this.container = elem;
	this.container.style.MozUserSelect = 'none';
	this.svgRoot = document.createElementNS(this.svgNs, "svg");
	this.svgRoot.setAttribute('xmlns',this.svgNs);
	this.container.appendChild(this.svgRoot);
	this.svgRoot.setAttributeNS(null,'width',this.container.offsetWidth);
	this.svgRoot.setAttributeNS(null,'height',this.container.offsetWidth);
/*set colors*/
	this.svgRoot.style.backgroundColor="#ffffff";
	this.info=document.createElementNS(this.svgNs,'g');
	this.info.id="information";
	this.svgRoot.appendChild(this.info);

	
	}

Schematic.prototype.parseMatrix=function(group){
	var matrix={a:1,b:0,c:0,d:1,e:0,f:0};

	try{
		matrix=group.getTransformToElement(this.svgRoot);
	}
	catch(e){
		return matrix;
	}
	return matrix;

}



Schematic.prototype.addtext=function(str){

	this.unselect();
	this.mouseDown.x=0;
	this.mouseDown.y=0;
	str=str.replace(/(^\s*|\s*$)/g, "");
	var lines=str.split('\n');
	for(var i=0; i<lines.length;i++){
		var svg =this.createtext(lines[i],'black',this.mouseDown.x,this.mouseDown.y+(i*12));
		this.svgRoot.appendChild(svg);
		this.select(svg);
		}
	this.drag=1;
	
}



Schematic.prototype.parseXY=function(elem){
		var point={x:0,y:0};
	if (elem.tagName == 'line') {
		var x=elem.getAttributeNS(null, 'x1')-0;
		var y=elem.getAttributeNS(null, 'y1')-0;	
		point.x=elem.getAttributeNS(null, 'x2')-0;
		point.y=elem.getAttributeNS(null, 'y2')-0;	
		if(x<point.x)point.x=x;
		if(y<point.y)point.y=y;
	}
	else if(elem.tagName=='circle'){
		 point.x=elem.getAttributeNS(null, 'cx')-0;
		 point.y=elem.getAttributeNS(null, 'cy')-0;
	}
	else if(elem.tagName == 'g'){
		var matrix=Object();
		matrix=this.parseMatrix(elem);
		point.x=matrix.e;
		point.y=matrix.f;		
	}
	else {
		point.x=elem.getAttributeNS(null, 'x')-0;
		point.y=elem.getAttributeNS(null, 'y')-0;
	}
	return point;	
}



Schematic.prototype.resize = function(shape, fromX, fromY, toX, toY) {
  var deltaX = Math.abs(toX - fromX);
  var deltaY = Math.abs(toY - fromY);

  if (shape.tagName == 'line') {

/*if x is longer than y*/ 

		if(deltaX>deltaY){
	    shape.setAttributeNS(null, 'x2', toX);
	    shape.setAttributeNS(null, 'y2', fromY);
		}
		else {
	    shape.setAttributeNS(null, 'x2', fromX);
	    shape.setAttributeNS(null, 'y2', toY);
		}
			
  }

}


Schematic.prototype.tracker = function(elem) {
	var rect=Object();
	if(elem&&(elem.nodeType==1)){	
		var box={x:0,y:0,width:0,height:0};
		try{
			var box=elem.getBBox();
		}
		catch(e){
			/*do nothing*/
			}
		if(!box)var box={x:0,y:0,width:0,height:0};

		if(elem.tagName=='g'||elem.tagName=='svg'){

				for(var i= elem.childNodes.length;i>0;i--){
					if(elem.childNodes[i-1].nodeType==1){
						var chbox=this.tracker(elem.childNodes[i-1]);
						box.x=Math.min(box.x,chbox.x);
						box.y=Math.min(box.y,chbox.y);
						box.width=Math.max(chbox.x+chbox.width,box.width);
						box.height=Math.max(chbox.y+chbox.height,box.height);
						}	
					}

			var matrix=this.parseMatrix(elem);
/*gets corrected bounding box*/
			var tleft=this.svgRoot.createSVGPoint();
			var bright=this.svgRoot.createSVGPoint();
			tleft.x=box.x;
			tleft.y=box.y;
			tleft=tleft.matrixTransform(matrix);

			bright.x=box.x+box.width;
			bright.y=box.y+box.height;
			bright=bright.matrixTransform(matrix);
			
	

			rect.x=Math.min(tleft.x,bright.x);
			rect.y=Math.min(tleft.y,bright.y);
			rect.width=Math.max(tleft.x,bright.x)-rect.x;			
			rect.height=Math.max(tleft.y,bright.y)-rect.y;			



		}
		else{
			rect.x=box.x-1;
			rect.y=box.y-1;
			rect.width=box.width+2;
			rect.height=box.height+2;


		}		
	return rect;
	}
}

/*transforms
 1  0  0  1 x  y     =normal
 0  1 -1  0 x  y     =90`
-1  0  0 -1 x  y     =180`
 0 -1  1  0 x  y     =270`
 0 -1 -1  0 x  y     =fliph and rotate 270`
*/
/*show a box around an element*/
Schematic.prototype.rotate=function(elem){
	var matrix=this.parseMatrix(elem);
	matrix=matrix.rotate(90);

	elem.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	this.removeTracker();
	for(i=0;i<this.selected.length;i++)
		this.showTracker(this.selected[i]);		
}

Schematic.prototype.flip=function(elem){
	var matrix=this.parseMatrix(elem);
	var flip =matrix.flipX();
	elem.setAttributeNS(null,'transform','matrix('+flip.a+','+flip.b+','+flip.c+','+flip.d+','+flip.e+','+flip.f+')');
	this.removeTracker();
	for(i=0;i<this.selected.length;i++)
		this.showTracker(this.selected[i]);		
	
	
}

Schematic.prototype.showTracker = function(elem) {
	var rect=this.tracker(elem);

  var tracked = document.createElementNS(this.svgNs, 'g');
  tracked.setAttributeNS(null, 'id', 'schematic_tracker');
	var svg=this.createrect('blue',rect.x,rect.y,rect.width,rect.height);
	tracked.appendChild(svg)

/*add gadgets*/
	if(elem.tagName=='g'){
		svg=this.createtext('rotate','blue',rect.x+rect.width,rect.y);
		svg.rotatorfor=elem;
		Event.observe(svg,"mousedown", function(e){
			this.mode='rotate';
			this.rotate(e.target.rotatorfor);
			e.stopPropagation();}.bind(this));
		tracked.appendChild(svg);

	}
	
	if (this.getparttype(elem)=='Q'||this.getparttype(elem)=='opamp'){
		svg=this.createtext('flip','blue',rect.x,rect.y+rect.height+10);
		svg.rotatorfor=elem;
		Event.observe(svg,"mousedown", function(e){
			this.mode='rotate';
			this.flip(e.target.rotatorfor);
			e.stopPropagation();}.bind(this));
		tracked.appendChild(svg);
	
	}

 this.info.appendChild(tracked);
}

Schematic.prototype.clearinfo=function(){
	this.remove(this.info);

	this.info=document.createElementNS(this.svgNs,'g');
	this.info.id="information";
	this.svgRoot.appendChild(this.info);
	this.showallconnects();

}
/*find all tracking boxes and delete them*/
Schematic.prototype.removeTracker=function(){
	
	var tracker=$('schematic_tracker')
	if(tracker){
		do{
		this.remove(tracker);
		tracker=$('schematic_tracker');

		}while(tracker)
		
	}	
	
}

Schematic.prototype.remove = function(shape) {
	if(shape){  
	this.hideconnects();
	shape.parentNode.removeChild(shape);
	shape=null;
	this.showallconnects()
	}
}

Schematic.prototype.newdoc = function(){
	this.setzoom(1);
	
	this.remove(this.svgRoot);	
	this.init(this.container);	
}


Schematic.prototype.invertcolors =function(check){

	if(check){
		if(!$('invertfilter')){
			this.svgRoot.style.backgroundColor="#000000";
			this.svgRoot.setAttribute('stroke','white');
/*			var defs=$$('defs')[0];
			if(!defs)defs=document.createElementNS(this.svgNs ,'defs');
			var fe = document.createElementNS(this.svgNs ,'feComponentTransfer');
			var filter=document.createElementNS(this.svgNs ,'feFuncR');
			filter.setAttributeNS(null,'type','table');
			filter.setAttributeNS(null,'tableValues','1 0');
			fe.appendChild(filter);	
			filter=document.createElementNS(this.svgNs ,'feFuncG');
			filter.setAttributeNS(null,'type','table');
			filter.setAttributeNS(null,'tableValues','1 0');
			fe.appendChild(filter);	
			filter=document.createElementNS(this.svgNs ,'feFuncB');
			filter.setAttributeNS(null,'type','table');
			filter.setAttributeNS(null,'tableValues','1 0');
			fe.appendChild(filter);	
			filter=document.createElementNS(this.svgNs ,'filter');
			filter.setAttributeNS(null,'id','invertfilter');
			filter.appendChild(fe);
			defs.appendChild(filter);
			this.svgRoot.appendChild(defs);
			this.svgRoot.setAttribute('filter','url(#invertfilter)');
*/
		}
	}
	else {
//		this.remove($('invertfilter'));
//		this.svgRoot.removeAttributeNS(null,'filter');
		this.svgRoot.style.backgroundColor="#ffffff";
		this.svgRoot.setAttribute('stroke','black');
	}
}

Schematic.prototype.showconnections=function(check){
	if(check){
		this.connections=true;
		this.showallconnects();

	}


	else{
		this.connections=false;
		this.hideconnects();
	}
	
}

Schematic.prototype.getMarkup = function() {
	this.setzoom(true);
	this.svgRoot.removeChild($('information'));
	var svg=this.svgRoot.cloneNode(true);
	this.svgRoot.appendChild(this.info);
	svg.removeAttributeNS(null,'viewBox');
	var svgsize=this.tracker(this.svgRoot);
	svg.setAttributeNS(null,'width',svgsize.width+10);
	svg.setAttributeNS(null,'height',svgsize.height+10);
	return (new XMLSerializer()).serializeToString(svg);
}

//**********************************************************************





Schematic.prototype.deleteSelection = function() {
  if(!this.selected.length)return; 
/*delete selected nodes*/  
	 for(var i=this.selected.length;i>0;i--){
		this.remove(this.selected[i-1]);
	 	this.selected.pop();
	}
/*delete all trackers*/
	this.removeTracker();

//  this.selected;
}


Schematic.prototype.select = function(elem) {

  	this.selected.push(elem);
 	this.showTracker(this.selected[this.selected.length-1]);
}


Schematic.prototype.unselect = function() {
	for(var i=this.selected.length;i>0;i--){
		this.selected[i-1]=null;
		this.selected.pop();
		}
	this.removeTracker();

}





Schematic.prototype.connect =function(x1,y1){
        
	var point=this.isconnects(5,x1,y1);		
	if(point!=null){
		this.remove($('templine'));
		return;
	}
	var lines=this.svgRoot.childNodes;	
        for(var i=0;i<lines.length;i++){
                if(lines[i].tagName=='line'){
                        var lx1=lines[i].getAttributeNS(null,"x1")-0;                       
                        var lx2=lines[i].getAttributeNS(null,"x2")-0;                       
                        var ly1=lines[i].getAttributeNS(null,"y1")-0;                       
                        var ly2=lines[i].getAttributeNS(null,"y2")-0;                       
                                if((lx1<lx2 && x1>lx1 && x1<lx2 && y1==ly1)||
                                (ly1<ly2 && y1>ly1 && y1< ly2 &&x1==lx1)||
				(lx1>lx2 && x1<lx1 && x1>lx2 && y1==ly1)||
                                (ly1>ly2 && y1<ly1 && y1> ly2 &&x1==lx1)){
                                        this.remove(lines[i]);
					this.svgRoot.appendChild(this.createline('black',lx1,ly1,x1,y1));
					this.svgRoot.appendChild(this.createline('black',x1,y1,lx2,ly2));
					this.svgRoot.appendChild(this.createdot('black',x1,y1));
					this.remove($('templine'));
					return;
                                }
                }
        }
}

/*check if selection rectangle overlaps part*/
Schematic.prototype.getPart=function(){

        for(var i=0;i<this.svgRoot.childNodes.length;i++){
                var part=this.svgRoot.childNodes[i];
                if(part.nodeType==1){
                        if(part.id!='information'&&part.parentNode.id!='information'){
                                var rect=this.tracker(part);
                                if(Utils.rectsIntersect(rect,this.selectionRect)){
					this.select(part);
                                                
                                }
                        }
                }
        }
};


Schematic.prototype.realPosition=function(event){
	var real={x:0,y:0};
	var offset = this.container.cumulativeOffset();
	var soffset=this.container.cumulativeScrollOffset();
/*this section gets the pointer position relative to the window and scrollbars
 * I'm using this for now until something better comes up
 */
	real.x=Math.round((Event.pointerX(event)-offset[0]+this.container.scrollLeft+this.viewoffset.x)/this.zoomRatio);
	real.y=Math.round((Event.pointerY(event)-offset[1]+this.container.scrollTop+this.viewoffset.y)/this.zoomRatio);
	return real;
}

/*mousedown event handler*/
Schematic.prototype.onMouseDown = function(event){
if(!this.drag){
	var real=this.realPosition(event);
//	this.lastclick.x=this.mouseDown.x;
//	this.lastclick.y=this.mouseDown.y;
	this.mouseDown.x = Math.round(real.x/this.grid) * this.grid;
	this.mouseDown.y =Math.round(real.y/this.grid) * this.grid;
	  
		if (this.mode == 'line') {
			if($('templine')){
				/*create line*/
				var x1=$('templine').getAttributeNS(null,'x1');
				var y1=$('templine').getAttributeNS(null,'y1');
				var x2=$('templine').getAttributeNS(null,'x2');
				var y2=$('templine').getAttributeNS(null,'y2');
				if(!(x1==x2&&y1==y2)){
					var svg=this.createline('black', x1, y1,	x2, y2);
					svg.id='line'+createUUID();
					this.svgRoot.appendChild(svg);
					this.remove($('templine'));
					this.connect(x1, y1);
					svg = this.createline('blue', x2, y2,x2,y2);
					svg.id = 'templine';
					svg.setAttributeNS(null,'stroke-dasharray','3,2');
					this.info.appendChild(svg);
					this.connect(x2, y2);
				}
				
			}
	/*create temperary line*/
			else{
			
				var svg = this.createline('blue', this.mouseDown.x, this.mouseDown.y,	this.mouseDown.x, this.mouseDown.y);
				svg.id = 'templine';
				svg.setAttributeNS(null,'stroke-dasharray','3,2');
				this.info.appendChild(svg);
			}
							
		}
/*clicked on background  in select mode ,remove selection*/
		else if(this.mode=='select'||this.mode=='zoom'){
			this.selectionRect.x=real.x;
			this.selectionRect.y=real.y;
			this.selectionRect.width=0;
			this.selectionRect.height=0;
		/* if there is already a selection rectangle delete it*/
			var selection=$('schematic_selection');
			do{
				if(selection)this.remove(selection);
				selection=$('schematic_selection');	
			}while(selection);
			selection = this.createrect('blue',real.x,real.y,0,0);
			selection.id='schematic_selection';
			this.info.appendChild(selection);
			if(this.mode=='select'){
				for(var i=0;i<this.selected.length;i++){
					if(Utils.rectsIntersect(this.selectionRect,this.tracker(this.selected[i])))this.drag=1;
				}
				if(!this.drag)this.unselect();
			}
		}
	}
  return false;
	
}



Schematic.prototype.dragSelection=function(x ,y){
	var floating=$('schematic_floating');
	if(!floating){
		floating = document.createElementNS(this.svgNs, 'g');
		for(var i=0;i<this.selected.length;i++){
			floating.appendChild(this.selected[i]);
		}

		var tracked=$('schematic_tracker');
		do{
			if(tracked){
				floating.appendChild(tracked);
				tracked=$('schematic_tracker');
			}
		}while(tracked);

		floating.setAttributeNS(null, 'id', 'schematic_floating');
	  this.info.appendChild(floating);
	}
	floating.setAttributeNS(null,'transform','matrix(1,0,0,1,'+x+','+y+')');
	
} 

Schematic.prototype.move = function(shape, x, y) {
	var rect;
	try{
		rect=shape.getBBox();
	}
	catch(e){
		return

	}
	var point=this.parseXY(shape);
	if (shape.tagName == 'line') {
		shape.setAttributeNS(null, 'x1', point.x+x);
		shape.setAttributeNS(null, 'y1', point.y+y);	
		shape.setAttributeNS(null, 'x2', point.x+x + rect.width);
		shape.setAttributeNS(null, 'y2', point.y+y + rect.height);
	}
	else if(shape.tagName=='circle'){
		 shape.setAttributeNS(null, 'cx', point.x+x);
		 shape.setAttributeNS(null, 'cy', point.y+y);
	}
	else if(shape.tagName == 'g'){
		var matrix=this.parseMatrix(shape);
		/*if the group has no transform create one*/
		if(matrix.a==0&&matrix.b==0&&matrix.c==0&&matrix.d==0){
			shape.setAttributeNS(null,'transform','matrix(1,0,0,1,'+(point.x+x)+','+ (point.y+y)+')');
		}
		else {
			shape.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
		}	

	}
	else {
		shape.setAttributeNS(null, 'x', point.x+x);
		shape.setAttributeNS(null, 'y', point.y+y);
	}

}


Schematic.prototype.dropSelection=function(){
	var floating=$('schematic_floating');
	var matrix=this.parseMatrix(floating);
	for(var i=floating.childNodes.length;i>0;i--){
		/*move other parts*/
		this.move(floating.childNodes[i-1],matrix.e, matrix.f);
		if(floating.childNodes[i-1].id!='schematic_tracker'){
			this.svgRoot.insertBefore(floating.childNodes[i-1],this.svgRoot.childNodes[0]);
		}
		else {
			this.info.appendChild(floating.childNodes[i-1]);
		}
	}
	this.remove(floating);	
}



Schematic.prototype.onMouseUp = function(event) {

	this.drag=0;
	if(this.mode=='select'){
		var floating=$('schematic_floating');
		if(floating){
			this.dropSelection();
		}
		else{
			this.unselect();
			this.getPart();
		}
			
	}
	
	else	if(this.mode=='zoom'){
		this.unselect();
		this.zoomtorect(this.selectionRect);
	}

	var selection = $('schematic_selection');
	if (selection) {
		this.remove(selection);
		this.selectionRect.x=0;
		this.selectionRect.y=0;
		this.selectionRect.width=0;
		this.selectionRect.height=0;
	 }
	/*skip the mouseup after a rotate*/
	if(this.mode=='rotate'){
		this.mode='select';
	}

}


Schematic.prototype.onDrag = function(event) {

	var real=this.realPosition(event);
	mouseAt={x:0,y:0}
	mouseAt.x = Math.round(real.x / this.grid) * this.grid;
	mouseAt.y =Math.round(real.y / this.grid) * this.grid;


	if(this.mode=='select'){
/*clicked inside bounds*/

		if(this.drag){
			this.dragSelection(mouseAt.x-this.mouseDown.x,mouseAt.y-this.mouseDown.y);
		}
		else{
		var selection = $('schematic_selection');
		if (selection) {
			//if(this.selected.length)this.unselect();
			this.selectionRect.width=real.x-this.selectionRect.x;
			this.selectionRect.height=real.y-this.selectionRect.y;
			if(this.selectionRect.width<0)selection.setAttributeNS(null,'x', real.x);
			if(this.selectionRect.height<0)selection.setAttributeNS(null,'y',real.y);		
			selection.setAttributeNS(null,'width', Math.abs(this.selectionRect.width));
			selection.setAttributeNS(null,'height',Math.abs(this.selectionRect.height));
			}
		}
	}
	else if(this.mode=='zoom'){
		var selection = $('schematic_selection');
		if (selection) {
			//if(this.selected.length)this.unselect();
			this.selectionRect.width=real.x-this.selectionRect.x;
			this.selectionRect.height=real.y-this.selectionRect.y;
			if(this.selectionRect.width<0)selection.setAttributeNS(null,'x', real.x);
			if(this.selectionRect.height<0)selection.setAttributeNS(null,'y',real.y);		
			selection.setAttributeNS(null,'width', Math.abs(this.selectionRect.width));
			selection.setAttributeNS(null,'height',Math.abs(this.selectionRect.height));
		}
	}
			
		
		
	else if (this.mode=='line')
	{
		if ($('templine')){
			
			var x=$('templine').getAttribute('x1')-0;
			var y=$('templine').getAttribute('y1')-0;

			if(Math.abs(this.mouseDown.x-real.x)>=Math.abs(this.mouseDown.y-real.y)){
				
				this.resize($('templine'), x, y, mouseAt.x, y);
	
			}
			else{
							
				this.resize($('templine'), x, y, x, mouseAt.y);
			}
			
		}
	}
}


Schematic.prototype.getparttype=function(elem){
var type;
if(elem.id){
	type=elem.id.split(':',1)[0];
}
return type;
}

Schematic.prototype.changeid=function(elem){
	var type=this.getparttype(elem);
  elem.setAttribute('id',type +':'+ createUUID());
}


Schematic.prototype.getgroup =function(elem){
		this.unselect();
		var newelem=document.importNode(elem,true);
		this.svgRoot.appendChild(newelem);
		this.mouseDown.x=0;
		this.mouseDown.y=0;
		
		newelem.setAttributeNS(null,'transform','matrix(1,0,0,1,'+this.mouseDown.x+','+this.mouseDown.y+')');
		 
		this.changeid(newelem);
		this.select(newelem);
		this.drag=1;
}

Schematic.prototype.getfile =function(elem){
this.unselect();
ch=elem.childNodes;

for(var i= ch.length;i>0;i--){
/*only open these nodes*/
		/*get rid  of empty text*/
		if(ch[i-1].tagName=='circle'||
			ch[i-1].tagName=='line'||
			(ch[i-1].tagName=='text'&&ch[i-1].hasChildNodes())||
			ch[i-1].tagName=='g'){
//check for duplicate id
			if(lookforid(ch[i-1].id,$$('body')[0]))
				this.changeid(ch[i-1]);
			var newelem	= document.importNode(ch[i-1],true);
			this.svgRoot.appendChild(newelem);
			this.select(newelem);
		}
	}

	
}


function lookforid(id,node){
	var found=false;
	if(!id)return false;	


/*i like recursion */
	if(node.id){
		if(node.id==id)found=true; 	
	}
	if(!found)if(node.hasChildNodes())found= lookforid(id,node.childNodes[0]);
	if(!found)if(node.nextSibling)found= lookforid(id,node.nextSibling);
	return found;
}

function createUUID()
{
  return [7].map(function(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
      var uuidchar = parseInt((Math.random() * 256)).toString(16);
      if (uuidchar.length == 1)
        uuidchar = "0" + uuidchar;
      uuidpart += uuidchar;
    }
    return uuidpart;
  }).join('-');
}

var Utils = {


	"encode64" : function(input) {
//probably won't work on older browsers
		return btoa(input);

	},

	"decode64" : function (input) {


			return  atob(input);
	 
		},

	"rectsIntersect": function(r1, r2) {
		
		return			((r2.width>0)?(r2.x):(r2.x+r2.width)) < ((r1.width>0)?(r1.x+r1.width):(r1.x)) &&
			((r2.width>0)?(r2.x+r2.width):(r2.x)) > ((r1.width>0)?(r1.x):(r1.x+r1.width)) &&
			((r2.height>0)?(r2.y):(r2.y+r2.height)) < ((r1.height>0)?(r1.y+r1.height):(r1.y)) &&
			((r2.height>0)?(r2.y+r2.height):(r2.y)) > ((r1.height>0)?(r1.y):(r1.y+r1.height));


	}

	
}

