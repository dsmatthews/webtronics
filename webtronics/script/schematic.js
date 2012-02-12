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
	this.width=640;
	this.height=480;
	this.maxwidth=2000;
	this.maxheight=2000;
	this.fontsize=12;
/*main svg element*/	
	this.svgRoot = null;
/* group to hold drawing*/
	this.drawing=null;
/* group to hold background*/
	this.background=null;
/*svg layer for zoom tools*/
	this.zoomtools=null;
/*group to display information*/
	this.info=null;
	this.connections=false;
	this.graph=false;
	this.zoomRatio=1;
	this.mode = '';
/*array of nodes*/
	this.selected = Array();
	this.copybuffer=null;
	this.wirenodes=Array();
/*selecting rectangle*/
	this.history=new Array(10);
	this.undolevel=0;	
	this.drag=0;	
	this.selectionRect = { x:0, y:0, width:0, height: 0 };
	this.wlist=['path','circle','rect','line','text','g','tspan'];
	this.mouseDown={x:0,y:0};
	this.viewoffset={x:0,y:0};
	
	this.init(this.container);

	this.onMouseDownListener = this.onMouseDown.bindAsEventListener(this);
	this.onMouseUpListener = this.onMouseUp.bindAsEventListener(this);
//	this.onDragStartListener=this.onDragStart.bindAsEventListener(this);	
	this.onMouseMove = this.onMouseMove.bindAsEventListener(this);	
	this.onWheelListener = this.onWheel.bindAsEventListener(this);	
	Event.observe(this.container, "mousewheel",this.onWheelListener);
	Event.observe(this.container, "DOMMouseScroll",this.onWheelListener);
	Event.observe(this.container, "dragover", this.onMouseMove);
//	Event.observe(this.container, "drop", this.onDragStart);
	Event.observe(this.container, "mousemove", this.onMouseMove); 
	Event.observe(this.container, "mousedown", this.onMouseDownListener);
	Event.observe(this.container, "mouseup", this.onMouseUpListener);

}

Schematic.prototype.undo=function(){
	if(this.undolevel>0){
		if(this.undolevel>0)this.undolevel--;
		console.log("undo "+ this.undolevel);
		this.remove($("webtronics_drawing"));
		this.svgRoot.insertBefore(this.history[this.undolevel].cloneNode(true),this.zoomtools);
		this.drawing=$("webtronics_drawing");
	}
}

Schematic.prototype.addhistory=function(){
	console.log("saving "+ this.undolevel);
	this.history[this.undolevel]=$('webtronics_drawing').cloneNode(true);
	if(this.undolevel>=10)this.history.shift();
	else this.undolevel++;
}

Schematic.prototype.redo=function(){
	if(this.history[this.undolevel+1]){
		if(this.undolevel<10)this.undolevel++;
		console.log("redo "+ this.undolevel+ 'history '+this.history.length);
		this.remove($("webtronics_drawing"));
		this.svgRoot.insertBefore(this.history[this.undolevel].cloneNode(true),this.zoomtools);
		this.drawing=$("webtronics_drawing");
	}
}




Schematic.prototype.init = function(elem) {

	this.container = elem;
	this.container.style.MozUserSelect = 'none';
	this.svgRoot = document.createElementNS(this.svgNs, "svg");
	this.svgRoot.setAttribute('xmlns',this.svgNs);
	this.svgRoot.setAttribute('width',2000);
	this.svgRoot.setAttribute('height',2000);

	this.container.appendChild(this.svgRoot);
/*set colors*/
	this.svgRoot.style.backgroundColor="inherit";
	this.container.style.backgroundColor="inherit";
/*create main group for pan/zoom*/		
	this.drawing=document.createElementNS(this.svgNs,'g');
	this.drawing.id='webtronics_drawing';
	this.svgRoot.appendChild(this.drawing);
/* create group for user info such as selection boxes */
	this.info=document.createElementNS(this.svgNs,'g');
	this.info.id="information";
	this.svgRoot.appendChild(this.info);
/*add the background*/
	this.graph=false
	this.showbackground();
/*add the toolbar*/
	this.addtools();
}

Schematic.prototype.addtools=function(){
	if($(this.zoomtools))this.remove(this.zoomtools);
	this.zoomtools=document.createElementNS(this.svgNs,'svg');
	this.zoomtools.setAttribute('xmlns:svg',this.svgNs);
	this.zoomtools.setAttribute('xmlns:xlink',"http://www.w3.org/1999/xlink");
	this.zoomtools.id='webtronics_zoomtools';
	this.zoomtools.setAttribute('width',this.container.offsetWidth);
	this.zoomtools.setAttribute('height',this.container.offsetHeight);			
	
/*add the image tools*/
	var normal=document.createElementNS(this.svgNs,'image');
	normal.setAttribute('x',0);
	normal.setAttribute('y',0);
	normal.setAttribute('width',32);
	normal.setAttribute('height',32);
	normal.setAttributeNS("http://www.w3.org/1999/xlink",'xlink:href',webtronicsPath+'/buttons/normal.png');
/* make sure the mouse events don't go through the image*/
	Event.observe(normal,"mousedown", function(e){e.stopPropagation();}.bind(this));
	Event.observe(normal,"mouseup", function(e){e.stopPropagation();}.bind(this));
	Event.observe(normal,"click", function(e){
			this.drawing.setAttribute('transform','matrix(1,0,0,1,0,0)');
			this.background.setAttribute('transform','matrix(1,0,0,1,0,0)');
			this.info.setAttribute('transform','matrix(1,0,0,1,0,0)');
			e.stopPropagation();}.bind(this));
	this.zoomtools.appendChild(normal);
	var grow=document.createElementNS(this.svgNs,'image');
	grow.setAttribute('x',(this.container.offsetWidth<this.svgRoot.getAttribute('width')?this.container.offsetWidth:this.svgRoot.getAttribute('width'))-32);
	grow.setAttribute('y',(this.container.offsetHeight<this.svgRoot.getAttribute('height')?this.container.offsetHeight:this.svgRoot.getAttribute('height'))-32);
	grow.setAttribute('width',32);
	grow.setAttribute('height',32);
	grow.setAttributeNS("http://www.w3.org/1999/xlink",'xlink:href',webtronicsPath+'/buttons/grow.png');
	Event.observe(grow,"mousedown", function(e){e.stopPropagation();}.bind(this));
	Event.observe(grow,"mouseup", function(e){e.stopPropagation();}.bind(this));
	Event.observe(grow,"click", function(e){
			if(this.svgRoot.getAttribute('width')<this.maxwidth&this.svgRoot.getAttribute('height')<this.maxheight){
				this.drawing.setAttribute('width',this.svgRoot.getAttribute('width')*2);
				this.drawing.setAttribute('height',this.svgRoot.getAttribute('height')*2);			
				this.svgRoot.setAttribute('width',this.svgRoot.getAttribute('width')*2);
				this.svgRoot.setAttribute('height',this.svgRoot.getAttribute('height')*2);			
			}
			this.showbackground();
			this.addtools();
			e.stopPropagation();}.bind(this));
	this.zoomtools.appendChild(grow);
	this.svgRoot.appendChild(this.zoomtools);
}

Schematic.prototype.showbackground=function(){
	if(this.background)this.remove(this.background);
	this.background=document.createElementNS(this.svgNs,'g');
	this.svgRoot.insertBefore(this.background,this.drawing);
	var canvas=	this.createrect('white',1,0,0,this.svgRoot.getAttribute('width'),this.svgRoot.getAttribute('height'));
	canvas.id='canvas';
	this.background.appendChild(canvas);
	this.background.id='webtronics_background';
	var matrix=this.parseMatrix(this.drawing);
	this.background.setAttribute('transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	
if(this.graph){
	var graph=document.createElementNS(this.svgNs,'g');
	this.background.appendChild(graph);
	graph.id='graph';
	for(var x=0;x<this.svgRoot.getAttribute('width');x+=this.grid){
		graph.appendChild(this.createline('lightgrey',0.5,x,0,x,this.svgRoot.getAttribute('height')));
	}
	for(var y=0;y<this.svgRoot.getAttribute('height');y+=this.grid){
		graph.appendChild(this.createline('lightgrey',0.5,0,y,this.svgRoot.getAttribute('width'),y));
	}
	}
}
Schematic.prototype.parseMatrix=function(group){
	var matrix={a:1,b:0,c:0,d:1,e:0,f:0};

	try{
		matrix=group.getTransformToElement(group.parentNode);
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
		var svg =this.createtext(lines[i],'black',this.mouseDown.x,this.mouseDown.y+(i*this.fontsize));
		this.drawing.appendChild(svg);
		this.select(svg);
		}

/* Wow this part is frustrating */

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
		var matrix=this.parseMatrix(elem);
		point.x=matrix.e-0;
		point.y=matrix.f-0;		
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
		try{
			var bbox=elem.getBBox();
		}
		catch(e){
			return {x:0,y:0,width:0,height:0};
			}

		var box={x:0,y:0,width:0,height:0};
		if(bbox){
			box.x=bbox.x;
			box.y=bbox.y;
			box.width=bbox.width;
			box.height=bbox.height;	
			
		}

		if(elem.tagName=='g'||elem.tagName=='svg'){
/*newer versions of firefox need this recursive part to get the right bounding box for some reason
otherwise the box width and height are zero if it only contains lines*/
			//if(box.width==0||box.height==0){
				for(var i= elem.childNodes.length;i>0;i--){
					if(elem.childNodes[i-1].nodeType==1){
						var chbox=this.tracker(elem.childNodes[i-1]);
						box.x=Math.min(box.x,chbox.x);
						box.y=Math.min(box.y,chbox.y);
						box.width=Math.max(chbox.x+chbox.width,box.width);
						box.height=Math.max(chbox.y+chbox.height,box.height);
						}	
					}
			//}

/*gets corrected bounding box*/
			var matrix=this.parseMatrix(elem);
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
		else if (elem.tagName=='line'){

			rect.x=box.x-1;
			rect.y=box.y-1;
			rect.width=box.width+2;
			rect.height=box.height+2;
		}		
		else {

			rect.x=box.x;
			rect.y=box.y;
			rect.width=box.width;
			rect.height=box.height;

		}
	//elem.rect=rect;
	//return rect;
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
/*center the  object?*/
	var box1=this.tracker(elem);	
	matrix=matrix.rotate(90);
	elem.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	var box2=this.tracker(elem);	
	var x=matrix.e+((box1.x+(box1.width/2))-(box2.x+(box2.width/2)));
	var y=matrix.f+((box1.y+(box1.height/2))-(box2.y+(box2.height/2))); 
	x=Math.round(x/this.grid)*this.grid;
	y=Math.round(y/this.grid)*this.grid;
	elem.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+x+','+y+')');

//	var trans=this.svgRoot.createSVGTransform();
//	trans.setRotate(90,0,0);
//	elem.transform.baseVal.appendItem(trans);
//	elem.transform.baseVal.consolidate();
//	var box2=this.tracker(elem);	
//	var x=box1.x-box2.x;
//	var y=box1.y-box2.y;
//	trans.setTranslate(x,y);
//	elem.transform.baseVal.appendItem(trans);
//	elem.transform.baseVal.consolidate();


	
	this.removeTracker();
	for(i=0;i<this.selected.length;i++)
		this.showTracker(this.selected[i]);		
};

Schematic.prototype.flip=function(elem){
	var matrix=this.parseMatrix(elem);
	var box=this.tracker(elem);	
	matrix=matrix.translate(box.width,0);
	matrix=matrix.flipX();

	matrix.e=Math.round(matrix.e/this.grid)*this.grid;
	matrix.f=Math.round(matrix.f/this.grid)*this.grid;

	elem.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	this.removeTracker();
	for(i=0;i<this.selected.length;i++)
		this.showTracker(this.selected[i]);		
	
	
}

Schematic.prototype.showTracker = function(elem) {
	var rect=this.tracker(elem);

  var tracked = document.createElementNS(this.svgNs, 'g');
  tracked.setAttributeNS(null, 'class', 'schematic_tracker');
	var svg=this.createrect('blue',0.35,rect.x,rect.y,rect.width,rect.height);
	tracked.appendChild(svg)

/*add gadgets*/
	if(elem.tagName=='g'){
		svg=this.createtext('rotate','blue',rect.x+rect.width,rect.y);
//		svg.rotatorfor=elem;
		Event.observe(svg,"mousedown", function(e){
			var data = $A(arguments);
			data.shift();							
			this.mode='rotate';
			this.rotate(data[0]);
			e.stopPropagation();}.bindAsEventListener(this,elem));
		tracked.appendChild(svg);

	}
	
	if (elem.getAttribute("flippable")=="true"){
		svg=this.createtext('flip','blue',rect.x,rect.y+rect.height+10);
		svg.rotatorfor=elem;
		Event.observe(svg,"mousedown", function(e){
			var data = $A(arguments);
			data.shift();							
			this.mode='rotate';
			this.flip(data[0]);
			e.stopPropagation();}.bindAsEventListener(this,elem));
		tracked.appendChild(svg);
	
	}
	this.info.appendChild(tracked);
	if(this.selected.length==1&&this.selected[0].tagName=='g'){
		$('webtronics_partvalue').clear();
		$$('.contextmenu [Title=Properties]')[0].setAttribute('class','enabled');
		$('webtronics_partvalue').value=this.selected[0].getAttribute('partvalue');
	}
	else{
		$$('.contextmenu [Title=Properties]')[0].setAttribute('class','disabled');
	}



}


Schematic.prototype.clearinfo=function(){
	this.remove(this.info);
	this.info=document.createElementNS(this.svgNs,'g');
	this.info.id="information";
	this.svgRoot.appendChild(this.info);
	var matrix=this.parseMatrix(this.drawing);
	this.info.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	this.info
	this.showallconnects();
	if($('invertfilter'))this.info.setAttribute('filter','url(#invertfilter)');

}


/*find all tracking boxes and delete them*/
Schematic.prototype.removeTracker=function(){
	/*id's are supposed to be unique*/
	var tracker=$$('.schematic_tracker');
	for(var i=0;i<tracker.length;i++){
		if(tracker[i].parentNode!=null)tracker[i].parentNode.removeChild(tracker[i]);
	}
	$$('.contextmenu [Title=Properties]')[0].setAttribute('class','disabled');
	//$('webtronics_value_box').hide();
}

Schematic.prototype.remove = function(shape) {
	if(shape){  
	this.hideconnects();
	if(shape.parentNode!=null)shape.parentNode.removeChild(shape);
	shape=null;
	this.showallconnects()
	}
}

Schematic.prototype.newdoc = function(){
	this.remove(this.svgRoot);	
	this.init(this.container);	
}


Schematic.prototype.invertcolors =function(check){
/* I can't get this to work in all browsers but it looks real good in firefox*/
	if(check){
		if(!$('invertfilter')){
			var defs=$$('defs')[0];
			if(!defs)defs=document.createElementNS(this.svgNs ,'defs');
			filter=document.createElementNS(this.svgNs ,'filter');
			filter.setAttributeNS(null,'id','invertfilter');
			var fecm=document.createElementNS(this.svgNs ,'feColorMatrix');
			fecm.setAttributeNS(null,'values',"-1  0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
			filter.appendChild(fecm);
			defs.appendChild(filter);
			this.svgRoot.appendChild(defs);
			this.drawing.setAttribute('filter','url(#invertfilter)');
			this.background.setAttribute('filter','url(#invertfilter)');
			this.info.setAttribute('filter','url(#invertfilter)');
		}

	}
	else {
		this.remove($('invertfilter'));
		this.drawing.removeAttribute('filter');
		this.background.removeAttribute('filter');
		this.info.removeAttribute('filter');
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
	var svg = document.createElementNS(this.svgNs, "svg");
	svg.setAttribute('xmlns',this.svgNs);
	for(var ch=0;ch<this.drawing.childNodes.length;ch++){
		svg.appendChild(this.drawing.childNodes[ch].cloneNode(true));
	}
/*need to remove the matrix to get the right size*/
	var matrix=this.parseMatrix(this.drawing);
	this.drawing.removeAttribute('transform');
	var svgsize=this.tracker(this.drawing);
	this.drawing.setAttribute('transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	svg.style.backgroundColor="#ffffff";
	svg.setAttributeNS(null,'width',svgsize.width+10);
	svg.setAttributeNS(null,'height',svgsize.height+10);
	return (new XMLSerializer()).serializeToString(svg);
}

//**********************************************************************


Schematic.prototype.deleteSelection = function() {
	this.drag=0;
	if(!this.selected.length)return; 
/*delete selected nodes*/  
	for(var i=this.selected.length;i>0;i--){
		if(this.selected[i-1].tagName=='g'&&$('value:'+this.selected[i-1].id))
			this.remove($('value:'+this.selected[i-1].id));
		this.remove(this.selected[i-1]);
	 	this.selected.pop();
	}
/*delete all trackers*/
	this.removeTracker();
}

Schematic.prototype.createvalue=function(elem){
/*create value text if attribute exists*/
	var value=elem.getAttribute('partvalue');
	if(value){
		if(!$('value:'+elem.id)){
			box=this.tracker(elem);	
			var svg=this.createtext(value,'black',box.x,box.y);
			svg.id='value:'+elem.id;
			this.drawing.appendChild(svg);
		}
		else{
				$('value:'+elem.id).removeChild($('value:'+elem.id).firstChild);
				$('value:'+elem.id).appendChild(document.createTextNode(value));
			
		}	
	}
/* if there is no value and a value text exists remove it*/	
	else if($('value:'+elem.id))this.remove($('value:'+elem.id));
}


Schematic.prototype.select = function(elem) {


  	this.selected.push(elem);
	if(elem.tagName=='g'&&!$('value:'+elem.id))this.createvalue(elem);
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
		this.remove($('templine1'));
		return;
	}
	var lines=this.drawing.childNodes;	
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
					this.drawing.appendChild(this.createline('black',2,lx1,ly1,x1,y1));
					this.drawing.appendChild(this.createline('black',2,x1,y1,lx2,ly2));
					this.drawing.appendChild(this.createdot('black',x1,y1));
					this.remove($('templine1'));
					return;
                                }
                }
        }
}

/*check if selection rectangle overlaps part*/
Schematic.prototype.getPart=function(){

        for(var i=0;i<this.drawing.childNodes.length;i++){
                var part=this.drawing.childNodes[i];
                if(part.nodeType==1){
                        if(part.id!='information'&&part.parentNode.id!='information'){

                                var rect=this.tracker(part);
                                if(Utils.rectsIntersect(rect,this.selectionRect)){
									this.select(part);               
                                }
                        }
                }
        }
}


Schematic.prototype.realPosition=function(event){
	var real=this.svgRoot.createSVGPoint();
	var offset = this.container.cumulativeOffset();
/*this section gets the pointer position relative to the window and scrollbars
 * I'm using this for now until something better comes up
 */
	var matrix=this.parseMatrix(this.drawing);
	real.x=(Event.pointerX(event)-offset[0]-matrix.e)/matrix.a;
	real.y=(Event.pointerY(event)-offset[1]-matrix.f)/matrix.a;
	return real;
}

/*mousedown event handler*/
Schematic.prototype.onMouseDown = function(event){
if(!this.drag){
	var real=this.realPosition(event);
	this.mouseDown.x = Math.round(real.x/this.grid) * this.grid;
	this.mouseDown.y =Math.round(real.y/this.grid) * this.grid;
	if (!Event.isLeftClick(event))return;
	  
		if (this.mode == 'line') {
			if($('templine1')){
				/*create line*/
				var x1=$('templine1').getAttributeNS(null,'x1');
				var y1=$('templine1').getAttributeNS(null,'y1');
				var x2=$('templine1').getAttributeNS(null,'x2');
				var y2=$('templine1').getAttributeNS(null,'y2');
				if(!(x1==x2&&y1==y2)){
					var svg=this.createline('black',2, x1, y1,x2, y2);
					/*since the id is never used don't create one
					svg.id='line:'+createUUID();
					*/
					this.drawing.appendChild(svg);
					this.remove($('templine1'));
					this.connect(x1, y1);
					if($('templine2'))$('templine2').id='templine1';					
					else{
						svg = this.createline('blue',2, x2, y2,x2,y2);
						svg.id = 'templine1';
						svg.setAttributeNS(null,'stroke-dasharray','3,2');
						this.info.appendChild(svg);
					}					
					this.connect(x2, y2);
					
				}
				
			}
	/*create temperary line*/
			else{
				var svg = this.createline('blue',2, this.mouseDown.x, this.mouseDown.y,	this.mouseDown.x, this.mouseDown.y);
				svg.id = 'templine1';
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
			selection = this.createrect('blue',0.35,real.x,real.y,0,0);
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

Schematic.prototype.onDragStart=function(event){
alert('dragging');
}

Schematic.prototype.dragSelection=function(x ,y){
	var floating=$('schematic_floating');
	if(!floating){
		floating = document.createElementNS(this.svgNs, 'g');
		for(var i=0;i<this.selected.length;i++){
			floating.appendChild(this.selected[i]);
	/*if a part is selected also get label*/
			if(this.selected[i].tagName=='g'&&$('value:'+this.selected[i].id)){
				floating.appendChild($('value:'+this.selected[i].id));
			}
			if(this.selected[i].tagName=='g'&&$('number:'+this.selected[i].id)){
				floating.appendChild($('number:'+this.selected[i].id));
			}
		}

		var tracked=$$('.schematic_tracker');

		for(var i=0;i<tracked.length;i++)floating.appendChild(tracked[i]);

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
			shape.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+(matrix.e+x)+','+(matrix.f+y)+')');
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
		if(floating.childNodes[i-1].getAttribute('class')!='schematic_tracker'){
			this.drawing.appendChild(floating.childNodes[i-1]);
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


Schematic.prototype.onMouseMove = function(event) {

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

		
		
	else if (this.mode=='line'){
		if ($('templine1')){
			
			var x=$('templine1').getAttribute('x1')-0;
			var y=$('templine1').getAttribute('y1')-0;
			

			if(Math.abs(x-real.x)>=Math.abs(y-real.y)){
				
				this.resize($('templine1'), x, y, mouseAt.x, y);
				this.remove($('templine2'));	
				var svg = this.createline('blue',2, mouseAt.x, y, mouseAt.x, mouseAt.y);
				svg.id = 'templine2';
				svg.setAttributeNS(null,'stroke-dasharray','3,2');
				this.info.appendChild(svg);

	
			}
			else{
							
				this.resize($('templine1'), x, y, x, mouseAt.y);
				this.remove($('templine2'));	
				var svg = this.createline('blue',2, x, mouseAt.y, mouseAt.x, mouseAt.y);
				svg.id = 'templine2';
				svg.setAttributeNS(null,'stroke-dasharray','3,2');
				this.info.appendChild(svg);

			}
			
		}
	
	}
}

Schematic.prototype.onWheel=function(event){
	if(Event.element(event)!=this.svgRoot){
		var real=this.realPosition(event);
		var scale=1;
		var wheel=0;
		if(event.wheelDelta)wheel=-event.wheelDelta;
		else wheel=event.detail;
		var matrix = this.parseMatrix(this.drawing);
	
		if(wheel>0&&matrix.a<2){
			scale=1.2;
		}
		else if(wheel<0&&matrix.a>0.3){
			scale=0.8;
		}
			matrix=matrix.scale(scale);
			matrix.e=(this.container.offsetWidth/2)-(real.x*matrix.a);
			matrix.f=(this.container.offsetHeight/2)-(real.y*matrix.a);
			//this.svgRoot.setAttribute('width',this.svgRoot.getAttribute('width')*scale);
			//this.svgRoot.setAttribute('height',this.svgRoot.getAttribute('height')*scale);
			//console.log(matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f);
			this.drawing.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
			this.background.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
			this.info.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	}	
	Event.stop(event);
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
		if(this.drag)return;
		this.unselect();
		var newelem=document.importNode(elem,true);
		this.drawing.appendChild(newelem);
		this.mouseDown.x=0;
		this.mouseDown.y=0;
		
		newelem.setAttributeNS(null,'transform','matrix(1,0,0,1,'+this.mouseDown.x+','+this.mouseDown.y+')');
		newelem.setAttribute('partvalue',''); 
		this.changeid(newelem);
		this.select(newelem);
		this.drag=1;
}

Schematic.prototype.sanitize=function(elem){
	var script=(new XMLSerializer()).serializeToString(elem).extractScripts(); 
	if(script!='')return script;
	var elems=elem.getElementsByTagName('*');
	for(var i=0;i<elems.length;i++){
		var count=0;
		for(;count<this.wlist.length;count++){
			if(elems[i].tagName==this.wlist[count])break;
		}
		if(count==this.wlist.length)return elems[i].tagName;	
	} 
	return '';
}

Schematic.prototype.getfile =function(elem){
	webtronics.circuit.addhistory();
	this.unselect();
	var result=this.sanitize(elem)
	if(result!=''){
		alert ('this file contains \n'+result+ '\n unacceptable elements\n');
		return;
	}

	ch=elem.childNodes;
	for(var i= ch.length;i>0;i--){
/*only open these nodes*/
/*get rid  of empty text*/
/*delete values*/

		if(ch[i-1].tagName=='circle'||
			ch[i-1].tagName=='line'||
			(ch[i-1].tagName=='text'&&ch[i-1].hasChildNodes()&&this.getparttype(ch[i-1])!='value'))
			{
			this.changeid(ch[i-1]);		
			var newelem	= document.importNode(ch[i-1],true);
			this.drawing.appendChild(newelem);
			this.select(newelem);
		}
/*first put the elements in the document then change the id*/
		if(ch[i-1].tagName=='g'){
			var oldid=ch[i-1].id
			var newelem	= document.importNode(ch[i-1],true);
			this.drawing.appendChild(newelem);
			this.changeid(newelem);		
/*if there is a partvalue attribute find the value, set the id to the new id */								
			if(newelem.getAttribute('partvalue')){
				var oldvalue = elem.ownerDocument.getElementById('value:'+oldid);
				if(oldvalue!=null){
					//console.log('found value');
					var newvalue= document.importNode(oldvalue,true);
					this.drawing.appendChild(newvalue);
					this.select(newvalue);
					newvalue.id='value:'+newelem.id;		
				}
			}
			this.select(newelem);

		}
	}

	
}

Schematic.prototype.copy=function(){
	this.copybuffer=document.createElementNS(this.svgNs, 'g');
	for(var i=0;i<this.selected.length;i++){
		var svgnode=this.selected[i].cloneNode(true);
		var newnode=this.copybuffer.appendChild(svgnode);
		//console.log('copying');
		//var point=this.parseXY(newnode);
		//this.move(newnode,(point.x-this.mouseDown.x),(point.y-this.mouseDown.y));
	}
}

Schematic.prototype.paste=function(){
	if(this.copybuffer){
		//console.log('pasting');
		this.getfile(this.copybuffer);
		this.drag=1;
		this.remove(this.copybuffer);
	}
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
		docfromtext:function(txt){
			var xmlDoc;
			if (window.DOMParser){
				parser=new DOMParser();
				xmlDoc=parser.parseFromString(txt,"text/xml");
			}
			else{ // Internet Explorer
				xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async="false";
				xmlDoc.loadXML(txt);
			} 
			return xmlDoc;
		},

		openfile:function(Name){
			var xmldoc;
			new Ajax.Request(Name,{
			method:'get',
			asynchronous:false,
			contentType:"text/xml",
			onSuccess: function(transport){
				/*this overrides the mimetype to xml for ie9*/
				xmldoc=(new DOMParser()).parseFromString(transport.responseText,"text/xml");
				},
			onFailure: function(){ alert('Something went wrong...'); },
			onException: function(req,exception) {
				alert(exception);
				return true;
				}, 
			});
			return xmldoc;
		},


	"encode64" : function(input) {
//probably won't work on older browsers
		return window.btoa(input);

	},

	"decode64" : function (input) {


			return  window.atob(input);
	 
		},

	"rectsIntersect": function(r1, r2) {
		
		return			((r2.width>0)?(r2.x):(r2.x+r2.width)) < ((r1.width>0)?(r1.x+r1.width):(r1.x)) &&
			((r2.width>0)?(r2.x+r2.width):(r2.x)) > ((r1.width>0)?(r1.x):(r1.x+r1.width)) &&
			((r2.height>0)?(r2.y):(r2.y+r2.height)) < ((r1.height>0)?(r1.y+r1.height):(r1.y)) &&
			((r2.height>0)?(r2.y+r2.height):(r2.y)) > ((r1.height>0)?(r1.y):(r1.y+r1.height));


	}

	
}

