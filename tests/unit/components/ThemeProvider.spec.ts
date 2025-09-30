import ThemeProvider from '@/components/ThemeProvider.vue';
import { Theme } from '@/consts';

import { useMount, useVuex } from '../../utils';

describe('ThemeProvider', () => {
  it('applies the theme from the settings getter', () => {
    const store = useVuex({
      settings: {
        state: () => ({
          theme: Theme.Dark,
        }),
        getters: {
          libraryTheme: (state: { theme: Theme }) => state.theme,
        },
      },
    });

    const wrapper = useMount(ThemeProvider, {
      store,
      slots: {
        default: '<div class="slot" />',
      },
    });

    const root = wrapper.get('.sora-theme-provider');

    expect(root.attributes('data-theme')).toBe(Theme.Dark);
  });

  it('falls back to the light theme when the getter returns no value', () => {
    const store = useVuex({
      settings: {
        state: () => ({}),
        getters: {
          libraryTheme: () => undefined,
        },
      },
    });

    const wrapper = useMount(ThemeProvider, {
      store,
      slots: {
        default: '<div class="slot" />',
      },
    });

    const root = wrapper.get('.sora-theme-provider');

    expect(root.attributes('data-theme')).toBe(Theme.Light);
  });
});
