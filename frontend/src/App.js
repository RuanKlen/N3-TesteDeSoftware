import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const URL_BACKEND = "http://127.0.0.1:5000";

  // Armazena a lista de usuários
  const [users, setUsers] = useState([]);

  // Gerencia os dados do formulário (usado para criar e editar)
  const [formData, setFormData] = useState({
    id: null, // Será null para adicionar, e o ID do usuário para editar
    nome: "",
    email: "",
    senha: "",
    endereco: "",
    telefone: "",
  });

  // Feedback ao usuário (sucesso/erro)
  const [message, setMessage] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Função para limpar o formulário e voltar ao modo de adição
  const resetForm = () => {
    setFormData({
      id: null,
      nome: "",
      email: "",
      senha: "",
      endereco: "",
      telefone: "",
    });
    setMessage("");
  };

  // POST: Criação de um usuário ou PUT: Atualização das informações do Usuário
  const cadastrarAtualizarUsuario = async (event) => {
    event.preventDefault(); // Previne o recarregamento da página

    // Validação básica dos campos obrigatórios
    if (!formData.nome || !formData.email) {
      setMessage("Nome e Email são campos obrigatórios!");
      return;
    }
    if (!formData.id && !formData.senha) {
      // Senha é obrigatória apenas na criação
      setMessage("Senha é obrigatória para novos usuários!");
      return;
    }

    try {
      let response;
      if (formData.id) {
        // Se formData.id existe, é uma atualização (PUT)
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.senha) {
          // Não envia senha se estiver vazia (para não sobrescrever)
          delete dataToUpdate.senha;
        }
        response = await axios.put(
          `${URL_BACKEND}/users/${formData.id}`,
          dataToUpdate
        );
        setMessage("Usuário atualizado com sucesso!");
      } else {
        // Se formData.id é null, é uma criação (POST)
        response = await axios.post(`${URL_BACKEND}/users`, formData);
        setMessage("Usuário criado com sucesso!");
      }
      console.log("Resposta do backend:", response.data);
      resetForm(); // Limpa o formulário após a operação
      buscarUsuario(); // Atualiza a lista de usuários
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      // Exibe mensagem de erro do backend, se disponível
      setMessage(
        `Erro ao salvar usuário: ${error.response?.data?.message || error.message
        }`
      );
    }
  };

  // READ: Função para buscar todos os usuários
  const buscarUsuario = async () => {
    try {
      const response = await axios.get(`${URL_BACKEND}/users`);
      setUsers(response.data);
      setMessage(""); // Limpa mensagens anteriores
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMessage(`Erro ao carregar usuários: ${error.message}`);
      setUsers([]); // Limpa a lista em caso de erro
    }
  };

  // DELETE: Função para deletar um usuário
  const deletarUsuario = async (userId) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        const response = await axios.delete(`${URL_BACKEND}/users/${userId}`);
        setMessage(response.data.message || "Usuário deletado com sucesso!");
        buscarUsuario(); // Atualiza a lista de usuários
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        setMessage(
          `Erro ao deletar usuário: ${error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  // Função para preencher o formulário com dados de um usuário para edição
  const handleEditClick = (user) => {
    setFormData({
      id: user.id,
      nome: user.nome,
      email: user.email,
      senha: "", // Não é preenchida, por segurança
      endereco: user.endereco || "",
      telefone: user.telefone || "",
    });
    setMessage("Editando usuário...");
  };

  useEffect(() => {
    buscarUsuario();
  }, []);

  return (
    <div className="App">
      <div className="background-forms">
        {message && (
          <p
            style={{
              color: message.includes("Erro") ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <form className="forms" onSubmit={cadastrarAtualizarUsuario}>
          <h2>{formData.id ? "Editar Usuário" : "Adicionar Novo Usuário"}</h2>
          <label htmlFor="nome"> Nome Completo: </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="email"> Email: </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="senha"> Senha: </label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleInputChange}
            placeholder={
              formData.id
                ? "Nova Senha (deixe em branco para não alterar)"
                : "Senha (obrigatório)"
            }
            required={!formData.id} // Senha é obrigatória apenas na criação
          />

          <label htmlFor="telefone"> Telefone: </label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
          />

          <label htmlFor="endereco"> Endereço:</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleInputChange}
          />

          <div style={{display: 'flex', justifyContent: "space-between"}}>
            <button type="submit">
              {formData.id ? "Salvar Edição" : "Enviar"}
            </button>
            {formData.id && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Lista de Usuários Cadastrados */}
      <div
        className="user-list-container"
      >
        <h3>Usuários Cadastrados</h3>
        {users.length === 0 ? (
          <p>Nenhum usuário cadastrado.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {users.map((user) => (
              <li
                key={user.id}
                className="styledLi"
              >
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Nome:</strong> {user.nome}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Endereço:</strong> {user.endereco || "N/A"}
                </p>
                <p>
                  <strong>Telefone:</strong> {user.telefone || "N/A"}
                </p>
                <p>
                  <strong>Cadastro:</strong>{" "}
                  {new Date(user.data_cadastro).toLocaleDateString()}
                </p>
                <button onClick={() => handleEditClick(user)}>Editar</button>
                <button
                  onClick={() => deletarUsuario(user.id)}
                  className="buttonDelete"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
