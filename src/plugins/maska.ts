import { vMaska } from 'maska';

import type { App } from 'vue';

export function install(app: App): void {
  app.directive('maska', vMaska);
}
