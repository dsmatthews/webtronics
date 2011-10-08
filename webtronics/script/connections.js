

Schematic.prototype.getconnects=function(elem){
	var pins= Array();
	var str=elem.getAttribute("connects");
	if(!str)return null;
	var points=str.split(';');
	for(var i=0;i<points.length;i++){
		pins[i]={x:0,y:0};			
		pins[i].x=points[i].split(',')[0]-0;
		pins[i].y=points[i].split(',')[1]-0;
	}			
/* add transform to connects*/
	var matrix=this.parseMatrix(elem);
	var pin=this.svgRoot.createSVGPoint();
	for(var i=0;i<pins.length;i++){
		pin.x = pins[i].x;
		pin.y = pins[i].y;
		pin = pin.matrixTransform(matrix);
		pins[i].x=Math.round(pin.x);
		pins[i].y=Math.round(pin.y);
	}

 return pins;
}

Schematic.prototype.followline=function(elem){



}

Schematic.prototype.addconnects=function(elem,pin){
	var pins=this.getconnects(elem);
	var str;
	if(!pins){
		str=pin.x+','+pin.y;
		elem.setAttribute('connects',str);
	}
	else {
		str=this.writeconnects(pins);
		str+=';'+pin.x+','+pin.y;
		elem.setAttribute('connects',str);
	}

}


Schematic.prototype.writeconnects=function(pins){

	var str=Array();
	
	for(var i=0;i<pins.length;i++){
		str[i] = pins[i].x +','+pins[i].y;
	}
	return str.join(';'); 
}

Schematic.prototype.isconnect=function(pin,radius,x,y){
	return ((pin.x+radius)>x)&&((pin.x-radius)<x)&&
		((pin.y+radius)>y)&&((pin.y-radius)<y);
}


Schematic.prototype.isconnects=function(radius,x,y){

	var parts=this.drawing.childNodes;
	for(var i=0; i<parts.length; i++){
		if(parts[i].tagName=='g'){
			var pins=this.getconnects(parts[i]);
			if(pins){
				for(var j=0;j<pins.length;j++){
					if(this.isconnect(pins[j],radius,x,y)){
						return pins[j];
					}
				}
			}
		}
	}
	return null;
}




Schematic.prototype.moveconnects=function(elem,x,y){

	var pins=this.getconnects(elem);
	if(!pins)return;
	var str=Array();
	var pin={x:0,y:0};
	this.hideconnects();
	for(var i=0;i<pins.length;i++){
		pin.x=pins[i].x-0+x-0;
		pin.y=pins[i].y-0+y-0;
		str[i]=(pin.x-0) +','+(pin.y-0);
	}
	elem.setAttributeNS(null,'connects',str.join(';')); 
	this.showconnects(elem);
}


Schematic.prototype.showallconnects=function(){
	if(this.connections){	
		//var parts=this.svgRoot.getElementsByTagName('g');
		parts=this.drawing.childNodes;
		for(var i=0 ;i<parts.length;i++){
			if(parts[i].tagName=='g'){
				//console.log(parts[i].id);
				var pins=this.getconnects(parts[i]);
				if(pins){
					for(var j=0;j<pins.length;j++){
						var svg=this.createdot('red',pins[j].x,pins[j].y);
						svg.id='schematic_connector';
						this.info.appendChild(svg);
					}
				}
			}			
			else if(parts[i].tagName=='line'){
				var x=parts[i].getAttribute('x1');
				var y=parts[i].getAttribute('y1');
				var svg=this.createdot('red',x,y);
				svg.id='schematic_connector';
				this.info.appendChild(svg);
	
				x=parts[i].getAttribute('x2');	
				y=parts[i].getAttribute('y2');
				svg=this.createdot('red',x,y);
				svg.id='schematic_connector';
				this.info.appendChild(svg);
			}
		}
	}
}

Schematic.prototype.hideconnects=function(){

	var connector=$('schematic_connector')
	if(connector){
		do{
		connector.parentNode.removeChild(connector);
		connector=$('schematic_connector');
		}while(connector)
	
	}	
}



