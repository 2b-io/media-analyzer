const scoreUpto = (mobileOptimizedScore, desktopOptimizedScore) => {
  let mobileOptimizedScoreUpto
  let desktopOptimizedScoreUpto


  if (0 < mobileOptimizedScore && mobileOptimizedScore < 30) {
    mobileOptimizedScoreUpto = mobileOptimizedScore + 45
  }

  if (30 < mobileOptimizedScore && mobileOptimizedScore < 50) {
    mobileOptimizedScoreUpto = mobileOptimizedScore + 35
  }

  if (50 < mobileOptimizedScore && mobileOptimizedScore < 85) {
    mobileOptimizedScoreUpto = Math.min(95, mobileOptimizedScore + Math.round((mobileOptimizedScore * 35)/100))

  }
  if (85 < mobileOptimizedScore && mobileOptimizedScore < 99) {
    mobileOptimizedScoreUpto = Math.min(99, mobileOptimizedScore + Math.round((mobileOptimizedScore * 35)/100))
  }

  if (0 < desktopOptimizedScore && desktopOptimizedScore < 30) {
    desktopOptimizedScoreUpto = desktopOptimizedScore + 50
  }

  if (30 < desktopOptimizedScore && desktopOptimizedScore < 50) {
    desktopOptimizedScoreUpto = Math.min(85, desktopOptimizedScore + Math.round((desktopOptimizedScore * 85)/100))
  }

  if (50 < desktopOptimizedScore && desktopOptimizedScore < 85) {
    desktopOptimizedScoreUpto = Math.min(95, desktopOptimizedScore + Math.round((desktopOptimizedScore * 75)/100))
  }

  if (85 < desktopOptimizedScore && desktopOptimizedScore < 99) {
    desktopOptimizedScoreUpto = Math.min(99, desktopOptimizedScore + Math.round((desktopOptimizedScore * 45)/100))
  }

  return {
    desktopOptimizedScoreUpto,
    mobileOptimizedScoreUpto
  }
}

export default scoreUpto
