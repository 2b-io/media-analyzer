import express from 'express'
import slash from 'express-slash'
import morgan from 'morgan'

import config from 'infrastructure/config'
import bootstrap from 'bootstrap'

const app = express()

app.enable('strict routing')
app.enable('trust proxy')
app.disable('x-powered-by')

app.use(morgan('dev'), slash())

bootstrap(app)

app.listen(config.port, () => console.log(`server started at ${ config.port }`))
