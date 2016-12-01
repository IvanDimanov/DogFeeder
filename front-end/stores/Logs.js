'use strict'

import Rest from './Rest'

function getSystemLogs () {
  return Rest.get('http://localhost:3000/api/v1/logs/system')
}

const LogsStore = {
  getSystemLogs
}

export default LogsStore
