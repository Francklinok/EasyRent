/* 
 * @author Hervé Mofiala LOKOSSOU
 * @date 26/06/1995
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function ($) {

    'use strict';

    var EditableTable = {
        options: {
            addButton: '#addToTable',
            table: '#editable',
            dialog: {
                wrapper: '#dialog',
                cancelButton: '#dialogCancel',
                confirmButton: '#dialogConfirm',
            }
        },
        load: function () {
            this.setVars().construire().events();
        },
        initialize: function () {
            this
                    .setVars()
                    .build()
                    .events();
        },
        setVars: function () {
            this.$table = $(this.options.table);
            this.$addButton = $(this.options.addButton);

            // dialog
            this.dialog = {};
            this.dialog.$wrapper = $(this.options.dialog.wrapper);
            this.dialog.$cancel = $(this.options.dialog.cancelButton);
            this.dialog.$confirm = $(this.options.dialog.confirmButton);

            return this;
        },
        build: function () {
            this.datatable = this.$table.DataTable({
                aoColumns: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    {"bSortable": false}
                ]
            });

            window.dt = this.datatable;

            return this;
        },
        construire: function () {
            this.datatable = this.$table.DataTable({
                "ajax": {
                    "url": "/abs-start-up/api/example/aadata",
                    "dataSrc": function (json) {
                        for (var i = 0, ien = json.data.length; i < ien; i++) {
                            json.data[i][0] = '<a href="/message/' + json.data[i][0] + '>View message</a>';
                        }
                        return json.data;
                    }
                },
//                "sAjaxSource": $("#editable").attr("data-resource"),
//                "sAjaxSource": "/abs-start-up/api/example/aadata",
                aoColumns: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    {"bSortable": false}
                ]
            });

            window.dt = this.datatable;
            return this;
        },
        events: function () {
            var _self = this;

            this.$table
                    .on('click', 'a.save-row', function (e) {
                        e.preventDefault();

                        _self.rowSave($(this).closest('tr'));
                    })
                    .on('click', 'a.cancel-row', function (e) {
                        e.preventDefault();

                        _self.rowCancel($(this).closest('tr'));
                    })
                    .on('click', 'a.edit-row', function (e) {
                        e.preventDefault();

                        _self.rowEdit($(this).closest('tr'));
                    })
                    .on('click', 'a.remove-row', function (e) {
                        e.preventDefault();

                        var $row = $(this).closest('tr');

                        $.magnificPopup.open({
                            items: {
                                src: _self.options.dialog.wrapper,
                                type: 'inline'
                            },
                            preloader: false,
                            modal: true,
                            callbacks: {
                                change: function () {
                                    _self.dialog.$confirm.on('click', function (e) {
                                        e.preventDefault();

                                        _self.rowRemove($row);
                                        $.magnificPopup.close();
                                    });
                                },
                                close: function () {
                                    _self.dialog.$confirm.off('click');
                                }
                            }
                        });
                    });

            this.$addButton.on('click', function (e) {
                e.preventDefault();

                _self.rowAdd();
            });

            this.dialog.$cancel.on('click', function (e) {
                e.preventDefault();
                $.magnificPopup.close();
            });

            return this;
        },
        // ==========================================================================================
        // ROW FUNCTIONS
        // ==========================================================================================
        rowAdd: function () {
            this.$addButton.attr({'disabled': 'disabled'});

            var actions,
                    data,
                    $row;

            actions = [
                '<a href="#" class="hidden on-editing save-row"><i class="fa fa-save"></i></a>',
                '<a href="#" class="hidden on-editing cancel-row"><i class="fa fa-times"></i></a>',
                '<a href="#" class="on-default edit-row"><i class="fa fa-pencil"></i></a>',
                '<a href="#" class="on-default remove-row"><i class="fa fa-trash-o"></i></a>'
            ].join(' ');

            data = this.datatable.row.add(['', '', '', actions]);
            $row = this.datatable.row(data[0]).nodes().to$();

            $row
                    .addClass('adding')
                    .find('td:last')
                    .addClass('actions');

            this.rowEdit($row);

            this.datatable.order([0, 'asc']).draw(); // always show fields
        },
        rowCancel: function ($row) {
            var _self = this,
                    $actions,
                    i,
                    data;

            if ($row.hasClass('adding')) {
                this.rowRemove($row);
            } else {

                data = this.datatable.row($row.get(0)).data();
                this.datatable.row($row.get(0)).data(data);

                $actions = $row.find('td.actions');
                if ($actions.get(0)) {
                    this.rowSetActionsDefault($row);
                }

                this.datatable.draw();
            }
        },
        rowEdit: function ($row) {
            var _self = this,
                    data;

            data = this.datatable.row($row.get(0)).data();

            $row.children('td').each(function (i) {
                var $this = $(this);

                if ($this.hasClass('actions')) {
                    _self.rowSetActionsEditing($row);
                } else {
                    $this.html('<input type="text" class="form-control input-block" value="' + data[i] + '"/>');
                }
            });
        },
        rowSave: function ($row) {
            var _self = this,
                    $actions,
                    values = [];

            if ($row.hasClass('adding')) {
                this.$addButton.removeAttr('disabled');
                $row.removeClass('adding');
            }

            values = $row.find('td').map(function () {
                var $this = $(this);

                if ($this.hasClass('actions')) {
                    _self.rowSetActionsDefault($row);
                    return _self.datatable.cell(this).data();
                } else {
                    return $.trim($this.find('input').val());
                }
            });

            this.datatable.row($row.get(0)).data(values);

            $actions = $row.find('td.actions');
            if ($actions.get(0)) {
                this.rowSetActionsDefault($row);
            }

            this.datatable.draw();
        },
        rowRemove: function ($row) {
            if ($row.hasClass('adding')) {
                this.$addButton.removeAttr('disabled');
            }

            this.datatable.row($row.get(0)).remove().draw();
        },
        rowSetActionsEditing: function ($row) {
            $row.find('.on-editing').removeClass('hidden');
            $row.find('.on-default').addClass('hidden');
        },
        rowSetActionsDefault: function ($row) {
            $row.find('.on-editing').addClass('hidden');
            $row.find('.on-default').removeClass('hidden');
        }

    };

    $(function () {
        EditableTable.load();
    });



}).apply(this, [jQuery]);

function treat_me(rows) {
    var codList = [];
    for (var i = 0; i < rows.length; i++) {
        var tds = $(rows[i]).children("td");
        var code = $(tds[0]).html();
        var valeur = $(tds[1]).html();
        var date = $(tds[2]).html();
        var element = {codeCodif: code, codeValeur: valeur, dateBegin: date};
        codList.push(element);
    }
    ;
    return codList;

}

$(document).ready(function () {
    var lignes = $("#editable tbody tr");
    var colonnes = $(lignes[0]).children("td");
    var colonnes_size = colonnes.length;
    var _url = $("#editable").attr("data-resource");
    var result;
//    $.ajax({
//        'url': _url,
//        type: 'GET',
//        success: function (data, textStatus, jqXHR) {
//
//            var str = "";
//            $.each(data, function (i) {
//                var model = $($("#editable tbody tr")[0]).clone();
//                model.removeAttr("hidden");
//                console.log(data[i]);
//                $.each(model.children("td"), function (j) {
//                    $(this).html(data[i][$(colonnes[j]).attr("colonne")]);
//                });
//                $("#editable tbody").append(model);
//
//            });
//            $("#editable tbody").append(str);
//        }, error: function (jqXHR, textStatus, errorThrown) {
//            result = [];
//        }
//    });
//     for (var i = 0; i < lignes.length; i++) {
//            var colonnes = $(lignes[i]).children("td");
//            for (var j = 0; j < colonnes.length; j++) {
//                console.log(i + ' --Yo-- ' + j);
//                $(colonnes[j]).html(i + ' --Yo-- ' + j);
//            }
//        }

});


