/* eslint-disable vue/one-component-per-file */

import { mount, shallowMount } from '@vue/test-utils';
import { vi } from 'vitest';
import { computed, defineComponent, h, inject, provide } from 'vue';
import Vuex from 'vuex';

import i18n from '../../src/lang';
import installWalletPlugins from '../../src/plugins';

import type { MountingOptions } from '@vue/test-utils';
import type { App, Component, Directive, Plugin, Ref } from 'vue';
import type { Store } from 'vuex';

const buttonDirective: Directive = {
  mounted(el, binding) {
    if (binding.value === false) return;
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  },
};

const loadingDirective: Directive = {
  mounted(el, binding) {
    if (binding.value) {
      el.setAttribute('data-loading', 'true');
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.setAttribute('data-loading', 'true');
    } else {
      el.removeAttribute('data-loading');
    }
  },
};

const ElPopoverStub = defineComponent({
  name: 'ElPopover',
  props: {
    popperClass: { type: String, default: '' },
    trigger: { type: String, default: 'hover' },
    placement: { type: String, default: 'top' },
    visibleArrow: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const classes = ['el-popover-stub'];
    if (props.popperClass) classes.push(props.popperClass);

    return () =>
      h(
        'div',
        {
          class: classes,
          'data-trigger': props.trigger,
          'data-placement': props.placement,
          'data-visible-arrow': props.visibleArrow,
          ...attrs,
        },
        [
          slots.reference ? h('div', { class: 'el-popover-stub__reference' }, slots.reference()) : null,
          slots.default ? h('div', { class: 'el-popover-stub__content' }, slots.default()) : null,
        ].filter(Boolean)
      );
  },
});

const SIconStub = defineComponent({
  name: 'SIcon',
  props: {
    name: { type: String, default: '' },
    size: { type: [String, Number], default: undefined },
  },
  setup(props, { slots, attrs }) {
    const style = props.size
      ? {
          fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
        }
      : undefined;

    return () =>
      h(
        'span',
        {
          class: 's-icon-stub',
          'data-icon': props.name,
          style,
          ...attrs,
        },
        slots.default?.()
      );
  },
});

const SCardStub = defineComponent({
  name: 'SCard',
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: 's-card-stub',
          ...attrs,
        },
        [slots.header ? h('div', { class: 's-card-stub__header' }, slots.header()) : null, slots.default?.()].filter(
          Boolean
        )
      );
  },
});

const SDividerStub = defineComponent({
  name: 'SDivider',
  setup(_props, { attrs }) {
    return () => h('hr', { class: 's-divider-stub', ...attrs });
  },
});

const scrollbarProps = {
  move: { type: Number, default: 0 },
  scrollHeight: { type: Number, default: 0 },
  size: { type: [Number, String], default: 0 },
};

const SScrollbarStub = defineComponent({
  name: 'SScrollbar',
  props: scrollbarProps,
  emits: ['change'],
  setup(_props, { slots, attrs }) {
    const { scrollHeight: _ignored, ...restAttrs } = attrs;
    return () => h('s-scrollbar-stub', { class: 's-scrollbar-stub', ...restAttrs }, slots.default?.());
  },
});

const ScrollbarStub = defineComponent({
  name: 'UnitTestScrollbar',
  props: scrollbarProps,
  emits: ['change'],
  setup(_props, { slots, attrs }) {
    const { scrollHeight: _ignored, ...restAttrs } = attrs;
    return () => h('scrollbar-stub', { class: 'scrollbar-stub', ...restAttrs }, slots.default?.());
  },
});

const STabsStub = defineComponent({
  name: 'STabs',
  props: {
    value: { type: [String, Number], default: undefined },
  },
  emits: ['input'],
  setup(props, { slots, attrs, emit }) {
    const onSelect = (val: unknown) => emit('input', val);
    return () =>
      h(
        'div',
        {
          class: 's-tabs-stub',
          'data-value': props.value,
          ...attrs,
        },
        slots.default?.({ value: props.value, onSelect }) ?? slots.default?.()
      );
  },
});

const STabStub = defineComponent({
  name: 'STab',
  props: {
    label: { type: String, default: '' },
    name: { type: [String, Number], default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: 's-tab-stub',
          'data-name': props.name,
          ...attrs,
        },
        slots.default?.() ?? props.label
      );
  },
});

const createInputStub = (componentName: string) =>
  defineComponent({
    name: componentName,
    props: {
      modelValue: { type: [String, Number], default: undefined },
      value: { type: [String, Number], default: undefined },
      readonly: { type: Boolean, default: false },
      placeholder: { type: String, default: '' },
      type: { type: String, default: 'text' },
      disabled: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'input', 'change'],
    setup(props, { emit, attrs }) {
      const normalizedAttrs = attrs as Record<string, unknown>;
      const { value: attrValue, modelvalue: attrModelValue, ...restAttrs } = normalizedAttrs;
      const onInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        emit('update:modelValue', target.value);
        emit('input', target.value);
      };

      const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        emit('update:modelValue', target.value);
        emit('change', target.value);
      };
      const baseName = componentName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      const tagName = `${baseName}-stub`;
      const resolvedValue = (props.modelValue ?? props.value ?? attrValue ?? attrModelValue ?? '') as string | number;

      return () =>
        h(tagName, {
          class: tagName,
          value: resolvedValue,
          placeholder: props.placeholder,
          type: props.type,
          readonly: props.readonly,
          disabled: props.disabled,
          onInput,
          onChange,
          ...restAttrs,
        });
    },
  });

const SInputStub = createInputStub('SInput');
const SFloatInputStub = createInputStub('SFloatInput');

const dropdownItemStub = defineComponent({
  name: 'SDropdownItem',
  props: { value: { type: [String, Number], default: undefined } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: 's-dropdown-item-stub',
          'data-value': props.value,
          ...attrs,
        },
        slots.default?.()
      );
  },
});

const SOptionStub = defineComponent({
  name: 'SOption',
  props: {
    label: { type: String, default: '' },
    value: { type: [String, Number, Object], default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        's-option-stub',
        {
          class: 's-option-stub',
          'data-label': props.label,
          'data-value': props.value as any,
          ...attrs,
        },
        slots.default?.() ?? props.label
      );
  },
});

const SDropdownStub = defineComponent({
  name: 'SDropdown',
  props: {
    borderRadius: { type: String, default: '' },
    type: { type: String, default: '' },
    icon: { type: String, default: '' },
    placement: { type: String, default: 'bottom' },
  },
  emits: ['select'],
  setup(_props, { slots, emit, attrs }) {
    const select = (value?: unknown) => emit('select', value);

    return () =>
      h(
        's-dropdown-stub',
        {
          class: 's-dropdown-stub',
          ...attrs,
        },
        [...(slots.default?.({ select }) ?? slots.default?.() ?? []), ...(slots.menu?.() ?? [])]
      );
  },
});

const radioGroupKey = Symbol('SRadioGroupStub');

const SRadioGroupStub = defineComponent({
  name: 'SRadioGroup',
  props: { modelValue: { type: [String, Number], default: undefined }, radioSelector: { type: String, default: '' } },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, emit, attrs }) {
    provide(radioGroupKey, {
      value: computed(() => props.modelValue),
      change: (val: unknown) => {
        emit('update:modelValue', val);
        emit('change', val);
      },
    });

    return () => h('div', { class: 's-radio-group-stub', ...attrs }, slots.default?.());
  },
});

const SRadioStub = defineComponent({
  name: 'SRadio',
  props: { label: { type: [String, Number], default: undefined }, size: { type: String, default: 'medium' } },
  setup(props, { slots, attrs }) {
    const group = inject<{ value: Ref<unknown>; change: (val: unknown) => void } | null>(radioGroupKey, null);
    const checked = computed(() => group?.value.value === props.label);

    const onChange = () => {
      group?.change(props.label);
    };

    return () =>
      h(
        'label',
        {
          class: 's-radio-stub',
          'data-label': props.label,
          ...attrs,
        },
        [
          h('input', { type: 'radio', checked: checked.value, onChange }),
          slots.default?.() ?? String(props.label ?? ''),
        ]
      );
  },
});

const SSwitchStub = defineComponent({
  name: 'SSwitch',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, emit, attrs }) {
    const toggle = () => {
      if (props.disabled) return;
      const next = !props.modelValue;
      emit('update:modelValue', next);
      emit('change', next);
    };

    return () =>
      h(
        'button',
        {
          type: 'button',
          class: 's-switch-stub',
          'aria-pressed': props.modelValue ? 'true' : 'false',
          disabled: props.disabled,
          onClick: toggle,
          ...attrs,
        },
        slots.default?.() ?? props.label
      );
  },
});

const DraggableStub = defineComponent({
  name: 'UnitTestDraggable',
  props: {
    modelValue: { type: Array, default: () => [] },
    itemKey: { type: [String, Function], default: undefined },
    tag: { type: String, default: 'div' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'draggable-stub',
        {
          class: 'draggable-stub',
          'data-item-key': props.itemKey as any,
          ...attrs,
        },
        slots.default?.() ?? []
      );
  },
});

const registerComponentIfMissing = (app: App, name: string, component: Component) => {
  if (!app.component(name)) {
    app.component(name, component);
  }
};

const walletUiPlugin: Plugin = {
  install(app: App) {
    installWalletPlugins(app);
    if (!app.directive('button')) app.directive('button', buttonDirective);
    if (!app.directive('loading')) app.directive('loading', loadingDirective);
    registerComponentIfMissing(app, 'ElPopover', ElPopoverStub);
    registerComponentIfMissing(app, 's-icon', SIconStub);
    registerComponentIfMissing(app, 's-card', SCardStub);
    registerComponentIfMissing(app, 's-divider', SDividerStub);
    registerComponentIfMissing(app, 's-scrollbar', SScrollbarStub);
    registerComponentIfMissing(app, 'Scrollbar', ScrollbarStub);
    registerComponentIfMissing(app, 's-tabs', STabsStub);
    registerComponentIfMissing(app, 's-tab', STabStub);
    registerComponentIfMissing(app, 's-input', SInputStub);
    registerComponentIfMissing(app, 's-float-input', SFloatInputStub);
    registerComponentIfMissing(app, 's-dropdown', SDropdownStub);
    registerComponentIfMissing(app, 's-dropdown-item', dropdownItemStub);
    registerComponentIfMissing(app, 's-option', SOptionStub);
    registerComponentIfMissing(app, 's-radio-group', SRadioGroupStub);
    registerComponentIfMissing(app, 's-radio', SRadioStub);
    registerComponentIfMissing(app, 's-switch', SSwitchStub);
    registerComponentIfMissing(app, 'draggable', DraggableStub);
  },
};

type PluginOption = Plugin | [Plugin, ...any[]];

const basePlugins: PluginOption[] = [walletUiPlugin, i18n as unknown as Plugin];

const defaultComponentStubs: Record<string, Component> = {
  'el-popover': ElPopoverStub,
  's-icon': SIconStub,
  's-card': SCardStub,
  's-divider': SDividerStub,
  's-scrollbar': SScrollbarStub,
  scrollbar: ScrollbarStub,
  's-tabs': STabsStub,
  's-tab': STabStub,
  's-input': SInputStub,
  's-float-input': SFloatInputStub,
  's-dropdown': SDropdownStub,
  's-dropdown-item': dropdownItemStub,
  's-option': SOptionStub,
  's-radio-group': SRadioGroupStub,
  's-radio': SRadioStub,
  's-switch': SSwitchStub,
  draggable: DraggableStub,
};

const createDefaultWalletModules = () => ({
  account: {
    namespaced: true,
    state: () => ({
      account: null,
      assets: [],
      accountAssets: [],
      whitelist: {},
      pinnedAssetAddresses: [] as string[],
    }),
    getters: {
      account: (state: any) => state.account,
      assets: (state: any) => state.assets,
      accountAssets: (state: any) => state.accountAssets,
      whitelist: (state: any) => state.whitelist,
      isAssetPinned: (state: any) => (asset: { address?: string } | undefined) => {
        if (!asset?.address) return false;
        return state.pinnedAssetAddresses.includes(asset.address);
      },
    },
    mutations: {
      setAccount(state: any, account: unknown) {
        state.account = account;
      },
      setAccountAssets(state: any, assets: unknown[]) {
        state.accountAssets = Array.isArray(assets) ? assets : [];
      },
      setPinnedAsset(state: any, asset: { address?: string }) {
        if (!asset?.address) return;
        if (!state.pinnedAssetAddresses.includes(asset.address)) {
          state.pinnedAssetAddresses.push(asset.address);
        }
      },
      removePinnedAsset(state: any, asset: { address?: string }) {
        if (!asset?.address) return;
        state.pinnedAssetAddresses = state.pinnedAssetAddresses.filter((address: string) => address !== asset.address);
      },
      setMultiplePinnedAssets(state: any, addresses: string[]) {
        state.pinnedAssetAddresses = Array.isArray(addresses) ? [...addresses] : [];
      },
    },
    actions: {
      fetchAssets: vi.fn(),
      fetchAccountAssets: vi.fn(),
    },
  },
  settings: {
    namespaced: true,
    state: () => ({
      shouldBalanceBeHidden: false,
      isWalletLoaded: true,
      permissions: {
        addAssets: true,
        sendAssets: true,
        swapAssets: true,
        showAssetDetails: true,
      },
      filters: {},
    }),
    getters: {
      shouldBalanceBeHidden: (state: any) => state.shouldBalanceBeHidden,
    },
    mutations: {
      setShouldBalanceBeHidden(state: any, value: boolean) {
        state.shouldBalanceBeHidden = value;
      },
      setPermissions(state: any, permissions: Record<string, unknown>) {
        state.permissions = { ...state.permissions, ...(permissions ?? {}) };
      },
      setFilters(state: any, filters: Record<string, unknown>) {
        state.filters = { ...filters };
      },
    },
  },
  transactions: {
    namespaced: true,
    state: () => ({
      history: {},
      externalHistory: {},
      externalHistoryTotal: 0,
      externalHistoryUpdates: {},
      saveExternalHistoryUpdates: false,
      activeTransactions: [] as unknown[],
    }),
    getters: {
      selectedTx: () => null,
    },
    mutations: {
      saveExternalHistoryUpdates(state: any, updates: Record<string, unknown>) {
        state.externalHistoryUpdates = updates ?? {};
      },
      resetExternalHistory(state: any) {
        state.externalHistory = {};
      },
      getHistory: vi.fn(),
      addActiveTx(state: any, tx: unknown) {
        state.activeTransactions.push(tx);
      },
      removeActiveTxs(state: any) {
        state.activeTransactions = [];
      },
    },
    actions: {
      getExternalHistory: vi.fn(),
    },
  },
  router: {
    namespaced: true,
    state: () => ({}),
    mutations: {
      navigate: vi.fn(),
    },
  },
  subscriptions: {
    namespaced: true,
    state: () => ({
      subscriptions: [] as unknown[],
    }),
    actions: {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    },
    mutations: {
      reset: vi.fn(),
    },
  },
});

type WalletModules = ReturnType<typeof createDefaultWalletModules>;
type WalletModuleName = keyof WalletModules;
type WalletModuleDefinition = WalletModules[WalletModuleName];

const mergeModule = (base: WalletModuleDefinition | undefined, override: any): WalletModuleDefinition => {
  if (!base) {
    return {
      namespaced: true,
      ...override,
    } as WalletModuleDefinition;
  }

  const baseGetters = (base as any)?.getters ?? {};
  const overrideGetters = override?.getters ?? {};
  const baseActions = (base as any)?.actions ?? {};
  const overrideActions = override?.actions ?? {};
  const baseMutations = (base as any)?.mutations ?? {};
  const overrideMutations = override?.mutations ?? {};

  return {
    ...base,
    ...override,
    namespaced: override?.namespaced ?? base.namespaced ?? true,
    state: override?.state ?? base.state,
    getters: {
      ...baseGetters,
      ...overrideGetters,
    },
    actions: {
      ...baseActions,
      ...overrideActions,
    },
    mutations: {
      ...baseMutations,
      ...overrideMutations,
    },
  } as WalletModuleDefinition;
};

type BaseMountOptions<T> = MountingOptions<T> & { store?: Store<T>; stubs?: Record<string, any> };

function createGlobalConfig<T>(store: Store<T> | undefined, overrides: MountingOptions<T>['global'] = {}) {
  const plugins: PluginOption[] = [...basePlugins];

  if (store) {
    plugins.push(store as unknown as Plugin);
  }

  if (overrides.plugins) {
    for (const plugin of overrides.plugins as PluginOption[]) {
      plugins.push(plugin);
    }
  }

  const mergedComponents: Record<string, Component> = {
    ...(overrides.components ?? {}),
  };

  const mergedStubs: Record<string, any> = { ...defaultComponentStubs };
  const incomingStubs = overrides.stubs ?? {};

  for (const [name, stubDef] of Object.entries(incomingStubs)) {
    const isComponentLike =
      stubDef &&
      typeof stubDef === 'object' &&
      !Array.isArray(stubDef) &&
      ('__file' in stubDef || '__asyncLoader' in stubDef || 'render' in stubDef || 'setup' in stubDef);

    if (isComponentLike) {
      mergedComponents[name] = stubDef as Component;
      mergedStubs[name] = false;
    } else {
      mergedStubs[name] = stubDef;
    }
  }

  return {
    ...overrides,
    plugins,
    components: mergedComponents,
    stubs: mergedStubs,
  };
}

export const useDescribe = (name: string, _component: Component, fn: () => void) => describe(name, fn);

export const useMount = <T = unknown>(component: Component, options: BaseMountOptions<T> = {}) => {
  const { store, global, propsData, stubs, ...rest } = options as BaseMountOptions<T> & {
    propsData?: Record<string, unknown>;
    stubs?: Record<string, any>;
  };
  const props = {
    ...(rest as any).props,
    ...(propsData ?? {}),
  };

  if (propsData) {
    delete (rest as any).props;
  }

  const mergedGlobal = {
    ...(global ?? {}),
    stubs: {
      ...(global?.stubs ?? {}),
      ...(stubs ?? {}),
    },
  };

  return mount(component, {
    ...rest,
    props,
    global: createGlobalConfig(store, mergedGlobal),
  });
};

export const useShallowMount = <T = unknown>(component: Component, options: BaseMountOptions<T> = {}) => {
  const { store, global, propsData, stubs, ...rest } = options as BaseMountOptions<T> & {
    propsData?: Record<string, unknown>;
    stubs?: Record<string, any>;
  };
  const props = {
    ...(rest as any).props,
    ...(propsData ?? {}),
  };

  if (propsData) {
    delete (rest as any).props;
  }

  const mergedGlobal = {
    ...(global ?? {}),
    stubs: {
      ...(global?.stubs ?? {}),
      ...(stubs ?? {}),
    },
  };

  return shallowMount(component, {
    ...rest,
    props,
    global: createGlobalConfig(store, mergedGlobal),
  });
};

export const useVuex = (submodules = {}) => {
  const defaultModules = createDefaultWalletModules();
  const keys = Object.keys(submodules);
  const normalizedOverrides = {} as Record<string, any>;

  for (const key of keys) {
    normalizedOverrides[key] = {
      namespaced: true,
      ...submodules[key],
    };
  }

  const mergedModules = { ...defaultModules } as Record<string, WalletModuleDefinition>;

  for (const [name, definition] of Object.entries(normalizedOverrides)) {
    mergedModules[name] = mergeModule(defaultModules[name as keyof typeof defaultModules], definition);
  }

  return new Vuex.Store({
    modules: {
      wallet: {
        namespaced: true,
        modules: mergedModules,
      },
    },
  });
};
