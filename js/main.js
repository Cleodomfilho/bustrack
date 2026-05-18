class BusTrackEscolar {
    constructor() {
        this.apiUrl = '/api/responsaveis';
        this.init();
    }

    init() {
        console.log('BusTrack Escolar carregado');
        this.setupFormListeners();
    }

    setupFormListeners() {
        const form = document.querySelector('#responsavelForm');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.querySelector('#nome').value;
            const telefone = document.querySelector('#telefone').value;
            const aluno = document.querySelector('#aluno').value;

            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        telefone,
                        aluno
                    })
                });

                const data = await response.json();

                alert('Responsável salvo com sucesso!');
                console.log(data);

                form.reset();
            } catch (error) {
                console.error(error);
                alert('Erro ao salvar responsável');
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new BusTrackEscolar();
});
