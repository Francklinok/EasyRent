/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*
 * App module
 */
'use strict';
var App = angular.module('app', ['TreeWidget', 'treeControl', 'toggle-switch',
    'ivh.treeview', 'multipleSelect', 'ngAnimate', 'selectize', 'ui.bootstrap',
    'ngTagsInput', 'googlechart', 'chart.js', 'dynamicNumber', 'angularjs-dropdown-multiselect', 'ngJsTree','oi.select']).directive('hasAnyAuthority',
        function (authorityService) {
            return {
                link: function (scope, element, attrs) {
//                    if (!_.isString(attrs.hasAnyAuthority)) {
//                        throw 'hasPermission value must be a string';
//                    }

                    var value = attrs.hasAnyAuthority.trim();
                    value = value.slice(0).trim();
                    value = value.split(",");
                    function toggleVisibilityBasedOnAuthority() {
                        var isAuthorize = authorityService.hasAnyAuthority(value);
                        if (isAuthorize) {
                            element.show();
                        } else {

                            element.hide();
                        }
                    }

                    toggleVisibilityBasedOnAuthority();
                    scope.$on('permissionsChanged', toggleVisibilityBasedOnAuthority);
                }
            };
        }).
        /**
         * hakakpo
         * @since 08-03-2019
         * @param {type} $scope
         * @param {type} element
         * @param {type} attrs
         * @returns {undefined}
         * tronquer le texte qui deborde dans un input ou le sur un composant affichant du texte et afficher le title
         */
        directive("truncAndShowTitle", function () {
            return {
                restrict: 'C', //E = element, A = attribute, C = class, M = comment
                replace: true,
                scope: {
                    //@ reads the attribute value, = provides two-way binding, & works with functions
                    ngModel: '=',
                    ngBind: '='
                },
                link: function ($scope, element, attrs) {
                    element.css({'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis'});
//                    console.log('select =>'+JSON.stringify(angular.element(document.querySelector("#ng-model").tagName)));

                    $scope.$watch(function (valeurEcouter) {
                        //console.log('valeurEcouter '+valeurEcouter.ngBind);
                        if ($scope.ngModel) {
                            return valeurEcouter.ngModel;
                        }
                        if ($scope.ngBind) {
                            return valeurEcouter.ngBind;
                        }
                    }, function (newValue, oldValue) {
//                        console.log('les valeurs old ' + oldValue + ' newValue ' + newValue);
                        element.attr('title', $scope.ngModel);
                        if ($scope.ngModel) {
                            element.attr('title', $scope.ngModel);
                        }
                        if ($scope.ngBind) {
                            element.attr('title', $scope.ngBind);
                        }
                    });
                }
            };
        }).
        directive('currencyInput', function ($filter, $browser) {
            return {
                require: 'ngModel',
                link: function ($scope, $element, $attrs, ngModelCtrl) {
                    var listener = function () {
                        var value = $element.val().replace(/,/g, '');
                        $element.val($filter('number')(value, false));
                    };
                    // This runs when we update the text field
                    ngModelCtrl.$parsers.push(function (viewValue) {
                        return viewValue.replace(/,/g, '');
                    });
                    // This runs when the model gets updated on the scope directly and keeps our view in sync
                    ngModelCtrl.$render = function () {
                        $element.val($filter('number')(ngModelCtrl.$viewValue, false));
                    };
                    $element.bind('change', listener);
                    $element.bind('keydown', function (event) {
                        var key = event.keyCode;
                        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                        // This lets us support copy and paste too
                        if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40))
                            return;
                        $browser.defer(listener); // Have to do this or changes don't get picked up properly
                    });
                    $element.bind('paste cut', function () {
                        $browser.defer(listener);
                    });
                }

            };
        }).
        directive('fileUpload', function ($parse) {
            return {
                restrict: 'A', //the directive can be used as an attribute only

                /*
                 link is a function that defines functionality of directive
                 scope: scope associated with the element
                 element: element on which this directive used
                 attrs: key value pair of element attributes
                 */
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileUpload),
                            modelSetter = model.assign; //define a setter for demoFileModel


                    //Bind change event on the element
                    element.bind('change', function () {
                        console.log("directives")
                        var files = [];
                        angular.forEach(element[0].files, function (file) {

                            files.push(file);
                        });
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files);
                        });
                    });
                }
            };
        })
        .factory('UploadeService', ['$http', '$q', function ($http, $q) {


                var factory = {
                    upload: upload,
                    uploadMultiple: uploadMultiple

                };
                return factory;
                function upload(model, file, url) {


                    var deferred = $q.defer();
                     showSpinner();
                    $http({
                        method: 'POST',
                        url: url,
                        headers: {'Content-Type': undefined},
                        data: {model: model, file: file},
                        transformRequest: function (data) {
                            var formData = new FormData();
                        
                            formData.append("m", angular.toJson(data.model));

                     
                            formData.append("file", data.file);

                        
                            return formData;
                        }

                    }).then(
                            function (response) {
                                deferred.resolve(response.data);
                                displayMessages(response.data);
                                hideSpinner();
                                deferred.resolve(response.data);
                            },
                            function (errResponse) {
                          
                                deferred.reject(errResponse);
                                                                 hideSpinner();

                                if (errResponse.data && errResponse.data.reasonPhrase) {
                                    $.Notification.notify('error', 'top right', errResponse.data.reasonPhrase, '');
                                }
                            }

                    );
                    return deferred.promise;
                }
                function uploadMultiple(model, file, url) {


                    var deferred = $q.defer();
                    showSpinner()
                    $http({
                        method: 'POST',
                        url: url,
                        headers: {'Content-Type': undefined},
                        data: {model: model, file: file},
                        transformRequest: function (data) {
                            var formData = new FormData();
                            formData.append("m", angular.toJson(data.model));

                            for (var i = 0; i < data.file.length; i++) {
                                formData.append("files", data.file[i]);
                            }

                            return formData;
                        }

                    }).then(
                            function (response) {
                                deferred.resolve(response.data);
                                displayMessages(response.data);
                                hideSpinner();
                                deferred.resolve(response.data);
                            },
                            function (errResponse) {
                                console.error('Error while creating file');
                                deferred.reject(errResponse);
                                if (errResponse.data && errResponse.data.reasonPhrase) {
                                    $.Notification.notify('error', 'top right', errResponse.data.reasonPhrase, '');
                                }
                            }

                    );
                    return deferred.promise;
                }

            }])
        .factory('authorityService', function ($rootScope) {
            var authorities = [];
            function compare(t1, t2) {
                var R = [];
                t1.forEach(function (v) {
                    t2.forEach(function (v2) {
                        if (v === v2) {

                            R.push(v);
                        }
                    });
                });
                return R;
            }

            return {
                setAuthorities: function (authorities) {
                    this.authorities = authorities;
                    $rootScope.$broadcast('permissionsChanged');
                },
                hasAnyAuthority: function (value) {
                    if (!value || value.length === 0)
                        return false;
                    if (this.authorities) {
                        return compare(this.authorities, value).length > 0;
                    }
                }
            };
        });

//num-sep=',' num-int='100000' num-thousand-sep=' ' num-thousand='true' num-fract='2'
App.config(['dynamicNumberStrategyProvider', function (dynamicNumberStrategyProvider) {
        dynamicNumberStrategyProvider.addStrategy('montant', {
            numInt: 100000,
            numFract: 2,
            numSep: '.',
            numThousand: true,
            numThousandSep: ' '
        });
        dynamicNumberStrategyProvider.addStrategy('montant', {
            numInt: 100000,
            numFract: 4,
            numSep: '.',
            numThousand: true,
            numThousandSep: ' '
        });
    }]);
//var etatEnSaisie = {id: 1, libelle: "En saisie", action: "Activer", color: "#558B2F"};
var etatEnSaisie = {id: 1, libelle: "En saisie", action: "Activer", color: "#2bb605"
    , codeCouleur: "#757575", codeCouleurText: "#FFFFFF"};
var etatActif = {id: 2, libelle: "Actif", action: "Abandonner", color: "#757575",
    codeCouleur: "#558B2F", codeCouleurText: "#FFFFFF"};
var etatObselete = {id: 3, libelle: "Obselete", codeCouleur: "#757575", codeCouleurText: "#FFFFFF"};
/**
 * Cette constante permet d'avoir la liste des données à afficher dans un menu select
 * @type Array
 */
const dataTableRowsNumber = [5, 10, 20, 30, 50, 100, 200, 500];
const dataTableDefaultNumber = 5;
const paginationLink = 'pagination.html';
function printNextAction(id) {
    if (id === 1 || id === "1") {
        return etatEnSaisie;
    } else if (id === 2 || id === "2") {
        return etatActif;
    }
    return"";
}

function displayMessages(data) {
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
function log(data) {
    console.log(data);
}

