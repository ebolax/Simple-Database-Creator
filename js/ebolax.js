
var datatable; // DataTable Object
var data; // JSON data
var config; // config JSON

// DOCUMENT READY
// ****************************************************************************************************************************************************************************************************
$(function ()
{
    // load config
    $.ajax({
        url: 'config.json?r=' + Math.random(),
        dataType: 'json',
        beforeSend: function()
        {
            alertMessage("Loading config.json", "success");
        },
        success: function(response)
        {
            alertMessage("config.json loaded", "success");

            config = response;

            // config columns type control
            for (var a in config.columns)
            {
                if (!config.columntypes.includes(config.columns[a].type))
                {
                    alert("Column Type Error! Error In Column ID: " + config.columns[a].id);
                    return;
                }
            }

            for (var a in config.columns)
            {
                if (config.columns[a].id == config.id_field_name)
                {
                    alert("Column id cannot be '" + config.id_field_name + "', Error in Column Name: " + config.columns[a].name);
                    return;
                }
            }

            var colids = [];
            for (var a in config.columns)
            {
                colids.push(config.columns[a].id);
            }
            if (hasDuplicates(colids))
            {
                alert("There is Duplicated Column IDs!");
                return;
            }

            setup(); // setup first

            fetch_data(); // after setup
        },
        error: function(error)
        {
            alertMessage("config.json Load Error!");
        }
    });
});

// SETUP
// ****************************************************************************************************************************************************************************************************
function setup()
{
    // WRITE VERSION
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    // load package.json
    $.ajax({
        url: 'package.json?r=' + Math.random(),
        dataType: 'json',
        success: function(response)
        {
            console.log("package.json loaded");
            $('#version').text(response.version);
        },
        error: function(error)
        {
            console.log('package.json cannot loaded');
        }
    });

    // SET TABLE HEADS
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    var table_heads = "";
    table_heads += '<th class="column-id">' + config.id_field_name + '</th>'; // id column
    for (var a in config.columns)
    {
        table_heads += '<th>' + config.columns[a].name + '</th>'; // id column
    }
    table_heads += '<th class="column-edit">Edit / Delete</th>'; // edit / delete column
    $('#tr').html(table_heads);

    // SET FORM CONTENT
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    var form_fields = "";

    for (var a in config.columns)
    {
        form_fields += '<div class="form-group">';
        form_fields += '<label for="' + config.columns[a].id  + '"><h6 class="mb-0 text-info"><i class="fa ' + config.columns[a].icon + ' mr-1"></i> ' + config.columns[a].name + ' (' + config.columns[a].id + ')</h6>' + (config.columns[a].description ? '<p class="text-info mb-1">' + config.columns[a].description + '</p>' : '') + '</label>';

            switch (config.columns[a].type)
            {
                case "textbox":
                case "date":
                case "time":

                    form_fields += '<input type="' + (config.columns[a].isEmail ? "email" : "text") + '" class="form-control mb-3 focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' />';

                    break;

                case "number":

                    form_fields += '<input type="text" class="form-control mb-3 focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' />';

                    break;

                case "textarea":

                    form_fields += '<textarea class="form-control mb-3 focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" rows="3" ' + (config.columns[a].required ? 'required' : '')  + '>' + config.columns[a].default_value  + '</textarea>';

                    break;

                case "select":

                    form_fields += '<select class="form-control mb-3 focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" ' + (config.columns[a].required ? 'required' : '')  + '>';

                                        form_fields += '<option value="">Please Select</option>';

                                        for (b in config.columns[a].values)
                                        {
                                            form_fields += '<option value="' + config.columns[a].values[b] + '" ' + (config.columns[a].values[b] == config.columns[a].default_value ? 'selected' : '') + '>' + b + '</option>';
                                        }

                    form_fields += '<select>';

                    break;

                case "file":

                    form_fields += '<input type="hidden" id="' + config.columns[a].id  + '_f" name="' + config.columns[a].id  + '_f" value="" />';
                    form_fields += '<p class="mb-2"><a id="' + config.columns[a].id  + '_link" href="" target="_blank"></a></p>';
                    form_fields += '<div class="custom-file">';
                    form_fields += '    <label class="custom-file-label" for="' + config.columns[a].id  + '"></label>';
                    form_fields += '    <input type="file" class="custom-file-input focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' />';
                    form_fields += '</div>';
                    form_fields += '<div class="text-center mt-2"><a id="' + config.columns[a].id  + '_del" name="' + config.columns[a].id  + '_del" data-id="' + config.columns[a].id  + '" class="btn btn-danger text-white btn-clear">Clear</a></div>';

                    break;

                case "image":

                    form_fields += '<input type="hidden" id="' + config.columns[a].id  + '_f" name="' + config.columns[a].id  + '_f" value="" />';
                    form_fields += '<p class="mb-2 text-center"><a id="' + config.columns[a].id  + '_link" href=""><img class="image img-fluid" id="' + config.columns[a].id  + '_image" src="" /></a></p>';
                    form_fields += '<div class="custom-file">';
                    form_fields += '    <label class="custom-file-label" for="' + config.columns[a].id  + '"></label>';
                    form_fields += '    <input type="file" class="custom-file-input focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' accept="image/*" />';
                    form_fields += '</div>';
                    form_fields += '<div class="text-center mt-2"><a id="' + config.columns[a].id  + '_del" name="' + config.columns[a].id  + '_del" data-id="' + config.columns[a].id  + '" class="btn btn-danger text-white btn-clear">Clear</a></div>';

                    break;

                case "sound":

                    form_fields += '<input type="hidden" id="' + config.columns[a].id  + '_f" name="' + config.columns[a].id  + '_f" value="" />';
                    form_fields += '<p class="mb-2 text-center"><a id="' + config.columns[a].id  + '_link" href=""></a></p>';
                    form_fields += '<div class="custom-file">';
                    form_fields += '    <label class="custom-file-label" for="' + config.columns[a].id  + '"></label>';
                    form_fields += '    <input type="file" class="custom-file-input focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' accept="audio/*" />';
                    form_fields += '</div>';
                    form_fields += '<div class="text-center mt-2"><a id="' + config.columns[a].id  + '_del" name="' + config.columns[a].id  + '_del" data-id="' + config.columns[a].id  + '" class="btn btn-danger text-white btn-clear">Clear</a></div>';

                    break;

                case "video":

                    form_fields += '<input type="hidden" id="' + config.columns[a].id  + '_f" name="' + config.columns[a].id  + '_f" value="" />';
                    form_fields += '<p class="mb-2 text-center"><a id="' + config.columns[a].id  + '_link" href=""></a></p>';
                    form_fields += '<div class="custom-file">';
                    form_fields += '    <label class="custom-file-label" for="' + config.columns[a].id  + '"></label>';
                    form_fields += '    <input type="file" class="custom-file-input focus" id="' + config.columns[a].id  + '" name="' + config.columns[a].id  + '" value="' + config.columns[a].default_value  + '" ' + (config.columns[a].required ? 'required' : '')  + ' accept="video/*" />';
                    form_fields += '</div>';
                    form_fields += '<div class="text-center mt-2"><a id="' + config.columns[a].id  + '_del" name="' + config.columns[a].id  + '_del" data-id="' + config.columns[a].id  + '" class="btn btn-danger text-white btn-clear">Clear</a></div>';

                    break;
            }

        form_fields += '</div>'; // close div class form-group
    }

    $('#modal_form .modal-body').html(form_fields);

    // number format
    for (var a in config.columns)
    {
        if (config.columns[a].type == "number")
        {
            $('#' + config.columns[a].id).on("blur", function()
            {
                var val = $(this).val();

                if (config.columns[a].decimals > 0)
                {
                    val = parseFloat(val);
                    val = val.toFixed(config.columns[a].decimals);
                }
                else
                {
                    val = parseInt(val);
                }

                console.log(val);
                if (Number.isNaN(val)) val = 0;

                $(this).val(val);
            });
        }
    }

    // set datepickers
    for (var a in config.columns)
    {
        if (config.columns[a].type == "date")
        {
            $('#' + config.columns[a].id).datepicker({
                dateFormat: config.columns[a].dateFormat
            });
        }
    }

    // set timepickers
    for (var a in config.columns)
    {
        if (config.columns[a].type == "time")
        {
            $('#' + config.columns[a].id).timepicker({
                timeFormat: config.columns[a].timeFormat,
                zindex: 9999,
                show2400: true
            });
        }
    }

    // set clear buttons click
    $(".btn-clear").on("click", function()
    {
        var column_id = $(this).data('id');

        var type = "file";
        for (var a in config.columns)
        {
            if (column_id == config.columns[a].id) type = config.columns[a].type;
        }

        $("#form #" + column_id).siblings(".custom-file-label").html('');
        if (type == "file" || type == "sound" || type == "video") $("#form #" + column_id + "_link").text('');
        $("#form #" + column_id + "_link").attr('href', '');
        $("#form #" + column_id + "_f").val('');
        $("#form #" + column_id + "_image").attr("src", '' );
        $("#form #" + column_id + "_image").hide();
        $("#form #" + column_id + "_sound").attr("src", '' );
        $("#form #" + column_id + "_sound").hide();
        $("#form #" + column_id + "_video").attr("src", '' );
        $("#form #" + column_id + "_video").hide();
        $("#form #" + column_id).val('');
    });

    // write file name while input change
    $(".custom-file-input").on("change", function()
    {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

    // set tinymce
    for (var a in config.columns)
    {
        if (config.columns[a].type == "textarea" && config.columns[a].use_editor)
        {
            $('#' + config.columns[a].id).tinymce({
                script_url : 'tinymce/tinymce.min.js',
                theme : "silver",
                toolbar_items_size: 'small',
                height: 400,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'code | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify'
             });
        }
    }

    // set image visible
    image_visible_control();

    // FORM SUBMIT
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    $("#form").on('submit', function(e)
    {
        e.preventDefault();

        var job = $(this).data("job");

        $.ajax({
            type: 'POST',
            url: config.server + "?job=" + job + "&id=" + $(this).data("id"),
            data: new FormData(this),
            dataType: 'json',
            contentType: false,
            cache: false,
            processData:false,
            beforeSend: function()
            {
                $('#submit').attr("disabled","disabled");
            },
            success: function(response)
            {
                if(response.error != "")
                {
                    alertMessage("Error: " + response.error, "danger");
                }
                else
                {
                    console.log( job + " done : " + response.id);
                    alertMessage("Row Successfully " + (job == "insert" ? "Inserted" : "Updated") + " - id: " + response.id, "success");
                }

                $('#modal_form').modal("hide");
                $("#submit").removeAttr("disabled");

                fetch_data();
            },
            error: function(error)
            {
                alertMessage("Error: " + error, "danger");
                console.log('form submit error', error);
            }
        });
    });

    // DELETE BUTTON CLICK
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    $(document).on('click', '.delete', function ()
    {
        var id = $(this).data("id");

        console.log("delete start : " + id);

        if (confirm("Are you sure you want to remove row id " + id + "?"))
        {
            $.ajax({
                url: config.server + "?job=delete",
                method: "POST",
                data: { id: id },
                success: function (response)
                {
                    console.log("delete done : " + response.id);
                    alertMessage("Row Successfully Deleted - id: " + response.id, "success");
                    $('#data_table').DataTable().destroy();
                    fetch_data();
                },
                error: function(error)
                {
                    alertMessage("Error: " + error, "danger");
                    console.log('delete error', error);
                }
            });
        }
    });


    // UPDATE BUTTON CLICK
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    $(document).on('click', '.update', function ()
    {
        var id = $(this).data('id');

        $('#modal_form .modal-title').text("Update Row " + id);

        var form_data = {};

        for (var a in data)
        {
            if (id == data[a][config.id_field_name]) form_data = data[a];
        }

        $("#form").data("job", "update");
        $("#form").data("id", id);

        $('#form')[0].reset();
        $("textarea").text('');
        $("input").prop( "checked", false );

        for (var a in config.columns)
        {
            switch (config.columns[a].type)
            {
                case "textbox":
                case "number":
                case "select":
                case "date":
                case "time":

                    $("#form #" + config.columns[a].id).val(form_data[config.columns[a].id]);

                    break;

                case "textarea":

                    $("#form #" + config.columns[a].id).text(form_data[config.columns[a].id]);

                    break;

                case "file":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text(form_data[config.columns[a].id]).attr('href', config.uploads_path + form_data[config.columns[a].id]);
                    $("#form #" + config.columns[a].id + "_f").val(form_data[config.columns[a].id]);

                    break;

                case "image":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").attr('href', 'javascript: openImage("' + config.uploads_path + form_data[config.columns[a].id] + '");');
                    $("#form #" + config.columns[a].id + "_f").val(form_data[config.columns[a].id]);
                    $("#form #" + config.columns[a].id + "_image").attr("src", (form_data[config.columns[a].id] != '' ? config.uploads_path + form_data[config.columns[a].id] : '') );
                    if (form_data[config.columns[a].id] != "")
                    {
                        $("#form #" + config.columns[a].id + "_image").show();
                    }
                    else
                    {
                        $("#form #" + config.columns[a].id + "_image").hide();
                    }

                    break;

                case "sound":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text(form_data[config.columns[a].id]).attr('href', 'javascript: openSound("' + config.uploads_path + form_data[config.columns[a].id] + '");');
                    $("#form #" + config.columns[a].id + "_f").val(form_data[config.columns[a].id]);
                    $("#form #" + config.columns[a].id + "_sound").attr("src", (form_data[config.columns[a].id] != '' ? config.uploads_path + form_data[config.columns[a].id] : '') );
                    if (form_data[config.columns[a].id] != "")
                    {
                        $("#form #" + config.columns[a].id + "_sound").show();
                    }
                    else
                    {
                        $("#form #" + config.columns[a].id + "_sound").hide();
                    }

                    break;

                case "video":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text(form_data[config.columns[a].id]).attr('href', 'javascript: openVideo("' + config.uploads_path + form_data[config.columns[a].id] + '");');
                    $("#form #" + config.columns[a].id + "_f").val(form_data[config.columns[a].id]);
                    $("#form #" + config.columns[a].id + "_video").attr("src", (form_data[config.columns[a].id] != '' ? config.uploads_path + form_data[config.columns[a].id] : '') );
                    if (form_data[config.columns[a].id] != "")
                    {
                        $("#form #" + config.columns[a].id + "_video").show();
                    }
                    else
                    {
                        $("#form #" + config.columns[a].id + "_video").hide();
                    }

                    break;
            }
        }

        // set image visible
        image_visible_control();

        console.log("update start : " + id);

        $('#modal_form').modal("show");
    });


    // ADD (INSERT) BUTTON CLICK
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    $(document).on('click', '#btn_add', function ()
    {
        $('#modal_form .modal-title').text("Add New Row");

        $("#form").data("job", "insert");

        $('#form')[0].reset();
        $("textarea").text('');

        for (var a in config.columns)
        {
            switch (config.columns[a].type)
            {
                case "textbox":
                case "number":
                case "select":
                case "date":
                case "time":

                    $("#form #" + config.columns[a].id).val(config.columns[a].default_value);

                    break;

                case "textarea":

                    $("#form #" + config.columns[a].id).text(config.columns[a].default_value);

                    break;

                case "file":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text('').attr('href', '');
                    $("#form #" + config.columns[a].id + "_f").val('');

                    break;

                case "image":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").attr('href', '');
                    $("#form #" + config.columns[a].id + "_f").val('');
                    $("#form #" + config.columns[a].id + "_image").attr("src", '');
                    $("#form #" + config.columns[a].id + "_image").hide();

                    break;

                case "sound":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text('').attr('href', '');
                    $("#form #" + config.columns[a].id + "_f").val('');

                    break;

                case "video":

                    $("#form #" + config.columns[a].id).siblings(".custom-file-label").html('');
                    $("#form #" + config.columns[a].id + "_link").text('').attr('href', '');
                    $("#form #" + config.columns[a].id + "_f").val('');

                    break;
            }
        }

        setTimeout(function ()
        {
            $(".focus").get(0).focus();
        }, 100);

        // set image visible
        image_visible_control();

        console.log("insert start");

        $('#modal_form').modal("show");
    });

    // SHOW JSON DATA BUTTON CLICK
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------
    $(document).on('click', '#btn_showdata', function ()
    {
        var formattedData = JSON.stringify(data, null, '\t');
        $('#json_output').text(formattedData);

        $('#modal_data').modal("show");
    });
}


// FETCH DATA
// ****************************************************************************************************************************************************************************************************
function fetch_data()
{
    console.log("Fetch Data");

    $("#add").prop('disabled', true); // add row button is disable until complete fetching data

    if ( $.fn.dataTable.isDataTable('#data_table') )
    {
        $('#data_table').DataTable().destroy();
    }

    var searchable_false = [];
    var sortable_false = [];

    for (var a = 1 ; a <= config.columns.length ; a++)
    {
        var control = false;

        if ( config.columns[a - 1].type == "textarea" ||
             config.columns[a - 1].type == "select" ||
             config.columns[a - 1].type == "file" ||
             config.columns[a - 1].type == "date" ||
             config.columns[a - 1].type == "time" ||
             config.columns[a - 1].type == "image" ||
             config.columns[a - 1].type == "sound" ||
             config.columns[a - 1].type == "video") control = true;

        if (!config.columns[a - 1].searchable || control) searchable_false.push(a);
        if (!config.columns[a - 1].sortable || control) sortable_false.push(a);

        searchable_false.push(config.columns.length + 1);
        sortable_false.push(config.columns.length + 1);
    }

    var columnDefs = [];
    columnDefs.push( { "bSortable": false, "aTargets": sortable_false } );
    columnDefs.push( { "bSearchable": false, "aTargets": searchable_false } );
    columnDefs.push( { width: "30px", "targets": [0] } );
    columnDefs.push( { width: "80px", "targets": [config.columns.length + 1] } );
    for (var a in config.columns)
    {
        columnDefs.push( { width: (config.columns[a].width ? config.columns[a].width : "100px") , "targets": [parseInt(a) + 1] } );
    }
    console.log(columnDefs);

    datatable = $('#data_table').DataTable(
    {
        "processing": true,
        "serverSide": true,
        "order": [],
        "ajax": {
            url: config.server + "?job=fetch",
            type: "POST"
        },
        "aoColumnDefs": columnDefs,
        "pageLength": config.pageLength,
        "initComplete": function(settings, json)
        {
            data = json.data_simple;

            $("#add").prop('disabled', false);
        }
    });
}


// ADDITIONAL FUNCTIONS
// ****************************************************************************************************************************************************************************************************
function alertMessage(message, type)
{
    $('#alert_message').html('<div class="alert alert-' + type + '">' + message + '</div>');

    setTimeout(function ()
    {
        $('#alert_message').html('');
    }, 3000);
}

function hasDuplicates(arr)
{
    var counts = [];

    for (var i = 0; i <= arr.length; i++) {
        if (counts[arr[i]] === undefined) {
            counts[arr[i]] = 1;
        } else {
            return true;
        }
    }

    return false;
}

function image_visible_control()
{
    $('#form .image').each(function()
    {
        if ($(this).attr('src') == "")
        {
            $(this).hide();
        }
        else
        {
            $(this).show();
        }
    });
}

function openImage(src)
{
    lity(src);
}

function openSound(src)
{
    lity(src);
}

function openVideo(src)
{
    lity(src);
}