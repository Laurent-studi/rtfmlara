<?php

return [
    'allowed_origins' => [
        'http://rtfm2win.test:3000', 
        'https://rtfm2win.test',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
