<?php

    function tempfilesfx($path, $suffix){
      do 
      { 
         $file = $path."/".mt_rand().$suffix; 
      } 
      while(file_exists($file)); 
      return $file; 
    }

    $cmd = file_get_contents('php://input');
	//scan for .control directives
	if(preg_match('/\.control/',$cmd)){
		echo "no control directives allowed";
		return;
	};
    $temp =tempfilesfx('/tmp',".ps");

	    //get plot and tran
    $control=
        ".control\n". 
        "  set hcopydevtype=postscript\n".
        "  set hcopypscolor=true\n".
        "  set color0 = white      ;background\n".
        "  set color1 = black      ;text and grid\n".
        "  set color2 = rgb:f/0/0  ;vector0\n".
        "  set color3 = rgb:0/f/0  ;vector1\n".
        "  set color3 = rgb:0/0/f  ;vector2\n".
        "  op\n";

    preg_match('/\.tran.*\n/',$cmd,$tran);
    $tran=preg_replace('/^\./','',$tran);
    $cmd=preg_replace('/\.tran.*\n/','',$cmd);
    preg_match('/\.plot\s+[^\s]+\s+([^\n]+)/',$cmd,$plot);
    //$cmd=preg_replace('/\.plot.*\n/','',$cmd);
    $hardcopy="  hardcopy ".$temp." ".$plot[1]." \n";
    $control.=$tran[0];
    $control.=$hardcopy;
    $control.=".endc\n";
    $cmd.=$control;
    $cmd=escapeshellarg($cmd);
//    echo $cmd;
    exec("echo $cmd | /usr/bin/ngspice");

    try{
        $image = new Imagick($temp);    
    }
    catch(Exception $e){
        echo "no plot found";
        return;
    }
    $image->setImageFormat("png");
//    $image->setImageFormat("inline");
    header('Content-type: text/plain');
    #header('Content-length: '.strlen($output));
    echo base64_encode ( $image);
    unlink($temp);

     
?>
