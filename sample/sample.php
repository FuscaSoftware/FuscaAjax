<?php
class Contoller
{
  public function ajax_action() {
    $this->data = [];
    $rows = [];
    for ($i = 0; $i < 5, $i++) {
        $rows[] = "<tr><td>$i</td><td>some sample content</td></tr>";
    }
    $this->data['html']['append'][".box_index .tbody"] = $output[] = implode("",$rows);
    $this->data['html']['value']["[name='filter[" . $box_index['modelname'] . "][skip]']"] = 5;
    $this->show_ajax();
  }
  
    /**
     * outputs json result
     * typically the last step in a Controller->action()-method
     *
     * @param array $data expects array which is given to the output as json
     * @param bool  $return
     *
     * @return object|string
     */
    public function show_ajax($data = null, $return = false) {
        if (is_null($data)) {
            $data = $this->data;
        }
        if (headers_sent() || !is_null(error_get_last())) {
            header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
            die("headers already sent!");
        }
        $data2['data'] = $data;
        if (is_array($data))
            $this->_set_cache_header(@$data['cache']);
        elseif (is_object($data))
            $this->_set_cache_header(@$data->cache);
        return $this->load->view("ajax/json_view", $data2, ($return) ? true : false);
    }

    /**
     * shorthand / alias for show_ajax() with inlcluded show_messages() after $this->message,
     * if the message sould send by ajax to the client.
     *
     * @param array $data expects array which is diven to the output as json
     * @param bool  $return
     *
     * @return object|string
     */
    public function show_ajax_message(&$data = null, $return = false) {
        if (is_null($data)) {
            $data = &$this->data;
        }
        $data['html']['prepend']['.message_area'] = $this->bootstrap_lib()->show_messages(null, null);
        return $this->show_ajax($data, $return);
    }
}
