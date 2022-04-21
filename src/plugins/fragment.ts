import Vue from 'vue';
import Fragment from 'vue-fragment';

export function install(vue: typeof Vue) {
  vue.use(Fragment.Plugin);
}
