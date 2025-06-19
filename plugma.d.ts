// vite-override.d.ts
import 'vite'
import type { UserConfigExport } from 'vite'

declare module 'vite' {
	// Extend the built-in ConfigEnv interface
	interface ConfigEnv {
		context?: 'ui' | 'main'
	}

	// Overload defineConfig to accept a function with the extended ConfigEnv
	function defineConfig(config: (env: ConfigEnv) => UserConfigExport): UserConfigExport
}
