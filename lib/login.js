const { log, requestFactory, saveFiles } = require('cozy-konnector-libs')
const { arrayFrom$row, formatDate, formatName, getText, parseAmount, parseDate } = require('./utils')
const connection = require('./connection')

request = requestFactory({
  debug: true,
  cheerio: true,
  json: false,
  jar: true
})

const baseUrl = 'https://monagence.geg.fr/aelPROD/jsp/arc/habilitation'

module.exports.login = function (fields) {
  const page = 'login.jsp'
  const population = {
    act: 'valider',
    lg: fields.login,
    psw: fields.password
  }

  return connection.init(baseUrl, page, 'form', population, validate, 'cheerio')
}

function validate (statusCode, $) {
  const error = $('.errorMessage')
  return !(error.length >= 1 && error.html().trim() !== '')
}

//const contracts = []

//const getContracts = function ($) {
//  const [action, inputs, selects] = formContent($, $('form[name=theForm]'))
//  // First item is default and empty choice
//  contracts = selects.contrats.slice(1)
//  return contracts
//}

module.exports.openContract = function ($, index) {
  const [action, inputs, selects] = formContent($, $('form[name=theForm]'))
  inputs.contrats = selects.contrats[index + 1]
  inputs.act = 'afficherServicesEnLigneAssocies'

  return post(`${baseUrl}/${action}`, inputs)
}

module.exports.openBills = function ($) {
  const [action, inputs, selects] = formContent($, $('form[name=theForm]'))
  inputs.act = 'consulterFactures'
  return post(`${baseUrl}/${action}`, inputs)
}

module.exports.inventoryBills = function($) {
  const entries = []
  const table = $('form[name=theForm] tbody tr').slice(1)
  table.each(function () {
    const cells = $(this).children('td')
    const fileurl = parseFileurl($($(cells[5]).find('a')))
    const row = Array.from(cells).map(cell => getText($(cell)))
    entries.push(parseEntry(fileurl, row))
  })
  console.log(entries)
  return entries
}

module.exports.save = function (entries, folderPath) {
  saveFiles(entries, { folderPath: folderPath })
}

function parseEntry (fileurl, row) {
  return {
    requestOptions: { 
      headers: {
        referer: `${baseUrl}/acteur.ZoomerDossierClientNouvelleInterface.go`,
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3'
      }
    },
    originalDate: parseDate(row[1]),
    amount: parseAmount(row[3]),
    filename: `facture_${row[0]}.pdf`,
    fileurl: fileurl
  }
}

function parseFileurl ($a) {
  // <a onclick="validerConnexion('--------')" />
  const action = $a.attr('onclick').split(`'`)[1]
  return `${baseUrl}/${action}`
}

function formContent ($, $form) {
  const action = $form.attr('action')
  const inputs = {}
  const selects = {}
  $form.find('input').each(function () {
    inputs[$(this).attr('name')] = $(this).attr('value')
  })
  $form.find('select').each(function () {
    const name = $(this).attr('name')
    inputs[name] = ''
    selects[name] = []
    $(this).find('option').each(function () {
      selects[name].push($(this).attr('value'))
    })
  })
  return [action, inputs, selects]
}

function post (uri, inputs) {
  return request({
    uri: uri,
    method: 'POST',
    form: {
      ...inputs
    }
  })
}
