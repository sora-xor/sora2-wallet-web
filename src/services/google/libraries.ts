import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

/**
 * Load Google Api & Google Identity libraries
 *
 * Promise resolves then libraries are ready for usage
 */
export async function initGoogleAuthLibraries(): Promise<void> {
  try {
    await Promise.all([
      ScriptLoader.load('https://apis.google.com/js/api.js'),
      ScriptLoader.load('https://accounts.google.com/gsi/client'),
      waitForDocumentReady(),
    ]);
  } catch (error) {
    console.error(error);
  }
}
