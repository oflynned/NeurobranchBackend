var counter = 1;
var limit = 3;
function addInput(divName){
    if (counter == limit)  {
        alert("You have reached the limit of adding " + counter + " inputs");
    }
    else {
        var newdiv = document.createElement('div');
        newdiv.innerHTML = "answer " + (counter + 1) + " <br><input type='text' id='answer' name='answer'>";
        document.getElementById(divName).appendChild(newdiv);
        //console.out("field created");
        counter++;
    }
    console.out('field created' , counter);
}

function removeInput(divName){
    if (counter == limit)  {

        var element = document.getElementById("dynamicInput");
        element.parentNode.removeChild(element);
        counter--;
        alert("too many deletions");
    }
    else{
        var element = document.getElementById("dynamicInput");
        element.parentNode.removeChild(element);
        counter--;

    }

}
