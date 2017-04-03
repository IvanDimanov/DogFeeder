'use strict'

import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {FadeIn} from 'animate-components'

import UserStore from '../../stores/UserStore'

import Paper from 'material-ui/Paper'
import {Tabs, Tab} from 'material-ui/Tabs'

import GeneralInfo from './tabs/GeneralInfo'
import ChangePassword from './tabs/ChangePassword'

import sharedStyles from '../../shared/styles'

const Profile = observer(class Profile extends Component {
  render () {
    /* To be rendered for unauthorized Users */
    if (!~UserStore.user.role.permissions.indexOf('canReadProfile')) {
      return <FadeIn>
        <Paper style={sharedStyles.paper} zDepth={1}>
          <div style={{textAlign: 'center'}}>
            <h3>You have no Permission to read this Profile</h3>
            <br />
            Please contact <a href='mailto:spam@idimanov.com'>spam@idimanov.com</a> for more details.
          </div>
        </Paper>
      </FadeIn>
    }

    return <FadeIn>
      <Paper style={sharedStyles.paper} zDepth={1}>
        <Tabs>
          <Tab label='Profile screen'>
            <GeneralInfo />
          </Tab>
          <Tab label='Change Password'>
            <ChangePassword />
          </Tab>
        </Tabs>
      </Paper>
    </FadeIn>
  }
})

export default Profile
