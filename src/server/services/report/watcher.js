import Report from 'models/report'

// bitmask
export const TYPES = {
  LOAD_ORIGINAL_MOBILE:    0b00000001,
  LOAD_ORIGINAL_DESKTOP:   0b00000010,
  OPTIMIZE_IMAGES_MOBILE:  0b00000100,
  OPTIMIZE_IMAGES_DESKTOP: 0b00001000,
  LOAD_OPTIMIZED_MOBILE:   0b00010000,
  LOAD_OPTIMIZED_DESKTOP:  0b00100000,
  RUN_LIGHTHOUSE_MOBILE:   0b01000000,
  RUN_LIGHTHOUSE_DESKTOP:  0b10000000
}

export const FINISH = Object.values(TYPES).reduce((f, v) => f | v)

export const createWatcher = (identifier) => ({
  updateProgress: async ({ type, message, isCompleted, data }) => {
    if (!isCompleted) {
      console.log(`[${identifier}] ${message}...`)
      console.time(`[${identifier}] ${message}`)

      return
    }

    console.timeEnd(`[${identifier}] ${message}`)

    const { progress } = await Report.findOneAndUpdate({
      identifier
    }, {
      $bit: {
        progress: {
          or: type || 0
        }
      },
      $set: {
        [`data.${data.key}`]: data.value
      }
    }, {
      new: true
    })

    // TODO send progress via websocket
  },
  finish: async (error) => {
    await Report.findOneAndUpdate({
      identifier
    }, {
      error: !!error,
      finish: true
    })

    if (error) {
      console.log(`[${identifier}] Exited with error`, error)
    } else {
      console.log(`[${identifier}] Exited normally!`)
    }
  }
})
