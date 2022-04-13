import Vue from 'vue';
import Maska from 'maska';
import Fragment from 'vue-fragment';

export function install(vue: typeof Vue) {
  vue.use(Maska);
  vue.use(Fragment.Plugin);
}
