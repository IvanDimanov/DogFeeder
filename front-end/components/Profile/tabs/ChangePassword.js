/* global __CONFIG__ alert */
'use strict'

import React, {Component} from 'react'

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

  onPasswordKey ({ctrlKey, key}) {
    const {newPassword} = this.state
    if (ctrlKey &&
        key === 'v'
    ) {
      alert('No Copy-Paste allowed\n:) Ха сега дате видим')
      setTimeout(() => this.setState({newPassword}))
    }
  }

  getPasswordStrongLevel (password) {
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
  }

  onNewPasswordChange (event) {
    const {repeatPassword, errors} = this.state
    const newPassword = event.target.value
    const newPasswordStrongLevel = this.getPasswordStrongLevel(newPassword)

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

    setTimeout(() => {
      this.setState({
        newPassword: '',
        repeatPassword: '',
        isLoading: false,
        successMessage: 'Password changed'
      })
    }, 1000)
  }

  render () {
    const {newPassword, repeatPassword, isLoading, successMessage, errors} = this.state

    const newPasswordStrongLevel = this.getPasswordStrongLevel(newPassword)

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
