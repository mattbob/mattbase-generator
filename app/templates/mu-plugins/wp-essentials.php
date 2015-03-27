<?php
/*
Plugin Name: WordPress Essentials
Description: Cleans up the WordPress admin area and provides basic security and spam protection.
Author: Mattbob
Author URI: http://greenishorange.com
Version: 1.0
*/

add_action('after_setup_theme', 'wp_essentials_setup');
function wp_essentials_setup() {
	// REMOVE UNNECESSARY META TAGS
	remove_action('wp_head', 'wp_generator');
	remove_action('wp_head', 'wlwmanifest_link');
	remove_action('wp_head', 'rsd_link');
	remove_action('wp_head', 'rel_canonical');
	remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0);

	// REMOVE WORDPRESS VERSION
	function remove_wp_version($src) {
		if(strpos($src, 'ver='))
			$src = remove_query_arg('ver', $src);
		return $src;
	}
	add_filter('style_loader_src', 'remove_wp_version', 9999);
	add_filter('script_loader_src', 'remove_wp_version', 9999);

	// REMOVE WORDPRESS LOGO FROM ADMIN BAR
	function custom_admin_bar() {
		global $wp_admin_bar;
		$wp_admin_bar->remove_menu('wp-logo');
	}
	add_action('wp_before_admin_bar_render', 'custom_admin_bar' );

	// REMOVE DASHBOARD WIDGETS
	function remove_dashboard_widgets(){
		//remove_meta_box('dashboard_right_now','dashboard','core'); // right now overview box
		remove_meta_box('dashboard_incoming_links', 'dashboard', 'core'); // incoming links box
		remove_meta_box('dashboard_quick_press', 'dashboard', 'core'); // quick press box
		remove_meta_box('dashboard_plugins', 'dashboard', 'core'); // new plugins box
		remove_meta_box('dashboard_recent_drafts', 'dashboard', 'core'); // recent drafts box
		remove_meta_box('dashboard_recent_comments', 'dashboard', 'core'); // recent comments box
		remove_meta_box('dashboard_primary', 'dashboard', 'core'); // wordpress development blog box
		remove_meta_box('dashboard_secondary', 'dashboard', 'core'); // other wordpress news box
	}
	add_action('admin_menu', 'remove_dashboard_widgets');

	// REMOVE COLUMNS FROM PAGES
	function custom_pages_columns($defaults) {
		unset($defaults['comments']); // comments
		return $defaults;
	}
	add_filter('manage_pages_columns', 'custom_pages_columns');

	// REMOVE POST META BOXES
	function remove_post_metaboxes() {
		remove_meta_box('trackbacksdiv', 'post', 'normal');
	}
	add_action('admin_menu','remove_post_metaboxes');

	// REMOVE PAGE META BOXES
	function remove_page_metaboxes() {
		remove_meta_box('commentstatusdiv', 'page', 'normal');
		remove_meta_box('commentsdiv', 'page', 'normal');
	}
	add_action('admin_menu', 'remove_page_metaboxes');

	// REMOVE UNNECESSARY PROFILE FIELDS
	function hide_profile_fields($contactmethods) {
		unset($contactmethods['aim']);
		unset($contactmethods['jabber']);
		unset($contactmethods['yim']);
		return $contactmethods;
	}
	add_filter('user_contactmethods', 'hide_profile_fields', 10, 1);

	// REMOVE COLOR SCHEME OPTION
	function remove_color_scheme() {
		global $_wp_admin_css_colors;
		$_wp_admin_css_colors = 0;
	}
	add_action('admin_head', 'remove_color_scheme');

	// HIDE UPDATES FROM NON-ADMINS
	function essentials_remove_update_nag() {
		if ( !current_user_can('update_options')) {
			remove_action('admin_notices', 'update_nag', 3);
		}
	}
	add_action('admin_menu', 'essentials_remove_update_nag');

	// DISABLE SELF-TRACKBACKING
	function disable_self_pings($links) {
		foreach ($links as $l => $link)
			if (0 === strpos($link, home_url()))
				unset($links[$l]);
	}
	add_action('pre_ping', 'disable_self_pings');

	// DELETE HELLO DOLLY PLUGIN
	function goodbye_dolly() {
		if (is_admin() && file_exists(WP_PLUGIN_DIR.'/hello.php'))
		@unlink(WP_PLUGIN_DIR.'/hello.php');
	}
	add_action('admin_init', 'goodbye_dolly');

	// POINT ADMIN LOGO TO SITE HOME PAGE
	function custom_login_url() {
		return home_url( '/' );
	}
	add_filter('login_headerurl', 'custom_login_url');

	// CHANGE ADMIN TITLE TO SITE TITLE
	function custom_login_title() {
		return get_option('blogname');
	}
	add_filter('login_headertitle', 'custom_login_title');
}

// SIMPLE ADMIN PROTECTION
if (is_admin()) {
	function essentials_block_admin() {
		// If the user is not an administrator, kill WordPress execution and provide a message
		if (!current_user_can('manage_categories') && $_SERVER['PHP_SELF'] != '/wp-admin/admin-ajax.php') {
			wp_die(__('You are not allowed to access this part of the site'));
		}
	}
	add_action('admin_init', 'essentials_block_admin', 1);
}

// HIDE THEME EDITOR
if(!defined('DISALLOW_FILE_EDIT')) {
	define('DISALLOW_FILE_EDIT', 'true');
}

// PROTECT AGAINST MALICIOUS URL REQUESTS
global $user_ID; if($user_ID) {
	if(!current_user_can('administrator')) {
		if (strlen($_SERVER['REQUEST_URI']) > 255 ||
			stripos($_SERVER['REQUEST_URI'], "eval(") ||
			stripos($_SERVER['REQUEST_URI'], "CONCAT") ||
			stripos($_SERVER['REQUEST_URI'], "UNION+SELECT") ||
			stripos($_SERVER['REQUEST_URI'], "base64")) {
				@header("HTTP/1.1 414 Request-URI Too Long");
				@header("Status: 414 Request-URI Too Long");
				@header("Connection: Close");
				@exit;
		}
	}
}

// REDUCE SPAM BY BANNING EMPTY REFERRERS
function verify_comment_referrer() {
	if (!wp_get_referer()) {
		wp_die(__('You cannot post a comment at this time. Maybe you need to enable referrers in your browser.'));
	}
}
add_action('check_comment_flood', 'verify_comment_referrer');