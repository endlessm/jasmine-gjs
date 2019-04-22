# Copyright 2019 Endless Mobile, Inc.

javascript_tests = [
    'test/commandSpec.js',
    'test/consoleReporterSpec.js',
    'test/defaultReporterSpec.js',
    'test/focusedSpecIntegrationTest.js',
    'test/importerSpec.js',
    'test/jasmineBootSpec.js',
    'test/jasmineIntegrationTest.js',
    'test/junitReporterSpec.js',
    'test/optionsSpec.js',
    'test/tapReporterSpec.js',
    'test/timerSpec.js',
    'test/utilsSpec.js',
    'test/verboseReporterSpec.js',
    'test/xmlWriterSpec.js',
]

jasmine = find_program(join_paths(meson.build_root(), 'jasmine'))
test_runner = find_program('./tap.py')
srcdir = meson.source_root()
include_path = '@0@:@1@'.format(join_paths(srcdir, 'lib'), join_paths(srcdir, 'src'))
built_library_path = join_paths(meson.build_root(), meson.project_name())
test_content_path = join_paths(meson.current_source_dir(), 'testcontent')
tests_environment = environment()
tests_environment.set('JASMINE_UNINSTALLED', 'yes')
tests_environment.set('SRCDIR', srcdir)
tests_environment.set('RUN_THOROUGH_TESTS', 'yes')
tests_environment.set('GJS_PATH', include_path)
tests_environment.prepend('GI_TYPELIB_PATH', built_library_path)
tests_environment.prepend('LD_LIBRARY_PATH', built_library_path)
tests_environment.set('G_TEST_SRCDIR', meson.current_source_dir())
tests_environment.set('G_TEST_BUILDDIR', meson.current_build_dir())
tests_environment.prepend('XDG_DATA_DIRS', test_content_path)
tests_environment.set('LC_ALL', 'C')

args = [jasmine.path(), '--no-config', '--tap']

foreach test_file : javascript_tests
    srcdir_file = join_paths(meson.current_source_dir(), test_file)
    test(test_file, test_runner, env: tests_environment,
        args: args + [srcdir_file])
endforeach
