'use strict'

import RestStore from './RestStore'

function getSystemLogs () {
  return RestStore.get('/api/v1/logs/system')
}

const LogsStore = {
  getSystemLogs
}

export default LogsStore
