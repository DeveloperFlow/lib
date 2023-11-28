/*library for managing user interfaces*/
var TABINSTANCE
var _$ = function(){
    var tabInstance = new tab(); TABINSTANCE = tabInstance
    options.prototype = tabInstance
    miniTab.prototype  = tabInstance
}()
function tab(){
    /*the constructor for tabs*/
    var container = document.createElement("div"); container.className = "window top left"
    var curtain = document.createElement("div"); curtain.className = "fixed top left full-width full-height curtain"
    this.screenThreshold = 700
    this.construct = function(object){
        object.window = container.cloneNode(true)
        object.curtain = curtain.cloneNode(true)
        object.window.appendChild(object.curtain)
    }
}
function options(on,cb,type){
    /*constructor for options
    the on parameter specifies what element the option is for
    
    # the additionalBtns parameter is an array of buttons that should also open
    the option

    #the cb parameter is a callback that is called whenever the option is opened

    #the type paraameter can either be true or false , specifying what type of option to be used
    true means options opened by right click while false means options opened by clicks
    */
   type = (type == undefined)? true : false; var self = this;
   this.construct(this)
   this.element = on
   this.cb = cb
   this.optionWidthBs = 30 //the percentage of the screen that the option element takes up in big screens
   var option = document.createElement("div"); option.className = "scrollable-v"
   var optionWrapper = document.createElement("div");
    var pointy = document.createElement("div");
    pointy.className = "minor-pad absolute white-bg pointy"
    this.pointy = pointy
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
        optionWrapper.appendChild(pointy);
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
        entry.className = "minor-pad option flex vcenter list-item pointer"
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
    if(type){
        addEvent(on,"contextmenu",function(e){self.open(e)}) //for big screens
    }
    else{addEvent(on,"click",function(e){self.open(e)})}
    addEvent(this.curtain,"click",function(e){self.close(e)})
    function adjust(){self.close()}
}

function Confirm(message,onconfirm,ondecline,confirmText,declineText){
    var maxWidth = "500px"
    var width = "90%"
    var maxHeight = "80%"
    var window = {}; TABINSTANCE.construct(window); window = window.window
    window.className += " flex vcenter hcenter"
    var element = document.createElement("div"); element.style.width = width;
    element.style.maxWidth = maxWidth; element.style.maxHeight = maxHeight; 
    element.className = "confirm-tab auto-margin"
    var messageBox = document.createElement("div"); messageBox.style.overflow = "auto"
    messageBox.className = "message-box"
    var action = document.createElement("div"); action.className = "actions"
    var confirmBtn = document.createElement("button"); confirmBtn.className = "pointer"
    var declineBtn = confirmBtn.cloneNode(true)
    confirmBtn.className += " confirm"
    confirmBtn.innerHTML = (confirmText)? confirmText : "Ok"
    declineBtn.innerHTML = (declineText)? declineText : "Cancel"
    messageBox.innerHTML = (message)? message : ""
    append(element,[messageBox,action])
    append(action,[confirmBtn,declineBtn])
    onconfirm = (isFunction(onconfirm))? onconfirm : function(){}
    ondecline = (isFunction(ondecline))? ondecline : function(){}
    addEvent(confirmBtn,"click",function(){close(); onconfirm()})
    addEvent(declineBtn,"click",function(){close(); ondecline()})
    open()
    function open(){
        window.appendChild(element)
        document.body.appendChild(window)
    }
    function close(){
        remove(window)
    }
}
function semiTab(cb,opener,closeCB){
    this.tabObject= new miniTab(cb,opener,closeCB); this.tabObject.tab.className = "semitab"
    this.tabObject.smallScreen = function(){
    }
    this.tabObject.bigScreen = function(){
    }
    this.tab = this.tabObject.tab
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
        document.body.appendChild(this.window); this.adjust()
        addEvent(window,"resize",resize); if(isFunction(this.cb)){this.cb()}
    }
    this.adjust = function(){
        var wdim = windowDim(); 
        if(this.screenThreshold > wdim.w){
            this.smallScreen(wdim)
        }
        else{this.bigScreen(wdim)}
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
    var resize = function(){self.adjust()}
    this.addOpener(opener)
}

function notification(message,bg,color,closeBtnColor,showTime){
    if(!bg){bg = null}
    if(!color){color = null}
    if(!closeBtnColor){closeBtnColor = null}
    if(!showTime){showTime = 10000}
    var ss = 700
    var open = false
    var self = this
    var notificationContainer = document.createElement("div")
    notificationContainer.className = "yotta-notification"
    notificationContainer.style.backgroundColor = bg

    var notificationTop = document.createElement("div")
    notificationTop.className = "yotta-notification-top"
    var notificationClose = document.createElement("span"); notificationClose.style.color = closeBtnColor
    notificationClose.innerHTML = "X"; notificationClose.className = "yotta-notification-close"
    addEvent(notificationClose,"click",function(){self.close()})
    notificationTop.appendChild(notificationClose)

    var notificationMessage = document.createElement("div")
    notificationMessage.className = "yotta-notification-message"
    notificationMessage.style.color = color
    notificationMessage.innerHTML = message
    append(notificationContainer,[notificationTop,notificationMessage])

    this.display = function(){
        document.body.appendChild(notificationContainer)
        open = true
        this.adjust()
        addEvent(window,"resize",adjust)
        if(!this.fader){this.fader = new customFade(notificationContainer,showTime)}
    }
    this.close = function(){
        removeEvent(window,"resize",adjust)
        this.fader.stop()
        open = false
    }
    this.adjust = function(){
        if(!open){return}
        var wd = windowDim()
        var cd = elementDim(notificationContainer)
        var cCoord = notificationContainer.getBoundingClientRect()
        if(wd.w > cd.w){
            var x = ((wd.w - cd.w) / 2)
        }
        else{x = 0}
        moveTo(notificationContainer,x,cCoord.top)
    }
    function adjust(){
        self.adjust()
    }
    this.display()
}

function slider(container){
    /*constructor for sliders
     The container parameter specifies the parent to append the slider to when it is initiated
    */
    var self = this
    var minSlideToNxt = 20 //for touch screen devices, the threshold to slide in percentage before moving to next

    //here you construct the slider
    var sliderContainer = document.createElement("div"); sliderContainer.className = "slider-container"
    var slider = document.createElement("div"); slider.className = "slide"
    //forward button
    var forwardBtnContainer = document.createElement("div"); 
    forwardBtnContainer.className = "absolute full-height top right flex vcenter"
    var forwardBtn = document.createElement("a"); forwardBtn.innerHTML = "&#8250;";
    forwardBtn.className = "nav-btn round right pointer";
    forwardBtnContainer.appendChild(forwardBtn)
    forwardBtn.onclick = function(){self.move(true)}; 
    //backward button
    var backBtnContainer = document.createElement("div"); 
    backBtnContainer.className = "absolute full-height top left flex vcenter"
    var backBtn = forwardBtn.cloneNode(true); backBtn.innerHTML = "&#8249;";changeClass(backBtn,"right","left")
    backBtnContainer.appendChild(backBtn)
    backBtn.onclick = function(){self.move(false)}
    //slider indicators
    var indicator = document.createElement("div"); indicator.className = "slider-indicator"
    var indicatorItemProto = document.createElement("button"); 
    indicatorItemProto.className = "round space-left item"; indicatorItemProto.style.width = "10px"
    indicatorItemProto.style.height = "10px"; indicatorItemProto.style.padding = "0"
    var virtualLastIndicator = indicatorItemProto.cloneNode(true); virtualLastIndicator.style.display = "none"
    var virtualFirstIndicator = virtualLastIndicator.cloneNode(true)
    append(sliderContainer,[slider,backBtnContainer,forwardBtnContainer,indicator])

    //assign values to object properties
    this.sliderContainer = sliderContainer
    this.slider = slider
    this.forwardBtn = forwardBtn
    this.backBtn = backBtn
    this.container = container
    this.currentItem = 0
    this.indicator = indicator
    this.canMove = true

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
        this.addTransitEvent(item)
    }
    this.transitEvent = function(e){self.endTransit(e)}
    this.addTransitEvent = function(item){
        addEvent(item,"transitionend",this.transitEvent)
        addEvent(item,"webkitTransitionEnd",this.transitEvent)
    }
    this.display = function(){
        /*displays the slider in the specified parent element*/
        this.container.appendChild(this.sliderContainer)
        //remove the scroll bar
        this.slider.style.overflow = "hidden"
        //set the navigation buttons state accordinly
        this.navCheck()
        changeClass(this.indicator.children[this.currentItem],"","current")
        changeClass(this.slider.children[this.currentItem],"","current")
        addEvent(window,"resize",function(){self.adjust()})
    }
    this.moveTo = function(element,x){
        this.translate(element,x - this.orgPos(element))
    }
    this.translate = function(element,x){element.style.transform = "translate(" + x.toString() + "px)"}
    this.endTransit = function(e){
        var slider = this.slider
        var currentElem = slider.children[this.currentItem]
        if(e.target !== currentElem){return}
        if(this.moved){this.handleInfiniteLoop()}
        this.moved = false
        this.canMove = true
    }
    this.readyLoop = function(){
        if(this.infiniteLoop && this.slider.children.length > 1){
            var endReached
            if(this.currentItem == this.slider.children.length - 1){
                endReached = "last"
            }
            else if(this.currentItem == 0){
                endReached = "first"
            }
            if(this.sliderEdgeReached == "first" && endReached != "first"){
                var virtualLast = this.slider.children[0]
                remove(virtualLast); remove(virtualLastIndicator)
                this.sliderEdgeReached = false
                this.currentItem--
                this.organizeSlider()
                this.navCheck()
            }
            else if(this.sliderEdgeReached == "last" && endReached != "last"){
                var virtualFirst = this.slider.children[this.slider.children.length - 1]
                remove(virtualFirst); remove(virtualFirstIndicator)
                this.sliderEdgeReached = false
                this.organizeSlider()
                this.navCheck()
            }
            
            if(endReached == "last"){
                //the last item
                if(this.sliderEdgeReached == "last"){return true}
                var virtualFirst = this.slider.children[0].cloneNode(true)
                this.slider.appendChild(virtualFirst)
                this.addTransitEvent(virtualFirst)
                this.indicator.appendChild(virtualFirstIndicator)
                this.sliderEdgeReached = "last";
                this.organizeSlider()
                this.navCheck()
            }
            else if(endReached == "first"){
                //the first item
                if(this.sliderEdgeReached == "first"){return true}
                var virtualLast = this.slider.children[this.slider.children.length - 1].cloneNode(true)
                var first = this.slider.children[0]
                changeClass(virtualLast,"","no-transition")
                changeClass(first,"","no-transition")
                prepend(this.slider,virtualLast)
                this.addTransitEvent(virtualLast)
                prepend(this.indicator,virtualLastIndicator)
                this.sliderEdgeReached = "first";
                this.currentItem++
                this.organizeSlider()
                this.navCheck()
            }
        }
        return false
    }
    this.handleInfiniteLoop = function(){
        var readyLoop = this.readyLoop()
        if(!readyLoop){
            /*either that the time to execute the loop has not yet come all the loop isn't activated*/
            return
        }
        if(this.currentItem == this.slider.children.length - 1 && this.sliderEdgeReached == "last"){
            //reached the last item
            this.dontMove = true
            var virtualFirst = this.slider.children[this.currentItem]
            var first = this.slider.children[0]
            for(var i = 0; i < this.slider.children.length; i++){
                var item = this.slider.children[i]
                changeClass(item,"","no-transition")
                this.translate(item,0)
            }
            remove(virtualFirst)
            this.sliderEdgeReached = false
            this.currentItem = 0
            remove(virtualFirstIndicator); changeClass(virtualFirstIndicator,"current","")
            changeClass(this.indicator.children[this.currentItem],"","current")
            this.readyLoop()
            this.dontMove = false
        }
        else if(this.currentItem == 0 && this.sliderEdgeReached == "first"){
            //virtual loop started
            this.dontMove = true
            this.currentItem = this.slider.children.length - 2
            var virtualLast = this.slider.children[0]
            var last = this.slider.children[this.slider.children.length - 1]
            var lastW = elementDim(last,"w")
            var sliderCoord = this.slider.getBoundingClientRect()
            remove(virtualLastIndicator)
            remove(virtualLast)
            changeClass(virtualFirstIndicator,"current","")
            changeClass(this.indicator.children[this.currentItem],"","current")
            for(var i = 0; i < this.slider.children.length; i++){
                var item = this.slider.children[i]
                changeClass(item,"","no-transition")
                this.moveTo(item,sliderCoord.left - lastW)
            }
            this.sliderEdgeReached = false
            this.readyLoop()
            this.dontMove = false
        }
    }
    this.move = function(dir){
        /*changes the current element of the slider
        **parameters**
            dir => the dir property specifies what the next element should be
            it has boolean value where true means the next element while false means the previous element
        */
        if(!this.canMove || this.dontMove || this.touching){return}
        var items = this.slider.children
        var indicatorItems = this.indicator.children
        var currentItem = this.currentItem
        var nextItem = (dir)? currentItem + 1 : currentItem - 1;
        var currentElem = items[currentItem]
        if(nextItem in items){
            this.canMove = false
            this.moved = true
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
        if(!this.canMove || this.dontMove){return}
        stopDefault(e)
        var items = this.slider.children
        var currentElem = items[this.currentItem]
        var touch = (type == "move")? e.touches : e.changedTouches
        var focusedTouch = touch.length - 1
        var x = touch[focusedTouch].screenX
        if(this.formalX == undefined){this.formalX = x}
        var dx = x - this.formalX
        this.formalX = x
        if(type == "start"){
            this.touching = true
            return
        }
        var nextItem
        if(dx < 0){nextItem =  this.currentItem + 1}
        else if(dx > 0){nextItem = this.currentItem - 1}
        else if(type == "move"){return}

        if(type == "end"){
            this.formalX = undefined
            this.focusedNext = undefined
            this.touching = false
            var sliderCoord = this.slider.getBoundingClientRect()
            var currentCoord = currentElem.getBoundingClientRect()
            var nextThreshold = (elementDim(this.slider).w * minSlideToNxt / 100)
            if((sliderCoord.right - currentCoord.right) >= nextThreshold){
                //foward
                this.move(true)
            }
            else if((currentCoord.left - sliderCoord.left) >= nextThreshold){
                //backward
                this.move(false)
            }
            else{
                var recoilDir
                if(currentCoord.right < sliderCoord.right){recoilDir = true}
                else if(currentCoord.left >sliderCoord.left){recoilDir = false}
                else{return}
                this.touchRecoil(recoilDir)
            }
            this.canMove = true
            return
        }

        var nextElem; var supposedNext
        if(nextItem in items){supposedNext = items[nextItem]}
        if(supposedNext && this.focusedNext == undefined){nextElem = supposedNext}
        else if(this.focusedNext != undefined){nextElem = this.focusedNext}
        else{return}

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
    this.touchRecoil = function(dir){
        var currentElem = this.slider.children[this.currentItem]
        var nextItem = (dir)? this.currentItem + 1 : this.currentItem - 1
        var sliderCoord = this.slider.getBoundingClientRect()
        if(nextItem in this.slider.children){
            var nextElem = this.slider.children[nextItem]
            var currentElemX = this.orgPos(currentElem); var nextElemX = this.orgPos(nextElem)
            changeClass(currentElem,"no-transition",""); changeClass(nextElem,"no-transition","")
            if(dir){
                var currentX = sliderCoord.left
                var nextX = sliderCoord.right
            }
            else{
                var currentX = sliderCoord.left
                var nw = elementDim(nextElem)
                var nextX = sliderCoord.left - nw.w
            }
            var cdx = currentX - currentElemX; var ndx = nextX - nextElemX
            this.translate(currentElem,cdx)
            this.translate(nextElem,ndx)
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
    this.organizeSlider = function(){
        var items = this.slider.children
        var sliderCoord = this.slider.getBoundingClientRect()
        var nextItem = this.currentItem + 1
        var prevItem = this.currentItem - 1;
        var currentElem = items[this.currentItem]
        changeClass(currentElem,"","no-transition")
        var cOrgX = this.orgPos(currentElem)
        this.translate(currentElem,sliderCoord.left - cOrgX)
        if(prevItem in items){
            var prevElem = items[prevItem]
            var prevElemWidth = elementDim(prevElem,"w")
            changeClass(prevElem,"","no-transition")
            var x = sliderCoord.left - prevElemWidth
            this.translate(prevElem,x - this.orgPos(prevElem))
        }
        if(nextItem in items){this.organizeNext(true)}
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
        if(items[this.currentItem] === items[0]){changeClass(this.backBtn,"","none"); end = "l"}
        else{changeClass(this.backBtn,"none","")}
        if(items[this.currentItem] === items[items.length - 1]){changeClass(this.forwardBtn,"","none"); end = "r"}
        else{changeClass(this.forwardBtn,"none","")}
        return end
    }
    this.adjust = function(){
        /*the slider operates with transition, so a function to adjust the slider incase of screen resize*/
        var container = this.slider
        var items = container.children
        this.organizeSlider()
    }
    this.slideShow = function(interval,infinite){
        this.infiniteLoop = (infinite)? infinite : true
        if(this.infiniteLoop){this.handleInfiniteLoop()}
        interval = (isNumeric(interval))? interval : 5000;
        this.slideId = setInterval(play,interval)
        function play(){
            var end = self.move(true)
            if(end == "r" && !self.infiniteLoop){
                self.stopSlide()   
            }
        }
    }
    this.stopSlide = function(){
        clearInterval(this.slideId)
    }
}

function write(node,parent,finishCB,delay,cursorColor,cursorChar){
    var cursor = document.createElement("span"); 
    cursorChar = (cursorChar)? cursorChar : "|"
    cursor.innerHTML = cursorChar; cursor.className = "blink"
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
        if(nodeMap.length < 1){
            if(finishCB){finishCB()}
            return
        }
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
        nodeCopy.innerHTML = "";
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