"use strict";

$(document).ready(function () {
  // Toggling visibility of password
  $('.pw-hide').click(function () {
    $('.pw-hide').toggleClass("fa-eye-slash");
    $('.pw-hide').toggleClass("fa-eye");
    toggle_visibilty();
  });
  $('#formSubmit').click(function (event) {
    event.preventDefault();
    var ucsChecked = $('input[name="ucs"]:checked').length;

    if (ucsChecked === 0) {
      $('#warning').stop(false, true);
      $('#warning').html("<p>Aviso: Por favor, selecione pelo menos uma Unidade Curricular.</p>");
      $('#warning').fadeIn(110).delay(4000).fadeOut(4000);
      return;
    }

    var formData = {};
    new URLSearchParams($('#login-form').serialize()).forEach(function (value, key) {
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
      success: function success(response) {
        $("#modal").modal({
          escapeClose: false,
          clickClose: false,
          showClose: false
        });
        setTimeout(function () {
          window.location.href = "/ucs";
        }, 0); // 2500 milissegundos = 2.5 seconds
      },
      statusCode: {
        512: function _(resp) {
          var warning = resp.responseJSON.warning;
          $('#warning').stop(false, true);
          $('#warning').html("<p>Aviso: " + warning + "</p>");
          $('#warning').fadeIn(110).delay(4000).fadeOut(4000);
        }
      }
    });
  });
});

function toggle_visibilty() {
  var currentType = $('.password').attr('type');

  if (currentType == "password") {
    $('.password').attr('type', 'text');
  } else {
    $('.password').attr('type', 'password');
  }
}