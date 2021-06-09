import { DirectiveOptions } from 'vue'

import LottieLoader from '../components/LottieLoader.vue'

const LOADING_CLASS = 'lottie-loader--loading'

export const Loader = {
  inserted: function (el, binding, vnode) {
    if (binding.value.loading) {
      const loaderInstance = new LottieLoader()
      if (binding.value.size) {
        loaderInstance.$props.size = binding.value.size
      }
      loaderInstance.$mount()
      el.classList.add(LOADING_CLASS)
      el.appendChild(loaderInstance.$el)
    }
  },
  update: function (el, binding, vnode) {
    if (!binding.value.loading) {
      el.classList.remove(LOADING_CLASS)
    }
  }
} as DirectiveOptions
