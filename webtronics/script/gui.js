
var webtronics={
		circuit:null,
		rightclickmenu:null,
		Vlist:[/expression/,/^\s*url/,/javascript/],
		Alist:['x','y','x1','y1','x2','y2','cx','cy','r','width','height','transform','d','id','fill','stroke','visibility','stroke-width','xmlns','connects','partvalue','flippable','font-size','font-weight','font-style','font-family'],
		Elist:['path','circle','rect','line','text','g','tspan','svg'],

		

		setsize:function(){
		
			var buffer=30;
			var realheight=window.innerHeight-$('webtronics_toolbar').offsetHeight-$('webtronics_status_bar').offsetHeight;
			var realwidth=window.innerWidth-$('webtronics_side_bar').offsetWidth;
			$('webtronics_center').style.width = window.offsetWidth+'px';
			$('webtronics_center').style.height = realheight-buffer+'px';
			$('webtronics_diagram_area').style.width = realwidth-buffer+'px';
			$('webtronics_diagram_area').style.height = realheight-buffer+'px';
			$('webtronics_parts_list').style.height=realheight-$('webtronics_part_display').offsetHeight-buffer+'px';
		},

		getMarkup:function() {
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=webtronics.circuit.getMarkup();
			return str;
		},
		
		showMarkup:function(){

			var w=window.open("data:image/svg+xml;base64;charset=utf-8," + Utils.encode64(webtronics.getMarkup() ));
		},

		setMode:function(button,mode, status){

			var imgs = $('webtronics_toolbar').getElementsByTagName('img');

			for (var i=0; i<imgs.length; i++) {
				imgs[i].className = 'normal_button';
			}
			$(button).className = 'pressed_button';

			$('webtronics_status_bar').innerHTML = 'Mode: '+status;
			$('webtronics_add_text').hide();
			if(mode=='select'){
				webtronics.rightclickmenu.options.enabled=true;
			}
			else if(mode=='line'){
				webtronics.rightclickmenu.options.enabled=false;
				if(webtronics.circuit.selected){
					webtronics.circuit.unselect();
				}
			}
			else if(mode=='text'){
				webtronics.rightclickmenu.options.enabled=false;
			}
			webtronics.circuit.mode=mode;

		},

		changeimage:function(Name){

			var xmlDoc=Utils.openfile(Name);
			var group=xmlDoc.getElementsByTagName('g')[0].cloneNode(1);
			var svg=$$('#webtronics_part_display > svg')[0];
			if(svg)$('webtronics_part_display').removeChild(svg);
			svg=document.createElement('svg');
			group.setAttribute('transform',
				'translate('+($('webtronics_part_display').offsetWidth/2-(xmlDoc.getElementsByTagName('svg')[0].getAttribute('width')/2))+
				','+($('webtronics_part_display').offsetHeight/2-(xmlDoc.getElementsByTagName('svg')[0].getAttribute('height')/2))+')');	
						
			svg.appendChild(group);
			$('webtronics_part_display').appendChild(svg);
			var gotpart=false;	
			
			Event.observe($('webtronics_part_display'),'mousedown',function(e){
				webtronics.returnpart();
				gotpart=true
			});			

			Event.observe($('webtronics_part_display'),'mouseup',function(e){
				if(gotpart)webtronics.circuit.deleteSelection();
				else console.log('broke');
			});			

		},

		disablepage:function(){
			var div=document.createElement('div');
			div.id="webtronics_disable";
			div.onselectstart=function(){return false;};
			$('webtronics_main_window').insertBefore(div,$("webtronics_chips_box"));

		},

		returnpart:function(){
			var group=$$('#webtronics_part_display>svg>g')[0];
			webtronics.circuit.getgroup(group);
			webtronics.setMode('webtronics_select','select','Selection');
		},	



		returnchip:function(){
		webtronics.circuit.getgroup($('webtronics_chip_display').getElementsByTagName('g')[0]);
		$('webtronics_chips_box').hide();
		webtronics.setMode('webtronics_select','select','Selection');
		},
	
		openProperties:function(){
			$('webtronics_properties_form').style.display = "block";

		},

		sanitize:function(doc){
				var elems=doc.getElementsByTagName("*");
				for(var i=0;i<elems.length;i++){
					if(!webtronics.Elist.any(function(el){return elems[i].tagName.toLowerCase()==el}))return elems[i].tagName;
					var attr=elems[i].attributes;
					for(var j=0;j<attr.length;j++){
						if(!webtronics.Alist.any(function(a){return attr[j].name.toLowerCase()==a;}))return attr[j].name;
						if(!webtronics.Vlist.all(function(v){return attr[j].value.toLowerCase().match(v)==null;}))return attr[j].value;
					} ;
				};
		}
}




	Event.observe(window, 'load', function() {
		if (!window.console) {
			window.console = {};
			window.console.log = function(){};
		}


		var url=window.location.search.toQueryParams();
		var file=url['file'];
		var code = url['code'];
		/* test file read capability*/
			if(window.FileReader){
				$('webtronics_open_file_selector').form.reset();
				$('webtronics_open_file_selector').onchange=function(){
					var textReader = new FileReader();
					textReader.onloadend=function(){
						var xmlDoc=Utils.docfromtext(textReader.result);
						if(!xmlDoc){alert("error parsing svg");}
						else{
							var result=webtronics.sanitize(xmlDoc)
							if(result){console.log(result+ ' found');alert('unclean file');return;}
							var node=xmlDoc.getElementsByTagName('svg')[0];
							if(!node){alert("svg node not found")}
							else webtronics.circuit.getfile(node);
						}
					}
					textReader.readAsText($('webtronics_open_file_selector').files[0]);
					$('webtronics_open_file_selector').form.reset();
				}
			}
			else if((navigator.userAgent.toLowerCase().indexOf('firefox')>-1)||
				(navigator.userAgent.toLowerCase().indexOf('iceweasel')>-1)&&window.FileList){
				$('webtronics_open_file_selector').form.reset();
				$('webtronics_open_file_selector').onchange=function(){
		
					var txt =$('webtronics_open_file_selector').files[0].getAsText('');					
					var xmlDoc=Utils.docfromtext(txt);
					var result=webtronics.sanitize(xmlDoc)
					if(result){console.log(result+ ' found');alert('unclean file');return;}
					var node=xmlDoc.getElementsByTagName('svg')[0];
					if(!node){alert("svg node not found");}
					else webtronics.circuit.getfile(node);
					$('webtronics_open_file_selector').form.reset();
				}

			}

			/*no file read capability*/

			else {
				$('webtronics_open_file').hide();
				$('webtronics_open_text_ok').onclick=function(){
					var xmlDoc=Utils.docfromtext($('webtronics_svg_code').value);
					var result=webtronics.sanitize(xmlDoc)
					if(result){console.log(result+ ' found');alert('unclean file');return;}
					webtronics.circuit.getfile(xmlDoc.getElementsByTagName('svg')[0]);
					$('webtronics_open_text').hide();
				 	webtronics.setMode('webtronics_select','select', 'Selection');    
				}
			}
				

		webtronics.setsize();


		webtronics.circuit = new Schematic($('webtronics_diagram_area'));
/*replace context menu*/
		var myLinks = [
				{name: 'copy', callback: function(){webtronics.circuit.copy()}},
				{name: 'paste', callback: function(){webtronics.circuit.paste()}},
				{separator: true},
				{name:'Properties',disabled: true,callback:function(){
					webtronics.openProperties()
					$('webtronics_properties_form').style.left = ($('webtronics_main_window').offsetWidth/2)-($('webtronics_properties_form').offsetWidth/2)+'px';

					$('webtronics_properties_form').style.top = ($('webtronics_main_window').offsetHeight/2)-($('webtronics_properties_form').offsetHeight/2)+'px';
				}},
/*

				{name: 'Disabled option', disabled: true},
				{name: 'Toggle previous option', callback: function(){
				        var item = myLinks.find(function(l){return l.name == 'Properties';});
				        item.disabled = (item.disabled == false ? true : false);

						}},
*/
		];
		webtronics.rightclickmenu=new Proto.Menu({
				selector: '#webtronics_diagram_area', // context menu will be shown when element with class name of "contextmenu" is clicked
				className: 'contextmenu', // this is a class which will be attached to menu container (used for css styling)
				menuItems: myLinks // array of menu items
		});
	 	webtronics.setMode('webtronics_select','select', 'Selection');    
		if(code){
			var xmlDoc=Utils.docfromtext(Utils.decode64(code));
			if(!xmlDoc)alert("data opening error");
			else{
					var node=xmlDoc.getElementsByTagName('svg')[0]
					if(!node){alert("code svg node not found");}
					else	webtronics.circuit.getfile(node);
				}
		}
		else if(file){
				var xmlDoc=Utils.openfile(file);
				if(!xmlDoc){alert("file opening error");}
				else{
					var node=xmlDoc.getElementsByTagName('svg')[0]
					if(!node){alert("file svg node not found");}
					else	webtronics.circuit.getfile(node);
				}

		}


		$('webtronics_open_file').style.left = $('webtronics_file_open').offsetLeft+'px';
		$('webtronics_open_file').style.top = $('webtronics_file_open').offsetTop+'px';
		$('webtronics_open_file').style.width = $('webtronics_file_open').offsetWidth+'px';
		$('webtronics_open_file').style.height = $('webtronics_file_open').offsetHeight+'px';


		Event.observe(window, 'resize', function() {
			webtronics.setsize();
			webtronics.circuit.addtools();	
		});


	$('webtronics_toolbar').onselectstart = function() {return false;} 
	$('webtronics_diagram_area').onselectstart = function() {return false;} 
	$('webtronics_side_bar').onselectstart = function() {return false;} 

/*parts list*/
	var category=$$('#webtronics_parts_list > div >p');
	for(var i=0;i<category.length;i++){
		Event.observe(category[i],'click',function(e){
			var menuitems=$$('#webtronics_parts_list > div');
			var li=Event.element(e).parentNode.getElementsByTagName('div');
			for(var j=0;j<menuitems.length;j++){
				var list=menuitems[j].getElementsByTagName('div');
				if(li[0]!=list[0])list[0].style.display='none';
			}
			if(li[0].style.display=='block')li[0].style.display='none';
			else li[0].style.display='block';
		});
	}
	var part=$$('#webtronics_parts_list>div>div');
	for(var i=0;i<part.length;i++){
		Event.observe(part[i],'click',function(e){
			var pname=Event.element(e).firstChild.nodeValue;
			var category=Event.element(e).parentNode.parentNode.firstChild.innerHTML.match(/.*/);
			webtronics.changeimage('./symbols/'+category+'/'+pname+'.svg');
		});
	}


/*menu events*/		
		Event.observe($('webtronics_file_open'), 'click', function() {
			$('webtronics_open_text').style.display = "block";
			webtronics.setMode('webtronics_file_open','select','Selection');
			});
		Event.observe($('webtronics_new'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');
			input_box=confirm("Click OK to Clear the Drawing.");
			if (input_box==true)webtronics.circuit.newdoc();
			});
		Event.observe($('webtronics_chips_open'), 'click', function() {
			webtronics.disablepage();
//			$('webtronics_chips_box').reset();
			webtronics.circuit.clearinfo();
			webtronics.setMode('webtronics_chips_open','select','Selection');
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
			$('webtronics_chips_box').style.display = "block";
			$('webtronics_chips_box').style.left = ($('webtronics_main_window').offsetWidth/2)-($('webtronics_chips_box').offsetWidth/2)+'px';
			$('webtronics_chips_box').style.top = ($('webtronics_main_window').offsetHeight/2)-($('webtronics_chips_box').offsetHeight/2)+'px';
			});
		if($('webtronics_parts_open')){
			webtronics.disablepage();
			Event.observe($('webtronics_parts_open'), 'click', function() {
				webtronics.setMode('webtronics_parts_open','select','Selection');
				$('webtronics_parts_box').style.display = "block";
				$('webtronics_parts_box').style.left = ($('webtronics_main_window').offsetWidth/2)-($('webtronics_parts_box').offsetWidth/2)+'px';
				$('webtronics_parts_box').style.top = ($('webtronics_main_window').offsetHeight/2)-($('webtronics_parts_box').offsetHeight/2)+'px';

				});
		}
		Event.observe($('webtronics_select'), 'click', function() {
				webtronics.circuit.clearinfo();
				webtronics.setMode('webtronics_select','select', 'Selection');
			});
		Event.observe($('webtronics_wire'), 'click', function() {
				webtronics.circuit.clearinfo();
				webtronics.setMode('webtronics_wire','line','Wire');
			});
		Event.observe($('webtronics_text'), 'click', function() {
			webtronics.circuit.clearinfo();
			webtronics.setMode('webtronics_text','text', 'Text');
			});
		if($('webtronics_undo')){
			Event.observe($('webtronics_undo'),'click',function(){
				webtronics.circuit.undo();

			});
		}
		if($('webtronics_redo')){
			Event.observe($('webtronics_redo'),'click',function(){
				webtronics.circuit.redo();
			});
		}

		Event.observe($('webtronics_delete'), 'click', function() {
			webtronics.circuit.clearinfo();
			webtronics.circuit.addhistory();
			webtronics.circuit.deleteSelection();
			});
		if($('webtronics_save')){
			Event.observe($('webtronics_save'), 'click', function() {
				webtronics.circuit.clearinfo();
				webtronics.showMarkup();
				});
		}
		if($('webtronics_netlist')){
			Event.observe($('webtronics_netlist'), 'click', function() {
				webtronics.circuit.createnetlist();
				});
		}
	
		if($('webtronics_invert')){
			$('webtronics_invert').checked=false;
			Event.observe($('webtronics_invert'),'click',function(){
				if($('webtronics_invert').checked==true){
					console.log('invert');
					$("webtronics_background").setAttribute('class','inv');
					$("webtronics_drawing").setAttribute('class','inv');
					$("information").setAttribute('class','inv');
				}
				else{
					$("webtronics_background").removeAttribute('class');
					$('webtronics_drawing').removeAttribute('class');
					$("information").removeAttribute('class');
				}
								
			});
		}		
		$('webtronics_graph').checked=false;
		Event.observe($('webtronics_graph'),'click',function(){
		if($('webtronics_graph').checked){
			webtronics.circuit.graph=true;
			webtronics.circuit.showbackground();									
		}
		else{
			webtronics.circuit.graph=false;
			webtronics.circuit.remove($('graph'));
		}
	
					
						
			});

		$('webtronics_connections').checked=false;
		Event.observe($('webtronics_connections'),'click',function(){
				webtronics.circuit.showconnections($('webtronics_connections').checked);
						
				});
/*properties events*/		
		Event.observe($('webtronics_properties_ok'), 'click', function() {
			$('webtronics_properties_form').hide();
		});
		Event.observe($('webtronics_partvalue'),'keyup',function(){
			webtronics.circuit.selected[0].setAttribute('partvalue',$('webtronics_partvalue').value);
			webtronics.circuit.createvalue(webtronics.circuit.selected[0]);
			$("webtronics_main_window").removeChild($("webtronics_disable"));
			
		});



/*chip box events*/
		Event.observe($('webtronics_vert_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_hor_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_chip_ok'), 'click', function() {
			$("webtronics_main_window").removeChild($("webtronics_disable"));
			webtronics.returnchip();
			//chipmaker.clear();
		});
		Event.observe($('webtronics_chip_cancel'), 'click', function() {
			$("webtronics_main_window").removeChild($("webtronics_disable"));
			$('webtronics_chips_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
/*text add events*/
		if($("webtronics_text_ok")){
			Event.observe($('webtronics_text_ok'), 'click', function() {
				webtronics.circuit.addtext($('webtronics_comment').value);
				$('webtronics_add_text').hide();
				webtronics.setMode('webtronics_select','select','Selection');
			});
		}
		if($("webtronics_text_cancel")){
			Event.observe($('webtronics_text_cancel'), 'click', function() {
				webtronics.setMode('webtronics_select','select','Selection');
				$('webtronics_add_text').hide();
			});
		}
/*text open events*/
		Event.observe($('webtronics_open_text_ok'), 'click', function() {
			$('webtronics_open_text').hide();
		});
		Event.observe($('webtronics_open_text_cancel'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');

			$('webtronics_open_text').hide();
		});

	
});

