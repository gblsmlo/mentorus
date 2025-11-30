# Análise de Qualidade de Código - Módulos Resume/ATS-Analyzer/Profile

## Data: 2025-11-30

## 🔍 Problemas Identificados

### 1. ❌ CRÍTICO: Schemas Duplicados e Conflitantes

#### Localização:
- `src/modules/resume/schemas.ts`
- `src/modules/ats-analyzer/schemas/index.ts`

#### Problema:
Dois schemas `resumeContentSchema` diferentes causando inconsistência de dados:

**Resume Module:**
```typescript
headline: z.string().min(1, 'Headline is required'), // OBRIGATÓRIO
// Sem campo 'about'
// Sem campo 'title' no createResumeSchema
```

**ATS-Analyzer Module:**
```typescript
headline: z.string().optional(), // OPCIONAL
about: z.string().optional(), // Campo extra
// createResumeSchema TEM campo 'title' obrigatório
```

#### Impacto:
- ⚠️ Validações inconsistentes entre módulos
- ⚠️ Possível perda de dados ao migrar entre módulos
- ⚠️ Bugs difíceis de rastrear em produção

#### Solução Proposta:
1. Criar um **único schema canônico** em `src/shared/schemas/resume-content.schema.ts`
2. Ambos os módulos devem importar deste arquivo
3. Seguir o design do Optimization Cockpit como fonte da verdade

---

### 2. ❌ CRÍTICO: Estrutura de Skills Inconsistente

#### Problema:
**Design do Optimization Cockpit** (fonte da verdade):
```typescript
skills: {
  hard: Array<{ name: string; level?: string }>;
  soft: string[];
  tools: string[];
}
```

**Implementação Atual** (ambos os módulos):
```typescript
skills: {
  soft: z.array(z.string()).default([]),
  technical: z.array(z.string()).default([]),
}
```

#### Impacto:
- ❌ Implementação não segue o design aprovado
- ❌ Testes de propriedade podem falhar
- ❌ UI não consegue separar hard skills de tools

#### Solução Proposta:
Atualizar schema para:
```typescript
export const skillsSchema = z.object({
  hard: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    level: z.string().optional(),
  })).default([]),
  soft: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
})
```

---

### 3. ❌ ALTO: Actions Duplicadas

#### Localização:
- `src/modules/resume/actions/` (5 actions)
- `src/modules/ats-analyzer/actions/resume-actions.ts` (10 funções)

#### Problema:
Funções duplicadas com implementações diferentes:
- `createResume` / `createResumeAction`
- `updateResume` / `updateResumeAction`
- `deleteResume` / `deleteResumeAction`
- `restoreVersion` / `restoreVersionAction`

#### Impacto:
- 🔄 Violação do princípio DRY
- 🐛 Bugs corrigidos em um módulo não são corrigidos no outro
- 📦 Código duplicado aumenta bundle size
- 🧪 Testes duplicados necessários

#### Solução Proposta:
1. Manter apenas as actions em `src/modules/resume/actions/`
2. `ats-analyzer` deve importar e reutilizar essas actions
3. Se `ats-analyzer` precisa de lógica adicional, usar composição:
```typescript
// ats-analyzer/actions/resume-actions.ts
import { createResumeAction } from '@/modules/resume/actions'

export async function createResumeWithAnalysis(userId, data, jobDescription) {
  const result = await createResumeAction(userId, data)
  if (result.success) {
    await analyzeResume(result.data.resumeId, jobDescription)
  }
  return result
}
```

---

### 4. ⚠️ MÉDIO: Código Depreciado Não Removido

#### Localização:
`src/modules/resume/schemas.ts` (linhas 8-11, 24-42)

#### Problema:
```typescript
// DEPRECATED: These fields will be removed as data moves to normalized tables
// Keeping for backward compatibility during migration
education: z.array(...).default([]),
experience: z.array(...).default([]),
```

Campos marcados como DEPRECATED mas:
- ✅ Ainda são validados
- ✅ Ainda são usados em actions
- ✅ Ainda são salvos no banco
- ❌ Não há plano de migração documentado

#### Impacto:
- 📚 Confusão para desenvolvedores
- 🔮 Incerteza sobre qual código usar
- 🗑️ Código morto acumulando

#### Solução Proposta:
**Opção A - Remover DEPRECATED:**
Se a migração não vai acontecer, remover os comentários DEPRECATED

**Opção B - Executar Migração:**
1. Criar tabelas normalizadas (experience, education, etc)
2. Migrar dados existentes
3. Atualizar schemas para usar relações
4. Remover campos antigos

---

### 5. ⚠️ MÉDIO: Inconsistência no Campo Title/Headline

#### Problema:
**Database Schema** (`resume` table):
```typescript
headline: text('headline').notNull(),
// Sem campo 'title'
```

**Resume Module:**
```typescript
createResumeSchema = z.object({
  content: resumeContentSchema, // headline está dentro de content
})
```

**ATS-Analyzer Module:**
```typescript
createResumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required'), // title separado
  content: resumeContentSchema,
})
```

#### Impacto:
- 🔀 Confusão entre `title` e `headline`
- 💾 Dados podem ser salvos incorretamente
- 🐛 Bugs ao criar resume via diferentes módulos

#### Solução Proposta:
Padronizar em **headline** (já está no banco):
```typescript
// Único schema
export const createResumeSchema = z.object({
  content: resumeContentSchema, // headline dentro de content.basics
})
```

---

### 6. ⚠️ MÉDIO: Validação de Email Inconsistente

#### Localização:
- `src/modules/user-profile/schemas/profile-schemas.ts`
- `src/modules/ats-analyzer/schemas/resume-content.schema.ts` (design)

#### Problema:
**Profile Schema:**
```typescript
email: z.string().email('Invalid email address'),
```

**Optimization Cockpit Design:**
```typescript
email: z.string().email('Must be a valid email'),
```

Mensagens de erro diferentes para a mesma validação.

#### Solução Proposta:
Criar constantes para mensagens de erro:
```typescript
// src/shared/constants/validation-messages.ts
export const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Invalid email address',
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  // ...
}
```

---

### 7. ℹ️ BAIXO: Falta de Validação de URL

#### Localização:
`src/modules/resume/schemas.ts`

#### Problema:
```typescript
url: z.string().optional(), // Não valida se é URL válida
```

vs

```typescript
// user-profile
github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
```

#### Solução Proposta:
Padronizar validação de URLs:
```typescript
url: z.string().url('Invalid URL').optional().or(z.literal('')),
```

---

## 📊 Resumo de Prioridades

| Prioridade | Problema | Impacto | Esforço |
|------------|----------|---------|---------|
| 🔴 CRÍTICO | Schemas duplicados | Alto | Médio |
| 🔴 CRÍTICO | Skills structure | Alto | Baixo |
| 🟡 ALTO | Actions duplicadas | Médio | Alto |
| 🟡 MÉDIO | Código DEPRECATED | Baixo | Baixo |
| 🟡 MÉDIO | Title/Headline | Médio | Baixo |
| 🟢 BAIXO | Mensagens de erro | Baixo | Baixo |
| 🟢 BAIXO | Validação URL | Baixo | Baixo |

---

## 🎯 Plano de Ação Recomendado

### Fase 1: Correções Críticas (1-2 dias)
1. ✅ Unificar `resumeContentSchema` em arquivo compartilhado
2. ✅ Atualizar estrutura de skills para `hard/soft/tools`
3. ✅ Resolver conflito `title` vs `headline`
4. ✅ Executar testes para garantir nada quebrou

### Fase 2: Refatoração de Actions (2-3 dias)
1. ✅ Consolidar actions em `resume` module
2. ✅ Atualizar `ats-analyzer` para usar actions compartilhadas
3. ✅ Remover código duplicado
4. ✅ Atualizar testes

### Fase 3: Limpeza e Padronização (1 dia)
1. ✅ Remover ou executar migração de campos DEPRECATED
2. ✅ Padronizar mensagens de validação
3. ✅ Padronizar validação de URLs
4. ✅ Documentar decisões

---

## 🧪 Checklist de Validação

Após refatoração, verificar:

- [ ] Todos os testes passam (unit + property-based)
- [ ] Não há schemas duplicados
- [ ] Skills seguem estrutura `hard/soft/tools`
- [ ] Actions não estão duplicadas
- [ ] Código DEPRECATED foi tratado
- [ ] Validações são consistentes
- [ ] TypeScript não tem erros
- [ ] Documentação atualizada

---

## 📝 Notas Adicionais

### Sobre o Optimization Cockpit
O design em `.kiro/specs/optimization-cockpit/design.md` deve ser considerado a **fonte da verdade** para a estrutura de dados do resume. Qualquer inconsistência deve ser resolvida em favor deste design.

### Sobre Backward Compatibility
Se houver dados em produção, considerar:
1. Migração de dados antes de remover campos
2. Manter campos antigos temporariamente com deprecation warnings
3. Versionar API se necessário
