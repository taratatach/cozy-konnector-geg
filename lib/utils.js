function arrayFrom$row($, $row) {
  return Array.from($row).map(cell => getText($(cell)))
}

function formatDate(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) {
    month = '0' + month
  }
  if (day < 10) {
    day = '0' + day
  }

  return `${year}${month}${day}`
}

function formatName(lastFirstName) {
  let fullName = lastFirstName
    .replace(/\s+/, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase())
    .split(' ')

  let firstName = fullName.pop()
  fullName.unshift(firstName)
  return fullName.join(' ')
}

function getText($cell) {
  return $cell.text().trim()
}

function parseAmount(amount) {
  return parseFloat(amount.replace(',', '.'))
}

function parseDate(text) {
  return new Date(...text.split('/').reverse())
}

module.exports = {
  arrayFrom$row,
  formatDate,
  formatName,
  getText,
  parseAmount,
  parseDate
}
