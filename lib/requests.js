const { signin, requestFactory } = require('cozy-konnector-libs')
const path = require('path')

/*
 * One of their intermediary CA certificate is missing in their chain resulting
 * in failed SSL verifications and HTTPS requests.
 * To solve this, we manually add this certificate to the chain.
 */
const rootCas = require('ssl-root-cas/latest').create()
rootCas.addFile(
  path.join(
    __dirname,
    'Intermediate-GlobalSign-OrganisationSSL-RSA-SHA2-primary.pem'
  )
)
require('https').globalAgent.options.ca = rootCas

let request = require('request-promise')
const jar = request.jar()
request = requestFactory({
  debug: true,
  cheerio: true,
  json: false,
  jar: true
})
request.jar(jar)

const baseUrl = 'https://monagence.geg.fr/aelPROD/jsp/arc/habilitation'

module.exports = {
  jar,
  request,
  baseUrl,
  formContent,
  login,
  openContract,
  openBills
}

function login(fields) {
  return signin({
    url: `${baseUrl}/login.jsp`,
    formSelector: 'form[name="theForm"]',
    formData: { lg: fields.login, psw: fields.password },
    validate: validate
  })
}

function validate(statusCode, $) {
  const error = $('.errorMessage')
  return !(error.length >= 1 && error.html().trim() !== '')
}

function openContract($, index) {
  const [action, inputs, selects] = formContent($, $('form[name=theForm]'))
  inputs.contrats = selects.contrats[index + 1]
  inputs.act = 'afficherServicesEnLigneAssocies'

  return post(`${baseUrl}/${action}`, inputs)
}

function openBills($) {
  const [action, inputs] = formContent($, $('form[name=theForm]'))
  inputs.act = 'consulterFactures'
  return post(`${baseUrl}/${action}`, inputs)
}

//const contracts = []

//const getContracts = function ($) {
//  const [action, inputs, selects] = formContent($, $('form[name=theForm]'))
//  // First item is default and empty choice
//  contracts = selects.contrats.slice(1)
//  return contracts
//}

function formContent($, $form) {
  const action = $form.attr('action')
  const inputs = {}
  const selects = {}
  $form.find('input').each(function() {
    inputs[$(this).attr('name')] = $(this).attr('value')
  })
  $form.find('select').each(function() {
    const name = $(this).attr('name')
    inputs[name] = ''
    selects[name] = []
    $(this)
      .find('option')
      .each(function() {
        selects[name].push($(this).attr('value'))
      })
  })
  return [action, inputs, selects]
}

function post(uri, inputs) {
  return request({
    uri: uri,
    method: 'POST',
    form: {
      ...inputs
    }
  })
}
