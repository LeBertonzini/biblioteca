// ======================
// PROTEÇÃO DAS PÁGINAS
// ======================

if (window.location.pathname.includes("admin.html")) {

    const tipoUsuario = localStorage.getItem("tipoUsuario");

    if (tipoUsuario !== "admin") {
        window.location.href = "login.html";
    }
}

if (window.location.pathname.includes("cliente.html")) {

    const tipoUsuario = localStorage.getItem("tipoUsuario");

    if (tipoUsuario !== "cliente") {
        window.location.href = "login.html";
    }
}

// ======================
// LOGIN
// ======================

const btnlogin = document.getElementById("btnlogin");

if (btnlogin) {

    btnlogin.addEventListener("click", () => {

        const usuario =
            document.getElementById("usuario").value;

        const senha =
            document.getElementById("senha").value;

        if (
            usuario === "admin" &&
            senha === "admin123"
        ) {

            localStorage.setItem(
                "tipoUsuario",
                "admin"
            );

            window.location.href =
                "admin.html";

            return;
        }

        if (
            usuario === "cliente" &&
            senha === "cliente123"
        ) {

            localStorage.setItem(
                "tipoUsuario",
                "cliente"
            );

            window.location.href =
                "cliente.html";

            return;
        }

        alert("Usuário ou senha inválidos.");

    });

}

// ======================
// LOGOUT
// ======================

const btnLogout =
    document.getElementById("btnLogout");

if (btnLogout) {

    btnLogout.addEventListener("click", () => {

        localStorage.removeItem(
            "tipoUsuario"
        );

        window.location.href =
            "login.html";

    });

}

// ======================
// CLIENTE
// ======================

if (document.getElementById("btnBuscar")) {

    let livroSelecionado = null;

    const btnBuscar =
        document.getElementById("btnBuscar");

    const resultadoLivro =
        document.getElementById("resultadoLivro");

    const loading =
        document.getElementById("loading");

    const meusEmprestimos =
        document.getElementById("meusEmprestimos");

    btnBuscar.addEventListener("click", async () => {

        const termoBusca =
            document.getElementById("buscalivro")
            .value
            .trim();

        if (!termoBusca) {

            alert("Digite o nome do livro.");

            return;
        }

        loading.style.display = "block";

        resultadoLivro.innerHTML = "";

        try {

            const response =
                await fetch(
                    `https://openlibrary.org/search.json?title=${encodeURIComponent(termoBusca)}`
                );

            const data =
                await response.json();

            if (data.docs.length === 0) {

                resultadoLivro.innerHTML =
                    "<p>Livro não encontrado.</p>";

                return;
            }

            const livro =
                data.docs[0];

            const titulo =
                livro.title;

            const autor =
                livro.author_name
                    ? livro.author_name[0]
                    : "Autor desconhecido";

            const fotoCapa =
                livro.cover_i
                    ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
                    : "https://via.placeholder.com/100x150";

            resultadoLivro.innerHTML = `

                <div class="cardLivro">

                    <img src="${fotoCapa}">

                    <h3>${titulo}</h3>

                    <p>${autor}</p>

                    <button id="btnSelecionar">
                        Selecionar Livro
                    </button>

                </div>

            `;

            document
                .getElementById("btnSelecionar")
                .addEventListener("click", () => {

                    livroSelecionado = {
                        titulo,
                        fotoCapa
                    };

                    resultadoLivro.innerHTML += `

                        <br>

                        <button id="btnEmprestar">
                            Finalizar Empréstimo
                        </button>

                    `;

                    document
                        .getElementById("btnEmprestar")
                        .addEventListener(
                            "click",
                            finalizarEmprestimo
                        );

                });

        } catch {

            resultadoLivro.innerHTML =
                "<p>Erro ao buscar livro.</p>";

        } finally {

            loading.style.display =
                "none";

        }

    });

    function finalizarEmprestimo() {

        const nomeCliente =
            document
            .getElementById("nomeCliente")
            .value
            .trim();

        if (!nomeCliente) {

            alert(
                "Digite seu nome."
            );

            return;
        }

        if (!livroSelecionado) {

            alert(
                "Selecione um livro."
            );

            return;
        }

        const emprestimos =
            JSON.parse(
                localStorage.getItem(
                    "emprestimos"
                )
            ) || [];

        const devolucao =
            new Date();

        devolucao.setDate(
            devolucao.getDate() + 7
        );

        emprestimos.push({

            nomeCliente:
                nomeCliente,

            nomeLivro:
                livroSelecionado.titulo,

            fotoCapa:
                livroSelecionado.fotoCapa,

            dataDevolucao:
                devolucao.toLocaleDateString(
                    "pt-BR"
                )

        });

        localStorage.setItem(
            "emprestimos",
            JSON.stringify(
                emprestimos
            )
        );

        alert(
            "Empréstimo realizado com sucesso!"
        );

        mostrarEmprestimos();

    }

    function mostrarEmprestimos() {

        const emprestimos =
            JSON.parse(
                localStorage.getItem(
                    "emprestimos"
                )
            ) || [];

        meusEmprestimos.innerHTML = "";

        emprestimos.forEach(emp => {

            meusEmprestimos.innerHTML += `

                <div class="cardLivro">

                    <img src="${emp.fotoCapa}">

                    <h4>${emp.nomeLivro}</h4>

                    <p>
                        Cliente:
                        ${emp.nomeCliente}
                    </p>

                    <p>
                        Devolução:
                        ${emp.dataDevolucao}
                    </p>

                </div>

            `;

        });

    }

    mostrarEmprestimos();

}

// ======================
// ADMIN
// ======================

if (document.getElementById("listaEmprestimos")) {

    const listaEmprestimos =
        document.getElementById(
            "listaEmprestimos"
        );

    let emprestimos =
        JSON.parse(
            localStorage.getItem(
                "emprestimos"
            )
        ) || [];

    function renderizarEmprestimos() {

        listaEmprestimos.innerHTML = "";

        emprestimos.forEach(
            (emp, indice) => {

                listaEmprestimos.innerHTML += `

                    <div class="cardLivro">

                        <img src="${emp.fotoCapa}">

                        <h4>${emp.nomeLivro}</h4>

                        <p>
                            Cliente:
                            ${emp.nomeCliente}
                        </p>

                        <p>
                            Devolução:
                            ${emp.dataDevolucao}
                        </p>

                        <button onclick="removerEmprestimo(${indice})">
                            Finalizar Empréstimo
                        </button>

                    </div>

                `;

            }
        );

    }

    window.removerEmprestimo =
        function(indice) {

            emprestimos.splice(
                indice,
                1
            );

            localStorage.setItem(
                "emprestimos",
                JSON.stringify(
                    emprestimos
                )
            );

            renderizarEmprestimos();

        }

    renderizarEmprestimos();

}