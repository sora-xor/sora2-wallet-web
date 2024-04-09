import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class DialogMixin extends Vue {
  @Prop({ type: Boolean, default: false, required: true }) readonly visible!: boolean;

  private nonDialogNodes: Array<HTMLElement & { prevTabindex: string | null }> = [];
  isVisible = false;

  @Watch('visible', { immediate: true })
  handleVisibleChange(value: boolean): void {
    this.isVisible = value;
    if (value) this.saveItemsTabindex();
    else this.restoreItemsTabindex();
  }

  @Watch('isVisible')
  handleIsVisibleChange(value: boolean): void {
    this.$emit('update:visible', value);
  }

  closeDialog(): void {
    this.isVisible = false;
  }

  private saveItemsTabindex(): void {
    const modalNodes = Array.from(document.querySelectorAll('.el-dialog *'));
    // By only finding elements that do not have tabindex="-1" we ensure we don't
    // corrupt the previous state of the element if a modal was already open
    this.nonDialogNodes = Array.from(document.querySelectorAll('body *:not(.el-dialog):not([tabindex="-1"])'));
    for (const node of this.nonDialogNodes) {
      if (!modalNodes.includes(node)) {
        node.prevTabindex = node.getAttribute('tabindex'); // save the previous tabindex state so we can restore it on close
        node.setAttribute('tabindex', '-1');
        node.style.outline = 'none';
      }
    }
  }

  /** Restore or remove tabindex from nodes */
  private restoreItemsTabindex(): void {
    for (const node of this.nonDialogNodes) {
      if (node.prevTabindex) {
        node.setAttribute('tabindex', node.prevTabindex);
        node.prevTabindex = null;
      } else {
        node.removeAttribute('tabindex');
      }
      node.style.outline = '';
    }
    this.nonDialogNodes = [];
  }
}
