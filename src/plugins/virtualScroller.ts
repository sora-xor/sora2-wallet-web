import Vue from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export function install(vue: typeof Vue) {
  vue.component('RecycleScroller', RecycleScroller);
}
