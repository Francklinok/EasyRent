/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';
/*
 * Generic basic services
 */
var App;
App.factory('PropagationService', ['$rootScope', function ($rootScope) {
        var ligneBudgetaireObject = {idLigneBudgetaire: null, libelleAndEncodeKeyLigneBudgetaire: null, libelleLigneBudgetaire: null, cleLigneBudgetaire: null,
            idNomenclature: null, imputable: false, hasClassification: false};
        var classificationObject = {idClassification: null, libelleClassification: null, parentClassification: null};
        var associationLigneBudgetaireCompteObject = {ligneBudObject: null, compteObject: null};
        var listValeurIndicateur = [];
        var ob = {};
        var loi = {add: false, view: false, selectedTypeLoi: null};
        var operation = {end: false};
        var listRoleMetierObject = [];
        var roleMetierObject = {};
        var roleMetierObjectApplied = {};
        var object = null;
        var classificationId = null;
        var idLigneBudgetaire = null;
        var objectSender = {booleanSender: false, idModePaiementByProc: null, ordonnateurId: null, idCompte: null, idCompteDepot: null};
        var labelObject = {id: null, libelle: null, autre: null};
        var listTypePiece = [];
        var operationCompleted = {typeProcedure: null};
        var tiersObject = {tiers: {}, adressetTiersObject: {}, function: null};
//        var procedureDepensePieceObject = {};
        var procedureDepensePieceObject = {id: null, libelle: null, autre: null};
        var tiersJustificatifFile = {myFile: null};
        var budgetPieceObject = {id: null, libelle: null, autre: null};
        var bordereauDepensePieceObject = {id: null, libelle: null, autre: null};
        var previsionEnVigeurDepensePieceObject = {id: null, libelle: null, autre: null};
        var contextAffichageDepensePieceObject = {famille: null, intention: null};
        var contextAffichageDepensePieceObjectPaiement = {famille: null, intention: null, pieceObject: {}, tiersPaiementUse: {}};
        var depensePieceOperationSuccesObject = {famille: null, bordereau: null};
        var depensePieceObject = {piece: null};
        var tiersDepensePieceObject = {piece: null};
        var tiersDepensePieceObjectInfoRegul = {idPaiement: null, idRubrique: null, idProcedure: null};
        var tiersPayementPieceObject = {piece: null};
        var tiersEcriturePieceObject = {piece: null};
        var procedureDepenseDetailObject = {id: null, type: null};
        var documentObject = {idObject: null, id: null, idBordereau: null, fonction: null};
        var procedureParameterObject = {typeProcedure: null};
        var pieceObject = {};
        var ecritureObject = {};
        var paiementObject = {intention: null, paiementDTO: {}, fonctionAppelante: null, dateRef: null};
        var paiementPieceObject = {intention: null, paiementDTO: {}, fonctionAppelante: null, dateRef: null};
        var detailPaiementWithId = {id: null, showButton: false};
        var detailPieceWithId = {id: null, intention: null, paramRegularissation: 0};
        var detailEcritureWithId = {id: null};
        var paiementSavedSuccesObject = {id: null, idPiece: null};
        var idObjetSourceSuccess = {idObjetSource: null};
        var tiersSimplifierObject = {modeAjout: null, modeEdit: null};
        var tiersId = {id: null};
        var tiersAndType = {id: null, typeId: null, idRef: null, tiers: null, interne: null};
        var clearTierCompteList = {doIt: false};
        var badgeAffected = null;
        var docObjectFile = null;
        var hideGetWayButton = null;
        var usage = {};
        var lbUsageObject = null;
        var compteObjectForGeneration = {};
        var instructionObject = {};
        var paiementDTOFromPaiement = {};
        var listIdLigne = [];
        var instructionData = {};
        var reservationCreditObject = {};
        var ecritureAbondementObject = {id: null, reference: null, objet: null};
        var infoPaiementRegul = {idPaiement: null, idRubrique: null};
        var articleObject = {id: null, methodeValorisation: null};
        var articleAddObjectSend = {idObjetAdd: null, idArticle: null, numCmd: null, sensMouvement: null};
//        var cateOperation = {id: null, categorieOperation: null};
        var cateOperation = {id: null, applicabilite: null, typeInstruction: null, categorieOperation: null};

        var rejetBancaireObject = {paiementDTO: {}, workflowObject: {}, executerCode: null, idRejet: null, fraisBancaire: 0};

        var objectToJointPiece = {};
        var objectPjDidocToAbs = {};
        var commentaireObject = {libelleAction: null, commentaire: null, commentaire_anonyme: false, processFinished: false, commentRequired: false, modalId: ''};
        var transfertObject = {idObjetSource: null, codeObjetTransfert: null};
        var detailBordereauTransfertWithId = {id: null, modifAuthorised: true};
        var conventionRequestObject = {id: null};
        var conventionResponseObject = {id: null, statut: null};
        var pieceObjectForBatch = {id: null};
        var detailRubriqueWithId = {id: null};
        var synthesePieceTiersInfo = {idTiers: null, idPiece: null, idModePaiement: "", idCompte: ""};
        return {
            setRejetBancaireObject: function (paimentDTO, workflowObject, executerCode, idRejet, fraisBancaire) {
                rejetBancaireObject.paiementDTO = paimentDTO;
                rejetBancaireObject.workflowObject = workflowObject;
                rejetBancaireObject.executerCode = executerCode;
                rejetBancaireObject.idRejet = idRejet;
                rejetBancaireObject.fraisBancaire = fraisBancaire;
                $rootScope.$broadcast("rejetProcess");
            },
            getRejetBancaireObject: function () {
                return rejetBancaireObject;
            },
            setLigneBudgetaireObject: function (ligneObject) {
                ligneBudgetaireObject.idLigneBudgetaire = ligneObject.idLigneBudgetaire;
                ligneBudgetaireObject.libelleAndEncodeKeyLigneBudgetaire = ligneObject.libelleAndEncodeKeyLigneBudgetaire;
                ligneBudgetaireObject.libelleLigneBudgetaire = ligneObject.libelleLigneBudgetaire;
                ligneBudgetaireObject.cleLigneBudgetaire = ligneObject.cleLigneBudgetaire;
                ligneBudgetaireObject.idNomenclature = ligneObject.idNomenclature;
                ligneBudgetaireObject.imputable = ligneObject.imputable;
                ligneBudgetaireObject.hasClassification = ligneObject.hasClassification;
                $rootScope.$broadcast("updates");
            },
            getLigneBudgetaireObject: function () {
                return ligneBudgetaireObject;
            },
            setClassificationObject: function (classification) {
                classificationObject.idClassification = classification.idClassification;
                classificationObject.libelleClassification = classification.libelleClassification;
                classificationObject.parentClassification = classification.parentClassification;
                $rootScope.$broadcast("updatesClassification");
            },

            getClassificationObject: function () {
                return classificationObject;
            },
            setClassificationId: function (id) {
                classificationId = id;
                $rootScope.$broadcast("classsificationIdSend");
            },

            getClassificationId: function () {
                return classificationId;
            },
            setObjectSender: function (b, idModePaiement, ordoId, idCompte, idCompteDepot) {
                objectSender.booleanSender = b;
                objectSender.idModePaiementByProc = idModePaiement;
                objectSender.ordonnateurId = ordoId;
                objectSender.idCompte = idCompte;
                objectSender.idCompteDepot = idCompteDepot;
                $rootScope.$broadcast("booleanSender");
            },

            getObjectSender: function () {
                return objectSender;
            },
            setLabelObject: function (id, libelle, autre) {
                labelObject.id = id;
                labelObject.libelle = libelle;
                labelObject.autre = autre;
                $rootScope.$broadcast("labelObjectSender");
            },

            getLabelObject: function () {
                return labelObject;
            },
            setIdLigneBudgetaire: function (id) {
                idLigneBudgetaire = id;
                $rootScope.$broadcast("idLigneBudgetaireSend");
            },

            getIdLigneBudgetaire: function () {
                return idLigneBudgetaire;
            },
            setAssociationLigneBudgetaireCompteObject: function (associationLigneBudgetaireCompte) {
                associationLigneBudgetaireCompteObject = angular.copy(associationLigneBudgetaireCompte);
                $rootScope.$broadcast("sendingAssociationLigneCompteData");
            },

            getAssociationLigneBudgetaireCompteObject: function () {
                return associationLigneBudgetaireCompteObject;
            },
            setListValeurIndicateur: function (list) {
                listValeurIndicateur = list;
                $rootScope.$broadcast("updatesvaleur");
            },
            getListValeurIndicateur: function () {
                return listValeurIndicateur;
            },
            setOperation: function (booleanValue) {
                operation.end = booleanValue;
                $rootScope.$broadcast("operationState");
            },
            getOperation: function () {
                return operation;
            },
            setObject: function (obj) {
                ob = obj;
                $rootScope.$broadcast("objectSend");
            },
            getObject: function () {
                return ob;
            },
            setListRoleMetierObject: function (listObject) {
                listRoleMetierObject = listObject;
                $rootScope.$broadcast("sendRoleMetier");
            },
            getListRoleMetierObject: function () {
                return listRoleMetierObject;
            },
            setRoleMetierObject: function (object) {
                roleMetierObject = object;
                $rootScope.$broadcast("sendRoleMetierObject");
            },
            getRoleMetierObject: function () {
                return roleMetierObject;
            },
            setRoleMetierObjectApplied: function (object) {
                roleMetierObjectApplied = object;
                $rootScope.$broadcast("sendRoleMetierObjectApplied");
            },
            getRoleMetierObjectApplied: function () {
                return roleMetierObjectApplied;
            },
            setAction: function (loiObject) {
                loi = loiObject;
                $rootScope.$broadcast("addLoiFromPrevision");
            },
            getAction: function () {
                return loi;
            },
            setListTypePiece: function (listTypePieceObject) {
                listTypePiece = listTypePieceObject;
                $rootScope.$broadcast("listTypePieceReceived");
            },
            getListTypePiece: function () {
                return listTypePiece;
            },
            setDocumentObject: function (docObject) {
//                documentObject.idObject = docObject.idObject;
                documentObject = angular.copy(docObject);
                $rootScope.$broadcast("idObjectReceived");
            },
            getDocumentObject: function () {
                return documentObject;
            },
            setTiersId: function (id) {
//                tiersId.id = angular.copy(id);
                tiersId.id = id;
                $rootScope.$broadcast("idTiersSent");
            },
            getTiersId: function () {
                return tiersId;
            },

            setDocObjectFile: function (docFileID) {
                docObjectFile = docFileID;
                $rootScope.$broadcast("docObjectFileSent");
            },
            getDocObjectFile: function () {
                return docObjectFile;
            },

            setDetailPaiementWithId: function (id, showButton) {
                detailPaiementWithId.id = id;
                detailPaiementWithId.showButton = showButton;
                $rootScope.$broadcast("detailPaiementWithId");
            },
            getDetailPaiementWithId: function () {
                return detailPaiementWithId;
            },
            setDetailRubriqueWithId: function (id) {
                detailRubriqueWithId.id = id;
                $rootScope.$broadcast("detailRubriqueWithId");
            },
            getDetailRubriqueWithId: function () {
                return detailRubriqueWithId;
            },
            setDetailPieceWithId: function (id, intention, paramRegularissation) {
                detailPieceWithId.id = id;
                detailPieceWithId.intention = intention;
                detailPieceWithId.paramRegularissation = paramRegularissation;
                $rootScope.$broadcast("detailPieceWithId");
            },
            getDetailPieceWithId: function () {
                return detailPieceWithId;
            },

            setDetailEcritureWithId: function (id) {
                detailEcritureWithId.id = id;
                $rootScope.$broadcast("detailEcritureWithId");
            },
            getDetailEcritureWithId: function () {
                return detailEcritureWithId;
            },

            setBadgeAffected: function (badgeId) {
                badgeAffected = badgeId;
                $rootScope.$broadcast("badgeAffectedSent");
            },
            getBadgeAffected: function () {
                return badgeAffected;
            },

            setTiersAndType: function (id, typeId, idRef, tiers, interne) {
//                tiersId.id = angular.copy(id);
                tiersAndType.id = id;
                tiersAndType.typeId = typeId;
                tiersAndType.idRef = idRef;
                tiersAndType.tiers = tiers;
                tiersAndType.interne = interne;
                $rootScope.$broadcast("SendTiersAndTypeId");
            },
            getTiersAndType: function () {
                return tiersAndType;
            },

            /**
             * Fomulaire réutilisable des tiers propagation des tiers.
             * @param {type} tObject
             * @returns {undefined}
             */
            setTiersObject: function (tObject) {
                tiersObject = angular.copy(tObject);
                $rootScope.$broadcast("tiersObjectSent");
                //jslog("Set du propagation service" + angular.toJson(tiersObject));
            },
            getTiersObject: function () {
                return tiersObject;
            },
            /**
             * Propagation de la procédure de dépense piece
             * @param {type} pdIdObject
             * @param {type} pdObjetObject
             * @param {type} pdDateObject
             * @returns {undefined}
             */
            setProcedureDepensePieceObject: function (pdIdObject, pdObjetObject, pdDateObject) {
                procedureDepensePieceObject.id = angular.copy(pdIdObject);
                procedureDepensePieceObject.libelle = angular.copy(pdObjetObject);
                procedureDepensePieceObject.autre = angular.copy(pdDateObject);
                $rootScope.$broadcast("depensePieceObjectSent");
                //jslog("Set du propagation service depense procedure" + angular.toJson(procedureDepensePieceObject));
            },
            getProcedureDepensePieceObject: function () {
                return procedureDepensePieceObject;
            },

            setTiersJustificatifFile: function (pdIdObject) {
                tiersJustificatifFile.myFile = pdIdObject;
                $rootScope.$broadcast("tiersJustificatifFileObjectSent");
                jslog("Set du propagation service tiersJustificatifFileObjectSent" + angular.toJson(tiersJustificatifFile));
                console.log(tiersJustificatifFile.myFile);
            },
            getTiersJustificatifFile: function () {
                return tiersJustificatifFile;
            },

            /**
             * Propagation du budget
             * @param {type} pdIdObject
             * @param {type} pdObjetObject
             * @param {type} pdDateObject
             * @returns {undefined}
             */
            setBudgetPieceObject: function (pdIdObject, pdObjetObject, pdDateObject) {
                budgetPieceObject.id = angular.copy(pdIdObject);
                budgetPieceObject.libelle = angular.copy(pdObjetObject);
                budgetPieceObject.autre = angular.copy(pdDateObject);
                $rootScope.$broadcast("depensePieceObjectSent");
                //jslog("Set du propagation service budget " + angular.toJson(budgetPieceObject));
            },
            getBudgetPieceObject: function () {
                return budgetPieceObject;
            },
            /**
             * Propagation du bordereau de dépense piece
             * @param {type} bdIdObject
             * @param {type} bdObjetObject
             * @param {type} bdDateObject
             * @returns {undefined}
             */
            setBordereauDepensePieceObject: function (bdIdObject, bdObjetObject, bdDateObject) {
                bordereauDepensePieceObject.id = angular.copy(bdIdObject);
                bordereauDepensePieceObject.libelle = angular.copy(bdObjetObject);
                bordereauDepensePieceObject.autre = angular.copy(bdDateObject);
                $rootScope.$broadcast("depensePieceObjectSent");
                //jslog("Set du propagation service depense bordereau" + angular.toJson(bordereauDepensePieceObject));
            },
            getBordereauDepensePieceObject: function () {
                return bordereauDepensePieceObject;
            },
            /**
             * Le contexte d'affichage permet de spécifier la famille de piece et l'intention(creation, modification ou visualisation)
             * @param {type} cfFaObject
             * @param {type} cfInObject
             * @returns {undefined}
             */
            setContextAffichageDepensePieceObject: function (cfFaObject, cfInObject) {
                contextAffichageDepensePieceObject.famille = angular.copy(cfFaObject);
                contextAffichageDepensePieceObject.intention = angular.copy(cfInObject);
                $rootScope.$broadcast("depensePieceObjectSent");
                $rootScope.$broadcast("depenseExpressPieceObjectSent");
                //jslog("Set du propagation service depense context affichage" + angular.toJson(contextAffichageDepensePieceObject));
            },
            getContextAffichageDepensePieceObject: function () {
                return contextAffichageDepensePieceObject;
            },
            setContextAffichageDepensePieceObjectForPaiement: function (cfFaObject, cfInObject, p, tiersPaiementUse) {
                contextAffichageDepensePieceObjectPaiement.famille = angular.copy(cfFaObject);
                contextAffichageDepensePieceObjectPaiement.intention = angular.copy(cfInObject);
                contextAffichageDepensePieceObjectPaiement.pieceObject = p;
//                contextAffichageDepensePieceObjectPaiement.idTiers = idTiers;
                contextAffichageDepensePieceObjectPaiement.tiersPaiementUse = tiersPaiementUse;
                $rootScope.$broadcast("depensePieceObjectSent");
                $rootScope.$broadcast("depenseExpressPieceObjectSentPaiement");
                //jslog("Set du propagation service depense context affichage" + angular.toJson(contextAffichageDepensePieceObject));
            },
            getContextAffichageDepensePieceObjectPaiement: function () {
                return contextAffichageDepensePieceObjectPaiement;
            },
            setPrevisionEnVigeurDepensePieceObject: function (piObject, plObject, paObject) {
                previsionEnVigeurDepensePieceObject.id = angular.copy(piObject);
                previsionEnVigeurDepensePieceObject.libelle = angular.copy(plObject);
                previsionEnVigeurDepensePieceObject.autre = angular.copy(paObject);
                $rootScope.$broadcast("depensePieceObjectSent");
                //jslog("Set du propagation service depense prevision en vigueur" + angular.toJson(previsionEnVigeurDepensePieceObject));
            },
            getPrevisionEnVigeurDepensePieceObject: function () {
                return previsionEnVigeurDepensePieceObject;
            },
            getDepensePieceOperationSuccesObject: function () {
                return depensePieceOperationSuccesObject;
            },
            setDepensePieceOperationSuccesObject: function (oPObject, odObject) {
                depensePieceOperationSuccesObject.famille = oPObject;
                depensePieceOperationSuccesObject.bordereau = odObject;
                $rootScope.$broadcast("depensePieceObjectSuccedOperationSent");
                //jslog("Enregistrement de la piece reussi" + angular.toJson(depensePieceOperationSuccesObject));
            },
            getDepensePieceObject: function () {
                return depensePieceObject;
            },
            setDepensePieceObject: function (oPObject) {
                depensePieceObject.piece = oPObject;
                $rootScope.$broadcast("depensePieceObjectSent2");
                //jslog("Envoie de la piece reussi" + angular.toJson(depensePieceObject));
            },
            getTiersDepensePieceObject: function () {
                return tiersDepensePieceObject;
            },
            setTiersDepensePieceObject: function (oPObject) {
                tiersDepensePieceObject.piece = oPObject;
                $rootScope.$broadcast("tiersDepensePieceObjectSent");
                //jslog("Envoie de la piece au formulaire de tiers reussi" + angular.toJson(tiersDepensePieceObject));
            },

            getTiersDepensePieceObjectInfoRegul: function () {
                return tiersDepensePieceObjectInfoRegul;
            },
            setTiersDepensePieceObjectInfoRegul: function (idPaiement, idRubrique, idProcedure) {
                tiersDepensePieceObjectInfoRegul.idPaiement = idPaiement;
                tiersDepensePieceObjectInfoRegul.idRubrique = idRubrique;
                tiersDepensePieceObjectInfoRegul.idProcedure = idProcedure;
                $rootScope.$broadcast("tiersDepensePieceObjectSent");
            },

            getProcedureDepenseDetailObject: function () {
                return procedureDepenseDetailObject;
            },
            setProcedureDepenseDetailObject: function (oPObject, oGObject) {
                procedureDepenseDetailObject.id = oPObject;
                procedureDepenseDetailObject.type = oGObject;
                $rootScope.$broadcast("procedureMetierDetailOperation");
                //jslog("Envoie de la procédure metier" + angular.toJson(procedureDepenseDetailObject));
            },
            setProcedureParameterObject: function (typeProc) {
                procedureParameterObject = angular.copy(typeProc);
                $rootScope.$broadcast("typeProcedureSent");
            },
            getProcedureParameterObject: function () {
                return procedureParameterObject;
            },
            setOperationCompleted: function (opc) {
                operationCompleted = angular.copy(opc);
                $rootScope.$broadcast("procedureOperationCompleted");
            },
            getOperationCompleted: function () {
                return operationCompleted;
            },
            setEcritureObject: function (e) {
                ecritureObject = angular.copy(e);
                $rootScope.$broadcast("ecritureSent");
            },
            getEcritureObject: function () {
                return ecritureObject;
            },
            setPieceObject: function (p) {
                pieceObject = angular.copy(p);
                $rootScope.$broadcast("pieceSent");
            },
            getPieceObject: function () {
                return pieceObject;
            },
            getPaiementObject: function () {
                return paiementObject;
            },
            setPaiementObject: function (intention, paiementDTO, fonctionAppelante, dateRef) {
                paiementObject.intention = intention;
                paiementObject.fonctionAppelante = fonctionAppelante;
                paiementObject.dateRef = dateRef;

                paiementObject.paiementDTO = angular.copy(paiementDTO);
                $rootScope.$broadcast("paiementObjectSender");
                //jslog("Envoie de l'object paiementObjectSender" + angular.toJson(paiementObject.paiementDTO));
            },
            getPaiementPieceObject: function () {
                return paiementPieceObject;
            },
            setPaiementPieceObject: function (intention, paiementDTO, fonctionAppelante, dateRef) {
                paiementPieceObject.intention = intention;
                paiementPieceObject.fonctionAppelante = fonctionAppelante;
                paiementPieceObject.dateRef = dateRef;

                paiementPieceObject.paiementDTO = angular.copy(paiementDTO);
                $rootScope.$broadcast("paiementPieceObjectSender");
                //jslog("Envoie de l'object paiementObjectSender" + angular.toJson(paiementObject.paiementDTO));
            },
            getPaiementSavedSuccesObject: function () {
                return paiementSavedSuccesObject;
            },
            setPaiementSavedSuccesObject: function (id, idPiece) {
                paiementSavedSuccesObject.id = id;
                paiementSavedSuccesObject.idPiece = idPiece;
                $rootScope.$broadcast("paiementSavedSuccesObjectSender");
                //jslog("Envoie de l'object paiementObjectSender" + angular.toJson(paiementSavedSuccesObject));
            },
            getPaiementSavedSuccesObject2: function () {
                return paiementSavedSuccesObject;
            },
            setPaiementSavedSuccesObject2: function (id, idPiece) {
                paiementSavedSuccesObject.id = id;
                paiementSavedSuccesObject.idPiece = idPiece;
                $rootScope.$broadcast("paiementSavedSuccesObjectSender2");
                //jslog("Envoie de l'object paiementObjectSender" + angular.toJson(paiementSavedSuccesObject));
            },
            getTiersPayementPieceObject: function () {
                return tiersPayementPieceObject;
            },
            setTiersPayementPieceObject: function (oPObject) {
                tiersPayementPieceObject.piece = oPObject;
                $rootScope.$broadcast("tiersPayementPieceObjectSent");
                //jslog("Envoie de la piece au formulaire de tiers reussi" + angular.toJson(tiersPayementPieceObject));
            },
            getTiersReservationObject: function () {
                return tiersPayementPieceObject;
            },
            setTiersReservationObject: function (oPObject) {
                tiersPayementPieceObject.piece = oPObject;
                $rootScope.$broadcast("tiersReservationObjectSent");
                //jslog("Envoie de la piece au formulaire de tiers reussi" + angular.toJson(tiersPayementPieceObject));
            },
            getTiersEcritureObject: function () {
                return tiersEcriturePieceObject;
            },
            setTiersEcritureObject: function (oPObject) {
                tiersEcriturePieceObject.piece = oPObject;
                $rootScope.$broadcast("tiersEcritureObjectSent");
            },
            getTiersSchemaAbondementObject: function () {
                return tiersPayementPieceObject;
            },
            setTiersSchemaAbondementObject: function (oPObject) {
                tiersPayementPieceObject.piece = oPObject;
                $rootScope.$broadcast("tiersSchemaAbondementObjectSent");
                //jslog("Envoie de la piece au formulaire de tiers reussi" + angular.toJson(tiersPayementPieceObject));
            },
            setTiersSimplifierObject: function (modeAjout, modeEdit) {
                tiersSimplifierObject.modeAjout = modeAjout;
                tiersSimplifierObject.modeEdit = modeEdit;
                $rootScope.$broadcast("tiersSimplifierObjectSent");
                //jslog("envoie des variables sur la page des tiers " + angular.toJson(tiersSimplifierObject));
            },
            getTiersSimplifierObject: function () {
                return tiersSimplifierObject;
            },

            setTierCompteListCleared: function () {
                clearTierCompteList.doIt = true;
                $rootScope.$broadcast("clearTierObjectCommand");
            },
            getTierCompteListCleared: function () {
                return clearTierCompteList;
            },
            setUsage: function (usageObject) {
                usage = usageObject;
                $rootScope.$broadcast("usageObjectSend");
            },
            getUsage: function () {
                return usage;
            },
            setLbUsageObject: function (lbo) {
                lbUsageObject = lbo;
                jslog("DATA " + lbo);
                $rootScope.$broadcast("lbUsageObjectSend");
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            },
            getLbUsageObject: function () {
                return lbUsageObject;
            },
            setCompteForLigneGeneration: function (compteObject) {
                compteObjectForGeneration = angular.copy(compteObject);
                $rootScope.$broadcast("sendingCompteObjectForGeneration");
            },

            getCompteForLigneGeneration: function () {
                return compteObjectForGeneration;
            },
            setUpdateLigne: function (listID) {
                listIdLigne = angular.copy(listID);
                $rootScope.$broadcast("sendingListId");
            },

            getUpdateLigne: function () {
                return listIdLigne;
            },
            setHideGetWayButton: function (value) {
                hideGetWayButton = value;
                $rootScope.$broadcast("getWaySender");
            },

            getHideGetWayButton: function () {
                return hideGetWayButton;
            },

            setInstructionObject: function (instructionDto) {
                instructionObject = angular.copy(instructionDto);
                $rootScope.$broadcast("sendInstructionObject");
            },

            getInstructionObject: function () {
                return instructionObject;
            },
            setPaiementDTOFromPaiement: function (paiementDTO) {
                paiementDTOFromPaiement = angular.copy(paiementDTO);
                $rootScope.$broadcast("sendPaiementDTOFromPaiement");
            },

            getPaiementDTOFromPaiement: function () {
                return paiementDTOFromPaiement;
            },
            setInstructionData: function (instruction) {
                instructionData = angular.copy(instruction);
                jslog("instructionData " + angular.toJson(instructionData))
                $rootScope.$broadcast("instructionsent");
            },
            getInstructionData: function () {
                return instructionData;
            },
            setReservationCreditObject: function (reservation) {
                reservationCreditObject = angular.copy(reservation);
                jslog("instructionData " + angular.toJson(reservationCreditObject))
                $rootScope.$broadcast("reservation");
            },
            getReservationCreditObject: function () {
                return reservationCreditObject;
            },
            setDmpObject: function (reservation) {
                reservationCreditObject = angular.copy(reservation);
//                jslog("instructionData " + angular.toJson(reservationCreditObject))
                $rootScope.$broadcast("demandeMiseDisposition");
            },
            getDmpObject: function () {
                return reservationCreditObject;
            },
            setEcritureAbondementObject: function (id, reference, objet) {
                ecritureAbondementObject.id = id;
                ecritureAbondementObject.reference = reference;
                ecritureAbondementObject.objet = objet;
//                jslog("instructionData " + angular.toJson(reservationCreditObject))
                $rootScope.$broadcast("ecritureAbondement");
            },
            getEcritureAbondementObject: function () {
                return ecritureAbondementObject;
            },
            setObjectToJointPiece: function (p) {
                objectToJointPiece = angular.copy(p);
                $rootScope.$broadcast("pieceJointes");
            },
            getObjectToJointPiece: function () {
                return objectToJointPiece;
            },
            setObjectPjDidocToAbs: function (p) {
                objectPjDidocToAbs = angular.copy(p);
                $rootScope.$broadcast("piecesJointesFromDodoc");
                console.log("Envoie de la piece au formulaire de tiers reussi" + angular.toJson(objectPjDidocToAbs));
            },
            getObjectPjDidocToAbs: function () {
                return objectPjDidocToAbs;
            },
            setCommentaireObject: function (commentaire) {
                commentaireObject.commentRequired = commentaire.commentRequired;
                commentaireObject.libelleAction = commentaire.libelleAction;
                commentaireObject.modalId = commentaire.modalId;
                commentaireObject.broadcastMessage = commentaire.broadcastMessage;
                $rootScope.$broadcast("initComment");
                $rootScope.$broadcast(commentaireObject.broadcastMessage);
            },
            getCommentaireObject: function () {
                return commentaireObject;
            },

            setBackCommentaireObject: function (commentaire) {
                commentaireObject = angular.copy(commentaire);
                $rootScope.$broadcast("getBackComment");
                commentaireObject.broadcastMessage = commentaire.broadcastMessage;
                $rootScope.$broadcast(commentaireObject.broadcastMessage);
            },
            getBackCommentaireObject: function () {
                return commentaireObject;
            },

            setInfoPaiementRegul: function (idPaiement, idRubrique) {
                infoPaiementRegul.idPaiement = idPaiement;
                infoPaiementRegul.idRubrique = idRubrique;
                $rootScope.$broadcast("depensePieceObjectSent");
//                $rootScope.$broadcast("regularisationSentPaiement");
//                alert("setInfoPaiementRegul" + angular.toJson(infoPaiementRegul));
            },
            getInfoPaiementRegul: function () {
                return infoPaiementRegul;
            },
            setArticleObject: function (id, methodeValorisation) {
                articleObject.id = id;
                articleObject.methodeValorisation = methodeValorisation;
                $rootScope.$broadcast("articleObjectSent");
            },
            getArticleObject: function () {
                return articleObject;
            },
            setArticleAddObjectSend: function (idObjetAdd, idArticle, numCmd, sensMouvement) {
                articleAddObjectSend.idObjetAdd = idObjetAdd;
                articleAddObjectSend.idArticle = idArticle;
                articleAddObjectSend.numCmd = numCmd;
                articleAddObjectSend.sensMouvement = sensMouvement;
                $rootScope.$broadcast("articleAddObjectSend");
            },
            getArticleAddObjectSend: function () {
                return articleAddObjectSend;
            },
            setTransfertObject: function (transferObject) {
                transfertObject.idObjetSource = transferObject.idObjetSource;
                transfertObject.codeObjetTransfert = transferObject.codeObjetTransfert;
//                transfertObject.idObjetSource = transferObject.idObjetSource;
                ;
                $rootScope.$broadcast("transfertObjectSender");
            },
            getTransfertObject: function () {
                return transfertObject;

            },
            setDetailBordereauTransfertWithId: function (id, modifAuthorised) {
                detailBordereauTransfertWithId.id = id;
                detailBordereauTransfertWithId.modifAuthorised = modifAuthorised;
                $rootScope.$broadcast("detailBordereauTransfertObjectSender");
            },
            getDetailBordereauTransfertWithId: function () {
                return detailBordereauTransfertWithId;
            },
            setSynthesePieceTiersInfo: function (idTiers, idPiece, idModePaiement, idCompte) {
                synthesePieceTiersInfo.idTiers = idTiers;
                synthesePieceTiersInfo.idPiece = idPiece;
                synthesePieceTiersInfo.idModePaiement = idModePaiement;
                synthesePieceTiersInfo.idCompte = idCompte;
                $rootScope.$broadcast("synthesePieceTiersInfoSent");
            },
            getSynthesePieceTiersInfo: function () {
                return synthesePieceTiersInfo;
            },

            setIdObjetSourceSuccess: function (idob) {
                idObjetSourceSuccess.idObjetSource = idob;
                $rootScope.$broadcast("idObjetSourceSuccessSender");
            },
            getIdObjetSourceSuccess: function () {
                return idObjetSourceSuccess;
            },

            setConventionRequestObject: function (cvObject) {
                conventionRequestObject = angular.copy(cvObject);
                $rootScope.$broadcast("onConventionRequest");
            },
            getConventionRequestObject: function () {
                return conventionRequestObject;
            },
            setConventionResponseObject: function (cvObject) {
                conventionResponseObject = angular.copy(cvObject);
                $rootScope.$broadcast("onConventionResponse");
            },
            getConventionResponseObject: function () {
                return conventionResponseObject;

            },
            setPieceObjectForBatch: function (object) {
                pieceObjectForBatch = angular.copy(object);
                $rootScope.$broadcast("onListBatch");
            },
            getPieceObjectForBatch: function () {
                return pieceObjectForBatch;
            },

            setCategorieOperationObject: function (tObject) {
                cateOperation = angular.copy(tObject);
                $rootScope.$broadcast("categorieObjectSent");
            },
            getCategorieOperationObject: function () {
                return cateOperation;
            }

        };
    }]);

