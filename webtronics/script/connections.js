Schematic.prototype.getconnects=function(elem){
    var text=this.readwtx(elem,"pins");
    var pins=[];    
    if(text){
        try{
            var js=text.evalJSON(true);
        }
        catch(e){
            return;
        }
        if(typeof js.pins.analog=="object"){
        	var analog=js.pins.analog;
	        var matrix=this.parseMatrix(elem);
	        var pin=this.svgRoot.createSVGPoint();
	        for(var i=0;i<analog.length;i++){
		        pin.x=analog[i].x
		        pin.y=analog[i].y;
		        pin = pin.matrixTransform(matrix);
		        analog[i]={x:Math.round(pin.x),y:Math.round(pin.y)};
	        }
            analog.each(function(item){pins.push(item)});
        }
        var js=text.evalJSON(true);
        if(typeof js.pins.digital=="object"){
        	var digital=js.pins.digital.flatten();
	        var matrix=this.parseMatrix(elem);
	        var pin=this.svgRoot.createSVGPoint();
	        for(var i=0;i<digital.length;i++){
		        pin.x=digital[i].x
		        pin.y=digital[i].y;
		        pin = pin.matrixTransform(matrix);
		        digital[i]={x:Math.round(pin.x),y:Math.round(pin.y)};
	        }
            digital.each(function(item){pins.push(item)});
        }
    }    
 //console.log(pins);
 return pins;
}

Schematic.prototype.matrixxform=function(point,matrix){
    var pin=this.svgRoot.createSVGPoint();
    pin.x=point.x;
    pin.y=point.y;
    pin=pin.matrixTransform(matrix);
    return {x:Math.round(pin.x),y:Math.round(pin.y)};
}

/*tests if 2 point are within 3 pixels of each other*/
Schematic.prototype.ispoint=function(point1,point2){
	return (Math.abs(point2.x-point1.x)<3)&&(Math.abs(point2.y-point1.y)<3); 
}

Schematic.prototype.sortnetlist=function(list){
	var G=[];
	var A=[];
	var B=[];
 	var C=[];
	var D=[];
	var J=[];
	var K=[];
	var L=[];
	var M=[];
	var P=[];
	var Q=[];
	var R=[];
	var U=[];
	var V=[];
	var wire=[];
	var other=[]
	for(var i=0;i<list.length;i++){
		if(list[i].type=='gnd'){
			G.push(list[i]);
		}
		else if(list[i].type=='v'){
			V.push(list[i]);
		}
		else if(list[i].type=='wire'){
			wire.push(list[i]);			
		}		
		else if(list[i].type=='b'){
			B.push(list[i]);
		}
		else if(list[i].type=='c'){
			C.push(list[i]);	
		}
		else if(list[i].type=='d'){
			D.push(list[i]);
		}
		else if(list[i].type=='j'){	
			J.push(list[i]);
		}
		else if(list[i].type=='k'){
			K.push(list[i]);
		}
		else if(list[i].type=='l'){
			L.push(list[i]);
		}
		else if(list[i].type=='m'){
			M.push(list[i]);
		}
		else if(list[i].type=='plot'){
			P.push(list[i]);
		}
		else if(list[i].type=='q'){
			Q.push(list[i]);
		}
		else if(list[i].type=='r'){
			R.push(list[i]);
		}
		else if(list[i].type=='u'){	
			U.push(list[i]);
		}
/* this is the best way I could think to tell if a part i digital */
		else if(list[i].category=="digital"){	
			A.push(list[i]);
		}
		else {
            list[i].error='unknown device';
			other.push(list[i]);
		}
	}

	var sortfunction=function(a,b){
        var apart=a.id.replace(a.type,"");
        var bpart=b.id.replace(b.type,"");
        if(!apart)apart=0;
        if(!bpart)bpart=0;
        return (apart<bpart);
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
	P.sort(sortfunction);
	Q.sort(sortfunction);
	R.sort(sortfunction);
	U.sort(sortfunction);
	A.sort(sortfunction);
	other.sort(sortfunction);

	var newlist=[];
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
	A.each(function(item){newlist.push(item)});		
	other.each(function(item){newlist.push(item)});		

/*plots go last*/
	P.each(function(item){newlist.push(item)});		
	return newlist;
}

/* draws wires to namewire ports with the same id*/
Schematic.prototype.connectwires=function(list){
    for(var i=0;i<list.length;i++){
        if(list[i].type=="wire"){
            for(var j=i;j<list.length;j++){
                if((list[i]!=list[j])&&(list[i].id==list[j].id)){
    				var line= this.createline('yellow',1,list[i].pins["analog"][0].x,list[i].pins["analog"][0].y,list[j].pins["analog"][0].x,list[j].pins["analog"][0].y);
    				line.setAttributeNS(null,'class','namewire');
    				this.info.appendChild(line);
                    break; 
               }
            }    
        }
    }
}

/* test if wires are connected anywhere*/
Schematic.prototype.getconnected=function(wirelist,wire){
    for(var i=0;i<wirelist.length;i++){
        for(var j=0;j<wirelist[i].length;j++){
            for(var k=0;k<wire.length;k++){
                if(this.ispoint(wirelist[i][j],wire[k])){
                   return i;
                }
            }
        }
    }
    return -1;
}
/*check for vectors and convert them*/
Schematic.prototype.tovector=function(pins,nodenumber){
    var v ="";   
    if(pins.pin){
        v+="a"+nodenumber;
    }
    else{
        for(var i=0;i<pins.length;i++){
            if(i==0)v+="[a"+nodenumber;
            else v+="a"+nodenumber;
            if(i==pins.length-1)v+="]"
        }
    }
    return v;
}
Schematic.prototype.getwtxdata=function(parts){
    list=[];
    for(var i=0;i<parts.length;i++){
        var part={error:"", pins:{}, id:"", type:"", name:"", category:"", value:"", spice:"", model:""}
        try{
            var p=this.readwtx(parts[i],'pins');
        }
        catch(e){
            part.error="wtx:pins not found";}    
        if(p){
            try{
                var json=p.evalJSON(true);
            }
            catch(e){
                part.error="could not parse pin data";        
            }
            if(json){
                var matrix=this.parseMatrix(parts[i]);
                for(var nodetype in json.pins){
                    for(var j=0;j<json.pins[nodetype].length;j++){
                        if(!json.pins[nodetype][j].pin){
                            for(var k=0;k<json.pins[nodetype][j].length;k++){
                                var point=this.matrixxform(json.pins[nodetype][j][k],matrix);
                                json.pins[nodetype][j][k].x=point.x;
                                json.pins[nodetype][j][k].y=point.y;
                            }
                        }                
                        else{
                            var point=this.matrixxform(json.pins[nodetype][j],matrix);
                            json.pins[nodetype][j].x=point.x;
                            json.pins[nodetype][j].y=point.y;
                        }
                    }
                }
            part.pins=json.pins;
            }
        }
        try{
            part.id=this.readwtx(parts[i],'id');
        }
        catch(e){part.error="wtx:id not found";}    
        try{
            part.type=this.readwtx(parts[i],'type');
        }
        catch(e){
            part.error="wtx:type not found";
        }
        try{
            part.name=this.readwtx(parts[i],'name');
        }
        catch(e){part.error="wtx:name not found";}
        try{
            part.category=this.readwtx(parts[i],'category');
        }
        catch(e){part.error="wtx:category not found";}    
        try{
            part.value=this.readwtx(parts[i],'value');
        }
        catch(e){part.error="wtx:value not found";}    
        try{
            part.spice=this.readwtx(parts[i],'spice');
        }
        catch(e){part.error="wtx:spice not found";}    
        try{        
            part.model=this.readwtx(parts[i],'model');
        }
        catch(e){part.error="wtx:model not found";}    

        list.push(part);
    }
    return list;

}
/*detect analog and digital mix*/
Schematic.prototype.mixedsignals=function(analogwires,digitalwires){

    for(var j=1;j<analogwires.length;j++){
        var crossed=this.getconnected(digitalwires,analogwires[j]);
        if(crossed>-1){
              return true;  
        }
    }
    return false;
}




/* creates all netlist data from parts data*/
Schematic.prototype.getnodes=function(parts){
    var sections={firstdir:[],netlist:[],lastdir:[],plot:[]};    
	var digitalcount=1;
    var analogcount=1;
	var digitalwires=[];
	var analogwires=[];
    for(var i=0;i<parts.length; i++){
        if(parts[i].type=="wire")continue;
        if(parts[i].type=="plot")sections.lastdir.push(parts[i].model);
        else sections.firstdir.push(parts[i].model);
        var net={error:parts[i].error,partid:parts[i].id,pins:[],model:parts[i].value};
        for(var nodetype in parts[i].pins){        
            if(nodetype=="analog"){
                for(var j=0;j<parts[i].pins[nodetype].length;j++){ 
                    var wire=this.followwires(null,parts[i].pins[nodetype][j]);
                    var found=this.getconnected(analogwires,wire);

                   if(parts[i].type=='gnd'){
                        if(!analogwires[0])analogwires[0]=[];
                        for(var k=0;k<wire.length;k++)analogwires[0].push(wire[k])
/* add analog ground to digital wirelist*/
                        if(!digitalwires[0])digitalwires.push(analogwires[0]);
                        net=null;
                    }
                    
                    else if(found<0){
                        net.pins.push(analogcount);
                        analogwires.push(wire);
                        analogcount++;
                    }
                    else{ 
                        net.pins.push(found);
                    }
                }
            }
            else{
               if(digitalwires.length==0){
                    net.error="no ground node";                      
                } 
               for(var j=0;j<parts[i].pins[nodetype].flatten().length;j++){ 
                
                    var point=parts[i].pins[nodetype].flatten()[j];
                    var wire=this.followwires(null,point);
                    var found=this.getconnected(digitalwires,wire);
                    if(found<0){
                        var v=this.tovector(parts[i].pins[nodetype][j],digitalcount);
                        net.pins.push(v);
                        digitalwires.push(wire);
                        digitalcount++;
                    }
                    else{ 
                        var v=this.tovector(parts[i].pins[nodetype][j],found);
                        net.pins.push(v);
                    }
                }
            }
        }
        if(parts[i].type=="plot"){
            var wire=this.followwires(null,parts[i].pins["analog"][0]);
            var found=this.getconnected(analogwires,wire);
            if(found>-1){sections.plot.push(found);}
            else {
                var found=this.getconnected(digitalwires,wire);
                if(found>-1){sections.plot.push("a"+found);}
            }
        }
        else if(net!=null)sections.netlist.push(net);
	}
    if(this.mixedsignals(analogwires,digitalwires)){
        return {firstdir:[],netlist:[{error:"pin is both analog and digital"}],lastdir:[],plot:[]};
    }
    return sections;

}
/* organizes data into netlist*/
Schematic.prototype.createnetlist=function(){
    
	var parts=$$('#webtronics_drawing > g');
    if(parts.length<1)return "no parts found";
    var partswtx=this.sortnetlist(this.getwtxdata(parts));
	if(partswtx[0].type.toLowerCase()!='gnd')return 'no ground node';
	this.connectwires(partswtx);
	var spice="";
    var sections=this.getnodes(partswtx);
	if(sections.firstdir.length){
		sections.firstdir=sections.firstdir.uniq();
		for(var i=0;i<sections.firstdir.length;i++){
			if(sections.firstdir[i]!="")spice=sections.firstdir[i]+"\n"+spice;
		}
	}
	if(sections.netlist.length){
        var command="";
		for(var i=0;i<sections.netlist.length;i++){
            if(sections.netlist[i].error!=""){
                spice+=sections.netlist[i].error+'\n';
                continue;
            }
            command=sections.netlist[i].partid;
            for(var j=0;j<sections.netlist[i].pins.length;j++)command+=" "+sections.netlist[i].pins[j];
            command+=" "+sections.netlist[i].model;
            if(command!="")spice+=command+'\n';
		}
	}
	if(sections.lastdir.length){
		sections.lastdir=sections.lastdir.uniq();
		for(var i=0;i<sections.lastdir.length;i++){
			if(sections.lastdir[i]!="")spice+=sections.lastdir[i]+"\n";
		}
	}
	if(sections.plot.length){
		var command=".plot tran"
		for(var i=0;i<sections.plot.length;i++){
/*digital*/
            if(sections.plot[i].toString().match('a')){
                command+=" "+sections.plot[i];
            }
/*analog*/
            else{command+=" v("+sections.plot[i]+")"}    
        }
		if(command!=null)spice+=command+"\n";
	}
	spice=spice.concat(".end \n");	
	var connector=$$('#information > .namewire')
	for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);

	return spice.toLowerCase();

}


Schematic.prototype.followwires=function(wirelist,pin){
	if(wirelist==null)wirelist=[];
	var points=[];
	points.push(pin);	
	var lines =$$('#webtronics_drawing > line, #information > .namewire');
	for(var i =0 ;i<lines.length;i++){
		var point1={x:lines[i].getAttribute('x1')-0,y:lines[i].getAttribute('y1')-0};
		var point2={x:lines[i].getAttribute('x2')-0,y:lines[i].getAttribute('y2')-0};
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

	var str=[];
	
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




Schematic.prototype.showallconnects=function(){
	if(this.connections){	
		var parts=$$('#webtronics_drawing > g');
        var list=this.getwtxdata(parts);
    	this.connectwires(list);
		for(var i=0 ;i<list.length;i++){
			for(var type in list[i].pins){
                var flatlist=list[i].pins["digital"].flatten();
                for(var j=0;j<flatlist.length;j++){
			        var svg=this.createrect('green',100,flatlist[j].x-3,flatlist[j].y-3,6,6);
			        svg.setAttribute('class',"schematic_connector");
			        this.info.appendChild(svg);
                }
                for(var j=0;j<list[i].pins["analog"].length;j++){
			        var svg=this.createdot('red',list[i].pins["analog"][j].x,list[i].pins["analog"][j].y);
			        svg.setAttribute('class',"schematic_connector");
			        this.info.appendChild(svg);
                }
			}
		}
	}
}

Schematic.prototype.hideconnects=function(){

	var connector=$$('#information .schematic_connector,#information .namewire')
	for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);
}



