
setVh()

window.addEventListener('resize', setVh)

function setVh () {
  const vh = window.innerHeight / 100
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
