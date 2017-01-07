'use strict'

import {action, extendObservable, useStrict} from 'mobx'
import {Observable} from 'rxjs'

import RestStore from './RestStore'

import {toString, getInstance} from '../shared/utils'

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
    ),

    validateName: () => (name) => {
      name = String(name).trim()

      if (name.replace(/[^a-zA-Z]/g, '').length < 3) {
        throw new RangeError('Name must have more than 3 letters')
      }

      return true
    },

    validateSex: () => (sex) => {
      if (!titles[sex]) {
        throw new RangeError(`"${toString(sex)}" is not one of ${toString(Object.keys(titles))}`)
      }

      return true
    },

    validateTitleBySex: () => (sex, title) => {
      const validTitles = titles[sex]

      if (!~validTitles.indexOf(title)) {
        throw new RangeError(`"${toString(title)}" is not one of ${toString(validTitles)}`)
      }

      return true
    },

    setUser: () => (user) => Observable.create((observer) => {
      if (!user ||
          typeof user !== 'object'
      ) {
        observer.error({
          data: {
            errorCode: 'InvalidUser',
            errorMessage: `"user" must be {Object} but same is {${getInstance(user)}} "${toString(user)}"`
          }
        })
        return
      }

      try {
        this.validateName(user.name)
      } catch (error) {
        observer.error({
          data: {
            errorCode: 'InvalidUserName',
            errorMessage: error.message
          }
        })
        return
      }

      try {
        this.validateSex(user.sex)
      } catch (error) {
        observer.error({
          data: {
            errorCode: 'InvalidUserSex',
            errorMessage: error.message
          }
        })
        return
      }

      try {
        this.validateTitleBySex(user.sex, user.title)
      } catch (error) {
        observer.error({
          data: {
            errorCode: 'InvalidUserTitle',
            errorMessage: error.message
          }
        })
        return
      }

      return RestStore
        .post({
          url: '/api/v1/users/mine',
          data: {user}
        })
        .subscribe({
          next: ({data}) => {
            action(() => (this.user = data))()

            observer.next(data)
            observer.complete()
          },

          error: (error) => observer.error(error),
          complete: () => observer.complete()
        })
    }),

    getPasswordStrongLevel (password) {
      password = String(password)

      let level = 0
      const labels = [
        '',
        'Lame',
        'Silly',
        'You can do better',
        'Now we`re talking',
        'That`s good enough',
        'Добре си вече, стига',
        'Ей програмистче малко',
        'Ти сигурен ли си, че ще я запомниш',
        'СУПЕР МАРИО!',
        'Евала - признах тъ',
        'СПАРТААААА!',
        'За кракта ти безкрайни...',
        '... 6! 6! 6!'
      ]

      const styles = [
        {},
        {color: 'green'},
        {color: 'green'},
        {color: 'lime'},
        {color: 'lime'},
        {color: 'yellow'},
        {color: 'yellow'},
        {color: 'orange', fontWeight: 'bold'},
        {color: 'orange', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'}
      ]

      if (password.length > 0) level++
      if (password.length > 5) level++
      if (password.length > 10) level++
      if (password.length > 15) level++
      if (password.length > 20) level++

      if (password.match(/[0-9]/)) level++
      if (password.match(/[a-z]/)) level++
      if (password.match(/[A-Z]/)) level++

      if (password.match(/[!@#$%\^]/)) level++
      if (password.match(/[&\*\(\)_\+\-=]/)) level++
      if (password.match(/[/\\]/)) level++
      if (password.match(/[\[\]\{\}]/)) level++
      if (password.match(/[';|\.,]/)) level++

      return {
        level,
        label: labels[level],
        style: styles[level]
      }
    },

    validatePassword: () => (password) => {
      if (this.getPasswordStrongLevel(password).level < 4) {
        throw new RangeError('Please type a stronger Password')
      }

      return true
    },

    setPassword: () => (password) => Observable.create((observer) => {
      try {
        this.validatePassword(password)
      } catch (error) {
        observer.error({
          data: {
            errorCode: 'InvalidPassword',
            errorMessage: error.message
          }
        })
        return
      }

      return RestStore
        .post({
          url: '/api/v1/users/mine/password',
          data: {password}
        })
        .subscribe({
          next: ({data}) => {
            action(() => (this.user = data))()

            observer.next(data)
            observer.complete()
          },

          error: (error) => observer.error(error),
          complete: () => observer.complete()
        })
    })
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
