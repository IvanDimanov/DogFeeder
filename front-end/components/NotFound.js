'use strict'

import React from 'react'
import {Link} from 'react-router'

import Paper from 'material-ui/Paper'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ActionHome from 'material-ui/svg-icons/action/home'

const styles = {
  paper: {
    width: 350,
    padding: '10px 10px 30px 10px',
    textAlign: 'center',
    display: 'inline-block',
    margin: '60px auto'
  },
  title: {
    lineHeight: '50px'
  },
  link: {
    marginLeft: 15
  }
}

const NotFound = ({location}) => <Paper style={styles.paper} zDepth={1}>
  <h3 style={styles.title}>
    404: Page Not Found

    <Link to={'/home'} style={styles.link}>
      <FloatingActionButton secondary>
        <ActionHome />
      </FloatingActionButton>
    </Link>
  </h3>

  We couldn't get page <b>{location.pathname}</b>
</Paper>

export default NotFound
