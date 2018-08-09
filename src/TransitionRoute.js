import warning from "warning";
import invariant from "invariant";
import React from "react";
import PropTypes from "prop-types";
import { matchPath } from "react-router";
import { CSSTransition } from "react-transition-group";

const isEmptyChildren = children => React.Children.count(children) === 0;

/**
 * The public API for matching a single path and rendering.
 */
class Route extends React.Component {
  static propTypes = {
    computedMatch: PropTypes.object, // private, from <Switch>
    path: PropTypes.string,
    exact: PropTypes.bool,
    strict: PropTypes.bool,
    sensitive: PropTypes.bool,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    always: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    location: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired,
      route: PropTypes.object.isRequired,
      staticContext: PropTypes.object,
      inactive: PropTypes.bool,
    })
  };

  static childContextTypes = {
    router: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      router: {
        ...this.context.router,
        route: {
          location: this.props.location || this.context.router.route.location,
          match: this.state.match
        }
      }
    };
  }

  constructor(props, context) {
    super(props, context);
    let match = this.computeMatch(this.props, this.context.router);
    this.state = {
      match: match,
      savedMatch: match && {...match},
      savedLocation: match && {...(this.props.location || this.context.router.route.location)}
    }
  }

  computeMatch(
    { computedMatch, location, path, strict, exact, sensitive },
    router
  ) {
    if (computedMatch) return computedMatch; // <Switch> already computed the match for us

    invariant(
      router,
      "You should not use <Route> or withRouter() outside a <Router>"
    );

    const { route } = router;
    const pathname = (location || route.location).pathname;

    return matchPath(pathname, { path, strict, exact, sensitive }, route.match);
  }

  componentWillMount() {
    warning(
      !(this.props.component && this.props.render),
      "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored"
    );

    warning(
      !(
        this.props.component &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      "You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored"
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      "You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored"
    );
  }

  componentWillReceiveProps(nextProps, nextContext) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );

    let match = this.computeMatch(nextProps, nextContext.router);
    this.setState({
      match: match
    });

    if (match && !nextProps.inactive) {
      // Clear saved state
      this.setState({
        savedMatch: null,
        savedLocation: null
      })
    }
    else {
      // Save the last match and location
      this.setState({
        savedMatch: {...this.state.match},
        savedLocation: {...(this.props.location || this.context.router.route.location)}
      })
    }
  }

  render() {
    const { match } = this.state;
    const { children, component, render, always, inactive } = this.props;
    const { history, route, staticContext } = this.context.router;
    const location = this.props.location || route.location;
    const props = {
      match: match,
      location: location,
      inactive, history, staticContext
    };
    const alwaysProps = {
      match: this.state.savedMatch || match,
      location: this.state.savedLocation || location,
      rawMatch: match,
      rawLocation: location,
      inactive, history, staticContext
    };

    return (
      <CSSTransition in={alwaysProps.rawMatch} timeout={this.props.timeout} classNames={this.props.classNames} unmountOnExit>
      {
        state => (
          /* Render 'Always' part */
          (typeof always == 'function') ?
            always(alwaysProps) :
          (always && !isEmptyChildren(always)) ?
            React.cloneElement(React.Children.only(always), alwaysProps) :
          null
        )
      }
      </CSSTransition>
    )

    // if (component) return match ? React.createElement(component, props) : null;

    // if (render) return match ? render(props) : null;

    // if (typeof children === "function") return children(props);

    // if (children && !isEmptyChildren(children))
    //   return React.Children.only(children);

    // return null;
  }
}

export default Route;
