/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*Les variables globales
 utilisées et accessibles depuis toutes pages*/
/**
 * 
 * @type String Nom d'utilisateur
 */
var confirmed = false; //A ne pas éffacer

var _username = "jojo";
/**
 * 
 * @type String Adresse Ip de base de l'application
 */
var _baseIp = $('#appUrl').attr("href");
var _baseUrl = "";
var _displayName;
var _token;


function display(type, title, msg) {
    $.Notification.notify(type, 'top right', title, msg);
}

function success() {
    $.Notification.notify('custom', 'top right', 'Succes', 'Operation éffectué');
}

function error() {
    $.Notification.notify('error', 'top right', 'Echec', 'Opération non éffectué');
}

function openDetailWithUrl(event) {
    var val = $(event).attr('href');
    window.location.href = val;
}

function openDetailWithDomain(event, nomClass) {
    var selector = "." + sessionStorage.getItem("nomClass");
    $(selector).addClass("active");
    sessionStorage.setItem("nomClass", nomClass);
    console.log(nomClass);
    var val = $(event).attr('data-id');
    window.location.href = "/abs-start-up/parametre/conf/parameter?type=d&code=" + val;
}


function openDetailWithPorte(event, nomClass) {
    var selector = "." + sessionStorage.getItem("nomClass");
    $(selector).addClass("active");
    sessionStorage.setItem("nomClass", nomClass);
    console.log(nomClass);
//    var elem = document.getElementById(id);
//    $(elem).addClass("active");
    var val = $(event).attr('href');
    window.location = val;
}

function openEtiquetteDetailWithDomain(event, nomClass) {
    var selector = "." + sessionStorage.getItem("nomClass");
    $(selector).addClass("active");
    sessionStorage.setItem("nomClass", nomClass);
    console.log(nomClass);
    var val = $(event).attr('href');
    window.location = val;
}

function openEtiquetteDetailWithPorte(event, nomClass) {
    var selector = "." + sessionStorage.getItem("nomClass");
    $(selector).addClass("active");
    sessionStorage.setItem("nomClass", nomClass);

    console.log(nomClass);
    var val = $(event).attr('href');
    window.location = val;
}

function checkSpcialChar(event) {
    if (!((event.keyCode >= 65) && (event.keyCode <= 90) || (event.keyCode >= 97) && (event.keyCode <= 122) || (event.keyCode >= 48) && (event.keyCode <= 57))) {
        event.returnValue = false;
        return;
    }
    event.returnValue = true;
}

function changeColorPortee(newcolor) {
    var elem = document.getElementById('portee');
    console.log(elem);
    elem.style.background = newcolor;
    // $(elem).addClass('tabColor #ebeff2') ;
}

function changeColorDomaine(newcolor) {
    var elem = document.getElementById('domaine');
    console.log(elem);
    elem.style.background = newcolor;
    // $(elem).addClass('tabColor #ebeff2') ;
}


function initer() {
    var url = $('.noeud').attr('href');
    var id = $('.noeud').attr('data-id');
    console.log(url);
    $.ajax({
        url: url + 'api/ged/directory-node/content?id=' + id,
        type: 'GET',
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.directories.length; i++) {
                console.log(data.directories[i].name);
                console.log("<li data-jstree='" + "{'opened':false}'" + " class='jstree-open'>" + data.directories[i].name + "</li>");
                $('#ul_node_under_directory').html("<li data-jstree='" + "{'opened':false}'" + " class='jstree-open'" + "onclick='selectDossier($(this))'>" + data.directories[i].name + "</li>");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {

        }

    });
}


function verifyVoyelleConsonne(verVoyCons) {
    if (!verVoyCons) {
        return "";
    }
    if (verVoyCons[0].toLowerCase() == "a" || verVoyCons[0].toLowerCase() == "e" || verVoyCons[0].toLowerCase() == "y" || verVoyCons[0].toLowerCase() == "u" || verVoyCons[0].toLowerCase() == "i" || verVoyCons[0].toLowerCase() == "o") {
        return " d' " + verVoyCons;
    } else {
        return " de " + verVoyCons;
    }

}

function showConfirmation(complement, succes_callBack, description = '', dismiss_callBack, confirmationrequired = true) {
    if (confirmationrequired != undefined && !confirmationrequired) {
        succes_callBack();
        return;
    }
    swal({
        title: 'Êtes-vous sûr ' + verifyVoyelleConsonne(complement) + ' ?',
        text: description,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger m-l-10',
        buttonsStyling: false
    }).then(function () {
        succes_callBack();
    }, function (dismiss) {
        if (dismiss_callBack) {
            dismiss_callBack();
        }
        if (dismiss === 'cancel') {
            swal(
                    'Annulé',
                    "L'opération a été annulée",
                    'error'
                    )
        }
    });
}

function showConfirmationForProgrammeWorkflow(complement, succes_callBack, description = '') {

    swal({
        title: 'Êtes-vous sûr ' + complement + ' ?',
        text: description,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Composant courant uniquement',
        cancelButtonText: 'Composant courant et ses filles',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger m-l-10',

        buttonsStyling: false
    }).then(function () {

        succes_callBack();

    }, function (dismiss) {
        if (dismiss === 'cancel') {
            swal('Annulé', "L'opération a été annulée", 'error');
        }
    });
}


//**
function getBaseUrl() {
    var ro = $("#main-content-page").attr("data-main-href");
    return ro;
}


function openEdit(event) {
    var type = $(event).attr('data-type');
    //var code = $(event).attr('data-code');
    var ligne = $(event).attr('data-rowid');
    var code = $("#code" + ligne).val();
    var libelle = $("#libelle" + ligne).val();
    var porte = $("#porte" + ligne).val();
    console.log(ligne + " " + code + " " + libelle + " " + porte);
    if (type === 'L') {
        window.location.href = appUrl + "parametre/conf/listes/editOne/" + code + "?libelle=" + libelle + "&porte=" + porte;
    } else if (type === 'P') {
        window.location.href = appUrl + "parametre/conf/parameter?code=" + code;
    } else if (type === 'C') {
        window.location.href = appUrl + "parametre/conf/classeur/up/" + code;
    } else {
        window.location.href = appUrl + "parametre/conf/etiquette?code=" + code;
    }
}

function openDetailCodification(event) {
    var type = $(event).attr('data-type');
    //var code = $(event).attr('data-code');
    var ligne = $(event).attr('data-rowid');
    var code = $("#code" + ligne).val();
    var libelle = $("#libelle" + ligne).val();
    var porte = $("#porte" + ligne).val();
    if (type === 'L') {
        window.location.href = appUrl + "parametre/conf/listes/vue/" + code + "?libelle=" + libelle + "&porte=" + porte;
    } else if (type === 'P') {
        window.location.href = appUrl + "parametre/conf/parameter/detail?code=" + code;
    } else if (type === 'C') {
        window.location.href = appUrl + "parametre/conf/classeur/up/" + code + "?d=1";
    } else {
        window.location.href = appUrl + "parametre/conf/etiquette/detail?code=" + code;
    }
}


function openVue(event) {
    var type = $(event).attr('data-type');
    //var code = $(event).attr('data-code');
    var ligne = $(event).attr('data-rowid');
    var code = $("#code" + ligne).val();
    var libelle = $("#libelle" + ligne).val();
    var porte = $("#porte" + ligne).val();
    console.log(ligne + " " + code + " " + libelle + " " + porte);
    if (type === 'L') {
        window.location.href = appUrl + "parametre/conf/listes/vue/" + code + "?libelle=" + libelle + "&porte=" + porte;
    } else if (type === 'P') {
        window.location.href = appUrl + "parametre/conf/parameter?code=" + code;
    } else if (type === 'C') {
        window.location.href = appUrl + "parametre/conf/classeur/up/" + code + "?d=1";
    } else {
        window.location.href = appUrl + "parametre/conf/etiquette?code=" + code;
    }
}

function precedentPage(event) {
    if ('referrer' in document) {
        window.location = document.referrer;
    } else {
        window.history.back();
    }
}

function precedentPageHistory(event) {
        window.history.back();
}

//function precedentPageHistory(event) {
//    window.history.go(-1);
////        window.history.back();
////        window.location.reload()
//}

function alertInfo(textDescriptif, second) {
    swal(textDescriptif, second)
            .then(() => {
            });
}

$(document).ready(function () {
    $('.abs-object-no-download').each(function (index, value) {
        $(value).contents().find("video").attr('controlsList', 'nodownload');
        $(value).contents().find("video").attr('autoplay', 'false');
    });

    $('.no-context-menu').contextmenu(function (event) {
        event.preventDefault();
    });

    $(".valid-status").click(function (event) {
        alert();
        if (!confirmed) {
            event.preventDefault();
            showConfirmation(('vouloir ' + ($(this).html()).toLowerCase()), function () {
                confirmed = true;
                $(event.target).click();
            });
        } else {
            confirmed = false;
        }
    });

    $('.no-context-menu').contents().find("*").contextmenu(function (event) {
        event.preventDefault();
        $(event).contents().contextmenu(function (event2) {
            event2.preventDefault();
        });
    });
});

var func = null;

function showCommentaire(executer_action_callBack, commentairerequired = true) {
    func = executer_action_callBack;
    if (commentairerequired !== undefined && !commentairerequired) {
        executer_action_callBack();
        return;
    } else {
        var commentaire = $("#commentaire").val();
        var commentaire_anonyme = $('#commentaireAnonyme').is(':checked');
        if (commentaire === undefined || commentaire === '' || commentaire.length === 0) {
            $("#genericCommentaireModal").modal('show');
        } else {
            executer_action_callBack({commentaire: commentaire, commentaireAnonyme: commentaire_anonyme});
        }
}
}
$("#genericCommentaireModal").on('hidden.bs.modal', function () {
    $("#commentaire").val("");
    $('#commentaireAnonyme').prop('checked', false);
});
function cancelCommentaire() {
    $("#commentaire").val("");
    $('#commentaireAnonyme').prop('checked', false);
}