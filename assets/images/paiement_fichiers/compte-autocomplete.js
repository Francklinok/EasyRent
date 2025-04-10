/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//To select country name
function selectCountry(val) {
    $("#search-box").val(val);
    $("#suggesstion-box").hide();
}

function treat(data) {
    var chaine = "";
    for (var i = 0; i < data.length; i++) {
        var id = data[i].id;
        var nom = data[i].user.firstName;
        var prenom = data[i].user.lastName;
        var alias = data[i].user.nameAlias;
        chaine = chaine + "<span style='padding:1px;' onClick=" + "selectCompte('" + id + "')" + ">&nbsp;&nbsp;&nbsp;" + id + " : " + prenom + " " + nom + ", " + alias + "</span><hr/>";
    }
    return chaine;
}

function treat_retrait(data) {
    var chaine = "";
    for (var i = 0; i < data.length; i++) {
        var id = data[i].id;
        var nom = data[i].user.firstName;
        var prenom = data[i].user.lastName;
        var alias = data[i].user.nameAlias;
        chaine = chaine + "<span style='padding:1px;' onClick=" + "selectCompte2('" + id + "')" + ">&nbsp;&nbsp;&nbsp;" + id + " : " + prenom + " " + nom + ", " + alias + "</span><hr/>";
    }
    return chaine;
}

function treat_virement3(data) {
    var chaine = "";
    for (var i = 0; i < data.length; i++) {
        var id = data[i].id;
        var nom = data[i].user.firstName;
        var prenom = data[i].user.lastName;
        var alias = data[i].user.nameAlias;
        chaine = chaine + "<span style='padding:1px;' onClick=" + "selectCompte3('" + id + "')" + ">&nbsp;&nbsp;&nbsp;" + id + " : " + prenom + " " + nom + ", " + alias + "</span><hr/>";
    }
    return chaine;
}

function treat_virement4(data) {
    var chaine = "";
    for (var i = 0; i < data.length; i++) {
        var id = data[i].id;
        var nom = data[i].user.firstName;
        var prenom = data[i].user.lastName;
        var alias = data[i].user.nameAlias;
        chaine = chaine + "<span style='padding:1px;' onClick=" + "selectCompte4('" + id + "')" + ">&nbsp;&nbsp;&nbsp;" + id + " : " + prenom + " " + nom + ", " + alias + "</span><hr/>";
    }
    return chaine;
}


