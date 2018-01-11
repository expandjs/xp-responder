/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const http = require('http'),
    XP     = require('expandjs');

/*********************************************************************/

/**
 * A server side class used to provide standard http responses.
 *
 * @class XPResponder
 * @description A server side class used to provide standard http responses
 * @keywords nodejs, expandjs
 */
module.exports = new XP.Class('XPResponder', {

    /**
     * @constructs
     * @param {Object} options
     *   @param {*} [options.data]
     *   @param {Object} [options.error]
     *   @param {Object} [options.headers]
     *   @param {string} [options.mode = "json"]
     *   @param {Object} [options.response]
     */
    initialize(options) {

        // Setting
        this.options       = options;
        this.error         = this.options.error || null;
        this.mode          = this.options.mode || 'json';
        this.response      = this.options.response || null;
        this.statusCode    = this.error ? (http.STATUS_CODES[this.error.code] && this.error.code || 500) : (this.response && this.response.statusCode || 200);
        this.statusMessage = this.error ? (this.statusCode < 500 && this.error.message || http.STATUS_CODES[this.statusCode]) : (this.response && this.response.statusMessage || http.STATUS_CODES[this.statusCode]);
        this.data          = this.error ? {code: this.statusCode, message: this.statusMessage} : this.options.data;
        this.body          = XP[this.mode === 'json' ? 'toJSON' : 'toString'](this.data);
        this.bytes         = XP.byteLength(this.body);

        // Preventing
        if (!this.response) { return; }

        // Headers
        Object.keys(this.modes[this.mode]).forEach(header => this.setHeader(header, this.modes[this.mode][header]));
        Object.keys(this.options.headers || {}).forEach(header => this.setHeader(header, this.options.headers[header]));
        this.setHeader('Content-Length', this.bytes.toString());

        // Binding
        this.response.end = this.response.end.bind(this.response, this.body, 'utf-8');
    },

    /*********************************************************************/

    /**
     * Get a header.
     *
     * @method getHeader
     * @param {string} name
     * @returns {string}
     */
    getHeader(name) {

        // Asserting
        XP.assertArgument(XP.isString(name, true), 1, 'string');

        // Preventing
        if (!this.response) { return; }

        // Returning
        return this.response.getHeader(name);
    },

    /**
     * Set a header.
     *
     * @method setHeader
     * @param {string} name
     * @param {string} value
     */
    setHeader(name, value) {

        // Asserting
        XP.assertArgument(XP.isString(name, true), 1, 'string');
        XP.assertArgument(XP.isVoid(value) || XP.isFalse(value) || XP.isInput(value), 2, 'string');

        // Preventing
        if (!this.response) { return; }

        // Removing
        if (!XP.isInput(value, true)) { this.response.removeHeader(name); return; }

        // Setting
        this.response.setHeader(name, value.toString());
    },

    /*********************************************************************/

    /**
     * Sends the response.
     *
     * @method end
     * @param {Function} [callback]
     * @returns {Promise}
     */
    end: {
        promise: true,
        value(callback) {

            // Preventing
            if (!this.response) { callback(); return; }

            // Ending
            this.response.end(callback);
        }
    },

    /*********************************************************************/

    /**
     * The response's body.
     *
     * @property body
     * @type string
     * @readonly
     */
    body: {
        set(val) { return XP.isDefined(this.body) ? this.body : val; },
        then(val) { return this.statusCode === 200 && !val ? this.statusCode = 204 : this.statusCode; },
        validate(val) { return !XP.isString(val) && 'string'; }
    },

    /**
     * The response's bytes.
     *
     * @property bytes
     * @type number
     * @readonly
     */
    bytes: {
        set(val) { return XP.isDefined(this.bytes) ? this.bytes : val; },
        validate(val) { return !XP.isInt(val, true) && 'number'; }
    },

    /**
     * The response's data.
     *
     * @property data
     * @type *
     */
    data: {
        set(val) { return XP.isDefined(this.data) ? this.data : val; }
    },

    /**
     * The response's error.
     *
     * @property error
     * @type Object
     */
    error: {
        set(val) { return XP.isDefined(this.error) ? this.error : val; },
        validate(val) { return !XP.isNull(val) && !XP.isObject(val) && 'Object'; }
    },

    /**
     * The response's mode.
     *
     * @property mode
     * @type string
     * @default "json"
     */
    mode: {
        set(val) { return this.mode || val; },
        validate(val) { return !this.modes[val] && `"${Object.keys(this.modes).join(`", "`)}"`; }
    },

    /**
     * The map of possible modes.
     *
     * @property modes
     * @type Object
     * @readonly
     */
    modes: {
        frozen: true,
        writable: false,
        value: {
            html: {'Content-Type': 'text/html; charset=utf-8'},
            js:   {'Content-Type': 'application/javascript; charset=utf-8'},
            json: {'Content-Type': 'application/json; charset=utf-8'},
            text: {'Content-Type': 'text/plain; charset=utf-8'}
        }
    },

    /**
     * The response instance.
     *
     * @property response
     * @type Object
     */
    response: {
        set(val) { return XP.isDefined(this.response) ? this.response : val; },
        validate(val) { return !XP.isNull(val) && !XP.isObject(val) && 'Object'; }
    },

    /**
     * The response status code.
     *
     * @property statusCode
     * @type number
     * @readonly
     */
    statusCode: {
        get() { return this.response ? this.response.statusCode : this.statusCode_; },
        set(val) { return this.response ? this.response.statusCode = val : this.statusCode_ = val; }
    },

    /**
     * The response status message.
     *
     * @property statusMessage
     * @type string
     * @readonly
     */
    statusMessage: {
        get() { return this.response ? this.response.statusMessage : this.statusMessage_; },
        set(val) { return this.response ? this.response.statusMessage = val : this.statusMessage_ = val; }
    }
});
