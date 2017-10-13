/// <reference path="./.jsonenv/_current_result.json.d.ts"/>
import {JsonEnv} from "@gongt/jenv-data";
import {EPlugins, MicroBuildConfig} from "./.micro-build/x/microbuild-config";
import {MicroBuildHelper} from "./.micro-build/x/microbuild-helper";
declare const build: MicroBuildConfig;
declare const helper: MicroBuildHelper;
/*
 +==================================+
 |  **DON'T EDIT ABOVE THIS LINE**  |
 | THIS IS A PLAIN JAVASCRIPT FILE  |
 |   NOT A TYPESCRIPT OR ES6 FILE   |
 |    ES6 FEATURES NOT AVAILABLE    |
 +==================================+
 */

/* Example config file */

const projectName = 'php-fpm';

build.baseImage('php', 'fpm-alpine');
build.projectName(projectName);
build.domainName(projectName + '.' + JsonEnv.baseDomainName);

// build.systemd({
// 	type: 'notify',
// 	watchdog: 10,
// 	startTimeout: 15,
// });

build.isInChina(JsonEnv.gfw.isInChina, JsonEnv.gfw);

build.forwardPort(9000, 'tcp'); // .publish(8080);

build.startupCommand('scripts/start.sh');
build.shellCommand('/bin/sh', '-c');
// build.stopCommand('stop.sh');

build.disablePlugin(EPlugins.jenv);

build.volume('/data', '/host/data');
build.volume('/var/run', '/host/var/run');

const installItems = ['set -e', 'sh scripts/install-prepare.sh'];
const s = JSON.stringify;
for (const {type, name, configure, dependencies} of JsonEnv.php.extensions) {
	if (type === 'source') {
		let deps = '';
		if (dependencies) {
			deps = dependencies.map(s).join(' ');
		}
		installItems.push(`sh scripts/install.sh ${s(name)} ${s(configure || '')} ${s(deps)}`);
	} else if (type === 'pecl') {
		installItems.push(`sh scripts/install.pecl.sh ${s(name)}`);
	} else {
		throw new TypeError('unknown extension type: ' + type);
	}
}

installItems.push('sh scripts/install-finish.sh');

if (installItems.length > 2) {
	build.appendDockerFileContent(`RUN ${installItems.join(' \\\n && ')}`);
}

