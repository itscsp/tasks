<?php
namespace CSP;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class REST_API {

    public static function init_routes() {
        $namespace = 'csp/v1';

        // Auth
        register_rest_route( $namespace, '/auth/login', [
            'methods'  => 'POST',
            'callback' => [ self::class, 'login' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $namespace, '/auth/google', [
            'methods'  => 'POST',
            'callback' => [ self::class, 'google_login' ],
            'permission_callback' => '__return_true',
        ] );

        // Projects
        register_rest_route( $namespace, '/projects', [
            [
                'methods'  => 'GET',
                'callback' => [ self::class, 'get_projects' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ],
            [
                'methods'  => 'POST',
                'callback' => [ self::class, 'create_project' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ]
        ] );

        // Tasks
        register_rest_route( $namespace, '/tasks', [
            [
                'methods'  => 'GET',
                'callback' => [ self::class, 'get_tasks' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ],
            [
                'methods'  => 'POST',
                'callback' => [ self::class, 'create_task' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ]
        ] );
        
        register_rest_route( $namespace, '/tasks/(?P<id>\d+)', [
            [
                'methods'  => 'PUT',
                'callback' => [ self::class, 'update_task' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ],
            [
                'methods'  => 'DELETE',
                'callback' => [ self::class, 'delete_task' ],
                'permission_callback' => [ self::class, 'check_auth' ],
            ]
        ] );
    }

    public static function check_auth( \WP_REST_Request $request ) {
        $header = $request->get_header( 'authorization' );
        if ( ! $header ) {
            return new \WP_Error( 'rest_forbidden', 'Missing Authorization header', [ 'status' => 401 ] );
        }

        $token = str_replace( 'Bearer ', '', $header );
        $user_id = Auth::verify_jwt( $token );

        if ( ! $user_id ) {
            return new \WP_Error( 'rest_forbidden', 'Invalid token', [ 'status' => 401 ] );
        }

        wp_set_current_user( $user_id );
        return true;
    }

    public static function login( \WP_REST_Request $request ) {
        $email = $request->get_param( 'email' );
        $password = $request->get_param( 'password' );

        $user = wp_authenticate( $email, $password );

        if ( is_wp_error( $user ) ) {
            return new \WP_Error( 'auth_failed', 'Invalid credentials', [ 'status' => 401 ] );
        }

        $token = Auth::generate_jwt( $user->ID );
        return rest_ensure_response( [ 'token' => $token, 'user' => [ 'id' => $user->ID, 'email' => $user->user_email, 'name' => $user->display_name ] ] );
    }

    public static function google_login( \WP_REST_Request $request ) {
        $id_token = $request->get_param( 'id_token' );
        $google_user = Auth::verify_google_token( $id_token );

        if ( ! $google_user || empty( $google_user['email'] ) ) {
            return new \WP_Error( 'auth_failed', 'Invalid Google token', [ 'status' => 401 ] );
        }

        $user = get_user_by( 'email', $google_user['email'] );

        if ( ! $user ) {
            // Create user
            $user_id = wp_insert_user( [
                'user_login' => $google_user['email'],
                'user_pass'  => wp_generate_password(),
                'user_email' => $google_user['email'],
                'display_name' => $google_user['name'],
                'role'       => 'task-manager'
            ] );

            if ( is_wp_error( $user_id ) ) {
                return new \WP_Error( 'auth_failed', 'Could not create user', [ 'status' => 500 ] );
            }
            $user = get_user_by( 'id', $user_id );
        }

        $token = Auth::generate_jwt( $user->ID );
        return rest_ensure_response( [ 'token' => $token, 'user' => [ 'id' => $user->ID, 'email' => $user->user_email, 'name' => $user->display_name ] ] );
    }

    public static function get_projects( \WP_REST_Request $request ) {
        $args = [
            'post_type' => 'csp-project',
            'author'    => get_current_user_id(),
            'posts_per_page' => -1,
        ];
        $posts = get_posts( $args );
        $data = array_map( function( $post ) {
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'color' => get_post_meta( $post->ID, 'color', true ),
            ];
        }, $posts );

        return rest_ensure_response( $data );
    }

    public static function create_project( \WP_REST_Request $request ) {
        $title = sanitize_text_field( $request->get_param( 'title' ) );
        $color = sanitize_text_field( $request->get_param( 'color' ) );

        $post_id = wp_insert_post( [
            'post_type' => 'csp-project',
            'post_title' => $title,
            'post_status' => 'publish',
            'post_author' => get_current_user_id()
        ] );

        if ( $color ) {
            update_post_meta( $post_id, 'color', $color );
        }

        return rest_ensure_response( [ 'id' => $post_id, 'title' => $title, 'color' => $color ] );
    }

    private static function map_task( $post ) {
        return [
            'id' => $post->ID,
            'title' => $post->post_title,
            'notes' => $post->post_content,
            'project_id' => get_post_meta( $post->ID, 'project_id', true ),
            'parent_task_id' => $post->post_parent,
            'due_date' => get_post_meta( $post->ID, 'due_date', true ),
            'priority' => get_post_meta( $post->ID, 'priority', true ),
            'is_completed' => get_post_meta( $post->ID, 'is_completed', true ) === '1',
            'labels' => wp_get_post_tags( $post->ID, [ 'fields' => 'names' ] ),
        ];
    }

    public static function get_tasks( \WP_REST_Request $request ) {
        $args = [
            'post_type' => 'csp-task',
            'author'    => get_current_user_id(),
            'posts_per_page' => -1,
        ];

        // Filters
        $project_id = $request->get_param('project_id');
        if ( !empty($project_id) ) {
            $args['meta_query'][] = [
                'key' => 'project_id',
                'value' => $project_id
            ];
        }

        $due_date = $request->get_param('due_date'); // To query today, upcoming, etc
        if ( !empty($due_date) ) {
            if ($due_date === 'today') {
                $args['meta_query'][] = [
                    'key' => 'due_date',
                    'value' => wp_date('Y-m-d')
                ];
            } else if ($due_date === 'upcoming') {
                $args['meta_query'][] = [
                    'key' => 'due_date',
                    'value' => wp_date('Y-m-d'),
                    'compare' => '>'
                ];
            }
        }

        $posts = get_posts( $args );
        $data = array_map( [ self::class, 'map_task' ], $posts );

        return rest_ensure_response( $data );
    }

    public static function create_task( \WP_REST_Request $request ) {
        $title = sanitize_text_field( $request->get_param( 'title' ) );
        $notes = sanitize_textarea_field( $request->get_param( 'notes' ) );
        $parent_id = absint( $request->get_param( 'parent_task_id' ) );
        
        $post_args = [
            'post_type' => 'csp-task',
            'post_title' => $title,
            'post_content' => $notes,
            'post_status' => 'publish',
            'post_author' => get_current_user_id(),
        ];

        if ( $parent_id ) {
            $post_args['post_parent'] = $parent_id;
        }

        $post_id = wp_insert_post( $post_args );

        // Update Meta
        update_post_meta( $post_id, 'project_id', absint( $request->get_param( 'project_id' ) ) );
        update_post_meta( $post_id, 'due_date', sanitize_text_field( $request->get_param( 'due_date' ) ) );
        update_post_meta( $post_id, 'priority', absint( $request->get_param( 'priority' ) ) );
        update_post_meta( $post_id, 'is_completed', rest_sanitize_boolean( $request->get_param( 'is_completed' ) ) ? '1' : '0' );

        $labels = $request->get_param('labels');
        if ( is_array($labels) ) {
            wp_set_post_tags( $post_id, $labels );
        }

        return rest_ensure_response( self::map_task( get_post( $post_id ) ) );
    }

    public static function update_task( \WP_REST_Request $request ) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_author != get_current_user_id()) {
            return new \WP_Error('forbidden', 'Not allowed', ['status' => 403]);
        }

        $post_args = ['ID' => $post_id];
        
        if ( $request->has_param('title') ) $post_args['post_title'] = sanitize_text_field( $request->get_param( 'title' ) );
        if ( $request->has_param('notes') ) $post_args['post_content'] = sanitize_textarea_field( $request->get_param( 'notes' ) );
        if ( $request->has_param('parent_task_id') ) $post_args['post_parent'] = absint( $request->get_param( 'parent_task_id' ) );

        wp_update_post( $post_args );

        if ( $request->has_param('project_id') ) update_post_meta( $post_id, 'project_id', absint( $request->get_param( 'project_id' ) ) );
        if ( $request->has_param('due_date') ) update_post_meta( $post_id, 'due_date', sanitize_text_field( $request->get_param( 'due_date' ) ) );
        if ( $request->has_param('priority') ) update_post_meta( $post_id, 'priority', absint( $request->get_param( 'priority' ) ) );
        if ( $request->has_param('is_completed') ) {
            $is_completed = rest_sanitize_boolean( $request->get_param( 'is_completed' ) );
            update_post_meta( $post_id, 'is_completed', $is_completed ? '1' : '0' );
            if ( $is_completed ) update_post_meta( $post_id, 'completed_at', time() );
        }

        $labels = $request->get_param('labels');
        if ( is_array($labels) ) wp_set_post_tags( $post_id, $labels );

        return rest_ensure_response( self::map_task( get_post( $post_id ) ) );
    }
    
    public static function delete_task( \WP_REST_Request $request ) {
        $post_id = $request->get_param('id');
        wp_delete_post($post_id, true);
        return rest_ensure_response( ['deleted' => true] );
    }
}
