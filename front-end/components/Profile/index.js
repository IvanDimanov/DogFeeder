'use strict'

/**
import Rest from '../stores/Rest'
const searchText = 'Rambo'
Rest
  .ajax({
    method: 'GET',
    url: `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(searchText)}&callback=?`,
    dataType: 'json'
  })
  .subscribe({
    next: ({data, textStatus, jqXHR}) => console.log('next', data, textStatus, jqXHR),
    error: (a, b, c, d, e) => console.log('error', a, b, c, d, e),
    complete: () => console.log('complete')
  })
/**/

/**
import Rest from '../stores/Rest'
Rest
  .get('http://idimanov.com/dog-feeder/test-api/user.php')
  .subscribe({
    next: ({data, textStatus, jqXHR}) => console.log('next', data, textStatus, jqXHR),
    error: (a, b, c, d, e) => console.log('error', a, b, c, d, e),
    complete: () => console.log('complete')
  })
/**/

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
