import warning from "warning";
import invariant from "invariant";
import React from "react";
import PropTypes from "prop-types";
import { matchPath } from "react-router";
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Route } from 'react-router-dom';

const isEmptyChildren = children => React.Children.count(children) === 0;

/**
 * The public API for matching a single path and rendering.
 */
class RouteFactory extends React.Component {
  static propTypes = {
    computedMatch: PropTypes.object, // private, from <Switch>
    path: PropTypes.string,
    exact: PropTypes.bool,
    strict: PropTypes.bool,
    sensitive: PropTypes.bool,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    location: PropTypes.object,
    timeout: PropTypes.number,
    inactive: PropTypes.bool,
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
    let inactive = this.props.inactive | this.context.router.inactive;
    this.state = {
      match: match,
      inactive: inactive,
      contextState: {
        routeSlot: (match && !inactive) ? {
          [match.url]: {
            location: {...location},
          }
        } : {},
        removeRoute: (matchUrl) => {
          this.setState((prevState, props) => {
            let nextSlot = {...prevState.contextState.routeSlot};
            delete nextSlot[matchUrl];
            return {
              contextState: {
                ...prevState.contextState,
                routeSlot: nextSlot
              }
            }
          })
        },
        addRoute: (matchUrl, location) => {
          this.setState((prevState, props) => {
            if (matchUrl in prevState.contextState.routeSlot) return;
            let nextContextState = {...prevState.contextState};
            nextContextState.routeSlot = {
              ...nextContextState.routeSlot,
              [matchUrl]: {
                location: {...location},
                state: 0
              }
            };
            return {
              contextState: nextContextState
            }
          });
        },
        tick: (matchUrl, inactive) => {
          this.setState((prevState, props) => {
            let nextContextState = {...prevState.contextState};
            let nextRouteSlot = {...nextContextState.routeSlot};
            let removes = [];
            for (let key in nextRouteSlot) {
              if (!inactive && key == matchUrl) nextRouteSlot[key].state++;
              else removes.push(key);
            }
            for (let key in removes) delete nextRouteSlot[removes[key]];
            return {
              contextState: {
                ...nextContextState,
                routeSlot: nextRouteSlot
              }
            }
          })
        }
      }
    };
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

  componentWillUnmount() {
    if (this.state.fadingTimer) clearTimeout(this.state.fadingTimer);
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

    const match = this.computeMatch(nextProps, nextContext.router);
    let inactive = nextProps.inactive | nextContext.inactive;
    this.setState({
      inactive: inactive
    });

    const matchUrl = (match && !nextProps.inactive) ? match.url : null;
    if (matchUrl)
      this.state.contextState.addRoute(matchUrl, this.props.location || nextContext.router.route.location)
    this.state.contextState.tick(matchUrl, inactive);

  }

  render() {
    return (
      <TransitionGroup>
      {
        Object.keys(this.state.contextState.routeSlot).map((routeKey, i) => {
          let route = this.state.contextState.routeSlot[routeKey];
          return (
              <CSSTransition key={routeKey} classNames={this.props.classNames} timeout={this.props.timeout}>
                <Route {...this.props} location={route.location}/>
              </CSSTransition>
              
          )
        })
      }
      </TransitionGroup>
    )
  }
}

export default RouteFactory;
