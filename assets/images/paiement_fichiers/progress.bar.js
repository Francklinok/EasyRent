
function showSpinner() {
    $.preloader.start({
        modal: true,
        position: 'center',
        src: 'sprites.png'
    });
}

function hideSpinner() {
    $.preloader.stop();
}
function triggerSpinner() {
    $('.processing').click(function () {
        console.log("spinner loading");
        showSpinner();
    });
    
    $('form').submit(function () {
        console.log("submit spinner loading");
        showSpinner();
    });
}
