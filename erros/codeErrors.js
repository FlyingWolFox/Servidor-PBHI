// arquivo contendo os códigos de erro, para facilitar a manutenção e compreensão, esses erros são direcionados aos devs, e não aos usuários
module.exports = Object.freeze({
    ERRO_AO_CRIAR_USUARIO : 1,
    ERRO_AO_ATUALIZAR_USUARIO : 2,
    ERRO_AO_SALVAR_PARTIDA : 3, 
    ERRO_NO_BANCO_DE_DADOS : 4,
    ERRO_AO_SALVAR_SESSAO: 5
});
