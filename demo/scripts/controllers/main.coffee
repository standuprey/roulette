"use strict"
angular.module("rouletteDemo").controller "MainCtrl", ($scope) ->
	$scope.colors ||= ["#da355a", "#5da44d", "#ef7b54", "#4284a6", "#f1bd62", "#7d5aa2"]	
	$scope.labels = ["section 1", "section 2", "section 3", "section 4", "section 5", "section 6"]
	$scope.labelColors = ["#ffff00", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]
	$scope.labelIcons = ["images/benafro.png", "images/cog.png", "images/abc.png", "images/envelop.png", "images/group.png", "images/wrench.png"]
	$scope.eventInfo = "Turn the wheel or click on a section to see the event displayed here"
	$scope.$on "roulette:turned", (e, info) ->
		$scope.$apply ->
			$scope.eventInfo = "Event: roulette:turned - Params: #{JSON.stringify info}"
	$scope.$on "roulette:select", (e, info) ->
		$scope.$apply ->
			$scope.eventInfo = "Event: roulette:select - Params: #{JSON.stringify info}"
