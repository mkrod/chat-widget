<?php
/**
 * Plugin Name: Alquify Chat Widget
 * Description: A chat widget for WordPress.
 * Client: https://alquify.com
 * Version: 1.0
 * Author: Your Name
 */

function my_chat_widget_scripts() {
    wp_enqueue_script('my-chat-widget', plugin_dir_url(__FILE__) . 'chat-widget.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'my_chat_widget_scripts');
