# React Router Transition Pack  
This package helps you to implement animated-transition with react-router.  
Currently, [animated transition in react-router](https://reacttraining.com/react-router/web/example/animated-transitions) is very inefficient and has some major problems to use in practice.

Here're the components this package contains.

## TransitionRoute
`TransitionRoute` enables you to add a animated transition route easily.  
### Usage
```jsx
<TransitionRoute path='/path' classNames='fade' timeout={300} component={MyComponent}/>
```
```jsx
<TransitionRoute path='/path' classNames='fade' timeout={300} render={() => (
  <div> HELLO </div>
)}/>
```
### Props
Any `Route` props can be used except `children`. `children` props will be ignored.  
`classNames` : same with `classNames` of [`Transition`](https://reactcommunity.org/react-transition-group/css-transition)  
`timeout` : same with `timeout` of [`Transition`](https://reactcommunity.org/react-transition-group/css-transition)

## TransitionSwitch
For a original `Switch`, it filters which router to render from its children and renders only that matched router.  
This causes other routers disappear instantly so exiting animations can not be rendered.  
To prevent this, `TransitionSwitch` passes `inactive` prop to its children so each child knows its path is matched or not and then finally its render state is controlled by `Transition`.
### Usage
```jsx
<TransitionSwitch>
  <TransitionRoute path='/path1' classNames='fade' timeout={300} component={MyComponent}/>
  <TransitionRoute path='/path2' classNames='fade' timeout={300} render={() => (
    <div> HELLO </div>
  )}/>
</TransitionSwitch>
```
### Props
Same with `Switch`

## TransitionRouteFactory
Let's say you have a Route with parameter, something like
```jsx
<TransitionRoute path='/product/:product_id' classNames='fade' timeout={300} component={...}/>
```
Now you want `TransitionRoute` to be animated when `:product_id` is changed. (eg: /product/13 -> /prodcut/15)  
But you can see Route is not animating although parameter has been changed.  
Although parameter is changed, two urls are renders by same `TransitionRoute` component so there is no component changing.  
To prevent this, `TransitionRouteFactory` is introduced.  
`TransitionRouteFactory` uses [`TransitionGroup`](https://reactcommunity.org/react-transition-group/transition-group) so it dynamically maintains its single matched child and other animating(which is exit animation) children.
### Usage
```jsx
<TransitionRouteFactory path='/product/:product_id' classNames='fade' timeout={300} component={Component}/>
```
```jsx
/* Can be used with TransitionSwitch */
<TransitionSwitch>
  <TransitionRouteFactory path='/product/:product_id' classNames='fade' timeout={300} component={Component}/>
  <TransitionRoute path='/path1' classNames='fade' timeout={300} component={MyComponent}/>
</TransitionSwitch>
```
### Props
Any `Route` props can be used except `children`. `children` props will be ignored.  
`classNames` : same with `classNames` of [`Transition`](https://reactcommunity.org/react-transition-group/css-transition)  
`timeout` : same with `timeout` of [`Transition`](https://reactcommunity.org/react-transition-group/css-transition)  
_____________________
## Dependencies
react >= 5.0.0
react-router >= 4.0.0  
react-transition-group >= 2.0.0  
_____________________
## Version history

### 0.0.1
First commit

### 0.0.7
Bug fixed : Error (wrong `location` & undefined `match`) when `withRouter` is used.  
Bug fixed : `TransitionRoute` was displayed as `Route`  
Bug fixed : `TransitionRouteFactory` was displayed as `RouteFactory`  
_____________________
## Internals
Here's the first draft of idea about react-router-transition-pack which is published at [https://github.com/ReactTraining/react-router/issues/6283](url) although it has been closed in very short time :[  
Feel free to read :) It was very first draft so it has some difference between the code of this repository.  

Currently, the animated-transition JSX template looks like this. (From example)  
```jsx
<TransitionGroup>
<CSSTransition key={location.key} classNames="fade" timeout={300}>
  <Switch location={location}>
    <Route exact path="/hsl/:h/:s/:l" component={HSL} />
    <Route exact path="/rgb/:r/:g/:b" component={RGB} />
    {/* Without this `Route`, we would get errors during
      the initial transition from `/` to `/hsl/10/90/50`
  */}
    <Route render={() => <div>Not Found</div>} />
  </Switch>
</CSSTransition>
</TransitionGroup>
```
After I tried to use this code, I found out that there is a big problem.

## Problem
### Nested route is useless when `<Transition>` is used
Since `CSSTransition` has `location.key` as key prop, whenever the path is changed, even subroute path changing, `location.key` value will be replaced with new value. This occurs `CSSTransition` and its descendants must be re-rendered with **completely new DOM**. This is a huge waste of performance. Besides, animation also occurs when subroute path is changed.


## Example
![honeycam 2018-08-09 17-45-59](https://user-images.githubusercontent.com/17820596/43888254-1fba0eae-9bfc-11e8-8649-f0a34b01e9ba.gif)

Here is the basic behavior what I am going to propose.  
As you can see, there is a first level route which are `/A` and `/B` with colored box component.  
For each first level route, there's a nested second level route with `HELLO!` string, which is `/{FIRST_ROUTE}/A`  

When first level route changes, the opacity of colored box will fade in or fade out.  
When second level route changes, `HELLO!` string will wiped in or wiped out.  
Finally, when first level route changes while second level route is activated, first level transition and second level transition will be fired simultaneously.  


## Proposal
To achieve this, some base logic should be changed.  
First, for `<Route>`  component, I propose a new prop which is `always`.  
It always renders its component regardless of matching.  
It is logically similar with `children` prop but some props passed to its component are different.  

One of the problem of animated-transition is described below.  
1. Transition occurs when URL is changed. Now let's assume RouteA should disappear.  
2. RouteA, even though it is not matched anymore, should be rendered for some more 'animating' time.  
3. Since props related with router (eg: `match`, `location`) are passed by its ancestor route, RouteA receives its props but it is not valid anymore. Particularly, `match` prop will be `NULL`. This may crashes the application if there's a code something like using `match.url` because `match` is undefined and raises error eventually.

To solve this problem, `<Route>` will remember its latest **matched** `match` and `location` state. Now, even though `<Route>` is not matched anymore, `<Route>` knows its latest rendered state and its content can be rendered with it.

Now here's the difference between `children` prop and `always` prop.  
`children` prop receives `match` and `location` prop according to its current history state.  
`always` prop receives them according to its current history state when **route is matched**, if not, it receives them according to its latest matched state.(eg: when **route is not matched**) Additionally, there are additional props, `rawMatch` and `rawLocation`. They are based on current history state, just same with `match` and `location` props of `children`.

Now using `always` prop and `<CSSTransition>` component, implementing transition is fairly easy.
```jsx
<Route path='/my_path' always={(props) => (
    <CSSTransition in={!!props.rawMatch} timeout={600} classNames='transition' unmountOnExit>
	{
		state => (<div>Content</div>)
	}
    </CSSTransition>
)}/>
```

By nesting them, nested-level transition can also be implemented.
```jsx
<Route path='/my_path' always={props => (
    <CSSTransition in={!!props.rawMatch} timeout={600} classNames='transition' unmountOnExit>
	{
		state => (
			<div>
				<Route path={`${props.match.url}/nested`} always={props => (
					<CSSTransition in={!!props.rawMatch} timeout={600} className='nested-transition' unmountOnExit>
					{
						state => (
							<div>I'm nested!</div>
						)
					}
					</CSSTransition>
				)}/>
			</div>
		)
	}
    </CSSTransition>
)}/>
```

Of course it can be combined with HOC if needed.

I'll make PR if you guys are interested. Please feel free to have a discussion with me !

There's another animating problem with `Switch` and `Parameter Route` but I will separately describe it later if this current topic can be discussed well with others.