const express = require('express')
const morgan = require('morgan')
// const path = require('path')

const { FileUtils, Route } = require('.')

module.exports = class Server {
  constructor () {
    this.app = null
    this.routes = []
  }

  start () {
    const port = process.env.PORT || 8080

    this.app = express()

    this.app.use(express.json()) // Express's JSON parser
    this.app.use(morgan('dev'))
    this.app.set('port', port)
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://spotiparty.live')
      next()
    })

    this.app.listen(port, () => {
      console.log(`Server is now listening on port "${port}". Initializing routes...`)
      return this.startRoutes()
    })
  }

  startRoutes (dirPath = 'src/routes') {
    let success = 0
    let failed = 0
    return FileUtils.requireDirectory(dirPath, (NewRoute) => {
      if (Object.getPrototypeOf(NewRoute) !== Route) return
      this.addRoute(new NewRoute(this)) ? success++ : failed++
    }, console.log.bind(this)).then(() => {
      if (failed === 0) {
        console.log(`All ${success} routes loaded without errors.`)
      } else {
        console.log(`${success} routes loaded, ${failed} failed.`)
      }
    })
  }

  addRoute (route) {
    if (!(route instanceof Route)) {
      console.log(`${route} failed to load - Not a Route`)
      return false
    }

    route._register(this.app)
    this.routes.push(route)
    return true
  }
}
