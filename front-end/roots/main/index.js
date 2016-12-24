'use strict'

window.log = function log () {
  return console.log.apply(console, arguments)
}

import React from 'react'
import {render} from 'react-dom'
import {Router, Route, hashHistory, IndexRedirect} from 'react-router'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

import Layout from './layout'
import NotFound from '../../components/NotFound'

import Rest from '../../stores/Rest'

import Home from '../../components/Home'
import Profile from '../../components/Profile'
import Logs from '../../components/Logs'

/* Page available only for authorized users */
if (!Rest.getAuthorizationHeader()) {
  window.location.hash = ''
  window.location.pathname = '/login.html'
}

render((
  <MuiThemeProvider>
    <Router history={hashHistory}>
      <Route path='/' component={Layout}>
        <IndexRedirect to='home' />
        <Route path='/home' component={Home} />
        <Route path='/profile' component={Profile} />
        <Route path='/logs' component={Logs} />
        <Route path='*' component={NotFound} />
      </Route>
    </Router>
  </MuiThemeProvider>
), document.getElementById('main__app'))
