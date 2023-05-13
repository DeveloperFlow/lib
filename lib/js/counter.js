function countDown(seconds){
    var self = this
    var unitsNames = {d:"Day",h:"Hour",m:"Minute",s:"Second"}
    this.totalSeconds = seconds
    this.splitSeconds = function(seconds){
        seconds = Math.floor((seconds < 0)? 0 : seconds)
        var d = Math.floor(seconds / 86400)
        var secondsLeft = seconds % 86400
        var h = Math.floor(secondsLeft / 3600)
        secondsLeft = secondsLeft % 3600
        var m = Math.floor(secondsLeft / 60)
        secondsLeft = secondsLeft % 60
        var s = Math.floor(secondsLeft)
        return {d:d,h:h,m:m,s:s}
    }
    this.start = function(){
        this.running = true; self.count()
        if(this.running != true){return}
        if("onstart" in this){this.onstart()}
        this.id = setInterval(function(){self.count()},1000)
    }
    this.count = function(){
        var totalSeconds = this.totalSeconds - 1
        this.totalSeconds = (totalSeconds > 0)?totalSeconds : 0
        if(totalSeconds < 0){this.stop(); return}
        var timeLeft = this.splitSeconds(this.totalSeconds)
        this.display(timeLeft)
    }
    this.display = function(timeLeft){
        if(!this.containerParent){return}
        if(!this.container){
            this.container = document.createElement("div")
            this.container.className = "flex vcenter"
            this.container.style.gap = "4%"
            this.containerParent.appendChild(this.container)
        }
        for(thisUnit in timeLeft){
            var value = timeLeft[thisUnit]
            if(!this[thisUnit]){
                this[thisUnit] = document.createElement("span"); 
                this[thisUnit].className = "bold orange-bg curved minor-pad"
                this.container.appendChild(this[thisUnit])
            }
            if(value > 0){
                this[thisUnit].innerHTML = singleOrPlural(value,unitsNames[thisUnit])
                this[thisUnit].style.display = "inline"
            }
            else{this[thisUnit].style.display = "none"}
        }
    }
    this.stop = function(){
        this.running = false
        if("onstop" in this){this.onstop()}
        if(this.container){remove(this.container)}
        clearInterval(this.id)
    }
}