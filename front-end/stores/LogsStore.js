'use strict'

import {action, extendObservable, useStrict} from 'mobx'
import {Observable} from 'rxjs'

import RestStore from './RestStore'

import {toString, getInstance} from '../shared/utils'

useStrict(true)

function LogsStore () {
  const validMaxResultsPerPage = [5, 10, 20, 30]

  extendObservable(this, {
    logs: [],
    currentPage: 1,
    maxPages: () => Math.ceil(this.totalResults / this.maxResultsPerPage),

    maxResultsPerPage: 10,
    totalResults: 0,

    firstVisibleResult: () => !this.logs.length ? 0 : (this.currentPage - 1) * this.maxResultsPerPage + 1,
    lastVisibleResult: () => !this.logs.length ? 0 : (this.currentPage - 1) * this.maxResultsPerPage + this.logs.length,

    validMaxResultsPerPage,

    sync: () => (currentPage, maxResultsPerPage) => Observable.create((observer) => {
      currentPage = currentPage || this.currentPage
      maxResultsPerPage = maxResultsPerPage || this.maxResultsPerPage

      if (typeof currentPage !== 'number') {
        observer.error({
          data: {
            errorCode: 'InvalidPage',
            errorMessage: `Page must be Number but same is {${getInstance(currentPage)}} "${toString(currentPage)}"`
          }
        })
        return
      }

      if (currentPage % 1) {
        observer.error({
          data: {
            errorCode: 'InvalidPage',
            errorMessage: `Page must be Integer but same is ${toString(currentPage)}`
          }
        })
        return
      }

      if (currentPage < 1) {
        observer.error({
          data: {
            errorCode: 'InvalidPage',
            errorMessage: `Page must be bigger than 0 but same is ${toString(currentPage)}`
          }
        })
        return
      }

      if (!~validMaxResultsPerPage.indexOf(maxResultsPerPage)) {
        observer.error({
          data: {
            errorCode: 'InvalidMaxResultsPerPage',
            errorMessage: `Maximum results per page must be one of ${toString(validMaxResultsPerPage)} but same is {${getInstance(maxResultsPerPage)}} "${maxResultsPerPage}"`
          }
        })
        return
      }

      return RestStore
        .get({
          url: '/api/v1/logs/system',
          data: {
            currentPage,
            maxResultsPerPage
          }
        })
        .subscribe({
          next: ({data}) => {
            action(() => {
              this.logs = data.logs
              this.currentPage = Number(currentPage)
              this.maxResultsPerPage = Number(data.maxResultsPerPage)
              this.totalResults = Number(data.totalResults)
            })()

            observer.next(data)
            observer.complete()
          },

          error: (error) => observer.error(error),
          complete: () => observer.complete()
        })
    }),

    nextPage: () => () => this.sync(this.currentPage + 1),
    prevPage: () => () => this.sync(this.currentPage - 1)
  })
}

export default new LogsStore()
export const LogsStoreConstructor = LogsStore
