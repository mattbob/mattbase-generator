# Mattbase Generator

A WordPress generator for [Yeoman](http://yeoman.io).

### What it is?
- Grabs the latest version of WordPress
- Removes the default WordPress themes and plugins
- Installs the [Mattbase Framework](https://github.com/mattbob/mattbase) or a theme from GitHub or a zip file
- Optionally installs a set of plugins
- Initializes and commits all files to a git repo

### Getting Started/Installation
- Make sure you have [yo](https://github.com/yeoman/yo) & [grunt-cli](http://gruntjs.com/getting-started) installed:
    `npm install -g yo grunt-cli`
- Install the generator: `npm install -g generator-mattbase`
- Run: `yo mattbase`

### For Mac Users
- Make sure to run the above commands with `sudo`

### Uninstall
- To remove the generator run: `npm uninstall -g generator-mattbase`

### Changelog
- v1.0.5 - Lets WP handle the title tag; Added get_asset() function; Added IE support function to wp_head
- v1.0.4 - Added custom title tag function to replace wp_title; Added config settings to control drafts and trash
- v1.0.3 - Fixed plugin folder error
- v1.0.2 - Fixed password not being passed to local-config.php; Updates theme dir for Mattbase and GitHub
- v1.0.1 - Updated and added Changelog to readme
- v1.0.0 - Rewrote generator completely; now includes the Mattbase WP Framework by default