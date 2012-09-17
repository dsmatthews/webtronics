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
		Alist:/^(x|y|x1|y1|x2|y2|cx|cy|r|width|height|transform|d|id|class|fill|stroke|visibility|stroke-width|xmlns|xmlns:wtx|connects|partvalue|flippable|spice|font-size|font-weight|font-style|font-family)$/,
		Elist:/^(path|circle|rect|line|text|g|tspan|svg|wtx:spicemodel)$/,

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
			new Ajax.Request(Name,{
			method:'get',
			asynchronous:false,
			contentType:"text/xml",
			onSuccess: function(transport){
				/*this overrides the mimetype to xml for ie9*/
				//xmldoc=(new DOMParser()).parseFromString(transport.responseText,"text/xml");
				text=transport.responseText;
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
			$('webtronics_tab_area').style.width = realwidth-buffer+'px';
			$('webtronics_diagram_area').style.width = realwidth-buffer+'px';
			$('webtronics_diagram_area').style.height = realheight-$('webtronics_tab_area').offsetHeight-buffer+'px';
            frames=$$('#webtronics_diagram_area>iframe')
            for(var i=0;i<frames.length;i++){
            	frames[i].width = realwidth-buffer+'px';
    			frames[i].height = realheight-$('webtronics_tab_area').offsetHeight-buffer+'px';
            }
			$('webtronics_parts_list').style.height=realheight-buffer+'px';
		},

		getMarkup:function() {
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=this.circuit.getMarkup();
			return str;
		},
		
		download:function(){

//			var w=window.open("data:image/svg+xml;base64;charset=utf-8," + Utils.encode64(webtronics.getMarkup() ));
			var text=this.getMarkup();
			new Ajax.Request("/upload",{
			method:'post',
			contentType:"image/svg+xml",
			asynchronous:false,
			postBody:text,
			onSuccess:function(transport){
				window.open("/upload");
			},			
			onFailure: function(){ 
				console.log('Could not retrieve file...'); 
			},
			onException: function(req,exception) {
				console.log(exception);
				return true;
				} 
			});
			//return text;



		},

		createPicker:function() {
			  var view = new google.picker.View(google.picker.ViewId.DOCS);
			  view.setMimeTypes('image/svg+xml');
              console.log(this.CLIENT_ID);
			  picker = new google.picker.PickerBuilder().
                            setAppId(this.CLIENT_ID).
                            addView(view).
                            setCallback(this.pickerCallback.bind(this)).
                            build();
                            picker.setVisible(true);

			},

		GetSuccess:function(id,data){
			if (data.redirect) {
				window.location.href = data.redirect;
			}
      
			if(!data['content']){
				console.log("file is empty");
			};
            console.log(data);
            if(this.fileaction=='open'){
                this.file_id=id;
                this.title = data['title'];
                this.description = data['description'];
	    		var xmlDoc=docfromtext(data['content']);
	    		if(!xmlDoc){alert("error parsing svg");}
	    		else{
	    			var result=webtronics.sanitize(xmlDoc)
	    			if(result){console.log(result+ ' found');alert('unclean file');return;}
	    			var node=xmlDoc.getElementsByTagName('svg')[0];

	    			if(!node){alert("svg node not found")}
	    			else {
                        if(this.circuit===null||this.circuit.drawing.childNodes.length>0){
                            var frame=new Element('iframe',{name:'iframe1',src:'canvas/canvas.html'});
                            $('webtronics_diagram_area').insert(frame);
                            Event.observe(frame,'load',function(){
                                this.attachframe(this.title,frame);
                                this.circuit.getfile(node);
                            }.bind(this));
                        }
                        else if(this.circuit.drawing.childNodes.length===0){
                            this.circuit.getfile(node);
                        }
                    }
			    }
            }
            else if(this.fileaction=='import'){
	    		var xmlDoc=docfromtext(data['content']);
	    		if(!xmlDoc){alert("error parsing svg");}
	    		else{
	    			var result=webtronics.sanitize(xmlDoc)
	    			if(result){console.log(result+ ' found');alert('unclean file');return;}
	    			var node=xmlDoc.getElementsByTagName('svg')[0];
        			if(!node){alert("svg node not found");}
	    			else {
                        this.circuit.getfile(node);
                    }
			    }
            }
		},

		Get:function(id) {
            var response;
			new Ajax.Request('/svc?file_id=' + id,{
                method:'get',
                asynchronous:false,
				onSuccess:function(transport){response=transport.responseJSON;},
				onFailure: function(){ 
					console.log('Could not load file '+id); 
				},
				onException: function(req,exception) {
					console.log(exception);
					return true;
					}, 
				});
            this.GetSuccess(id,response);
        },


      // A simple callback implementation for Google Docs.
		pickerCallback:function(data) {
				if(data.action == "picked"){
    				this.Get(data.docs[0].id);
                }

		},

        CreateUi:function() {
        
            var ok=new Element('img',{'src':'buttons/ok.png'});
            var cancel=new Element('img',{'src':'buttons/cancel.png'});
            var gsavedialog=new Element('div',{'class':'modal'});
            gsavedialog.insert(new Element('div')
                .insert(new Element('form',{'name':'gsave'})
                .insert(new Element('p').update('File Name'))
                .insert(new Element('input',{'name':'title','value':this.title}))
                .insert(new Element('br'))
                .insert(new Element('p').update('File Description'))
                .insert(new Element('textarea',{'name':'description','cols':"50",'rows':4}).update(this.description))));
            Event.observe(ok,'click',function(){
                if(document.forms.gsave.title.value)this.title=document.forms.gsave.title.value;
                if(document.forms.gsave.description.value)this.description=document.forms.gsave.description.value;
                this.Save();
                $('webtronics_main_window').removeChild(gsavedialog);
                this.enablepage();
                }.bind(this));
            Event.observe(cancel,'click',function(){
                $('webtronics_main_window').removeChild(gsavedialog);
                this.enablepage();
                }.bind(this));
                            
            gsavedialog.insert(ok);
            gsavedialog.insert(cancel);
            $('webtronics_main_window').insert(gsavedialog);
            gsavedialog.style.display='block';
            this.center(gsavedialog);
            this.disablepage();
        },

        Read:function() {
          return {
              'content': this.getMarkup(),
              'title': this.title,
              'description': this.description,
              'mimeType': 'image/svg+xml',
              'resource_id': this.file_id
            };
        },
        Save:function(){
            var request=new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState == 4 && request.status == 200) {
                    console.log('save success');
                }
            }
            request.open((this.file_id===null)?'POST':'PUT','/svc',false);
            request.setRequestHeader("Content-Type", "application/json");            
            request.send(JSON.stringify(this.Read()));


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
			var c=elem.getAttribute("class");
			var text=this.openfile("models/"+c+'.cir');
			var nodes=$("webtronics_part_model").childNodes;
			for(var i=nodes.length;i>0;i--){
				nodes[i-1].parentNode.removeChild(nodes[i-1]);

			}
			var option=document.createElement("option");
			option.setAttribute("value","none");
			option.innerHTML="none";
			$("webtronics_part_model").appendChild(option);
			if(!text)return;
			var rx= /.*\n/gi;
			var model;
			while((model=rx.exec(text))!=null){
				var option=document.createElement("option");
				//console.log(model[0]);
				option.setAttribute("value",model[0]);
				option.innerHTML=model[0];
				$("webtronics_part_model").appendChild(option);
			}

		},

        center:function(e){
        
		    e.style.left = ($('webtronics_main_window').offsetWidth/2)-(e.offsetWidth/2)+'px';
		    e.style.top = ($('webtronics_main_window').offsetHeight/2)-(e.offsetHeight/2)+'px';
        },

		disablepage:function(){
/*			var div=document.createElement('div');
			div.id="webtronics_disable";
			div.onselectstart=function(){return false;};

			$('webtronics_main_window').insertBefore(div,$("webtronics_chips_box"));
*/
            $("webtronics_disable").style.visibility="visible";
		},
        enablepage:function(){
            $("webtronics_disable").style.visibility="hidden";
//            $('webtronics_main_window').removeChild($('webtronics_disable'));
        },

		returnchip:function(){
		this.circuit.getgroup($('webtronics_chip_display').getElementsByTagName('g')[0]);
			$('webtronics_chips_box').hide();
			this.setMode('webtronics_select','select','Selection');
		},
	
		openProperties:function(){
			$('webtronics_part_value').clear();
			$('webtronics_part_id').clear();
			$('webtronics_model_text').clear();
			var c=this.circuit.selected[0].getAttribute("class");
			if(!c){
				this.circuit.selected[0].setAttribute("c","ic");
			}
			if(c=="ac"||c=="battery"	){
				this.getvalues(this.circuit.selected[0]);
			}
			else if(c=="scope"){
				this.getvalues(this.circuit.selected[0]);

			}
			else {
				this.getvalues(this.circuit.selected[0]);
				$("webtronics_model_text").value=this.circuit.selected[0].getAttribute("spice");
			}
			var rx=/(\w*)\s*(.*)/mi;
			var value=rx.exec(this.circuit.selected[0].getAttribute('partvalue'));
			if(value[1]!=""){$('webtronics_part_id').value=value[1];}
			if(value[2]!=""){$('webtronics_part_value').value=value[2];}

			if(!webtronics.circuit.selected[0].getAttribute("partvalue")){
				$('webtronics_part_id').value=this.circuit.getnextid(this.circuit.selected[0]);
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
            menu.observe('click',Event.stop)
                .observe('contextmenu',Event.stop);    
			for(var i=0;i<list.length;i++){
				var item=new Element('a',{Title:list[i].label,id:'webtronics_context_option',class:'enabled'})
				    .observe('click',list[i].cb.bind(this))
				    .observe('contextmenu', Event.stop)
                    .update(list[i].label);
				menu.insert(item);
                menu.insert(new Element('br'));
  			}
			menu.style.display='none';
			return menu;			
 
		},

		file_open:function(){
			$('webtronics_file_menu').style.display='none';
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
                    console.log(file.files[0]);
				    textReader.readAsText(file.files[0]);
                    $('webtronics_main_window').removeChild(div);
    		    }
		    }.bind(this));
            $('webtronics_main_window').insert(div);
            div.style.display='block';
            file.focus();
            file.click();
            div.style.display='none';
            
            			
		},
		file_save:function(){
			$('webtronics_file_menu').style.display='none';
			this.download();
		},

        saveuri:function(){
            this.disablepage();
	        $('webtronics_image').style.display = "block";
            this.center($('webtronics_image'));
          //  $("webtronics_image_save").tagName="iframe";
            var svg = webtronics.getMarkup();
            console.log(svg);
            $("webtronics_image_save").src="data:image/svg+xml;base64," + encode64(svg);
            $('webtronics_file_menu').style.display='none';
        },

		file_new:function(){
			$('webtronics_file_menu').style.display='none';
			this.setMode('webtronics_select','select','Selection');
			input_box=confirm("Click OK to Clear the Drawing.");
			if (input_box==true)this.circuit.newdoc();
		},
		gdrive_open:function(){
			$('webtronics_file_menu').style.display='none';
            this.fileaction='open';
			this.createPicker();
		},
		gdrive_import:function(){
			$('webtronics_file_menu').style.display='none';
            this.fileaction='import';
			this.createPicker();
		},
    	gdrive_save:function(){
			$('webtronics_file_menu').style.display='none';
            this.CreateUi();
        },
		gdrive_new:function(){
			$('webtronics_file_menu').style.display='none';
        },

        attachframe:function(filename,frame){
            this.circuit=frame.contentWindow.circuit;
            this.newtab(filename,frame);
     	 	this.setMode('webtronics_select','select', 'Selection');    


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

        newtab:function(filename,frame){
            var newt=$('webtronics_new_tab');
            if(newt===null){
                newt=new Element('div',{'id':'webtronics_new_tab'})
                            .insert(new Element('a',{"style":'margin:8px;'}).update('+'));
                Event.observe(newt,'click',function(){
                    var f=new Element('iframe',{name:'iframe1',src:'canvas/canvas.html'});
                    $('webtronics_diagram_area').insert(f);
                    Event.observe(f,'load',function(){
                        this.attachframe('Schematic.svg',f);
                    }.bind(this));

                }.bind(this));
                $('webtronics_tab_area').insert(newt);
            }
            var tab=new Element('div',{'class':'webtronics_selected_tab'});
            var close = new Element('div',{"class":'webtronics_close_tab'})
                            .insert(new Element('a').update('x'));
         
            Event.observe(tab,'click',function(e){
                element=Event.element(e);

                while(element.className!=='webtronics_tab'&&element.className!=='webtronics_selected_tab'){
                    element=element.parentNode;
                }
                var tabs=$$('div.webtronics_selected_tab');
                for(var i=0;i<tabs.length;i++){
                    tabs[i].className='webtronics_tab';
                }
                element.className='webtronics_selected_tab';
                var frames=$$('iframe');
                for(var i=0;i<frames.length;i++){
                    frames[i].style.visibility='hidden';
                }                
                frame.style.visibility='visible';
                this.circuit=frame.contentWindow.circuit;
                this.circuit.mode=this.mode;
                $('webtronics_context_menu').style.display='none';
                $('webtronics_connections').checked=this.circuit.connections;
                $('webtronics_graph').checked=this.circuit.graph;
                $('webtronics_invert').checked=this.circuit.inv;
            }.bind(this));
            Event.observe(close,'click',function(e){
                element=Event.element(e);
                while(element.className!=='webtronics_tab'&&element.className!=='webtronics_selected_tab'){
                    element=element.parentNode;
                }
                element.parentNode.removeChild(element);
                $('webtronics_diagram_area').removeChild(frame);
                $('webtronics_tab_area').firstChild.click();
                e.stopPropagation();                
            }.bind(this));

            tab.insert(close);
            tab.insert(new Element('div',{'style':'position:relative;float:right;overflow:hidden'}).update(filename));
            newt.insert({'before':tab});
            tab.click();
        },
        
        savepng:function(){
            this.disablepage();
/*
I want to preserve the css color for inverted diagrams in png
*/
            var d=this.circuit.drawing.cloneNode(true);
            var b=this.circuit.background.cloneNode(true);
            d.removeAttribute('transform');
            b.removeAttribute('transform');
        	var svgsize=this.circuit.svgSize(this.circuit.drawing);
                        
            if($("webtronics_canvas")){
                $("webtronics_canvas").parentNode.removeChild($("webtronics_canvas"));
            }
            var canvas=new Element('canvas',{'id':'webtronics_canvas','width':svgsize.width+10+'px','height':svgsize.height+10+'px',style:"visibility:hidden"});
            $("webtronics_image").insert(canvas);
            var ctx=$("webtronics_canvas").getContext("2d");
	        $('webtronics_image').style.display = "block";
            
            if(this.circuit.drawing.getAttribute('class')=='inv'){
                var c=d.childNodes;
                for(var i=0;i<c.length;i++){
                     if(c[i].tagName=='circle'||c[i].tagName=='text')c[i].setAttributeNS(this.circuit.svgNs,'style','fill:white;stroke:white;');
                     else c[i].setAttributeNS(this.circuit.svgNs,'style','fill:black;stroke:white;');      
                }
                var c=b.childNodes;
                for(var i=0;i<c.length;i++){
                     c[i].setAttributeNS(this.circuit.svgNs,'style','fill:black;stroke:white;');
                }

            }
            var drawing=(new XMLSerializer()).serializeToString(d);
            var bg=(new XMLSerializer()).serializeToString(b);
            //console.log(drawing);

            ctx.drawSvg(bg, 0, 0, svgsize.width+10,'height',svgsize.height+10);    
            ctx.drawSvg(drawing, 0, 0, svgsize.width+10,'height',svgsize.height+10);    
       	    this.center($('webtronics_image'));
            var url= canvas.toDataURL("image/png");
            $("webtronics_image_save").src=url;
            $('webtronics_file_menu').style.display='none';
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
		    if(webtronics.CLIENT_ID){
                menu=this.createfilemenu($('webtronics_file').offsetLeft,
			    $('webtronics_file').offsetTop+$('webtronics_file').offsetHeight,
			    'webtronics_file_menu',
                $('webtronics_main_window'),
			    [{label:'import',cb:webtronics.file_open},
			    {label:'save',cb:webtronics.saveuri},
			    {label:'save-png',cb:webtronics.savepng},
			    {label:'new',cb:webtronics.file_new},
			    {label:'G-drive open',cb:webtronics.gdrive_open},
			    {label:'G-drive import',cb:webtronics.gdrive_import},
			    {label:'G-drive save',cb:webtronics.gdrive_save},
			    {label:'G-drive new',cb:webtronics.gdrive_new}]);
            }
            else{
                menu=this.createfilemenu($('webtronics_file').offsetLeft,
			    $('webtronics_file').offsetTop+$('webtronics_file').offsetHeight,
			    'webtronics_file_menu',
                $('webtronics_main_window'),
			    [{label:'import',cb:webtronics.file_open},
			    {label:'save',cb:webtronics.saveuri},
			    {label:'save-png',cb:webtronics.savepng},
			    {label:'new',cb:webtronics.file_new}]);
            }
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
        /*add a new tab */
            var frame=new Element('iframe',{name:'iframe1',src:'canvas/canvas.html'});
            $('webtronics_diagram_area').insert(frame);
            Event.observe(frame,'load',function(){
                var filename='Schematic.svg';
        /* if google gave us a file id load it*/
                if(webtronics.FILE_IDS!==undefined){
                    if(webtronics.FILE_IDS[0]!==undefined){
                        webtronics.file_id=webtronics.FILE_IDS[0];
                        if(webtronics.FILE_IDS[0]!=''){
                            webtronics.fileaction='open';
                            webtronics.Get(webtronics.file_id);
                        }
                        else {
                            this.attachframe(filename,frame);
                        }
                    }
                    else {
                        this.attachframe(filename,frame);
                    }
                }
                else {
                    this.attachframe(filename,frame);
                }
            }.bind(this));

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
		
		    Event.observe(part[i],'mousedown',function(e){
			    webtronics.circuit.unselect();
			    var element=Event.element(e);
			    while(element.tagName!=="svg"){
			    element=element.parentNode;
			    }
			    var group=element.firstChild;
			    while(group.nodeType!==1||group.tagName!=="g"){
				    group=group.nextSibling;
			    }
			    var model=document.createElementNS(webtronics.circuit.wtxNs,"wtx:spicemodel");
			    if(!model){
				    group.appendChild(model);
			    }
			    webtronics.circuit.getgroup(group);
			    webtronics.setMode('webtronics_select','select','Selection');
			
		    });
		    Event.observe(part[i],'mouseup',function(e){
			    webtronics.circuit.deleteSelection();				
		    });
	    /*this might get the ipad working*/
		    Event.observe(part[i], "onclick", void(0));
			
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
			    webtronics.disablepage();
    //			$('webtronics_chips_box').reset();
			    webtronics.circuit.clearinfo();
			    webtronics.setMode('webtronics_chips_open','select','Selection');
			    chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
			    $('webtronics_chips_box').style.display = "block";
			    webtronics.center($('webtronics_chips_box'));
			    });
		    if($('webtronics_parts_open')){
			    webtronics.disablepage();
			    Event.observe($('webtronics_parts_open'), 'click', function() {
				    webtronics.setMode('webtronics_parts_open','select','Selection');
				    $('webtronics_parts_box').style.display = "block";
				    webtronics.center($('webtronics_parts_box'));
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
		        model.setAttribute('partvalue',$('webtronics_part_id').value+" "+$('webtronics_part_value').value);
		        webtronics.circuit.createvalue(webtronics.circuit.selected[0]);
			    model.setAttribute("spice",$("webtronics_model_text").value);
		        
		    });

		    if($('webtronics_properties_cancel'))Event.observe($('webtronics_properties_cancel'), 'click', function() {
			    $('webtronics_properties_form').hide();
			    webtronics.enablepage();
            });

		    if($('webtronics_part_model'))Event.observe($('webtronics_part_model'),'change',function(){
			    if($('webtronics_part_model').value!="none"){
				    if($('webtronics_part_model').value.match(/\.model/i)!=null){
					    $('webtronics_model_text').value=$('webtronics_part_model').value;
				    }
				    $('webtronics_part_value').value=$("webtronics_part_model").options[$("webtronics_part_model").selectedIndex].text;
				
			    }
			    else {
				    $('webtronics_model_text').clear();
				    $('webtronics_part_value').clear();
			    }
		    }
            );

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
			    chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		    });
		    Event.observe($('webtronics_hor_pins'), 'change', function() {
			    chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
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
