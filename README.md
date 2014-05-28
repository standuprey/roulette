roulette Angular Module
========================

Drag and drop or select an image, crop it and get the blob, that you can use to upload wherever and however you want

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
			size="640"
			sections="6"
			labels="labels">
		</roulette>

- size: Diameter of the roulette
- sections: Number of sections in the rouletter
- labels: (optional) Labels for each section. Array of n strings, where n == number of sections.

And don't forget to add the module to your application

		angular.module("myApp", ["roulette"])

Demo
----

Try the (very simple) demo. How to run the demo? Simple...

		git clone git@github.com:standup75/roulette.git
		cd roulette
		npm install && bower install
		grunt server

This should open your browser at http://localhost:9000 where the demo now sits.
