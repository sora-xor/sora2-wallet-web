import * as Popper from '@popperjs/core/dist/esm/index.js';

// Expose the tree-shakable ESM build while preserving the default export shape
// expected by Soramitsu UI components.
const popperWithDefault = { ...Popper };

export * from '@popperjs/core/dist/esm/index.js';
export default popperWithDefault;
