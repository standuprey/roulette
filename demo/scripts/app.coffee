"use strict"
angular.module("rouletteDemo", ["roulette", "ngRoute"]).config ($routeProvider) ->
  $routeProvider.when("/",
    templateUrl: "views/main.html"
    controller: "MainCtrl"
  ).otherwise redirectTo: "/"
