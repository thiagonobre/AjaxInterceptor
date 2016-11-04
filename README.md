# AjaxInterceptor
A script that allow you intercept XmlHttpRequests

### Embed the lib in your project and you'll be able to register the observers on requests
```js
AjaxInterceptor.registerObserver({
	condition: function(method, url) {
		return method == "GET";
	},
	callback: function(event, xhr) {
		switch (xhr.readyState) {
			case XMLHttpRequest.DONE:
				// your code here
				break;
		}
	}
});
```

```js
AjaxInterceptor.registerObserver({
	condition: /(GET|POST) https?\:\/\/www.*/,
	callback: function(event, xhr) {
		switch (xhr.readyState) {
			case XMLHttpRequest.DONE:
				// your code here
				break;
		}
	}
});
```

The condition property can be a function that returns a boolean or a regex (which will be tested against "method url"), any other type of return value will be converted to boolean

The callback will be executed if the condition evaluates to true

## Compatibility
Works on browsers with ECMAScript 5 support
