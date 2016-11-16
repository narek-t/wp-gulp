'use strict';

// -------------------------------------
//   devDependencies
// -------------------------------------
const gulp = require('gulp');
const path = require('path');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const cssnano = require('gulp-cssnano');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const projectPHPWatchFiles    = '../*.php';
const url = "http://localhost:8888/wpgulp"; //need change every time

// --------------------------------------------
//  Error catching
// --------------------------------------------

const onError = function(err) {
	notify.onError({
		title: "Gulp",
		subtitle: "FAIL!!!",
		message: "Error: <%= error.message %>",
		sound: "Beep"
	})(err);
	this.emit('end');
};

// --------------------------------------------
//  Task: compile, minify, autoprefix sass/scss
// --------------------------------------------
gulp.task('styles', function() {
	return gulp.src('sass/*.{sass,scss}')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(postcss([ 
			autoprefixer({ 
				browsers: ['last 5 versions', 'ie 8', 'ie 9', '> 1%'],
				cascade: false,
			}) 
		]))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cssnano())
		.pipe(sourcemaps.write('/maps'))
		.pipe(gulp.dest('../css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

// --------------------------------------------
//  Task: Minify, concat JavaScript files
// --------------------------------------------

gulp.task('scripts', function() {
	return gulp.src(['js/**/*.js', '!js/lib/**'])
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('main.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('../js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Minify, concat JavaScript Lib files
// --------------------------------------------

gulp.task('libScripts', function() {
	return gulp.src('js/lib/**')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('lib.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('../js/lib'))
		.pipe(browserSync.reload({
			stream: true
		}));
});


// --------------------------------------------
//  Task: Creating sprites
// --------------------------------------------

gulp.task('sprites', function() {
	var spriteData = gulp.src('img/sprites/*.{png,jpg}')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.scss',
			imgPath: '../img/sprite.png',
			cssFormat: 'scss',
			padding: 4,
			cssTemplate: 'scss.template.mustache'
		}));
	var imgStream = spriteData.img
		.pipe(gulp.dest('../img/'));
	var cssStream = spriteData.css
		.pipe(gulp.dest('sass/'));
	return merge(imgStream, cssStream)
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Deleting public
// --------------------------------------------

gulp.task('clean', function() {
	return del(['../css', '../js'], {force: true});
});

// --------------------------------------------
//  Task: Watch
// --------------------------------------------

gulp.task('watch', function() {
	gulp.watch('sass/**/*.*', gulp.series('styles'));
	gulp.watch(['js/**/*.js', '!js/lib/**'], gulp.series('scripts'));
	gulp.watch('js/lib/**', gulp.series('libScripts'));
	gulp.watch('img/sprites/*.{png,jpg}', gulp.series('sprites'));

	gulp.watch(projectPHPWatchFiles).on('change', function(file) {
		browserSync.reload();
	});
});

// --------------------------------------------
//  Task: Build
// --------------------------------------------

gulp.task('build', gulp.series(
	'clean',
	gulp.parallel('styles', 'scripts', 'sprites', 'libScripts')));

// --------------------------------------------
//  Task: Basic server
// --------------------------------------------

gulp.task('server', function() {
	browserSync.init({
		proxy: url,
		port: 8888,
		watchTask: true,

	});
});

// --------------------------------------------
//  Task: Development
// --------------------------------------------

gulp.task('dev',
	gulp.series('build', gulp.parallel('watch', 'server'))
);