/**
 * You should use it **ONLY** in App.vue
 */
export const lazyComponent = (name: string) => () => import(`@/components/${name}.vue`)
