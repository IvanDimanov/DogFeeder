'use strict'

import React from 'react'
import {render} from 'react-dom'
import {Router, Route, hashHistory, IndexRedirect} from 'react-router'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Layout from './layout'
import NotFound from '../../components/NotFound'

import RestStore from '../../stores/RestStore'
import AuthStore from '../../stores/AuthStore'

import Home from '../../components/Home'
import Profile from '../../components/Profile'
import Hardware from '../../components/Hardware'
import Logs from '../../components/Logs'

window.log = function log () {
  return console.log.apply(console, arguments)
}

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

/* Page available only for authorized users */
if (!RestStore.getAuthorizationHeader()) {
  AuthStore.logout()
}

render((
  <MuiThemeProvider>
    <Router history={hashHistory}>
      <Route path='/' component={Layout}>
        <IndexRedirect to='home' />
        <Route path='/home' component={Home} />
        <Route path='/profile' component={Profile} />
        <Route path='/hardware' component={Hardware} />
        <Route path='/logs' component={Logs} />
        <Route path='*' component={NotFound} />
      </Route>
    </Router>
  </MuiThemeProvider>
), document.getElementById('main__app'))
