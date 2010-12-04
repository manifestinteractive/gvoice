<?PHP
//extract data from the post
extract($_POST);

//set POST variables
$url = $post_url;
$fields = array(
    'showCallerNumber' => urlencode($showCallerNumber),
    'callerNumber' => urlencode($callerNumber),
    'buttonId' => urlencode($buttonId),
    'name' => urlencode($name)
);

//url-ify the data for the POST
foreach ($fields as $key => $value)
{
    $fields_string .= $key . '=' . $value . '&';
}
rtrim($fields_string, '&');

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, count($fields));
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);

//execute post
$result = curl_exec($ch);

//close connection
curl_close($ch);

exit(";jQuery('#call_me').gvoice('".$_GET['callback']."');");
?>