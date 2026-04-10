<?php
namespace CSP;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Auth {

    /**
     * Generate a very simple JWT token without external libraries.
     */
    public static function generate_jwt( $user_id ) {
        $header = json_encode( [ 'typ' => 'JWT', 'alg' => 'HS256' ] );
        $payload = json_encode( [
            'user_id' => $user_id,
            'exp'     => time() + ( DAY_IN_SECONDS * 7 ),
            'iat'     => time()
        ] );

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::get_secret(), true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verify JWT and return user ID.
     */
    public static function verify_jwt( $token ) {
        if ( empty( $token ) ) {
            return false;
        }

        $parts = explode( '.', $token );
        if ( count( $parts ) !== 3 ) {
            return false;
        }

        list( $header, $payload, $signature ) = $parts;

        $valid_signature = hash_hmac( 'sha256', $header . "." . $payload, self::get_secret(), true );
        $base64UrlSignature = str_replace( ['+', '/', '='], ['-', '_', ''], base64_encode( $valid_signature ) );

        if ( hash_equals( $base64UrlSignature, $signature ) ) {
            $payload_data = json_decode( base64_decode( str_replace( ['-', '_'], ['+', '/'], $payload ) ) );
            if ( $payload_data && isset( $payload_data->user_id ) && $payload_data->exp > time() ) {
                return $payload_data->user_id;
            }
        }

        return false;
    }

    private static function get_secret() {
        if ( defined( 'SECURE_AUTH_KEY' ) ) {
            return SECURE_AUTH_KEY;
        }
        return 'csp-fallback-secret-key-1234';
    }

    /**
     * Authenticate a user by verifying a Google ID Token.
     */
    public static function verify_google_token( $id_token ) {
        // Use Google's tokeninfo endpoint to verify token
        $response = wp_remote_get( 'https://oauth2.googleapis.com/tokeninfo?id_token=' . $id_token );
        
        if ( is_wp_error( $response ) ) {
            return false;
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( isset( $data['error'] ) ) {
            return false;
        }

        return $data; // Contains 'email', 'name', 'sub', etc.
    }
}
