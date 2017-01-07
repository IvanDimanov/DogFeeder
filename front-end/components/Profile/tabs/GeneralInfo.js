/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'
import {observer} from 'mobx-react'

import UserStore from '../../../stores/UserStore'

import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import CircularProgress from 'material-ui/CircularProgress'
import Snackbar from 'material-ui/Snackbar'

import SexIcon from 'material-ui/svg-icons/notification/wc'
import TitleIcon from 'material-ui/svg-icons/action/record-voice-over'

import sharedStyles from '../../../shared/styles'
import profileStyles from '../styles'

const config = __CONFIG__

const subscriptions = []

const GeneralInfo = observer(class GeneralInfo extends Component {
  constructor (props) {
    super(props)

    this.state = {
      sex: '',
      title: '',

      isLoading: false,
      successMessage: '',
      errors: {
        general: [],
        sex: '',
        title: ''
      }
    }

    this.save = this.save.bind(this)
    this.toggleSex = this.toggleSex.bind(this)
  }

  componentWillUnmount () {
    let subscription
    while ((subscription = subscriptions.pop())) subscription.unsubscribe()
  }

  toggleSex () {
    const {errors} = this.state
    errors.sex = ''

    let sex = this.state.sex || UserStore.user.sex
    sex = sex === 'male' ? 'female' : 'male'

    this.setState({
      sex,
      title: UserStore.titles[sex][0],
      errors
    })
  }

  save () {
    const {errors} = this.state
    errors.general = []

    this.setState({
      isLoading: true,
      errors
    })

    const sex = this.state.sex || UserStore.user.sex
    const title = this.state.title || UserStore.user.title

    subscriptions[subscriptions.length] = UserStore
      .setUser({sex, title})
      .subscribe({
        next: () => this.setState({
          successMessage: 'User successfully updated'
        }),

        error: ({data}) => {
          const {errors} = this.state

          switch (data.errorCode) {
            case 'InvalidUserSex':
              errors.sex = data.errorMessage
              break

            case 'InvalidUserTitle':
              errors.title = data.errorMessage
              break

            default:
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
    const {isLoading, successMessage, errors} = this.state

    const sex = this.state.sex || UserStore.user.sex
    const title = this.state.title || UserStore.user.title

    const toggleSexStyles = profileStyles.toggle[sex]
    const sexTitles = UserStore.titles[sex]

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
        <small style={{color: 'red'}}>{errors.sex}</small>
      </div>

      <div style={profileStyles.fieldGroup}>
        <TitleIcon style={profileStyles.icon} />
        <SelectField
          floatingLabelText='Title'
          value={title}
          onChange={(event, index, value) => {
            const {errors} = this.state
            errors.title = ''

            this.setState({
              title: value,
              errors
            })
          }}
          disabled={isLoading}
          errorText={errors.title}
        >
          {sexTitles.map((title, index) => <MenuItem key={index} value={title} primaryText={title} />)}
        </SelectField>
      </div>

      <div style={profileStyles.saveGroup.wrapper}>
        {!isLoading &&
          <FlatButton
            label='Save'
            onTouchTap={this.save}
            disabled={Boolean(errors.sex || errors.title)}
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
})

export default GeneralInfo
