<?php


# Alert the user that this is not a valid entry point to MediaWiki if they try to access the special pages file directly.
if (!defined('MEDIAWIKI')) {
        echo <<<EOT
To install my extension, put the following line in LocalSettings.php:
require_once( "\$IP/extensions/MyExtension/MyExtension.php" );
EOT;
        exit( 1 );
}


 
$wgExtensionCredits['specialpage'][] = array(
        'name' => 'webtronics',
        'author' => 'My name',
        'url' => 'http://www.mediawiki.org/wiki/Extension:MyExtension',
        'description' => 'Default description message',
        'descriptionmsg' => 'myextension-desc',
        'version' => '0.0.0',
);
 
$dir = $IP.'/extensions/webtronics/';
 
$wgAutoloadClasses['SpecialWebtronics'] = $dir . 'SpecialWebtronics.php'; # Location of the SpecialMyExtension class (Tell MediaWiki to load this file)
$wgExtensionMessagesFiles['Webtronics'] = $dir . 'Webtronics.i18n.php'; # Location of a messages file (Tell MediaWiki to load this file)
$wgSpecialPages['Webtronics'] = 'SpecialWebtronics'; # Tell MediaWiki about the new special page and its class name
$wgSpecialPageGroups['Webtronics'] = 'other';
$wgExtensionFunctions[] = "Svge";

function Svge(){
        global $wgParser ;
        $wgParser->setHook ( "svge" , 'Svgeditable' ) ;
}

function Svgeditable( $filename, $param, $argv ){
	global $wgScriptPath;
	global $wgParser;
	$filename = (isset($param["src"]))? $param["src"] : "";

        $image = wfFindFile( $filename);
       if(!$image)return "invalid file " .$filename;
	$image->purgeCache();
 
	$url=$image->getUrl();
//FIXME attempt to reload image
	$ret="<img width=0 height=0 src='$url' /><br>";
	$ret = "<a href=$wgScriptPath/index.php/Special:Webtronics?file=$url >[Edit With Webtronics]</a><br>";
	$ret.= $wgParser->recursiveTagParse("[[File:$filename]]");

        return $ret ;
}
