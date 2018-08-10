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

var _reactRouterDom = require("react-router-dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isEmptyChildren = function isEmptyChildren(children) {
  return _react2.default.Children.count(children) === 0;
};

/**
 * The public API for matching a single path and rendering.
 */

var RouteFactory = function (_React$Component) {
  _inherits(RouteFactory, _React$Component);

  _createClass(RouteFactory, [{
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

  function RouteFactory(props, context) {
    _classCallCheck(this, RouteFactory);

    var _this = _possibleConstructorReturn(this, (RouteFactory.__proto__ || Object.getPrototypeOf(RouteFactory)).call(this, props, context));

    var match = _this.computeMatch(_this.props, _this.context.router);
    var inactive = _this.props.inactive | _this.context.router.inactive;
    _this.state = {
      match: match,
      inactive: inactive,
      contextState: {
        routeSlot: match && !inactive ? _defineProperty({}, match.url, {
          location: _extends({}, location)
        }) : {},
        removeRoute: function removeRoute(matchUrl) {
          _this.setState(function (prevState, props) {
            var nextSlot = _extends({}, prevState.contextState.routeSlot);
            delete nextSlot[matchUrl];
            return {
              contextState: _extends({}, prevState.contextState, {
                routeSlot: nextSlot
              })
            };
          });
        },
        addRoute: function addRoute(matchUrl, location) {
          _this.setState(function (prevState, props) {
            if (matchUrl in prevState.contextState.routeSlot) return;
            var nextContextState = _extends({}, prevState.contextState);
            nextContextState.routeSlot = _extends({}, nextContextState.routeSlot, _defineProperty({}, matchUrl, {
              location: _extends({}, location),
              state: 0
            }));
            return {
              contextState: nextContextState
            };
          });
        },
        tick: function tick(matchUrl, inactive) {
          _this.setState(function (prevState, props) {
            var nextContextState = _extends({}, prevState.contextState);
            var nextRouteSlot = _extends({}, nextContextState.routeSlot);
            var removes = [];
            for (var key in nextRouteSlot) {
              if (!inactive && key == matchUrl) nextRouteSlot[key].state++;else removes.push(key);
            }
            for (var _key in removes) {
              delete nextRouteSlot[removes[_key]];
            }return {
              contextState: _extends({}, nextContextState, {
                routeSlot: nextRouteSlot
              })
            };
          });
        }
      }
    };
    return _this;
  }

  _createClass(RouteFactory, [{
    key: "computeMatch",
    value: function computeMatch(_ref2, router) {
      var computedMatch = _ref2.computedMatch,
          location = _ref2.location,
          path = _ref2.path,
          strict = _ref2.strict,
          exact = _ref2.exact,
          sensitive = _ref2.sensitive;

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
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.state.fadingTimer) clearTimeout(this.state.fadingTimer);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps, nextContext) {
      (0, _warning2.default)(!(nextProps.location && !this.props.location), '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.');

      (0, _warning2.default)(!(!nextProps.location && this.props.location), '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.');

      var match = this.computeMatch(nextProps, nextContext.router);
      var inactive = nextProps.inactive | nextContext.inactive;
      this.setState({
        inactive: inactive
      });

      var matchUrl = match && !nextProps.inactive ? match.url : null;
      if (matchUrl) this.state.contextState.addRoute(matchUrl, this.props.location || nextContext.router.route.location);
      this.state.contextState.tick(matchUrl, inactive);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _reactTransitionGroup.TransitionGroup,
        null,
        Object.keys(this.state.contextState.routeSlot).map(function (routeKey, i) {
          var route = _this2.state.contextState.routeSlot[routeKey];
          return _react2.default.createElement(
            _reactTransitionGroup.CSSTransition,
            { key: routeKey, classNames: _this2.props.classNames, timeout: _this2.props.timeout },
            _react2.default.createElement(_reactRouterDom.Route, _extends({}, _this2.props, { location: route.location }))
          );
        })
      );
    }
  }]);

  return RouteFactory;
}(_react2.default.Component);

RouteFactory.propTypes = {
  computedMatch: _propTypes2.default.object, // private, from <Switch>
  path: _propTypes2.default.string,
  exact: _propTypes2.default.bool,
  strict: _propTypes2.default.bool,
  sensitive: _propTypes2.default.bool,
  component: _propTypes2.default.func,
  render: _propTypes2.default.func,
  children: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
  location: _propTypes2.default.object,
  timeout: _propTypes2.default.number,
  inactive: _propTypes2.default.bool
};
RouteFactory.contextTypes = {
  router: _propTypes2.default.shape({
    history: _propTypes2.default.object.isRequired,
    route: _propTypes2.default.object.isRequired,
    staticContext: _propTypes2.default.object,
    inactive: _propTypes2.default.bool
  })
};
RouteFactory.childContextTypes = {
  router: _propTypes2.default.object.isRequired
};
exports.default = RouteFactory;