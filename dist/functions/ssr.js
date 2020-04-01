"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ssr = ssr;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _puppeteer = _interopRequireDefault(require("puppeteer"));

// https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
// Dont download all resources, we just need the HTML
// Also, this is huge performance/response time boost
var blockedResourceTypes = ['image', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
var skippedResources = ['quantserve', 'adzerk', 'doubleclick', 'adition', 'exelator', 'sharethrough', 'cdn.api.twitter', 'google-analytics', 'googletagmanager', 'googleapis', 'google', 'fontawesome', 'bootstrap', 'facebook', 'analytics', 'optimizely', 'clicktale', 'mixpanel', 'zedo', 'clicksor', 'tiqcdn'];
/**
 * https://developers.google.com/web/tools/puppeteer/articles/ssr#reuseinstance
 * @param {string} url URL to prerender.
 * @param {string} browserWSEndpoint Optional remote debugging URL. If
 *     provided, Puppeteer's reconnects to the browser instance. Otherwise,
 *     a new browser instance is launched.
 * @param {string} userAgent of bot; Or use device 1 - for desktop, 2 - for iPhone XR
 */

function ssr(_x, _x2, _x3) {
  return _ssr.apply(this, arguments);
}

function _ssr() {
  _ssr = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(url, browserWSEndpoint, userAgent) {
    var browser, renderUrl, page, response, html, _html;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _puppeteer["default"].connect({
              browserWSEndpoint: browserWSEndpoint
            });

          case 2:
            browser = _context.sent;
            _context.prev = 3;
            renderUrl = new URL(url);
            _context.next = 7;
            return browser.newPage();

          case 7:
            page = _context.sent;
            _context.next = 10;
            return page.setRequestInterception(true);

          case 10:
            // set user agent (override the default headless User Agent)
            if (userAgent == 2) {
              renderUrl.searchParams.set('device2', ''); // await page.emulate(puppeteer.devices['iPhone XR']);
            }

            page.on('request', function (request) {
              var requestUrl = request._url.split('?')[0].split('#')[0];

              if (blockedResourceTypes.indexOf(request.resourceType()) !== -1 || skippedResources.some(function (resource) {
                return requestUrl.indexOf(resource) !== -1;
              })) {
                request.abort();
              } else {
                request["continue"]();
              }
            });
            _context.next = 14;
            return page["goto"](url, {
              timeout: 25000,
              waitUntil: 'networkidle2'
            });

          case 14:
            response = _context.sent;
            _context.next = 17;
            return page.evaluate(function (url) {
              var base = document.createElement('base');
              base.href = url; // Add to top of head, before all other resources.

              document.head.prepend(base);
            }, url);

          case 17:
            _context.next = 19;
            return page.evaluate(function () {
              var elements = document.querySelectorAll('script, link[rel="import"]');
              elements.forEach(function (e) {
                return e.remove();
              });
            });

          case 19:
            _context.next = 21;
            return page.content();

          case 21:
            html = _context.sent;
            _context.next = 24;
            return page.close();

          case 24:
            return _context.abrupt("return", {
              html: html,
              status: response ? response.status() : 200
            });

          case 27:
            _context.prev = 27;
            _context.t0 = _context["catch"](3);
            _html = _context.t0.toString();
            console.warn({
              message: "URL: ".concat(url, " Failed with message: ").concat(_html)
            });
            return _context.abrupt("return", {
              html: _html,
              status: 500
            });

          case 32:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 27]]);
  }));
  return _ssr.apply(this, arguments);
}

;