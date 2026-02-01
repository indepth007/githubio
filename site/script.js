(()=>{
  // Theme handling: applies data-theme on <html> and persists choice
  const themeToggle = document.getElementById('theme-toggle')
  const root = document.documentElement
  const storageKey = 'site-theme'

  function applyTheme(t){
    if(t === 'dark') root.setAttribute('data-theme','dark')
    else root.removeAttribute('data-theme')
    if(themeToggle){
      const ic = themeToggle.querySelector('.icon')
      if(ic) ic.textContent = t === 'dark' ? '☀️' : '🌙'
      themeToggle.setAttribute('aria-pressed', String(t === 'dark'))
    }
  }

  function getStoredTheme(){
    try{ return localStorage.getItem(storageKey) }
    catch(e){ return null }
  }

  function detectTheme(){
    const stored = getStoredTheme()
    if(stored) return stored
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  if(themeToggle){
    const initial = detectTheme()
    applyTheme(initial)
    themeToggle.addEventListener('click', ()=>{
      const cur = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      const next = cur === 'dark' ? 'light' : 'dark'
      try{ localStorage.setItem(storageKey, next) }catch(e){}
      applyTheme(next)
    })
  }

  const actions = document.getElementById('actions')
  const noBtn = document.getElementById('no')
  const yesBtn = document.getElementById('yes')
  const modal = document.getElementById('modal')

  // Place No near the Yes button initially
  function placeInitial(){
    if(!actions || !noBtn || !yesBtn) return
    noBtn.style.position = 'absolute'
    // measure container and buttons
    const a = actions.getBoundingClientRect()
    const y = yesBtn.getBoundingClientRect()
    const b = noBtn.getBoundingClientRect()
    // center No over Yes so it initially covers it
    const left = (y.left - a.left) + (y.width - b.width) / 2
    const top = (y.top - a.top) + (y.height - b.height) / 2
    noBtn.style.left = Math.max(4, left) + 'px'
    noBtn.style.top = Math.max(4, top) + 'px'
    noBtn.style.zIndex = 40
  }

  function moveNoAway(clientX, clientY){
    if(!actions || !noBtn) return
    const a = actions.getBoundingClientRect()
    const b = noBtn.getBoundingClientRect()
    // only move when the pointer is actually inside the NO button bounds
    if(clientX >= b.left && clientX <= b.right && clientY >= b.top && clientY <= b.bottom){
      const relX = clientX - a.left
      const relY = clientY - a.top
      const btnCenterX = (b.left - a.left) + b.width/2
      const btnCenterY = (b.top - a.top) + b.height/2
      const dx = relX - btnCenterX
      const dy = relY - btnCenterY

      const padding = 8
      const maxX = Math.max(20, a.width - b.width - padding)
      const maxY = Math.max(10, a.height - b.height - padding)
      let nx = Math.floor(Math.random() * maxX) + padding
      let ny = Math.floor(Math.random() * maxY) + padding

      // push away from the pointer so the button jumps to the opposite side
      if(dx > 0) nx = Math.max(padding, nx - 80)
      else nx = Math.min(maxX, nx + 80)
      if(dy > 0) ny = Math.max(padding, ny - 40)
      else ny = Math.min(maxY, ny + 40)

      noBtn.style.left = nx + 'px'
      noBtn.style.top = ny + 'px'
    }
  }

  // move on mousemove inside actions
  if(actions) actions.addEventListener('mousemove', e => moveNoAway(e.clientX, e.clientY))
  // also move when focus or hover
  if(noBtn){
    noBtn.addEventListener('mouseenter', e => moveNoAway(e.clientX, e.clientY))
    noBtn.addEventListener('focus', e => moveNoAway(window.innerWidth/2, window.innerHeight/2))
  }

  // Yes click -> reveal the girl's image inside the card (animated)
  const girlWrap = document.getElementById('girlWrap')
  const girlImg = document.getElementById('girlImg')
  const messageSeq = document.getElementById('messageSeq')
  const shareBtn = document.getElementById('shareBtn')

  // --- lightweight confetti ---
  const confettiCanvas = document.createElement('canvas')
  confettiCanvas.id = 'confetti-canvas'
  document.body.appendChild(confettiCanvas)
  const confettiCtx = confettiCanvas.getContext && confettiCanvas.getContext('2d')
  let confettiPieces = []
  function resizeConfetti(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight }
  window.addEventListener('resize', resizeConfetti)
  resizeConfetti()

  function makeConfetti(x,y){
    const colors = ['#ff7ab6','#ffd166','#4ade80','#60a5fa','#ff6b6b']
    for(let i=0;i<28;i++){
      confettiPieces.push({
        x: x || window.innerWidth/2,
        y: y || window.innerHeight/2,
        vx: (Math.random()-0.5)*8,
        vy: Math.random()*-8-2,
        r: 6 + Math.random()*8,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*12,
        life: 0
      })
    }
    if(!confettiLoop) startConfettiLoop()
  }

  let confettiLoop = null
  function startConfettiLoop(){ if(confettiLoop) return; confettiLoop = requestAnimationFrame(confettiTick) }
  function stopConfettiLoop(){ if(confettiLoop) cancelAnimationFrame(confettiLoop); confettiLoop=null }
  function confettiTick(){
    if(!confettiCtx) return
    confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height)
    for(let i=confettiPieces.length-1;i>=0;i--){
      const p = confettiPieces[i]
      p.vy += 0.25
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life += 1
      confettiCtx.save()
      confettiCtx.translate(p.x,p.y)
      confettiCtx.rotate(p.rot * Math.PI/180)
      confettiCtx.fillStyle = p.color
      confettiCtx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6)
      confettiCtx.restore()
      if(p.y > confettiCanvas.height + 60) confettiPieces.splice(i,1)
    }
    if(confettiPieces.length>0) confettiLoop = requestAnimationFrame(confettiTick)
    else stopConfettiLoop()
  }

  function triggerConfetti(){
    const rect = card.getBoundingClientRect()
    makeConfetti(rect.left + rect.width/2, rect.top + 20)
  }

  // --- badges entrance ---
  function animateBadges(){
    const badges = card.querySelectorAll('.badge')
    badges.forEach((b,i)=>{
      b.classList.remove('pop')
      void b.offsetWidth
      setTimeout(()=> b.classList.add('pop'), i*120)
    })
  }

  // --- message sequence (typewriter-like) ---
  const messages = [
    'This is the start of something lovely...',
    'I can’t stop smiling 😊',
    'Thank you for making my day!'
  ]

  function playMessages(){
    if(!messageSeq) return
    messageSeq.innerHTML = ''
    let idx = 0
    function showNext(){
      if(idx >= messages.length) return
      const text = messages[idx++]
      const el = document.createElement('div')
      el.className = 'msg'
      messageSeq.appendChild(el)
      // typewriter
      let i = 0
      const t = setInterval(()=>{
        el.textContent = text.slice(0,i++)
        if(i>text.length){ clearInterval(t); el.classList.add('visible'); setTimeout(showNext, 650) }
      }, 28)
    }
    showNext()
  }

  // Download feature removed — intentionally left out to avoid CORS/file:// issues

  // --- share (navigator.share) ---
  function initShare(){
    if(!shareBtn) return
    shareBtn.addEventListener('click', async ()=>{
      if(navigator.share){
        try{ await navigator.share({ title: 'Valentine', text: 'You made my day!', url: location.href }) }
        catch(e){}
      } else {
        // fallback: copy URL
        try{ await navigator.clipboard.writeText(location.href); alert('Link copied to clipboard') }catch(e){ alert('Share not supported') }
      }
    })
  }

  // --- theme presets ---
  function applyPreset(name){
    document.documentElement.setAttribute('data-preset', name)
    try{ localStorage.setItem('site-preset', name) }catch(e){}
  }
  function initPresets(){
    const presetBox = document.getElementById('theme-presets')
    if(!presetBox) return
    presetBox.addEventListener('click', e =>{
      const btn = e.target.closest('.preset')
      if(!btn) return
      const p = btn.getAttribute('data-preset')
      applyPreset(p)
    })
    // restore stored
    try{ const stored = localStorage.getItem('site-preset'); if(stored) applyPreset(stored) }catch(e){}
  }

  if(yesBtn){
    yesBtn.addEventListener('click', ()=>{
      if(!girlWrap) return
      // reveal and expand card
      if(card) card.classList.add('expanded')
      girlWrap.classList.add('revealed')
      girlWrap.setAttribute('aria-hidden','false')
      animateBadges()
      playMessages()
      triggerConfetti()
      if(card && card.animate){
        card.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.02)' },
          { transform: 'scale(1)' }
        ], { duration: 560, easing: 'cubic-bezier(.2,.9,.2,1)' })
      }
      if(card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  initShare(); initPresets();

  // ensure initial placement after images/fonts load
  // HEARTS: pop small hearts from corners while pointer is inside the card
  const card = document.getElementById('card')
  let heartInterval = null
  let heartsWrapper = null

  function ensureWrapper(){
    if(!card) return
    heartsWrapper = card.querySelector('.hearts-wrapper')
    if(!heartsWrapper){
      heartsWrapper = document.createElement('div')
      heartsWrapper.className = 'hearts-wrapper'
      card.appendChild(heartsWrapper)
    }
  }

  function spawnHeart(){
    if(!heartsWrapper) return
    const heart = document.createElement('span')
    heart.className = 'heart'
    heart.textContent = '❤'
    const size = 12 + Math.floor(Math.random()*16)
    heart.style.fontSize = size + 'px'
    const colors = ['#ff6b81','#ff87c3','#ffb4d9','#ff7ab6']
    heart.style.color = colors[Math.floor(Math.random()*colors.length)]
    // choose a corner to pop from
    const corner = Math.floor(Math.random()*4)
    heart.style.left = ''
    heart.style.right = ''
    heart.style.top = ''
    heart.style.bottom = ''
    if(corner===0){ heart.style.left = '12px'; heart.style.top = '12px' }
    else if(corner===1){ heart.style.right = '12px'; heart.style.top = '12px' }
    else if(corner===2){ heart.style.left = '12px'; heart.style.bottom = '12px' }
    else { heart.style.right = '12px'; heart.style.bottom = '12px' }
    heartsWrapper.appendChild(heart)
    // remove element after animation completes
    setTimeout(()=>{ if(heart.parentNode) heart.parentNode.removeChild(heart) }, 1000)
  }

  function startHearts(){
    ensureWrapper()
    if(heartInterval) return
    spawnHeart()
    heartInterval = setInterval(spawnHeart, 180)
  }

  function stopHearts(){
    if(heartInterval) clearInterval(heartInterval)
    heartInterval = null
    if(heartsWrapper) heartsWrapper.innerHTML = ''
  }

  if(card){
    card.addEventListener('mouseenter', startHearts)
    card.addEventListener('mouseleave', stopHearts)
  }

  window.addEventListener('load', placeInitial)
  window.addEventListener('resize', placeInitial)
})();
