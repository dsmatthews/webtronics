Schematic.prototype.createtext = function(str,color,x,y){
  var svg;
/*remove whitespace at beginning and end*/
	/*don't make empty text nodes*/
	svg = this.container.ownerDocument.createElementNS(this.svgNs, 'text');
	svg.setAttributeNS(null, 'x', x);
	svg.setAttributeNS(null, 'y', y);
	svg.setAttributeNS(null, 'font-size', 12);
	svg.setAttributeNS(null, 'stroke', color);
	svg.appendChild(this.container.ownerDocument.createTextNode(str));
	return svg;
}

Schematic.prototype.createline = function(lineColor,left, top,right,bottom){
  var svg;

				
  svg = document.createElementNS(this.svgNs, 'line');
	
  svg.setAttributeNS(null, 'x1', left);
  svg.setAttributeNS(null, 'y1', top);
	svg.setAttributeNS(null, 'x2', right);
	svg.setAttributeNS(null, 'y2', bottom );
  svg.style.position = 'absolute';

  if (lineColor.length == 0)
    lineColor = 'none';
  svg.setAttributeNS(null, 'stroke', lineColor);
  svg.setAttributeNS(null, 'stroke-width', 2);
      
  return svg;

}

Schematic.prototype.createrect = function(color,x, y,width,height){

 	var svg = document.createElementNS(this.svgNs, 'rect');
	svg.setAttributeNS(null, 'x', x);
 	svg.setAttributeNS(null, 'y', y);
  	svg.setAttributeNS(null, 'width', width);
  	svg.setAttributeNS(null, 'height', height);
	svg.setAttributeNS(null, 'fill-opacity', .35);
 	svg.setAttributeNS(null, 'fill', color);
  	svg.setAttributeNS(null, 'stroke', color);
  	svg.setAttributeNS(null, 'stroke-width', '1');
	return svg;

}


Schematic.prototype.createdot =function(lineColor,x,y){

  var svg;

				
  svg = this.container.ownerDocument.createElementNS(this.svgNs, 'circle');
  svg.setAttributeNS(null, 'cx', x);
  svg.setAttributeNS(null, 'cy', y);
  svg.setAttributeNS(null, 'r', 3 );

  svg.style.position = 'absolute';

  if (lineColor.length == 0)
    lineColor = 'none';
  svg.setAttributeNS(null, 'stroke', lineColor);
  svg.setAttributeNS(null, 'fill', lineColor);
      
  return svg;
}


