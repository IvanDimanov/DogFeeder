/* global alert */
'use strict'

import React, {Component} from 'react'

import Paper from 'material-ui/Paper'
import Subheader from 'material-ui/Subheader'
import Toggle from 'material-ui/Toggle'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'

import SexIcon from 'material-ui/svg-icons/notification/wc'
import TitleIcon from 'material-ui/svg-icons/action/record-voice-over'
import PasswordIcon from 'material-ui/svg-icons/action/lock'

const styles = {
  paper: {
    padding: 30,
    margin: '60px auto'
  },

  header: {
    textAlign: 'center'
  },

  icon: {
    color: 'grey',
    marginRight: 20,
    marginBottom: -6
  },

  toggle: {
    default: {
      width: 250,
      display: 'inline-block'
    },
    male: {
      labelStyle: {
        color: '#00bcd4',
        textTransform: 'capitalize'
      }
    },
    female: {
      thumbStyle: {
        backgroundColor: '#ff4081'
      },
      trackStyle: {
        backgroundColor: '#ff9d9d'
      },
      labelStyle: {
        color: '#ff4081',
        textTransform: 'capitalize'
      }
    }
  }
}

const titles = {
  male: [
    'Mr.',
    'Sir',
    'Ing.',
    'Mr.Ing.',
    'Super Mr.Phd.Ing.',
    'Бай онзи',
    'Млад Меринджей'
  ],
  female: [
    'Miss',
    'Madam',
    'Madam Ing.',
    'Принцеса',
    'Нейно Величество',
    'Робиня',
    'Ама най най'
  ]
}

class Profile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      sex: 'male',
      title: titles.male[0],
      newPassword: '',
      isNewPassowrdDisabled: false
    }

    this.toggleSex = this.toggleSex.bind(this)
    this.onTitleChange = this.onTitleChange.bind(this)
    this.onNewPasswordKey = this.onNewPasswordKey.bind(this)
    this.onNewPasswordChange = this.onNewPasswordChange.bind(this)
  }

  toggleSex () {
    let {sex} = this.state
    sex = sex === 'male' ? 'female' : 'male'

    this.setState({
      sex,
      title: titles[sex][0]
    })
  }

  onTitleChange (event, index, value) {
    this.setState({
      title: value
    })
  }

  onNewPasswordKey ({ctrlKey, key}) {
    const {newPassword} = this.state
    if (ctrlKey &&
        key === 'v'
    ) {
      alert('No Copy-Paste allowed\n:) Ха сега дате видим')
      setTimeout(() => this.setState({newPassword}))
    }
  }

  onNewPasswordChange (event) {
    this.setState({
      newPassword: event.target.value
    })
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

  render () {
    const {sex, title, newPassword, isNewPassowrdDisabled} = this.state

    const toggleSexStyles = styles.toggle[sex]
    const sexTitles = titles[sex]
    const newPasswordStrongLevel = this.getPasswordStrongLevel(newPassword)

    return <Paper style={styles.paper} zDepth={1}>
      <Subheader>Profile screen</Subheader>
      <br />

      <SexIcon style={styles.icon} />
      <Toggle
        label={sex}
        toggled={sex === 'male'}
        onTouchTap={this.toggleSex}
        {...toggleSexStyles}
        style={styles.toggle.default}
      />
      <br />
      <br />

      <TitleIcon style={styles.icon} />
      <SelectField
        floatingLabelText='Title'
        value={title}
        errorText={!title && 'Please Select a Title'}
        onChange={this.onTitleChange}
      >
        {sexTitles.map((title, index) => <MenuItem key={index} value={title} primaryText={title} />)}
      </SelectField>
      <br />

      {/* TODO: User name */}

      <PasswordIcon style={styles.icon} />
      <TextField
        type='password'
        hintText='e.g. 123Abc$#'
        floatingLabelText='New Password'
        value={newPassword}
        onKeyDown={this.onNewPasswordKey}
        onChange={this.onNewPasswordChange}
        disabled={isNewPassowrdDisabled}
        errorText={newPasswordStrongLevel.level && newPasswordStrongLevel.level < 4 ? 'Please type a stronger Password' : ''}
      />
      <br />
      <span style={newPasswordStrongLevel.style}>{newPasswordStrongLevel.label && `Level: ${newPasswordStrongLevel.label}`}</span>

    </Paper>
  }
}

export default Profile
