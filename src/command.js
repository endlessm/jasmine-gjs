/* global jasmineImporter */

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const System = imports.system;

const Options = jasmineImporter.options;
const Timer = jasmineImporter.timer;

// Make it legal to specify "some_option": "single_value" in the config file as
// well as "some_option": ["multiple", "values"]
function _ensureArray(option) {
    if (!(option instanceof Array))
        return [option];
    return option;
}

function loadConfig(configFilePath) {
    let configFile = Gio.File.new_for_commandline_arg(configFilePath);
    let config = {};

    try {
        let [success, contents, length, etag] = configFile.load_contents(null);
        config = JSON.parse(contents);
    } catch (e) {
        throw new Error('Configuration not read from ' + configFile.get_path());
    }
    print('Configuration loaded from', configFile.get_path());
    return config;
}

function run(_jasmine, argv, config={}) {
    let [files, options] = Options.parseOptions(argv);

    if (options.config)
        config = loadConfig(options.config);

    if (config.options) {
        let [configFiles, configOptions] = Options.parseOptions(_ensureArray(config.options));
        // Command-line options should always override config file options
        Object.keys(configOptions).forEach((key) => {
            if (!(key in options))
                options[key] = configOptions[key];
        });
    }

    if (config.exclude)
        _jasmine.exclusions = _ensureArray(config.exclude);

    if (config.spec_files)
        files = files.concat(_ensureArray(config.spec_files));

    if (options.version) {
        print('Jasmine', _jasmine.version);
        System.exit(0);
    }

    if (options.junit) {
        const JUnitReporter = jasmineImporter.junitReporter;
        let junitFile = Gio.File.new_for_commandline_arg(options.junit);
        let rawStream = junitFile.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let junitStream = new Gio.DataOutputStream({
            base_stream: rawStream,
        });

        _jasmine.addReporter(new JUnitReporter.JUnitReporter({
            timerFactory: Timer.createDefaultTimer,
            print: function (str) {
                junitStream.put_string(str, null);
            },
            onComplete: function (success) {
                junitStream.close(null);
            }
        }));
    }

    let reporterOptions = {
        onComplete: function (success) {
            if (!success)
                System.exit(1);
            Mainloop.quit('jasmine');
        },
        show_colors: options.color,
        timerFactory: Timer.createDefaultTimer,
    };

    if (options.verbose) {
        const VerboseReporter = jasmineImporter.verboseReporter;
        _jasmine.addReporter(new VerboseReporter.VerboseReporter(reporterOptions));
    } else if (options.tap) {
        const TapReporter = jasmineImporter.tapReporter;
        _jasmine.addReporter(new TapReporter.TapReporter(reporterOptions));
    } else {
        _jasmine.configureDefaultReporter(reporterOptions);
    }

    // This should start after the main loop starts, otherwise we will hit
    // Mainloop.run() only after several tests have already run. For consistency
    // we should guarantee that there is a main loop running during the tests.
    Mainloop.idle_add(function () {
        try {
            _jasmine.execute(files);
        } catch (e) {
            if (options.tap) {
                // "Bail out!" has a special meaning to TAP harnesses
                print('Bail out! Exception occurred inside Jasmine:', e);
            } else {
                printerr('Exception occurred inside Jasmine:');
                printerr(e);
                printerr(e.stack);
            }
            System.exit(1);
        }
        return GLib.SOURCE_REMOVE;
    });

    // _jasmine.execute() queues up all the tests and runs them asynchronously.
    Mainloop.run('jasmine');
}
