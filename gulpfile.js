const { src, dest, parallel, series, watch } = require('gulp')

//删除模块插件
const del = require('del')

const browserSync = require('browser-sync')
//加载所有插件
const loadPlugins = require('gulp-load-plugins')
//用法 plugins.sass
const plugins = loadPlugins()
//开发服务器
const bs = browserSync.create()
/* 
//转换sass
const sass = require('gulp-sass')
//转换es6
const babel = require('gulp-babel')
//模板引擎
const swig = require('gulp-swig')
//压缩图片插件
const imagemin = require('gulp-imagemin')

 */
const data = {
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'Features',
            link: 'features.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [
                {
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

const clean = () => {
    return del(['dist'])
}

const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src' })
        .pipe(plugins.sass({ outputStyle: 'expanded' }))
        .pipe(dest('dist'))
        .pipe(bs.reload({ stream: true }))//检测变化 向浏览器发送文件流
}

const script = () => {
    return src('src/assets/scripts/*.js', { base: 'src' })
        .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
        .pipe(dest('dist'))
}

const page = () => {
    return src('src/*.html', { base: 'src' })
        .pipe(plugins.swig({ data }))
        .pipe(dest('dist'))
}

const image = () => {
    //**所有文件通配 
    return src('src/assets/images/**')
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const font = () => {
    //**所有文件通配 
    return src('src/assets/fonts/**')
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

const serve = () => {
    //检测代码变化并且执行相应任务
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)
    // watch('src/assets/images/**', image)
    // watch('src/assets/fonts/**', font)
    // watch('public/**', extra)
    watch([
      'src/assets/images/**',
      'src/assets/fonts/**',
      'public/**'
    ], bs.reload)//reload方法会通知所有的浏览器相关文件被改动，要么导致浏览器刷新，要么注入文件，实时更新改动。
  
    bs.init({
        notify: false,////不显示在浏览器中的任何通知。
        port: 9000,//使用（而不是一个自动检测到Browsersync）特定端口 
        files: 'dist/**',//检测文件变化 页面即时更改
        server: {
            baseDir: ['dist','src','public'],//数组的好处：src下面的图片是否压缩与public文件开发过程中没有影响 提高效率
            routes: {
                '/node_modules': 'node_modules'
            }
        }

    })
}

const compile = parallel(style, script, page, image, font)
//上线之前执行的任务
const build = series(clean, parallel(compile, extra))

const develop = series(compile, serve)

module.exports = {
    clean,
    build,
    serve,
    develop
}