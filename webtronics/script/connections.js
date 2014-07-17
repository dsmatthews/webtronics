Schematic.prototype.getconnects=function(elem){
  var pins=[];    
  var nodes=this.getwtxtagname(elem,"node");
  var matrix=this.parseMatrix(elem);
  var pin=this.svgRoot.createSVGPoint();
  for(var i=0;i<nodes.length;i++){
    pin.x=this.getwtxattribute(nodes[i],"x");
    pin.y=this.getwtxattribute(nodes[i],"y");
    pin = pin.matrixTransform(matrix);
    pins[i]={x:Math.round(pin.x),y:Math.round(pin.y)};
  }
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
  var I=[];
  var J=[];
  var K=[];
  var L=[];
  var M=[];
  var N=[];
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
    else if(list[i].type=='i'){	
      J.push(list[i]);
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
    else if(list[i].type=='n'){
      N.push(list[i]);
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
    return (apart>bpart);
  };
  V.sort(sortfunction);
  wire.sort(sortfunction);
  B.sort(sortfunction);
  C.sort(sortfunction);
  D.sort(sortfunction);
  I.sort(sortfunction);
  J.sort(sortfunction);
  K.sort(sortfunction);
  L.sort(sortfunction);
  M.sort(sortfunction);
  N.sort(sortfunction);
  P.sort(sortfunction);
  Q.sort(sortfunction);
  R.sort(sortfunction);
  U.sort(sortfunction);
  A.sort(sortfunction);
  
  var newlist=[];
  G.each(function(item){newlist.push(item)});		
  G.reverse();
  V.each(function(item){newlist.push(item)});		
  wire.each(function(item){newlist.push(item)});		
  B.each(function(item){newlist.push(item)});		
  C.each(function(item){newlist.push(item)});		
  D.each(function(item){newlist.push(item)});		
  I.each(function(item){newlist.push(item)});		
  J.each(function(item){newlist.push(item)});		
  K.each(function(item){newlist.push(item)});		
  L.each(function(item){newlist.push(item)});		
  M.each(function(item){newlist.push(item)});		
  N.each(function(item){newlist.push(item)});		
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
Schematic.prototype.connectnamewires=function(list){
  
  for(var i=0;i<list.length;i++){
    if((list[i].type=="wire") || (list[i].type=="gnd")){
      for(var j=i;j<list.length;j++){
	if( (list[i]!=list[j]) && ((list[i].id==list[j].id) || (list[i].type=="gnd" && list[j].type=="gnd"))   ){
	  var line= this.createline('yellow',1,list[i]['analogpins'][0]['x'],list[i]['analogpins'][0]['y'],list[j]['analogpins'][0]['x'],list[j]['analogpins'][0]['y']);
	  line.setAttributeNS(null,'class','namewire');
	  this.info.appendChild(line);
	  //console.log(line);            
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
Schematic.prototype.tovector=function(pin,nodenumber){
  var v ="";   
  if(pin.parentNode.tagName=="wtx:vector"){
    var vector=Element.descendants(pin.parentNode);
    if(pin==vector[0]){v+="["}
    v+="a"+nodenumber;
    if(pin==vector[vector.length-1]){v+="]";}
  }
  else{
    v+="a"+nodenumber;
  }
  
  return v;
}

/*
 *    <wtx:pins>
 *		<wtx:analog>
 *		  <wtx:node index="1" x="0" y="10"></wtx:node>
 *		  <wtx:node index="2" x="40" y="10"></wtx:node>
 *		</wtx:analog>
 *    </wtx:pins>
 *    <wtx:id>r</wtx:id>
 *    <wtx:type>r</wtx:type>
 *    <wtx:name>testresistor</wtx:name>
 *    <wtx:category>resistors</wtx:category>
 *    <wtx:value></wtx:value>
 *    <wtx:label></wtx:label>
 *    <wtx:spice></wtx:spice>
 *    <wtx:flip></wtx:flip>
 *    <wtx:model></wtx:model>
 */


Schematic.prototype.getwtxdata=function(parts){
  list=[];
  for(var i=0;i<parts.length;i++){
    var part={error:"", elem:{}, analogpins:[],digitalpins:[],type:"", name:"", category:"", value:"", spice:"", model:"",measure:""}
    /*
     *        try{
     *            part.nodes=this.getwtxpins(part[i]);        
  }
  catch{part.error="wtx:pins not found"}
  */
    part.elem=parts[i];
    try{
      var category=this.getwtxtagname(parts[i],"analog")[0];
      var nodes = this.getwtxtagname(category,"node");
      for(var j=0;j<nodes.length;j++){
	var point = this.matrixxform( {x:this.getwtxattribute(nodes[j],"x"),y:this.getwtxattribute(nodes[j],"y")},this.parseMatrix(part.elem));
	part.analogpins.push({index:this.getwtxattribute(nodes[j],"index"),x:point.x,y:point.y,node:undefined}) ;
      }
      //sort nodes int correct order
      part.analogpins.sort(function(a,b){if (a.name > b.name)return 1;if (a.name < b.name)return -1;return 0;});
    }
    catch(e){part.error="wtx:analog wtx:node not found";}
    
    try{
      var category=this.getwtxtagname(parts[i],"digital")[0];
      var nodes = this.getwtxtagname(category,"node");
      for(var j=0;j<nodes.length;j++){
	var point = this.matrixxform( {x:this.getwtxattribute(nodes[j],"x"),y:this.getwtxattribute(nodes[j],"y")},this.parseMatrix(part.elem));
	part.digitalpins.push({index:this.getwtxattribute(nodes[j],"index"),x:point.x,y:point.y,node:undefined}) ;
      }
      part.digitalpins.sort(function(a,b){if (a.name > b.name)return 1;if (a.name < b.name)return -1;return 0;});
    }
    catch(e){}
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
    //special tag for parts that do simulation
    try{        
      part.measure=this.readwtx(parts[i],'measure');
    }
    catch(e){}    
    
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

//returns points connected by lines
//it is recursive and should be called with NULL for wires
Schematic.prototype.followwires=function(wires,pin){
  if(wires==null)wires=[];
  var points=[];
  points.push(pin);	
  var lines =$$('#webtronics_drawing > line, #information > .webtronics_namewire_connector');
  for(var i =0 ;i<lines.length;i++){
    var point1={x:lines[i].getAttribute('x1')-0,y:lines[i].getAttribute('y1')-0};
    var point2={x:lines[i].getAttribute('x2')-0,y:lines[i].getAttribute('y2')-0};
    if(wires.indexOf(lines[i])<0){		
      if(this.ispoint(point1,pin)){
	wires.push(lines[i]);
	var p=this.followwires(wires,point2);
	for(var j=0;j<p.length;j++)points.push(p[j]);				
      }
      else if(this.ispoint(point2,pin)){
	wires.push(lines[i]);
	var p=this.followwires(wires,point1);
	for(var j=0;j<p.length;j++)points.push(p[j]);				
      }
    }
  }
  return points;
}



//sets the node numbers for parts
Schematic.prototype.numberwires=function(parts){
  var analogpoints=[];
  var digitalpoints=[];
  for(var i=0;i<parts.length; i++){
    //analog node numbering loop
    if(parts[i].type=="wire")continue;

    if( parts[i].type=="gnd"){
      if (analogpoints.length==0 ){
	var wire=this.followwires(null,{x:parts[i].analogpins[0]['x'],y:parts[i].analogpins[0]['y']});
	analogpoints.push(wire);
      }
      parts[i].analogpins[0]["node"]=0;
      continue;
    }
    if(parts[i].analogpins!=undefined){
      for(var j=0;j<parts[i].analogpins.length;j++){
	var wire=this.followwires(null,{x:parts[i].analogpins[j]['x'],y:parts[i].analogpins[j]['y']});
	var found=this.getconnected(analogpoints,wire);
	if(found<0){
	  analogpoints.push(wire);
	  parts[i].analogpins[j]["node"]=analogpoints.length-1;
	}
	else{
	  parts[i].analogpins[j]["node"]=found;
	}
      }
    }
    //digital node numbering loop
    
    if(parts[i].digitalgpins!=undefined){
      for(var j=0;j<parts[i].digitalgpins.length;j++){
	var wire=this.followwires(null,{x:parts[i].digitalpins[j]['x'],y:parts[i].digitalpins[j]['y']});
	var found=this.getconnected(digitalpoints,wire);
	if(found<0){
	  digitalpoints.push(wire);
	  parts[i].digitalpins[j]["node"]=digitalpoints.length-1;
	}
	else{
	  parts[i].digitalpins[j]["node"]=found;
	}
      }	
    }
  }
  //returns true if digital and analog are mixed
  return this.mixedsignals(analogpoints,digitalpoints);
}  



/* creates all netlist data from parts data*/
Schematic.prototype.getnodes=function(parts){
  var sections={netlist:[],firstdir:[],simulation:[],lastdir:[]};    
  
  if(this.numberwires(parts))return {firstdir:[],netlist:[{error:"pin is both analog and digital"}],lastdir:[],plot:[]};
  
  for(var i=0;i<parts.length; i++){
    //    if(parts[i].type=="wire")continue;
    // check what type of simulation to use
    if(parts[i].type=='gnd' || parts[i].type=='wire')continue;
    if(parts[i].type=="plot"){
	if(sections.simulation.length==0){
	  sections.simulation.push(".op");
	  sections.simulation.push(".print tran");
	}
	if(sections.simulation[1] !=undefined && sections.simulation[1].match(/\.print\sac/g)==null){
	  sections.simulation[1]+=" v("+parts[i].analogpins[0]["node"]+")";
	  sections.simulation[1]+=" "+parts[i].measure;
	  if(parts[i].model)sections.simulation.push(parts[i].model);
	}
	
      
    }
    else{
      if(parts[i].type=="v"){
	if(sections.simulation.length==0 && parts[i].model.length){
	  sections.simulation.push(".op");
	  sections.simulation.push(".print ac "+parts[i].measure);
	  sections.simulation.push(parts[i].model);
	}
      }
      else{
	if(parts[i].model.match(/\.mod/i) && !parts[i].id.match(/^x/))parts[i].id="x"+parts[i].id;
	if(parts[i].model.length)sections.firstdir.push(parts[i].model);
	
      }
      //create pins array
      var net={error:parts[i].error,partid:parts[i].id,pins:{analog:parts[i].analogpins,digital:parts[i].digitalpins},model:parts[i].value};
      if(net!=null)sections.netlist.push(net);
    }
    
  }
  return sections;
}



/* organizes data into netlist*/
Schematic.prototype.createnetlist=function(responsefunc){
  
  var parts=$$('#webtronics_drawing > g');
  if(parts.length<1){
    responsefunc("no parts found\n");
    return;
  }
  var partswtx=this.sortnetlist(this.getwtxdata(parts));
  if(partswtx[0].type.toLowerCase()!='gnd'){
    responsefunc('no ground node');
    return;
  }
  this.connectnamewires(partswtx);
  var spice=".title webtronics\n";
  var sections=this.getnodes(partswtx);
//  console.log(sections);
  //dump models into spice	
  var modelloader={
    modeltext:"",
    modelcount:0,
    responsecount:0,
    download:function(name){
      openfile( "../spice/"+ name.split(' ')[1],modelloader.responder);
      modelloader.modelcount++;
    },
    finish:function(){
      spice+=modelloader.modeltext; 
      if(sections.simulation.length){
	for(var i=0;i<sections.simulation.length;i++){
	  if(sections.simulation[i]!="")spice+=sections.simulation[i]+"\n";
	}
      }
      if(sections.lastdir.length){
	sections.lastdir=sections.lastdir.uniq();
	for(var i=0;i<sections.lastdir.length;i++){
	  if(sections.lastdir[i]!="")spice+=sections.lastdir[i]+"\n";
	}
      }
      
      spice=spice.concat(".end \n");	
      var connector=$$('#information > .webtronics_namewire_connector')
      for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);
      
      responsefunc(spice.toLowerCase());
    },
    
    responder:function(text){
      modelloader.modeltext+=text;
      modelloader.responsecount++;
      if(modelloader.responsecount==modelloader.modelcount){
	modelloader.finish();
	
      }       
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
      for(var j=0;j<sections.netlist[i].pins['analog'].length;j++)command += " " + sections.netlist[i].pins['analog'][j]['node'];
      
      command+=" "+sections.netlist[i].model;
      if(command!="")spice+=command+'\n';
    }
  }
  
  if(sections.firstdir.length){
    sections.firstdir=sections.firstdir.uniq();
    for(var i=0;i<sections.firstdir.length;i++){
//      console.log(sections.firstdir[i]);
      if(sections.firstdir[i].length){
	modelloader.download(sections.firstdir[i]);
      }
    }
  }
  else modelloader.finish();
  
  
  
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

//get the number by part id and leg
Schematic.prototype.getnodenumber=function(name, leg){
  //get part by id
  var part=$$("#webtronics_drawing wtx:id "+name )[0];
  var nodes=part.getwtxtagname("node");
  for(var i=0;i<nodes.length;i++){
    if(nodes[i].getAttribute("index")==leg){
      var wire = this.followwires(null,{ x:this.getwtxattribute(node,"x"),y:this.getwtxattribute(node,"y")});
      return this.getconnected(analogwires,wire);
    }
  }
  return -1
}

Schematic.prototype.showallconnects=function(){
  if(this.connections){	
    var parts=this.getwtxdata($$('#webtronics_drawing > g'));
    this.connectnamewires(parts);
    for(var i=0 ;i<parts.length;i++){
      if(parts[i].analogpins!=undefined)for(var j=0;j<parts[i].analogpins.length;j++){
	  var circle=this.createdot('red',parts[i].analogpins[j].x,parts[i].analogpins[j].y);
	  circle.setAttribute('class',"schematic_connector");
	  this.info.appendChild(circle);
      }
      if(parts[i].digitalgpins!=undefined)for(var j=0;j<parts[i].digitalgpins.length;j++){
  	  var rect=this.createrect('green',100,parts[i].digitalpins[j].x-3,parts[i].digitalpins[j].y-3,6,6);
	  circle.setAttribute('class',"schematic_connector");
	  this.info.appendChild(circle);
      }
    }
  }
}

Schematic.prototype.hideconnects=function(){
  
  var connector=$$('#information .schematic_connector,#information .webtronics_namewire_connector')
  for(var i=0;i<connector.length;i++)connector[i].parentNode.removeChild(connector[i]);
}



