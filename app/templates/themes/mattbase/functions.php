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
}
add_action( 'after_setup_theme', '<%= themeDir %>_setup' );


// CUSTOM TITLE TAG (REMOVE IF USING AN SEO PLUGIN)
function <%= themeDir %>_page_title( $id ) {
	$title = get_the_title( $id ) . ' | ' . get_bloginfo( 'name' );

	if( is_front_page() )
		$title = get_bloginfo( 'name' ) . ' | ' . get_bloginfo( 'description' );
	}

	return $title;
}
