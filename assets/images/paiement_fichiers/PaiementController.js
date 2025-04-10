/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'use strict';
var App;
var appUrl;
App.controller('paiementController', ['$scope', 'GenericService', 'PropagationService', '$rootScope', function ($scope, GenericService, PropagationService, $rootScope) {
        const urlDeBase = appUrl + "operations/api/paiement";

        const  loadMoyenPaiementURL = urlDeBase + "/loadMoyenPaiement";
        const  exporterUrl = urlDeBase + "/export";
        const  executerPaiementURL = urlDeBase + "/a-executer";
        const  decoderURL = urlDeBase + "/decoder";
        const  savePaymentURL = urlDeBase + "/a-executer";
        const  initUrl = urlDeBase + "/init";

        $scope.paiementDTO = {
            successUrl: null,
            cancelUrl: null,
            notificationUrl: null,
            encaissementDTO: {
                id: null,
                ide: null,
                numeroTransaction: null,
                dateTransaction: null,
                dateTransactionLibelle: null,
                ideTiers: null,
                moyenPaiement: {},
                libelleMoyenPaiement: null,
                montantTotal: 0,
                ideBeneficiaire: null,
                idPartenaire: null,
                identiteBeneficiaire: {},
                idTypeTransaction: null,
                libelleTransaction: null,
                idDevise: null,
                libelleDevise: null,
                idStatut: null,
                libelleStatut: null,
                preuvePaiement: {},
                listDetailEncaissement: []
            }
        };
        $scope.identiteTiers = {};


        $scope.moyenPaiement = [];
        $scope.modeConsultation = false;
        $scope.modeHideFrame = false;

        $scope.data = $("#data").val();

        $scope.loadMoyenPaiement = function () {
            GenericService.getCustomize(loadMoyenPaiementURL)
                    .then(
                            function (data) {
                                if (data.listMoyenPaiement) {
                                    $scope.moyenPaiement = angular.copy(data.listMoyenPaiement);
                                }
                            },
                            function () {
                            }
                    );
        };
        $scope.decoderData = function (data) {
            if (data != null || data != '') {
                GenericService.getCustomize(decoderURL + "?data=" + data)
                        .then(
                                function (data) {
                                    $scope.paiementDTO.encaissementDTO = data.encaissementDTO;
//                                    console.log("OBJECT " + JSON.stringify(data.encaissementDTO));
                                    $scope.identiteTiers = angular.copy(data.encaissementDTO.identiteTiers);
                                },
                                function () {
                                }
                        );
            }

        };

        function utf8_to_b64(str) {
            return window.btoa(unescape(encodeURIComponent(str)));
        }

        function b64_to_utf8(str) {
            return decodeURIComponent(escape(window.atob(str)));
        }


        $scope.paymentValidate = function (paiement) {
            GenericService.post(executerPaiementURL, angular.toJson(paiement))
                    .then(
                            function (data) {
                       
                                
//                                console.log("DEVISE " + JSON.stringify(paiement.encaissementDTO.idDevise))
//                                if (data.success && data.reference_number != null ) {
                                if (data.success && data.reference_number != null && data.url_process != "#") {
                                    $scope.modeConsultation = data.success;
//                                    console.log("paiement.encaissementDTO.moyenPaiement " + JSON.stringify(paiement.encaissementDTO.moyenPaiement));
                                    if (paiement.encaissementDTO.moyenPaiement != null) {
//                                    if (paiement.encaissementDTO.moyenPaiement != null && ((paiement.encaissementDTO.moyenPaiement.id == "CB_BANK") ||
//                                            (paiement.encaissementDTO.moyenPaiement.id == "CB_FLOOZ") || (paiement.encaissementDTO.moyenPaiement.id == "CB_AFL")
//                                            || (paiement.encaissementDTO.moyenPaiement.id == "CB_TMONEY")) && paiement.encaissementDTO.montantTotal != null) {
                                        $("#modalId").hide();
                                        $scope.modeHideFrame = true;
//                                        console.log("DATA " + JSON.stringify($scope.identiteTiers))
//                                        console.log("UUID " + JSON.stringify(paiement.encaissementDTO))
                                        var payementObject = {
                                            total: paiement.encaissementDTO.montantTotal,
                                            reference_number: data.reference_number,
                                            successUrl: (paiement.encaissementDTO.successUrl != undefined ? paiement.encaissementDTO.successUrl : null),
                                            cancelUrl: (paiement.encaissementDTO.cancelUrl != undefined ? paiement.encaissementDTO.cancelUrl : null),
                                            notificationUrl: (paiement.encaissementDTO.notificationUrl != undefined ? paiement.encaissementDTO.notificationUrl : null),
                                            client: $scope.identiteTiers,
                                            devise: paiement.encaissementDTO.idDevise,
                                            transactionUUID:paiement.encaissementDTO.transactionUUID,
                                            partenaire:paiement.encaissementDTO.idPartenaire
                                        
                                        };
//                                        console.log("URI " + paiement.encaissementDTO.moyenPaiement.description);
//                                        $("#pboxframe").attr('src', paiement.encaissementDTO.moyenPaiement.description + "?data=" + utf8_to_b64(JSON.stringify(payementObject))); // Cybersource URL
                                        console.log("URI " + data.url_process);
                                        
                                        $scope.initEncai(payementObject,data.url_process);

//window.location=data.url_process + "?data=" + utf8_to_b64(JSON.stringify(payementObject));

                                    } else {
                                        $("#modalId").show();
                                        $scope.modeHideFrame = false;
                                    }
                                }
                            },
                            function (errResponse) {
                            }
                    );
        };

        $scope.init = function () {
            $scope.loadMoyenPaiement();
//            console.log("========================= DATA ========================= " + $scope.data);
            if ($scope.data != null || $scope.data != "") {
                $scope.decoderData($scope.data);
            }
        };
        $scope.init();
        
          $scope.initEncai = function (input,url_process) {
           
                GenericService.post(initUrl,input)
                        .then(
                                function (data) {
                                    
                                   $("#pboxframe").attr('src', url_process + "?data="+data.key); // Cybersource URL
                                        $("#pboxframe").width("850");
                                        $("#pboxframe").height("500");
                                },
                                function () {
                                }
                        );
            

        };
    }]);
