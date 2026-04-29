.PHONY: help
help: makefile
	@tail -n +4 makefile | grep ".PHONY"


node_modules: package.json package-lock.json
	if test ! -d $@; then npm install --force; fi


.PHONY: typecheck
typecheck: node_modules
	npx tsc --noEmit


.PHONY: build
build: node_modules
	npx tsc


.PHONY: testCore
testCore: node_modules
	npx tsx tests/core.ts


.PHONY: testCli
testCli: build
	npx tsx tests/cli.ts


.PHONY: test
test: typecheck testCore testCli
