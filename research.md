// _rqId s'incrémente automatiquement à chaque requête sur le site
validerConnexion('contrat.ZoomerContratOFactures.go?_rqId_=10&act=consulterFactureDuplicata&selIdmesFacturesExtrait=4063345800')


validerConnexion('contrat.ZoomerContratOFactures.go?_rqId_=10&act=consulterFactureDuplicata&selIdmesFacturesExtrait=3083992347')


validerConnexion('contrat.ZoomerContratOFactures.go?_rqId_=10&act=consulterFactureDuplicata&selIdmesFacturesExtrait=3072084418')


function validerConnexion(lien){
  window.location.href=lien;
  soumis=true;
}
