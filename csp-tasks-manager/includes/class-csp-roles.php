<?php
namespace CSP;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Roles {

    public function init() {
        add_action( 'admin_init', [ $this, 'restrict_admin_access' ] );
        add_filter( 'rest_authentication_errors', [ $this, 'restrict_rest_api' ] );
    }

    public function add_task_manager_role() {
        // Create task-manager role with limited capabilities
        add_role(
            'task-manager',
            'Task Manager',
            [
                'read' => true,
                // Add capabilities for managing csp-projects and csp-tasks
                'edit_csp_projects'      => true,
                'publish_csp_projects'   => true,
                'read_csp_projects'      => true,
                'delete_csp_projects'    => true,
                'edit_others_csp_projects' => false,
                
                'edit_csp_tasks'         => true,
                'publish_csp_tasks'      => true,
                'read_csp_tasks'         => true,
                'delete_csp_tasks'       => true,
                'edit_others_csp_tasks'  => false,
            ]
        );
    }

    /**
     * Prevents users with 'task-manager' role from accessing wp-admin.
     */
    public function restrict_admin_access() {
        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            return;
        }

        $user = wp_get_current_user();
        if ( in_array( 'task-manager', (array) $user->roles ) ) {
            wp_redirect( home_url() );
            exit;
        }
    }

    /**
     * Restrict REST API to block standard access for task-manager unless it's the custom endpoint.
     */
    public function restrict_rest_api( $result ) {
        // If there's already an error, return it
        if ( ! empty( $result ) ) {
            return $result;
        }

        $user = wp_get_current_user();
        
        // Let admins do whatever
        if ( current_user_can( 'administrator' ) ) {
            return $result;
        }

        // Check if the route is a standard wp/v2 or similar route we want to block for task-manager
        if ( in_array( 'task-manager', (array) $user->roles ) ) {
            $route = untrailingslashit( $GLOBALS['wp']->query_vars['rest_route'] );
            
            // Allow our custom namespace
            if ( strpos( $route, '/csp/v1' ) === 0 ) {
                return $result; // Allow access to our custom endpoints
            }
            
            // Allow querying tags and categories for task labels
            if ( strpos( $route, '/wp/v2/tags' ) === 0 || strpos( $route, '/wp/v2/categories' ) === 0 ) {
                 // But typically, we should wrap this in our own endpoint to be safer, or just allow it
                return $result;
            }

            // Block everything else
            return new \WP_Error(
                'rest_forbidden',
                'Task Managers cannot access default REST API endpoints.',
                array( 'status' => rest_authorization_required_code() )
            );
        }

        return $result;
    }
}
