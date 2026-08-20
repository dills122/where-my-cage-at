const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
	{
		ignores: ['projects/**/*']
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: __dirname
			}
		},
		plugins: {
			'@angular-eslint': angular,
			'@angular-eslint/template': angularTemplate
		},
		processor: angularTemplate.processors['extract-inline-html'],
		rules: {
			...angular.configs.recommended.rules,
			'@angular-eslint/prefer-inject': 'off',
			'@angular-eslint/prefer-standalone': 'off',
			'@angular-eslint/directive-selector': [
				'error',
				{ type: 'attribute', prefix: 'app', style: 'camelCase' }
			],
			'@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }]
		}
	},
	{
		files: ['**/*.html'],
		languageOptions: {
			parser: angularTemplateParser
		},
		plugins: {
			'@angular-eslint/template': angularTemplate
		},
		rules: angularTemplate.configs.recommended.rules
	}
];
