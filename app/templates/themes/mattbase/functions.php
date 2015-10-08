<?php

require_once locate_template( 'inc/scripts.php' );


function <%= themeDir %>_setup() {
	// REMOVE ADMIN BAR
	show_admin_bar( false );

	// REGISTER PRIMARY MENU
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', '<%= themeDir %>' )
	) );

	// INCLUDE STYLES FOR THE WYSISYG EDITOR
	add_editor_style( 'assets/css/editor-style.css' );

	// LET WORDPRESS MANAGE THE TITLE TAG
	add_theme_support( 'title-tag' );
}
add_action( 'after_setup_theme', '<%= themeDir %>_setup' );


// HELPER FUNCTION TO GET ASSETS
function get_asset($type, $file) {
	return get_template_directory_uri() . '/assets/' . $type . '/' . $file;
}
