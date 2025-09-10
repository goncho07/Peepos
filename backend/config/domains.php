<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Domains Configuration
    |--------------------------------------------------------------------------
    |
    | Configure allowed domains for CORS, Sanctum, and other security features.
    | This provides a centralized way to manage domain permissions.
    |
    */

    'cors' => [
        'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 
            'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
        ))),
        'allowed_methods' => explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')),
        'allowed_headers' => explode(',', env('CORS_ALLOWED_HEADERS', 
            'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,X-File-Name'
        )),
        'exposed_headers' => explode(',', env('CORS_EXPOSED_HEADERS', 'Authorization')),
        'max_age' => env('CORS_MAX_AGE', 86400), // 24 hours
        'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Sanctum Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Domains that should receive stateful authentication cookies.
    | These are typically your frontend applications.
    |
    */

    'sanctum_stateful' => array_filter(explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
        'localhost:3000,localhost:3001,127.0.0.1:3000,127.0.0.1:3001'
    ))),

    /*
    |--------------------------------------------------------------------------
    | Trusted Proxies
    |--------------------------------------------------------------------------
    |
    | Configure trusted proxy IPs and headers for load balancers and CDNs.
    |
    */

    'trusted_proxies' => [
        'ips' => array_filter(explode(',', env('TRUSTED_PROXY_IPS', ''))),
        'headers' => env('TRUSTED_PROXY_HEADERS', 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy
    |--------------------------------------------------------------------------
    |
    | Configure Content Security Policy directives for enhanced security.
    |
    */

    'csp' => [
        'default_src' => explode(' ', env('CSP_DEFAULT_SRC', "'self'")),
        'script_src' => explode(' ', env('CSP_SCRIPT_SRC', "'self' 'unsafe-inline' 'unsafe-eval'")),
        'style_src' => explode(' ', env('CSP_STYLE_SRC', "'self' 'unsafe-inline'")),
        'img_src' => explode(' ', env('CSP_IMG_SRC', "'self' data: https:")),
        'font_src' => explode(' ', env('CSP_FONT_SRC', "'self' data:")),
        'connect_src' => explode(' ', env('CSP_CONNECT_SRC', "'self'")),
        'frame_src' => explode(' ', env('CSP_FRAME_SRC', "'none'")),
        'object_src' => explode(' ', env('CSP_OBJECT_SRC', "'none'")),
        'base_uri' => explode(' ', env('CSP_BASE_URI', "'self'")),
        'form_action' => explode(' ', env('CSP_FORM_ACTION', "'self'")),
    ],

    /*
    |--------------------------------------------------------------------------
    | Environment-specific Domains
    |--------------------------------------------------------------------------
    |
    | Configure different domain sets based on the application environment.
    |
    */

    'environments' => [
        'local' => [
            'frontend_urls' => [
                env('FRONTEND_URL', 'http://localhost:3000'),
                env('FRONTEND_DEV_URL', 'http://localhost:3001'),
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
            ],
            'api_urls' => [
                env('APP_URL', 'http://localhost:8000'),
                'http://127.0.0.1:8000',
            ],
        ],
        'staging' => [
            'frontend_urls' => array_filter(explode(',', env('STAGING_FRONTEND_URLS', ''))),
            'api_urls' => array_filter(explode(',', env('STAGING_API_URLS', ''))),
        ],
        'production' => [
            'frontend_urls' => array_filter(explode(',', env('PRODUCTION_FRONTEND_URLS', ''))),
            'api_urls' => array_filter(explode(',', env('PRODUCTION_API_URLS', ''))),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Domain Validation Rules
    |--------------------------------------------------------------------------
    |
    | Configure validation rules for domain checking and security.
    |
    */

    'validation' => [
        'require_https_in_production' => env('REQUIRE_HTTPS_PRODUCTION', true),
        'allowed_ports' => array_filter(explode(',', env('ALLOWED_PORTS', '80,443,3000,3001,8000,8080'))),
        'blocked_domains' => array_filter(explode(',', env('BLOCKED_DOMAINS', ''))),
        'whitelist_mode' => env('DOMAIN_WHITELIST_MODE', false), // If true, only explicitly allowed domains work
    ],

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    |
    | Utility methods for domain management.
    |
    */

    'helpers' => [
        'get_current_environment_domains' => function() {
            $env = app()->environment();
            return config("domains.environments.{$env}", config('domains.environments.local'));
        },
        'is_domain_allowed' => function($domain) {
            $allowedOrigins = config('domains.cors.allowed_origins', []);
            return in_array($domain, $allowedOrigins);
        },
        'get_all_allowed_domains' => function() {
            $corsOrigins = config('domains.cors.allowed_origins', []);
            $sanctumDomains = config('domains.sanctum_stateful', []);
            return array_unique(array_merge($corsOrigins, $sanctumDomains));
        },
    ],

];