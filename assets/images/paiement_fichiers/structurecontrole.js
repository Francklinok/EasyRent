/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function showDetail(event) {
    var showBtn = document.getElementById('aper');
    showBtn.style.visibility = "hidden";
    var idSTC = $(event).attr('data-stc-id');
    var url = "api/parametre/conf/structurecontrole/preview/" + idSTC;
    console.log("eeeeeee "+url);
    var previewDiv = document.getElementById('previewDiv');
    previewDiv.innerHTML = '';
    var sousZoneH = document.getElementById("previewLabel");
    sousZoneH.innerHTML = '';
    console.log("lljlll "+url);
    var titreStructure = document.getElementById("intituleStructure");
    titreStructure.innerHTML = '';
    var sousZoneH = document.createElement("H1");
    sousZoneH.setAttribute("id", "idAllSousZoneH");
    previewDiv.appendChild(sousZoneH);
    doGet((url),
            function (data) {
                if (data.listZone.length !== 0) {
                    showBtn.style.visibility = "visible";
                    var t = document.createTextNode(data.intitule);
                    titreStructure.appendChild(t);
                    data.listZone.forEach(function (zone) {
                        if (zone.listSousZone.length === 0) {
                            // Recherche l'index de la sous zone courante
                            var index = data.listZone.indexOf(zone);
                            // Creation des inputs
                            var textField = document.createElement("INPUT");
                            // ajout de la class form-control
                            textField.setAttribute("class", "form-control");
                            // Affectation de l'ID
                            textField.setAttribute("id", zone.id);
                            //Placeholder
                            textField.setAttribute("placeholder", zone.intitule);
                            // Definition du type des inputs
                            if (zone.typeDeDonneeString === "N") {
                                textField.setAttribute("type", "number");
                                textField.setAttribute("min", "0");
                                textField.setAttribute("max", getMaxNumber(zone.tailleZone + (zone.separateur.length)));
                                textField.setAttribute("title", "Veuillez respecter le format! seul les valeurs numériques sont acceptées");
                            }
                            if (zone.typeDeDonneeString === "X") {
                                textField.setAttribute("type", "text");
                                textField.setAttribute("pattern", "[a-zA-Z0-9]+");
                                textField.setAttribute("title", "Veuillez respecter le format");
                            }
                            if (zone.typeDeDonneeString === "A") {
                                textField.setAttribute("type", "text");
                                textField.setAttribute("pattern", "[A-Za-z]{1," + zone.tailleZone + (zone.separateur.length) + "}");
                                textField.setAttribute("title", "Veuillez respecter le format! seul les valeurs alphabétiques sont acceptées");
                            }
                            //definir la taille de la zone au cas ou c'est de type texte
                            textField.setAttribute("maxlength", zone.tailleZone + (zone.separateur.length));

                            // definir le champs comme obligatoire
                            textField.setAttribute("required", "true");
                            textField.style.width = "150px";

                            var formGroupDiv = document.createElement("DIV");
                            formGroupDiv.setAttribute("class", "form-group col-lg-2");
                            var label = document.createElement("LABEL");
                            
                            var labelDiv = document.createElement("DIV");
                                labelDiv.style.height = "50px";
                            
                            label.setAttribute("class", "control-label");
                            var labelText = document.createTextNode(zone.intitule + " :");
                            //label.appendChild(labelText);
                            //formGroupDiv.appendChild(label);
                            
                           labelDiv.style.fontSize = "12px";
                               labelDiv.style.paddingTop = "5px";
                               labelDiv.setAttribute("class","nicescroll");
                               //labelDiv.style.textOverflow= "ellipsis";
                               //labelDiv.style.whiteSpace= "nowrap";
                               labelDiv.style.overflow= "-webkit-paged-x";
                               //labelDiv.style.width= "150px";
                                //label.appendChild(labelText);
                                labelDiv.appendChild(labelText);
                                formGroupDiv.appendChild(labelDiv);

                            var inputDiv = document.createElement("DIV");
                            inputDiv.appendChild(textField);

                            formGroupDiv.appendChild(inputDiv);

                            // Ajout des inputs au Div
                            previewDiv.appendChild(formGroupDiv);

                            var spanDiv = document.createElement("DIV");
                            spanDiv.style.padding = "7% 0% 0px 0px";
                            if (index !== data.listZone.length - 1) {
                                var span = document.createElement("SPAN");
                                var spanText = document.createTextNode(zone.separateur);
                                span.appendChild(spanText);
                                // Ajout des séparateurs au Div
                                spanDiv.appendChild(span);
                            }
                            previewDiv.appendChild(spanDiv);

                        } else {
                            // La zone a des sous zones
                            zone.listSousZone.forEach(function (sousZone) {
                                var indexSousZone = zone.listSousZone.indexOf(sousZone);
                                // Creation des inputs
                                var textField = document.createElement("INPUT");
                                // ajout de la class form-control
                                textField.setAttribute("class", "form-control");
                                //Placeholder
                                textField.setAttribute("placeholder", sousZone.intitule);
                                // Affectation de l'ID
                                textField.setAttribute("id", sousZone.id);

                                // Definition du type des inputs
                                textField.setAttribute("maxlength", sousZone.tailleSousZone);
                                // Creation des pattern en fonction du type de donnée des inputs
                                if (sousZone.typeDeDonneeString === "N") {
                                    textField.setAttribute("type", "number");
                                    textField.setAttribute("min", "0");
                                    textField.setAttribute("max", getMaxNumber(sousZone.tailleSousZone));
                                    textField.setAttribute("title", "Veuillez respecter le format ce nombre ne doit pas depasser" + sousZone.tailleSousZone);
                                }
                                if (sousZone.typeDeDonneeString === "X") {
                                    textField.setAttribute("type", "text");
                                    textField.setAttribute("pattern", "[a-zA-Z0-9]+");
                                    textField.setAttribute("title", "Veuillez respecter le format");
                                }
                                if (sousZone.typeDeDonneeString === "A") {

                                    textField.setAttribute("type", "text");
                                    textField.setAttribute("pattern", "[A-Za-z]{1," + sousZone.tailleSousZone + "}");
                                    textField.setAttribute("title", "Veuillez respecter le format! seul les valeurs alphabtiques sont acceptées");
                                }

                                textField.setAttribute("required", "true");
                                textField.style.width = "150px";

                                var formGroupDiv = document.createElement("DIV");
                                formGroupDiv.setAttribute("class", "form-group col-lg-2");

                                var label = document.createElement("LABEL");
                                var labelDiv = document.createElement("DIV");
                                labelDiv.style.height = "50px";
                                label.setAttribute("class", "control-label");
                                var labelText = document.createTextNode(sousZone.intitule + " :");
//                                label.style.padding ="4% 0% 20% 0%";
                               //label.style.height = "50px";
                               //label.style.lineHeight ="26px";
                               labelDiv.style.fontSize = "12px";
                               labelDiv.style.paddingTop = "5px";
                               labelDiv.setAttribute("class","nicescroll");
                               //labelDiv.style.textOverflow= "ellipsis";
                               //labelDiv.style.whiteSpace= "nowrap";
                               labelDiv.style.overflow= "-webkit-paged-x";
                               //labelDiv.style.width= "150px";
                               //labelDiv.style.display= "block";
                             
                             
                               // labelDiv.style.backgroundColor = "red";
                                //label.appendChild(labelText);
                                labelDiv.appendChild(labelText);
                                formGroupDiv.appendChild(labelDiv);

                                var inputDiv = document.createElement("DIV");
                                inputDiv.appendChild(textField);

                                formGroupDiv.appendChild(inputDiv);

                                // Ajout des inputs au Div
                                previewDiv.appendChild(formGroupDiv);

                                // ajout de separateur au apres la derniere sous zone d'une zone
                                var spanDiv = document.createElement("DIV");
                                spanDiv.style.padding = "7% 0% 0px 0px";
                                var indexZoneCourante = data.listZone.indexOf(zone);
                                if (indexSousZone === zone.listSousZone.length - 1 && indexZoneCourante !== data.listZone.length - 1) {
                                    var span = document.createElement("SPAN");
                                    var spanText = document.createTextNode(zone.separateur);
                                    span.appendChild(spanText);
                                    // Ajout des séparateurs au Div
                                    spanDiv.appendChild(span);
                                }
                                previewDiv.appendChild(spanDiv);
                            });
                        }
                    });
                }else{
                    var t = document.createTextNode(data.intitule);
                    titreStructure.appendChild(t);
                    var labelEmpty = document.createElement("H4");
                    labelEmpty.style.paddingLeft="28%";
                    labelEmpty.style.paddingRight="28%";
                    labelEmpty.style.fontWeight = "bold";
                    var labelEmptyText = document.createTextNode("Cette structure de contrôle n'a pas de zone");
                    labelEmpty.appendChild(labelEmptyText);
                    previewDiv.appendChild(labelEmpty);
                    previewDiv.style.textAling="center";
                }
                $("#form_id input").on("keyup change", function () {
                    let elt = $(this);
                    let mx = parseInt(elt.attr("max"));
                    let valeur = parseInt(elt.val());
                    if (valeur > mx) {
                        elt.val(mx);
                    }
                });
            },
            function (error) {
                console.log("Erreur " + error);
            });

    function getMaxNumber(taille) {
        var number = (Math.pow(10, taille) - 1);
        return number;
    }
}

function submitValue() {
    $('#form_id').submit(function () {
        showAllDetail();
        return false;
    });
}

function showAllDetail() {
    var sousZoneH = document.getElementById("previewLabel");
    sousZoneH.innerHTML = '';
    var allTextValue = "";

    $('#form_id input, #form_id span').each(function () {
        var input = $(this);
        allTextValue += input.val() + input.text();

    });
    var t = document.createTextNode(allTextValue);
    sousZoneH.appendChild(t);
}

