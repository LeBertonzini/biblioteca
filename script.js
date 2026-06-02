let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
let livroSelecionado = null;

const btnCadastrar = document.getElementById("btnCadastrar");
const btnBuscar = document.getElementById("btnBuscar");
const loading = document.getElementById("loading");
const resultadoLivro = document.getElementById("resultadoLivro");
const listaClientes = document.getElementById("listaClientes");
const selectCliente = document.getElementById("selectCliente");
const livroSelecionadoContainer = document.getElementById("livroSelecionadoContainer");
const listaEmprestimos = document.getElementById("listaEmprestimos");

btnCadastrar.addEventListener("click", () => {
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!nome || !cpf || !email) {
        alert("Erro: Preencha todos os campos do cliente!");
        return;
    }

    clientes.push({ nome, cpf, email });
    localStorage.setItem("clientes", JSON.stringify(clientes));

    document.getElementById("nome").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("email").value = "";

    renderizarClientes();
});

function renderizarClientes() {
    listaClientes.innerHTML = "";
    selectCliente.innerHTML = '<option value="">-- Selecione quem vai pegar o livro --</option>';

    clientes.forEach(cliente => {
        const p = document.createElement("p");
        p.textContent = `👤 ${cliente.nome} | CPF: ${cliente.cpf}`;
        listaClientes.appendChild(p);

        const option = document.createElement("option");
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
    });
}

btnBuscar.addEventListener("click", async () => {
    const termoBusca = document.getElementById("buscalivro").value.trim();

    if (!termoBusca) {
        alert("Digite o nome de um livro.");
        return;
    }

    loading.style.display = "block";
    resultadoLivro.innerHTML = "";

    try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(termoBusca)}`);
        if (!response.ok) throw new Error();

        const data = await response.json();

        if (data.docs.length === 0) {
            resultadoLivro.innerHTML = "<p>❌ Nenhum livro encontrado com esse nome.</p>";
            return;
        }

        const livro = data.docs[0];
        const titulo = livro.title;
        const autor = livro.author_name ? livro.author_name[0] : "Autor Desconhecido";
        const fotoCapa = livro.cover_i
            ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
            : 'https://via.placeholder.com/100x150?text=Sem+Capa';

        resultadoLivro.innerHTML = `
            <div class="cardLivro">
                <img src="${fotoCapa}" alt="Capa do Livro">
                <h3>${titulo}</h3>
                <p><strong>Autor:</strong> ${autor}</p>
                <button id="btnSelecionar">Selecionar para Empréstimo</button>
            </div>
        `;

        document.getElementById("btnSelecionar").addEventListener("click", () => {
            livroSelecionado = { titulo, fotoCapa };
            livroSelecionadoContainer.innerHTML = `
                <div style="margin-top: 15px; background: #fff; padding: 10px; border-radius: 8px;">
                    <p>📖 <strong>Livro Selecionado:</strong> ${titulo}</p>
                    <button id="btnFinalizar">Finalizar Empréstimo</button>
                </div>
            `;
            document.getElementById("btnFinalizar").addEventListener("click", finalizarEmprestimo);
        });

    } catch (error) {
        resultadoLivro.innerHTML = "<p>⚠️ Erro ao conectar com o serviço de livros. Tente novamente.</p>";
    } finally {
        loading.style.display = "none";
    }
});

function finalizarEmprestimo() {
    const clienteNome = selectCliente.value;

    if (!clienteNome || !livroSelecionado) {
        alert("Selecione o cliente e o livro primeiro!");
        return;
    }

    const hoje = new Date();
    const dataDevolucaoObj = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));
    const dataFormatada = dataDevolucaoObj.toLocaleDateString('pt-BR');

    emprestimos.push({
        nomeCliente: clienteNome,
        nomeLivro: livroSelecionado.titulo,
        fotoCapa: livroSelecionado.fotoCapa,
        dataDevolucao: dataFormatada
    });

    localStorage.setItem("emprestimos", JSON.stringify(emprestimos));

    livroSelecionado = null;
    livroSelecionadoContainer.innerHTML = "";
    resultadoLivro.innerHTML = "";
    document.getElementById("buscalivro").value = "";
    selectCliente.value = "";

    renderizarEmprestimos();
    alert("🎉 Empréstimo registrado com sucesso!");
}

function renderizarEmprestimos() {
    listaEmprestimos.innerHTML = "";

    emprestimos.forEach(emp => {
        const card = document.createElement("div");
        card.className = "cardLivro";
        card.innerHTML = `
            <img src="${emp.fotoCapa}" alt="Capa">
            <h4>${emp.nomeLivro}</h4>
            <p><strong>Leitor:</strong> ${emp.nomeCliente}</p>
            <p style="color: #d93838;"><strong>Devolução:</strong> ${emp.dataDevolucao}</p>
        `;
        listaEmprestimos.appendChild(card);
    });
}

renderizarClientes();
renderizarEmprestimos();