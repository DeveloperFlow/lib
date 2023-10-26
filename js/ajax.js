function Req(url,method,message){
    if(!message){message = {}}
    this.object = new XMLHttpRequest(); this.url = url
    this.stimulis = [
        "onload","onabort","ontimeout","onloadend","onerror",
        "onloadstart","onprogress","onreadystatechange"
    ]
    this.validMethods = ["POST","GET"]
    this.defaultMethod = "POST"
    this.method = method
    this.message = message

    this.send = function(){
        var object = this.object
        this.method = (inarray(this.validMethods,this.method))? this.method : this.defaultMethod
        if(this.loadClass){
            if(!(this.loadInterface instanceof this.loadClass)){
                this.loadInterface = new this.loadClass(this.loadElement)
            }
            this.loadInterface.start()
        }
        object.open(this.method.toUpperCase(),this.url)
        object.responseType = (this.responseType)? this.responseType : object.responseType
        if(equalString(this.method,"post")){
            object.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
        }
        for(var i=0; i < this.stimulis.length; i++){
            this.addReact(this.stimulis[i],this[this.stimulis[i]])
        }
        object.send(this.setMessage())
    }

    this.addReact = function(stimuli,response){
        var self = this
        this.object[stimuli] = function(e){
            if(self.loadInterface && self.loadInterface instanceof progress && stimuli == "onprogress"){
                var totalDataVol = e.total
                var loadedDataVol = e.loaded
                var loadProgress = (loadedDataVol * self.loadInterface.max) / totalDataVol
                self.loadInterface.makeProgress(loadProgress)
            }
            if(self.object.readyState == 4 && self.loadClass){
                self.loadInterface.stop()
            }
            if(isFunction(response)){
                response(self)
            }
        }
    }
    this.setMessage = function(){
        var message = this.message
        var messageList = []
        for(key in message){
            var value = message[key]
            if(value === null || value === undefined || value === false){value = ""}
            else if(value instanceof Object){value = JSON.stringify(value)}
            messageList.push(key.toString() + "=" + value.toString())
        }
        return messageList.join("&")
    }

    this.ongoingRequest = function(){
        /*checks if there is an ongoing request*/
        return this.object.readyState !=4 && this.OPENED
    }
}