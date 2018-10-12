PACKAGE_DIR=test/fixtures/package

pack_stack:
	@ mkdir -p target tmp \
		&& cp -R pack/* tmp \
		&& cp -R package.json bin lib tmp/lifecycle \
		&& cd tmp/lifecycle \
		&& tnpm install --production \
		&& ../../node_modules/.bin/node-prune \
		&& cd ../.. \
		&& tar -zcvf target/node.tgz -C ./tmp . \
		&& rm -rf tmp

pack_egg:
	@ mkdir -p target \
		&& ali-egg-init --package egg-boilerplate-alipay-tiny egg \
		&& cd egg \
		&& tnpm install --production \
		&& tar -zcvf ../target/egg.tgz . \
		&& cd .. \
		&& rm -rf egg

pack_egg_install:
	@ mkdir -p target \
		&& ali-egg-init --package egg-boilerplate-alipay-tiny egg \
		&& echo "install:\n  enable: true\n  cache: true" > egg/.nodestack \
		&& sed -i '' 's/enable:\ true/enable:\ false/g' egg/config/plugin.js \
		&& tar -zcvf target/egg-install.tgz -C egg . \
		&& rm -rf egg

pack_egg_nginx:
	@ mkdir -p target \
		&& ali-egg-init --package egg-boilerplate-alipay-tiny egg \
		&& cp -R test/fixtures/package/nginx/{conf,.nodestack} egg/ \
		&& sed -i '' 's/enable:\ true/enable:\ false/g' egg/config/plugin.js \
		&& tar -zcvf target/egg-nginx.tgz -C egg . \
		&& rm -rf egg

pack_all: pack_stack pack_egg pack_egg_install pack_egg_nginx

test_tgz:
	@ tar zcvf ${PACKAGE_DIR}/nginx.tgz -C ${PACKAGE_DIR}/nginx .
	@ tar zcvf ${PACKAGE_DIR}/install.tgz -C ${PACKAGE_DIR}/install .
	@ tar zcvf ${PACKAGE_DIR}/install-cache.tgz -C ${PACKAGE_DIR}/install-cache .
	@ tar zcvf ${PACKAGE_DIR}/install-node-modules.tgz -C ${PACKAGE_DIR}/install-node-modules .
	@ tar zcvf ${PACKAGE_DIR}/nodeserver.tgz -C ${PACKAGE_DIR}/nodeserver .
	@ tar zcvf ${PACKAGE_DIR}/nodeserver-error.tgz -C ${PACKAGE_DIR}/nodeserver-error .
