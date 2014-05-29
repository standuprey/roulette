Roulette Angular Module
========================

Implement a wheel menu for mobile devices with this angular directive

Install
-------

Copy the roulette.js and roulette.css file into your project and add the following line with the correct path:

		<script src="/path/to/scripts/roulette.js"></script>
		<link rel="stylesheet" href="/path/to/scripts/roulette.css">


Alternatively, if you're using bower, you can add this to your component.json (or bower.json):

		"angular-roulette": "~0.1.0"

Or simply run

		bower install angular-roulette

And add this to your HTML:

    <script src="components/roulette/roulette.js"></script>
    <link rel="stylesheet" href="/path/to/scripts/roulette.css">


Usage
-----
		<roulette
			labels="labels">
		</roulette>

- labels: Labels for each section. Array of n strings, where n == number of sections. The minimum would be 2 empty sections: scope.label = ["", ""]

And don't forget to add the module to your application

		angular.module("myApp", ["roulette"])

Options
-------

- `thickness`: Thickness of the wheel. Could in % or in pixel. Exemple: thickness: "25%" or thickness: "100px". Default: 25%
- `centerColor`: The color in the middle of the wheel. Defaults to white
- `labelColors`: Labels color for each section. Array of n strings, where n == number of sections. Defaults to white
- `labelIcons`: (Coming soon!) Icon url for each section. Array of n strings, where n == number of sections. Defaults to empty
- `fontSize`: font size of the labels in pixels. defaults to 18
- `fontFamily`: font family to be used for the labels. Defaults to helvetica
- `colors`: Background color for each section. Array of n strings, where n == number of sections. Defaults to #666 and #999 alternatively
- `snap`: false | true. When turning the wheel, set this to true (default) if you want the wheel to snap to the nearest section
- `iconsRatio`: How much smaller should be the icon displayed compared to their actual size. Defaults to 0.5 (good for retina displays)

Events
------

2 events are broadcasted on the $rootScope:
- `roulette:turned`: When you have turned the wheel. Sends the section on top
- `roulette:select`: When you have clicked (or touched) a section of the wheel (without turning it). Sends the selected section

Both events are broadcasted with label, color, labelColor, and icon url of the section

		label: "Section 1"
		color: "#555500"
		labelColor: "#ffffff"
		icon: "/images/cog.png"

So, you can listen to these events like this:

		$scope.$on("roulette:turned", function(e, info){ console.log("Event: roulette:turned - Params: " + JSON.stringify(info)); });
		$scope.$on("roulette:select", function(e, info){ console.log("Event: roulette:turned - Params: " + JSON.stringify(info)); });

Demo
----

Live demo:

http://standupweb.net/demo/angular/roulette

Try the (very simple) demo. How to run the demo? Simple...

		git clone git@github.com:standup75/roulette.git
		cd roulette
		npm install && bower install
		grunt server

This should open your browser at http://localhost:9000 where the demo now sits.
