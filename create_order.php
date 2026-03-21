<?php

$RESEND_API_KEY = "re_NDfXidA1_3bAJr9iNLuH9Dtcevud4TCf2";  // Resend se copy ki
$FROM_EMAIL     = "noreply@anifold.shop"; // Verified domain wala

// Razorpay PHP library ko include karein
// (Aapko Razorpay PHP SDK folder bhi yahin upload karna hoga)
require('razorpay-php/Razorpay.php');

// --- SECURITY: Sirf aapki user website se request accept karega ---
header("Access-Control-Allow-Origin: https://anifold.shop"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

use Razorpay\Api\Api;

// --- IMPORTANT: Apne SECRET keys yahan daalein ---
$keyId = "Yrzp_live_RzjzE21QYwmsqE"; // Apna LIVE Key ID daalein
$keySecret = "1NhInpsQLAeYbjsLE63oXvSH"; // Apna LIVE Key Secret daalein

$api = new Api($keyId, $keySecret);

// Browser (user.html) se bheje gaye data ko padhein
$data = json_decode(file_get_contents("php://input"));

if(empty($data->amount) || !is_numeric($data->amount)){
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Amount is required and must be a number.']);
    exit();
}

$amount = $data->amount; // Amount paiso mein

// Server par securely Order create karein
$orderData = [
    'receipt'         => 'rcptid_' . time(),
    'amount'          => $amount, 
    'currency'        => 'INR',
    'payment_capture' => 1 // <--- AUTO-CAPTURE ENABLED
];

try {
    $razorpayOrder = $api->order->create($orderData);
    
    // Success hone par, browser ko Order ID wapas bhejein
    echo json_encode(['order_id' => $razorpayOrder['id']]);

} catch(Exception $e) {
    // Agar Razorpay se order banane mein koi error aata hai
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Razorpay Error: ' . $e->getMessage()]);
}
?>
