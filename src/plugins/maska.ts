import Maska from 'maska';
import Vue from 'vue';

export function install(vue: typeof Vue) {
  vue.use(Maska);
}
