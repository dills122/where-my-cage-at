import { defineConfig } from 'cypress';

export default defineConfig({
	video: true,
	videosFolder: 'cypress/videos',
	screenshotsFolder: 'cypress/screenshots',
	fixturesFolder: 'cypress/fixtures',
	e2e: {
		baseUrl: 'http://localhost:4200',
		specPattern: 'cypress/integration/**/*.ts',
		supportFile: 'cypress/support/index.ts',
		setupNodeEvents(_on, config) {
			return config;
		}
	}
});
