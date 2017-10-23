export interface ExtDef {
	type: 'source'|'pecl';
	name: string|string[];
	configure?: string;
	dependencies?: string[];
	libraries?: string[];
	enable?: boolean;
}

const extensions: ExtDef[] = [
	{
		"type": "pecl",
		"name": "xdebug",
		"enable": false,
	},
	{
		"type": "source",
		"name": "gd",
		"configure": "--with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/",
		"dependencies": ["libpng-dev", "libjpeg-turbo-dev", "libwebp-dev", "freetype-dev"],
	},
	{
		"type": "source",
		"name": "mcrypt",
		"dependencies": ["libmcrypt-dev"],
	},
	{
		"type": "source",
		"name": "mysqli",
	},
	{
		"type": "pecl",
		"dependencies": ["libmemcached-dev", "cyrus-sasl-dev"],
		"name": "memcached",
	},
	{
		"type": "source",
		"dependencies": ["icu-dev"],
		"name": "intl",
	},
	{
		"type": "pecl",
		"name": "apcu",
		"dependencies": ["pcre-dev"],
	},
];

export default extensions;
