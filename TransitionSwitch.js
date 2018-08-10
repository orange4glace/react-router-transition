"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _warning = require("warning");

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _reactRouter = require("react-router");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The public API for rendering the first <Route> that matches.
 */
var TransitionSwitch = function (_React$Component) {
  _inherits(TransitionSwitch, _React$Component);

  function TransitionSwitch() {
    _classCallCheck(this, TransitionSwitch);

    return _possibleConstructorReturn(this, (TransitionSwitch.__proto__ || Object.getPrototypeOf(TransitionSwitch)).apply(this, arguments));
  }

  _createClass(TransitionSwitch, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      (0, _invariant2.default)(this.context.router, "You should not use <Switch> outside a <Router>");
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      (0, _warning2.default)(!(nextProps.location && !this.props.location), '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.');

      (0, _warning2.default)(!(!nextProps.location && this.props.location), '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.');
    }
  }, {
    key: "render",
    value: function render() {
      var route = this.context.router.route;
      var children = this.props.children;

      var location = this.props.location || route.location;

      var match = void 0,
          child = void 0;
      return _react2.default.Children.map(children, function (element) {
        if (match == null && _react2.default.isValidElement(element)) {
          var _element$props = element.props,
              pathProp = _element$props.path,
              exact = _element$props.exact,
              strict = _element$props.strict,
              sensitive = _element$props.sensitive,
              from = _element$props.from;

          var path = pathProp || from;

          child = element;
          match = (0, _reactRouter.matchPath)(location.pathname, { path: path, exact: exact, strict: strict, sensitive: sensitive }, route.match);
          return _react2.default.cloneElement(element, {
            location: location,
            computedMatch: match
          });
        } else return _react2.default.cloneElement(element, {
          location: location,
          computedMatch: null,
          inactive: true
        });
      });
    }
  }]);

  return TransitionSwitch;
}(_react2.default.Component);

TransitionSwitch.contextTypes = {
  router: _propTypes2.default.shape({
    route: _propTypes2.default.object.isRequired
  }).isRequired
};
TransitionSwitch.propTypes = {
  children: _propTypes2.default.node,
  location: _propTypes2.default.object
};
exports.default = TransitionSwitch;