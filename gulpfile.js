"use strict"

const {src, dest} = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer')
const cssbeautify = require('gulp-cssbeautify')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const stripCssComments = require('gulp-strip-css-comments')
const sass = require('gulp-sass')(require('sass'))
const rigger = require('gulp-rigger')
const uglify = require('gulp-uglify')
const plumber = require('gulp-plumber')
const imagemin = require('gulp-imagemin')
const del = require('del')
const panini = require('panini')
const browsersync = require('browser-sync').create()

const path = {
  build: {
    html: 'dist/',
    js: 'dist/assets/js/',
    css: 'dist/assets/css/',
    images: 'dist/assets/img/',
    fonts: 'dist/assets/fonts/'
  },
  src: {
    html: 'src/*.html',
    js: 'src/assets/js/*.js',
    css: 'src/assets/sass/*.sass',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}',
    fonts: 'src/assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/assets/js/**/*.js',
    css: 'src/assets/sass/**/*.sass',
    images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico}',
    fonts: 'src/assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
  },
  clean: './dist'
}


function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  })
}

function browserSyncReload(done) {
  browsersync.reload();
}

function html() {
  panini.refresh();
  return src(path.src.html, { base: "src/" })
    .pipe(plumber())
    .pipe(panini({
      root: 'src/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.reload({stream: true}));
}

function css() {
  return src(path.src.css, { base: "src/assets/sass/" })
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: true
    }))
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
      zindex: false,
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(stripCssComments())
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.reload({stream: true}));
}

function js() {
  return src(path.src.js, { base: "./src/assets/js/" })
  .pipe(plumber())
  .pipe(rigger())
  .pipe(gulp.dest(path.build.js))
  .pipe(uglify())
  .pipe(rename({
    suffix: ".min",
    extname: ".js"
  }))
  .pipe(dest(path.build.js))
  .pipe(browsersync.stream());
}

function images() {
  return src(path.src.images)
    .pipe(imagemin())
    .pipe(dest(path.build.images));
}

function fonts() {
  return src(path.src.fonts)
  .pipe(dest(path.build.fonts))
  .pipe(browsersync.reload({stream: true}));
}

function clean() {
  return del(path.clean)
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.images], images)
  gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync)

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;