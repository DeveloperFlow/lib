/*library for managing user interfaces*/

var _$ = function(){
    var tabInstance = new tab()
    options.prototype = tabInstance
    miniTab.prototype  = tabInstance    
}()
function tab(){
    /*the constructor for tabs*/
    var container = document.createElement("div"); container.className = "window top left"
    var curtain = container.cloneNode(true); curtain.className += " curtain"
    this.screenThreshold = 700
    this.construct = function(object){
        object.window = container.cloneNode(true)
        object.curtain = curtain.cloneNode(true)
        object.window.appendChild(object.curtain)
    }
}
function options(on,additionalBtns,cb,type){
    /*constructor for options
    the on parameter specifies what element the option is for
    
    # the additionalBtns parameter is an array of buttons that should also open
    the option

    #the cb parameter is a callback that is called whenever the option is opened

    #the type paraameter can either be true or false , specifying what type of option to be used
    */
   type = (type == undefined)? true : false; var self = this;
   this.construct(this)
   this.element = on
   this.cb = cb
   this.optionWidthBs = 30 //the percentage of the screen that the option element takes up in big screens
   var option = document.createElement("div"); option.className = "scrollable-v"
   var optionWrapper = document.createElement("div");
   if(!type){
        var pointy = document.createElement("div");
        pointy.className = "minor-pad absolute white-bg pointy"
        this.pointy = pointy
    }
    this.optionWrapper = optionWrapper
    this.optionElement = option;
    optionWrapper.appendChild(option)
    this.window.appendChild(optionWrapper) 
    changeClass(this.curtain,"curtain","")
    
    //methods
    this.preventOption = function(e){
        //prevents futher propagation of events
        try{e.stopPropagation()}catch(err){}
    }
    this.open = function(e){
        /*opens the options*/
        stopDefault(e); this.preventOption(e)
        document.body.appendChild(this.window)
        if(isFunction(this.cb)){this.cb(this)}
        if(windowDim("w") < this.screenThreshold){this.smallScreen(e)}
        else{this.bigScreen(e)}
        addEvent(window,"resize",adjust)
    }
    this.close = function(e){/*closes the options*/remove(this.window); removeEvent(window,"resize",adjust)}
    this.smallScreen = function(){
        /*opens the options for small screens*/
        var optionWrapper = this.optionWrapper; orgPos(optionWrapper); 
        optionWrapper.style.width = ""; optionWrapper.style.top = ""
        optionWrapper.className = "absolute bottom left full-width minor-pad option-elem-ss my-shadow"
        remove(pointy)
    }
    this.bigScreen = function(e){
        /*opens the options for big screens*/
        var optionWrapper =  this.optionWrapper; optionWrapper.className = "option-elem minor-pad my-shadow"
        var option = this.optionElement;
        var pointy = this.pointy
        var p = this.optionWidthBs
        var dim = windowDim(); var windowWidth = dim.w; windowHeight = dim.h
        var optionWidth = (p/100) * windowWidth
        optionWrapper.style.width = optionWidth.toString() + "px";
        if(pointy){
            optionWrapper.appendChild(pointy);
            var coord = this.element.getBoundingClientRect()
            var elementdim = elementDim(this.element)
            var x = (elementdim.w / 2) + coord.left; var y = coord.bottom; moveTo(optionWrapper,x,y);
            return
        }
        if(elementDim(optionWrapper,"h") > windowHeight){
            optionWrapper.style.height = windowHeight.toString() + "px"
        }
        var coord = optionWrapper.getBoundingClientRect(); var optionDim = elementDim(optionWrapper)
        var x = e.clientX; var y = e.clientY
        if(x + optionDim.w > windowWidth){x = windowWidth - optionDim.w}
        else if(x < 0){x = 0}
        if(y + optionDim.h > windowHeight){y = windowHeight - optionDim.h}
        else if(y < 0){y = 0}
        moveTo(optionWrapper,x,y)
    }
    this.add = function(icon,option,click){
        /*adds a new option*/
        if(icon instanceof Array){
            for(var i=0; i < icon.length; i++){
                this.add(icon[i][0],icon[i][1],icon[i][2])
            }
            return
        }
        var entry = document.createElement("div");
        entry.className = "minor-pad option flex vcenter list-item"
        if(icon){
            var image = document.createElement("img"); image.src = icon;
            image.className = "icon"
            entry.appendChild(image)
        }
        var optionEntry = document.createElement("span")
        optionEntry.innerHTML = option
        entry.appendChild(optionEntry)
        if(isFunction(click)){
            addEvent(entry,"click",function(){click(self)})
        } 
        this.optionElement.appendChild(entry)   
    }
    if(type){addEvent(on,"contextmenu",function(e){self.open(e)})}
    else{addEvent(on,"click",function(e){self.open(e)})}
    addEvent(this.curtain,"click",function(e){self.preventOption(e); self.close(e)})
    if(additionalBtns instanceof Array){
        for(var  i =0;  i < additionalBtns.length; i++){
            addEvent(additionalBtns[i],"click",function(e){self.open(e)})
        }
    }
    function adjust(){self.close()}
}

function autoFetch(element,cb,threshold,direction){
    /* interface for scrolling down and fetching more content
        # the "cb" is a callback to handle the fetching of contents
        or whatever you want to do, musn't necessarily be fetching contents
        as for data that might be needed, the object will be sent as the first
        parameter of the callback, if no valid function is specified as a callback
        then the callback parameter should be an object containing information
        for retrieving the more contents , the syntax should be:
        {url:["the url to fetch the contents"],
        contentIndex:["the index of the content, it increments by
            the number of children the body of the response has"],
        contentIndexKey : ["the key to use when sending the content index"],
        cb : ["a call back to call for each of the content"],
        mcb : ["a callback to call before fetching"]
        }

        # the "threshold" parameter specifies how far in percentage of the total
        available scrolling area should be scrolled before more content is fetched
        defaults to 75%
        
        # the "direction" parameter specifies the direction of the scroll
        it can only be two values "x or y" defaults to y
    */
   this.getDirection = function(direction){
    return (inarray(["x","y"],direction,true))? direction : "y"
   }
    var self = this
    this.window = element
    this.threshold = (isNumeric(threshold))? threshold : 75
    this.direction = this.getDirection(direction)
    this.directions = {x:"scrollLeft",y:"scrollTop"}
    this.totalScrolls = {x:"scrollWidth",y:"scrollHeight"}
    
    this.fetchContent = function(e){
        if(self.stopFetch || self.lockFetch){return}
        var element = e.target
        var direction = self.getDirection()
        var dimension = (direction == "y")? 
        element.clientHeight : element.clientWidth;
        var scrollPositionProperty = self.directions[direction]
        var totalScrollProperty = self.totalScrolls[direction]
        var scrollPosition = element[scrollPositionProperty]
        var totalScroll = element[totalScrollProperty] - dimension
        var scrollPercent = (scrollPosition / totalScroll) * 100
        if(scrollPercent > self.threshold){self.cb(self)}
    }

    this.useMoreButton = function(){
        /*if the element doesn't yet have a scroll bar a more button will 
        be used
        */
        if(scrollable(this.window,this.getDirection()) || this.lockFetch){
            return this.removeMoreButton()
        }
        if(!this.moreButton){
            this.moreButton = document.createElement("a")
            this.moreButton.innerHTML = "Show more"
            this.moreButton.href = "javascript:void(0)"
            this.moreButton.onclick = function(){
                self.cb(self)
            }
        }
        this.window.appendChild(this.moreButton)
    }
    this.removeMoreButton = function(){
        if(this.moreButton){remove(this.moreButton)}
    }
    this.defaultCb = function(){
        /*the default call back to be used for fetching more contents*/
        if(!this.req){
            this.req = new Req()
            this.req.url = this.fetchDetails.url
            this.req.method = "POST"
            this.req.responseType = "document"
            
            this.req.onload = function(req){
                var object = req.object
                var response = object.responseXML
                if(response instanceof Document){
                    var body = response.body
                    var children = body.children
                    var formalIndex = self.fetchDetails.contentIndex
                    self.removeError()
                    for(var i=0; i < children.length; i++){
                        if(isFunction(self.fetchDetails.cb)){
                            self.fetchDetails.cb(children[i])
                        }
                        self.window.appendChild(children[i])
                        i--
                        self.fetchDetails.contentIndex++
                    }
                    if(self.fetchDetails.contentIndex == formalIndex){ 
                        self.lockFetch = true;
                    }
                    self.useMoreButton()
                    self.stopFetch = false
                }
            }
            this.req.onerror = function(req){
                self.error()
                self.setErr()
                self.window.appendChild(self.errElement)
                self.lockFetch = true
                self.stopFetch = false
            }
            this.req.ontimeout = function(req){
                self.error()
                self.errMsgBox.innerHTML = "This request took too long"
                self.window.appendChild(this.errElement)
                self.lock = true
                self.stopFetch = false
            }
        }
        self.stopFetch = true;
        self.lockFetch = false;
        self.req.message = {}
        self.req.message[self.fetchDetails.contentIndexKey] = 
        self.fetchDetails.contentIndex
        if(isFunction(self.fetchDetails.mcb)){self.fetchDetails.mcb(self)}
        self.removeMoreButton()
        self.removeError()
        self.req.send()
    }
    this.setErr = function(){
        if(!navigator.onLine){
            this.errorMessage = "Looks like you are offline"
        }
        else{this.errorMessage = "Something went wrong"}
        this.errMsgBox.innerHTML = this.errorMessage
    }
    this.error = function(){
        if(!this.errElement){
            this.errElement = document.createElement("div")
            this.errMsgBox = document.createElement("span")
            this.errMsgBox.className = "error"
            this.tryBtn = document.createElement("button")
            this.tryBtn.innerHTML = "Try Again"; 
            this.tryBtn.onclick = function(){self.cb(self)}
            this.errElement.appendChild(this.errMsgBox)
            this.errElement.appendChild(this.tryBtn)
        }
    }
    this.removeError = function(){if(this.errElement){remove(this.errElement)}}
    this.cb = (isFunction(cb))? cb : this.defaultCb
    this.fetchDetails = (isFunction(cb))? null : cb
    this.useMoreButton()
    addEvent(element,"scroll",this.fetchContent)
}

function miniTab(cb,opener,closeCB){
    /*constructor for minitabs
     the cb parameter is a callback to call each time the tab is opened
      the opener parameter is an element that opens the tab onclick
      the closeCB parameter is a callback to call when the tab is closed
    */
    var self = this
    var element = document.createElement("div")
    this.construct(this)
    this.window.appendChild(element)
    this.tab = element; element.className = "minitab"
    this.cb = cb
    this.closeCB = closeCB
    this.bigScreenClass = ["bigscreen-minitab"]
    this.smallScreenClass = ["smallscreen-minitab","absolute","bottom","left","full-width","minor-pad"]
    var head = document.createElement("div")
    var closeBtn = document.createElement("button"); closeBtn.innerHTML = "X"; 
    closeBtn.className = "cancel-btn pointer"
    head.appendChild(closeBtn); element.appendChild(head)
    this.head = head
    this.closeBtn = closeBtn

    this.open = function(){
        var wdim = windowDim()
        document.body.appendChild(this.window)
        if(this.screenThreshold > wdim.w){
            this.smallScreen(wdim)
        }
        else{this.bigScreen(wdim)}
        addEvent(window,"resize",resize)
        if(isFunction(this.cb)){this.cb()}
    }
    this.close = function(){
        removeEvent(window,"resize",resize)
        remove(this.window)
        if(isFunction(this.closeCB)){this.closeCB()}
    }
    this.smallScreen = function(){
        orgPos(this.tab)
        changeClass(this.tab,this.bigScreenClass,this.smallScreenClass)
    }
    this.bigScreen = function(wdim){
        changeClass(this.tab,this.smallScreenClass,this.bigScreenClass)
        var height = elementDim(this.tab,"h")
        if(height < wdim.h){
            var y = (wdim.h - height) / 2
        }
        orgPos(this.tab)
        moveBy(this.tab,0,y)
    }
    this.addOpener = function(opener){
        if(opener instanceof Array){
            for(var i=0; i < opener.length; i++){this.addOpener(opener[i])}
            return
        }
        if(opener){addEvent(opener,"click",function(){self.open()})}
    }
    closeBtn.onclick = function(){self.close()}
    var resize = function(){self.open()}
    this.addOpener(opener)
}
function slider(container){
    /*constructor for sliders
     The container parameter specifies the parent to append the slider to when it is initiated
    */
    var self = this
    var sliderContainer = document.createElement("div"); sliderContainer.className = "slider-container"
    var slider = document.createElement("div"); slider.className = "slide"
    var forwardBtn = document.createElement("a"); forwardBtn.innerHTML = "&#8250;";
    forwardBtn.className = "nav-btn round right pointer";
    var backBtn = forwardBtn.cloneNode(true); backBtn.innerHTML = "&#8249;";changeClass(backBtn,"right","left")
    forwardBtn.onclick = function(){self.move(true)}; backBtn.onclick = function(){self.move(false)}
    var indicator = document.createElement("div"); indicator.className = "slider-indicator"
    append(sliderContainer,[slider,backBtn,forwardBtn,indicator])
    var indicatorItemProto = document.createElement("button"); 
    indicatorItemProto.className = "round space-left item"; indicatorItemProto.style.width = "10px"
    indicatorItemProto.style.height = "10px"; indicatorItemProto.style.padding = "0"

    this.sliderContainer = sliderContainer
    this.slider = slider
    this.forwardBtn = forwardBtn
    this.backBtn = backBtn
    this.container = container
    this.currentItem = 0
    this.indicator = indicator

    this.add = function(item){
        /*add an item to the slider,
        all items to be added to the slider must be added through this method, if not you may notice
        unexpected behaviour from the slider
        */
        changeClass(item,"","item"); this.slider.appendChild(item)
        this.indicator.appendChild(indicatorItemProto.cloneNode(true))
        addEvent(item,"touchstart",function(e){self.touchHandle(e,"start")})
        addEvent(item,"touchend",function(e){self.touchHandle(e,"end")})
        addEvent(item,"touchmove",function(e){self.touchHandle(e,"move")})
    }
    this.display = function(){
        /*displays the slider in the specified parent element*/
        this.container.appendChild(this.sliderContainer)
        //remove the scroll bar
        this.slider.style.overflow = "hidden"
        //adjust the navigation buttons to stay at the middle
        var sliderDim = elementDim(this.slider); var btnDim = elementDim(this.forwardBtn) 
        var sliderHeight = sliderDim.h; var btnHeight = btnDim.h;
        
        var top = (sliderHeight - btnHeight) / 2; var topPercent = top * 100 / sliderHeight
        this.forwardBtn.style.top = topPercent.toString() + "%"
        this.backBtn.style.top = this.forwardBtn.style.top
        this.navCheck()
        changeClass(this.indicator.children[this.currentItem],"","current")
        changeClass(this.slider.children[this.currentItem],"","current")
        addEvent(window,"resize",function(){self.adjust()})
    }
    this.translate = function(element,x){element.style.transform = "translate(" + x.toString() + "px)"}
    this.move = function(dir){
        /*changes the current element of the slider
        **parameters**
            dir => the dir property specifies what the next element should be
            it has boolean value where true means the next element while false means the previous element
        */
        var items = this.slider.children
        var indicatorItems = this.indicator.children
        var currentItem = this.currentItem
        var nextItem = (dir)? currentItem + 1 : currentItem - 1;
        var currentElem = items[currentItem]
        if(nextItem in items){
            var nextElem = items[nextItem]; 
            var currentElemX = this.orgPos(currentElem)
            var nextElemX = this.orgPos(nextElem)
            var sliderCoord = this.slider.getBoundingClientRect(); 
            var ndx = sliderCoord.left - nextElemX
            changeClass(currentElem,"no-transition",""); changeClass(nextElem,"no-transition","")
            var cw = elementDim(currentElem,"w")
            if(dir){var cdx = (sliderCoord.left - cw) - currentElemX}
            else{var cdx = sliderCoord.right - currentElemX}
            this.translate(currentElem,cdx); this.translate(nextElem,ndx)
            changeClass(currentElem,"current",""); changeClass(nextElem,"","current")
            changeClass(indicatorItems[currentItem],"current","")
            changeClass(indicatorItems[nextItem],"","current")
            this.currentItem = nextItem
            this.organizeNext(dir)
        }
        return this.navCheck()
    }
    this.touchHandle = function(e,type){
        /*handles touch events so users can slide the slider*/
        stopDefault(e)
        var items = this.slider.children
        var currentElem = items[this.currentItem]
        var touch = (type == "move")? e.touches : e.changedTouches
        var x = touch[0].screenX
        if(this.formalX == undefined){this.formalX = x}
        var dx = x - this.formalX
        this.formalX = x
        if(type == "start"){return}
        var nextItem
        if(dx < 0){nextItem =  this.currentItem + 1}
        else if(dx > 0){nextItem = this.currentItem - 1}
        else if(type == "move"){return}

        if(type == "end"){
            this.formalX = undefined
            this.focusedNext = undefined
            var sliderCoord = this.slider.getBoundingClientRect()
            var currentCoord = currentElem.getBoundingClientRect()
            if(currentCoord.right < sliderCoord.right){
                //foward
                this.move(true)
            }
            else if(currentCoord.left > sliderCoord.left){
                this.move(false)
            }
            return
        }

        var nextElem; var supposedNext
        if(nextItem in items){supposedNext = items[nextItem]}
        if(supposedNext && this.focusedNext == undefined){nextElem = supposedNext}
        else if(this.focusedNext != undefined){nextElem = this.focusedNext}
        else{console.log("next item doesn't exist"); return}

        if(type == "move"){
            changeClass(currentElem,"","no-transition")
            changeClass(nextElem,"","no-transition")

            this.focusedNext = nextElem
            var orgCurrent = this.orgPos(currentElem)
            var orgNext = this.orgPos(nextElem)
            
            var currentCoord = currentElem.getBoundingClientRect()
            var nextCoord = nextElem.getBoundingClientRect()

            var cdx = currentCoord.left + dx
            var ndx = nextCoord.left + dx

            if(supposedNext == undefined){
                //keep the element in bounds
                var sliderCoord = this.slider.getBoundingClientRect(); 
                if(dx < 0){
                    if(sliderCoord.left >= cdx){cdx = sliderCoord.left; ndx = sliderCoord.left - nextElem.clientWidth}
                }
                else{
                    if(sliderCoord.left <= cdx){cdx = sliderCoord.left; ndx = sliderCoord.right}
                }
            }
            else if(supposedNext != nextElem){
                var sliderCoord = this.slider.getBoundingClientRect()
                if(dx < 0){
                    if(sliderCoord.left >= cdx){
                        cdx = sliderCoord.left; ndx = sliderCoord.left - nextElem.clientWidth
                        this.focusedNext = supposedNext
                    }
                }
                else{
                    if(sliderCoord.left <= cdx){
                        cdx = sliderCoord.left; ndx = sliderCoord.right;
                        this.focusedNext = supposedNext
                    }
                }
            }
            cdx -= orgCurrent; ndx -= orgNext
            this.translate(currentElem,cdx); this.translate(nextElem,ndx)
        }
    }
    this.organizeNext = function(dir){
        if(!dir){return}
        var nextItem = this.currentItem + 1
        var items = this.slider.children
        if(nextItem in items){
            var nextElem = items[nextItem]
            changeClass(nextElem,"","no-transition")
            var coord = this.orgPos(nextElem)
            var sliderCoord = this.slider.getBoundingClientRect()
            var dx = sliderCoord.right - coord
            nextElem.style.transform = "translate(" + dx.toString() + "px)"
        }
    }
    this.orgPos = function(currentElem){
        var style = currentElem.style.transform
        if(!style){style = 0}
        else{
            style = style.slice(style.indexOf("(") + 1,-3)
            style = Number(style)
        }
        var coord = currentElem.getBoundingClientRect()
        var orgX = coord.left - style
        return orgX
    }
    this.navCheck = function(){
        var items = this.slider.children
        var end = false
        if(this.currentItem < 1){changeClass(this.backBtn,"","none"); end = "l"}
        else{changeClass(this.backBtn,"none","")}
        if(this.currentItem >= items.length - 1){changeClass(this.forwardBtn,"","none"); end = "r"}
        else{changeClass(this.forwardBtn,"none","")}
        return end
    }
    this.adjust = function(){
        /*the slider operates with transition, so a function to adjust the slider incase of screen resize*/
        var container = this.slider
        var items = container.children
        if(this.currentItem in items){
            var currentElem = items[this.currentItem]
            var c = this.orgPos(currentElem); var coord = container.getBoundingClientRect()
            var dx = coord.left - c
            this.translate(currentElem,dx)
        }
    }
    this.slideShow = function(interval){
        interval = (isNumeric(interval))? interval : 5000
        this.slideId = setInterval(play,interval)
        function play(){
            var end = self.move(true)
            if(end == "r"){
                self.stopSlide()   
            }
        }
    }
    this.stopSlide = function(){
        clearInterval(this.slideId)
    }
}

function write(node,parent,delay,cursorColor){
    var cursor = document.createElement("span"); cursor.innerHTML = "|"; cursor.className = "blink"
    delay = (delay == undefined)? 100 : delay // in milliseconds
    var nodeMap = []
    try{
        cursor.style.fontSize = "inherit"
        cursor.style.fontWeight = "bold"
        cursor.style.color = (cursorColor == undefined)? "#555" : cursorColor
    }
    catch(err){}
    writeProcess(node,parent)
    function next(){
        if(nodeMap.length < 1){return}
        var newestIndex = nodeMap.length - 1
        var newest = nodeMap[newestIndex]
        var children = newest.children
        var parent = newest.parent
        var newestNode = children[0]
        newestNode = parseNode(newestNode)
        newest.children = children.slice(1)
        if(newest.children.length < 1){nodeMap.length = newestIndex}
        writeProcess(newestNode,parent)
    }
    function parseNode(currentNode){
        if(currentNode.nodeName == "#text"){
            currentNode = currentNode.nodeValue
            currentNode = currentNode.replace(/\n/g,"")
            currentNode = single(currentNode," ")
        }
        return currentNode
    }
    function writeProcess(node,parent){
        if(typeof node == "string"){
            var i = 0; node = node.split("")
            if(node.length < 1){next(); return}
            parent.appendChild(cursor)
            function writeString(){
                remove(cursor)
                if(i in node){
                    parent.innerHTML += node[i]
                    parent.appendChild(cursor); i++; setTimeout(writeString,delay)
                }
                else{next()}
            }
            setTimeout(writeString,delay); return 
        }
        var childNodes = node.childNodes
        var nodeCopy = node.cloneNode(true)
        nodeCopy.innerHTML = ""; nodeCopy.onclick = node.onclick
        parent.appendChild(nodeCopy);
        if(childNodes.length > 0){
            var currentNode = parseNode(childNodes[0])
            var children = []
            for(var i = 1; i < childNodes.length; i++){
                children.push(childNodes[i])
            }
            if(children.length > 0){nodeMap.push({parent:nodeCopy,children:children})}
            writeProcess(currentNode,nodeCopy)
        }
        else{next()}
    }
}