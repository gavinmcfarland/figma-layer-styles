import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './playwright',
	fullyParallel: true,
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 240, height: 360 },
			},
		},
	],
	webServer: {
		command: 'npm run dev -- -ws -p 4000',
		url: 'http://localhost:4000',
		reuseExistingServer: !process.env.CI,
	},
})
