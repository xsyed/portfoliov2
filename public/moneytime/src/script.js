// Money → Time Calculator
(function(){
  const LS_KEY = 'mtt_annual_income'
  const THEME_KEY = 'mtt_theme_pref' // 'light' | 'dark' | null (null = follow OS)

  // Elements
  const annualDisplay = document.getElementById('annual-display')
  const editBtn = document.getElementById('edit-income')
  const incomeForm = document.getElementById('income-form')
  const annualInput = document.getElementById('annual-input')
  const cancelIncome = document.getElementById('cancel-income')
  const purchaseInput = document.getElementById('purchase-input')
  const calcBtn = document.getElementById('calc-btn')
  const resultEl = document.getElementById('result')
  const themeToggle = document.getElementById('theme-toggle')

  // Helpers
  function moneyFmt(n){
    if (n == null || isNaN(n)) return '—'
    return n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2})
  }

  function loadAnnual(){
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const v = Number(raw)
    return isFinite(v) ? v : null
  }

  function saveAnnual(v){
    if (v == null || !isFinite(v)) return
    localStorage.setItem(LS_KEY, String(v))
  }

  function calcRates(annual){
    const monthly = annual / 12
    const biweekly = annual / 26
    const hourly = annual / (52 * 40)
    return {monthly,biweekly,hourly}
  }

  // Convert total hours into best unit per PRD rules
  function formatWorkTime(hours){
    if (!isFinite(hours)) return '—'

    // Business time units:
    // 1 business day = 8 hours
    // 1 business week = 5 business days
    // 1 month = 4 weeks
    // 1 year = 12 months

    const HOUR = 1
    const DAY = 8 * HOUR
    const WEEK = 5 * DAY
    const MONTH = 4 * WEEK
    const YEAR = 12 * MONTH

    let remaining = Math.max(0, hours)
    const parts = []

    const years = Math.floor(remaining / YEAR)
    if (years) {
      parts.push(years + ' year' + (years !== 1 ? 's' : ''))
      remaining -= years * YEAR
    }

    const months = Math.floor(remaining / MONTH)
    if (months) {
      parts.push(months + ' month' + (months !== 1 ? 's' : ''))
      remaining -= months * MONTH
    }

    const weeks = Math.floor(remaining / WEEK)
    if (weeks) {
      parts.push(weeks + ' week' + (weeks !== 1 ? 's' : ''))
      remaining -= weeks * WEEK
    }

    const days = Math.floor(remaining / DAY)
    if (days) {
      parts.push(days + ' day' + (days !== 1 ? 's' : ''))
      remaining -= days * DAY
    }

    // For sub-day remainder, show hours/minutes/seconds as appropriate
    if (remaining >= 1){
      const hrs = Math.floor(remaining)
      parts.push(hrs + 'h')
      remaining -= hrs
    }

    if (remaining > 0){
      const minutes = Math.floor(remaining * 60)
      if (minutes) {
        parts.push(minutes + 'm')
        remaining -= minutes / 60
      }
      const seconds = Math.round(remaining * 3600)
      if (seconds) parts.push(seconds + 's')
    }

    if (parts.length === 0) return '0h'
    return parts.join(', ')
  }

  function renderAnnual(){
    const a = loadAnnual()
    if (a == null){
      annualDisplay.textContent = 'Not set'
    } else {
      annualDisplay.textContent = moneyFmt(a)
    }
  }

  // Theme helpers
  function loadThemePref(){
    // null => follow OS
    const raw = localStorage.getItem(THEME_KEY)
    if (!raw) return null
    return raw === 'dark' ? 'dark' : raw === 'light' ? 'light' : null
  }

  function saveThemePref(v){
    if (v === null) {
      localStorage.removeItem(THEME_KEY)
    } else if (v === 'dark' || v === 'light'){
      localStorage.setItem(THEME_KEY, v)
    }
  }

  function applyTheme(theme){
    const root = document.documentElement
    if (theme === 'dark'){
      root.classList.remove('theme-light')
      root.classList.add('theme-dark')
      if (themeToggle) themeToggle.setAttribute('aria-pressed','true')
      if (themeToggle) themeToggle.textContent = 'Dark'
    } else if (theme === 'light'){
      root.classList.remove('theme-dark')
      root.classList.add('theme-light')
      if (themeToggle) themeToggle.setAttribute('aria-pressed','false')
      if (themeToggle) themeToggle.textContent = 'Light'
    } else {
      // follow OS: remove explicit classes so CSS media query applies
      root.classList.remove('theme-dark','theme-light')
      if (themeToggle) themeToggle.setAttribute('aria-pressed','false')
      // Show label matching current OS theme so user knows what will be applied
      if (themeToggle) {
        const os = detectOSTheme()
        themeToggle.textContent = os === 'dark' ? 'Dark' : 'Light'
      }
    }
  }

  function detectOSTheme(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Initialize theme on load
  (function initTheme(){
    const pref = loadThemePref()
    if (pref) applyTheme(pref)
    else applyTheme(null) // rely on CSS media query / OS

    // Keep in sync if OS preference changes and user hasn't set an override
    if (window.matchMedia){
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener && mq.addEventListener('change', (e)=>{
        const currentPref = loadThemePref()
        if (!currentPref) applyTheme(e.matches ? 'dark' : 'light')
      })
    }

    // Wire toggle button
    if (themeToggle){
      themeToggle.addEventListener('click', ()=>{
        const current = loadThemePref()
        if (current === 'dark'){
          // switch to light
          saveThemePref('light')
          applyTheme('light')
        } else if (current === 'light'){
          // clear preference -> follow OS
          saveThemePref(null)
          applyTheme(null)
        } else {
          // no pref (following OS) -> toggle to opposite of OS
          const os = detectOSTheme()
          const next = os === 'dark' ? 'light' : 'dark'
          saveThemePref(next)
          applyTheme(next)
        }
      })
    }
  })()

  function showIncomeForm(show){
    if (show){
      incomeForm.setAttribute('aria-hidden','false')
      incomeForm.style.display = 'flex'
      annualInput.focus()
    } else {
      incomeForm.setAttribute('aria-hidden','true')
      incomeForm.style.display = 'none'
    }
    // Recompute stacked offsets because the income card height may have changed
    if (typeof updateStackedOffsets === 'function') {
      // run after paint to get accurate heights
      requestAnimationFrame(updateStackedOffsets)
      setTimeout(updateStackedOffsets, 120)
    }
  }

  // Main calculate using current saved income
  function calculate(){
    const annual = loadAnnual()
    if (annual == null){
      resultEl.textContent = 'Please set your annual income first.'
      return
    }

    const purchase = Number(purchaseInput.value)
    if (!isFinite(purchase) || purchase <= 0){
      resultEl.textContent = 'Enter a positive purchase amount.'
      return
    }

    const {hourly} = calcRates(annual)
    const totalHours = purchase / hourly

    const formatted = formatWorkTime(totalHours)

    resultEl.innerHTML = `<strong>${formatted}</strong> — equivalent to ${moneyFmt(hourly)} / hour` // eslint-disable-line
  }

  // Wire events
  editBtn.addEventListener('click',()=>{
    const a = loadAnnual()
    annualInput.value = a != null ? String(a) : ''
    showIncomeForm(true)
  })

  cancelIncome.addEventListener('click',()=>{
    showIncomeForm(false)
  })

  incomeForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    const v = Number(annualInput.value)
    if (!isFinite(v) || v <= 0){
      alert('Please enter a positive number for annual income.')
      return
    }
    saveAnnual(v)
    showIncomeForm(false)
    renderAnnual()
    // re-run calculation if there's a purchase entered
    if (purchaseInput.value) calculate()
  // Recompute offsets after saving annual income (form collapsed)
  if (typeof updateStackedOffsets === 'function') requestAnimationFrame(updateStackedOffsets)
  })

  calcBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    calculate()
  })

  purchaseInput.addEventListener('keyup',(e)=>{
    // Enter triggers
    if (e.key === 'Enter') calculate()
  })

  // Initialize
  renderAnnual()

  // --- Mobile stacked positioning ---
  // Measure heights and set inline offsets so the income-card sits above the calculator-card
  // without overlap on small screens. This is more reliable than fixed CSS estimates.
  function updateStackedOffsets(){
    try {
      const mq = window.matchMedia('(max-width: 640px)')
      const calc = document.querySelector('.calculator-card')
      const income = document.querySelector('.income-card')
      const header = document.querySelector('.header')
      if (!calc || !income || !header) return

      // Clear inline styles first
      calc.style.removeProperty('bottom')
      income.style.removeProperty('bottom')
      header.style.removeProperty('bottom')

      if (!mq.matches) {
        // Not a small screen -> let CSS handle layout
        calc.style.position = ''
        income.style.position = ''
        header.style.position = ''
        return
      }

      // Ensure elements are visually measured by temporarily making them position: fixed
      // so offsets are computed reliably.
      calc.style.position = 'fixed'
      calc.style.left = '12px'
      calc.style.right = '12px'
      calc.style.zIndex = '50'

      // Use getBoundingClientRect to get rendered heights
      const calcRect = calc.getBoundingClientRect()
      const calcHeight = Math.ceil(calcRect.height)

      // Place calculator at safe-area bottom + small gap
      const safeInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-inset-bottom') || 0, 10)
      // Fallback to env() via CSS if not available; use 12px gap
      const bottomGap = 12
      calc.style.bottom = `calc(env(safe-area-inset-bottom, 12px) + ${bottomGap}px)`

      // Position income above calculator
      income.style.position = 'fixed'
      income.style.left = '12px'
      income.style.right = '12px'
      income.style.zIndex = '48'
      income.style.bottom = `calc(env(safe-area-inset-bottom, 12px) + ${bottomGap}px + ${calcHeight}px + ${bottomGap}px)`

      // Position header above the income card
      const incomeRect = income.getBoundingClientRect()
      const incomeHeight = Math.ceil(incomeRect.height)
      header.style.position = 'fixed'
      header.style.left = '12px'
      header.style.right = '12px'
      header.style.zIndex = '46'
      header.style.bottom = `calc(env(safe-area-inset-bottom, 12px) + ${bottomGap}px + ${calcHeight}px + ${bottomGap}px + ${incomeHeight}px + ${bottomGap}px)`
      // Measure header height now that it's fixed
      const headerRect = header.getBoundingClientRect()
      const headerHeight = Math.ceil(headerRect.height)

      // Compute total stacked height (calculator + income + header + gaps)
      const totalStack = calcHeight + incomeHeight + headerHeight + (bottomGap * 4)

      // Set app bottom padding so page content isn't covered by the fixed stack
      const appEl = document.querySelector('.app')
      if (appEl) {
        // Use env() for safe area and add totalStack as pixels
        appEl.style.paddingBottom = `calc(env(safe-area-inset-bottom, 12px) + ${totalStack}px)`
      }
    } catch (err) {
      // If anything goes wrong, don't block site functionality
      console.warn('updateStackedOffsets failed', err)
    }
  }

  // Run on load and on resize/orientation change
  window.addEventListener('load', updateStackedOffsets)
  window.addEventListener('resize', () => {
    // debounce simple resize events
    clearTimeout(window.__mtt_resize)
    window.__mtt_resize = setTimeout(updateStackedOffsets, 120)
  })
  window.addEventListener('orientationchange', () => setTimeout(updateStackedOffsets, 200))
})();
