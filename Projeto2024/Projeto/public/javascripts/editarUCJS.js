$(function () {
    var docenteCount = 1;

    // Função para adicionar um novo conjunto de campos de docente
    $('#adicionar-docente').on('click', function () {
        docenteCount++;
        var docenteContainer = document.createElement('div');
        docenteContainer.classList.add('docente', 'separador-docente');

        var fields = ['nome', 'categoria', 'filiacao', 'email', 'webpage'];
        fields.forEach(function (field) {
            var label = document.createElement('label');
            label.setAttribute('for', field + '-' + docenteCount);
            label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ' do Docente';
            docenteContainer.appendChild(label);

            var input;
            if (field === 'email') {
                input = document.createElement('select');
                input.classList.add('w3-input', 'w3-round');
                input.setAttribute('id', field + '-' + docenteCount);
                input.setAttribute('name', field + '-' + docenteCount);
                input.setAttribute('required', 'true');

                // Preencher select com opções de email que não estão nos docentes já adicionados
                var docentesAdicionados = document.querySelectorAll('.docente');
                var emailsSelecionados = Array.from(docentesAdicionados).map(function (docente) {
                    return docente.querySelector('select').value;
                });

                emails.forEach(function (email) {
                    if (!emailsSelecionados.includes(email)) {
                        var option = document.createElement('option');
                        option.setAttribute('value', email);
                        option.textContent = email;
                        input.appendChild(option);
                    }
                });
            } else {
                input = document.createElement('input');
                input.classList.add('w3-input', 'w3-round');
                input.setAttribute('type', field === 'email' ? 'email' : 'text');
                input.setAttribute('name', field + '-' + docenteCount);
                input.setAttribute('placeholder', 'Insira ' + field);

                // Torna o nome e o email obrigatórios
                if (field === 'nome' || field === 'email') {
                    input.setAttribute('required', 'true');
                }
            }

            docenteContainer.appendChild(input);
        });

        // Botão para remover este docente
        var removerButton = document.createElement('button');
        removerButton.classList.add('w3-btn', 'w3-red', 'w3-round', 'w3-margin-top');
        removerButton.textContent = 'Remover Docente';
        removerButton.addEventListener('click', function () {
            docenteContainer.remove(); // Remove o container do docente
        });
        docenteContainer.appendChild(removerButton);

        // Localiza o container onde os docentes serão adicionados dinamicamente
        var docentesAdicionados = document.getElementById('docentes-adicionados');
        // Insere o novo container de docente antes do botão de adicionar docente
        docentesAdicionados.appendChild(docenteContainer);
    });
});
