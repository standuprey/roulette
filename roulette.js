(function() {
  var app;

  app = angular.module("roulette", ["ngTouch", "superswipe"]);

  app.service("imageLoader", function($window, $document, $swipe, $rootScope) {
    var count, getProgressPercent, sources, totalCount;
    sources = [];
    count = 0;
    totalCount = 0;
    getProgressPercent = function() {
      return 100 - Math.round((count * 100) / totalCount);
    };
    return {
      images: {},
      done: function(success) {
        this.loaded = true;
        return typeof success === "function" ? success() : void 0;
      },
      load: function(success, progress) {
        var image, source, _i, _len, _results,
          _this = this;
        totalCount = count;
        if (count === 0) {
          this.done(success);
        }
        _results = [];
        for (_i = 0, _len = sources.length; _i < _len; _i++) {
          source = sources[_i];
          image = new Image;
          image.onload = function() {
            count--;
            if (count === 0) {
              _this.done(success);
            }
            return typeof progress === "function" ? progress(getProgressPercent()) : void 0;
          };
          image.onerror = function() {
            return count--;
          };
          _results.push(image.src = source);
        }
        return _results;
      },
      add: function(source) {
        var image;
        this.loaded = false;
        sources.push(source);
        count++;
        image = new Image;
        image.src = source;
        this.images[source] = image;
        return image;
      },
      loaded: false
    };
  });

  app.directive("roulette", function($window, $document, $swipe, $rootScope, imageLoader) {
    var diff, getAngle, initCanvas, makeAnglePositif, negFactor, offset, rotateWheel;
    $window.requestAnimFrame = (function() {
      return $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame || $window.oRequestAnimationFrame || $window.msRequestAnimationFrame || function(callback) {
        return $window.setTimeout(callback, 1000 / swGame.settings.cycle);
      };
    })();
    makeAnglePositif = function(angle) {
      return (angle + 2 * Math.PI) % (2 * Math.PI);
    };
    diff = function(a, b) {
      return getAngle(b) - getAngle(a);
    };
    getAngle = function(coords) {
      var angle;
      angle = Math.atan(coords.y / coords.x);
      if (coords.x < 0) {
        if (coords.y < 0) {
          angle += Math.PI;
        } else {
          angle -= Math.PI;
        }
      } else {
        if (coords.y < 0) {
          angle += 2 * Math.PI;
        }
      }
      return angle;
    };
    rotateWheel = function(ctx, wheel, angle) {
      var radius;
      radius = Math.round(wheel.width / 2);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle);
      ctx.drawImage(wheel, -radius, -radius);
      return ctx.restore();
    };
    initCanvas = function(width, height) {
      var canvas, ctx;
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");
      canvas.height = height;
      canvas.width = width;
      canvas.style.height = "" + height + "px";
      canvas.style.width = "" + width + "px";
      return [canvas, ctx];
    };
    offset = function(el) {
      var offsetLeft, offsetTop;
      offsetTop = 0;
      offsetLeft = 0;
      while (el) {
        offsetTop += el.offsetTop;
        offsetLeft += el.offsetLeft;
        el = el.offsetParent;
      }
      return {
        top: offsetTop,
        left: offsetLeft
      };
    };
    negFactor = function(x) {
      if (x < 0) {
        return 1;
      } else {
        return 0;
      }
    };
    return {
      restrict: "E",
      scope: {
        thickness: "@?",
        centerColor: "@?",
        labelColors: "=?",
        labelIcons: "=?",
        labels: "=",
        fontSize: "@?",
        fontFamily: "@?",
        colors: "=?",
        iconsRatio: "@?",
        snap: "=?"
      },
      link: function(scope, element, attributes) {
        var angle, canvas, canvasSide, centerColor, color, ctx, drawLabelsAndIcons, elOffset, fontFamily, fontSize, getDestAngle, i, iconsRatio, imageUrl, origin, radius, sectionCount, sectionSpread, snap, startAngle, thickness, wheelCanvas, wheelCtx, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
        angle = 0;
        origin = null;
        fontSize = scope.fontSize || 12;
        centerColor = scope.centerColor || "#ffffff";
        fontFamily = scope.fontFamily || "helvetica";
        iconsRatio = scope.iconsRatio || 0.5;
        sectionCount = scope.labels.length;
        if (!(sectionCount > 1)) {
          throw "roulette directive: scope.labels, please specify at least 2 labels";
        }
        if (scope.colors && scope.colors.length !== sectionCount) {
          throw "roulette directive: scope.colors, please give as many colors as labels: expected " + sectionCount + ", found " + scope.colors.length;
        }
        if (scope.labelColors && scope.labelColors.length !== sectionCount) {
          throw "roulette directive: scope.labelColors, please give as many labelColors as labels: expected " + sectionCount + ", found " + scope.labelColors.length;
        }
        if (scope.labelIcons && scope.labelIcons.length !== sectionCount) {
          throw "roulette directive: scope.labelIcons, please give as many labelIcons as labels: expected " + sectionCount + ", found " + scope.labelIcons.length;
        }
        if (scope.snap == null) {
          scope.snap = true;
        }
        if (!(scope.colors && scope.labelColors)) {
          if (!scope.colors) {
            scope.colors = [];
          }
          if (!scope.labelColors) {
            scope.labelColors = [];
          }
          i = 0;
          while (i++ < sectionCount) {
            if (scope.labelColors.length !== sectionCount) {
              scope.labelColors.push("#ffffff");
            }
            if (scope.colors.length !== sectionCount) {
              if (i % 2) {
                scope.colors.push("#999999");
              } else {
                scope.colors.push("#666666");
              }
            }
          }
        }
        canvasSide = element[0].offsetWidth;
        _ref = initCanvas(canvasSide, canvasSide), canvas = _ref[0], ctx = _ref[1];
        _ref1 = initCanvas(canvasSide, canvasSide), wheelCanvas = _ref1[0], wheelCtx = _ref1[1];
        if (scope.thickness) {
          thickness = parseInt(scope.thickness, 10);
          if (scope.thickness.indexOf("%") > 0) {
            thickness = Math.round(thickness * canvasSide / 100);
          }
        }
        if (!thickness) {
          thickness = canvasSide / 4;
        }
        sectionCount = scope.colors.length;
        sectionSpread = Math.PI * 2 / sectionCount;
        startAngle = -(Math.PI + sectionSpread) / 2;
        radius = Math.round(canvasSide / 2);
        _ref2 = scope.colors;
        for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
          color = _ref2[i];
          wheelCtx.fillStyle = color;
          wheelCtx.beginPath();
          wheelCtx.moveTo(radius, radius);
          wheelCtx.arc(radius, radius, radius, sectionSpread * i + startAngle, sectionSpread * (i + 1) + startAngle, false);
          wheelCtx.fill();
        }
        wheelCtx.fillStyle = centerColor;
        wheelCtx.beginPath();
        wheelCtx.moveTo(0, 0);
        wheelCtx.moveTo(radius, radius);
        wheelCtx.arc(radius, radius, radius - thickness, 0, Math.PI * 2, true);
        wheelCtx.fill();
        drawLabelsAndIcons = function() {
          var img, label, labelMargin, labelSize, _j, _len1, _ref3, _ref4, _ref5;
          wheelCtx.save();
          wheelCtx.translate(radius, radius);
          console.log(radius, radius);
          wheelCtx.font = "" + fontSize + "px " + fontFamily;
          labelMargin = thickness * 0.2;
          _ref3 = scope.labelColors;
          for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
            color = _ref3[i];
            wheelCtx.fillStyle = color;
            label = scope.labels[i];
            labelSize = wheelCtx.measureText(label);
            wheelCtx.fillText(label, -labelSize.width / 2, thickness - radius - labelMargin);
            if ((_ref4 = scope.labelIcons) != null ? _ref4[i] : void 0) {
              img = imageLoader.images[(_ref5 = scope.labelIcons) != null ? _ref5[i] : void 0];
              wheelCtx.drawImage(img, 0, 0, img.width, img.height, Math.round(-img.width * iconsRatio / 2), -radius + (thickness - img.height * iconsRatio - fontSize - labelMargin) / 2, img.width * iconsRatio, img.height * iconsRatio);
            }
            wheelCtx.rotate(sectionSpread);
          }
          wheelCtx.restore();
          rotateWheel(ctx, wheelCanvas, 0);
          return element.append(canvas);
        };
        if (scope.labelIcons != null) {
          _ref3 = scope.labelIcons;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            imageUrl = _ref3[_j];
            imageLoader.add(imageUrl);
          }
          imageLoader.load(drawLabelsAndIcons);
        } else {
          drawLabelsAndIcons();
        }
        getDestAngle = function(section) {
          var destAngle;
          destAngle = makeAnglePositif(-section * sectionSpread);
          if (destAngle === 0 && angle > Math.PI) {
            destAngle = 2 * Math.PI;
          }
          return destAngle;
        };
        snap = function(section) {
          var animloop, destAngle, lastTime, progress, sign;
          destAngle = getDestAngle(section);
          progress = 0.05;
          sign = destAngle > angle ? 1 : -1;
          lastTime = 0;
          animloop = function() {
            var newTime, timeElapsed;
            newTime = new Date().getTime();
            timeElapsed = newTime - lastTime;
            if (timeElapsed > 30) {
              if (sign * destAngle > sign * (angle + sign * progress)) {
                angle += sign * progress;
                requestAnimFrame(animloop);
              } else {
                angle = destAngle;
              }
              return rotateWheel(ctx, wheelCanvas, angle);
            } else {
              return requestAnimFrame(animloop);
            }
          };
          return animloop();
        };
        $swipe.bind(angular.element(canvas), {
          'start': function(coords) {
            return origin = {
              x: coords.x - (elOffset.left + radius),
              y: coords.y - (elOffset.top + radius)
            };
          },
          'move': function(coords) {
            var dest;
            dest = {
              x: coords.x - (elOffset.left + radius),
              y: coords.y - (elOffset.top + radius)
            };
            return rotateWheel(ctx, wheelCanvas, angle + diff(origin, dest));
          },
          'end': function(coords) {
            var angleDiff, dest, destAngle, eventName, section, sectionAngle, x1y0, _ref4, _ref5;
            dest = {
              x: coords.x - (elOffset.left + radius),
              y: coords.y - (elOffset.top + radius)
            };
            angleDiff = diff(origin, dest);
            angle = makeAnglePositif(angle + angleDiff);
            section = parseInt(makeAnglePositif(-angle + Math.PI / sectionCount) / sectionSpread, 10);
            eventName = "roulette:turned";
            if (scope.snap) {
              snap(section);
            }
            if (Math.abs(angleDiff) < sectionSpread / 4) {
              x1y0 = {
                x: 100,
                y: 0
              };
              sectionAngle = diff(x1y0, dest);
              destAngle = getDestAngle(section);
              section = parseInt(makeAnglePositif(sectionAngle + 2 * sectionSpread - destAngle) / sectionSpread, 10);
              eventName = "roulette:select";
            }
            return $rootScope.$broadcast(eventName, {
              index: section,
              label: scope.labels[section],
              color: scope.colors[section],
              labelColor: (_ref4 = scope.labelColors) != null ? _ref4[section] : void 0,
              icon: (_ref5 = scope.labelIcons) != null ? _ref5[section] : void 0
            });
          }
        });
        return elOffset = offset(element[0]);
      }
    };
  });

}).call(this);
