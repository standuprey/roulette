app = angular.module("roulette", ["ngTouch", "superswipe"])

app.service "imageLoader", ($window, $document, $swipe, $rootScope) ->
  sources = []
  count = 0
  totalCount = 0
  getProgressPercent = -> 100 - Math.round (count * 100) / totalCount

  images: {}
  done: (success) ->
  	@loaded = true
  	success?()
  load: (success, progress) ->
    totalCount = count
    @done(success) if count is 0
    for source in sources
      image = new Image
      image.onload = =>
        count--
        @done(success) if count is 0
        progress? getProgressPercent()
      image.onerror = -> count--
      image.src = source
  add: (source) ->
    @loaded = false
    sources.push source
    count++
    image = new Image
    image.src = source
    @images[source] = image
    image
  loaded: false

app.directive "roulette", ($window, $document, $swipe, $rootScope, imageLoader) ->
	$window.requestAnimFrame = do ->
		$window.requestAnimationFrame or $window.webkitRequestAnimationFrame or $window.mozRequestAnimationFrame or $window.oRequestAnimationFrame or $window.msRequestAnimationFrame or (callback) ->
			$window.setTimeout callback, 1000 / swGame.settings.cycle

	makeAnglePositif = (angle) -> (angle + 2 * Math.PI) % (2 * Math.PI)
	diff = (a, b) -> getAngle(b) - getAngle(a)
	getAngle = (coords) ->
		angle = Math.atan coords.y / coords.x
		if coords.x < 0
			if coords.y < 0
				angle += Math.PI
			else
				angle -= Math.PI
		else
			angle += 2 * Math.PI  if coords.y < 0
		angle
	rotateWheel = (ctx, wheel, angle) ->
		radius = Math.round wheel.width / 2
		ctx.clearRect 0, 0, ctx.canvas.width, ctx.canvas.height
		ctx.save()
		ctx.translate radius, radius
		ctx.rotate angle
		ctx.drawImage wheel, -radius, -radius
		ctx.restore()
	initCanvas = (width, height) ->
		canvas = document.createElement "canvas"
		ctx = canvas.getContext "2d"
		canvas.height = height
		canvas.width = width
		canvas.style.height = "#{height}px"
		canvas.style.width = "#{width}px"
		[canvas, ctx]
	offset = (el) ->
		offsetTop = 0
		offsetLeft = 0
		while el
			offsetTop += el.offsetTop
			offsetLeft += el.offsetLeft
			el = el.offsetParent
		top: offsetTop
		left: offsetLeft
	negFactor = (x) -> if x<0 then 1 else 0

	restrict: "E"
	scope:
		thickness: "@?"
		centerColor: "@?"
		labelColors: "=?"
		labelIcons: "=?"
		labels: "="
		fontSize: "@?"
		fontFamily: "@?"
		colors: "=?"
		iconsRatio: "@?"
		snap: "=?"
	link: (scope, element, attributes) ->
		angle = 0
		origin = null
		fontSize = scope.fontSize || 12
		centerColor = scope.centerColor || "#ffffff"
		fontFamily = scope.fontFamily || "helvetica"
		iconsRatio = scope.iconsRatio || 0.5
		sectionCount = scope.labels.length

		# check params
		throw("roulette directive: scope.labels, please specify at least 2 labels") unless sectionCount > 1
		throw("roulette directive: scope.colors, please give as many colors as labels: expected #{sectionCount}, found #{scope.colors.length}") if scope.colors and scope.colors.length isnt sectionCount
		throw("roulette directive: scope.labelColors, please give as many labelColors as labels: expected #{sectionCount}, found #{scope.labelColors.length}") if scope.labelColors and scope.labelColors.length isnt sectionCount
		throw("roulette directive: scope.labelIcons, please give as many labelIcons as labels: expected #{sectionCount}, found #{scope.labelIcons.length}") if scope.labelIcons and scope.labelIcons.length isnt sectionCount
		scope.snap = true unless scope.snap?

		# default colors
		unless scope.colors and scope.labelColors
			scope.colors = []  unless scope.colors
			scope.labelColors = []  unless scope.labelColors
			i = 0
			while i++ < sectionCount
				scope.labelColors.push("#ffffff")  if scope.labelColors.length isnt sectionCount
				if scope.colors.length isnt sectionCount
					if i % 2
						scope.colors.push "#999999"
					else
						scope.colors.push "#666666"

		# init canvas
		canvasSide = element[0].offsetWidth
		[canvas, ctx] = initCanvas canvasSide, canvasSide
		[wheelCanvas, wheelCtx] = initCanvas canvasSide, canvasSide

		# set wheel thickness
		if scope.thickness
			thickness = parseInt scope.thickness, 10
			thickness = Math.round(thickness * canvasSide / 100)  if scope.thickness.indexOf("%") > 0
		thickness = (canvasSide / 4)  unless thickness

		# draw sections
		sectionCount = scope.colors.length
		sectionSpread = Math.PI * 2 / sectionCount
		startAngle = - (Math.PI + sectionSpread) / 2
		radius = Math.round canvasSide / 2
		for color, i in scope.colors
			wheelCtx.fillStyle = color
			wheelCtx.beginPath()
			wheelCtx.moveTo radius, radius
			wheelCtx.arc radius, radius, radius, sectionSpread * i + startAngle, sectionSpread * (i + 1) + startAngle, false
			wheelCtx.fill()

		# draw center
		wheelCtx.fillStyle = centerColor
		wheelCtx.beginPath()
		wheelCtx.moveTo 0, 0
		wheelCtx.moveTo radius, radius
		wheelCtx.arc radius, radius, radius - thickness, 0, Math.PI * 2, true
		wheelCtx.fill()

		# draw labels and icons
		drawLabelsAndIcons = ->
			wheelCtx.save()
			wheelCtx.translate radius, radius
			console.log radius, radius
			wheelCtx.font = "#{fontSize}px #{fontFamily}"
			labelMargin = thickness * 0.2
			for color, i in scope.labelColors
				wheelCtx.fillStyle = color
				label = scope.labels[i]
				labelSize = wheelCtx.measureText label
				wheelCtx.fillText label, -labelSize.width / 2, thickness - radius - labelMargin
				if scope.labelIcons?[i]
					img = imageLoader.images[scope.labelIcons?[i]]
					wheelCtx.drawImage img,
						0,
						0,
						img.width,
						img.height,
						Math.round(-img.width * iconsRatio / 2),
						-radius + (thickness - img.height * iconsRatio - fontSize - labelMargin) / 2,
						img.width * iconsRatio, img.height * iconsRatio
				wheelCtx.rotate sectionSpread
			wheelCtx.restore()
			rotateWheel ctx, wheelCanvas, 0
			element.append canvas
		if scope.labelIcons?
			imageLoader.add(imageUrl) for imageUrl in scope.labelIcons
			imageLoader.load drawLabelsAndIcons
		else
			drawLabelsAndIcons()

		# snap to a section
		getDestAngle = (section) ->
			destAngle = makeAnglePositif -section * sectionSpread
			destAngle = 2 * Math.PI if destAngle is 0 and angle > Math.PI
			destAngle
		snap = (section) ->
			destAngle = getDestAngle section
			progress = 0.05
			sign = if destAngle > angle then 1 else -1
			lastTime = 0
			animloop = ->
				newTime = new Date().getTime()
				timeElapsed = newTime - lastTime
				if timeElapsed > 30
					if sign * destAngle > sign * (angle + sign * progress)
						angle += sign * progress
						requestAnimFrame(animloop)
					else
						angle = destAngle
					rotateWheel ctx, wheelCanvas, angle		
				else
					requestAnimFrame(animloop)
			animloop()

		# rotating
		$swipe.bind angular.element(canvas),
			'start': (coords) ->
				origin =
					x: coords.x - (elOffset.left + radius)
					y: coords.y - (elOffset.top + radius)

			'move': (coords) ->
				dest =
					x: coords.x - (elOffset.left + radius)
					y: coords.y - (elOffset.top + radius)
				rotateWheel ctx, wheelCanvas, angle + diff(origin, dest)

			'end': (coords) ->
				dest =
					x: coords.x - (elOffset.left + radius)
					y: coords.y - (elOffset.top + radius)
				angleDiff = diff(origin, dest)
				angle = makeAnglePositif angle + angleDiff
				section = parseInt(makeAnglePositif(- angle + Math.PI / sectionCount) / sectionSpread, 10)
				eventName = "roulette:turned"
				snap(section) if scope.snap
				if Math.abs(angleDiff) < sectionSpread / 4
					x1y0 =
						x: 100
						y: 0
					sectionAngle = diff(x1y0, dest)
					destAngle = getDestAngle section
					section = parseInt(makeAnglePositif(sectionAngle + 2 * sectionSpread - destAngle) / sectionSpread, 10)
					eventName = "roulette:select"
				$rootScope.$broadcast eventName,
					index: section
					label: scope.labels[section]
					color: scope.colors[section]
					labelColor: scope.labelColors?[section]
					icon: scope.labelIcons?[section]
				


		elOffset = offset element[0]
