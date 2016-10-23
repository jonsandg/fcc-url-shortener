$(document).ready(function(){
    var input = $("#url_input");
    var result = $("#result");
    
    $("form").submit(function(e){
        e.preventDefault();
    });
    
    $("#submit").click(function(){
        if(input.val() == "")
            return;
        
        $.getJSON("/new/" + input.val(), function(data){
            if(data.error)
                result.text(data.error);
            else
                result.text(data.short_url);
        });
    });
});