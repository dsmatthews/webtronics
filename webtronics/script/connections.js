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
		pin.x=pins[i].x
		pin.y=pins[i].y;
		pin = pin.matrixTransform(matrix);
		pins[i]={x:Math.round(pin.x),y:Math.round(pin.y)};
	}

 return pins;
}

Schematic.prototype.ispoint=function(point1,point2){
	return (Math.abs(point2.x-point1.x)<3)&&(Math.abs(point2.y-point1.y)<3); 
}

Schematic.prototype.sortnetlist=function(list){
	var G=new Array();
	var B=new Array();
 	var C=new Array();
	var D=new Array();
	var J=new Array();
	var K=new Array();
	var L=new Array();
	var M=new Array();
	var Q=new Array();
	var R=new Array();
	var U=new Array();
	var V=new Array();
	var wire=new Array();
	
	for(var i=0;i<list.length;i++){
		var type=this.getparttype(list[i]).toLowerCase();
		if(type=='gnd'){
			G.push(list[i]);
		}
		else if(type=='v'){
			V.push(list[i]);
		}
		else if(type=='wire'){
			wire.push(list[i]);			
		}		
		else if(type=='b'){
			B.push(list[i]);
		}
		else if(type=='c'){
			C.push(list[i]);	
		}
		else if(type=='d'){
			D.push(list[i]);
		}
		else if(type=='j'){	
			J.push(list[i]);
		}
		else if(type=='k'){
			K.push(list[i]);
		}
		else if(type=='l'){
			L.push(list[i]);
		}
		else if(type=='m'){
			M.push(list[i]);
		}
		else if(type=='q'){
			Q.push(list[i]);
		}
		else if(type=='r'){
			R.push(list[i]);
		}
		else if(type=='u'){	
			U.push(list[i]);
		}
		else {
			console.log ('unknown device');
		}
	}
	var sortfunction=function(a,b){
		var anum=a.getAttribute('partvalue').split(' ')[0];
		var bnum=b.getAttribute('partvalue').split(' ')[0];
		return (anum.slice(1)-0)-(bnum.slice(1)-0);
		};
	V.sort(sortfunction);
	wire.sort(sortfunction);
	B.sort(sortfunction);
 	C.sort(sortfunction);
	D.sort(sortfunction);
	J.sort(sortfunction);
	K.sort(sortfunction);
	L.sort(sortfunction);
	M.sort(sortfunction);
	Q.sort(sortfunction);
	R.sort(sortfunction);
	U.sort(sortfunction);
	var newlist=new Array();
	G.each(function(item){newlist.push(item)});		
	V.each(function(item){newlist.push(item)});		
	wire.each(function(item){newlist.push(item)});		
	B.each(function(item){newlist.push(item)});		
	C.each(function(item){newlist.push(item)});		
	D.each(function(item){newlist.push(item)});		
	J.each(function(item){newlist.push(item)});		
	K.each(function(item){newlist.push(item)});		
	L.each(function(item){newlist.push(item)});		
	M.each(function(item){newlist.push(item)});		
	Q.each(function(item){newlist.push(item)});		
	R.each(function(item){newlist.push(item)});		
	U.each(function(item){newlist.push(item)});		
	return newlist;
}

Schematic.prototype.connectwires=function(){
	var namewires=new Array();
	$$('#webtronics_drawing > g').each(function(i){if(i.id.split(':',1)[0].toLowerCase()=='wire')namewires.push(i);});
	for(var i=0;i<namewires.length;i++){
		for(var j=i;j<namewires.length;j++){
			if(namewires[i]!==namewires[j]&&namewires[i].getAttribute('partvalue')==namewires[j].getAttribute('partvalue')){
				var pin1 =this.getconnects(namewires[i]);
				var pin2= this.getconnects(namewires[j]); 
				var line= this.createline('red',1,pin1[0].x,pin1[0].y,pin2[0].x,pin2[0].y);
				line.setAttributeNS(null,'class','namewire');
				this.info.appendChild(line);
				break;
			}
		}
	}
}

Schematic.prototype.createnetlist=function(){
	parts=this.sortnetlist($$('#webtronics_drawing > g'));
	wires=new Array();
	nodecount=1;
	this.connectwires();
	var models=new Array();
	for(var i=0;i<parts.length; i++){
		var pins=this.getconnects(parts[i]);
		var nodes =new Array();
//		console.log(this.getparttype(parts[i]));
		for(var j=0 ;j<pins.length;j++){
			var wire=this.followwires(null,pins[j]);
			var found=-1;
			for(var k=0;k<wires.length;k++){
				for(var l=0;l<wires[k].length;l++){
					for(var m=0;m<wire.length;m++ ){
						if(wires[k][l].x==wire[m].x&&wires[k][l].y==wire[m].y){
							found=k;
							break;
						}
					}
					if(found>-1)break;
				}
				if(found>-1)break;
			}			
			if(this.getparttype(parts[i]).toLowerCase()=='gnd'){
				if(!wires[0])wires[0]=new Array();
				for(var k=0;k<wire.length;k++)wires[0].push(wire[k]);
			}

			else if(this.getparttype(parts[i]).toLowerCase()=='wire'){
	
			}
		
			else if(found<0){
				nodes[j]=nodecount;
				nodecount++;
				wires.push(wire);
			}			
			else{ 
				nodes[j]=found;
			}
		}
		if(this.getparttype(parts[i]).toLowerCase()!='gnd'&&
			this.getparttype(parts[i]).toLowerCase()!='wire'){
			models[i]=new String(parts[i].getAttribute('partvalue').split(' ')[0]+' ');
			for(var j=0;j<nodes.length;j++)models[i]+=nodes[j]+' ';
			models[i]+=parts[i].getAttribute('partvalue').split(' ')[1];
		}
	}
	if(this.getparttype(parts[0]).toLowerCase()!='gnd')alert('no ground node');
	else alert(models.compact().join('\n').toUpperCase());

	var connector=$$('#information > .namewire')
	for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);

}

Schematic.prototype.followwires=function(wirelist,pin){
	if(wirelist==null)wirelist=new Array();
	var points=new Array();
	points.push(pin);	
	var lines =$$('#webtronics_drawing > line, #information > .namewire');
	for(var i =0 ;i<lines.length;i++){
		var point1={x:lines[i].getAttribute('x1'),y:lines[i].getAttribute('y1')};
		var point2={x:lines[i].getAttribute('x2'),y:lines[i].getAttribute('y2')};
		if(wirelist.indexOf(lines[i])<0){		
			if(this.ispoint(point1,pin)){
				wirelist.push(lines[i]);
				var p=this.followwires(wirelist,point2);
				for(var j=0;j<p.length;j++)points.push(p[j]);				
			}
			else if(this.ispoint(point2,pin)){
				wirelist.push(lines[i]);
				var p=this.followwires(wirelist,point1);
				for(var j=0;j<p.length;j++)points.push(p[j]);				
			}
		}
	}
	return points;
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
		var parts=$$('#webtronics_drawing > g');
		for(var i=0 ;i<parts.length;i++){
				var pins=this.getconnects(parts[i]);
				if(pins){
					for(var j=0;j<pins.length;j++){
						var svg=this.createdot('red',pins[j].x,pins[j].y);
						svg.setAttribute('class',"schematic_connector");
						this.info.appendChild(svg);
					}
				}
		}
	this.connectwires();
	}
}

Schematic.prototype.hideconnects=function(){

	var connector=$$('#information .schematic_connector,#information .namewire')
	for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);
}



