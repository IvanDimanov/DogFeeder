/* global __CONFIG__ */
'use strict'

import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { FadeIn } from 'animate-components'

import HardwareStore from '../stores/HardwareStore'

import Paper from 'material-ui/Paper'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import RelayOnIcon from 'material-ui/svg-icons/action/lock-open'
import RelayOffIcon from 'material-ui/svg-icons/action/lock-outline'
import Snackbar from 'material-ui/Snackbar'

import sharedStyles from '../shared/styles'

const config = __CONFIG__

const styles = {
  refreshWrapper: {
    position: 'absolute',
    margin: '8px 0px 0px 8px'
  },

  relayOffIconButton: {
    width: 56,
    height: 56
  }
}

const Hardware = observer(class Hardware extends Component {
  state = {
    subscriptions: [],
    isLoading: false,
    errorMessage: ''
  }

  componentWillUnmount () {
    let subscription
    while ((subscription = this.state.subscriptions.pop())) subscription.unsubscribe()
  }

  setRelay = (shouldSetOn) => {
    this.setState({
      isLoading: true,
      errorMessage: ''
    })

    this.state.subscriptions[this.state.subscriptions.length] = HardwareStore
      .relay
      .set(shouldSetOn)
      .subscribe({
        error: ({data = {}}) => this.setState({
          isLoading: false,
          errorMessage: data.errorMessage || `Unable to set Relay ${shouldSetOn ? 'on' : 'off'}`
        }),

        complete: () => this.setState({isLoading: false})
      })
  }

  toggleLoading = () => this.setState({isLoading: !this.state.isLoading})

  render () {
    const {isLoading, errorMessage} = this.state

    return <FadeIn>
      <Paper style={sharedStyles.paper} zDepth={1}>
        {isLoading && <div style={styles.refreshWrapper}>
          <RefreshIndicator
            size={40}
            left={0}
            top={0}
            status='loading'
            style={sharedStyles.refresh}
          />
        </div>}

        {HardwareStore.relay.isOn
          ? <FloatingActionButton
            onTouchTap={() => this.setRelay(false)}
            disabled={isLoading}
          >
            <RelayOnIcon />
          </FloatingActionButton>

          : <IconButton
            style={styles.relayOffIconButton}
            onTouchTap={() => this.setRelay(true)}
            disabled={isLoading}
          >
            <RelayOffIcon />
          </IconButton>
        }

        <Snackbar
          open={Boolean(errorMessage)}
          message={errorMessage}
          autoHideDuration={config['front-end'].successMessageAutoHideDuration}
          onRequestClose={() => this.setState({errorMessage: ''})}
        />
      </Paper>
    </FadeIn>
  }
})

export default Hardware
