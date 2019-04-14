// Load plugins
const gulp = require("gulp");

// Copy third party libraries from /../../node_modules/ into /vendor
gulp.task('vendor', function(cb) {

  // Tabler UI Assets
  gulp.src([
      '../../node_modules/tabler-ui/dist/assets/**/*'
    ])
    .pipe(gulp.dest('./assets/vendor/tabler-ui'))

  cb();

});

gulp.task("default", gulp.parallel('vendor'));