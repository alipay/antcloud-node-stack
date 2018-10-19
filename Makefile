PACKAGE_DIR=test/fixtures/package

pack_stack:
	@ mkdir -p target tmp \
		&& cp -R pack/* tmp \
		&& cp -R package.json bin lib tmp/lifecycle \
		&& pushd tmp/lifecycle \
		&& npm update --registry=https://registry.npm.taobao.org --production --no-package-lock \
		&& ../../node_modules/.bin/node-prune \
		&& popd \
		&& tar -zcvf target/node.tgz -C ./tmp . \
		&& rm -rf tmp

pack_example:
	@ mkdir -p target \
	  && pushd example/egg \
		&& npm update --registry=https://registry.npm.taobao.org --production --no-package-lock \
		&& popd \
		&& tar -zcvf target/egg.tgz -C example/egg .
	@ mkdir -p target \
	  && pushd example/koa \
		&& npm update --registry=https://registry.npm.taobao.org --production --no-package-lock \
		&& popd \
		&& tar -zcvf target/koa.tgz -C example/koa .

pack: pack_stack pack_example

test_tgz:
	@ tar zcvf ${PACKAGE_DIR}/nginx.tgz -C ${PACKAGE_DIR}/nginx .
	@ tar zcvf ${PACKAGE_DIR}/install.tgz -C ${PACKAGE_DIR}/install .
	@ tar zcvf ${PACKAGE_DIR}/install-cache.tgz -C ${PACKAGE_DIR}/install-cache .
	@ tar zcvf ${PACKAGE_DIR}/install-node-modules.tgz -C ${PACKAGE_DIR}/install-node-modules .
	@ tar zcvf ${PACKAGE_DIR}/nodeserver.tgz -C ${PACKAGE_DIR}/nodeserver .
	@ tar zcvf ${PACKAGE_DIR}/nodeserver-error.tgz -C ${PACKAGE_DIR}/nodeserver-error .
