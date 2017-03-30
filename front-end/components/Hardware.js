/* global __CONFIG__ */
'use strict'

import React, { Component } from 'react'
import {observer} from 'mobx-react'

import HardwareStore from '../stores/HardwareStore'

import Paper from 'material-ui/Paper'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import LedOnIcon from 'material-ui/svg-icons/action/lightbulb-outline'
import LedOffIcon from 'material-ui/svg-icons/editor/highlight'
import Snackbar from 'material-ui/Snackbar'

import sharedStyles from '../shared/styles'

const config = __CONFIG__

const styles = {
  refreshWrapper: {
    position: 'absolute',
    margin: '8px 0px 0px 8px'
  },

  ledOffIconButton: {
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

  setLed = (shouldSetOn) => {
    this.setState({
      isLoading: true,
      errorMessage: ''
    })

    this.state.subscriptions[this.state.subscriptions.length] = HardwareStore
      .led
      .set(shouldSetOn)
      .subscribe({
        error: ({data = {}}) => this.setState({
          isLoading: false,
          errorMessage: data.errorMessage || `Unable to set Led ${shouldSetOn ? 'on' : 'off'}`
        }),

        complete: () => this.setState({isLoading: false})
      })
  }

  render () {
    const {isLoading, errorMessage} = this.state

    return <Paper style={sharedStyles.paper} zDepth={1}>
      {isLoading && <div style={styles.refreshWrapper}>
        <RefreshIndicator
          size={40}
          left={0}
          top={0}
          status='loading'
          style={sharedStyles.refresh}
        />
      </div>}

      {HardwareStore.led.isOn
        ? <FloatingActionButton
          onTouchTap={() => this.setLed(false)}
          disabled={isLoading}
        >
          <LedOnIcon />
        </FloatingActionButton>

        : <IconButton
          style={styles.ledOffIconButton}
          onTouchTap={() => this.setLed(true)}
          disabled={isLoading}
        >
          <LedOffIcon />
        </IconButton>
      }

      <Snackbar
        open={Boolean(errorMessage)}
        message={errorMessage}
        autoHideDuration={config['front-end'].successMessageAutoHideDuration}
        onRequestClose={() => this.setState({errorMessage: ''})}
      />
    </Paper>
  }
})

export default Hardware
