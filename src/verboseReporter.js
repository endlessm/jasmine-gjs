const Lang = imports.lang;

const ConsoleReporter = imports.consoleReporter;

const GRAY = '\x1b[38;5;246m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';

// This reporter, activated with --verbose on the command line, behaves very
// similarly to Mocha's nicely formatted reporter.
const VerboseReporter = new Lang.Class({
    Name: 'VerboseReporter',
    Extends: ConsoleReporter.ConsoleReporter,

    jasmineStarted: function (info) {
        this.parent(info);
        this._print('Started\n\n');
    },

    jasmineDone: function () {
        this._print('\n');
        this._failedSpecs.forEach(this._printSpecFailureDetails, this);
        let seconds = Math.round(this._timer.elapsed()) / 1000;

        this._print(this._color('  %d passing'.format(this._passingCount), GREEN));
        this._print(' (%f s)\n'.format(seconds));
        if (this._pendingCount > 0)
            this._print(this._color('  %d pending\n'.format(this._pendingCount), YELLOW));
        if (this._failureCount > 0)
            this._print(this._color('  %d failing\n'.format(this._failureCount), RED));
        this._print('\n');

        this._failedSuites.forEach(this._printSuiteFailureDetails, this);

        this.parent();
    },

    suiteStarted: function (result) {
        this.parent(result);

        this._print(this._color(ConsoleReporter.indent(this._suiteLevel) +
            result.description, GRAY));
        this._print('\n');
    },

    suiteDone: function (result) {
        if (result.status === 'disabled')
            this._print(this._color(ConsoleReporter.indent(this._suiteLevel + 1) +
                '(disabled)\n', YELLOW));

        this.parent(result);

        if (this._suiteLevel === 0) {
            this._print('\n');
        }
    },

    specDone: function (result) {
        this.parent(result);

        const colors = {
            passed: GREEN,
            pending: YELLOW,
            failed: RED,
            disabled: undefined,
        };
        const symbols = {
            passed: '✓',
            pending: '-',
            failed: this._failureCount + ')',
            disabled: 'x',
        };
        this._print(ConsoleReporter.indent(this._suiteLevel + 1) +
            this._color(symbols[result.status], colors[result.status]));
        this._print(' %s\n'.format(result.description));
    },

    _printSpecFailureDetails: function (result, index) {
        this._print(this._color('%d) %s\n\n'.format(index + 1, result.fullName), RED));

        result.failedExpectations.forEach((failedExpectation) => {
            this._print(this._color(ConsoleReporter.indentLines('%s\n'.format(failedExpectation.message),
                1), GRAY));
            this._print(ConsoleReporter.indentLines(this.filterStack(failedExpectation.stack),
                2));
            this._print('\n\n');
        });
    },

    _printSuiteFailureDetails: function (result) {
        result.failedExpectations.forEach((failedExpectation) => {
            this._print(this._color('An error was thrown in an afterAll\n' +
                'AfterAll %s\n'.format(failedExpectation.message), RED));
        });
    },
});