Funcionalidade: Gerenciar pedidos em uma lanchonete

Cenário: Criar um novo pedido (Caso feliz)
    Dado que o cliente está autenticado
    E o pagamento foi concluído com sucesso
    Quando o cliente cria um novo pedido
    Então o pedido é registrado no sistema

Cenário: Cliente não autenticado tenta criar um pedido
    Dado que o cliente não está autenticado
    Quando o cliente tenta criar um novo pedido
    Então o sistema deve retornar uma mensagem de erro indicando que a autenticação é necessária

Cenário: Cliente autenticado tenta criar um pedido, mas o pagamento falha
    Dado que o cliente está autenticado
    E o pagamento não foi concluído com sucesso
    Quando o cliente tenta criar um novo pedido
    Então o sistema deve retornar uma mensagem de erro indicando que o pagamento não foi efetuado com sucesso

Cenário: Cliente autenticado tenta criar um pedido, mas ocorre um erro interno no sistema
    Dado que o cliente está autenticado
    E o pagamento foi concluído com sucesso
    Quando o cliente tenta criar um novo pedido
    E ocorre um erro interno no sistema
    Então o sistema deve retornar uma mensagem de erro indicando que ocorreu um problema interno

Cenário: Cliente autenticado tenta criar um pedido, mas ocorre uma falha na conexão com o banco de dados
    Dado que o cliente está autenticado
    E o pagamento foi concluído com sucesso
    Quando o cliente tenta criar um novo pedido
    E ocorre uma falha na conexão com o banco de dados
    Então o sistema deve retornar uma mensagem de erro indicando que não foi possível acessar o banco de dados