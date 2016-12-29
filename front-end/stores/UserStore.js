'use strict'

import {action, extendObservable, useStrict} from 'mobx'
import {Observable} from 'rxjs'

import RestStore from './RestStore'

useStrict(true)

function UserStore () {
  const titles = {
    male: [
      'Mr.',
      'Sir',
      'Ing.',
      'Mr.Ing.',
      'Super Mr.Phd.Ing.',
      'Бай онзи',
      'Млад Меринджей'
    ],
    female: [
      'Miss',
      'Madam',
      'Madam Ing.',
      'Принцеса',
      'Нейно Величество',
      'Робиня',
      'Ама най най'
    ]
  }

  extendObservable(this, {
    user: {
      id: '',
      name: '',
      sex: 'male',
      title: titles.male[0],
      role: {
        internalName: '',
        uiName: '',
        permissions: []
      }
    },

    titles,

    getUser: () => () => Observable.create((observer) => RestStore
      .get('/api/v1/users/mine')
      .subscribe({
        next: ({data}) => {
          action(() => (this.user = data))()

          observer.next(data)
          observer.complete()
        },

        error: (error) => observer.error(error),
        complete: () => observer.complete()
      })
    )
  })

  /* Load all user data if we have authenticated user */
  if (RestStore.getAuthorizationHeader()) {
    this
      .getUser()
      .subscribe()
  }
}

export default new UserStore()
export const UserStoreConstructor = UserStore
