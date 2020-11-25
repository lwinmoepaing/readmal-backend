module.exports = {
  env: {
		commonjs: true,
		node: true,
		es6: true
	},
	extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
		"indent": [
			"error",
			"tab"
		],
		"quotes": [
				"error",
				"single"
		],
		"semi": [
				"error",
				"never"
		],
	},
};
