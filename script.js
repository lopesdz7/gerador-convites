// =========================================================
// Convida · Gerador de convites
// =========================================================

const MAX_COVER_SIZE = 5 * 1024 * 1024 // 5 MB
const THEME_IMAGES = {
  festa: './assets/themes/festa.svg',
  corporativo: './assets/themes/corporativo.svg',
  natureza: './assets/themes/natureza.svg',
  elegante: './assets/themes/elegante.svg',
  tech: './assets/themes/tech.svg',
}

const form = document.querySelector('#event-form')
const formAlert = document.querySelector('#form-alert')

const locationInput = document.querySelector('#location')
const locationLabel = document.querySelector('#location-label')
const descriptionInput = document.querySelector('#description')
const descriptionCount = document.querySelector('#description-count')
const phoneInput = document.querySelector('#phone')

const coverInput = document.querySelector('#cover')
const coverName = document.querySelector('#cover-name')
const coverRemove = document.querySelector('#cover-remove')
const customThumb = document.querySelector('#custom-thumb')
const customThemeRadio = document.querySelector('input[name="theme"][value="custom"]')

const previewEmpty = document.querySelector('#preview-empty')
const previewActions = document.querySelector('#preview-actions')
const invite = document.querySelector('#invite')

let coverUrl = null // URL temporária da imagem enviada
let submitted = false // depois do 1º envio, valida enquanto o usuário digita

// =========================================================
// Validação
// =========================================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function onlyDigits(value) {
  return value.replace(/\D/g, '')
}

// Cada regra recebe os dados do formulário e retorna a mensagem de erro (ou '')
const validators = {
  title: ({ title }) => {
    if (!title) return 'Informe o título do evento.'
    if (title.length < 3) return 'O título precisa ter pelo menos 3 caracteres.'
    return ''
  },
  start: ({ start }) => (start ? '' : 'Informe a data e hora de início.'),
  end: ({ start, end }) => {
    if (!end) return 'Informe a data e hora de término.'
    if (start && new Date(end) <= new Date(start)) return 'O fim precisa ser depois do início.'
    return ''
  },
  type: ({ type }) => (type ? '' : 'Escolha se o evento é presencial ou online.'),
  location: ({ location, type }) => {
    if (location) return ''
    return type === 'online' ? 'Informe o link ou a plataforma do evento.' : 'Informe o local do evento.'
  },
  description: ({ description }) => {
    if (!description) return 'Escreva uma descrição para o evento.'
    if (description.length < 10) return 'A descrição precisa ter pelo menos 10 caracteres.'
    return ''
  },
  email: ({ email }) => {
    if (!email) return 'Informe um e-mail de contato.'
    if (!EMAIL_REGEX.test(email)) return 'Informe um e-mail válido, como nome@email.com.'
    return ''
  },
  phone: ({ phone }) => {
    const digits = onlyDigits(phone)
    if (!digits) return 'Informe um telefone de contato.'
    if (digits.length < 10 || digits.length > 11) return 'Informe um telefone com DDD, como (11) 91234-5678.'
    return ''
  },
  theme: ({ theme }) =>
    theme === 'custom' && !coverUrl ? 'Envie uma imagem de capa para usar o tema “Minha imagem”.' : '',
}

function getFormData() {
  const data = Object.fromEntries(new FormData(form))
  for (const key of Object.keys(data)) {
    if (typeof data[key] === 'string') data[key] = data[key].trim()
  }
  data.style = form.elements.style.checked ? 'dark' : 'light'
  return data
}

function setFieldError(name, message) {
  const field = form.querySelector(`[data-field="${name}"]`)
  const errorEl = document.querySelector(`#${name}-error`)
  if (!field || !errorEl) return

  errorEl.textContent = message
  field.classList.toggle('has-error', Boolean(message))

  field.querySelectorAll('input, textarea').forEach((input) => {
    if (message) input.setAttribute('aria-invalid', 'true')
    else input.removeAttribute('aria-invalid')
  })
}

function validateField(name, data = getFormData()) {
  const message = validators[name](data)
  setFieldError(name, message)
  return message
}

function validateAll() {
  const data = getFormData()
  const invalid = Object.keys(validators).filter((name) => validateField(name, data))
  return { data, invalid }
}

// =========================================================
// Interações do formulário
// =========================================================

// Tipo: troca o rótulo e o placeholder do local
function updateLocationField() {
  const isOnline = form.elements.type.value === 'online'
  locationLabel.firstChild.textContent = isOnline ? 'Link ou plataforma ' : 'Local '
  locationInput.placeholder = isOnline ? 'Ex.: https://meet.google.com/abc-defg-hij' : 'Endereço, salão, cidade…'
}

// Contador de caracteres da descrição
function updateCounter() {
  descriptionCount.textContent = `${descriptionInput.value.length}/${descriptionInput.maxLength}`
}

// Máscara de telefone: (11) 91234-5678 ou (11) 1234-5678
function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Upload da capa
function clearCover() {
  if (coverUrl) URL.revokeObjectURL(coverUrl)
  coverUrl = null
  coverInput.value = ''
  coverName.textContent = 'Nenhum arquivo selecionado'
  coverName.parentElement.classList.remove('has-file')
  coverRemove.hidden = true
  customThumb.style.backgroundImage = ''
  customThumb.classList.remove('has-image')
}

function handleCoverChange() {
  const file = coverInput.files[0]
  setFieldError('cover', '')

  if (!file) {
    clearCover()
    return
  }

  if (!file.type.startsWith('image/')) {
    clearCover()
    setFieldError('cover', 'Escolha um arquivo de imagem (PNG, JPG, WEBP ou GIF).')
    return
  }

  if (file.size > MAX_COVER_SIZE) {
    clearCover()
    setFieldError('cover', 'A imagem precisa ter no máximo 5 MB.')
    return
  }

  if (coverUrl) URL.revokeObjectURL(coverUrl)
  coverUrl = URL.createObjectURL(file)

  coverName.textContent = file.name
  coverName.parentElement.classList.add('has-file')
  coverRemove.hidden = false
  customThumb.style.backgroundImage = `url("${coverUrl}")`
  customThumb.classList.add('has-image')

  // Enviar uma imagem seleciona o tema "Minha imagem"
  customThemeRadio.checked = true
  if (submitted) validateField('theme')
}

// =========================================================
// Geração do convite
// =========================================================
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatPeriod(startValue, endValue) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return `${capitalize(dateFormatter.format(start))} · ${timeFormatter.format(start)} às ${timeFormatter.format(end)}`
  }

  return `${shortDateFormatter.format(start)}, ${timeFormatter.format(start)} até ${shortDateFormatter.format(end)}, ${timeFormatter.format(end)} de ${end.getFullYear()}`
}

function renderInvite(data) {
  invite.style.setProperty('--accent', data.color)
  invite.classList.toggle('is-dark', data.style === 'dark')

  const cover = invite.querySelector('#invite-cover')
  const image = data.theme === 'custom' ? coverUrl : coverUrl || THEME_IMAGES[data.theme]
  cover.style.backgroundImage = `url("${image}")`

  invite.querySelector('#invite-type').textContent = data.type === 'online' ? 'Online' : 'Presencial'
  invite.querySelector('#invite-title').textContent = data.title
  invite.querySelector('#invite-description').textContent = data.description
  invite.querySelector('#invite-date').textContent = formatPeriod(data.start, data.end)
  invite.querySelector('#invite-location').textContent = data.location

  const email = invite.querySelector('#invite-email')
  email.textContent = data.email
  email.href = `mailto:${data.email}`

  const phone = invite.querySelector('#invite-phone')
  phone.textContent = data.phone
  phone.href = `tel:+55${onlyDigits(data.phone)}`

  previewEmpty.hidden = true
  previewActions.hidden = false
  invite.hidden = false

  // Reinicia a animação de entrada a cada novo convite
  invite.style.animation = 'none'
  void invite.offsetWidth
  invite.style.animation = ''
}

function handleSubmit(event) {
  event.preventDefault()
  submitted = true

  const { data, invalid } = validateAll()

  if (invalid.length > 0) {
    formAlert.textContent =
      invalid.length === 1
        ? 'Falta 1 campo para gerar o convite. Confira o campo destacado.'
        : `Faltam ${invalid.length} campos para gerar o convite. Confira os campos destacados.`
    formAlert.hidden = false

    // Leva o usuário até o primeiro campo com erro
    const firstField = form.querySelector(`[data-field="${invalid[0]}"]`)
    const focusable = firstField.querySelector('input:not([type="radio"]), textarea') ??
      firstField.querySelector('input:checked') ??
      firstField.querySelector('input')
    focusable.focus({ preventScroll: true })
    firstField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  formAlert.hidden = true
  renderInvite(data)

  // No mobile o convite fica abaixo do formulário
  if (window.matchMedia('(max-width: 960px)').matches) {
    invite.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// =========================================================
// Eventos
// =========================================================
form.addEventListener('submit', handleSubmit)

form.addEventListener('input', (event) => {
  const { name } = event.target

  if (name === 'phone') event.target.value = maskPhone(event.target.value)
  if (name === 'description') updateCounter()
  if (name === 'type') updateLocationField()

  if (!submitted) return

  if (validators[name]) validateField(name)
  if (name === 'start') validateField('end') // fim depende do início
  if (name === 'type') validateField('location')

  if (!form.querySelector('.has-error')) formAlert.hidden = true
})

// Valida ao sair do campo, mesmo antes de enviar, se algo foi digitado
form.addEventListener('focusout', (event) => {
  const { name, value } = event.target
  if (!submitted && validators[name] && value && event.target.type !== 'radio') {
    validateField(name)
  }
})

form.addEventListener('change', (event) => {
  if (event.target.name === 'theme' && submitted) validateField('theme')
})

coverInput.addEventListener('change', handleCoverChange)

coverRemove.addEventListener('click', () => {
  clearCover()
  if (customThemeRadio.checked) {
    form.querySelector('input[name="theme"][value="festa"]').checked = true
  }
  if (submitted) validateField('theme')
  coverInput.focus()
})

document.querySelector('#print-button').addEventListener('click', () => window.print())

updateCounter()
