
//constructor for password verification
function verifyPassword(passwordInput,errorBox){
    /*the first parameter is the password INPUT to use
     #the second is the box where errors are displayed
    */
    var self = this
    this.input = passwordInput
    this.verify = function(){
        var input = this.input
        this.errorBox = errorBox
        this.symbol = (isNumeric(this.symbol))? this.symbol : 0
        this.number = (isNumeric(this.number))? this.number : 0
        var password = input.value
        var error
        var symbols = password.replace(/\w/g,"")
        symbols = symbols.replace(/\w/g,"")
        var numbers = password.match(/\d/g)
        if(numbers){numbers = numbers.length}else{numbers = 0}
        console.log(this.minLength)
        if(isNumeric(this.minLength) && password.length < this.minLength){
            error = "Password should not be shorter than "+this.minLength.toString()
        }
        else if(isNumeric(this.maxLength) && password.length > this.maxLength){
            error = "Password should not be longer than "+this.maxLength.toString()
        }
        else if(symbols < this.symbol){
            error = singleOrPlural(this.symbol,"symbol")
            error = "Password must contain at least " +error 
        }
        else if(numbers < this.number){
            error = singleOrPlural(this.number,"number")
            error = "Password must contain at least "+error
        }
        else{error = ""}
        if(isEmpty(error)){this.okay()}
        else{this.error(error)}
    }
    this.okay = function(){
        this.errorBox.style.display = "none"
        changeClass(this.input,"error","okay")
    }
    this.error = function(error){
        this.errorBox.innerHTML = error
        this.errorBox.style.display = "block"
        changeClass(this.errorBox,"okay","error")
        changeClass(this.input,"okay","error")
    }
    addEvent(passwordInput,"input",function(){self.verify()})
}
function detailsExist(scriptUrl,key,input,msgBox,existMessage = "Details exist"){
    /*
    #the first parameter is the url of the script that checks if the details exist
    #the second parameter specifies the post key to use
    #the third parameter specifies the input to read from
    #the fourth parameter specifies an element to display messages in
    */
    var req
    function check_details(){
        if(!req){
            req = new Req(scriptUrl,"POST")
            req.onload = function(obj){
                var response = obj.object.response
                if(JSON.parse(response)){
                    changeClass(msgBox,"","error")
                    msgBox.innerHTML = existMessage
                }
                else{changeClass(msgBox,"error",""); msgBox.innerHTML = ""}
            }
        }
        if(input.value.length > 0){
            req.message = {[key]:input.value}
            req.send()
        }
    }
    addEvent(input,"input",check_details)
}