// ambil data post dari form dengan id checkout-form
var $form = $form('#checkout-form');

$form.submit(function(event){
    $('#error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    return false;
    // $form.find('button').prop('disabled', false);
});

function fetch(){
    $('#error').text(name);
    $('#error').removeClass('hidden');
    $form.find('button').prop('disabled', false);
    $form.get(0).submit();
}