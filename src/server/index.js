import express from 'express'

import config from 'infrastructure/config'

const app = express()

app.listen(config.port, () => console.log(`server started at ${ config.port }`))
