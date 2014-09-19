var chalk = require('chalk');

module.exports = {
	wp : [
		'',
		chalk.green('    _____     _   _   _                  '),
		chalk.green('   |     |___| |_| |_| |_ ___ ___ ___    '),
		chalk.green('   | | | | .\'|  _|  _| . | .\'|_ -| -_|   '),
		chalk.green('   |_|_|_|__,|_| |_| |___|__,|___|___|'   ),
		'',
		chalk.bold.green('A Yeoman Generator For WordPress - v0.2.4'),
		''
	].join('\n'),

	go : chalk.green([
		'',
		'                                           __ ',
 		' _____                                    |  |',
		'|  |  |___ ___ ___    _ _ _ ___    ___ ___|  |',
		'|     | -_|  _| -_|  | | | | -_|  | . | . |__|',
		'|__|__|___|_| |___|  |_____|___|  |_  |___|__|',
		'                                  |___|       	',
		''
	].join('\n')),

	wawa : chalk.red([
		'',
		'                                          ',
		' _____                  _____             ',
		'|   __|___ _____ ___   |     |_ _ ___ ___ ',
		'|  |  | .\'|     | -_|  |  |  | | | -_|  _|',
		'|_____|__,|_|_|_|___|  |_____|\_/|___|_|  ',
		'                                          ',
		'          Game over....try again.         ',
		''
	].join('\n'))
};