'use strict'

import React from 'react'
import Header from './Header'
import Footer from './Footer'

const Layout = ({children}) => <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
  <Header />
  {children}
  <Footer />
</div>

export default Layout
