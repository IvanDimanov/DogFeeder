/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'
import {observer} from 'mobx-react'

import LogsStore from '../stores/LogsStore'

import Paper from 'material-ui/Paper'
import Subheader from 'material-ui/Subheader'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import Snackbar from 'material-ui/Snackbar'

import IconButton from 'material-ui/IconButton'
import SyncIcon from 'material-ui/svg-icons/notification/sync'
import ArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

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
  },

  tableFooter: {
    textAlign: 'right',
    paddingRight: 0,
    color: 'grey'
  },

  arrowButtons: {
    paddingTop: 18
  },

  pageCounter: {
    verticalAlign: 'super',
    padding: '0 18px'
  }
}

const subscriptions = []

const Logs = observer(class Logs extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: false,
      errorMessage: ''
    }

    this.sync = this.sync.bind(this)
  }

  sync (page, maxResultsPerPage) {
    this.setState({
      isLoading: true,
      errorMessage: ''
    })

    subscriptions[subscriptions.length] = LogsStore
      .sync(page, maxResultsPerPage)
      .subscribe({
        error: ({data = {}}) => this.setState({
          isLoading: false,
          errorMessage: data.errorMessage || 'Unable to load System logs'
        }),

        complete: () => this.setState({isLoading: false})
      })
  }

  componentDidMount () {
    this.sync()
  }

  componentWillUnmount () {
    let subscription
    while ((subscription = subscriptions.pop())) subscription.unsubscribe()
  }

  render () {
    const {isLoading, errorMessage} = this.state

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
            onTouchTap={() => this.sync()}
            iconStyle={styles.syncButton}
            disabled={isLoading}
          >
            <SyncIcon color='grey' />
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
              <TableHeaderColumn style={{width: '5%'}}>mService</TableHeaderColumn>
              <TableHeaderColumn style={{width: '5%'}}>Type</TableHeaderColumn>
              <TableHeaderColumn style={{width: '50%'}}>Message</TableHeaderColumn>
              <TableHeaderColumn style={{width: '20%'}}>Request id</TableHeaderColumn>
              <TableHeaderColumn style={{width: '20%'}}>Created at</TableHeaderColumn>
            </TableRow>
          </TableHeader>

          <TableBody
            displayRowCheckbox={false}
            showRowHover
          >
            {LogsStore.logs.map(({type, message, requestId, serviceName, instanceId, createdAt}, index) => (
              <TableRow key={index} style={styles.tableRow[type]}>
                <TableRowColumn style={Object.assign({width: '5%'}, styles.tableCell)}>{serviceName}: {instanceId}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '5%'}, styles.tableCell)}>{type.toUpperCase()}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '50%'}, styles.tableCell)}>{message}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '20%'}, styles.tableCell)}>{requestId}</TableRowColumn>
                <TableRowColumn style={Object.assign({width: '20%'}, styles.tableCell)}>{createdAt}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableRowColumn colSpan='5' style={styles.tableFooter}>

                <span style={styles.pageCounter}>Rows per page:</span>

                <DropDownMenu
                  value={LogsStore.maxResultsPerPage}
                  onChange={(event, index, value) => this.sync(LogsStore.currentPage, value)}
                  disabled={isLoading}
                >
                  {LogsStore.validMaxResultsPerPage.map((maxResultsPerPage, index) => <MenuItem key={index} value={maxResultsPerPage} primaryText={maxResultsPerPage} />)}
                </DropDownMenu>

                <span style={styles.pageCounter}>{LogsStore.firstVisibleResult}-{LogsStore.lastVisibleResult} of {LogsStore.totalResults.toLocaleString()}</span>

                <IconButton
                  style={styles.arrowButtons}
                  onTouchTap={() => this.sync(LogsStore.currentPage - 1)}
                  disabled={LogsStore.currentPage === 1 || isLoading}
                >
                  <ArrowLeft color='grey' />
                </IconButton>

                <IconButton
                  style={styles.arrowButtons}
                  onTouchTap={() => this.sync(LogsStore.currentPage + 1)}
                  disabled={isLoading}
                >
                  <ArrowRight color='grey' />
                </IconButton>
              </TableRowColumn>
            </TableRow>
          </TableFooter>
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
})

export default Logs
