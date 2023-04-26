import { loadScript, unloadScript } from 'vue-plugin-load-script';

export class ScriptLoader {
  static async load(src: string, debug = true): Promise<void> {
    try {
      await loadScript(src);
      if (debug) console.info(`[${this.name}] Script loaded: ${src}`);
    } catch (error) {
      if (debug) console.error(error);
    }
  }

  static async unload(src: string, debug = true): Promise<void> {
    try {
      await unloadScript(src);
      if (debug) console.info(`[${this.name}] Script unloaded: ${src}`);
    } catch (error) {
      if (debug) console.error(error);
    }
  }
}
