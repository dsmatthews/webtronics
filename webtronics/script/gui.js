var webtronics={
		circuit:null,
        copy:null,
		rightclickmenu:null,
        title:null,
        description:null,
        file_id:null,
        tabs:[],
        mode:'',

		Vlist:/\s*expression|\s*url|.*script/,
		Alist:/^(x|y|x1|y1|x2|y2|dx|dy|cx|cy|r|width|height|transform|d|id|class|fill|stroke|visibility|stroke-width|xmlns|xmlns:wtx|connects|partvalue|flippable|spice|font-size|font-weight|font-style|font-family)$/,
		Elist:/^(path|circle|rect|line|text|g|tspan|svg|wtx:part|wtx:pins|wtx:id|wtx:type|wtx:name|wtx:category|wtx:value|wtx:label|wtx:spice|wtx:flip|wtx:model|metadata|)$/,

        parts:{
                "amplifier":{
                    "op-amp":{
                        "lm324":[".inc lm324.mod"],
                        "lm358":[".inc lm358.mod"],
                        "ua741":[".inc ua741.mod"]
                        }
                },
                "digital":{
                    
                    "adc_bridge":{
                        "ideal_adc":[".inc digital.lib"]
                        },
                    "dac_bridge":{
                        "ideal_dac":[".inc digital.lib"]
                        },                    
                    "source":{
                        "ideal_10ns":[".inc digital.lib"]
                        },                
                    "and":{
                        "and1":[".inc digital.lib"]
                        },
                    "nand":{
                        "nand1":[".inc digital.lib"]                        
                        },
                    "nor":{
                        "nor1":[".inc digital.lib"]                        
                        },
                    "not":{
                        "not1":[".inc digital.lib"]
                          },
                    "or":{
                        "or1":[".inc digital.lib"]
                        },
                    "xnor":{
                        "xnor":[".inc digital.lib"]                        
                        },
                    "xor":{
                        "xor":[".inc digital.lib"]                        
                        }
                    },

                "resistors":{
                    "photo-resistor":{},
                    "resistor":{
                        "10":[""],
                        "100":[""],
                        "1.0K":[""],
                        "10K":[""],
                        "100K":[""],
                        "1.0M":[""],
                        "10M":[""]
                    },

                    "vari-resistor":{},
                    "potentiometer":{},
                    "testresistor":{
                        "10":[""],
                        "100":[""],
                        "1.0K":[""],
                        "10K":[""],
                        "100K":[""],
                        "1.0M":[""],
                        "10M":[""]
                    },
                },
                "transistors":{
                    "njfet":{},
                    "npn":{
                        "2n3904":[".inc models.lib"],
                        "2n2222":[".inc models.lib"]                    
                    },
                    "pjfet":{},
                    "pnp":{
                        "2n3906":[".inc models.lib"]
                    },
                    "nmosfet":{},
                    "phototrans":{},
                    "pmosfet":{}
                },
                "audio":{
                    "speaker":{}
                },

                "diodes":{
                    "diode":{
                        "1n4148":[".inc models.lib"],
                        "1n4007":[".inc models.lib"]
                    },
                    "led":{},
                    "photodiode":{},
                    "scr":{},
                    "triac":{},
                    "trigger":{},
                    "zener":{}
                },
                "ic":{
                    "3_pins":{},
                    "4_pins":{},
                    "5_pins":{}
                },
                "switches":{
                    "ncpb":{},
                    "nopb":{},
                    "spst-relay":{},
                    "spst-switch":{}
                },
                "capacitors":{
                    "capacitor":{
                        "1pf":[""],
                        "10pf":[""],
                        "100pf":[""],
                        "1nf":[""],
                        "10nf":[""],
                        "100nf":[""],
                        "1uf":[""]
                    },
                    "polar-cap":{},
                    "varicap":{}
                },
                "frequency":{
                    "crystal":{}
                },
                "inductors":{
                    "coil":{},
                    "tapcoil":{},
                    "transformer":{}
                },
                "power":{
                    "ac":{
                        "SIN(0 5 1KHZ)":[""],
                        "SIN(0 12 60HZ)":[""],
                        "SIN(0 120 60HZ)":[""],
                        "PWL(0 0 10ns 0 10ns 5 20ns 5)R=0":[""],
                        "PULSE(−1 1 2NS 2NS 2NS 50NS 100NS )":[""],
                        
                    },
                    "battery":{
                        "dc 5v":[""],
                        "dc 9v":[""],
                        "dc 12v":[""]
                    },
                    "ground":{},
                    "namewire":{}
                },


                "test":{
/*
                    "analysis":{
                        "tran":[".TRAN 1NS 100NS",
                                ".TRAN 1NS 1000NS 500NS",
                                ".TRAN 10NS 1US UIC",
                                ".TRAN 1ms 100ms"]
                    },
*/
                    "scope":{
                        "tran":[".TRAN 1NS 100NS",
                                ".TRAN 1NS 1000NS 500NS",
                                ".TRAN 10NS 1US UIC",
                                ".TRAN 1ms 100ms"]
                     }
                }            

        },

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
			var text;
            //console.log(Name);
			new Ajax.Request(Name,{
			method:'get',
			asynchronous:false,
			contentType:"text/xml",
			onSuccess: function(transport){
				/*this overrides the mimetype to xml for ie9*/
				//xmldoc=(new DOMParser()).parseFromString(transport.responseText,"text/xml");
				text=transport.responseText;
                //return transport.responseText;
				},
			onFailure: function(){ 
				console.log('Could not load file...'); 
			},
			onException: function(req,exception) {
				console.log(exception);
				return true;
				}, 
			});
			return text;
		},



		setsize:function(){
			var buffer=30;
			var realheight=window.innerHeight-$('webtronics_toolbar').offsetHeight-$('webtronics_status_bar').offsetHeight;
			var realwidth=window.innerWidth-$('webtronics_side_bar').offsetWidth;
			$('webtronics_center').style.width = window.offsetWidth+'px';
			$('webtronics_center').style.height = realheight-buffer+'px';
			$('webtronics_diagram_area').style.width = realwidth-buffer+'px';
			$('webtronics_diagram_area').style.height = realheight-buffer+'px';
            frames=$$('#webtronics_diagram_area>iframe')
           	if(frames[0])frames[0].width = realwidth-buffer+'px';
			$('webtronics_parts_list').style.height=realheight-buffer+'px';
		},

		getMarkup:function() {
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=this.circuit.getMarkup();
			return str;
		},
		


		setMode:function(button,mode, status){

			var imgs = $$('.pressed_button');

			for (var i=0; i<imgs.length; i++) {
				imgs[i].className = 'normal_button';
			}
			$(button).className = 'pressed_button';

			$('webtronics_status_bar').innerHTML = 'Mode: '+status;
			$('webtronics_add_text').hide();
			if(mode=='select'){
				if($('webtronics_context_menu'))$('webtronics_context_menu').style.visibility='visible';
    		}
			else if(mode=='line'){
                if($('webtronics_context_menu'))$('webtronics_context_menu').style.visibility='hidden';
				if(this.circuit.selected){
					this.circuit.unselect();
				}
			}
			else if(mode=='text'){
				if($('webtronics_context_menu'))$('webtronics_context_menu').style.visibility='hidden';
			}
            $('webtronics_context_menu').style.display='none';
    		this.mode=mode;
            this.circuit.mode=this.mode;

		},
        
        
		getvalues:function(elem){
            var nodes=$("webtronics_part_model").childNodes;
			for(var i=nodes.length;i>0;i--){
				nodes[i-1].parentNode.removeChild(nodes[i-1]);
			}
            nodes=$("webtronics_part_dir_model").childNodes;
			for(var i=nodes.length;i>0;i--){
				nodes[i-1].parentNode.removeChild(nodes[i-1]);
			}
			$("webtronics_part_model").appendChild(new Element("option",{"value":""}).update("none"));
			$("webtronics_part_dir_model").appendChild(new Element("option",{"value":""}).update("none"));
			var part=this.circuit.readwtx(elem,"name");
            var cat=this.circuit.readwtx(elem,"category");
            if(cat){    
                for(var c in webtronics.parts[cat][part]){
                    $("webtronics_part_model").insert(new Element("option",{"value":c}).update(c));
                }
            }
 		},

        center:function(e){
        
		    e.style.left = ($('webtronics_main_window').offsetWidth/2)-(e.offsetWidth/2)+'px';
		    e.style.top = ($('webtronics_main_window').offsetHeight/2)-(e.offsetHeight/2)+'px';
        },

		disablepage:function(){
            $("webtronics_disable").style.visibility="visible";
		},
        enablepage:function(){
            $("webtronics_disable").style.visibility="hidden";
        },

		returnchip:function(){
		this.circuit.getgroup($('webtronics_chip_display').getElementsByTagName('g')[0]);
			$('webtronics_chips_box').hide();
			this.setMode('webtronics_select','select','Selection');
		},
	
		openProperties:function(){
			document.forms['webtronics_properties_form'].reset();
			var c=this.circuit.readwtx(this.circuit.selected[0],"name");
			if(!c){
				this.writewtx(this.circuit.selected[0],"name","ic");
			}
			if(c=="ac"||c=="battery"	){
				this.getvalues(this.circuit.selected[0]);
			}
			else if(c=="scope"){
				this.getvalues(this.circuit.selected[0]);

			}
			else {
				this.getvalues(this.circuit.selected[0]);
			}
            var id=this.circuit.readwtx(this.circuit.selected[0],"id");
  			var value=this.circuit.readwtx(this.circuit.selected[0],"value");

        	if(id!=""){$('webtronics_part_id').value=id;}
			if(value!=""){$('webtronics_part_value').value=value;}
            $("webtronics_part_dir_value").value=this.circuit.readwtx(this.circuit.selected[0],'model');
        
			if(!this.circuit.readwtx(webtronics.circuit.selected[0],"value")){
				$('webtronics_part_id').value=this.circuit.getnextid(this.circuit.selected[0],0);
			}

			this.disablepage();
			$('webtronics_properties_form').style.display = "block";

		},

		sanitize:function(xmldoc){
			var elems=xmldoc.getElementsByTagName('*');
			for(var i=0;i<elems.length;i++){
				if(!elems[i].tagName.match(this.Elist))return elems[i].tagName;
				var attr=elems[i].attributes;
				for(var j=0;j<attr.length;j++){
					if(!attr[j].name.match(this.Alist))return attr[j].name;
					if(attr[j].value.match(this.Vlist))return attr[j].value;
				} 
			}
		},
		createfilemenu:function(x,y,id,parent,list){
			var menu=document.createElement('div');
			menu.id=id;
			menu.className='webtronics_menu';
			menu.style.left=x+'px';
			menu.style.top=y+'px';
			for(var i=0;i<list.length;i++){
				var item=new Element('a',{Title:list[i].label,id:'webtronics_context_option',class:'enabled'})
				    .observe('click',list[i].cb.bind(this))
				    .observe('contextmenu', Event.stop)
                    .update(list[i].label);
				menu.insert(item);
                menu.insert(new Element('br'));
  			}
            menu.observe('click',Event.stop)
                .observe('contextmenu',Event.stop);
			menu.style.display='none';
			return menu;			
 
		},

		file_open:function(){
            var file=new Element('input',{'type':'file'});
            var div=new Element('div',{'class':'modal'}).insert(file);
            Event.observe(file,'change',function(){
        		if(window.FileReader){
				    var textReader = new FileReader();
				    textReader.onloadend=function(){
					    if(!textReader.result){
						    console.log("error opening file");
						    return;
					    };

					    var xmlDoc=this.docfromtext(textReader.result);
					    if(!xmlDoc){alert("error parsing svg");}
					    else{
						    var result=this.sanitize(xmlDoc)
						    if(result){console.log(result+ ' found');alert('unclean file');return;}
						    var node=xmlDoc.getElementsByTagName('svg')[0];
						    if(!node){alert("svg node not found")}
						    else this.circuit.getfile(node);
					    }
				    }.bind(this);
				    textReader.readAsText(file.files[0]);
                    $('webtronics_main_window').removeChild(div);
    		    }
		    }.bind(this));
           $('webtronics_main_window').insert(div);
            div.style.display='block';
            file.focus();
            file.click();
			$('webtronics_file_menu').style.display='none';
            div.style.display='none';
		},

        saveuri:function(){
	        $('webtronics_image').style.display = "block";
            this.center($('webtronics_image'));
            var svg = this.getMarkup();
            //console.log(svg);
            if(navigator.appName == 'Microsoft Internet Explorer'){
                $('webtronics_image_div').innerHTML=svg;
            }
            else{
                $("webtronics_image_save").src="data:image/svg+xml;base64," + encode64(svg);
            }
            $('webtronics_file_menu').style.display='none';
            this.disablepage();
        },




		file_new:function(){
			$('webtronics_file_menu').style.display='none';
			//this.setMode('webtronics_select','select','Selection');
			input_box=confirm("Click OK to Clear the Drawing.");
			if (input_box==true){
                $('webtronics_diagram_area').removeChild($("webtronics_frame"));
                var frame=new Element('iframe',{id:'webtronics_frame',src:'canvas/canvas.html'});
                $('webtronics_diagram_area').insert(frame);
                Event.observe(frame,'load',function(){
                    var filename='Schematic.svg';
                    this.attachframe(filename,frame);

                }.bind(this));
                $("webtronics_invert").checked=false;
                $("webtronics_graph").checked=false;
                $("webtronics_connections").checked=false;
            }
		},

        attachframe:function(filename,frame){
            this.circuit=frame.contentWindow.circuit;
            this.setMode('webtronics_select','select', 'Selection');    
//            this.circuit.mode=this.mode;
            
/*attach the menu*/
            Event.observe(this.circuit.container,'contextmenu',function(e){
                $('webtronics_context_menu').style.top=Event.pointerY(e)+'px';                        
                $('webtronics_context_menu').style.left=Event.pointerX(e)+'px';                        
                $('webtronics_context_menu').style.display='block';                        
                if(this.circuit.selected.length===1&& this.circuit.selected[0].tagName==='g'){
                    $$('div#webtronics_context_menu [title=Properties]')[0].className='enabled';
                }
                else {
                    $$('div#webtronics_context_menu [title=Properties]')[0].className='disabled';
                }

                Event.stop(e);
            }.bind(this));
            Event.observe(this.circuit.container,'click',function(e){
                if(Event.isLeftClick(e)){                
                    if($('webtronics_context_menu')){
                        $('webtronics_context_menu').style.display='none';
                    }
                }
            }.bind(this));


        },

        formatnetlist:function(spice1,spice2){
          var html=new Element('div');
          if(spice2===null){
                var lines=spice1.split('\n');
                for(var i=0;i<lines.length;i++){
                    html.insert(lines[i]);
                    html.insert(new Element('br'));
                }
          }
          return html;            
        },
        
         postspice:function(spice){
            var text;
			new Ajax.Request("spice.php",{
			method:'post',
			contentType:"text/plain",
			asynchronous:true,
			postBody:spice,
			onSuccess:function(transport){
                if($("webtronics_scope_display_image"))$("webtronics_scope_display_image").parentNode.removeChild($("webtronics_scope_display_image"));
                var content;
                if(transport.responseText.match("data:image/png;base64,")){                
                    var content=new Element("img",{"src":transport.responseText,"width":400,"height":400,"id":"webtronics_scope_display_image"});
                }
                else{
                    var content=new Element("textarea",{"width":400,"height":400,"id":"webtronics_scope_display_image"}).update(transport.responseText);
                }            
                if(content){
                    $("webtronics_scope_display").style.display="block";
                    $("webtronics_scope_display_div").insert(content);
                }
			},			
			onFailure: function(){ 
				console.log('Could not retrieve file...'); 
			},
			onException: function(req,exception) {
				console.log(exception);
				} 
			});

		},

       savepng:function(){
            
            if(navigator.appName == 'Microsoft Internet Explorer'){
                $('webtronics_image_div').innerHTML="<img id='webtronics_image_save' >";
            }
            var doc= document.implementation.createDocument("", "", null);
	        var svg = doc.createElementNS(this.circuit.svgNs, "svg");
/*
I want to preserve the css color for inverted diagrams in png
*/
/*add the css*/
            if(this.circuit.drawing.getAttribute('class')==="inv"){
                var style=doc.createElementNS(this.circuit.svgNs,"style");
                style.setAttribute('type',"text/css");
                style.appendChild(doc.createCDATASection("g,rect,line{fill:black;stroke:white;}"+
                                                        "circle,text{fill:white;stroke:white;}"));
                svg.appendChild(style);
            }               
     
            var b=this.circuit.background.cloneNode(true);
            b.removeAttribute('transform');
            svg.appendChild(b);

            for(var ch=0;ch<this.circuit.drawing.childNodes.length;ch++){
                var element=this.circuit.drawing.childNodes[ch].cloneNode(true);
	  	        svg.appendChild(element);
	        }

            var svgsize=this.circuit.svgSize();
	        svg.setAttribute('width',svgsize.width+10);
	        svg.setAttribute('height',svgsize.height+10);
            
            doc.appendChild(svg);
            if($("webtronics_canvas")){
                $("webtronics_canvas").parentNode.removeChild($("webtronics_canvas"));
            }
            var canvas=new Element('canvas',{'id':'webtronics_canvas','width':svgsize.width+10+'px','height':svgsize.height+10+'px',style:"visibility:hidden"});
            $("webtronics_image").insert(canvas);
            var ctx=$("webtronics_canvas").getContext("2d");
	        $('webtronics_image').style.display = "block";
            var drawing=(new XMLSerializer()).serializeToString(svg);
//            console.log(drawing);
            ctx.drawSvg(doc, 0, 0, svgsize.width+10,svgsize.height+10);    
            this.center($('webtronics_image'));
            var url= canvas.toDataURL("image/png");
            $("webtronics_image_save").src=url;
            $('webtronics_file_menu').style.display='none';
            this.disablepage();
        },



/*all events are loaded here*/
    init:function(){
        Event.observe(window, 'load', function(){
		    if (!window.console) {
			    window.console = {};
			    window.console.log = function(){};
		    }
            webtronics.setsize();
            var menu;
            $("webtronics_invert").checked=false;
            $("webtronics_graph").checked=false;
            $("webtronics_connections").checked=false;
            
            menu=this.createfilemenu($('webtronics_file').offsetLeft,
		    $('webtronics_file').offsetTop+$('webtronics_file').offsetHeight,
		    'webtronics_file_menu',
            $('webtronics_main_window'),
		    [{label:'import',cb:webtronics.file_open},
		    {label:'save',cb:webtronics.saveuri},
		    {label:'save-png',cb:webtronics.savepng},
		    {label:'new',cb:webtronics.file_new}]);
            menu.observe('mouseout',function(e){
                if((e.relatedTarget!=null)&&!((e.relatedTarget == menu) || e.relatedTarget.descendantOf(menu))){
//                if(!(e.relatedTarget == menu) ){
                    menu.style.display='none';
                }
            });    

            $("webtronics_main_window").insertBefore(menu,$("webtronics_disable"));
		

    /*replace context menu*/
		    var myLinks = [
                    {label:'copy',cb:function(){
                        webtronics.copy=webtronics.circuit.copy();
                        $('webtronics_context_menu').style.display='none';
                        }},
                    {label:'paste',cb:function(){
                        webtronics.circuit.paste(webtronics.copy);
                        $('webtronics_context_menu').style.display='none';}},

                    {label:'delete',cb:function(){
                        webtronics.circuit.deleteSelection();
                        $('webtronics_context_menu').style.display='none';}},

				    {label:'Properties',cb:function(){
					    webtronics.openProperties()
					    webtronics.center($('webtronics_properties_form'));
                        $('webtronics_context_menu').style.display='none';
				    }}];
            var contextmenu=this.createfilemenu(0,
                0,
                'webtronics_context_menu',
                $('webtronics_diagram_area'),
                myLinks);
            $("webtronics_diagram_area").insert(contextmenu);
/*add a new frame */
            var frame=new Element('iframe',{id:'webtronics_frame',src:'canvas/canvas.html'});
            $('webtronics_diagram_area').insert(frame);
            
            Event.observe(frame,'load',function(){
                var filename='Schematic.svg';
                this.attachframe(filename,frame);
            }.bind(this));

		    Event.observe(window, 'resize', function() {
			    webtronics.setsize();
			    webtronics.circuit.addtools();	
		    });
       
	    $('webtronics_toolbar').onselectstart = function() {return false;} 
	    $('webtronics_diagram_area').onselectstart = function() {return false;} 
	    $('webtronics_side_bar').onselectstart = function() {return false;} 

/*parts list*/
            for (var cat in webtronics.parts){
                var category=new Element("div",{"id":"webtronics_"+cat})
                                        .insert(new Element("p").update(cat)
                                                .observe('click',function(e){
                                                        var menuitems=$$('#webtronics_parts_list>div>div');
                                                        for(var i=0;i<menuitems.length;i++){
				                                            if(menuitems[i].parentNode==Event.element(e).parentNode){
				                                                if(menuitems[i].style.display=='none'){
                                                                    menuitems[i].style.display='block';
                                                                }
                                                                else{
                                                                    menuitems[i].style.display='none';
                                                                }
                                                            }
                                                            else{
                                                                menuitems[i].style.display='none';
                                                            }
			                                            }
                                                }));
  
                for(var partname in webtronics.parts[cat]){
                    var part=new Element("div",{"id":"webtronics_"+partname,'style':"display:none",'title':partname})
                                        .update(webtronics.openfile("symbols/"+cat+'/'+partname+'.svg'));
                       
		            Event.observe(part,'mousedown',function(e){
			            webtronics.circuit.unselect();
			            var element=Event.element(e);
			            while(element.tagName!=="svg"){
			            element=element.parentNode;
			            }
			            var group=element.firstChild;
			            while(group.nodeType!==1||group.tagName!=="g"){
				            group=group.nextSibling;
			            }
			            webtronics.circuit.getgroup(group);
			            webtronics.setMode('webtronics_select','select','Selection');
			
		            });
		            Event.observe(part,'mouseup',function(e){
			            webtronics.circuit.deleteSelection();				
		            });
	            /*this might get the ipad working*/
		            Event.observe(part, "onclick", void(0));
                    category.insert(part);
                }                
                $("webtronics_parts_list").insertBefore(category,$("webtronics_parts_list").firstChild);

            };
/*chipmaker*/
    $("webtronics_hor_pins").insert(Element("option",{"value":0}).update(0));
    for(var i=1;i<50;i++){
        if(i>3){
            $("webtronics_hor_pins").insert(Element("option",{"value":i}).update(i*2));
        }
        $("webtronics_vert_pins").insert(Element("option",{"value":i}).update(i*2));

    }


    /*menu events*/		
		    Event.observe($('webtronics_file'), 'click', function() {
			    if($('webtronics_file_menu').style.display=='block'){
                    $('webtronics_file_menu').style.display='none';
                }            
                else {
                    $('webtronics_file_menu').style.display='block';
                }                
		    });
		    Event.observe($('webtronics_chips_open'), 'click', function() {
			    webtronics.circuit.clearinfo();
    		    webtronics.setMode('webtronics_chips_open','select','Selection');
    		    chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
    		    $('webtronics_chips_box').style.display = "block";
    		    webtronics.center($('webtronics_chips_box'));
			    webtronics.disablepage();
        	});
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

                    var content=$$("#webtronics_netlist_text_div > *") 
                    for(var i=0;i<content.length;i++){
                        $("webtronics_netlist_text_div").removeChild(content[i]);
                    }
			        $("webtronics_netlist_text_div").insert(webtronics.formatnetlist(webtronics.circuit.createnetlist(),null));
                    $("webtronics_netlist_text").style.display='block';
                    webtronics.center($('webtronics_netlist_text'));
                    webtronics.disablepage();

                });
		    }
            if($('webtronics_run')){
			    Event.observe($('webtronics_run'), 'click', function() {
                    webtronics.postspice(webtronics.circuit.createnetlist());
                });

            }
	
		    if($('webtronics_invert')){

			    Event.observe($('webtronics_invert'),'click',function(){
        			webtronics.circuit.invert($('webtronics_invert').checked);
						
			    });
		    }		
		    if($('webtronics_graph')){
                Event.observe($('webtronics_graph'),'click',function(){
		            if($('webtronics_graph').checked){
			            webtronics.circuit.graph=true;
			            webtronics.circuit.showbackground();									
		            }
		            else{
			            webtronics.circuit.graph=false;
			            webtronics.circuit.showbackground();									
		            }
        		});
            }
		    if($('webtronics_connections')){
            $('webtronics_connections').checked=false;
		        Event.observe($('webtronics_connections'),'click',function(){
				        webtronics.circuit.showconnections($('webtronics_connections').checked);
						
		        });
            }
   /*properties events*/		

		    if($('webtronics_properties_ok'))Event.observe($('webtronics_properties_ok'), 'click', function() {
			    $('webtronics_properties_form').hide();
			    webtronics.enablepage();
                var model=webtronics.circuit.selected[0];
                webtronics.circuit.writewtx(model,"id",$('webtronics_part_id').value);
	            webtronics.circuit.writewtx(model,"value",$('webtronics_part_value').value);
                webtronics.circuit.writewtx(model,"model",$('webtronics_part_dir_value').value);
                webtronics.circuit.createvalue(webtronics.circuit.selected[0]);
		    });

		    if($('webtronics_properties_cancel'))Event.observe($('webtronics_properties_cancel'), 'click', function() {
			    $('webtronics_properties_form').hide();
			    webtronics.enablepage();
            });

		    if($('webtronics_part_model'))Event.observe($('webtronics_part_model'),'change',function(){
                var part=webtronics.circuit.readwtx(webtronics.circuit.selected[0],"name");
                var cat=webtronics.circuit.readwtx(webtronics.circuit.selected[0],"category");
                if($('webtronics_part_model').value){
                    var nodes=$("webtronics_part_dir_model").childNodes;
                    for(var i=nodes.length;i>0;i--){
	                    nodes[i-1].parentNode.removeChild(nodes[i-1]);
                    }
        			$("webtronics_part_dir_model").appendChild(new Element("option",{"value":""}).update("none"));
                    for(var i=0;i<webtronics.parts[cat][part][$('webtronics_part_model').value].length;i++){
                        $("webtronics_part_dir_model").insert(new Element("option",{"value":webtronics.parts[cat][part][$('webtronics_part_model').value][i]}).update(webtronics.parts[cat][part][$('webtronics_part_model').value][i]));
                    }
                }
                $('webtronics_part_value').value=$("webtronics_part_model").options[$("webtronics_part_model").selectedIndex].value;

		    });

		    if($('webtronics_part_dir_model'))Event.observe($('webtronics_part_dir_model'),'change',function(){
                $('webtronics_part_dir_value').value=$("webtronics_part_dir_model").options[$("webtronics_part_dir_model").selectedIndex].value;
         
            });
/*save as png modal*/
            if($("webtronics_image_ok")){
       		    Event.observe($('webtronics_image_ok'), 'click', function() {
			        webtronics.enablepage();
			        $('webtronics_image').hide();
			        webtronics.setMode('webtronics_select','select','Selection');
		        });
        

            }

    /*chip box events*/
		    Event.observe($('webtronics_vert_pins'), 'change', function() {
                $("webtronics_chip_display").parentNode.removeChild($("webtronics_chip_display"));
                var div=new Element("div",{id:"webtronics_chip_display"})
                    .insert(chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value));
                $("webtronics_chips_box").insertBefore(div,$("webtronics_chips_box").firstChild);
		    });
		    Event.observe($('webtronics_hor_pins'), 'change', function() {
                $("webtronics_chip_display").parentNode.removeChild($("webtronics_chip_display"));
                var div=new Element("div",{id:"webtronics_chip_display"})
                    .update(chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value));
                $("webtronics_chips_box").insertBefore(div,$("webtronics_chips_box").firstChild);
		    });
		    Event.observe($('webtronics_chip_ok'), 'click', function() {
			    webtronics.enablepage()
			    webtronics.returnchip();
			    //chipmaker.clear();
		    });
		    Event.observe($('webtronics_chip_cancel'), 'click', function() {
			    webtronics.enablepage();
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
   /*netlist text events*/
            if($("webtronics_netlist_text_ok")){
			    Event.observe($('webtronics_netlist_text_ok'), 'click', function() {
				    webtronics.setMode('webtronics_select','select','Selection');
				    $('webtronics_netlist_text').hide();
                    webtronics.enablepage();
			    });
            }  
     /*scope events*/
           if($("webtronics_scope_display")){
			    Event.observe($('webtronics_scope_display_ok'), 'click', function() {
				    webtronics.setMode('webtronics_select','select','Selection');
				    $('webtronics_scope_display').hide();
//                    webtronics.enablepage();
                });
                Event.observe($("webtronics_scope_display"),'mousedown',function(e){
                       var startx=e.layerX;
                       var starty=e.layerY;
                      Event.observe($("webtronics_scope_display"),'mousemove',function(e){
                        $("webtronics_scope_display").style.top =e.clientY-starty + 'px';
                        $("webtronics_scope_display").style.left =e.clientX-startx + 'px';
                      });
                        e.preventDefault();
                });
                Event.observe($("webtronics_scope_display"),'mouseup',function(){
                    Event.stopObserving($("webtronics_scope_display"),'mousemove');
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

	
        }.bind(this));
    }
}
webtronics.init();
