(()=>{
  const actions = document.getElementById('actions')
  const noBtn = document.getElementById('no')
  const yesBtn = document.getElementById('yes')
  const modal = document.getElementById('modal')

  // Place No near the Yes button initially
  function placeInitial(){
    const a = actions.getBoundingClientRect()
    const y = yesBtn.getBoundingClientRect()
    // position No to the right of Yes if space
    const left = (a.width/2) + 40
    const top = (a.height - noBtn.offsetHeight)/2
    noBtn.style.left = left + 'px'
    noBtn.style.top = top + 'px'
    noBtn.style.position = 'absolute'
  }

  function moveNoAway(clientX, clientY){
    const a = actions.getBoundingClientRect()
    const b = noBtn.getBoundingClientRect()
    const relX = clientX - a.left
    const relY = clientY - a.top

    const btnCenterX = (b.left - a.left) + b.width/2
    const btnCenterY = (b.top - a.top) + b.height/2
    const dx = relX - btnCenterX
    const dy = relY - btnCenterY
    const dist = Math.hypot(dx, dy)

    const threshold = 120
    if(dist < threshold){
      const padding = 8
      const maxX = Math.max(20, a.width - b.width - padding)
      const maxY = Math.max(10, a.height - b.height - padding)
      // new position opposite side biased by cursor
      let nx = Math.floor(Math.random() * maxX) + padding
      let ny = Math.floor(Math.random() * maxY) + padding

      // try to push away from cursor
      if(dx > 0) nx = Math.max(padding, nx - 80)
      else nx = Math.min(maxX, nx + 80)
      if(dy > 0) ny = Math.max(padding, ny - 40)
      else ny = Math.min(maxY, ny + 40)

      noBtn.style.left = nx + 'px'
      noBtn.style.top = ny + 'px'
    }
  }

  // move on mousemove inside actions
  actions.addEventListener('mousemove', e => moveNoAway(e.clientX, e.clientY))
  // also move when focus or hover
  noBtn.addEventListener('mouseenter', e => moveNoAway(e.clientX, e.clientY))
  noBtn.addEventListener('focus', e => moveNoAway(window.innerWidth/2, window.innerHeight/2))

  // Yes click -> show romantic meme
  yesBtn.addEventListener('click', ()=>{
    modal.style.display = 'block'
    modal.innerHTML = `
      <div class="modal" id="mwin">
        <div class="box">
          <h3 style="margin:0 0 8px">You made my day 💘</h3>
          <img src="https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80" alt="romantic"/>
          <div class="close"><button id="close" style="padding:8px 12px;border-radius:8px;border:none;background:#ec4899;color:#fff;cursor:pointer">Close</button></div>
        </div>
      </div>`
    document.getElementById('close').addEventListener('click', ()=> modal.style.display='none')
  })

  // ensure initial placement after images/fonts load
  window.addEventListener('load', placeInitial)
  window.addEventListener('resize', placeInitial)
})();
