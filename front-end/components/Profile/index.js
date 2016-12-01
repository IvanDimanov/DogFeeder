'use strict'

import React from 'react'

import Paper from 'material-ui/Paper'
import {Tabs, Tab} from 'material-ui/Tabs'

import GeneralInfo from './tabs/GeneralInfo'
import ChangePassword from './tabs/ChangePassword'

import sharedStyles from '../../shared/styles'

const Profile = () => <Paper style={sharedStyles.paper} zDepth={1}>
  <Tabs>
    <Tab label='Profile screen'>
      <GeneralInfo />
    </Tab>
    <Tab label='Change Password'>
      <ChangePassword />
    </Tab>
  </Tabs>
</Paper>

export default Profile
