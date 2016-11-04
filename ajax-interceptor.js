;
(function() {
	var observerId = 0;
	var observers = {};
	var AjaxInterceptor = function() {};

	AjaxInterceptor.prototype.registerObserver = function(observer, name) {

		if (name && typeof name != 'string') {
			throw new Error('name must be string');
		}

		name = name || ++observerId;

		if (name in observers) {
			throw new Error('a observer with name "' + name + '" already exists');
		}

		observers[name] = observer;
	}

	AjaxInterceptor.prototype.notifyObservers = function(event, xhr) {

		for (name in observers) {

			if (!(Object.prototype.hasOwnProperty.call(observers, name))) {
				continue;
			}

			var observer = observers[name];

			if ((!('condition' in observer)) || (!('callback' in observer))) {
				continue;
			}

			var applyForObserver = false;

			if (typeof observer['condition'] == 'function') {
				applyForObserver = !!(observer['condition'].call(null, xhr._method, xhr._url, xhr));
			} else if (RegExp.prototype.isPrototypeOf(observer['condition'])) {
				observer['condition'].lastIndex = 0;
				applyForObserver = !!(observer['condition'].test(xhr._method + ' ' + xhr._url));
			}

			if (applyForObserver && typeof observer['callback'] == 'function') {
				observer['callback'].call(null, event, xhr);
			}
		}

	}

	window.AjaxInterceptor = new AjaxInterceptor();
}());

(function() {

	XMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT != null ? XMLHttpRequest.UNSENT : 0;
	XMLHttpRequest.OPENED = XMLHttpRequest.OPENED != null ? XMLHttpRequest.OPENED : 1;
	XMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED != null ? XMLHttpRequest.HEADERS_RECEIVED : 2;
	XMLHttpRequest.LOADING = XMLHttpRequest.LOADING != null ? XMLHttpRequest.LOADING : 3;
	XMLHttpRequest.DONE = XMLHttpRequest.DONE != null ? XMLHttpRequest.DONE : 4;

	(function(fn) {

		XMLHttpRequest.prototype.open = function(method, url) {
			try {
				var onreadystatechangeDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'onreadystatechange');

				Object.defineProperty(this, 'onreadystatechange', {
					get: function() {
						return onreadystatechangeDescriptor.get.call(this);
					},
					set: function() {
						var xhr = this;
						xhr._method = method;
						xhr._url = url;
						this._newOnreadystatechangeCallback = (function(onreadystatechangeCallback) {
							return function(event) {
								AjaxInterceptor.notifyObservers(event, xhr);
								return onreadystatechangeCallback.apply(xhr, arguments);
							}
						}).apply(null, arguments);



						return onreadystatechangeDescriptor.set.call(this, this._newOnreadystatechangeCallback);

						// return r;
					},
					enumerable: true,
					configurable: true
				});
			} catch (e) {
				// IE8
			}
			return fn.apply(this, arguments);
		}

	}(XMLHttpRequest.prototype.open));

}());
