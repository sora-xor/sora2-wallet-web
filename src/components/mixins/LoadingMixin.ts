import { Vue, Component } from 'vue-property-decorator'

import { delay } from '../../util'
import { api } from '../../api'

export const isApiConnected = () => api.api && api.api.isConnected

@Component
export default class LoadingMixin extends Vue {
  loading = false

  async withLoading (func: Function): Promise<any> {
    this.loading = true
    try {
      return await func()
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.loading = false
    }
  }

  /**
   * Function for any request to blockchain.
   * It is guaranteed that api has a connection
   * @param func
   */
  async withApi (func: Function): Promise<any> {
    this.loading = true
    if (!isApiConnected()) {
      await delay()
      return await this.withApi(func)
    } else {
      return await this.withLoading(func)
    }
  }
}
