<?php
#----------------------------------------------------------------------------
#
#----------------------------------------------------------------------------
#    This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; either version 2 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program; if not, write to the Free Software
#    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
#-------------------------------------------------------------------------------
#    
#-------------------------------------------------------------------------------

require_once( "$IP/includes/GlobalFunctions.php" );


$wgExtensionFunctions[] = "Svgi";

function Svgi(){
        global $wgParser ;
        $wgParser->setHook ( "svge" , 'Svgiframe' ) ;
}

function Svgiframe( $filename, $param, $argv ){
	global $wgScriptPath;
	$filename = (isset($param["src"]))? $param["src"] : "";
        $image = wfFindFile( $filename );
        if(!$image)return "invalid file " .$filename;
	$url=$image->getUrl();
        $width = (isset($param["width"]))? $param["width"] : 200;
        $height = (isset($param["height"]))? $param["height"] : 200;
        $scrolling = (isset($param["scrolling"]))? $param["scrolling"] : "no";
        $style = (isset($param['style'])) ? "style='${param['style']}' " : 'style="border:solid 1px; margin:none;"';
   //     $frameborder = (isset($param['frameborder'])) ? $param['frameborder'] : '0';

        // Attempt to parse the URL
	
        
        $ret = "<img scrolling='$scrolling' src='$url' $style></img >
	<br>
	<a href=$wgScriptPath/index.php/Special:Webtronics?file={$url}>[Edit With Webtronics]</a>
	<br>";
        return $ret ;
}

?>

