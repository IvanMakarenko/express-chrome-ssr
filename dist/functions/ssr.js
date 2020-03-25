"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ssr = ssr;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _puppeteer = _interopRequireDefault(require("puppeteer"));

// https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
// Dont download all resources, we just need the HTML
// Also, this is huge performance/response time boost
var blockedResourceTypes = ['image', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
var skippedResources = ['quantserve', 'adzerk', 'doubleclick', 'adition', 'exelator', 'sharethrough', 'cdn.api.twitter', 'google-analytics', 'googletagmanager', 'google', 'fontawesome', 'facebook', 'analytics', 'optimizely', 'clicktale', 'mixpanel', 'zedo', 'clicksor', 'tiqcdn'];
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
    var browser, page, _page$setViewport, response, html, _html;

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
            _context.next = 6;
            return browser.newPage();

          case 6:
            page = _context.sent;
            _context.next = 9;
            return page.setRequestInterception(true);

          case 9:
            if (!(userAgent.length == 1)) {
              _context.next = 18;
              break;
            }

            if (!(userAgent == 1)) {
              _context.next = 13;
              break;
            }

            _context.next = 13;
            return page.setViewport((_page$setViewport = {
              'width': 800
            }, (0, _defineProperty2["default"])(_page$setViewport, "width", 600), (0, _defineProperty2["default"])(_page$setViewport, 'isMobile', false), _page$setViewport));

          case 13:
            if (!(userAgent == 2)) {
              _context.next = 16;
              break;
            }

            _context.next = 16;
            return page.emulate(_puppeteer["default"].devices['iPhone XR']);

          case 16:
            _context.next = 22;
            break;

          case 18:
            _context.next = 20;
            return page.setUserAgent(userAgent);

          case 20:
            _context.next = 22;
            return page.setViewport({});

          case 22:
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
            _context.next = 25;
            return page["goto"](url, {
              timeout: 25000,
              waitUntil: 'networkidle2'
            });

          case 25:
            response = _context.sent;
            _context.next = 28;
            return page.evaluate(function (url) {
              var base = document.createElement('base');
              base.href = url; // Add to top of head, before all other resources.

              document.head.prepend(base);
            }, url);

          case 28:
            _context.next = 30;
            return page.evaluate(function () {
              var elements = document.querySelectorAll('script, link[rel="import"]');
              elements.forEach(function (e) {
                return e.remove();
              });
            });

          case 30:
            _context.next = 32;
            return page.content();

          case 32:
            html = _context.sent;
            _context.next = 35;
            return page.close();

          case 35:
            return _context.abrupt("return", {
              html: html,
              status: response ? response.status() : 200
            });

          case 38:
            _context.prev = 38;
            _context.t0 = _context["catch"](3);
            _html = _context.t0.toString();
            console.warn({
              message: "URL: ".concat(url, " Failed with message: ").concat(_html)
            });
            return _context.abrupt("return", {
              html: _html,
              status: 500
            });

          case 43:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 38]]);
  }));
  return _ssr.apply(this, arguments);
}

;