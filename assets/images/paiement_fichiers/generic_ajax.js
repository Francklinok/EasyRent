/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global NProgress */

var appUrl = $('#appUrl').attr("href");
/**
 * 
 * @param {type} resourceLink qui represente le lien vers le web service
 * @param {type} data qui represente l'objet à passer dans le corps (body) de la requête
 * @param {type} success qui represente une fonction callback à appeler en cas de success s'il y en a sinon renseigner null
 * @param {type} reqError qui represente une fonction callback à appeler en cas d'erreur s'il y en a sinon renseigner null
 * @param {type} ajaxOtherOptions 
 * @returns {undefined}
 */
function doPost(resourceLink, data, success = null, reqError = null, ajaxOtherOptions = null) {
    NProgress.start();
    let urle = (appUrl + resourceLink);
    $.ajax({
        url: urle,
        type: "POST",
        data: data,
        success: function (data) {
            addMessages(data);
            if (success !== null) {
                success(data);
            }
        },
        error: function (data) {
            if (data.error === true) {
                $.Notification.notify('error', 'top right', 'Error lors de l\'envoie de requête ! ', '');
            }
            if (reqError !== null) {
                reqError(data);
            }
        }, beforeSend: function (request) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

function doPostWithContentType(resourceLink, data, success = null, reqError = null, ajaxOtherOptions = null) {
    NProgress.start();
    let urle = (appUrl + resourceLink);
    $.ajax({
        url: urle,
        type: "POST",
        contentType: 'application/json',
        data: data,
        success: function (data) {
            addMessages(data);
            if (success !== null) {
                success(data);
            }
        },
        error: function (data) {

            if (data.status && data.status == 401) {
                document.location.href = appUrl + "login";
            }
            if (data.error === true) {
                $.Notification.notify('error', 'top right', 'Error lors de l\'envoie de requête 1! ', '');
            }
            if (reqError !== null) {
                reqError(data);
            }
        }, beforeSend: function (request) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

/**
 * 
 * @param {type} resourceLink qui represente le lien vers le web service
 * @param {type} data qui represente l'objet à passer dans le corps (body) de la requête
 * @param {type} success qui represente une fonction callback à appeler en cas de success s'il y en a sinon renseigner null
 * @param {type} reqError qui represente une fonction callback à appeler en cas d'erreur s'il y en a sinon renseigner null
 * @param {type} ajaxOtherOptions 
 * @returns {undefined}
 */
function doDelete(resourceLink, data, success = null, reqError = null, ajaxOtherOptions = null) {
    NProgress.start();
    let urle = (appUrl + resourceLink);
    $.ajax({
        ajaxOtherOptions,
        url: urle,
        type: "DELETE",
        contentType: 'application/json',
        data: data,
        success: function (data) {
            addMessages(data);
            if (success !== null) {
                success(data);
            }
        },
        error: function (data) {
            if (data.status && data.status == 401) {
                document.location.href = appUrl + "login";
            }
            if (data.error === true) {
                $.Notification.notify('error', 'top right', 'Error lors de l\'envoie de requête ! ', '');
            }
            if (reqError !== null) {
                reqError(data);
            }
        }, beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

function addMessages(data) {
    let msgDetail = '';
    if (data.msg) {
        var type;
        if (data.msg.typeError === "DANGER") {
            type = 'error';
        } else if (data.msg.typeError === "INFO") {
            type = 'success';
        } else if (data.msg.typeError === "WARNING") {
            type = 'warning';
        } else {
            type = 'warning';
        }

        $.Notification.notify(type, 'top right', data.msg.principal, function () {
            if (data.msg.errorMessages) {
                msgDetail += "<ul>";
                for (var i = 0; i < data.msg.errorMessages.length; i++) {
                    msgDetail = msgDetail + "<li> " + data.msg.errorMessages[i].message + "</li>";
                }
                msgDetail += "</ul>";
            }
            return msgDetail;
        });
    }
}


/**
 * 
 * @param {type} resourceLink qui represente le lien vers le web service
 * @param {type} success qui represente une fonction callback à appeler en cas de success s'il y en a sinon renseigner null
 * @param {type} reqError qui represente une fonction callback à appeler en cas d'erreur s'il y en a sinon renseigner null
 * @param {type} ajaxOtherOptions
 * @returns {undefined}
 */
function doGet(resourceLink, success = null, reqError = null, ajaxOtherOptions = null) {
    NProgress.start();
    let urle = appUrl + resourceLink;
    let msgDetail = '';
    $.ajax({
        ajaxOtherOptions,
        url: urle,
        type: "GET",
        success: function (data) {
            addMessages(data);
            if (success !== null) {
                success(data);
            }
        },
        error: function (data) {

            if (data.status && data.status == 401) {
                document.location.href = appUrl + "login";
            }


            if (data && data.responseJSON.reasonPhrase) {
                $.Notification.notify('error', 'top right', data.responseJSON.reasonPhrase, '');
            } else {
                $.Notification.notify('error', 'top right', 'Error lors de l\'envoi de requête ! ', '');
            }
            if (reqError !== null) {
                reqError(data);
            }
        }
        , beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

function doGetWithHeader(resourceLink, success = null, reqError = null, ajaxOtherOptions = null) {
    NProgress.start();
    let urle = appUrl + resourceLink;
    let msgDetail = '';
    $.ajax({
        ajaxOtherOptions,
        url: urle,
        type: "GET",
        success: function (data) {
            addMessages(data);
            if (success !== null) {
                success(data);
            }
        },
        error: function (data) {

            if (data.status && data.status == 401) {
                document.location.href = appUrl + "login";
            }


            if (data && data.responseJSON.reasonPhrase) {
                $.Notification.notify('error', 'top right', data.responseJSON.reasonPhrase, '');
            } else {
                $.Notification.notify('error', 'top right', 'Error lors de l\'envoi de requête ! ', '');
            }
            if (reqError !== null) {
                reqError(data);
            }
        }
        , beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}



/**
 * 
 * @param {type} url l'url de la requête POST à effectuer
 * @param {type} selected la zone où remplacer le contenu
 * @param {type} data la donnée à envoyer au serveur
 * @param {type} succes_callBack la fonction à executer quand la requete renverra 200
 * @param {type} error_callBack la fonction à executer quand la requete renverra une valeur autre que 200
 * @returns {undefined}
 */
function doGlobalPostWithCallbacks(url, selected, data, succes_callBack, error_callBack) {
    NProgress.start();
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function (dt_returned, textStatus, jqXHR) {
            console.log(dt_returned);
            $('#' + selected).html(dt_returned);
            succes_callBack();
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            error_callBack();
        }, beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

/**
 * 
 * @param {type} url l'url de la requête POST à effectuer
 * @param {type} selected la zone où remplacer le contenu
 * @param {type} data la donnée à envoyer au serveur
 * @returns {undefined}
 */
function doGlobalPost(url, selected, data) {
    NProgress.start();
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function (dt_returned, textStatus, jqXHR) {
            $('#' + selected).html(dt_returned);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }, beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}


/**
 * 
 * @param {type} url l'url de la requête GET à effectuer
 * @param {type} selected la zone où remplacer le contenu
 * @param {type} succes_callBack la fonction à executer quand la requete renverra 200
 * @param {type} error_callBack la fonction à executer quand la requete renverra une valeur autre que 200
 * @returns {undefined}
 */
function doGlobalGetWithCallbacks(url, selected, succes_callBack, error_callBack) {
    NProgress.start();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (dt_returned, textStatus, jqXHR) {
            $('#' + selected).html(dt_returned);
            console.log(dt_returned);
            succes_callBack();
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            error_callBack();
        }, beforeSend: function (xhr) {
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}

/**
 * 
 * @param {type} url l'url de la requête GET à effectuer
 * @param {type} selected la zone où remplacer le contenu
 * @returns {undefined}
 */
function doGlobalGet(url, selected) {
    NProgress.start();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (dt_returned, textStatus, jqXHR) {
            console.log(dt_returned);
            $('#' + selected).html(dt_returned);
        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error " + errorThrown);
        }, beforeSend: function (xhr) {
            console.log('Request started');
            $("#wait_ajax_loader").css("display", "block");
        }, complete: function (jqXHR, textStatus) {
            $("#wait_ajax_loader").css("display", "none");
        }
    });
    NProgress.done();
}



