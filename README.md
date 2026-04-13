# StockFlow — Controle de Vendas & Estoque

App PWA para controle de vendas e estoque com GitHub como banco de dados.

## Instalação no GitHub Pages

1. Crie um repositório no GitHub (pode ser público ou privado)
2. Faça upload dos arquivos: `index.html`, `manifest.json`, `sw.js`
3. Ative GitHub Pages: Settings → Pages → Deploy from branch → main / root
4. Acesse a URL do seu Pages (ex: `https://seu-usuario.github.io/seu-repo`)

## Primeiro acesso

1. Crie um **Personal Access Token** com permissão `repo`:
   - GitHub → Settings → Developer settings → Personal access tokens → Generate new token
2. Abra o app e preencha: Token, usuário e nome do repositório
3. Pronto! O app vai criar automaticamente os arquivos de dados no repo.

## Funcionalidades

- **Dashboard** — Métricas em tempo real, gráfico de vendas, top produtos, alertas de estoque
- **Vendas** — Registro de vendas com múltiplos produtos, desconto, forma de pagamento
- **Estoque** — Movimentação de entrada/saída/ajuste, nível visual de cada produto
- **Produtos** — Cadastro completo com foto, SKU, preço, custo, estoque mínimo
- **Relatórios** — Ranking de produtos, margem média, ticket médio, vendas por categoria
- **Histórico** — Log completo de todas as movimentações

## PWA — Instalar no celular

No Chrome/Edge, acesse o app e toque em "Adicionar à tela inicial".
O app funciona offline e sincroniza quando há conexão.

## Dados

Todos os dados ficam em `/data/*.json` no seu repositório GitHub.
Use "Exportar" nas configurações para fazer backup local a qualquer momento.
