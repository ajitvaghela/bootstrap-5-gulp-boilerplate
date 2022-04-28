const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const isProd = process.env.NODE_ENV === 'prod';
 const zip = require('gulp-zip');

const htmlFile = [
    'src/*.html'
]

//HTML
function html() {
    return gulp.src(htmlFile)
        .pipe(htmlPartial({
            basePath: 'src/partials/'
        }))
        .pipe(gulpIf(isProd, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('dist'));
}

//CSS
function css() {
    return gulp.src('src/sass/style.scss')
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass({
            includePaths: ['node_modules']
        }).on('error', sass.logError))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cssmin()))
        .pipe(gulp.dest('dist/css/'));
}

//Javascript
function js() {
    return gulp.src('src/js/*.js')
        .pipe(jsImport({
            hideConsole: true
        }))
        .pipe(concat('scripts.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest('dist/js'));
}

//Image
function img() {
    return gulp.src('src/img/**/*')
        .pipe(gulpIf(isProd, imagemin()))
        .pipe(gulp.dest('dist/img/'));
}

 //Serve
function serve() {
    browserSync.init({
        open: true,
        server: './dist'
    });
}

//Browser Reload
function browserSyncReload(done) {
    browserSync.reload();
    done();
}

//Watch the files
function watchFiles() {
    gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('src/**/*.scss', gulp.series(css, browserSyncReload));
    gulp.watch('src/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('src/img/**/*.*', gulp.series(img,browserSyncReload));
    
    return;
}
 

//Bundle the code to ZIP
function zipBuild(){
    return gulp.src('dist/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('zip'));
    }


//Tasks
exports.css = css;
exports.html = html;
exports.js = js;
exports.build = gulp.series(html, css, js, img);
exports.default = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.zip = zipBuild;