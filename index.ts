const Observable: any = function(forEach) {
  this._forEach = forEach;
};

Observable.prototype = {
  forEach: function(onNext, onError, onCompleted) {
    // observer
    if (typeof onNext === "function") {
      return this._forEach({
        onNext: onNext,
        onError: onError || function() { },
        onCompleted: onCompleted || function() { },
      });
    } else {
      this._forEach(onNext);
    }
  },
  map: function(projectionFunction) {
    const self = this;
    // mapped observable
    return new Observable(function forEach(observer) {
      self.forEach(
        function onNext(x) {
          observer.onNext(projectionFunction(x));
        },
        function onError(e) {
          observer.onError(e);
        },
        function onCompleted() {
          observer.onCompleted();
        },
      );
    });
  },
  filter: function(predicateFunction) {
    const self = this;
    // filtered observable
    return new Observable(function forEach(observer) {
      return self.forEach(
        function onNext(x) {
          if (predicateFunction(x)) {
            observer.onNext(x);
          }
        },
        function onError(e) {
          observer.onError(e);
        },
        function onCompleted() {
          observer.onCompleted();
        },
      );
    });
  },
  take: function(num) {
    const self = this;
    // take observable
    return new Observable(function forEach(observer) {
      let counter = 0;
      const subscription = self.forEach(
        function onNext(v) {
          observer.onNext(v);
          counter++;
          if (counter === num) {
            observer.onCompleted();
            subscription.dispose();
          }
        },
        function onError(e) {
          observer.onError(e);
        },
        function onCompleted() {
          observer.onCompleted();
        },
      );

      return subscription;
    });
  },
};

Observable.fromEvent = function(dom: HTMLElement, eventName) {
  // example of forEach
  return new Observable(function forEach(observer) {
    const handler = e => observer.onNext(e);
    dom.addEventListener(eventName, handler);

    return {
      dispose: function() {
        dom.removeEventListener(eventName, handler);
      },
    };
  });
};

const btn = document.getElementById("btn");

Observable.fromEvent(btn, "click")
  .filter(e => e.pageX > 40)
  .map(e => e.pageX + 10)
  .forEach(console.log);
