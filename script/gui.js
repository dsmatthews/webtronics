  var c;

  function schematic() {
	c = new Schematic($('diagram'));
 	setMode('select', 'Selection');    
  }
  
  function setMode(mode, status) {

  var imgs = $('toolbar').getElementsByTagName('img');
    for (var i=0; i<imgs.length; i++) {
      imgs[i].style.backgroundColor = '';
    }
    $(mode).style.backgroundColor = 'grey';
    $('status').innerHTML = 'Mode: '+status;
	if(mode!='select'){
		if(c.selected){
			c.unselect();
		}
	}
	c.mode=mode;

	}



  function getOptionByValue(select, value)
  {
    for (var i=0; i<select.length; i++) {
      if (select.options[i].value == value) {
        return i;
      }
    }
    return -1;
  }

	function setsize(){
	
	var buffer=20;
	var realsize=window.innerHeight	- parseInt($('toolbar').style.height)-parseInt($('status').style.height)-buffer ;
	//	$('diagram').width=window.screen.availWidth-buffer;
	$('diagram').style.height = realsize;
	}

  function showMarkup() {
	var str='<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
	str	+='<!--Created by webtronics 0.1-->';
	str	+=	c.getMarkup();
	var w=window.open("data:image/svg+xml;base64," + Utils.encode64(str) );


}

	function changeimage(Name){
		
		$('partdisplay').src=Name;
		$('partdisplay').hide();
		$('partdisplay').show();
	}
/*this is the main part of what makes everything work*/
	function openfile(Name){
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
	}

	function returnpart(Name){
		var xmlDoc=openfile(Name);
		c.getgroup(xmlDoc.getElementsByTagName('g')[0]);
		$('parts').hide();
		setMode('select','Selection');
	}	

	function docfromtext(txt){
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
	}

	function returnsvg(){
	//alert(Name);
		if(window.FileReader){
		$('openfile_selector').form.reset();
		$('openfile').show();
			$('openfile_selector').onchange=function(){
				var textReader = new FileReader();
				textReader.onloadend=function(){
					
					var xmlDoc=docfromtext(textReader.result);
					c.getfile(xmlDoc.getElementsByTagName('svg')[0]);
				}
			textReader.readAsText($('openfile_selector').files[0]);
			$('openfile').hide();
			}
		}
			/*no file read capability*/
		else {
			$('opentext_ok').onclick=function(){
				var xmlDoc=docfromtext($('svgcode').value);
				c.getfile(xmlDoc.getElementsByTagName('svg')[0]);
				$('opentext').hide();
			}
			$('opentext').show();

		}
		setMode('select','Selection');
	}


	function returnchip(){
	c.getgroup($('chipdisplay').getElementsByTagName('g')[0]);
	$('chips').hide();
	setMode('select','Selection');
	}

