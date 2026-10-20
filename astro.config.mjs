import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lab.xiaozhan.info',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
