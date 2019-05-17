"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const rtlcss = require('gulp-rtlcss');
const uglify = require("gulp-uglify");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Statix Design - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2019-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/StatixDesign/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');


// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp.src('../../node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./vendor/bootstrap'));
  // Font Awesome Assets
  var fontAwesomeCss = gulp.src([
    '../../node_modules/font-awesome/css/**/*'
  ])
    .pipe(gulp.dest('./vendor/font-awesome/css'))
  var fontAwesomeFonts = gulp.src([
    '../../node_modules/font-awesome/fonts/**/*'
  ])
    .pipe(gulp.dest('./vendor/font-awesome/fonts'))
  // jQuery
  var jquery = gulp.src([
    '../../node_modules/jquery/dist/*',
    '!../../node_modules/jquery/dist/core.js'
  ])
    .pipe(gulp.dest('./vendor/jquery'));
  // baguetteBox Assets
  var baguetteBox = gulp.src([
    '../../node_modules/baguettebox.js/dist/**/*'
  ])
    .pipe(gulp.dest('./vendor/baguettebox'))
  // Tabler UI Assets
  var tabler = gulp.src([
    '../../node_modules/tabler-ui/dist/assets/**/*'
  ])
    .pipe(gulp.dest('./vendor/tabler-ui'))
  return merge(bootstrap, fontAwesomeCss, fontAwesomeFonts, baguetteBox, tabler, jquery);
}

function styles() {
  return gulp.src('assets/scss/bundle.scss', { base: '.' })
    .pipe(sass({
      precision: 8,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: pkg.browserslist,
      cascade: false
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('assets/css/'))

    .pipe(rtlcss())
    .pipe(rename('style-rtl.css'))
    .pipe(gulp.dest('assets/css/'));
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/contact_me.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./js/**/*", js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// gulp.task("default", gulp.parallel('vendor'));

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));
// const jekyll = gulp.series(jekyll);

// Export tasks
exports.styles = styles;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;