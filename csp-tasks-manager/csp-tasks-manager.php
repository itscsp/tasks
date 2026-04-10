<?php
/**
 * Plugin Name: CSP Tasks Manager
 * Description: A backend for the Task Manager Application using JWT auth, REST APIs, and CPTs.
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: csp-tasks-manager
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( 'CSP_TASKS_MANAGER_VERSION', '1.0.0' );
define( 'CSP_TASKS_MANAGER_DIR', plugin_dir_path( __FILE__ ) );
define( 'CSP_TASKS_MANAGER_URL', plugin_dir_url( __FILE__ ) );

/**
 * The core plugin class.
 */
class CSP_Tasks_Manager {

    /**
     * Initializes the plugin.
     */
    public static function init() {
        self::includes();
        
        $cpt = new \CSP\CPT();
        $cpt->init();

        $roles = new \CSP\Roles();
        $roles->init();

        if ( is_admin() ) {
            $admin = new \CSP\Admin();
            $admin->init();
        }

        // REST API requires init on rest_api_init action
        add_action( 'rest_api_init', [ '\CSP\REST_API', 'init_routes' ] );
    }

    /**
     * Load required files.
     */
    private static function includes() {
        require_once CSP_TASKS_MANAGER_DIR . 'includes/class-csp-cpt.php';
        require_once CSP_TASKS_MANAGER_DIR . 'includes/class-csp-roles.php';
        require_once CSP_TASKS_MANAGER_DIR . 'includes/class-csp-auth.php';
        require_once CSP_TASKS_MANAGER_DIR . 'includes/class-csp-rest-api.php';
        require_once CSP_TASKS_MANAGER_DIR . 'includes/class-csp-admin.php';
    }

    /**
     * Plugin activation hook
     */
    public static function activate() {
        self::includes();
        
        $cpt = new \CSP\CPT();
        $cpt->register_post_types();
        $cpt->register_taxonomies();
        
        $roles = new \CSP\Roles();
        $roles->add_task_manager_role();
        
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation hook
     */
    public static function deactivate() {
        flush_rewrite_rules();
    }
}

// Register activation and deactivation hooks
register_activation_hook( __FILE__, [ 'CSP_Tasks_Manager', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'CSP_Tasks_Manager', 'deactivate' ] );

// Initialize the plugin
add_action( 'plugins_loaded', [ 'CSP_Tasks_Manager', 'init' ] );

// CORS Configuration
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($value) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = [
            'https://tasks.chethanspoojary.com',
            'http://localhost:5173',
            'http://192.0.0.2:5173'
        ];

        if (in_array($origin, $allowed, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        }

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            status_header(200);
            exit;
        }
        return $value;
    }, 10);

}, 15);
