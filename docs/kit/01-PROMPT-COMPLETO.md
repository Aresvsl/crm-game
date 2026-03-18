# PROMPT COMPLETO - CRM GAMA BONÉS

## Contexto do Projeto
Desenvolver um CRM profissional para a GAMA Bonés, uma empresa focada em bonés personalizados. O sistema deve ser moderno, intuitivo e capaz de gerenciar desde o catálogo de produtos até a emissão de recibos/NFs.

## Especificação de Design
- **Estilo**: Moderno, Minimalista, Premium
- **Paleta de Cores**:
  - Primária: Azul Marinho (#1a3a70)
  - Destaque: Laranja (#ff6b35)
  - Fundo: Cinza Claro (#f5f5f5)
- **Tipografia**: Inter ou Roboto
- **Ícones**: Lucide React

## Módulos e Funcionalidades

### 1. Autenticação
- Login/Signup seguro com Supabase Auth.
- Recuperação de senha e confirmação de e-mail.

### 2. Clientes
- Gerenciamento completo (CRUD).
- Histórico de pedidos e total gasto por cliente.

### 3. Produtos
- Catálogo com fotos, preços e categorias.
- Sistema de estoque com alertas automáticos.

### 4. Pedidos
- Fluxo de criação de pedidos simplificado.
- Status do pedido (Aberto, Em Produção, Enviado, Concluído).

### 5. Notas Fiscais e Recibos
- Geração automática de PDFs.
- Histórico de documentos emitidos.

### 6. Relatórios e Dashboard
- Métricas de vendas (Mensal/Anual).
- Gráficos de produtos mais vendidos.

## Especificação Técnica
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **CSS**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **ORM**: Prisma (Opcional, mas recomendado para schemas complexos)
- **Componentes**: Radix UI ou Shadcn/ui (para base sólida)

## Instrução para a IA
"Atue como um Engenheiro de Software Senior Full Stack. Baseado nas especificações acima, gere o código necessário para [MÓDULO ESPECÍFICO]. Siga os padrões de código do Next.js 14, garantindo responsividade e performance. Priorize Server Components onde possível."
