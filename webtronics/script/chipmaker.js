var chipmaker={

	clear:function(elem){

		if ( elem.hasChildNodes() )
		{
		  while ( elem.childNodes.length >= 1 )
		  {
		      elem.removeChild( elem.firstChild );       

		  } 
		}
		elem.removeAttribute('connects');


	},

drawchip:function(h,v,elem){
	var svgNamespace = 'http://www.w3.org/2000/svg';
	var svg;
	var container =  elem;
 	var svgRoot = container.getElementsByTagName("svg")[0];
	if(!svgRoot){
	svgRoot=container.ownerDocument.createElementNS(svgNamespace, "svg");
	svgRoot.setAttributeNS(null, 'stroke','black');

	container.appendChild(svgRoot);
	}
	var chipG = 	svgRoot.getElementsByTagName("g")[0];
	if(!chipG){
		chipG=container.ownerDocument.createElementNS(svgNamespace, 'g');
		chipG.setAttributeNS(null, 'stroke', 'black');
		chipG.setAttributeNS(null, 'stroke-width', 2);
		svgRoot.appendChild(chipG);
	}
  	this.clear(chipG);
/*space between pins*/
	var space=20;
/*length of pins */
	var pinl=10;
  	var y=space
	var start=pinl;
	var hor=h*space;
	var pincount=0;
 	var pins=Array();
	
	if(h==0)
	{
	hor=60;
	y=pinl;
	start=0;
	}

	svg = container.ownerDocument.createElementNS(svgNamespace, 'rect');
  	svg.setAttributeNS(null, 'x', pinl);
  	svg.setAttributeNS(null, 'y', start);	
  	svg.setAttributeNS(null, 'width', hor);
  	svg.setAttributeNS(null, 'height', v*space);
  	svg.setAttributeNS(null, 'fill','none');
	//svg.setAttributeNS(null, 'stroke','black');
  	//svg.setAttributeNS(null, 'stroke-width','2px');
  	//svg.setAttributeNS(null, 'style',"fill:white;stroke:#000000;stroke-width:2px;");
 	
	chipG.appendChild(svg);
/* left horizontal pins*/
	for(;y<(v*space+start+10);y+=space){
		svg = container.ownerDocument.createElementNS(svgNamespace, 'line');
		svg.setAttributeNS(null, 'x1',0 );
		svg.setAttributeNS(null, 'y1', y);
		svg.setAttributeNS(null, 'x2', pinl);
		svg.setAttributeNS(null, 'y2', y);
		//svg.setAttributeNS(null, 'stroke', 'black');
		//svg.setAttributeNS(null, 'stroke-width', 2);
		chipG.appendChild(svg);
		
		svg = container.ownerDocument.createElementNS(svgNamespace, 'text');
		svg.setAttributeNS(null, 'x', 0);
		svg.setAttributeNS(null, 'y', y);
		svg.setAttributeNS(null, 'font-size', 8);
		svg.setAttributeNS(null, 'stroke','blue');
		svg.setAttributeNS(null, 'stroke-width',.5);

		svg.appendChild(container.ownerDocument.createTextNode(pincount+1));
		chipG.appendChild(svg);
		pins[pincount]=0+','+y;	
		pincount++;
	}
  	y=space
	start=pinl;
	hor=h*space;

	if(h==0)
	{
	hor=60;
	y=pinl;
	start=0;
	}
/*vertical bottom pins*/
	for(var x=space;x<h*space+space;x+=space){
		svg = container.ownerDocument.createElementNS(svgNamespace, 'line');
		svg.setAttributeNS(null, 'x1',x);
		svg.setAttributeNS(null, 'y1',v*space+pinl);
		svg.setAttributeNS(null, 'x2',x);
		svg.setAttributeNS(null, 'y2',v*space+space);
		//svg.setAttributeNS(null, 'stroke', 'black');
		//svg.setAttributeNS(null, 'stroke-width', 2);
		chipG.appendChild(svg);

		svg = container.ownerDocument.createElementNS(svgNamespace, 'text');
		svg.setAttributeNS(null, 'x', x);
		svg.setAttributeNS(null, 'y',v*space+pinl);
		svg.setAttributeNS(null, 'font-size', 8);
		svg.setAttributeNS(null, 'stroke','blue');
		svg.setAttributeNS(null, 'stroke-width',.5);
		svg.setAttributeNS(null, 'transform', 'rotate(90 ' + x + ' '+ (v*space+pinl) +' )');
		svg.appendChild(container.ownerDocument.createTextNode(pincount+1));
		chipG.appendChild(svg);
		pins[pincount]=x+','+(v*space+space);		
		pincount++;
	}
   	y=space
	start=0;
	hor=h*space+pinl;
	if(h==0)
	{
	hor=60+pinl;
	y=pinl;
	start=pinl;
	}
/*horizontal right pins*/
	for(var y2=(v*space-start);y2>=y;y2-=space){
		svg = container.ownerDocument.createElementNS(svgNamespace, 'line');
		svg.setAttributeNS(null, 'x1',hor );
		svg.setAttributeNS(null, 'y1',y2);
		svg.setAttributeNS(null, 'x2',hor+pinl);
		svg.setAttributeNS(null, 'y2',y2);
		//svg.setAttributeNS(null, 'stroke', 'black');
		//svg.setAttributeNS(null, 'stroke-width', 2);
		chipG.appendChild(svg);

		svg = container.ownerDocument.createElementNS(svgNamespace, 'text');
		svg.setAttributeNS(null, 'x', hor);
		svg.setAttributeNS(null, 'y', y2);
		svg.setAttributeNS(null, 'font-size', 8);
		svg.setAttributeNS(null, 'stroke','blue');
		svg.setAttributeNS(null, 'stroke-width',.5);

		svg.appendChild(container.ownerDocument.createTextNode(pincount+1));
		chipG.appendChild(svg);
		pins[pincount]=(hor+pinl)+','+y2;
		pincount++;
	}
   y=space
	start=pinl;
	hor=h*space-pinl;
	if(h==0){
	hor=60;
	y=pinl;
	start=0;
	}
/*vertical top pins*/
  for(var x=h*space;x>=space;x-=space){
		svg = container.ownerDocument.createElementNS(svgNamespace, 'line');
		svg.setAttributeNS(null, 'x1',x );
		svg.setAttributeNS(null, 'y1', 0);
		svg.setAttributeNS(null, 'x2', x);
		svg.setAttributeNS(null, 'y2', pinl);
		//svg.setAttributeNS(null, 'stroke', 'black');
		//svg.setAttributeNS(null, 'stroke-width', 2);
		chipG.appendChild(svg);

		svg = container.ownerDocument.createElementNS(svgNamespace, 'text');
		svg.setAttributeNS(null, 'x', x);
		svg.setAttributeNS(null, 'y', 0);
		svg.setAttributeNS(null, 'font-size', 8);
		svg.setAttributeNS(null, 'stroke','blue');
		svg.setAttributeNS(null, 'stroke-width',.5);

		svg.setAttributeNS(null, 'transform', 'rotate(90 '+x+' 0)');
		svg.appendChild(container.ownerDocument.createTextNode(pincount+1));
		chipG.appendChild(svg);
		pins[pincount]=x+','+0;
		pincount++;
	}

	
	svg=container.ownerDocument.createElementNS(svgNamespace,'circle');
	svg.setAttributeNS(null, 'cx', 20);
	svg.setAttributeNS(null, 'cy', start+10);	
	svg.setAttributeNS(null, 'r', 3);
	//svg.setAttributeNS(null, 'stroke', 'black');
	chipG.id = 'U:' + createUUID();
	chipG.setAttribute('connects',pins.join(';'));
	chipG.appendChild(svg);

	}
}
