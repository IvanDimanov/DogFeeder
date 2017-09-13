'use strict'

import {action, extendObservable, useStrict} from 'mobx'
import {Observable} from 'rxjs'

import RestStore from './RestStore'

useStrict(true)

function HardwareStore () {
  extendObservable(this, {
    relay: {
      isOn: false,

      set: () => (shouldSetOn = true) => Observable.create((observer) => RestStore
        .post(`/api/v1/hardware/relay/${shouldSetOn ? 'on' : 'off'}`)
        .subscribe({
          next: ({data}) => {
            action(() => (this.relay.isOn = data.isRelayOn))()

            observer.next(data)
            observer.complete()
          },

          error: (error) => observer.error(error),
          complete: () => observer.complete()
        })
      ),

      on: () => () => this.relay.set(true),
      off: () => () => this.relay.set(false),
      toggle: () => () => this.relay.set(!this.relay.isOn)
    }
  })
}

export default new HardwareStore()
export const HardwareStoreConstructor = HardwareStore
