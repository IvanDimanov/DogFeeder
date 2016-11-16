/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'

import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import CircularProgress from 'material-ui/CircularProgress'
import Snackbar from 'material-ui/Snackbar'

import NameIcon from 'material-ui/svg-icons/social/person'
import SexIcon from 'material-ui/svg-icons/notification/wc'
import TitleIcon from 'material-ui/svg-icons/action/record-voice-over'

import sharedStyles from '../../../shared/styles'
import profileStyles from '../styles'

const config = __CONFIG__

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

class GeneralInfo extends Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      sex: 'male',
      title: titles.male[0],
      isLoading: false,
      successMessage: '',
      errors: {
        general: [],
        name: '',
        title: ''
      }
    }

    this.save = this.save.bind(this)
    this.onNameChange = this.onNameChange.bind(this)
    this.toggleSex = this.toggleSex.bind(this)
  }

  onNameChange (event) {
    const {errors} = this.state
    const name = String(event.target.value).trim()

    errors.name = name.replace(/[^a-zA-Z]/g, '').length < 3 ? 'Name must have more than 3 letters' : ''

    this.setState({
      name,
      errors
    })
  }

  toggleSex () {
    let {sex} = this.state
    sex = sex === 'male' ? 'female' : 'male'

    this.setState({
      sex,
      title: titles[sex][0]
    })
  }

  save () {
    const {errors} = this.state
    errors.general = []

    this.setState({
      isLoading: true,
      errors
    })

    setTimeout(() => {
      this.setState({
        isLoading: false,
        successMessage: 'Profile saved'
      })
    }, 1000)
  }

  render () {
    const {name, sex, title, isLoading, successMessage, errors} = this.state

    const toggleSexStyles = profileStyles.toggle[sex]
    const sexTitles = titles[sex]

    return <div>
      <div style={{marginTop: 60}}>
        <SexIcon style={Object.assign({}, profileStyles.icon, {marginTop: 0})} />
        <Toggle
          label={sex}
          toggled={sex === 'male'}
          onTouchTap={this.toggleSex}
          {...toggleSexStyles}
          style={profileStyles.toggle.default}
          disabled={isLoading}
        />
      </div>

      <div style={profileStyles.fieldGroup}>
        <TitleIcon style={profileStyles.icon} />
        <SelectField
          floatingLabelText='Title'
          value={title}
          onChange={(event, index, value) => this.setState({title: value})}
          disabled={isLoading}
          errorText={errors.title}
        >
          {sexTitles.map((title, index) => <MenuItem key={index} value={title} primaryText={title} />)}
        </SelectField>
      </div>

      <div style={profileStyles.fieldGroup}>
        <NameIcon style={profileStyles.icon} />
        <TextField
          floatingLabelText='Name'
          value={name}
          onChange={this.onNameChange}
          disabled={isLoading}
          errorText={errors.name}
        />
      </div>

      <div style={profileStyles.saveGroup.wrapper}>
        {!isLoading &&
          <FlatButton
            label='Save'
            onTouchTap={this.save}
            disabled={Boolean(errors.name || errors.title)}
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

export default GeneralInfo
