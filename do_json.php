<?php

    // get config
    $config = json_decode(file_get_contents('config.json'));
    if (!$config) die("config can't loaded");

    mb_internal_encoding($config->encoding);

    if (isset($_GET['job']))
    {
        $db_path = $config->database_path;

        $job = $_GET['job'];

        $output = [];
        $output["error"] = '';

        switch ($job)
        {
            case "fetch": // get data

                if (!file_exists($db_path) || file_get_contents($db_path) == '') file_put_contents($db_path, '[]');

                $data = json_decode(file_get_contents($db_path));
                if (!$data) $data = [];

                $recordsTotal = count($data);

                $data = array_reverse($data); // last data shows first (default view)

                // SEARCH
                if (isset($_POST["search"]["value"]) && $_POST["search"]["value"] != '')
                {
                    $data = array_reverse($data);

                    $search = $_POST["search"]["value"];

                    $search_data = [];

                    foreach ($data as $d)
                    {
                        if ( strstr(strval($d->{$config->id_field_name}), strval($search)) )
                        {
                            $search_data[] = $d;
                            break;
                        }
                        else
                        {
                            foreach($config->columns as $column)
                            {
                                if ($column->searchable && strstr( strval($d->{$column->id}), strval($search)) )
                                $search_data[] = $d;
                                break;
                            }
                        }
                    }

                    $data = $search_data;
                }

                $recordsFiltered = count($data);

                // ORDER
                if (isset($_POST["order"]))
                {
                    $order_column = $_POST["order"][0]['column']; // column index
                    $order_dir = $_POST["order"][0]['dir']; // order direction

                    if ($order_column >= 0)
                    {
                        global $col;

                        if ($order_column == 0) // id column
                        {
                            $col = $config->id_field_name;
                        }
                        else
                        {
                            $i = 1;
                            foreach($config->columns as $column)
                            {
                                if ($i == $order_column)
                                {
                                    $col = $column->id;
                                    break;
                                }
                                $i++;
                            }
                        }

                        if ($order_dir == "asc")
                        {
                            usort($data, function ($a, $b)
                            {
                                global $col;
                                return $a->{$col} <=> $b->{$col};
                            });
                        }
                        else
                        {
                            usort($data, function ($a, $b)
                            {
                                global $col;
                                return $b->{$col} <=> $a->{$col};
                            });
                        }
                    }
                }

                // LIMIT
                if($_POST["length"] != -1)
                {
                    $start = intval($_POST["start"]); // from 0
                    $length = intval($_POST["length"]);

                    $limit_data = [];

                    $i = 0;
                    foreach ($data as $d)
                    {
                        if ($i >= $start && $i < $start + $length) $limit_data[] = $d;
                        $i++;
                    }

                    $data = $limit_data;
                }

                // FILL ARRAY
                $responsedata = [];
                foreach ($data as $d)
                {
                    $sub_array = array();

                    $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $config->id_field_name . '">' . $d->{$config->id_field_name} . '</div>';

                    foreach($config->columns as $column)
                    {
                        if ($column->type == "file")
                        {
                            $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $column->id . '"><a href="' . $config->uploads_path . $d->{$column->id} . '" target="_blank">' . $d->{$column->id} . '</a></div>';
                        }
                        elseif ($column->type == "image")
                        {
                            $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $column->id . '" class="text-center">
                                                <a href="javascript:openImage(\'' . $config->uploads_path . $d->{$column->id} . '\');">' .
                                                    ($d->{$column->id} != '' ? '<img class="list-image img-fluid" src="' . $config->uploads_path . $d->{$column->id} . '" />' : '') .
                                                '</a>
                                            </div>';
                        }
                        elseif ($column->type == "sound")
                        {
                            $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $column->id . '" class="text-center">
                                                <a href="javascript:openSound(\'' . $config->uploads_path . $d->{$column->id} . '\');">' .
                                                    $d->{$column->id} .
                                                '</a>
                                            </div>';
                        }
                        elseif ($column->type == "video")
                        {
                            $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $column->id . '" class="text-center">
                                                <a href="javascript:openVideo(\'' . $config->uploads_path . $d->{$column->id} . '\');">' .
                                                    $d->{$column->id} .
                                                '</a>
                                            </div>';
                        }
                        else
                        {
                            $sub_array[] = '<div data-id="' . $d->{$config->id_field_name} . '" data-column="' . $column->id . '">' . $d->{$column->id} . '</div>';
                        }
                    }

                    $sub_array[] = '<div class="d-flex justify-content-around">
                                        <button type="button" class="btn btn-success btn-xs update" data-id="' . $d->{$config->id_field_name} . '">Edit</button>
                                        <button type="button" class="btn btn-danger btn-xs delete" data-id="' . $d->{$config->id_field_name} . '">Delete</button>
                                    </div>';

                    $responsedata[] = $sub_array;
                }

                header('Content-Type: application/json');

                $output = array(
                    "draw"    => intval($_POST["draw"]),
                    "recordsTotal"  =>  $recordsTotal,
                    "recordsFiltered" => $recordsFiltered,
                    "data"    => $responsedata,
                    "data_simple" => $data
                );

                break;

            case "insert": // insert row

                $data = json_decode(file_get_contents($db_path));

                $id = 1;
                if (count($data) > 0) $id = end($data)->{$config->id_field_name} + 1;

                $new = new stdClass();
                $new->{$config->id_field_name} = $id;
                foreach($config->columns as $column)
                {
                    if ($column->type == "file" || $column->type == "image" || $column->type == "sound" || $column->type == "video")
                    {
                        if ($_FILES[$column->id]['name'])
                        {
                            $path_parts = pathinfo($_FILES[$column->id]['name']);
                            $file_new_name = $column->id . '_' . $id . '.' . $path_parts['extension'];

                            move_uploaded_file($_FILES[$column->id]['tmp_name'], $config->uploads_path . $file_new_name);

                            $new->{$column->id} = $file_new_name;
                        }
                        else
                        {
                            $new->{$column->id} =  '';
                        }
                    }
                    else
                    {
                        $new->{$column->id} = trim($_POST[$column->id]);
                    }
                }
                $data[] = $new;

                $content = json_encode($data, ($config->json_pretty_print ? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE : JSON_UNESCAPED_UNICODE));
                file_put_contents($db_path, $content);

                $output['id'] = $id;

                break;

            case "update": // update row

                if(isset($_GET["id"]))
                {
                    $data = json_decode(file_get_contents($db_path));

                    $id = $_GET["id"];

                    foreach ($data as $key => $value)
                    {
                        if ($value->{$config->id_field_name} == $id)
                        {
                            foreach($config->columns as $column)
                            {
                                if ($column->type == "file" || $column->type == "image" || $column->type == "sound" || $column->type == "video")
                                {
                                    if ($_FILES[$column->id]['name'])
                                    {
                                        $path_parts = pathinfo($_FILES[$column->id]['name']);
                                        $file_new_name = $column->id . '_' . $id . '.' . $path_parts['extension'];

                                        move_uploaded_file($_FILES[$column->id]['tmp_name'], $config->uploads_path . $file_new_name);

                                        $data[$key]->{$column->id} = $file_new_name;
                                    }
                                    else
                                    {
                                        if (isset($_POST[$column->id . '_f']) && $_POST[$column->id . '_f'] != '')
                                        {
                                            $data[$key]->{$column->id} = $_POST[$column->id . '_f'];
                                        }
                                        else
                                        {
                                            @unlink($config->uploads_path . $data[$key]->{$column->id});
                                            $data[$key]->{$column->id} =  '';
                                        }
                                    }
                                }
                                else
                                {
                                    $data[$key]->{$column->id} = trim($_POST[$column->id]);
                                }
                            }
                            break;
                        }
                    }

                    $content = json_encode($data, ($config->json_pretty_print ? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE : JSON_UNESCAPED_UNICODE));
                    file_put_contents($db_path, $content);

                    $output['id'] = $id;
                }
                else
                {
                    $output['error'] = "ID not set!";
                }

                break;

            case "delete": // delete row

                if(isset($_POST["id"]))
                {
                    $data = json_decode(file_get_contents($db_path));

                    $delete_id = $_POST['id'];

                    $newdata = [];
                    foreach ($data as $key => $value)
                    {
                        if ($value->{$config->id_field_name} == $delete_id)
                        {
                            foreach($config->columns as $column)
                            {
                                if ($column->type == "file" || $column->type == "image" || $column->type == "sound" || $column->type == "video") @unlink($config->uploads_path . $value->{$column->id});
                            }
                        }

                        if ($value->{$config->id_field_name} != $delete_id)
                        {
                            $newdata[] = $value;
                        }
                    }
                    $data = $newdata;

                    $content = json_encode($data, ($config->json_pretty_print ? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE : JSON_UNESCAPED_UNICODE));
                    file_put_contents($db_path, $content);

                    $output['id'] = $delete_id;
                }
                else
                {
                    $output['error'] = "ID not set!";
                }

                break;

            default:
                $output["error"] = "Error!";
                break;
        }

        header('Content-Type: application/json');

        echo json_encode($output);

        die();
    }

?>