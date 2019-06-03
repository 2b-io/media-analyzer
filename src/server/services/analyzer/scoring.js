import ms from 'ms'

const TARGET = {
  loadTime: ms('1s'),
  pageSize: 1000000 // ~2mb
}

export const summarizeMetrics = (data) => {
  const {
    original: {
      desktop: {
        stat: {
          loadTime: desktopOriginalLoadTime,
          downloadedBytes: desktopOriginalPageSize
        }
      },
      mobile: {
        stat: {
          loadTime: mobileOriginalLoadTime,
          downloadedBytes: mobileOriginalPageSize
        }
      }
    },
    optimized: {
      desktop: {
        stat: {
          loadTime: desktopOptimizedLoadTime,
          downloadedBytes: desktopOptimizedPageSize
        }
      },
      mobile: {
        stat: {
          loadTime: mobileOptimizedLoadTime,
          downloadedBytes: mobileOptimizedPageSize
        }
      }
    },
    lighthouse: {
      desktop: {
        categories: {
          performance: {
            score: desktopOriginalScore
          }
        }
      },
      mobile: {
        categories: {
          performance: {
            score: mobileOriginalScore
          }
        }
      }
    }
  } = data

  const metrics = {
    desktop: {
      score: {
        original: desktopOriginalScore * 100
      },
      loadTime: {
        original: desktopOriginalLoadTime,
        optimized: desktopOptimizedLoadTime
      },
      pageSize: {
        original: desktopOriginalPageSize,
        optimized: desktopOptimizedPageSize
      }
    },
    mobile: {
      score: {
        original: mobileOriginalScore * 100
      },
      loadTime: {
        original: mobileOriginalLoadTime,
        optimized: mobileOptimizedLoadTime
      },
      pageSize: {
        original: mobileOriginalPageSize,
        optimized: mobileOptimizedPageSize
      }
    }
  }

  const needImprove = {
    desktop: {
      score: 100 - metrics.desktop.score.original,
      loadTime: {
        original: Math.max(1, metrics.desktop.loadTime.original - TARGET.loadTime),
        optimized: Math.max(1, metrics.desktop.loadTime.optimized - TARGET.loadTime)
      },
      pageSize: {
        original: Math.max(1, metrics.desktop.pageSize.original - TARGET.pageSize),
        optimized: Math.max(1, metrics.desktop.pageSize.optimized - TARGET.pageSize)
      }
    },
    mobile: {
      score: 100 - metrics.mobile.score.original,
      loadTime: {
        original: Math.max(1, metrics.mobile.loadTime.original - TARGET.loadTime),
        optimized: Math.max(1, metrics.mobile.loadTime.optimized - TARGET.loadTime)
      },
      pageSize: {
        original: Math.max(1, metrics.mobile.pageSize.original - TARGET.pageSize),
        optimized: Math.max(1, metrics.mobile.pageSize.optimized - TARGET.pageSize)
      }
    }
  }

  // weight: loadTime = 4/5, pageSize = 1/5

  const penaltyScore = {
    desktop: {
      loadTime: (needImprove.desktop.score / 5 * 4) * needImprove.desktop.loadTime.optimized / needImprove.desktop.loadTime.original,
      pageSize: (needImprove.desktop.score / 5) * needImprove.desktop.pageSize.optimized / needImprove.desktop.pageSize.original
    },
    mobile: {
      loadTime: (needImprove.mobile.score / 5 * 4) * needImprove.mobile.loadTime.optimized / needImprove.mobile.loadTime.original,
      pageSize: (needImprove.mobile.score / 5) * needImprove.mobile.pageSize.optimized / needImprove.mobile.pageSize.original
    }
  }

  const optimizedScore = {
    desktop: Math.max(1, Math.min(99, 100 - penaltyScore.desktop.loadTime - penaltyScore.desktop.pageSize)),
    mobile: Math.max(1, Math.min(99, 100 - penaltyScore.mobile.loadTime - penaltyScore.mobile.pageSize)),
  }

  const optimizedScoreUpto = {
    desktop: Math.min(99, optimizedScore.desktop + Math.round((optimizedScore.desktop * 35)/100)),
    mobile: Math.min(99, optimizedScore.mobile + Math.round((optimizedScore.desktop * 35)/100))
  }

  return {
    original: {
      desktop: {
        loadTime: desktopOriginalLoadTime,
        pageSize: desktopOriginalPageSize,
        score: desktopOriginalScore * 100
      },
      mobile: {
        loadTime: mobileOriginalLoadTime,
        pageSize: mobileOriginalPageSize,
        score: mobileOriginalScore * 100
      }
    },
    optimized: {
      desktop: {
        loadTime: desktopOptimizedLoadTime,
        pageSize: desktopOptimizedPageSize,
        score: optimizedScore.desktop
      },
      mobile: {
        loadTime: mobileOptimizedLoadTime,
        pageSize: mobileOptimizedPageSize,
        score: optimizedScore.mobile
      }
    },
    optimizedUpto: {
      desktop: {
        loadTime: desktopOptimizedLoadTime - Math.round((desktopOptimizedLoadTime * 60)/100),
        pageSize: desktopOptimizedPageSize - Math.round((desktopOptimizedPageSize * 50)/100),
        score: optimizedScoreUpto.desktop
      },
      mobile: {
        loadTime: mobileOptimizedLoadTime - Math.round((mobileOptimizedLoadTime * 60)/100),
        pageSize: mobileOptimizedPageSize - Math.round((mobileOptimizedPageSize * 50)/100),
        score: optimizedScoreUpto.mobile
      }
    }
  }
}
