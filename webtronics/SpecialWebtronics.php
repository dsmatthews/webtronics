<?php

class SpecialWebtronics extends SpecialPage {
        function __construct() {
                parent::__construct( 'Webtronics' );
                wfLoadExtensionMessages('Webtronics');
        }

	function execute( $par ) {
		global $wgRequest,$wgOut, $wgUser;;

		$this->setHeaders();

		# Check permissions
		if( !$wgUser->isAllowed( 'upload' ) ) {
			$wgOut->permissionRequired( 'upload' );
			return;
		}

		# Show a message if the database is in read-only mode
		if ( wfReadOnly() ) {
			$wgOut->readOnlyPage();
			return;
		}

		# If user is blocked, s/he doesn't need to access this page
		if ( $wgUser->isBlocked() ) {
			$wgOut->blockedPage();
			return;
		}

		$uploadform= new WebtronicsUploadForm($wgRequest);	
		$uploadform->execute();
		$uploadform->cleanupTempFile();

	}
}

class WebtronicsUploadForm extends UploadForm {
	var $svgDestHandle;

	function __construct(&$request){

		$this->mDesiredDestName   = $request->getText( 'wpDestFile' );
		$this->mIgnoreWarning     = $request->getCheck( 'wpIgnoreWarning' );

		$this->mComment           = $request->getText( 'wpUploadDescription' );
		$this->mForReUpload       = $request->getBool( 'wpForReUpload' );
		$this->mReUpload          = $request->getCheck( 'wpReUpload' );
		# Placeholders for text injection by hooks (empty per default)
		$this->uploadFormTextTop = "";
		$this->uploadFormTextAfterSummary = "";
		$this->mUploadClicked     = $request->getCheck( 'wpUpload' );

		$this->mLicense           = $request->getText( 'wpLicense' );
		$this->mCopyrightStatus   = $request->getText( 'wpUploadCopyStatus' );
		$this->mCopyrightSource   = $request->getText( 'wpUploadSource' );
		$this->mWatchthis         = $request->getBool( 'wpWatchthis' );
		$this->mSourceType        = $request->getText( 'wpSourceType' );
		$this->mDestWarningAck    = $request->getText( 'wpDestFileWarningAck' );

		$this->mAction            = $request->getVal( 'action' );

		$this->mSessionKey        = $request->getInt( 'wpSessionKey' );

		if( !empty( $this->mSessionKey ) &&
			isset( $_SESSION['wsUploadData'][$this->mSessionKey]['version'] )) {
			/**
			 * Confirming a temporarily stashed upload.
			 * We don't want path names to be forged, so we keep
			 * them in the session on the server and just give
			 * an opaque key to the user agent.
			 */
			$data = $_SESSION['wsUploadData'][$this->mSessionKey];
			$this->mTempPath         = $data['mTempPath'];
			$this->mFileSize         = $data['mFileSize'];
			$this->mSrcName          = $data['mSrcName'];
			$this->mFileProps        = $data['mFileProps'];
			$this->mCurlError        = 0/*UPLOAD_ERR_OK*/;
			$this->mStashed          = true;
			$this->mRemoveTempFile   = false;

		} else {
			/**
			 *Check for a newly uploaded file.
			 */
			$this->initializeFromSVG( $request );

		}
	}

	function uploadWarning( $warning ) {
		global $wgOut;
		global $wgUseCopyrightUpload;

		$this->mSessionKey = $this->stashSession();
		if( !$this->mSessionKey ) {
			# Couldn't save file; an error has been displayed so let's go.
			return;
		}

		$wgOut->addHTML( '<h2>' . wfMsgHtml( 'uploadwarning' ) . "</h2>\n" );
		$wgOut->addHTML( '<ul class="warning">' . $warning . "</ul>\n" );

//FIXME will return to the page without reloading file
		$titleObj = SpecialPage::getTitleFor( 'Webtronics' );

		if ( $wgUseCopyrightUpload ) {
			$copyright = Xml::hidden( 'wpUploadCopyStatus', $this->mCopyrightStatus ) . "\n" .
					Xml::hidden( 'wpUploadSource', $this->mCopyrightSource ) . "\n";
		} else {
			$copyright = '';
		}

		$wgOut->addHTML(
			Xml::openElement( 'form', array( 'method' => 'post', 'action' => $titleObj->getLocalURL( 'action=submit' ),
				 'enctype' => 'multipart/form-data', 'id' => 'uploadwarning' ) ) . "\n" .
			Xml::hidden( 'wpIgnoreWarning', '1' ) . "\n" .
			Xml::hidden( 'wpSessionKey', $this->mSessionKey ) . "\n" .
			Xml::hidden( 'wpUploadDescription', $this->mComment ) . "\n" .
			Xml::hidden( 'wpLicense', $this->mLicense ) . "\n" .
			Xml::hidden( 'wpDestFile', $this->mDesiredDestName ) . "\n" .
			Xml::hidden( 'wpWatchthis', $this->mWatchthis ) . "\n" .
			"{$copyright}<br />" .
			Xml::submitButton( wfMsg( 'ignorewarning' ), array ( 'name' => 'wpUpload', 'id' => 'wpUpload', 'checked' => 'checked' ) ) . ' ' .
			Xml::submitButton( wfMsg( 'reuploaddesc' ), array ( 'name' => 'wpReUpload', 'id' => 'wpReUpload' ) ) .
			Xml::closeElement( 'form' ) . "\n"
		);

	}

	function initializeFromSVG($request){

		global $wgTmpDirectory,$wgUser, $wgOut,$wgMaxUploadSize;

		$svg = $request->getText( 'wpUploadSVG' );
		$local_file = tempnam( $wgTmpDirectory, 'SVGUPLOAD' ).'.svg';

		$this->mTempPath       = $local_file;
		$this->mFileSize       = 0; # Will be set by curlCopy
		$this->mCurlError      = 0;
		$this->mFileSize 	+=strlen( $svg );

		$this->mSrcName        = $this->mDesiredDestName;
		$this->mSessionKey     = false;
		$this->mStashed        = false;

		$this->svgDestHandle = @fopen( $local_file, "wb" );
		if( $this->svgDestHandle === false ) {
			# Could not open temporary file to write in
			$wgOut->showErrorPage( 'upload-file-error', 'upload-file-error-text');
			return ;
		}
		
		if(fwrite($this->svgDestHandle,$svg)===false){
			$wgOut->showErrorPage( 'upload-file-error', 'upload-file-error-text');		
			return;
		};
		fclose( $this->svgDestHandle );
		// PHP won't auto-cleanup the file
		$this->mRemoveTempFile = file_exists( $local_file );
	}




	function mainUploadForm( $msg='' ) {
	global $wgScriptPath,$wgOut;	

		if ( '' != $msg ) {
			$sub = wfMsgHtml( 'uploaderror' );
			$wgOut->addHTML( "<h2>{$sub}</h2>\n" .
			  "<span class='error'>{$msg}</span>\n" );
		}

	$editorpath=$wgScriptPath.'/extensions/webtronics';

	$htmlout="<div id='webtronics_main_window' >

	<link rel='stylesheet' href='$editorpath/schematic.css' type='text/css' />

	<script type='text/javascript' src='$editorpath/script/prototype.js'></script>
	<script type='text/javascript' src='$editorpath/script/schematic.js'></script>
	<script type='text/javascript' src='$editorpath/script/primatives.js'></script>
	<script type='text/javascript' src='$editorpath/script/connections.js'></script>
	<script type='text/javascript' src='$editorpath/script/chipmaker.js'></script>

	<script type='text/javascript' > var graphPath='$editorpath/graph.jpg';</script>
	<script type='text/javascript' src='$editorpath/script/gui.js'></script>
	

	<!--
	toolbar
	-->
	<div  id='webtronics_toolbar' >
		<img id='webtronics_file_open' title='import file' src='$editorpath/buttons/open.png' />
		<img id='webtronics_new' title ='clear the drawing area' src='$editorpath/buttons/new.png' />
		<img id='webtronics_chips_open' title='make chips' src='$editorpath/buttons/icbut.png' />
		<img id='webtronics_parts_open' title='get parts' src='$editorpath/buttons/disc.png'/>
		<img id='webtronics_zoom'  title='click this to zoom out, select area to zoom in'  src='$editorpath/buttons/zoom.png'/>
		<img id='webtronics_select' title='Select shapes' src='$editorpath/buttons/select.png' />
		<!--img id='webtronics_rotate' title ='select 1 part and click to rotate part' src='$editorpath/buttons/rotate.png' /-->
		<img id='webtronics_wire' title='click to start wire'  src='$editorpath/buttons/wire.png' />
		<img id='webtronics_text' title='add text'  src='$editorpath/buttons/text.png' />
		<img  id='webtronics_delete' title='Delete selected shape' src='$editorpath/buttons/delete.png' />
		<!--img  id='webtronics_save' title='Save the file' src='$editorpath/buttons/save.png' / -->
		<!--img  id='webtronics_netlist' title='Create a netlist' src='$editorpath/buttons/net.png' /-->

		<form id='webtronics_settings'>
			<input type='checkbox' id='webtronics_connections' > show connections </input>
			<input type='checkbox' id='webtronics_graph' > show graph </input>
			<!--<input type='checkbox' id='webtronics_invert' />Invert colors-->
		</form>
	</div>
	<!--
	display area
	-->

	  <div id='webtronics_diagram_area' >
	  </div>

	<!--
	status bar
	-->
	  
	 <div id='webtronics_status_bar'>Mode: Draw Rectangle</div>

	 <!--
	parts box
	-->

	<div id='webtronics_parts_box'>

	<img  id='webtronics_part_ok' src='$editorpath/buttons/ok.png' />
	<img  id='webtronics_part_cancel' src='$editorpath/buttons/cancel.png' />

	<form >

	<select id='webtronics_part' size='10'>

		<option  value='$editorpath/symbols/capacitor.svg' >capacitor</option>
		<option  value='$editorpath/symbols/polar-cap.svg' >polar cap</option>
		<option  value='$editorpath/symbols/varicap.svg' >vari cap</option>
		<option  value='$editorpath/symbols/resistor.svg' >resistor</option>

		<option  value='$editorpath/symbols/vresistor.svg' >variable resistor</option>
		<option  value='$editorpath/symbols/vari-resistor.svg' >potentiometer</option>

		<option  value='$editorpath/symbols/coil.svg' >inductor</option>
		<option  value='$editorpath/symbols/transformer.svg' >transformer</option>
		<option  value='$editorpath/symbols/battery.svg' >battery</option>
		<option  value='$editorpath/symbols/ac.svg' >ac-source</option>
		<option  value='$editorpath/symbols/gnd.svg' >ground</option>
		<option  value='$editorpath/symbols/positive.svg' >positive</option>
		<option  value='$editorpath/symbols/diode.svg' >diode</option>
		<option  value='$editorpath/symbols/led.svg' >led</option>
		<option  value='$editorpath/symbols/zener.svg' >zener diode</option>
		<option  value='$editorpath/symbols/scr.svg' >scr</option>
		<option  value='$editorpath/symbols/triac.svg' >triac</option>
		<option  value='$editorpath/symbols/trigger.svg' >trigger diode</option>

		<option value='$editorpath/symbols/npn.svg'  >npn bjt</option>
		<option value='$editorpath/symbols/pnp.svg' >pnp bjt</option>
		<option  value='$editorpath/symbols/njfet.svg' >njfet </option>
		<option  value='$editorpath/symbols/pjfet.svg' >pjfet</option>
		<option  value='$editorpath/symbols/nmosfet.svg' >nmosfet</option>
		<option  value='$editorpath/symbols/pmosfet.svg' >pmosfet</option>
		<option  value='$editorpath/symbols/ncpb.svg' >ncpb</option>
		<option  value='$editorpath/symbols/nopb.svg' >nopb</option>
		<option  value='$editorpath/symbols/tapcoil.svg' >tapped inductor</option>
		<option  value='$editorpath/symbols/phototrans.svg' >phototransistor</option>
		<option  value='$editorpath/symbols/photodiode.svg' >photodiode</option>
		<option  value='$editorpath/symbols/photo-res.svg' >photo resistor</option>
		<option  value='$editorpath/symbols/crystal.svg' >crystal</option>
		<option  value='$editorpath/symbols/spst-switch.svg' >spst switch</option>
		<option  value='$editorpath/symbols/op-amp.svg' >op-amp</option>
		<option  value='$editorpath/symbols/spst-relay.svg' >spst-relay</option>
		<option  value='$editorpath/symbols/speaker.svg' >speaker</option>


		<option  value='$editorpath/symbols/3_pins.svg' >3 pins</option>
		<option  value='$editorpath/symbols/4_pins.svg' >4 pins</option>
		<option  value='$editorpath/symbols/5_pins.svg' >5 pins</option>


		<option  value='$editorpath/symbols/INVERTER.svg' >NOT</option>
		<option  value='$editorpath/symbols/AND.svg' >AND</option>
		<option  value='$editorpath/symbols/NAND.svg' >NAND</option>
		<option  value='$editorpath/symbols/OR.svg' >OR</option>
		<option  value='$editorpath/symbols/NOR.svg' >NOR</option>
		<option  value='$editorpath/symbols/XOR.svg' >XOR</option>
		<option  value='$editorpath/symbols/XNOR.svg' >XNOR</option>

	</select>
	</form>
	<br>
	<embed   src='$editorpath/symbols/capacitor.svg' id='webtronics_part_display' type='image/svg+xml' width='70' height='70' />	
	<br></div>
	<!--
	open files
	-->
	<div id='webtronics_open_file' >

	<form>
	<input type='file' id='webtronics_open_file_selector' />
	<img  id='webtronics_open_file_cancel' src='$editorpath/buttons/cancel.png' />
	 </form>

	</div>


	<!--
	make chips
	-->

	<div id='webtronics_chips_box'>
	  <div id='webtronics_chip_display' >
	  </div>
		<form>
	<br>
		<select id='webtronics_vert_pins'>
			<option value=1>1</option>
			<option value=2>2</option>
			<option value=3>3</option>
			<option value=4>4</option>
			<option value=5>5</option>
			<option value=6>6</option>
			<option value=7>7</option>
			<option value=8>8</option>
			<option value=9>9</option>
			<option value=10>10</option>
			<option value=11>11</option>
			<option value=12>12</option>
			<option value=13>13</option>
			<option value=14>14</option>
			<option value=15>15</option>
			<option value=16>16</option>
			<option value=17>17</option>
			<option value=18>18</option>
			<option value=19>19</option>
			<option value=20>20</option>
			<option value=21>21</option>
			<option value=22>22</option>
			<option value=23>23</option>
			<option value=24>24</option>
			<option value=25>25</option>
			<option value=26>26</option>
			<option value=27>27</option>
			<option value=28>28</option>
			<option value=29>29</option>
			<option value=30>30</option>
			<option value=31>31</option>
			<option value=32>32</option>
			<option value=33>33</option>
			<option value=34>34</option>
			<option value=35>35</option>
			<option value=36>36</option>
			<option value=37>37</option>
			<option value=38>38</option>
			<option value=39>39</option>
			<option value=40>40</option>
			<option value=41>41</option>
			<option value=42>42</option>
			<option value=43>43</option>
			<option value=44>44</option>
			<option value=45>45</option>
			<option value=46>46</option>
			<option value=47>47</option>
			<option value=48>48</option>
			<option value=49>49</option>
			<option value=50>50</option>
		</select>
		<select id='webtronics_hor_pins' >
			<option value=0>0</option>
			<option value=4>4</option>
			<option value=5>5</option>
			<option value=6>6</option>
			<option value=7>7</option>
			<option value=8>8</option>
			<option value=9>9</option>
			<option value=10>10</option>
			<option value=11>11</option>
			<option value=12>12</option>
			<option value=13>13</option>
			<option value=14>14</option>
			<option value=15>15</option>
			<option value=16>16</option>
			<option value=17>17</option>
			<option value=18>18</option>
			<option value=19>19</option>
			<option value=20>20</option>
			<option value=21>21</option>
			<option value=22>22</option>
			<option value=23>23</option>
			<option value=24>24</option>
			<option value=25>25</option>
			<option value=26>26</option>
			<option value=27>27</option>
			<option value=28>28</option>
			<option value=29>29</option>
			<option value=30>30</option>
			<option value=31>31</option>
			<option value=32>32</option>
			<option value=33>33</option>
			<option value=34>34</option>
			<option value=35>35</option>
			<option value=36>36</option>
			<option value=37>37</option>
			<option value=38>38</option>
			<option value=39>39</option>
			<option value=40>40</option>
			<option value=41>41</option>
			<option value=42>42</option>
			<option value=43>43</option>
			<option value=44>44</option>
			<option value=45>45</option>
			<option value=46>46</option>
			<option value=47>47</option>
			<option value=48>48</option>
			<option value=49>49</option>
			<option value=50>50</option>
		</select>
	<img  id='webtronics_chip_ok' src='$editorpath/buttons/ok.png' />
	<img  id='webtronics_chip_cancel'  src='$editorpath/buttons/cancel.png' />
	 </form>

	</div>

	<!--
	add text
	 -->

	<div id='webtronics_add_text'>
	<form>
	<textarea cols='50' rows='4' id='webtronics_comment'></textarea>
	<!--<input type='text' size='50' name='address' />address</br>-->
	<img  id='webtronics_text_ok' ' src='$editorpath/buttons/ok.png' /> 

	<img  id='webtronics_text_cancel' src='$editorpath/buttons/cancel.png' />
	</form>
	</div>
	<!--
	add code text
	 -->

	<div id='webtronics_open_text' >

	<textarea cols='50' rows='4' id='webtronics_svg_code'></textarea>
	<img  id='webtronics_open_text_ok' src='$editorpath/buttons/ok.png' /> 
	<img  id='webtronics_open_text_cancel' src='$editorpath/buttons/cancel.png' />
	</div>

	<div id='webtronics_textform' >
	<form name='input' action='$wgScriptPath/index.php/Special:Webtronics' method='post'>
	<input type='hidden' name='wpUploadSVG' />
	<input type='textarea' value='' name='wpDestFile' id='wpDestFile' />
	<input type='submit' name='wpUpload' 'value='Submit' onclick='this.form.wpUploadSVG.value=webtronics.getMarkup();' />
	</form>
	</div>

	</div>
	<br>
	<a href=http://alldatasheet.net target=_blank > ALLDATASHEET <a>
	<br>

	";
	$wgOut->addHTML($htmlout);
	

	}
}

 

