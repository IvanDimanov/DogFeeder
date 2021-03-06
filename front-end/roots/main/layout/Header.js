'use strict'

import React, {Component} from 'react'
import {Link} from 'react-router'
import {observer} from 'mobx-react'

import AuthStore from '../../../stores/AuthStore'
import UserStore from '../../../stores/UserStore'

import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'

import HomeIcon from 'material-ui/svg-icons/action/home'
import ProfileIcon from 'material-ui/svg-icons/action/face'
import HardwareIcon from 'material-ui/svg-icons/hardware/developer-board'
import LogsIcon from 'material-ui/svg-icons/action/assessment'
import ExposureIcon from 'material-ui/svg-icons/image/exposure'
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new'

const style = {
  link: {
    color: 'inherit',
    textDecoration: 'inherit'
  }
}

const Header = observer(class Header extends Component {
  state = {
    isOpen: false
  }

  toggleOpen = () => {
    const {isOpen} = this.state
    this.setState({isOpen: !isOpen})
  }

  render () {
    const {isOpen} = this.state

    return <div>
      <AppBar
        title={`Welcome, ${UserStore.user.title} ${UserStore.user.name}`}
        onLeftIconButtonTouchTap={this.toggleOpen}
      />

      <Drawer
        open={isOpen}
        docked={false}
        onRequestChange={this.toggleOpen}
      >
        <Link
          to={'/home'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<HomeIcon />}>Home</MenuItem>
        </Link>

        <Link
          to={'/profile'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<ProfileIcon />}>Profile</MenuItem>
        </Link>

        <Link
          to={'/hardware'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<HardwareIcon />}>Hardware</MenuItem>
        </Link>

        <Link
          to={'/logs'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<LogsIcon />}>System Logs</MenuItem>
        </Link>

        <Link
          to={'/calculator'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<ExposureIcon />}>Calculator</MenuItem>
        </Link>

        <Link
          onTouchTap={AuthStore.logout}
          style={style.link}
        >
          <MenuItem leftIcon={<LogoutIcon />}>Logout</MenuItem>
        </Link>
      </Drawer>
    </div>
  }
})

export default Header
