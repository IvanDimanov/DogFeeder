/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'

import Rest from '../stores/Rest'

import Paper from 'material-ui/Paper'
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
    display: 'inline-block',
    verticalAlign: 'super'
  },

  syncButton: {
    width: 20,
    height: 20
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

    /**
    subscriptions[subscriptions.length] = Rest
      .ajax({
        method: 'GET',
        url: 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Rambo&callback=?',
        dataType: 'json'
      })
      .subscribe({
        next: ({data: [, titles, descriptions, urls]}) => {
          const logs = titles
            .map((title, index) => ({
              title,
              description: descriptions[index],
              url: urls[index]
            }))

          this.setState({logs})
        },

        error: () => this.setState({
          isLoading: false,
          errorMessage: 'Unable to load System logs'
        }),

        complete: () => this.setState({isLoading: false})
      })
    /**/

    subscriptions[subscriptions.length] = Rest
      .ajax({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/logs/system',
        dataType: 'json'
      })
      .subscribe({
        next: ({data}) => {
          console.log(data)
        },

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
              <TableHeaderColumn colSpan={3} style={{textAlign: 'center'}}>
                <div style={styles.tableTitle}>System Logs</div>

                <IconButton
                  onTouchTap={this.sync}
                  iconStyle={styles.syncButton}
                  disabled={isLoading}
                >
                  <SyncIcon color={'grey'} />
                </IconButton>
              </TableHeaderColumn>
            </TableRow>

            <TableRow>
              <TableHeaderColumn>Title</TableHeaderColumn>
              <TableHeaderColumn>Description</TableHeaderColumn>
              <TableHeaderColumn>URL</TableHeaderColumn>
            </TableRow>
          </TableHeader>

          <TableBody
            displayRowCheckbox={false}
            showRowHover
          >
            {logs.map(({title, description, url}, index) => (
              <TableRow key={index}>
                <TableRowColumn>{title}</TableRowColumn>
                <TableRowColumn>{description}</TableRowColumn>
                <TableRowColumn>{url}</TableRowColumn>
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
