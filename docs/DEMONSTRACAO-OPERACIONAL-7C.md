# Fiscal ST | Contrato da demonstração 7C

## Objetivo
Novo frontend para visualização e demonstração operacional do legado Mardisa. A fonte de consulta é o backend Django existente. Não há autorização para alterar qualquer banco oficial.

## Modos
1. **Consulta real**: somente endpoints GET de consulta liberados pelo frontend. A origem permanece o backend Django e o banco atual. Os resultados devem ser confrontados com a aplicação antiga por empresa, nota, valores e relatórios.
2. **Simulação local**: arquivos XML são lidos por DOMParser no navegador, com verificação **básica** do documento e campos `nNF`, `xNome` e `vNF`. O resultado mínimo, sem XML original, fica em `localStorage["fiscal-st:simulacao-v1"]`. O navegador permite limpar os dados.
3. **Exportação da simulação**: gera JSON local a partir do resumo salvo; não produz arquivo fiscal válido e não utiliza a API de geração.

## Guardas
- `src/services/api.tsx`: a instância Axios usada pelo frontend somente permite GET para rotas de leitura previstas. POST, PUT, PATCH, DELETE e endpoints não auditados são rejeitados.
- Login JWT existente é feito separadamente pelo endpoint `/auth/login/` (autenticação naturalmente escreve metadados de sessão/segurança quando o backend assim estiver configurado). A criação do usuário de demonstração deve ocorrer em banco de homologação isolado.
- Rotinas originais de importação, cadastro e geração não podem ser invocadas na demonstração.
- **O guard de frontend não é barreira de segurança para acesso direto ao backend.** É obrigatório usar credenciais de banco oficiais somente de leitura e regras de autorização no servidor antes de conectar produção.
- Cuidado: os endpoints GET de geração de arquivo do legado foram bloqueados até auditoria de efeitos colaterais.

## Critérios para homologação
- Login válido usando conta de homologação isolada e consulta autorizada
- Compras/vendas/relatórios refletem os resultados do legado
- Erros de conexão não exibem zeros fictícios
- Nenhuma ação de demonstração invoca endpoint de escrita
- XML escolhido aparece apenas no navegador; recarregar a página recupera apenas o resumo local
- Limpar simulação remove o resumo salvo
- A tela identifica inequivocamente "Demonstração operacional" e o armazenamento local

## Pendências
- Integração fim-a-fim, conexão a backend com privilégios restritos, CI/build e testes automatizados
- Paridade exata dos detalhes e cálculos fiscais entre legado e nova UI
- Revisar acessos a telas legadas de cadastro: os envios são bloqueados centralmente, mas ações visuais ainda precisam de adaptação
- Validar parser NF-e nos arquivos reais da equipe. A validação atual é apenas estrutural
- Substituir a marca SVG provisória pelos assets oficiais fornecidos no protótipo
