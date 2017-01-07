/* global __CONFIG__ alert */
'use strict'

import React, {Component} from 'react'

import UserStore from '../../../stores/UserStore'

import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import CircularProgress from 'material-ui/CircularProgress'
import Snackbar from 'material-ui/Snackbar'

import PasswordIcon from 'material-ui/svg-icons/action/lock'
import RepeatPasswordIcon from 'material-ui/svg-icons/action/lock-outline'

import sharedStyles from '../../../shared/styles'
import profileStyles from '../styles'

const config = __CONFIG__
const subscriptions = []

class ChangePassword extends Component {
  constructor (props) {
    super(props)

    this.state = {
      newPassword: '',
      repeatPassword: '',
      isLoading: false,
      successMessage: '',
      errors: {
        general: [],
        title: '',
        newPassword: '',
        repeatPassword: ''
      }
    }

    this.change = this.change.bind(this)
    this.onPasswordKey = this.onPasswordKey.bind(this)
    this.onNewPasswordChange = this.onNewPasswordChange.bind(this)
    this.onRepeatPasswordChange = this.onRepeatPasswordChange.bind(this)
  }

  componentWillUnmount () {
    let subscription
    while ((subscription = subscriptions.pop())) subscription.unsubscribe()
  }

  onPasswordKey ({ctrlKey, key}) {
    const {newPassword} = this.state
    if (ctrlKey &&
        key === 'v'
    ) {
      alert('No Copy-Paste allowed\n:) Ха сега дате видим')
      setTimeout(() => this.setState({newPassword}))
    }
  }

  onNewPasswordChange (event) {
    const {repeatPassword, errors} = this.state
    const newPassword = event.target.value
    const newPasswordStrongLevel = UserStore.getPasswordStrongLevel(newPassword)

    errors.newPassword = newPasswordStrongLevel.level && newPasswordStrongLevel.level < 4 ? 'Please type a stronger Password' : ''
    errors.repeatPassword = repeatPassword !== newPassword ? 'Both passwords should match but are now different' : ''

    this.setState({
      newPassword,
      errors
    })
  }

  onRepeatPasswordChange (event) {
    const {newPassword, errors} = this.state
    const repeatPassword = event.target.value

    errors.repeatPassword = repeatPassword !== newPassword ? 'Both passwords should match but are now different' : ''

    this.setState({
      repeatPassword,
      errors
    })
  }

  change () {
    const {errors} = this.state
    errors.general = []

    this.setState({
      isLoading: true,
      errors
    })

    const {newPassword} = this.state

    subscriptions[subscriptions.length] = UserStore
      .setPassword(newPassword)
      .subscribe({
        next: () => this.setState({
          newPassword: '',
          repeatPassword: '',
          successMessage: 'Password changed'
        }),

        error: ({data}) => {
          const {errors} = this.state

          if (data.errorCode === 'InvalidPassword') {
            errors.newPassword = data.errorMessage
          } else {
            errors.general = [data.errorMessage]
          }

          this.setState({
            isLoading: false,
            errors
          })
        },

        complete: () => this.setState({isLoading: false})
      })
  }

  render () {
    const {newPassword, repeatPassword, isLoading, successMessage, errors} = this.state

    const newPasswordStrongLevel = UserStore.getPasswordStrongLevel(newPassword)

    return <div>
      <div style={profileStyles.fieldGroup}>
        <PasswordIcon style={profileStyles.icon} />
        <TextField
          type='password'
          hintText='e.g. 123Abc$#'
          floatingLabelText='New Password'
          value={newPassword}
          onKeyDown={this.onPasswordKey}
          onChange={this.onNewPasswordChange}
          disabled={isLoading}
          errorText={errors.newPassword}
        />
        <div style={newPasswordStrongLevel.style}>{newPasswordStrongLevel.label && `Level: ${newPasswordStrongLevel.label}`}</div>
      </div>

      <div style={profileStyles.fieldGroup}>
        <RepeatPasswordIcon style={profileStyles.icon} />
        <TextField
          type='password'
          hintText='e.g. 123Abc$#'
          floatingLabelText='Repeat New Password'
          value={repeatPassword}
          onKeyDown={this.onPasswordKey}
          onChange={this.onRepeatPasswordChange}
          disabled={isLoading}
          errorText={errors.repeatPassword}
        />
      </div>

      <div style={profileStyles.saveGroup.wrapper}>
        {!isLoading &&
          <FlatButton
            label='Change'
            onTouchTap={this.change}
            disabled={Boolean(!newPassword || errors.title || errors.newPassword || errors.repeatPassword)}
          />
        }

        {isLoading && <CircularProgress size={20} thickness={2} style={profileStyles.saveGroup.progress} />}
      </div>

      {errors.general.map((error, index) => <span key={index} style={sharedStyles.error}>{error}</span>)}

      <Snackbar
        open={Boolean(successMessage)}
        message={successMessage}
        autoHideDuration={config['front-end'].successMessageAutoHideDuration}
        onRequestClose={() => this.setState({successMessage: ''})}
      />
    </div>
  }
}

export default ChangePassword
