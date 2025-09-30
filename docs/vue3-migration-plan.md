# Vue 3 Migration Plan

This document captures the final Vue 3 migration outcome for `@soramitsu/soraneo-wallet-web`, plus the clean-up items we still monitor as the ecosystem evolves.

> **Status:** Vue 3 support shipped (Core bundle v1.46.0). Vite + Vitest are the default tooling stack and the class-based API remains temporarily via `vue-property-decorator@8` to ease downstream adoption.

## 0. Status Overview

- **Runtime:** Vue 3.5.21 (compat build no longer required).
- **State:** Vuex 4.1.x via `direct-vuex` compatibility helpers; Pinia migration deferred.
- **Tooling:** Vite dev server, Rollup 4.x library build, Vitest + Cypress for tests, `vue-tsc` for template checks.
- **UI kit:** `@soramitsu-ui/ui@2.x` (Vue 3 native) replaces the legacy Vue 2 package.
- **Backward compatibility:** Class components/decorators remain, but composable shims are being added incrementally.

## 1. Dependency Compatibility Audit

### Core runtime & framework (Completed)
- `vue` upgraded from 2.7.14 → **3.5.21**. Class API usage continues through `vue-property-decorator@8` until composable rewrites land.
- `vuex` upgraded from 3.6.2 → **4.1.x**; `direct-vuex` helpers stay in place for decorator consumers. Pinia remains an optional follow-up.
- `vue-i18n` upgraded from 8.x → **9.14.x**.
- `@vue/test-utils` now **2.4.x** and powered by Vitest runners instead of Jest.

### Tooling (Completed)
- Vue CLI dependency tree replaced by **Vite 5** for dev server and Vitest integration.
- Rollup upgraded to **4.x** with Vue 3 compatible plugins; `vue-tsc` added for template type safety.
- Legacy Jest config removed in favour of Vitest snapshots/mocks; Cypress 13+ confirmed against Vue 3 builds.

### UI libraries & components (Completed / Tracking)
- Adopted **`@soramitsu-ui/ui@2.x`** (Vue 3 native) with local stubs updated for Vitest.
- `vue-virtual-scroller@2.0.0-beta.8`, `vuedraggable@4.x`, `maska@2.x`, and `@polkadot/vue-identicon@3.x` verified in production bundle.
- Remaining follow-up: replace class-based mixins with composables to simplify tree-shaking once decorator support is dropped.

### SDKs & services (no breaking Vue coupling)
Packages like `@sora-substrate/sdk`, `@walletconnect/universal-provider`, `dayjs`, `lodash`, etc. are Vue-agnostic—verify latest LTS releases and upgrade as needed during the tooling refresh.

## 2. Architecture Decisions

- **Component API:** The codebase still exports class components/mixins to avoid a breaking major release. New functionality should prefer Composition API helpers under `src/composables/`, and existing mixins are being ported gradually.
- **State management:** Vuex 4 remains the default; Pinia migration remains a backlog item once decorator consumers phase out.
- **Routing:** No router is bundled; host apps continue wiring their own navigation.
- **Tooling:** Vite + Rollup pipeline finalized; Vitest handles unit tests, Cypress stays for e2e.

## 3. Completed Phases & Follow-ups

1. **Tooling & bootstrap** – Done: Vite dev entry, Rollup 4 config, `vue-tsc`, Vitest + Cypress integration.
2. **Core shared pieces** – Partially Done: services/util updated, TypeScript decorators patched for Vue 3; mixins/composables migration still in progress.
3. **Component modules** – Functional on Vue 3 with class decorators. Composable rewrites remain optional backlog to shrink bundle size.
4. **Plugin exports & docs** – Done: plugin installer updated, documentation refreshed for Vue 3 usage.

## 4. Validation & CI

- Vitest + Vue Test Utils 2 configured for Vue 3 SFCs; snapshot baselines regenerated.
- Cypress 13 verified against Vite bundles in CI.
- Node 20+ enforced; CI steps now run `yarn typecheck`, `yarn lint`, `yarn test:unit`, and Rollup build.
- Remaining check: monitor decorator ↔ composable parity before phasing out class API.

## Next Steps
- Gradually migrate frequently used mixins (`TranslationMixin`, `NotificationMixin`, etc.) to composables to unlock tree-shaking and align with Composition API best practices.
- Evaluate Pinia adoption once class decorators are retired; provide codemods for partner apps.
- Track dependency updates for `@soramitsu-ui/ui` and `vue-virtual-scroller` stable releases.

## Recent Updates
- Added `src/composables/` with reusable helpers (`useDialogVisibility`, `useNotification`, `useTranslation`) so new features no longer depend on decorator-based mixins.
- Introduced `useNotificationStore` backed by Pinia and wired the plugin to bootstrap a Pinia instance when the host application does not provide one.
- Refined the shared Sass scrollbar mixin to emit root-level selectors, eliminating Sass "declarations after nested rules" warnings during Vite builds.
