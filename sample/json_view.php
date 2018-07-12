<?php
    header('Content-Type: application/json');
    $json_options = (!@ci()->save_queries || @$data['nopretty'])? null : JSON_PRETTY_PRINT;
    unset($data['nopretty']);
?>
<?= json_encode($data, $json_options) ?>
