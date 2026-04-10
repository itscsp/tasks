<?php
namespace CSP;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Admin {

    public function init() {
        add_action( 'admin_menu', [ $this, 'add_plugin_page' ] );
    }

    public function add_plugin_page() {
        // This page will be accessible by administrators
        add_menu_page(
            'Tasks Manager API Docs',
            'Tasks API Docs',
            'manage_options',
            'csp-tasks-api-docs',
            [ $this, 'create_admin_page' ],
            'dashicons-media-document',
            65
        );
    }

    public function create_admin_page() {
        ?>
        <div class="wrap">
            <h1>Tasks Manager API Documentation</h1>
            <p>Welcome to the CSP Tasks Manager API documentation. Below are the endpoints available for the React frontend.</p>
            
            <hr />

            <h2>Base URL</h2>
            <code><?php echo site_url('/wp-json/csp/v1'); ?></code>

            <h2>Authentication</h2>
            <p><strong>Note:</strong> All non-auth endpoints require a valid JWT token sent in the headers:<br>
            <code>Authorization: Bearer &lt;your_token&gt;</code></p>

            <h3>1. Email/Password Login</h3>
            <p><strong>Endpoint:</strong> <code>POST /auth/login</code></p>
            <p><strong>Payload:</strong> <code>{ "email": "user@example.com", "password": "yourpassword" }</code></p>
            <p><strong>Response:</strong> <code>{ "token": "jwt_token...", "user": { "id": 1, "email": "...", "name": "..." } }</code></p>

            <h3>2. Google Login</h3>
            <p><strong>Endpoint:</strong> <code>POST /auth/google</code></p>
            <p><strong>Payload:</strong> <code>{ "id_token": "google_oauth_id_token" }</code></p>
            <p><strong>Response:</strong> <code>{ "token": "jwt_token...", "user": { ... } }</code></p>

            <hr />

            <h2>Projects</h2>
            
            <h3>1. Get All Projects</h3>
            <p><strong>Endpoint:</strong> <code>GET /projects</code></p>
            <p><strong>Response:</strong> <code>[ { "id": 1, "title": "Development", "color": "#ff0000" } ]</code></p>

            <h3>2. Create Project</h3>
            <p><strong>Endpoint:</strong> <code>POST /projects</code></p>
            <p><strong>Payload:</strong> <code>{ "title": "Personal", "color": "#00ff00" }</code></p>

            <hr />

            <h2>Tasks</h2>

            <h3>1. Get Tasks</h3>
            <p><strong>Endpoint:</strong> <code>GET /tasks</code></p>
            <p><strong>Query Parameters (Optional):</strong> <code>?project_id=1</code> or <code>?due_date=today|upcoming</code></p>
            <p><strong>Response:</strong> Array of task objects including subtasks and labels.</p>

            <h3>2. Create Task</h3>
            <p><strong>Endpoint:</strong> <code>POST /tasks</code></p>
            <p><strong>Payload:</strong> <code>{ "title": "Buy groceries", "notes": "Milk and eggs", "project_id": 1, "parent_task_id": 0, "due_date": "2023-11-20", "priority": 1, "labels": ["home"] }</code></p>

            <h3>3. Update Task</h3>
            <p><strong>Endpoint:</strong> <code>PUT /tasks/&lt;id&gt;</code></p>
            <p><strong>Payload:</strong> Any subset of the create payload. Example: <code>{ "is_completed": true }</code></p>

            <h3>4. Delete Task</h3>
            <p><strong>Endpoint:</strong> <code>DELETE /tasks/&lt;id&gt;</code></p>
        </div>
        <?php
    }
}
