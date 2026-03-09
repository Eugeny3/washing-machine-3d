import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true' && repository.length > 0;
const isUserSite = repository.toLowerCase().endsWith('.github.io');

export default defineConfig({
  base: isGitHubPagesBuild ? (isUserSite ? '/' : `/${repository}/`) : '/',
  server: {
    host: true,
    port: 5173,
  },
});
