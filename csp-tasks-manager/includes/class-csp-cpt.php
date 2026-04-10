<?php
namespace CSP;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class CPT {

    public function init() {
        add_action( 'init', [ $this, 'register_post_types' ] );
        add_action( 'init', [ $this, 'register_taxonomies' ] );
    }

    public function register_post_types() {
        // Register Project CPT
        $project_args = [
            'labels'             => [
                'name'          => 'Projects',
                'singular_name' => 'Project',
            ],
            'public'             => false,
            'publicly_queryable' => false,
            'show_ui'            => true,
            'show_in_rest'       => true,
            'rest_base'          => 'csp-projects',
            'menu_icon'          => 'dashicons-portfolio',
            'supports'           => [ 'title', 'custom-fields' ],
            'capability_type'    => [ 'csp_project', 'csp_projects' ],
            'map_meta_cap'       => true,
        ];
        register_post_type( 'csp-project', $project_args );

        // Register Task CPT
        $task_args = [
            'labels'             => [
                'name'          => 'Tasks',
                'singular_name' => 'Task',
            ],
            'public'             => false,
            'publicly_queryable' => false,
            'show_ui'            => true,
            'show_in_rest'       => true,
            'rest_base'          => 'csp-tasks',
            'menu_icon'          => 'dashicons-list-view',
            'supports'           => [ 'title', 'editor', 'custom-fields', 'page-attributes' ], // Built-in page-attributes gives support for 'post_parent'
            'capability_type'    => [ 'csp_task', 'csp_tasks' ],
            'map_meta_cap'       => true,
        ];
        register_post_type( 'csp-task', $task_args );
    }

    public function register_taxonomies() {
        // We will use standard WordPress categories/tags or a custom taxonomy.
        // User requested "And for label use wordpress category or tags option".
        // Instead of overriding standard posts globally, let's register the standard 'category' and 'post_tag' for csp-task,
        // or just let them use those. Actually, standard category/tags are best registered for the CPT using register_taxonomy_for_object_type.
        
        register_taxonomy_for_object_type( 'category', 'csp-task' );
        register_taxonomy_for_object_type( 'post_tag', 'csp-task' );
    }
}
