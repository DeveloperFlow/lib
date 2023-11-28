var _$ = function(){
    try{
        var children = accounts.children
        var len = children.length;
        for(var i = 0; i < len; i++){
            iniOption(children[i])
        }
    }
    catch(err){}
}()

function iniOption(account){
    var button = account.children[0].children[3]
    var email = account.children[0].children[1].innerHTML
    var optionContainer = account.children[1]
    for(var i = 0; i < optionContainer.children.length; i++){addAction(optionContainer.children[i],i)}
    addEvent(button,"click",openOptions)
    var optionOpened = false;
    function openOptions(){
        if(optionOpened){
            changeClass(optionContainer,"","closed")
            optionOpened = false
        }
        else{
            changeClass(optionContainer,"closed","")
            optionOpened = true
        }
    }
    function addAction(element,i){
        var button = element.children[2]
        var message = ""; var confirmText; var declineText
        if(i == 0){
            message = "Are you sure that you want to remove "+email+" from this device,\
            this means that you won't see this account on this device";
            confirmText = "Remove"
            declineText = "Do not remove"
        }
        else if(i == 1){
            message = "Are you sure that you want to disable one tap log in for "+email
            confirmText = "Disable"
            declineText = "Do not disable"
        }
        addEvent(element,"click",confirmation)
        function confirmation(){
            function onconfirm(){button.click()}
            Confirm(message,onconfirm,undefined,confirmText,declineText)
        }
    }
}
