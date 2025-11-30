import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
		env: {
			BETTER_AUTH_SECRET: 'test-secret-key-for-testing-only',
			BETTER_AUTH_URL: 'http://localhost:3000',
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
			GOOGLE_CLIENT_ID: 'test-google-client-id',
			GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
			NEXT_PUBLIC_URL: 'http://localhost:3000',
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@shared': path.resolve(__dirname, './src/shared'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@components': path.resolve(__dirname, './src/components'),
		},
	},
})
