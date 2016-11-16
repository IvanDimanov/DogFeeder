'use strict'

const profileStyles = {
  paper: {
    padding: 30,
    margin: '60px auto'
  },

  header: {
    textAlign: 'center'
  },

  fieldGroup: {
    marginTop: 20
  },

  icon: {
    color: 'grey',
    float: 'left',
    marginTop: 40,
    marginRight: 20,
    marginBottom: -6
  },

  toggle: {
    default: {
      width: 250,
      display: 'inline-block'
    },
    male: {
      labelStyle: {
        color: '#00bcd4',
        textTransform: 'capitalize'
      }
    },
    female: {
      thumbStyle: {
        backgroundColor: '#ff4081'
      },
      trackStyle: {
        backgroundColor: '#ff9d9d'
      },
      labelStyle: {
        color: '#ff4081',
        textTransform: 'capitalize'
      }
    }
  },

  saveGroup: {
    wrapper: {
      textAlign: 'right',
      marginTop: 10
    },
    progress: {
      marginTop: 7,
      marginRight: 33,
      marginBottom: 9
    }
  }
}

module.exports = profileStyles
