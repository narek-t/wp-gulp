<?php

//Remove admin bar
add_filter( 'show_admin_bar', '__return_false' );

// Функция миниатюр
add_theme_support('post-thumbnails');

// Загружаемые стили и скрипты
function my_scripts_method() {
	wp_deregister_script( 'jquery' );
	wp_register_script('jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', array(), '2.1.4', false);
	wp_enqueue_script( 'jquery' );
}


add_action( 'wp_enqueue_scripts', 'my_scripts_method' );
function load_style_script () {
	wp_enqueue_script('lib.min.js', get_template_directory_uri() . '/js/lib/lib.min.js', array(), '', true);
	wp_enqueue_script('main.min.js', get_template_directory_uri() . '/js/main.min.js', array(), '', true);

	wp_enqueue_style('style.min.css', get_template_directory_uri() . '/css/style.min.css');
}

// Загружаем стили и скрипты
add_action('wp_enqueue_scripts', 'load_style_script');

// Включаем меню
register_nav_menu('main-nav', 'Main Navigation');











?>