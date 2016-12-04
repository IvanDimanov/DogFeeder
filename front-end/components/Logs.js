/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'

import LogsStore from '../stores/Logs'

import Paper from 'material-ui/Paper'
import Subheader from 'material-ui/Subheader'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import Snackbar from 'material-ui/Snackbar'

import IconButton from 'material-ui/IconButton'
import SyncIcon from 'material-ui/svg-icons/notification/sync'

import sharedStyles from '../shared/styles'

const config = __CONFIG__

const styles = {
  paper: {
    width: 'auto',
    paddingTop: 0,
    marginLeft: 30,
    marginRight: 30
  },

  refreshWrapper: {
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    marginTop: 156
  },

  refresh: {
    position: 'relative',
    display: 'inline-block'
  },

  tableTitle: {
    width: 'initial',
    display: 'inline-block',
    verticalAlign: 'super'
  },

  syncButton: {
    width: 20,
    height: 20
  },

  tableRow: {
    silly: {
      color: '#3c763d',
      backgroundColor: '#dff0d8'
    },

    debug: {
      color: '#3c763d',
      backgroundColor: '#dff0d8'
    },

    info: {
      color: '#31708f',
      backgroundColor: '#d9edf7'
    },

    warn: {
      color: '#8a6d3b',
      backgroundColor: '#fcf8e3'
    },

    warning: {
      color: '#8a6d3b',
      backgroundColor: '#fcf8e3'
    },

    error: {
      color: '#a94442',
      backgroundColor: '#f2dede'
    }
  },

  tableCell: {
    textOverflow: 'initial',
    whiteSpace: 'pre'
  }
}

const subscriptions = []

class Logs extends Component {
  constructor (props) {
    super(props)

    this.state = {
      logs: [],
      isLoading: true,
      errorMessage: ''
    }

    this.sync = this.sync.bind(this)
  }

  sync () {
    this.setState({
      isLoading: true,
      errorMessage: ''
    })

    subscriptions[subscriptions.length] = LogsStore
      .getSystemLogs()
      .subscribe({
        next: ({data}) => this.setState({logs: data}),

        error: () => this.setState({
          isLoading: false,
          errorMessage: 'Unable to load System logs'
        }),

        complete: () => this.setState({isLoading: false})
      })
  }

  componentDidMount () {
    this.sync()
  }

  componentWillUnmount () {
    subscriptions.map((subscription) => subscription.unsubscribe())
  }

  render () {
    const {logs, isLoading, errorMessage} = this.state

    return <div>
      <div style={styles.refreshWrapper}>
        <RefreshIndicator
          size={40}
          left={0}
          top={0}
          status={isLoading ? 'loading' : 'hide'}
          style={styles.refresh}
        />
      </div>

      <Paper style={Object.assign({}, sharedStyles.paper, styles.paper)} zDepth={1}>
        <div style={{textAlign: 'center'}}>
          <Subheader style={styles.tableTitle}>System Logs</Subheader>

          <IconButton
            onTouchTap={this.sync}
            iconStyle={styles.syncButton}
            disabled={isLoading}
          >
            <SyncIcon color={'grey'} />
          </IconButton>
        </div>

        <Table
          fixedHeader
          fixedFooter
          selectable={false}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn style={{width: '8%'}}>mService</TableHeaderColumn>
              <TableHeaderColumn style={{width: '12%'}}>Type</TableHeaderColumn>
              <TableHeaderColumn style={{width: '40%'}}>Message</TableHeaderColumn>
              <TableHeaderColumn style={{width: '20%'}}>Request id</TableHeaderColumn>
              <TableHeaderColumn style={{width: '20%'}}>Created at</TableHeaderColumn>
            </TableRow>
          </TableHeader>

          <TableBody
            displayRowCheckbox={false}
            showRowHover
          >
            {logs.map(({type, message, requestId, serviceName, instanceId, createdAt}, index) => (
              <TableRow key={index} style={styles.tableRow[type]}>
                <TableRowColumn style={Object.assign({width: '8%'}, styles.tableCell)}>{serviceName}: {instanceId}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '12%'}, styles.tableCell)}>{type.toUpperCase()}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '40%'}, styles.tableCell)}>{message}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '20%'}, styles.tableCell)}>{requestId}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '20%'}, styles.tableCell)}>{createdAt}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter
            adjustForCheckbox={false}
          />
        </Table>

        <Snackbar
          open={Boolean(errorMessage)}
          message={errorMessage}
          action={'retry'}
          onActionTouchTap={this.sync}
          autoHideDuration={config['front-end'].successMessageAutoHideDuration}
          onRequestClose={() => this.setState({errorMessage: ''})}
        />
      </Paper>
    </div>
  }
}

export default Logs
