$(function () {

    
})


function showImage(fname, id){
    console.log("aqui")
        var ficheiro = $('<p>' + fname + '</p>')
        var download = $('<div><a href="/ucs/' + id + '/download/' + fname +  '">Download</a></div>')
        $("#display").empty()
        $("#display").append(ficheiro, download)
        $("#display").modal()
}