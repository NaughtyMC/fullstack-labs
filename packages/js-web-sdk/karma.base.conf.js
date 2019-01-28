// Karma configuration
// Generated on Thu Jan 17 2019 18:12:32 GMT-0800 (Pacific Standard Time)

// Run tests headlessly with Puppeteer
// See: https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',


  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha'],


  // list of files / patterns to exclude
  exclude: [
  ],


  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    'test/*.spec.ts': ['webpack'],
  },

  webpack: {
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  // reporters: ['progress'],
  reporters: ['dots'],


  // web server port
  port: 9876,


  // enable / disable colors in the output (reporters and logs)
  colors: true,



  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,


  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: false,


  // Concurrency level
  // how many browser should be started simultaneous
  concurrency: Infinity,


  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  // Note: you can run in regular (head-ful) Chrome by changing the line below to browsers: ['Chrome']
  // ChromeHeadless runs it via Puppeteer
  browsers: ['ChromeHeadless'],
}
