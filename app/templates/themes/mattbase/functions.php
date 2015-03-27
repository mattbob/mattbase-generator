<?php

require_once locate_template( 'inc/scripts.php' );

function <%= themeDir %>_setup() {
	// REMOVE ADMIN BAR
	show_admin_bar(false);

	// REGISTER PRIMARY MENU
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', '<%= themeDir %>' )
	) );

	// INCLUDE STYLES FOR THE WYSISYG EDITOR
	add_editor_style( 'assets/css/editor-style.css' );
}
add_action( 'after_setup_theme', '<%= themeDir %>_setup' );
