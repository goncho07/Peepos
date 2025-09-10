<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for different API endpoints and user types.
    | Values are in requests per minute unless otherwise specified.
    |
    */

    'rate_limiting' => [
        'api' => [
            'default' => env('API_RATE_LIMIT_DEFAULT', 60), // requests per minute
            'auth' => env('API_RATE_LIMIT_AUTH', 5), // login attempts per minute
            'guest' => env('API_RATE_LIMIT_GUEST', 30), // guest requests per minute
            'authenticated' => env('API_RATE_LIMIT_AUTHENTICATED', 120), // authenticated requests per minute
        ],
        'web' => [
            'default' => env('WEB_RATE_LIMIT_DEFAULT', 100),
            'login' => env('WEB_RATE_LIMIT_LOGIN', 10),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Request Timeouts
    |--------------------------------------------------------------------------
    |
    | Configure various timeout values for different operations.
    | Values are in seconds unless otherwise specified.
    |
    */

    'timeouts' => [
        'http_client' => env('HTTP_CLIENT_TIMEOUT', 30),
        'database_query' => env('DATABASE_QUERY_TIMEOUT', 60),
        'file_upload' => env('FILE_UPLOAD_TIMEOUT', 300), // 5 minutes
        'report_generation' => env('REPORT_GENERATION_TIMEOUT', 600), // 10 minutes
        'email_sending' => env('EMAIL_SENDING_TIMEOUT', 120), // 2 minutes
        'session_lifetime' => env('SESSION_LIFETIME_MINUTES', 120), // 2 hours
        'token_expiration' => env('TOKEN_EXPIRATION_HOURS', 24), // 24 hours
    ],

    /*
    |--------------------------------------------------------------------------
    | File and Data Limits
    |--------------------------------------------------------------------------
    |
    | Configure limits for file uploads, data processing, and storage.
    | File sizes are in bytes unless otherwise specified.
    |
    */

    'files' => [
        'max_upload_size' => env('MAX_FILE_UPLOAD_SIZE', 10485760), // 10MB
        'max_image_size' => env('MAX_IMAGE_SIZE', 5242880), // 5MB
        'max_document_size' => env('MAX_DOCUMENT_SIZE', 20971520), // 20MB
        'allowed_image_types' => explode(',', env('ALLOWED_IMAGE_TYPES', 'jpg,jpeg,png,gif,webp')),
        'allowed_document_types' => explode(',', env('ALLOWED_DOCUMENT_TYPES', 'pdf,doc,docx,xls,xlsx,ppt,pptx')),
        'max_files_per_request' => env('MAX_FILES_PER_REQUEST', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Database and Query Limits
    |--------------------------------------------------------------------------
    |
    | Configure limits for database operations and queries.
    |
    */

    'database' => [
        'max_results_per_page' => env('DB_MAX_RESULTS_PER_PAGE', 100),
        'default_pagination_size' => env('DB_DEFAULT_PAGINATION_SIZE', 15),
        'max_batch_insert_size' => env('DB_MAX_BATCH_INSERT_SIZE', 1000),
        'query_log_threshold' => env('DB_QUERY_LOG_THRESHOLD', 1000), // milliseconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Memory and Processing Limits
    |--------------------------------------------------------------------------
    |
    | Configure memory and processing limits for various operations.
    |
    */

    'processing' => [
        'max_memory_limit' => env('MAX_MEMORY_LIMIT', '256M'),
        'max_execution_time' => env('MAX_EXECUTION_TIME', 300), // 5 minutes
        'max_input_vars' => env('MAX_INPUT_VARS', 3000),
        'max_concurrent_jobs' => env('MAX_CONCURRENT_JOBS', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Validation Limits
    |--------------------------------------------------------------------------
    |
    | Configure limits for form validation and input processing.
    |
    */

    'validation' => [
        'max_string_length' => env('VALIDATION_MAX_STRING_LENGTH', 255),
        'max_text_length' => env('VALIDATION_MAX_TEXT_LENGTH', 65535),
        'max_array_items' => env('VALIDATION_MAX_ARRAY_ITEMS', 100),
        'min_password_length' => env('VALIDATION_MIN_PASSWORD_LENGTH', 8),
        'max_password_length' => env('VALIDATION_MAX_PASSWORD_LENGTH', 255),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configure cache timeouts and limits.
    |
    */

    'cache' => [
        'default_ttl' => env('CACHE_DEFAULT_TTL', 3600), // 1 hour
        'user_session_ttl' => env('CACHE_USER_SESSION_TTL', 7200), // 2 hours
        'api_response_ttl' => env('CACHE_API_RESPONSE_TTL', 300), // 5 minutes
        'static_content_ttl' => env('CACHE_STATIC_CONTENT_TTL', 86400), // 24 hours
        'max_cache_size' => env('CACHE_MAX_SIZE', '100M'),
    ],

];