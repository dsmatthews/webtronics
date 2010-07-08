/*----------------------------------------------------------------------------
 RICHDRAW 1.0
 Vector Graphics Drawing Script
 -----------------------------------------------------------------------------
 Created by Mark Finkle (mark.finkle@gmail.com)
 Implementation of simple vector graphic drawing control using SVG or VML.
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
 Dependencies: (SVG or VML rendering implementations)
 History:
 2006-04-05 | Created
 --------------------------------------------------------------------------*/

var svgNamespace = 'http://www.w3.org/2000/svg';

function Schematic(elem) {
  this.container = elem;
  this.grid = 10;
	this.svgRoot = null;
	this.Zoom =2000;
	this.zoomRatio=1;
	this.mode = '';
  this.lineColor = 'black';
  this.lineWidth = 2;
/*array of nodes*/
  this.selected = Array();
/*selecting rectangle*/
  this.selectionRect = { x:0, y:0, width:0, height: 0 };
	this.drag=0;	
	this.mouseDown={x:0,y:0};
	this.mouseAt={x:0,y:0};
	this.lastclick={x:0,y:0};
	
	this.init(this.container);
	this.onMouseDownListener = this.onMouseDown.bindAsEventListener(this);
	this.onMouseUpListener = this.onMouseUp.bindAsEventListener(this);
	this.onMouseOutListener = this.onMouseOut.bindAsEventListener(this);
	this.onDragListener = this.onDrag.bindAsEventListener(this);

	Event.observe(this.container, "mousemove", this.onDragListener); 
	Event.observe(this.container, "mouseout", this.onMouseOutListener); 
	Event.observe(this.container, "mousedown", this.onMouseDownListener);
	Event.observe(this.container, "mouseup", this.onMouseUpListener);

}


Schematic.prototype.zoom = function(){


  if(this.Zoom>=5000)this.Zoom=2000;
	else this.Zoom+=200;
  this.svgRoot.setAttributeNS(null,'width',2000);
  this.svgRoot.setAttributeNS(null,'height',2000);
  this.svgRoot.setAttributeNS(null,'viewBox','0 0 '+this.Zoom +' '+ this.Zoom );
	this.zoomRatio=2000/this.Zoom;
}
	



Schematic.prototype.init = function(elem) {

	this.container = elem;
	this.container.style.MozUserSelect = 'none';
	this.svgRoot = this.container.ownerDocument.createElementNS(svgNamespace, "svg");
	this.svgRoot.setAttribute('xmlns',svgNamespace);
	this.container.appendChild(this.svgRoot);

	}

Schematic.prototype.parseMatrix=function(group){

	return group.getTransformToElement(this.svgRoot);
};


Schematic.prototype.rotate=function(){
if(this.selected.length>1||!this.selected[0])return;
if(this.selected[0].tagName!='g')return;
	var matrix=this.parseMatrix(this.selected[0]);
	matrix=matrix.rotate(90);

	if(this.selected[0].id=='Q'||this.selected[0].id=='opamp'){
		if(matrix.b<0){
matrix.c=matrix.c*-1;
//			matrix=matrix.flipX();
		}
	}
	
	this.selected[0].setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	this.removeTracker();
	this.showTracker(this.selected[0]);		
}


Schematic.prototype.createtext = function(str){
  var svg;
	var lines=str.split('\n');
	for(var i=0; i<lines.length;i++){
		svg = this.container.ownerDocument.createElementNS(svgNamespace, 'text');
		svg.setAttributeNS(null, 'x', 50);
		svg.setAttributeNS(null, 'y', 50+(i*12));
		svg.setAttributeNS(null, 'font-size', 12);
		svg.appendChild(this.container.ownerDocument.createTextNode(lines[i]));
		this.svgRoot.appendChild(svg);
		this.select(svg);
	}

}
Schematic.prototype.createline = function(lineColor,left, top,right,bottom){
  var svg;

				
  svg = this.container.ownerDocument.createElementNS(svgNamespace, 'line');
	
  svg.setAttributeNS(null, 'x1', left);
  svg.setAttributeNS(null, 'y1', top);
	svg.setAttributeNS(null, 'x2', right);
	svg.setAttributeNS(null, 'y2', bottom );
  svg.style.position = 'absolute';

  if (lineColor.length == 0)
    lineColor = 'none';
  svg.setAttributeNS(null, 'stroke', lineColor);
  svg.setAttributeNS(null, 'stroke-width', 2);
      
  this.svgRoot.appendChild(svg);
  return svg;


}

Schematic.prototype.createdot =function(lineColor,x,y){

  var svg;

				
  svg = this.container.ownerDocument.createElementNS(svgNamespace, 'circle');
  svg.setAttributeNS(null, 'cx', x);
  svg.setAttributeNS(null, 'cy', y);
  svg.setAttributeNS(null, 'r', 3 );

  svg.style.position = 'absolute';

  if (lineColor.length == 0)
    lineColor = 'none';
  svg.setAttributeNS(null, 'stroke', lineColor);
      
  this.svgRoot.appendChild(svg);
  return svg;
}

Schematic.prototype.remove = function(shape) {
	if(shape){  
	shape.parentNode.removeChild(shape);
	shape=null;
	}
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
};

Schematic.prototype.move = function(shape, x, y) {
	var rect=shape.getBBox();
	if (shape.tagName == 'line') {
		shape.setAttributeNS(null, 'x1', x);
		shape.setAttributeNS(null, 'y1', y);	
		shape.setAttributeNS(null, 'x2', x + rect.width);
		shape.setAttributeNS(null, 'y2', y + rect.height);
	}
	else if(shape.tagName=='circle'){
		 shape.setAttributeNS(null, 'cx', x);
		 shape.setAttributeNS(null, 'cy', y);
	}
	else if(shape.tagName == 'g'){
		var matrix=this.parseMatrix(shape);
		/*if the group has no transform create one*/
		if(matrix.a==0&&matrix.b==0&&matrix.c==0&&matrix.d==0){
		shape.setAttributeNS(null,'transform','matrix(1,0,0,1,'+x+','+y	+')');
		}
		else shape.setAttributeNS(null,'transform','matrix('+matrix.a+','+matrix.b+','+matrix.c+','+matrix.d+','+matrix.e+','+matrix.f+')');
	}
	else {
		shape.setAttributeNS(null, 'x', x);
		shape.setAttributeNS(null, 'y', y);
	}
};



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

};


Schematic.prototype.tracker = function(elem) {
	var rect=Object();
	if(elem&&(elem.nodeType==1)){	
		var box=elem.getBBox();
		if(elem.tagName=='g'){
/*get all child element x+width y+height because firefox doesn't get group boxes right*/
				

				for(var i= elem.childNodes.length;i>0;i--){
					if(elem.childNodes[i-1].nodeType==1){
						var chbox=elem.childNodes[i-1].getBBox();
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
Schematic.prototype.showTracker = function(elem) {
	var rect=this.tracker(elem);
  tracked = document.createElementNS(svgNamespace, 'rect');
  tracked.setAttributeNS(null, 'id', 'tracker');
	tracked.setAttributeNS(null, 'x', rect.x);
 	tracked.setAttributeNS(null, 'y', rect.y);
  tracked.setAttributeNS(null, 'width', rect.width);
  tracked.setAttributeNS(null, 'height', rect.height);
	tracked.setAttributeNS(null, 'fill-opacity', .35);
 	tracked.setAttributeNS(null, 'fill', 'blue');
  tracked.setAttributeNS(null, 'stroke', 'blue');
  tracked.setAttributeNS(null, 'stroke-width', '1');
 this.svgRoot.appendChild(tracked);
}
/*find all tracking boxes and delete them*/
Schematic.prototype.removeTracker=function(){
	
	var tracker=this.container.ownerDocument.getElementById('tracker')
	if(tracker){
		do{
		this.remove(tracker);
		tracker=this.container.ownerDocument.getElementById('tracker');

		}while(tracker)
		
	}	
	
}

Schematic.prototype.getMarkup = function() {
	this.unselect();
	this.svgRoot.removeAttributeNS(null,'viewBox');
	this.svgRoot.removeAttributeNS(null,'width');
	this.svgRoot.removeAttributeNS(null,'height');
//	var p = new DOMParser();
//	var doc=p.parseFromString((new XMLSerializer()).serializeToString(this.svgRoot),"text/xml");
//	var svg=doc.getElementById('svg');
//	svg.setAttribute('xmlns',svgNamespace);
	return (new XMLSerializer()).serializeToString(this.svgRoot);

};

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
};


Schematic.prototype.select = function(elem) {

  this.selected.push(elem);
  this.showTracker(this.selected[this.selected.length-1]);
};


Schematic.prototype.unselect = function() {
	for(var i=this.selected.length;i>0;i--){
		this.selected[i-1]=null;
		this.selected.pop();
		}
	this.removeTracker();

};





Schematic.prototype.connect =function(x1,y1,x2,y2){
	

	for(var line=this.svgRoot.firstChild;line!=null;line=line.nextSibling){
		if(line.tagName=='line'){
			var lx1=line.getAttributeNS(null,"x1")-0;			
			var lx2=line.getAttributeNS(null,"x2")-0;			
			var ly1=line.getAttributeNS(null,"y1")-0;			
			var ly2=line.getAttributeNS(null,"y2")-0;			
/*one is horizontal and the other vertical*/
			if(x1==x2 && ly1==ly2){
/*x1 is in between lx1 and lx2*/
				if((lx1<lx2 && x1>lx1 && x1<lx2)||(lx1>lx2 && x1<lx1 && x1>lx2)){
/*y1 or y2 is the same as ly1 or ly2*/						
					if(y1==ly1||y1==ly2||y2==ly1||y2==ly2){
						this.selected[0]=this.createdot(this.lineColor,x1,y1);
						this.selected[0].id = 'shape:' + createUUID();
					}
				}
			}			
/*one is vertical and the other horizontal*/
			if(y1==y2 && lx1==lx2){
/*y1 is in between ly1 and ly2 even if l2 is lower*/
				if((ly1<ly2 && y1>ly1 && y1<ly2)||(ly1>ly2 && y1<ly1 && y1>ly2)){
/*x1 or x2 is the same as lx1 or lx2*/						
					if(x1==lx1||x1==lx2||x2==lx1||x2==lx2){
						this.selected[0]=this.createdot(this.lineColor,x1,y1);
						this.selected[0].id = 'shape:' + createUUID();
					}
				}
			}			
		}
	}
};

/*check if selection rectangle overlaps part*/
Schematic.prototype.getPart=function(){

	for(var i=0;i<this.svgRoot.childNodes.length;i++){
		var part=this.svgRoot.childNodes[i];
		if(part.nodeType==1){
			if(part.getAttributeNS(null,'id')!='tracker'&&
				part.getAttributeNS(null,'id')!='selection'&&
				part.getAttributeNS(null,'id')!='floating'){
		

				var rect=this.tracker(part);
				if(Utils.rectsIntersect(rect,this.selectionRect)){
					this.select(part);
						
				}
			}
		}
	}
};
/*mouseout event handler*/
Schematic.prototype.onMouseOut = function(event){
/*  this.selectionRect = { x:0, y:0, width:0, height: 0 };
//	this.drag=0;	
	this.mouseDown={x:0,y:0};
	this.mouseAt={x:0,y:0};
*/
}

/*mousedown event handler*/
Schematic.prototype.onMouseDown = function(event){
	var offset = this.container.cumulativeOffset();
	var soffset=this.container.cumulativeScrollOffset();
	var realX=Math.round((Event.pointerX(event) - offset[0]+soffset[0])/this.zoomRatio);
	var realY=Math.round((Event.pointerY(event) - offset[1]+soffset[1])/this.zoomRatio);
	this.mouseDown.x = Math.round(realX/this.grid) * this.grid;
	this.mouseDown.y =Math.round(realY/this.grid) * this.grid;
	var x=0;
	var y=0;
	  
	if (Event.isLeftClick(event)){
		if (this.mode == 'line') {
			if(this.selected[0]){
				if (this.selected[0].tagName=='line'){
/*save last click positionas end of line*/

					x=this.selected[0].getAttributeNS(null,"x2");						
					y=this.selected[0].getAttributeNS(null,"y2");						

				}
	/*remove lines that are zero length*/

					if(Math.abs(parseInt(this.selected[0].getAttributeNS(null,"x1"))-parseInt(this.selected[0].getAttributeNS(null,"x2")))<10 &&
						Math.abs(parseInt(this.selected[0].getAttributeNS(null,"y1"))-parseInt(this.selected[0].getAttributeNS(null,"y2")))<10){	
						this.deleteSelection();
					}
			}

			if(x || y){
			  this.lastclick.x = x;
			  this.lastclick.y = y;
			}
			else{
				this.lastclick.x = this.mouseDown.x;
				this.lastclick.y = this.mouseDown.y;
			}
			/*check all lines for dots*/
				
			this.connect(this.lastclick.x, this.lastclick.y,this.lastclick.x, this.lastclick.y);
			
		  this.selected[0] = this.createline(this.lineColor, this.lastclick.x, this.lastclick.y,this.lastclick.x, this.lastclick.y);
		  this.selected[0].id = 'line:' + createUUID();

		}
/*clicked on background  in select mode ,remove selection*/
		if(this.mode=='select'){
			if (this.lastclick.x != this.mouseDown.x || this.lastclick.y != this.mouseDown.y){	
					this.selectionRect.x=this.mouseDown.x;
					this.selectionRect.y=this.mouseDown.y;
					this.selectionRect.width=1;
					this.selectionRect.height=1;
				  selection = document.createElementNS(svgNamespace, 'rect');
					selection.setAttributeNS(null, 'id', 'selection');
				  selection.setAttributeNS(null, 'x', realX );
 					selection.setAttributeNS(null, 'y', realY );
					selection.setAttributeNS(null, 'width', 0);
					selection.setAttributeNS(null, 'height', 0);
					selection.setAttributeNS(null, 'fill-opacity', .35);
					selection.setAttributeNS(null, 'fill', 'blue');
					selection.setAttributeNS(null, 'stroke', 'blue');
					selection.setAttributeNS(null, 'stroke-width', '1');
					this.svgRoot.appendChild(selection);
			}
	for(var i=0;i<this.selected.length;i++){
		if(Utils.rectsIntersect(this.selectionRect,this.tracker(this.selected[i])))this.drag=1;
		}
		}
		if(this.mode=='delete'){
			this.deleteSelection();	
		}
	}
/*right click */
	else{
		if(this.mode=='line'){
			if(this.selected[0]){
				
				x=0;
				y=0;
				if(this.selected[0]){
					this.remove(this.selected[0]);
					this.unselect();
				}
			}			
		}
		//if(this.mode=='select'){this.createMenu(realX,realY)}
		
	}	  
  return false;
};



Schematic.prototype.dragSelection=function(x ,y){
	var floating=document.getElementById('floating');
	if(!floating){
		floating = this.container.ownerDocument.createElementNS(svgNamespace, 'g');
		for(var i=0;i<this.selected.length;i++){
			floating.appendChild(this.selected[i]);
		}
		var tracked=this.container.ownerDocument.getElementById('tracker');
		do{
			if(tracked){
				floating.appendChild(tracked);
				tracked=this.container.ownerDocument.getElementById('tracker');
			}
		}while(tracked);
		floating.setAttributeNS(null, 'id', 'floating');
	  this.svgRoot.appendChild(floating);
	}
	floating.setAttributeNS(null,'transform','matrix(1,0,0,1,'+x+','+y+')');
	//this.unselect();
	
};

Schematic.prototype.dropSelection=function(){
	var floating=document.getElementById('floating');
	var matrix=this.parseMatrix(floating);
	for(var i=floating.childNodes.length;i>0;i--){
		var point=this.parseXY(floating.childNodes[i-1]);
		this.move(floating.childNodes[i-1],point.x + matrix.e,point.y +  matrix.f);
		if(floating.childNodes[i-1].id!='tracker'){
			this.svgRoot.insertBefore(floating.childNodes[i-1],this.svgRoot.childNodes[0]);
		
		}
		else this.svgRoot.appendChild(floating.childNodes[i-1]);

	}
	this.remove(floating);	
};



Schematic.prototype.onMouseUp = function(event) {


if(this.mode=='select'){
	var floating=document.getElementById('floating');
	if(floating){
		this.dropSelection();
	}
	else{
		this.unselect();
		this.getPart();
	}
		this.drag=0;	
	var selection = document.getElementById('selection');
	if (selection) {
    this.remove(selection);
		this.selectionRect.x=0;
		this.selectionRect.y=0;
		this.selectionRect.width=0;
		this.selectionRect.height=0;
 	 }
	}
};


Schematic.prototype.onDrag = function(event) {

  var offset = this.container.cumulativeOffset();
	var soffset=this.container.cumulativeScrollOffset();
 	var realX=Math.round((Event.pointerX(event) - offset[0]+soffset[0])/this.zoomRatio);
	var realY=Math.round((Event.pointerY(event) - offset[1]+soffset[1])/this.zoomRatio);
	this.mouseAt.x = Math.round(realX / this.grid) * this.grid;
	this.mouseAt.y =Math.round(realY / this.grid) * this.grid;


	if(this.mode=='select'){
/*clicked inside bounds*/

		if(this.drag){
			//this.removeTracker();			
			this.dragSelection(this.mouseAt.x-this.mouseDown.x,this.mouseAt.y-this.mouseDown.y);
		}
		else{
		var selection = document.getElementById('selection');
		if (selection) {
			if(this.selected.length)this.unselect();
			this.selectionRect.width=realX-this.selectionRect.x;
			this.selectionRect.height=realY-this.selectionRect.y;
			selection.setAttributeNS(null,'width', this.selectionRect.width);
			selection.setAttributeNS(null,'height',this.selectionRect.height);
			}
		}
	}

	if (this.mode=='line')
	{
		if (this.selected[0]){
			
			this.resize(this.selected[0], this.lastclick.x, this.lastclick.y, this.mouseAt.x, this.mouseAt.y);
		}
	}
};



Schematic.prototype.getgroup =function(elem){
		var newelem=document.importNode(elem,true);
		this.svgRoot.appendChild(newelem);
		newelem.setAttributeNS(null,'transform','matrix(1,0,0,1,0,0)')
		this.select(newelem);
//		this.drag=1;
//		this.dragSelection(0,0);
		}

Schematic.prototype.getfile =function(elem){

ch=elem.childNodes;
for(var i= ch.length;i>0;i--){
/*only open these nodes*/
		if(ch[i-1].tagName=='circle'||ch[i-1].tagName=='line'||ch[i-1].tagName=='text'||ch[i-1].tagName=='g'){
			var newelem	= document.importNode(ch[i-1],true);
			this.svgRoot.appendChild(newelem);
			this.select(newelem);
		}
	}

	
};

function createUUID()
{
  return [4, 2, 2, 2, 6].map(function(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
      var uuidchar = parseInt((Math.random() * 256)).toString(16);
      if (uuidchar.length == 1)
        uuidchar = "0" + uuidchar;
      uuidpart += uuidchar;
    }
    return uuidpart;
  }).join('-');
};

var Utils = {

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//           also precalculate the size of the array needed.

	"_keyStr" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	"encode64" : function(input) {
		// base64 strings are 4/3 larger than the original string
		var output = new Array( Math.floor( (input.length + 2) / 3 ) * 4 );
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0, p = 0;

		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output[p++] = this._keyStr.charAt(enc1);
			output[p++] = this._keyStr.charAt(enc2);
			output[p++] = this._keyStr.charAt(enc3);
			output[p++] = this._keyStr.charAt(enc4);
		} while (i < input.length);

		return output.join('');
	},

	"rectsIntersect": function(r1, r2) {
		return r2.x < (r1.x+r1.width) && 
			(r2.x+r2.width) > r1.x &&
			r2.y < (r1.y+r1.height) &&
			(r2.y+r2.height) > r1.y;
	}

	
}

