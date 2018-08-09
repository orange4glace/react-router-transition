"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _warning = require("warning");

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require("react-router");

var _reactTransitionGroup = require("react-transition-group");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isEmptyChildren = function isEmptyChildren(children) {
  return _react2.default.Children.count(children) === 0;
};

/**
 * The public API for matching a single path and rendering.
 */

var Route = function (_React$Component) {
  _inherits(Route, _React$Component);

  _createClass(Route, [{
    key: "getChildContext",
    value: function getChildContext() {
      return {
        router: _extends({}, this.context.router, {
          route: {
            location: this.props.location || this.context.router.route.location,
            match: this.state.match
          }
        })
      };
    }
  }]);

  function Route(props, context) {
    _classCallCheck(this, Route);

    var _this = _possibleConstructorReturn(this, (Route.__proto__ || Object.getPrototypeOf(Route)).call(this, props, context));

    var match = _this.computeMatch(_this.props, _this.context.router);
    _this.state = {
      match: match,
      savedMatch: match && _extends({}, match),
      savedLocation: match && _extends({}, _this.props.location || _this.context.router.route.location)
    };
    return _this;
  }

  _createClass(Route, [{
    key: "computeMatch",
    value: function computeMatch(_ref, router) {
      var computedMatch = _ref.computedMatch,
          location = _ref.location,
          path = _ref.path,
          strict = _ref.strict,
          exact = _ref.exact,
          sensitive = _ref.sensitive;

      if (computedMatch) return computedMatch; // <Switch> already computed the match for us

      (0, _invariant2.default)(router, "You should not use <Route> or withRouter() outside a <Router>");

      var route = router.route;

      var pathname = (location || route.location).pathname;

      return (0, _reactRouter.matchPath)(pathname, { path: path, strict: strict, exact: exact, sensitive: sensitive }, route.match);
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      (0, _warning2.default)(!(this.props.component && this.props.render), "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored");

      (0, _warning2.default)(!(this.props.component && this.props.children && !isEmptyChildren(this.props.children)), "You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored");

      (0, _warning2.default)(!(this.props.render && this.props.children && !isEmptyChildren(this.props.children)), "You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored");
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps, nextContext) {
      (0, _warning2.default)(!(nextProps.location && !this.props.location), '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.');

      (0, _warning2.default)(!(!nextProps.location && this.props.location), '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.');

      var match = this.computeMatch(nextProps, nextContext.router);
      this.setState({
        match: match
      });

      if (match && !nextProps.inactive) {
        // Clear saved state
        this.setState({
          savedMatch: null,
          savedLocation: null
        });
      } else {
        // Save the last match and location
        this.setState({
          savedMatch: _extends({}, this.state.match),
          savedLocation: _extends({}, this.props.location || this.context.router.route.location)
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var match = this.state.match;
      var _props = this.props,
          children = _props.children,
          component = _props.component,
          render = _props.render,
          always = _props.always,
          inactive = _props.inactive;
      var _context$router = this.context.router,
          history = _context$router.history,
          route = _context$router.route,
          staticContext = _context$router.staticContext;

      var location = this.props.location || route.location;
      var props = {
        match: match,
        location: location,
        inactive: inactive, history: history, staticContext: staticContext
      };
      var alwaysProps = {
        match: this.state.savedMatch || match,
        location: this.state.savedLocation || location,
        rawMatch: match,
        rawLocation: location,
        inactive: inactive, history: history, staticContext: staticContext
      };

      return _react2.default.createElement(
        _reactTransitionGroup.CSSTransition,
        { "in": alwaysProps.rawMatch, timeout: this.props.timeout, classNames: this.props.classNames, unmountOnExit: true },
        function (state) {
          return (
            /* Render 'Always' part */
            typeof always == 'function' ? always(alwaysProps) : always && !isEmptyChildren(always) ? _react2.default.cloneElement(_react2.default.Children.only(always), alwaysProps) : null
          );
        }
      );

      // if (component) return match ? React.createElement(component, props) : null;

      // if (render) return match ? render(props) : null;

      // if (typeof children === "function") return children(props);

      // if (children && !isEmptyChildren(children))
      //   return React.Children.only(children);

      // return null;
    }
  }]);

  return Route;
}(_react2.default.Component);

Route.propTypes = {
  computedMatch: _propTypes2.default.object, // private, from <Switch>
  path: _propTypes2.default.string,
  exact: _propTypes2.default.bool,
  strict: _propTypes2.default.bool,
  sensitive: _propTypes2.default.bool,
  component: _propTypes2.default.func,
  render: _propTypes2.default.func,
  children: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
  always: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
  location: _propTypes2.default.object
};
Route.contextTypes = {
  router: _propTypes2.default.shape({
    history: _propTypes2.default.object.isRequired,
    route: _propTypes2.default.object.isRequired,
    staticContext: _propTypes2.default.object,
    inactive: _propTypes2.default.bool
  })
};
Route.childContextTypes = {
  router: _propTypes2.default.object.isRequired
};
exports.default = Route;