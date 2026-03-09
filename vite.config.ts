import { defineConfig } from 'vite';

const env = (
  globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }
).process?.env ?? {};

const repository = env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isGitHubPagesBuild = env.GITHUB_ACTIONS === 'true' && repository.length > 0;
const isUserSite = repository.toLowerCase().endsWith('.github.io');

export default defineConfig({
  base: isGitHubPagesBuild ? (isUserSite ? '/' : `/${repository}/`) : '/',
  server: {
    host: true,
    port: 5173,
  },
});
