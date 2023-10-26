//for browser compatibility
if(!("getElementsByClassName" in document)){
	document.getElementsByClassName = function(className){
		var root = document.getElementsByTagName("html")[0]
		var elements = []
		function proccess(element){
			if(hasClass(element,className)){elements.push(element)}
			var children = element.children
			for(var i = 0; i < children.length; i++){
				proccess(children[i])
			}
		}
		return elements
	}
}
//DOM functions
function elementDim(element,dim){
    /*calculates and returns the specified dimension of an element or both
    if no valid dimension is specified*/
    var dimension = element.getBoundingClientRect()
	var fulldimension
	if(!("width" in dimension)){
		fulldimension = {w:dimension.right - dimension.left,h:dimension.bottom - dimension.top}
	}
	else{fulldimension = {w:dimension.width,h:dimension.height}}
    return (dim in fulldimension)? fulldimension[dim] : fulldimension;
}

function getAttribute(element,attribute){
	return element.getAttribute(attribute)
}
function stopPropagation(e){
	try{
		e.stopPropagation()
	}
	catch(err){
		e.cancelBubble = true
	}
}
function inContact(e1,e2,boundary){
	if(boundary == undefined){boundary = true}
	c1 = e1.getBoundingClientRect(); c2 = e2.getBoundingClientRect()
	return intercession(c1,c2,boundary) || intercession(c2,c1,boundary)
}
function intercession(c1,c2,boundary){
	var horzI = inrange(c1.right,c1.left,c2.left,boundary) || inrange(c1.right,c1.left,c2.right,boundary)
	var vertI = inrange(c1.top,c1.bottom,c2.bottom,boundary) || inrange(c1.top,c1.bottom,c2.top,boundary)
	return horzI && vertI
}
function inrange(n1,n2,x,includen){
	var min = Math.min(n1,n2)
	var max = Math.max(n1,n2)
	return (includen)? (x >= min && x <= max) : (x > min && x < max); 
}
function windowDim(dim){
    /*calculates and returns the specified dimension of the screen of the users 
    device or both if no valid dimension is specified*/
	if(window.innerHeight == undefined || window.innerWidth == undefined){
		var html = document.getElementsByTagName("html")[0]
		var dimension = elementDim(html)
	}
	else{var dimension ={w:window.innerWidth,h:window.innerHeight}}
    return (dim in dimension)? dimension[dim] : dimension
}

function stopDefault(e){
    try{e.preventDefault()}
    catch(err){e.returnValue=false}
}

function changeClass(element,oldClass,newClass){
    //changes the css class of an element
	if(newClass instanceof Array){
		for(var i=0; i < newClass.length; i++){changeClass(element,oldClass,newClass[i])}
		return
	}
	if(oldClass instanceof Array){
		for(var c=0; c < oldClass.length; c++){changeClass(element,oldClass[c],newClass)}
	}
	var classes=single(element.className," ").split(" ")
	var numClasses=classes.length
	for(var i=0; i < numClasses; i++){
		if(classes[i] == oldClass || classes[i] == newClass){classes.splice(i,1); i--}
	}
	classes.push(newClass)
	element.className=classes.join(" ")
}

function hasClass(element,className){
	//returns whether an element has a class
	var classes = single(element.className," ").split(" ")
	for(var i=0; i < classes.length; i++){
		if(classes[i] == className){return true}
	}
	return false
}
function addEvent(element,event,cb){
    try{element.addEventListener(event,cb);}
    catch(err){
        try{element.attachEvent("on"+event.toString(),cb)}
        catch(err){element["on"+event.toString()] = cb;}
    }
}
function removeEvent(element,event,cb){
	try{element.removeEventListener(event,cb)}
	catch(err){
		try{element.detachEvent("on"+event.toString(),cb)}
		catch(err){}
	}
}
function scrollable(element,direction){
	/*returns whether an element has a scroll bar*/
	return (equalString(direction,"y"))? 
	(element.scrollHeight > element.clientHeight) :
	(element.scrollWidth > element.clientWidth);
}
function remove(element){
	/*removes an element from its container*/
	try{element.remove()}
	catch(err){
		try{element.parentElement.removeChild(element)}
		catch(err){}
	}
}
function removeChildren(element){
	/*removes all element nodes of an element*/
	var children = element.children
	for(var i = 0; i < children.length;){
		remove(children[i])
	}
}
function append(parent,elements){
	if(elements instanceof Array){
		for(var i=0; i < elements.length; i++){
			append(parent,elements[i])
		}
		return
	}
	parent.appendChild(elements)
}
function prepend(parent,elements){
	if(elements instanceof Array){
		for(var i = 0; i < elements.length; i++){append(parent,elements[i])}
		return
	}
	if("prepend" in parent){parent.prepend(elements)}
	else{
		if(parent.children.length > 0){parent.insertBefore(parent.firstElementChild,elements)}
		else{parent.appendChild(elements)}
	}
}
function customAlert(msg){
	var alertTime = 5000 //5 seconds or 5000 milliseconds
	var container = document.createElement("div"); 
	container.className = "center-text fixed left full-width custom-alert"
	container.style.bottom = "5%"
	var msgBox = document.createElement("span"); msgBox.innerHTML = msg; 
	msgBox.className = "black-bg curved white small-text"; msgBox.style.padding = "1%"
	container.appendChild(msgBox)
	document.body.appendChild(container)
	var fader = new customFade(container);
}

function customFade(element,fadeTime,fadeRate,afterFade){
	var opacity = 1
	var self = this
	fadeTime = (!fadeTime)? 5000 : fadeTime
	fadeRate = (!fadeRate)? 100 : fadeRate
	addEvent(element,"click",function(){self.resetFade()})
	this.resetFade = function(){
		clearTimeout(this.timeout)
		clearInterval(this.interval)
		opacity = 1
		this.start()
	}
	this.stop = function(){clearInterval(this.interval); remove(element); if(isFunction(afterFade)){afterFade()}}
	this.start = function(){
		this.interval = setInterval(function(){opacity -= fadeRate/fadeTime; element.style.opacity = opacity},fadeRate)
		this.timeout = setTimeout(function(){self.stop()},fadeTime)
	}
	this.start()
}

function copy(text,cb){
	if(!isFunction(cb)){cb = defaultCb}
	try{
		navigator.clipboard.writeText(text)
		.then(cb)
	}
	catch(err){
		document.execCommand("copy",false,text)
		console.log(document.execCommand)
	}
	function defaultCb(){
		customAlert("Item copied to clipboard")
	}
}
function inView(element){
	/*checks if an element is in the visible view port*/
	var coord = element.getBoundingClientRect()
	var winDim = windowDim()
	var topVisible = coord.top > 0 && coord.top < winDim.h
	var bottomVisible = coord.bottom > 0 && coord.bottom < winDim.h
	var leftVisible = coord.left > 0 && coord.left < winDim.w
	var rightVisible = coord.right > 0 && coord.right <winDim.w
	return (topVisible || bottomVisible) && (leftVisible || rightVisible); 
}
function scrollNShow(nodes){
	var defaultClass = "scroll-n-view"
	var visibleClass = "visible"
	var invisibleClass = "invisible"
	var run = true
	var throttleDuration = 500 //in milliseconds
	nodes = (nodes)? nodes : document.getElementsByClassName(defaultClass)
	for(var i = 0; i < nodes.length; i++){
		changeClass(nodes[i],"",[invisibleClass,defaultClass])
	}
	function appear(node){
		changeClass(node,"",visibleClass)
	}
	function disappear(node){
		changeClass(node,visibleClass,"")
	}
	function handleScroll(){
		for(var i = 0; i < nodes.length; i++){
			var node = nodes[i]
			if(inView(node)){appear(node)}
			else{disappear(node)}
		}
	}
	function scrollThrottle(){
		if(!run){return}
		run = false
		setTimeout(function(){run = true; handleScroll()},throttleDuration)
	}
	addEvent(document,"scroll",scrollThrottle)
}
function getCookie(name){
	//gets the cookie "name"
	return getCookies()[name]
}
function getCookies(){
	//gets all the cookies
	var cookies = document.cookie.split("; ")
	var cookieObjects = {}
	for(var i = 0; i < cookies.length; i++){
		var thisCookie = cookies[i].split("=")
		if(thisCookie.length != 2){continue}
		cookieObjects[thisCookie[0]] = thisCookie[1]
	}
	return cookieObjects
}
function setCookie(name,value,expires,path){
	if(isNumeric(expires)){
		var now = new Date(); now.setTime(now.getTime() + expires); expires = ";expires=" + now.toUTCString()
	}
	else{expires = ""}
	path = (path)? ";path="+path.toString() : ""
	document.cookie = name.toString()+"="+value.toString()+expires+path
}
//handles movement
function moveTo(element,x,y){
	var coord = orgCoord(element)
	var moveX = x - coord.left; var moveY= y - coord.top
	move(element,moveX,moveY)	
}
function moveBy(element,x,y){
	var currentCoord = element.getBoundingClientRect()
	var moveX = currentCoord.left + x; var moveY = currentCoord.top + y
	moveTo(element,moveX,moveY)
}
function move(element,x,y){
    xinPx = x.toString() + "px"; yinPx = y.toString() + "px"
	if("transform" in element.style){
		element.style.transform = "translate(" + xinPx + "," +yinPx + ")"
	}
	else if("translate" in element.style){
		element.style.translate = xinPx + " " + yinPx
	}
	else{element.style.left = xinPx; element.style.top = yinPx}
}
function orgPos(element){
	move(element,0,0)
}
function orgCoord(element){
	orgPos(element)
	return element.getBoundingClientRect()
}
//data manipulation
function single(word,target){
	/*searches "word" and makes sure that there are no more than 2 consecutive
	"target"s by making each occurence a single "target"
	*/
	var targetExp = new RegExp(target+"+","g")
	return word.replace(targetExp,target)
}
function reverse(string){
	//reverses a string
	return string.split("").reverse().join("")
}
function trim(string){
	if("trim" in string.constructor.prototype){return string.trim()}
	var firstNonSpace = string.search(/\S/)
	if(firstNonSpace > 0){string = string.slice(firstNonSpace)}
	string = reverse(string)
	var lastNonSpace = string.search(/\S/)
	if(lastNonSpace > 0){string = string.slice(lastNonSpace)}
	return reverse(string)
}
function isNumeric(number){
	//returns whether or not a variable is a number
	numberString=String(number); number=Number(number)
	return equalString(typeof number,"number") && !(numberString.match(/\D/));
}

function isFunction(f){
	//returns whether or not an entity is a function
	return equalString(typeof f,"function")
}

function equalString(string1,string2){
	/*compares two strings and returns if they are equal or not
	any non string value is taken as ""
	*/
	if(typeof string1 != "string"){string1 = ""}
	if(typeof string2 != "string"){string2 = ""}
	return string1.toLowerCase() == string2.toLowerCase()
}
function singleOrPlural(number,word){
	/*returns the correct form of a word depending on the value of number*/
	var correct
	if(number < 1){correct = "no "+ word}
	else if(number < 2){correct = number + " " + word}
	else{correct = number + " " + word + "s"}
	return correct
}

function inarray(array,word,cs){
	/*searchs an array and returns whether or not "word" is in the array
		# the parameter "cs" specifies whether or not this search is case
		sensitive, true means that it is not while false means that it is
	*/
	for(var i=0; i < array.length; i++){
		if(cs){if(equalString(word,array[i])){return i}}
		else{if(word == array[i]){return i}}
	}
	return false
}
function index(string,pos){
	//returns the element at position 'pos" of string 'string'
	return string.split("")[pos] 
}
function isEmpty(str,includeSpace){
	/*returns whether or not a string is empty, if the variable isn't a string
	then it is treated as non empty,
	the second parameter specifies if a string with just space characters
	counts as empty, defaults to false
	*/
	if(equalString(typeof str,"string")){
		str = (includeSpace)? str.replace(/\s/g,"") : str
		return str.length < 1
	}
	return false
}
function anyFileExt(file){
	return file.split(".").length > 1
}
function isSameUrl(url1,url2,indexName){
	var pathSperators = ["/","\\"]
	indexName = (indexName)? indexName : ""
	url1 = trim(url1);
	url2 = trim(url2);
	url1 = addIndex(url1); url2 = addIndex(url2)
	return equalString(url1,url2)
	function addIndex(url){
		url = reverse(url)
		var filename = ""
		var lastChar = index(url,0); lastChar = (inarray(pathSperators,lastChar))? "" : pathSperators[0] 
		var lastSlash = url.search(/(\\|\/)/)
		if(lastSlash > 0){filename = url.slice(0,lastSlash)}
		url = reverse(url)
		if(!anyFileExt(filename)){return url + lastChar + indexName}
		else{return url}
	}
}

//task indicators
var a = function(){
	var loaderInstance = new loader()
	progress.prototype = loaderInstance
}()

function loader(){
	//constructor for all tasks indicators
    var container = document.createElement("div"); container.className = "absolute top left full-width full-height"
	container.style.transition = "none"
	this.construct = function(object){
		object.window = container
		object.stop = function(){
			remove(this.window)
		}
	}
}
function progress(element,taskName,max){
	//constructor for the progress indicators
	var self = this
	var defaultMax = 100
	this.element = element
	this.taskName = (taskName)? taskName : "Loading..."
	this.max = (isNumeric(max))? max : defaultMax
	this.stat = 0
	this.start = function(){
		if(!this.loadElement){
			this.loadElement = document.createElement("div"); 
			this.loadElement.className = "center-text full-width progress-loader"
			this.label = document.createElement("label"); this.label.innerHTML = this.taskName
			this.label.className = "block auto-margin"
			this.progress = document.createElement("div"); this.progress.className = "progress"
			this.progressIndicator = document.createElement("div"); this.progressIndicator.className = "indicator"
			append(this.progress,this.progressIndicator)
			append(this.loadElement,[this.label,this.progress])
		}
		this.stat = 0
		this.makeProgress(this.stat)
		this.element.appendChild(this.loadElement)
	}
	this.stop = function(){remove(this.loadElement)}
	this.makeProgress = function(to){
		//increases the progress of a task to "to"
		this.progressIndicator.style.width = ((to * 100) / this.max).toString() + "%"
		console.log(this.progressIndicator.style.width)
	}
}