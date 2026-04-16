# 📋 Documentação da API — JR Refrigeração
## Integração com n8n e Agente de IA

> **Base URL do Supabase:** `https://dqprghueloubkodrqmxg.supabase.co`
> **Uso interno** — sem necessidade de autenticação de usuário final

---

## 🔑 Autenticação

Todas as chamadas utilizam a **Anon Key** do Supabase via header `apikey` e `Authorization`.

```
Headers obrigatórios em TODAS as chamadas:
  apikey: SUA_SUPABASE_ANON_KEY
  Authorization: Bearer SUA_SUPABASE_ANON_KEY
  Content-Type: application/json
```

> **No n8n:** Configure um node "HTTP Request" e adicione esses headers como **Header Auth** ou diretamente nas opções do node.

---

## ⏰ Fuso Horário — Já Convertido!

As chamadas de **leitura** (GET) usam as views `appointments_local` e `clients_local`, que já retornam datas e horários **no fuso de Teresina (America/Fortaleza, UTC-3)**. Não precisa converter nada!

Ao **criar** agendamentos (POST), use o offset `-03:00` na data para gravar o horário correto:
```
✅ CORRETO:  "2026-03-17T10:00:00-03:00"  → Grava 10:00 de Teresina
❌ ERRADO:   "2026-03-17T10:00:00.000Z"   → Grava 10:00 UTC = 07:00 de Teresina
```

### ⚙️ Configuração necessária (uma única vez)

Execute o SQL do arquivo `supabase_views_local.sql` no **SQL Editor** do painel do Supabase. Isso cria as views que convertem os horários automaticamente.

---

## 📊 Estrutura do Banco de Dados

### Tabela `clients`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (gerado automaticamente) |
| `name` | TEXT | Nome do cliente |
| `whatsapp` | TEXT | WhatsApp (campo ÚNICO — identifica o cliente) |
| `last_address` | TEXT | Último endereço registrado |
| `created_at` | TIMESTAMPTZ | Data de criação |

### Tabela `appointments`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `client_name` | TEXT | Nome do cliente |
| `client_whatsapp` | TEXT | WhatsApp do cliente |
| `address` | TEXT | Endereço do serviço |
| `equipment_type` | TEXT | Tipo do equipamento (ex: "Split Samsung 12k BTUs") |
| `problem_description` | TEXT | Descrição do problema |
| `service_id` | TEXT | ID do serviço (ver tabela de serviços abaixo) |
| `technician_id` | TEXT | ID do técnico (ver tabela de técnicos abaixo) |
| `scheduled_at` | TIMESTAMPTZ | Data e hora agendada |
| `status` | TEXT | `pending`, `confirmed`, `completed` ou `cancelled` |
| `payment_method` | TEXT | `PIX`, `Cartão de Crédito`, `Cartão de Débito`, `Dinheiro` |
| `notes` | TEXT | Observações adicionais |
| `created_at` | TIMESTAMPTZ | Data de criação do registro |

---

## 👷 Técnicos Disponíveis

| ID | Nome | WhatsApp | Especialidade | Horário de Trabalho |
|----|------|----------|---------------|---------------------|
| `leomar` | Leomar | 86 99504-2011 | Todas | Seg-Sex 8h-18h, Sáb 8h-12h |
| `haylan` | Haylan | 86 99956-3792 | Todas | Indisponível (Agenda bloqueada) |
| `rozenilson` | Rozenilson | 86 99551-3702 | Todas | Seg-Sex 8h-18h, Sáb 8h-12h |

## 🔧 Serviços Disponíveis

| ID | Nome | Tempo Médio |
|----|------|-------------|
| `instalacao` | Instalação de ar condicionado | 4h-6h |
| `limpeza` | Limpeza / Higienização | 2h |
| `recarga_gas` | Recarga de gás | 1:30 |
| `manutencao_preventiva` | Manutenção preventiva | 1:30 |
| `manutencao_corretiva` | Manutenção corretiva / Reparo | 2:30-3h |
| `desinstalacao_reinstalacao` | Desinstalação e reinstalação | 2:30 |

## 🏢 Informações da Empresa

| Campo | Valor |
|-------|-------|
| **Nome** | JR Refrigeração |
| **WhatsApp** | 86 99575-3376 |
| **E-mail** | direcao@jrefrigeracao.com.br |
| **Endereço** | Av. Presidente Kennedy, 1835 - Leste, Teresina-PI |
| **Instagram** | @jrclimatizacaoeser |
| **Cidades atendidas** | Teresina, Timon-MA, Altos-PI |
| **Horário Seg-Sex** | 8h às 18h |
| **Horário Sábado** | 8h às 12h |
| **Domingo** | Fechado |
| **Taxa de visita** | R$ 70,00 |

---

## 📞 1. Buscar Cliente por Número de Telefone

Pesquisa um cliente pelo número de WhatsApp. Usa a view `clients_local` (horários já corretos).

### cURL

```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/clients_local?whatsapp=eq.86%2099504-2011&select=*" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### Variações úteis

**Busca parcial (contém parte do número):**
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/clients_local?whatsapp=like.*99504*&select=*" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

**Busca por nome (case-insensitive):**
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/clients_local?name=ilike.*João*&select=*" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### Resposta esperada (200 OK)
```json
[
  {
    "id": "a1b2c3d4-...",
    "name": "João Silva",
    "whatsapp": "86 99504-2011",
    "last_address": "Rua das Flores, 123 - Teresina",
    "created_at": "2026-03-10T14:30:00"
  }
]
```

> ✅ `created_at` já vem no horário de Teresina. Sem conversão!

> **⚠️ Nota:** Retorna um array vazio `[]` se o cliente não for encontrado.

---

## 📜 2. Buscar Histórico de Agendamentos do Cliente

Busca todos os agendamentos de um cliente pelo número de WhatsApp. Usa `appointments_local`.

### cURL

```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?client_whatsapp=eq.86%2099504-2011&select=*&order=scheduled_at.desc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### Resposta esperada (200 OK)
```json
[
  {
    "id": "e5f6g7h8-...",
    "client_name": "João Silva",
    "client_whatsapp": "86 99504-2011",
    "address": "Rua das Flores, 123 - Teresina",
    "equipment_type": "Split Samsung 12k BTUs",
    "problem_description": "Ar não gela direito",
    "service_id": "manutencao_corretiva",
    "technician_id": "leomar",
    "scheduled_at": "2026-03-15T10:00:00",
    "status": "confirmed",
    "payment_method": "PIX",
    "notes": "",
    "created_at": "2026-03-14T18:00:00"
  }
]
```

> ✅ `scheduled_at: "2026-03-15T10:00:00"` — horário exato de Teresina, sem UTC!

---

## 📅 3. Buscar Agendamentos de uma Data Específica

Busca todos os agendamentos de um dia para verificar horários ocupados.

### cURL — Todos os agendamentos de uma data

```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?scheduled_at=gte.2026-03-15T00:00:00&scheduled_at=lt.2026-03-16T00:00:00&select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### cURL — Agendamentos de uma data para um técnico específico

```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?scheduled_at=gte.2026-03-15T00:00:00&scheduled_at=lt.2026-03-16T00:00:00&technician_id=eq.leomar&select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### Resposta esperada (200 OK)
```json
[
  {
    "id": "...",
    "client_name": "Maria Santos",
    "technician_id": "leomar",
    "scheduled_at": "2026-03-15T08:00:00",
    "service_id": "limpeza",
    "status": "confirmed"
  },
  {
    "id": "...",
    "client_name": "João Silva",
    "technician_id": "leomar",
    "scheduled_at": "2026-03-15T10:00:00",
    "service_id": "manutencao_corretiva",
    "status": "confirmed"
  }
]
```

> ✅ `08:00` e `10:00` — horário exato de Teresina!

---

## 🕐 4. Consultar Horários Disponíveis (Lógica para o Agente de IA)

Não existe um endpoint nativo de "horários disponíveis". O agente de IA deve **calcular** os horários livres usando a seguinte lógica:

### Regras de Negócio

1. **Horário de funcionamento:**
   - Segunda a Sexta: **08:00 às 18:00**
   - Sábado: **08:00 às 12:00**
   - Domingo: **Fechado**

2. **Slots de horário possíveis** (intervalos de 1h):
   - Seg-Sex: `08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00`
   - Sábado: `08:00, 09:00, 10:00, 11:00`

3. **Regra de Bloqueio por Turno (NOVO):**
   - **Manhã:** Se houver **qualquer** agendamento entre `08:00` e `11:59`, **TODO** o turno da manhã fica bloqueado (ou seja, os horários de 08:00 a 12:00 não ficam mais disponíveis).
   - **Tarde:** Se houver **qualquer** agendamento entre `13:00` e `17:59`, **TODO** o turno da tarde fica bloqueado (ou seja, os horários de 13:00 a 17:00 não ficam mais disponíveis).
   - O técnico pode, portanto, fazer no máximo **um serviço de manhã e um serviço de tarde**.

### Exemplo de Lógica no n8n (Code Node / JavaScript)

```javascript
// Dados de entrada: agendamentos do técnico naquele dia (vindos da view appointments_local)
const agendamentos = $input.all();

// Data consultada (ajuste conforme o fluxo)
const dataConsultada = '2026-03-15';
const data = new Date(dataConsultada + 'T12:00:00');
const diaSemana = data.getDay(); // 0=dom, 6=sab

// Domingo = fechado
if (diaSemana === 0) {
  return [{ json: { disponivel: false, mensagem: "Fechado aos domingos" } }];
}

// Extrair horários ocupados (já vem no horário correto da view!)
const horariosOcupados = agendamentos
  .filter(item => item.json.status !== 'cancelled')
  .map(item => {
    // scheduled_at já vem como "2026-03-15T10:00:00"
    return item.json.scheduled_at.split('T')[1].substring(0, 5);
  });

// Verificar ocupação de turnos
const temAgendamentoManha = horariosOcupados.some(hora => hora < '13:00');
const temAgendamentoTarde = horariosOcupados.some(hora => hora >= '13:00');

// Gerar todos os slots disponíveis baseados na ocupação do turno
let horariosLivres = [];

// Se for Sábado, só tem turno da manhã
if (diaSemana === 6) {
  if (!temAgendamentoManha) {
    horariosLivres = ['08:00', '09:00', '10:00', '11:00'];
  }
} else {
  // Segunda a Sexta: Turnos Manhã e Tarde
  if (!temAgendamentoManha) {
    horariosLivres.push('08:00', '09:00', '10:00', '11:00', '12:00');
  }
  if (!temAgendamentoTarde) {
    horariosLivres.push('13:00', '14:00', '15:00', '16:00', '17:00');
  }
}

return [{
  json: {
    data: dataConsultada,
    tecnico: 'leomar',
    horarios_disponiveis: horariosLivres,
    horarios_ocupados: horariosOcupados,
    total_livres: horariosLivres.length,
    turno_manha_ocupado: temAgendamentoManha,
    turno_tarde_ocupado: temAgendamentoTarde
  }
}];
```

> ✅ Sem conversão de timezone! O `scheduled_at` já vem como `"2026-03-15T10:00:00"` direto da view.

---

## ➕ 5. Criar Novo Agendamento

Cria um novo agendamento. A tabela `clients` é **sincronizada automaticamente** (trigger no banco).

> **⚠️ Para criar, use a tabela `appointments` (não a view).** Use `-03:00` no `scheduled_at`.

### cURL

```bash
curl -X POST "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "client_name": "João Silva",
    "client_whatsapp": "86 99999-1234",
    "address": "Rua das Flores, 123 - Centro, Teresina-PI",
    "equipment_type": "Split Samsung 12k BTUs",
    "problem_description": "Ar condicionado não está gelando, faz barulho estranho",
    "service_id": "manutencao_corretiva",
    "technician_id": "leomar",
    "scheduled_at": "2026-03-17T10:00:00-03:00",
    "status": "confirmed",
    "payment_method": "PIX",
    "notes": "Cliente pede para ligar 30 min antes"
  }'
```

> **⚠️ CRUCIAL:** Use `"-03:00"` no `scheduled_at`:
> - ✅ `"2026-03-17T10:00:00-03:00"` → Grava **10:00 de Teresina** (correto)
> - ❌ `"2026-03-17T10:00:00.000Z"` → Grava **10:00 UTC = 07:00 de Teresina** (errado)

### Resposta esperada (201 Created)
```json
[
  {
    "id": "novo-uuid-gerado-...",
    "client_name": "João Silva",
    "client_whatsapp": "86 99999-1234",
    "address": "Rua das Flores, 123 - Centro, Teresina-PI",
    "equipment_type": "Split Samsung 12k BTUs",
    "problem_description": "Ar condicionado não está gelando, faz barulho estranho",
    "service_id": "manutencao_corretiva",
    "technician_id": "leomar",
    "scheduled_at": "2026-03-17T13:00:00+00:00",
    "status": "confirmed",
    "payment_method": "PIX",
    "notes": "Cliente pede para ligar 30 min antes",
    "created_at": "2026-03-15T12:00:00+00:00"
  }
]
```
> A resposta do POST vem da tabela (UTC). Para ver o horário local, faça um GET na view `appointments_local`.

### Campos obrigatórios
| Campo | Obrigatório | Observação |
|-------|:-----------:|------------|
| `client_name` | ✅ | Nome completo |
| `client_whatsapp` | ✅ | Formato: "86 99999-9999" |
| `address` | ✅ | Endereço completo |
| `equipment_type` | ✅ | Tipo e modelo do equipamento |
| `problem_description` | ✅ | O que está acontecendo |
| `service_id` | ✅ | Um dos IDs da tabela de serviços |
| `technician_id` | ✅ | Um dos IDs da tabela de técnicos |
| `scheduled_at` | ✅ | ISO 8601 **com fuso `-03:00`** (ex: `2026-03-17T10:00:00-03:00`) |
| `status` | ❌ | Padrão: `pending`. Use `confirmed` ao criar |
| `payment_method` | ❌ | PIX, Cartão de Crédito, Cartão de Débito, Dinheiro |
| `notes` | ❌ | Observações livres |

> **⚠️ Importante:** Ao criar um agendamento, o banco de dados automaticamente cria/atualiza o cliente na tabela `clients` via trigger.

---

## ✏️ 6. Atualizar Status de um Agendamento

### cURL

```bash
curl -X PATCH "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments?id=eq.ID_DO_AGENDAMENTO" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "completed"}'
```

### Valores possíveis para `status`
| Status | Descrição |
|--------|-----------|
| `pending` | Pendente/Aguardando confirmação |
| `confirmed` | Confirmado |
| `completed` | Concluído |
| `cancelled` | Cancelado |

---

## ❌ 7. Cancelar/Excluir um Agendamento

### Cancelar (recomendado — mantém histórico)
```bash
curl -X PATCH "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments?id=eq.ID_DO_AGENDAMENTO" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "cancelled"}'
```

### Excluir permanentemente
```bash
curl -X DELETE "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments?id=eq.ID_DO_AGENDAMENTO" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

---

## 📋 8. Listar Todos os Agendamentos

### cURL — Todos (ordenados por data)
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### cURL — Filtrar por status
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?status=eq.pending&select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### cURL — Filtrar por técnico
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?technician_id=eq.leomar&select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

### cURL — Agendamentos futuros (a partir de agora)
```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/appointments_local?scheduled_at=gte.2026-03-15T00:00:00&status=neq.cancelled&select=*&order=scheduled_at.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

---

## 👥 9. Listar Todos os Clientes

```bash
curl -X GET "https://dqprghueloubkodrqmxg.supabase.co/rest/v1/clients_local?select=*&order=name.asc" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUA_SUPABASE_ANON_KEY"
```

---

## 🤖 Guia de Configuração no n8n

### Passo 1: Criar Credencial HTTP Header Auth

1. Vá em **Credentials** → **New Credential** → **Header Auth**
2. Configure:
   - **Name:** `Supabase JR Refrigeracao`
   - **Header Name:** `apikey`
   - **Header Value:** `SUA_SUPABASE_ANON_KEY`

### Passo 2: Configurar Node HTTP Request

Para cada chamada, use o node **HTTP Request** com:

| Configuração | Valor |
|-------------|-------|
| **Method** | GET, POST, PATCH ou DELETE (conforme a chamada) |
| **URL** | A URL completa conforme documentado acima |
| **Authentication** | Header Auth (credencial criada no passo 1) |
| **Headers adicionais** | `Authorization: Bearer SUA_SUPABASE_ANON_KEY` |
| **Body Content Type** | JSON (apenas para POST e PATCH) |

### Passo 3: Fluxo do Agente de IA (Exemplo)

```
Trigger (Webhook/Chat) 
  → AI Agent (recebe mensagem do cliente)
  → IF: Cliente quer agendar?
    → HTTP Request: Buscar cliente pelo telefone (#1) → GET /clients_local
    → HTTP Request: Buscar agendamentos da data por técnico (#3) → GET /appointments_local
    → Code Node: Calcular horários disponíveis (#4)
    → AI Agent: Apresentar horários e confirmar com cliente
    → HTTP Request: Criar agendamento (#5) → POST /appointments
    → Respond: Confirmar agendamento
```

### Resumo: Qual endpoint usar?

| Ação | Endpoint | Por quê? |
|------|----------|----------|
| **Ler** agendamentos | `appointments_local` | Horários já convertidos |
| **Criar** agendamentos | `appointments` | Tabela real (usar `-03:00` na data) |
| **Atualizar/Deletar** agendamentos | `appointments` | Tabela real |
| **Ler** clientes | `clients_local` | Horários já convertidos |

---

## 🔍 Referência Rápida dos Filtros PostgREST

O Supabase usa a sintaxe **PostgREST** para filtros na URL:

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `eq.` | Igual a | `?status=eq.confirmed` |
| `neq.` | Diferente de | `?status=neq.cancelled` |
| `gt.` | Maior que | `?scheduled_at=gt.2026-03-15` |
| `gte.` | Maior ou igual | `?scheduled_at=gte.2026-03-15T08:00:00` |
| `lt.` | Menor que | `?scheduled_at=lt.2026-03-16T00:00:00` |
| `lte.` | Menor ou igual | `?scheduled_at=lte.2026-03-15T18:00:00` |
| `like.` | Contém (case sensitive) | `?whatsapp=like.*99504*` |
| `ilike.` | Contém (case insensitive) | `?name=ilike.*joão*` |
| `in.` | Faz parte da lista | `?status=in.(pending,confirmed)` |
| `is.` | É null | `?notes=is.null` |

### Ordenação e Paginação
| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `order` | Ordenar por campo | `?order=scheduled_at.asc` |
| `limit` | Limitar resultados | `?limit=10` |
| `offset` | Pular resultados | `?offset=10` |
| `select` | Selecionar campos | `?select=id,client_name,scheduled_at` |

---

## ⚡ Resumo das Chamadas para o Agente de IA

| # | Ação | Método | Endpoint |
|---|------|--------|----------|
| 1 | Buscar cliente por telefone | `GET` | `/rest/v1/clients_local?whatsapp=eq.{TELEFONE}` |
| 2 | Histórico do cliente | `GET` | `/rest/v1/appointments_local?client_whatsapp=eq.{TELEFONE}` |
| 3 | Agendamentos de uma data | `GET` | `/rest/v1/appointments_local?scheduled_at=gte.{DATA_INICIO}&scheduled_at=lt.{DATA_FIM}` |
| 4 | Agendamentos por técnico+data | `GET` | `/rest/v1/appointments_local?scheduled_at=gte.{DATA}&scheduled_at=lt.{DATA+1}&technician_id=eq.{ID}` |
| 5 | Criar agendamento | `POST` | `/rest/v1/appointments` (com `-03:00` na data) |
| 6 | Atualizar status | `PATCH` | `/rest/v1/appointments?id=eq.{ID}` |
| 7 | Listar tudo | `GET` | `/rest/v1/appointments_local?select=*` |
| 8 | Listar clientes | `GET` | `/rest/v1/clients_local?select=*` |
