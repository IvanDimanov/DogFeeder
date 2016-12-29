/* global __CONFIG__ */
'use strict'

import React, {Component} from 'react'
import {render} from 'react-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import AuthStore from '../../stores/AuthStore'

import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import LoginAsSingerIcon from 'material-ui/svg-icons/image/music-note'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar'

import sharedStyles from '../../shared/styles'

const config = __CONFIG__

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const styles = {
  wrapper: {
    paddingTop: 40
  },
  paper: {
    width: 310,
    marginTop: 30
  },
  titleInherits: {
    textAlign: 'center',
    fontWeight: 300,
    fontFamily: 'Roboto, sans-serif'
  },
  title: {
    color: '#636363'
  },
  subTitle: {
    color: '#4a89dc'
  },
  progressWrapper: {
    width: '100%',
    margin: '47px 0px 5px 0px',
    textAlign: 'center',
    display: 'inline-block'
  },
  loginButton: {
    marginTop: 40
  },
  loginAsSingerButton: {
    position: 'absolute',
    marginTop: 35,
    marginLeft: 10
  }
}

styles.paper = Object.assign({}, sharedStyles.paper, styles.paper)
Object.assign(styles.title, styles.titleInherits)
Object.assign(styles.subTitle, styles.titleInherits)

const subscriptions = []

class Login extends Component {
  constructor (props) {
    super(props)

    this.state = {
      user: {
        name: '',
        password: ''
      },
      lyrics: '',

      isDialogOpened: false,
      isLoading: false,
      errors: {
        general: '',
        name: '',
        password: '',
        lyrics: ''
      }
    }

    this.login = this.login.bind(this)
    this.loginAsSinger = this.loginAsSinger.bind(this)
    this.onEnterKey = this.onEnterKey.bind(this)
    this.onLoginSuccess = this.onLoginSuccess.bind(this)
    this.onLoginError = this.onLoginError.bind(this)
  }

  componentWillUnmount () {
    let subscription
    while ((subscription = subscriptions.pop())) subscription.unsubscribe()
  }

  onLoginSuccess ({jqXHR}) {
    if (!jqXHR.getResponseHeader('Authorization')) {
      const {errors} = this.state
      errors.general = 'Unable to get Authorization'
      this.setState({errors})
      return
    }

    window.location.pathname = '/main.html'
  }

  onLoginError ({data, errorThrown, textStatus, jqXHR}) {
    const {errors} = this.state
    errors.general = data.errorMessage
    this.setState({
      errors,
      isLoading: false
    })
  }

  login () {
    const {user, errors} = this.state
    user.name = String(user.name).trim()
    user.password = String(user.password).trim()

    errors.general = ''
    errors.name = ''
    errors.password = ''

    if (user.name.length < 3) {
      errors.name = 'User name must contains more than 2 non-space characters'
    }

    if (user.password.length < 3) {
      errors.password = 'User password must contains more than 2 non-space characters'
    }

    this.setState({errors})
    if (errors.name ||
        errors.password
    ) {
      return
    }

    this.setState({isLoading: true})
    subscriptions[subscriptions.length] = AuthStore
      .login(user)
      .subscribe({
        next: this.onLoginSuccess,
        error: this.onLoginError,
        complete: () => this.setState({isLoading: false})
      })
  }

  loginAsSinger () {
    const {errors} = this.state
    let {lyrics} = this.state

    lyrics = String(lyrics).trim()

    errors.general = ''
    errors.lyrics = ''

    if (lyrics.length < 2) {
      errors.lyrics = 'Please type more than 2 non-space characters'
    }

    this.setState({errors})
    if (errors.lyrics) {
      return
    }

    this.setState({isLoading: true})
    subscriptions[subscriptions.length] = AuthStore
      .loginAsSinger(lyrics)
      .subscribe({
        next: this.onLoginSuccess,
        error: this.onLoginError,
        complete: () => this.setState({isLoading: false})
      })
  }

  onEnterKey (callback) {
    if (typeof callback !== 'function') {
      return
    }

    return (event) => {
      if (event.key === 'Enter') callback()
    }
  }

  render () {
    const {user: {name, password}, lyrics, isDialogOpened, isLoading, errors} = this.state

    return <div style={styles.wrapper}>
      <h1 style={styles.title}>Welcome back</h1>
      <h3 style={styles.subTitle}>nice to see you</h3>

      <Paper style={styles.paper} zDepth={1}>
        <TextField
          floatingLabelText='User Name'
          value={name}
          onChange={({target: {value}}) => {
            const {user} = this.state
            user.name = value
            this.setState(user)
          }}
          onKeyUp={this.onEnterKey(this.login)}
          disabled={isLoading}
          errorText={errors.name}
          autoFocus
        />

        <TextField
          type='password'
          floatingLabelText='Password'
          value={password}
          onChange={({target: {value}}) => {
            const {user} = this.state
            user.password = value
            this.setState(user)
          }}
          onKeyUp={this.onEnterKey(this.login)}
          disabled={isLoading}
          errorText={errors.password}
        />

        {isLoading && <div style={styles.progressWrapper}>
          <CircularProgress size={20} thickness={2} />
        </div>}
        {!isLoading && <RaisedButton
          label={'... to the Platform'}
          primary
          fullWidth
          style={styles.loginButton}
          onTouchTap={this.login}
        />}

        <FloatingActionButton
          mini
          secondary
          style={styles.loginAsSingerButton}
          onTouchTap={() => this.setState({isDialogOpened: true})}
          disabled={isLoading}
        >
          <LoginAsSingerIcon />
        </FloatingActionButton>
      </Paper>

      <Dialog
        title={'Login as a "Great Singer"'}
        open={isDialogOpened}
        onRequestClose={() => this.setState({isDialogOpened: false})}
        actions={[
          <FlatButton
            label={'Cancel'}
            primary
            onTouchTap={() => this.setState({isDialogOpened: false})}
            disabled={isLoading}
          />,
          <FlatButton
            label={'Try'}
            primary
            onTouchTap={this.loginAsSinger}
            disabled={isLoading}
          />
        ]}
      >
        Prove we share same values by typing the lyrics of <b>the Best Song</b> you know of and
        <br />
        you'll be rewarded with <b>instant login</b> to the Platform!
        <br />

        <TextField
          floatingLabelText='Lyrics'
          value={lyrics}
          onChange={({target: {value}}) => this.setState({lyrics: value})}
          onKeyUp={this.onEnterKey(this.loginAsSinger)}
          disabled={isLoading}
          errorText={errors.lyrics}
          fullWidth
          autoFocus
        />
      </Dialog>

      <Snackbar
        open={Boolean(errors.general)}
        message={errors.general}
        autoHideDuration={config['front-end'].successMessageAutoHideDuration}
        onRequestClose={() => {
          const {errors} = this.state
          errors.general = ''
          this.setState({errors})
        }}
      />
    </div>
  }
}

render(<MuiThemeProvider>
  <Login />
</MuiThemeProvider>, document.getElementById('login__app'))
