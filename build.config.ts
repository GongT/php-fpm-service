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
build.systemInstall('git', 'diffutils', 'imagemagick');

build.noDataCopy();
build.forceLocalDns();

// build.systemd({
// 	type: 'notify',
// 	watchdog: 10,
// 	startTimeout: 15,
// });

build.isInChina(JsonEnv.gfw.isInChina, JsonEnv.gfw);

build.forwardPort(9000, 'tcp'); // .publish(8080);

build.startupCommand('start.sh');
build.shellCommand('/bin/sh', '-c');
// build.stopCommand('stop.sh');

build.disablePlugin(EPlugins.jenv);

build.volume('/data', '/host/data');
build.volume('/var/run', '/host/var/run');

const extra = require(__dirname + '/build/create.js').default;
if (extra) {
	helper.createTextFile(extra).save('.micro-build/php-install-all.sh');
	build.appendDockerFileContent(`COPY .micro-build/php-install-all.sh /
RUN sh /php-install-all.sh`);
}

// build.appendDockerFileContent(`COPY scripts /data/scripts`);
build.appendDockerFileContent(`COPY config /data/config`);
build.appendDockerFileContent(`COPY scripts /data/scripts`);
build.appendDockerFileContent(`
RUN ln -s /data/config/php.ini /usr/local/etc/php/php.ini \\
 && sed -i s/www-data/root/g /usr/local/etc/php-fpm.d/www.conf`);
