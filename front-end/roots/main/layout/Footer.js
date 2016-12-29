'use strict'

import React, {Component} from 'react'
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation'

import Paper from 'material-ui/Paper'
import RestoreIcon from 'material-ui/svg-icons/action/restore'
import FavoriteIcon from 'material-ui/svg-icons/action/favorite'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'

const recentIcon = <RestoreIcon />
const favoriteIcon = <FavoriteIcon />
const nearbyIcon = <IconLocationOn />

class Footer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedIndex: -1
    }
  }

  render () {
    const {selectedIndex} = this.state

    return <Paper zDepth={1} style={{marginTop: 'auto'}}>
      <BottomNavigation selectedIndex={selectedIndex}>
        <BottomNavigationItem
          label='Recent'
          icon={recentIcon}
          onTouchTap={() => this.setState({selectedIndex: 0})}
        />
        <BottomNavigationItem
          label='Favorites'
          icon={favoriteIcon}
          onTouchTap={() => this.setState({selectedIndex: 1})}
        />
        <BottomNavigationItem
          label='Nearby'
          icon={nearbyIcon}
          onTouchTap={() => this.setState({selectedIndex: 2})}
        />
      </BottomNavigation>
    </Paper>
  }
}

export default Footer
