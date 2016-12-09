/**
 * @license
 * Copyright (c) 2015 The expand.js authors. All rights reserved.
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
module.exports = global.XPResponder = new XP.Class('XPResponder', {

    /**
     * @constructs
     * @param {Object} [options]
     *   @param {*} [options.data]
     *   @param {Object} [options.error]
     *   @param {Object} [options.headers]
     *   @param {Object} [options.response]
     *   @param {number} [options.code = 200]
     *   @param {string} [options.mode = "json"]
     */
    initialize(options) {

        // Let
        let error   = options && options.error || null,
            headers = options && options.headers || {},
            code    = error ? (http.STATUS_CODES[error.code] ? error.code : 500) : null,
            message = error ? (XP.isBetween(code, 400, 499) ? error.message : http.STATUS_CODES[code]) : null,
            data    = error ? {error: {code: code, message: message}} : options && options.data;

        // Setting
        this.options  = options;
        this.data     = error ? null : data;
        this.error    = error ? data : null;
        this.mode     = this.options.mode || 'json';
        this.response = this.options.response || null;
        this.body     = this.mode === 'json' ? XP.toJSON(data) : XP.toString(this.data || '');

        // Checking
        if (!this.response) { return; }

        // Headers
        Object.keys(this.modes[this.mode]).forEach(key => this.header(key, this.modes[this.mode][key]));
        Object.keys(headers).forEach(key => this.header(key, headers[key]));
        this.header('Content-Length', Buffer.byteLength(this.body));

        // Status
        this.response.statusCode    = this.error ? code : this.options.code || (this.statusCode === 200 && !this.body ? 204 : this.statusCode);
        this.response.statusMessage = this.error ? message : http.STATUS_CODES[this.statusCode];

        // Binding
        this.response.end = this.response.end.bind(this.response, this.body, 'utf-8');
    },

    /*********************************************************************/

    /**
     * TODO DOC
     *
     * @method header
     * @param {string} name
     * @param {string} [value]
     * @returns {string}
     */
    header(name, value) {

        // Preventing
        if (!this.response) { return; }

        // Setting
        if (XP.isDefined(value)) { this.response[XP.isInput(value, true) ? 'setHeader' : 'removeHeader'](name, value); }

        // Returning
        return this.response.getHeader(name);
    },

    /**
     * TODO DOC
     *
     * @method send
     */
    send() {

        // Sending
        if (this.response) { this.response.end(); }
    },

    /*********************************************************************/

    /**
     * TODO DOC
     *
     * @property body
     * @type string
     * @readonly
     */
    body: {
        set(val) { return XP.isDefined(this.body) ? this.body : val; },
        validate(val) { return !XP.isString(val) && 'string'; }
    },

    /**
     * TODO DOC
     *
     * @property data
     * @type *
     */
    data: {
        set(val) { return XP.isDefined(this.data) ? this.data : val; }
    },

    /**
     * TODO DOC
     *
     * @property error
     * @type Object
     */
    error: {
        set(val) { return XP.isDefined(this.error) ? this.error : val; },
        validate(val) { return !XP.isNull(val) && !XP.isObject(val) && 'Object'; }
    },

    /**
     * TODO DOC
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
     * TODO DOC
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
     * TODO DOC
     *
     * @property response
     * @type Object
     */
    response: {
        set(val) { return XP.isDefined(this.response) ? this.response : val; },
        validate(val) { return !XP.isNull(val) && !XP.isObject(val) && 'Object'; }
    },

    /**
     * TODO DOC
     *
     * @property statusCode
     * @type number
     * @readonly
     */
    statusCode: {
        get() { return this.response ? this.response.statusCode : 200; }
    },

    /**
     * TODO DOC
     *
     * @property statusMessage
     * @type string
     * @readonly
     */
    statusMessage: {
        get() { return this.response ? this.response.statusMessage : http.STATUS_CODES[200]; }
    }
});
