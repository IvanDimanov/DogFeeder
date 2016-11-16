'use strict'

import React from 'react'

import Paper from 'material-ui/Paper'
import {Tabs, Tab} from 'material-ui/Tabs'

import GeneralInfo from './tabs/GeneralInfo'
import ChangePassword from './tabs/ChangePassword'

const styles = {
  paper: {
    padding: 30,
    margin: '60px auto'
  }
}

const Profile = () => <Paper style={styles.paper} zDepth={1}>
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
