
var webtronics={
		circuit:null,

		saveserver:function(){
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=webtronics.circuit.getMarkup();
    // Define a boundary, I stole this from IE but you can use any string AFAIK
			var boundary = '-----------------------------' +
							Math.floor(Math.random() * Math.pow(10, 8));
			var xhr = new XMLHttpRequest();
			var body = '--' + boundary + '\r\n'
							 // Parameter name is "file" and local filename is "temp.txt"
							 + 'Content-Disposition: form-data; name="file";'
							 + 'filename="temp.txt"\r\n'
							 // Add the file's mime-type
							 + 'Content-type: image/svg+xml\r\n\r\n'
							 + str + '\r\n'
							 + boundary + '--';

			xhr.open("POST", location, true);
			xhr.setRequestHeader(
					"Content-type", "multipart/form-data; boundary="+boundary

			);
			xhr.onreadystatechange = function ()
			{
					if (xhr.readyState == 4 && xhr.status == 200)
							alert("File uploaded!");
			}
			xhr.send(body);
							
					
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

		setsize:function(){
		
			var buffer=20;
			var realsize=window.innerHeight-$('webtronics_toolbar').offsetHeight-$('webtronics_status_bar').offsetHeight-buffer;
			$('webtronics_diagram_area').style.height = realsize+'px';
		},

		showMarkup:function() {
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=webtronics.circuit.getMarkup();
			var w=window.open("data:image/svg+xml;base64;charset=utf-8," + Utils.encode64(str) );
		},

		setMode:function(button,mode, status){

			var imgs = $('webtronics_toolbar').getElementsByTagName('img');
			for (var i=0; i<imgs.length; i++) {
				imgs[i].style.backgroundColor = '';
			}
			$(button).style.backgroundColor = 'grey';
			$('webtronics_status_bar').innerHTML = 'Mode: '+status;

			if(mode!='select'){
				if(webtronics.circuit.selected){
					webtronics.circuit.unselect();
				}
			}
			webtronics.circuit.mode=mode;

		},

		changeimage:function(Name){
			
			$('webtronics_part_display').src=Name;
			$('webtronics_part_display').hide();
			$('webtronics_part_display').show();
		},

		openfile:function(Name){
			var xmldoc;
			new Ajax.Request(Name,{
			method:'get',
			asynchronous:false,
			contentType:"image/svg+xml",
			onSuccess: function(transport){
				xmldoc=transport.responseXML;
				},
			onFailure: function(){ alert('Something went wrong...'); }
			//, onException: function(x){alert(" Error name: " + x.name  + ". Error message: " + x.message); }
			});
			return xmldoc;
		},

		returnpart:function(Name){
			var xmlDoc=webtronics.openfile(Name);
			webtronics.circuit.getgroup(xmlDoc.getElementsByTagName('g')[0]);
			$('webtronics_parts_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		},	


		returnsvg:function(){
			if(window.FileReader){
			$('webtronics_open_file_selector').form.reset();
			$('webtronics_open_file').show();
				$('webtronics_open_file_selector').onchange=function(){
					var textReader = new FileReader();
					textReader.onloadend=function(){
						
						var xmlDoc=webtronics.docfromtext(textReader.result);
						if(!xmlDoc){alert("error parsing svg");}
						else{
							var node=xmlDoc.getElementsByTagName('svg')[0];
							if(!node){alert("svg node not found")}
							else webtronics.circuit.getfile(node);
						}
					}
				textReader.readAsText($('webtronics_open_file_selector').files[0]);
				$('webtronics_open_file').hide();
				}
			}
			else if(((navigator.userAgent.toLowerCase().indexOf('firefox')>-1)||
				(navigator.userAgent.toLowerCase().indexOf('iceweasel')>-1))	 &&window.FileList){

			$('webtronics_open_file_selector').form.reset();
			$('webtronics_open_file').style.display = "block";
				$('webtronics_open_file_selector').onchange=function(){
					var txt =$('webtronics_open_file_selector').files[0].getAsText('');					
					var xmlDoc=webtronics.docfromtext(txt);
					var node=xmlDoc.getElementsByTagName('svg')[0];
					if(!node){alert("svg node not found");}
					else webtronics.circuit.getfile(node);
					$('webtronics_open_file').hide();
				}
			}

			/*no file read capability*/

			else {
				$('webtronics_open_text_ok').onclick=function(){
					var xmlDoc=webtronics.docfromtext($('webtronics_svg_code').value);
					webtronics.circuit.getfile(xmlDoc.getElementsByTagName('svg')[0]);
					$('webtronics_open_text').hide();
				}
				$('webtronics_open_text').style.display = "block";

			}
			webtronics.setMode('webtronics_select','select','Selection');
		},


		returnchip:function(){
		webtronics.circuit.getgroup($('webtronics_chip_display').getElementsByTagName('g')[0]);
		$('webtronics_chips_box').hide();
		webtronics.setMode('webtronics_select','select','Selection');
		}
	
}; 





	Event.observe(window, 'load', function() {

		var url=window.location.search.toQueryParams();
		var file=url['file'];
		document.oncontextmenu=new Function("return false");
		webtronics.circuit = new Schematic($('webtronics_diagram_area'),file);
	 	webtronics.setMode('webtronics_select','select', 'Selection');    
		webtronics.setsize();
		if(file){
				var xmlDoc=webtronics.openfile(file);
				if(!xmlDoc){alert("file opening error");}
				else{
					var node=xmlDoc.getElementsByTagName('svg')[0]
					if(!node){alert("svg node not found");}
					else	webtronics.circuit.getfile(node);
				}
		}
/*menu events*/
		Event.observe($('webtronics_file_open'), 'click', function() {
			webtronics.setMode('webtronics_file_open','select','Selection');
			webtronics.returnsvg();
			});
		Event.observe($('webtronics_chips_open'), 'click', function() {
//			$('webtronics_chips_box').reset();
			webtronics.setMode('webtronics_chips_open','select','Selection');
			$('webtronics_chips_box').style.display = "block";
			});
		Event.observe($('webtronics_parts_open'), 'click', function() {
			webtronics.setMode('webtronics_parts_open','select','Selection');
			$('webtronics_parts_box').style.display = "block";
			});
		Event.observe($('webtronics_zoom'), 'click', function() {
				//set zoom to 1
				webtronics.circuit.setzoom(false);
				webtronics.setMode('webtronics_zoom','zoom', 'Zoom');
			});
		Event.observe($('webtronics_select'), 'click', function() {
			webtronics.setMode('webtronics_select','select', 'Selection');
			});
		Event.observe($('webtronics_wire'), 'click', function() {
			webtronics.setMode('webtronics_wire','line');
			});
		Event.observe($('webtronics_text'), 'click', function() {
			webtronics.setMode('webtronics_text','select', 'Selection');
			$('webtronics_add_text').style.display = "block";
			});
		Event.observe($('webtronics_delete'), 'click', function() {
			webtronics.circuit.deleteSelection();
			});
		Event.observe($('webtronics_save'), 'click', function() {
		//	webtronics.saveserver();
			webtronics.showMarkup();
			});
/*parts box events*/		
		Event.observe($('webtronics_part'), 'change', function() {
			webtronics.changeimage($('webtronics_part').value);
			});
		Event.observe($('webtronics_part_ok'), 'click', function() {
			webtronics.returnpart($('webtronics_part').value);
			});
		Event.observe($('webtronics_part_cancel'), 'click', function() {
			$('webtronics_parts_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
			});
/*file open events*/
		Event.observe($('webtronics_open_file_cancel'), 'click', function() {
			$('webtronics_open_file').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
/*chip box events*/
		Event.observe($('webtronics_vert_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_hor_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_chip_ok'), 'click', function() {
			webtronics.returnchip();
		});
		Event.observe($('webtronics_chip_cancel'), 'click', function() {
			$('webtronics_chips_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
/*text add events*/
		Event.observe($('webtronics_text_ok'), 'click', function() {
			webtronics.circuit.createtext($('webtronics_comment').value);
			$('webtronics_add_text').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
		Event.observe($('webtronics_text_cancel'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');

			$('webtronics_add_text').hide();
		});
/*text open events*/
		Event.observe($('webtronics_open_text_ok'), 'click', function() {
			$('webtronics_open_text').hide();
		});
		Event.observe($('webtronics_open_text_cancel'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');

			$('webtronics_open_text').hide();
		});



	
});
	Event.observe(window, 'resize', function() {
		webtronics.setsize();
	});
//	window.addEventListener("oncontextmenu",function(){return false},true);

