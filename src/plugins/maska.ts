import Vue from 'vue';
import Maska from 'maska';

export function install(vue: typeof Vue) {
  vue.use(Maska);
}
