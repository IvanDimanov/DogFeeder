'use strict'

import {action, extendObservable, useStrict} from 'mobx'
import {Observable} from 'rxjs'

import RestStore from './RestStore'

useStrict(true)

function HardwareStore () {
  extendObservable(this, {
    led: {
      isOn: false,

      set: () => (shouldSetOn = true) => Observable.create((observer) => RestStore
        .post(`/api/v1/hardware/test/led/${shouldSetOn ? 'on' : 'off'}`)
        .subscribe({
          next: ({data}) => {
            action(() => (this.led.isOn = data.isLedOn))()

            observer.next(data)
            observer.complete()
          },

          error: (error) => observer.error(error),
          complete: () => observer.complete()
        })
      ),

      on: () => () => this.led.set(true),
      off: () => () => this.led.set(false),
      toggle: () => () => this.led.set(!this.led.isOn)
    }
  })
}

export default new HardwareStore()
export const HardwareStoreConstructor = HardwareStore
