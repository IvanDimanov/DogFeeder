'use strict'

import React, {Component} from 'react'
import {Link} from 'react-router'

import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'

import HomeIcon from 'material-ui/svg-icons/action/home'
import ProfileIcon from 'material-ui/svg-icons/action/face'
import ExposureIcon from 'material-ui/svg-icons/image/exposure'
import SearchIcon from 'material-ui/svg-icons/action/search'

const style = {
  link: {
    color: 'inherit',
    textDecoration: 'inherit'
  }
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isOpen: false
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen () {
    const {isOpen} = this.state
    this.setState({isOpen: !isOpen})
  }

  render () {
    const {isOpen} = this.state

    return <div>
      <AppBar
        title='Welcome {User}'
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
          to={'/calculator'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<ExposureIcon />}>Calculator</MenuItem>
        </Link>

        <Link
          to={'/wiki-search'}
          onTouchTap={this.toggleOpen}
          style={style.link}
        >
          <MenuItem leftIcon={<SearchIcon />}>WikiSearch</MenuItem>
        </Link>
      </Drawer>
    </div>
  }
}

export default Header
