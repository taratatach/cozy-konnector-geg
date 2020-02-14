const { URL } = require('url')
const { jar, request, baseUrl, formContent } = require('./requests')
const { getText, parseAmount, parseDate } = require('./utils')

module.exports = {
  inventoryBills,
  save
}

function inventoryBills($) {
  const lines = Array.from($('#tbl_mesFacturesExtrait tbody tr').slice(1, -1))
  return [
    $,
    lines.map(line => {
      const cells = $(line).children('td')
      const actionPath = parseBillPath($($(cells[5]).find('a')))

      return {
        actionPath,
        bill: {
          id: getText($(cells[0])),
          originalDate: parseDate(
            $(cells[1])
              .find('input')
              .val()
          ),
          amount: parseAmount(
            $(cells[3])
              .find('input')
              .val()
          )
        }
      }
    })
  ]
}

function getRequest({ baseUrl, actionPath, reqId }) {
  const url = new URL(actionPath, baseUrl)
  url.searchParams.set('_rqId_', reqId)
  const eFluid = request.cookie('eFluid=4')
  jar.setCookie(eFluid, url)

  return {
    headers: {
      Host: 'monagence.geg.fr',
      referer: `${baseUrl}/acteur.ZoomerDossierClientNouvelleInterface.go`,
      Connection: 'keep-alive',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Upgrade-Insecure-Requests': 1,
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache'
    },
    uri: url
  }
}

function postRequest({ baseUrl, preReq, bill, reqId }) {
  return {
    cheerio: false,
    headers: {
      Host: 'monagence.geg.fr',
      referer: preReq.uri,
      Connection: 'keep-alive',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      //'Content-Type': 'application/x-www-form-urlencoded',
      'Upgrade-Insecure-Requests': 1,
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache'
    },
    method: 'POST',
    form: {
      _nwg_: '',
      act: 'afficherDocument',
      _rqId_: reqId,
      _ongIdx: '',
      _mnLck_: false,
      _startForm_: '',
      sortFieldsmesFacturesExtrait: '',
      sortOrdersmesFacturesExtrait: '',
      actionSortmesFacturesExtrait: '',
      selIdmesFacturesExtrait: '',
      listeDepliee: '',
      listeSize: 1,
      _endForm_: ''
    },
    uri: `${baseUrl}/contrat.ZoomerContratOFactures.go`,
    originalDate: bill.originalDate,
    amount: bill.amount,
    filename: `facture_${bill.id}.pdf`,
    fileurl: `${baseUrl}/contrat.ZoomerContratOFactures.go`
  }
}

function parseBillPath($a) {
  // <a onclick="validerConnexion('--------')" />
  return $a.attr('onclick') ? $a.attr('onclick').split("'")[1] : null
}

// Third arg is folderPath
async function save($, entries) {
  const contents = formContent($, $('form[name=theForm]'))
  const inputs = contents[1]
  let currentReqId = Number(inputs['_rqId_'])

  for (const { actionPath, bill } of entries) {
    const preReq = getRequest({ baseUrl, actionPath, reqId: ++currentReqId })
    await request(preReq)
    setTimeout(async () => {
      const postReq = postRequest({
        baseUrl,
        bill,
        preReq,
        reqId: ++currentReqId
      })
      await request(postReq)
    }, 500)
    //await saveFiles([postReq], { folderPath })
  }
}
