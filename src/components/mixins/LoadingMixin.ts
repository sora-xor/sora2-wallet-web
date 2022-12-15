import { Vue, Component, Prop } from 'vue-property-decorator';

import { delay } from '../../util';
import { state } from '../../store/decorators';

@Component
export default class LoadingMixin extends Vue {
  @Prop({ type: Boolean, default: false }) readonly parentLoading!: boolean;

  @state.settings.isWalletLoaded isWalletLoaded!: boolean;

  loading = false;

  async withLoading<T = void>(func: FnWithoutArgs<T> | AsyncFnWithoutArgs<T>): Promise<T> {
    this.loading = true;
    try {
      return await func();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Function for any request to blockchain.
   * It is guaranteed that api has a connection
   * @param func
   */
  async withApi<T = void>(func: FnWithoutArgs<T> | AsyncFnWithoutArgs<T>): Promise<T> {
    this.loading = true;

    if (!this.isWalletLoaded) {
      await delay();
      return await this.withApi(func);
    } else {
      return await this.withLoading(func);
    }
  }

  async withParentLoading<T = void>(func: FnWithoutArgs<T> | AsyncFnWithoutArgs<T>): Promise<T> {
    if (this.parentLoading) {
      await delay();
      return await this.withParentLoading(func);
    } else {
      return await func();
    }
  }
}
