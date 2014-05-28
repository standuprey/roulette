(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module("roulette", ["ngTouch", "superswipe"]).directive("roulette", function($window, $document, $swipe, $rootScope) {
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
        snap: "=?"
      },
      link: function(scope, element, attributes) {
        var angle, canvas, canvasSide, color, ctx, elOffset, i, label, labelSize, origin, radius, sectionCount, sectionSpread, selectSection, snap, startAngle, thickness, wheelCanvas, wheelCtx, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
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
        scope.centerColor || (scope.centerColor = "#ffffff");
        scope.fontSize || (scope.fontSize = 18);
        scope.fontFamily || (scope.fontFamily = "helvetica");
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
        wheelCtx.fillStyle = scope.centerColor;
        wheelCtx.beginPath();
        wheelCtx.moveTo(0, 0);
        wheelCtx.moveTo(radius, radius);
        wheelCtx.arc(radius, radius, radius - thickness, 0, Math.PI * 2, true);
        wheelCtx.fill();
        wheelCtx.save();
        wheelCtx.translate(radius, radius);
        wheelCtx.font = "" + scope.fontSize + "px " + scope.fontFamily;
        _ref3 = scope.labelColors;
        for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
          color = _ref3[i];
          wheelCtx.fillStyle = color;
          label = scope.labels[i];
          labelSize = wheelCtx.measureText(label);
          wheelCtx.fillText(label, -labelSize.width / 2, thickness - radius - 30);
          wheelCtx.rotate(sectionSpread);
        }
        wheelCtx.restore();
        snap = function(section) {
          var animloop, destAngle, lastTime, progress, sign;
          destAngle = makeAnglePositif(-section * sectionSpread);
          if (destAngle === 0 && angle > Math.PI) {
            destAngle = 2 * Math.PI;
          }
          progress = 0.05;
          sign = destAngle > angle ? 1 : -1;
          lastTime = 0;
          animloop = function() {
            var angle, newTime, timeElapsed;
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
        angle = 0;
        origin = null;
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
            var dest, section;
            dest = {
              x: coords.x - (elOffset.left + radius),
              y: coords.y - (elOffset.top + radius)
            };
            angle = makeAnglePositif(angle + diff(origin, dest));
            section = parseInt(makeAnglePositif(-angle + Math.PI / sectionCount) / sectionSpread, 10);
            $rootScope.$broadcast("roulette:turned", {
              index: section,
              label: scope.labels[section],
              color: scope.colors[section],
              labelColor: scope.labelColors[section],
              icon: scope.labelIcons[section]
            });
            if (scope.snap) {
              return snap(section);
            }
          }
        });
        selectSection = function(e) {
          return console.log(e);
        };
        if (__indexOf.call($document[0].documentElement, 'ontouchstart') >= 0) {
          canvas.addEventListener("touchstart", selectSection);
        } else {
          canvas.addEventListener("click", selectSection);
        }
        elOffset = offset(element[0]);
        rotateWheel(ctx, wheelCanvas, 0);
        return element.append(canvas);
      }
    };
  });

}).call(this);
