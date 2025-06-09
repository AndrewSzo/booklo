const config = {
  require: [
    'ts-node/register',
    './support/**/*.ts',
    './step_definitions/**/*.ts'
  ],
  requireModule: [
    'ts-node/register'
  ],
  format: [
    '@cucumber/pretty-formatter',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  dryRun: false,
  failFast: false,
  strict: false,
  parallel: 1,
  retry: 0,
  timeout: 120000,
  worldParameters: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    timeout: parseInt(process.env.TIMEOUT) || 60000
  }
};

module.exports = {
  default: config
}; 