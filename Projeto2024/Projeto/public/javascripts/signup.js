$(document).ready(function() {
    // Toggling visibility of password
    $('.pw-hide').click(() => {
        $('.pw-hide').toggleClass("fa-eye-slash");
        $('.pw-hide').toggleClass("fa-eye");
        toggle_visibilty();
    });

    $('#formSubmit').click((event) => {
        event.preventDefault();
        let ucsChecked = $('input[name="ucs"]:checked').length;
        if (ucsChecked === 0) {
            $('#warning').stop(false, true);
            $('#warning').html("<p>Aviso: Por favor, selecione pelo menos uma Unidade Curricular.</p>");
            $('#warning').fadeIn(110).delay(4000).fadeOut(4000);
            return;
        }
        let formData = {};
        new URLSearchParams($('#login-form').serialize()).forEach((value, key) => {
            if (formData[key]) {
                if (Array.isArray(formData[key])) {
                    formData[key].push(value);
                } else {
                    formData[key] = [formData[key], value];
                }
            } else {
                formData[key] = value;
            }
        });

        $.ajax({
            url: '/signup',
            method: 'POST',
            data: formData,
            success: (response) => {
                $("#modal").modal({
                    escapeClose: false,
                    clickClose: false,
                    showClose: false
                });

                setTimeout(() => {
                    window.location.href = "/ucs";
                }, 0); // 2500 milissegundos = 2.5 seconds
            },
            statusCode: {
                512: function(resp) {
                    let warning = resp.responseJSON.warning;
                    $('#warning').stop(false, true);
                    $('#warning').html("<p>Aviso: " + warning + "</p>");
                    $('#warning').fadeIn(110).delay(4000).fadeOut(4000);
                }
            }
        });
    });
});

function toggle_visibilty() {
    let currentType = $('.password').attr('type');
    if (currentType == "password") {
        $('.password').attr('type', 'text');
    } else {
        $('.password').attr('type', 'password');
    }
}
