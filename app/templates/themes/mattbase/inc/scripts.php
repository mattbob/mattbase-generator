<?php

// MAIN STYLESHEETS AND SCRIPTS
function <%= themeDir %>_scripts() {
	wp_enqueue_style( 'style', get_asset( 'css', 'style.min.css' ) );

	if ( !is_admin() ) {
		wp_deregister_script( 'jquery' );
		wp_register_script( 'jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js' );
		wp_enqueue_script( 'jquery' );
	}
}
add_action( 'wp_enqueue_scripts', '<%= themeDir %>_scripts', 100 );


// JQUERY FALLBACK
function <%= themeDir %>_jquery_fallback() {
	echo '<script>window.jQuery || document.write(\'<script src="' . get_asset( 'js', 'jquery.min.js' ) . '"><\/script>\')</script>' . "\n";
}
add_action( 'wp_head', '<%= themeDir %>_jquery_fallback', 10 );


// IE SUPPORT
function <%= themeDir %>_ie_support() {
	echo '<!--[if lt IE 9]>'. "\n";
	echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>'. "\n";
	echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.min.js"></script>'. "\n";
	echo '<![endif]-->'. "\n";
}
add_action( 'wp_head', '<%= themeDir %>_ie_support', 10 );