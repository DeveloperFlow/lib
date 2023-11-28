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

function expandable(element,maxWidth,maxHeight,minWidth,minHeight,areas,cb){
    element.className += " relative"
    this.element = element; this.maxHeight = maxHeight; this.maxWidth = maxWidth; 
    this.minWidth = minWidth; this.minHeight = minHeight
    var expander = document.createElement("div")
    expander.className = "absolute expander"
    var areaSpecs = ["top","right","left","bottom"]
    areas = (!(areas instanceof Array))? ["left","top","right","bottom"] : areas
    var self = this
    for(var i = 0; i < areas.length; i++){
        if(inarray(areaSpecs,areas[i]) !== false){
            this[areas[i]] = expander.cloneNode(true)
            this[areas[i]].className += " " + areas[i]
            prepare(this[areas[i]],areas[i])
        }
    }
    function prepare(sideElement,side){
        element.appendChild(sideElement)
        sideElement.draggable = false
        addEvent(sideElement,"mousedown",function(e){self.startExpand(e,side)})
        addEvent(sideElement,"dragstart",function(e){self.stopExpand()})
        addEvent(sideElement,"dragend",function(e){self.stopExpand();})
    }
    this.expand = function(e,side){
        if(!self.dragStart){
            self.stopExpand()
            return
        }
        var orgSize = elementDim(self.element)
        var elemCoord = self.element.getBoundingClientRect()
        var currentSide = self.currentSide
        if(inarray(["left","right"],currentSide) !== false){
            var x = (currentSide == "left")? elemCoord.left : elemCoord.right
            var d = (currentSide == "left")? x - e.clientX : e.clientX - x;
            var newWidth = orgSize.w + d;
            if(newWidth <= 0){return}
            if(isNumeric(self.maxWidth) && newWidth >= self.maxWidth){newWidth = self.maxWidth}
            if(isNumeric(self.minWidth) && newWidth <= self.minWidth){newWidth = self.minWidth}
            self.element.style.width = newWidth.toString() + "px"
            if(currentSide == "left"){
                var newXCoord = e.clientX
                moveTo(self.element,newXCoord,elemCoord.top)
            }
        }
        else if(inarray(["top","bottom"],currentSide) !== false){
            var y = (currentSide == "top")? elemCoord.top : elemCoord.bottom
            var d = (currentSide == "top")? y - e.clientY : e.clientY - y
            var newHeight = orgSize.h + d
            if(newHeight <= 0){return}
            if(orgSize.h == newHeight){return}
            if(isNumeric(self.maxHeight) && newHeight >= self.maxHeight){newHeight = self.maxHeight}
            if(isNumeric(self.minHeight) && newHeight <= self.minHeight){newHeight = self.minHeight}
            self.element.style.height = newHeight.toString() + "px"
            if(currentSide == "top"){
                var newYCoord = e.clientY
                moveTo(self.element,elemCoord.left,newYCoord)
            }
        }
        else{throw error("something is really wrong and the side to expand is not recognized")}
        if(isFunction(cb)){cb(self)}
    }
    this.startExpand = function(e,side){
        this.dragStart = true
        this.currentSide = side
        addEvent(window,"mouseup",this.stopExpand)
        addEvent(window,"mousemove",this.expand)
    }
    this.stopExpand = function(){
        removeEvent(window,"mousemove",self.expand)
        removeEvent(window,"mouseup",self.stopExpand)
        this.dragStart = false
    }
}