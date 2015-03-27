<?php

function <%= themeDir %>_scripts() {
	wp_enqueue_style( 'style', get_template_directory_uri(). '/assets/css/style.min.css' );

	if ( !is_admin() ) {
		wp_deregister_script( 'jquery' );
		wp_register_script( 'jquery', '//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js' );
		wp_enqueue_script( 'jquery' );
	}
}
add_action( 'wp_enqueue_scripts', '<%= themeDir %>_scripts', 100 );


function <%= themeDir %>_jquery_fallback() {
	echo '<script>window.jQuery || document.write(\'<script src="' . get_template_directory_uri() . '/assets/js/jquery.min.js"><\/script>\')</script>' . "\n";
}
add_action( 'wp_head', '<%= themeDir %>_jquery_fallback' );
