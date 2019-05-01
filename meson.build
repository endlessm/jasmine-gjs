# Copyright 2019 Endless Mobile, Inc.

project('jasmine-gjs', 'c', version: '2.2.1', license: 'MIT')

bindir = join_paths(get_option('prefix'), get_option('bindir'))
datadir = join_paths(get_option('prefix'), get_option('datadir'))

conf = configuration_data()
conf.set('datadir', datadir)

configure_file(
  input: 'bin/jasmine.in',
  output: 'jasmine',
  configuration: conf,
  install_dir: bindir,
)

data_files = [
  'src/command.js',
  'src/consoleReporter.js',
  'src/jasmineBoot.js',
  'src/junitReporter.js',
  'src/options.js',
  'src/tapReporter.js',
  'src/timer.js',
  'src/utils.js',
  'src/verboseReporter.js',
  'src/xmlWriter.js',
  'lib/jasmine.js',
]

install_data(data_files, install_dir: join_paths(datadir, meson.project_name()))

subdir('test')
