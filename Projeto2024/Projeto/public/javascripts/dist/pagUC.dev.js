"use strict";

$(document).ready(function () {
  // Mostra a mensagem de erro assim que a página for carregada
  $('#erroMensagem').show(); // Configura um timeout para esconder a mensagem após 2.5 segundos

  setTimeout(function () {
    $('#erroMensagem').hide();
  }, 2500);
});