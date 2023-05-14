/**
 * gulp4の新しい書き方を採用。
 * gulp.task()が非推奨のため。
 * https://ics.media/entry/3290/
 * [コラム：task()メソッドを使う方法は非推奨？]を参照
 * 
 * src 参照元を指定
 * dest 出力先を指定
 * watch ファイル監視
 * series(直列処理)とparallel(並列処理)
 */
const { src, dest, watch, series, parallel } = require("gulp");


/* ======================================================
 * loading（開発に必要なモジュールの読み込み）
 * ====================================================== */
/**
 * EJS
 */
const ejs = require("gulp-ejs");
const rename = require('gulp-rename'); //ejsの名前変更
const htmlmin = require('gulp-htmlmin'); //html圧縮

/**
 * CSS, Sass
 */
const sass = require('gulp-sass')(require('sass'));
const postCss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss'); 
const tailwindConfig = require("./tailwind.config.js");

/**
 * JavaScript
 */
const babel = require('gulp-babel'); //トランスパイラ

/**
 * 画像圧縮, WebP化
 */
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const gifsicle = require('imagemin-gifsicle');
const svgo = require('imagemin-svgo');
const svgmin = require('gulp-svgmin');
const webp = require('gulp-webp');
//const imageminWebp = require('imagemin-webp');

/**
 * コード整形, Linter
 */
const stylelint = require('gulp-stylelint');
//const prettier = require('gulp-prettier')  //後ほど設定したい

/**
 * その他
 */
const browserSync = require('browser-sync').create(); //ページの自動リロード
const plumber = require('gulp-plumber'); //エラーによるwatch停止の防止
const notify = require('gulp-notify'); //エラーが発生したらデスクトップに通知


/* ======================================================
 * variable（変数）
 * ====================================================== */
/**
 * ディレクトリ名
 */
const dev_dir = 'src';
const pub_dir = 'htdocs';

/**
 * ファイルパス
 */
const filePath = {
    wrap: {
        dev: `./${dev_dir}/`,
        pub: `./${pub_dir}/`
    },
    html: {
        root: `./${pub_dir}/`,
        files: `./${pub_dir}/**/*.html`
    },
    ejs: {
        src: [`${dev_dir}/ejs/**/*.ejs`,`!${dev_dir}/ejs/**/_*.ejs`],
        dest: `./${pub_dir}/`
    },
    styles: {
        src: `./${dev_dir}/sass/**/*.scss`,
        dest: `./${pub_dir}/`
    },
    img: {
        src: `./${dev_dir}/image/**/*.+(jpg|png|gif|svg)`,
        dest: `./${pub_dir}/`
    }
}


/* ======================================================
 * setting
 * ====================================================== */
/**
 * 自動リロード
 */
const autoReload = done => {
    browserSync.init({
        server: {
            baseDir: filePath.html.root, 
            index: 'index.html'
        },
        port: 3000,
    });
    watch(filePath.wrap.pub).on('change', browserSync.reload);
    done();
}

/**
 * 画像圧縮
 */
const imageMin = done => {
    src(filePath.img.src)
        .pipe(imagemin(
            [
                // pngの圧縮
                pngquant({
                    quality: [0.6, 0.8]
                }),
                // jpgの圧縮
                mozjpeg({
                    optimize: true
                }),
                // gifの圧縮
                gifsicle({
                    interlaced: false,
                    optimizationLevel: 3,
                }),
                // SVGの圧縮
                //svgo()
            ])
        )
        .pipe(dest(filePath.img.dest));
    done();
}

/**
 * svgのminify
 * 
 * minifyされない・・・後でもう一度やる
 */
const svgMin = done => {
    src(`./${dev_dir}/image/**/*.svg`)
        .pipe(svgmin({
            // Ensures the best optimization.
            multipass: true,
            js2svg: {
                // Beutifies the SVG output instead of
                // stripping all white space.
                pretty: true,
                indent: 2,
            },
        }))
        .pipe(dest(filePath.img.dest));
    done();
}

/**
 * WebP化
 */
const imageWebP = done => {
    src(filePath.img.src)
        .pipe(webp({
            quality: 80
        }))
        .pipe(dest(filePath.img.dest));
    done();
}

/**
 * EJS
 */
const compileEJS = done => {
    src(filePath.ejs.src)
        .pipe(plumber())
        .pipe(ejs())
        .pipe(htmlmin({
            collapseWhitespace: true, //余白を削除
            removeComments: false, //コメントを削除
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest(filePath.ejs.dest))
    done();
}

/**
 * コード整形, Linter
 */
const format = done => {
    src(filePath.styles.src)
        .pipe(stylelint({
            failAfterError: false,
        }));
    done();
}

/**
 * Sassのコンパイル
 */
const compileSass = done => {
    src(filePath.styles.src)
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
            }).on("error", sass.logError)
        )
        .pipe(
            postCss([
                tailwindcss(tailwindConfig),
                autoprefixer({
                    grid: 'autoplace',
                    "overrideBrowserslist": ["last 2 version", "ie >= 11", "Android >= 5"],
                })
            ])
        )
        .pipe(sourcemaps.write())
        .pipe(dest(filePath.styles.dest))
        .pipe(browserSync.stream());
    done();
}

/**
 * 開発ファイルの監視
 */
const watchEJSFiles = done => {
    watch(filePath.ejs.src, series(compileEJS, compileSass /*compileSassはtailwind用なので不要ならば省きたい*/));
    done();
};
const watchSassFiles = done => {
    watch(filePath.styles.src, series(format, compileSass))
    done();
};


/* ======================================================
 * execute（ターミナル入力->実行）
 * ====================================================== */
exports.default = parallel(autoReload, watchEJSFiles, watchSassFiles);
exports.image = series(imageMin, svgMin, imageWebP);
