import {cpus} from "os";
import extensions from "./config";

const nproc = cpus().length;

const configs: string[] = [];
const installs: string[] = [];
const librarys: string[] = [];
const pecls: string[] = [];
const peclEnable: string[] = [];
const sources: string[] = [];

for (const {type, name, configure, dependencies, libraries, enable} of extensions) {
	if (dependencies && dependencies.length) {
		installs.push(...dependencies);
	}
	
	const libDeps = dependencies
		? dependencies.filter(e => e.endsWith('-dev')).map(e => e.replace(/-dev$/, ''))
		: [];
	const libs = [].concat(libDeps, libraries).filter((item, index, self) => {
		return self.indexOf(item) === self.lastIndexOf(item);
	});
	if (libs.length) {
		librarys.push(...libs);
	}
	if (configure) {
		configs.push(`docker-php-ext-configure ${s(name)} ${configure}`);
	}
	
	if (type === 'source') {
		if (Array.isArray(name)) {
			sources.push(...name);
		} else {
			sources.push(name);
		}
	} else if (type === 'pecl') {
		if (Array.isArray(name)) {
			pecls.push(...name);
		} else {
			pecls.push(name);
		}
		if (enable !== false) {
			if (Array.isArray(name)) {
				peclEnable.push(...name);
			} else {
				peclEnable.push(name);
			}
		}
	} else {
		throw new TypeError('unknown extension type: ' + type);
	}
}

const prependCommands: string[] = [
	'set -e', 'update-alpine', 'update-resolve',
];
prependCommands.push(`
cmd_run () {
	echo "RUN $*" | tee -a /tmp/success.log >&2
	"\${@}" 2>&1 >/tmp/error.log || {
		printf '\\033' >&2
		echo 'c' >&2
		cat /tmp/error.log >&2
		echo "=================" >&2
		cat /tmp/success.log >&2
		echo "command failed: $*" >&2
		echo "=================" >&2
		echo "" >&2
		echo "" >&2
		return 1
	}
}
`.trim());

if (pecls.length) {
	installs.push('autoconf', 'g++', 'gcc', 'make');
}

const installPkgs: string[] = [].concat(installs, librarys);

const installCommands = ['apk update'];
if (installPkgs.length) {
	installCommands.push(`apk add ${installPkgs.map(s).join(' ')}`);
}
installCommands.push('docker-php-source extract');

if (pecls.length) {
	installCommands.push(`pecl install ${pecls.map(s).join(' ')}`);
	installCommands.push(`docker-php-ext-enable ${peclEnable.map(s).join(' ')}`);
}

if (configs.length) {
	installCommands.push(...configs);
}
if (sources.length) {
	sources.forEach((e) => {
		installCommands.push(`docker-php-ext-install -j${nproc} ${s(e)}`);
	});
}

if (installs.length) {
	installCommands.push(`apk del --purge ${installs.map(s).join(' ')}`);
}
installCommands.push('docker-php-source delete');
installCommands.push('rm -f /tmp/error.log');
installCommands.push('php-fpm -t');

export default [].concat(prependCommands, installCommands.map(e => `cmd_run ${e}`)).join('\n');

function toArray(s) {
	return s.split(/\n/).map(e => e.trim()).filter(e => e);
}

function s(data) {
	return JSON.stringify(data);
}
