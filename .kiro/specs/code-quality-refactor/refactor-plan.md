# Plano de Refatoração - Módulos Resume/ATS-Analyzer/Profile

## 🎯 Objetivo
Eliminar inconsistências, código duplicado e depreciado nos módulos `resume`, `ats-analyzer` e `user-profile`, garantindo qualidade e consistência de dados.

---

## 📋 Tarefas de Refatoração

### ✅ FASE 1: Unificação de Schemas (CRÍTICO)

#### Task 1.1: Criar Schema Canônico Compartilhado
**Arquivo:** `src/shared/schemas/resume-content.schema.ts` (NOVO)

**Ações:**
1. Criar novo arquivo com schema único baseado no design do Optimization Cockpit
2. Implementar estrutura de skills correta: `hard/soft/tools`
3. Definir `headline` como obrigatório (conforme banco de dados)
4. Incluir campo `about` (usado pelo ats-analyzer)
5. Exportar tipos TypeScript

**Schema proposto:**
```typescript
import { z } from 'zod'

export const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  region: z.string().optional(),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
})

export const profileSchema = z.object({
  network: z.string().min(1, 'Network name is required'),
  url: z.string().url('Must be a valid URL'),
})

export const basicsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  label: z.string().optional(),
  location: locationSchema,
  profiles: z.array(profileSchema).default([]),
})

export const workSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  summary: z.string().min(1, 'Description is required'),
})

export const educationSchema = z.object({
  id: z.string().uuid(),
  institution: z.string().min(1, 'Institution is required'),
  area: z.string().min(1, 'Field of study is required'),
  studyType: z.string().min(1, 'Degree type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
})

export const hardSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.string().optional(),
})

export const skillsSchema = z.object({
  hard: z.array(hardSkillSchema).default([]),
  soft: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
})

export const languageSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  fluency: z.string().min(1, 'Fluency level is required'),
})

export const metaSchema = z.object({
  template: z.string().default('default'),
  completionScore: z.number().min(0).max(100).default(0),
})

export const resumeContentSchema = z.object({
  basics: basicsSchema,
  summary: z.string().min(1, 'Summary is required'),
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: skillsSchema,
  languages: z.array(languageSchema).default([]),
  meta: metaSchema,
})

export type ResumeContent = z.infer<typeof resumeContentSchema>
```

#### Task 1.2: Atualizar Resume Module
**Arquivo:** `src/modules/resume/schemas.ts`

**Ações:**
1. Remover `resumeContentSchema` local
2. Importar de `@/shared/schemas/resume-content.schema`
3. Manter apenas schemas específicos do módulo (step1Schema, etc)
4. Atualizar `createResumeSchema` para não ter campo `title`
5. Remover comentários DEPRECATED ou executar migração

#### Task 1.3: Atualizar ATS-Analyzer Module
**Arquivo:** `src/modules/ats-analyzer/schemas/index.ts`

**Ações:**
1. Remover `resumeContentSchema` local
2. Importar de `@/shared/schemas/resume-content.schema`
3. Atualizar `createResumeSchema` para remover campo `title`
4. Manter apenas schemas específicos (jobInputSchema, analysisResultSchema)

#### Task 1.4: Executar Testes
```bash
pnpm test src/modules/resume
pnpm test src/modules/ats-analyzer
```

---

### ✅ FASE 2: Consolidação de Actions

#### Task 2.1: Manter Actions Canônicas no Resume Module
**Diretório:** `src/modules/resume/actions/`

**Ações:**
1. Revisar e garantir que todas as actions estão completas
2. Adicionar JSDoc para documentação
3. Garantir tratamento de erros consistente
4. Validar que usam o schema compartilhado

**Actions a manter:**
- `create-resume-action.ts`
- `update-resume-action.ts`
- `delete-resume-action.ts`
- `duplicate-resume-action.ts`
- `restore-version-action.ts`
- `get-resume-actions.ts`
- `auto-save-resume-action.ts`

#### Task 2.2: Refatorar ATS-Analyzer Actions
**Arquivo:** `src/modules/ats-analyzer/actions/resume-actions.ts`

**Ações:**
1. Remover funções duplicadas
2. Importar actions do resume module
3. Criar wrappers apenas se necessário lógica adicional

**Exemplo de refatoração:**
```typescript
// ANTES (duplicado)
export async function createResume(userId: string, data: unknown) {
  const validated = createResumeSchema.parse(data)
  // ... implementação duplicada
}

// DEPOIS (reutiliza)
import { createResumeAction } from '@/modules/resume/actions'

export async function createResumeWithAnalysis(
  userId: string, 
  data: unknown,
  jobDescription?: string
) {
  const result = await createResumeAction(userId, data)
  
  if (result.success && jobDescription) {
    await analyzeResume(result.data.resumeId, jobDescription)
  }
  
  return result
}
```

#### Task 2.3: Atualizar Imports nos Componentes
**Arquivos afetados:**
- `src/modules/ats-analyzer/components/*.tsx`
- `src/app/(private)/dashboard/resumes/**/*.tsx`

**Ações:**
1. Buscar todos os imports de actions duplicadas
2. Atualizar para usar actions do resume module
3. Verificar que funcionalidade não quebrou

---

### ✅ FASE 3: Migração de Dados (Se Necessário)

#### Task 3.1: Analisar Dados em Produção
**Ações:**
1. Verificar se há dados com estrutura antiga (`technical` vs `hard/tools`)
2. Contar registros afetados
3. Decidir estratégia de migração

#### Task 3.2: Criar Script de Migração (Se Necessário)
**Arquivo:** `src/scripts/migrate-skills-structure.ts` (NOVO)

**Ações:**
1. Ler todos os resumes com estrutura antiga
2. Transformar `skills.technical` → `skills.hard` + `skills.tools`
3. Manter `skills.soft` como está
4. Salvar nova versão
5. Log de progresso

#### Task 3.3: Executar Migração
```bash
tsx src/scripts/migrate-skills-structure.ts
```

---

### ✅ FASE 4: Padronização e Limpeza

#### Task 4.1: Criar Constantes de Validação
**Arquivo:** `src/shared/constants/validation-messages.ts` (NOVO)

```typescript
export const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Invalid email address',
  URL_INVALID: 'Invalid URL',
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, min: number) => 
    `${field} must be at least ${min} characters`,
} as const
```

#### Task 4.2: Atualizar Validações de URL
**Arquivos:**
- `src/modules/resume/schemas.ts`
- `src/modules/user-profile/schemas/profile-schemas.ts`

**Ações:**
1. Padronizar: `z.string().url('Invalid URL').optional().or(z.literal(''))`
2. Usar constantes de mensagens

#### Task 4.3: Remover Código DEPRECATED
**Arquivo:** `src/modules/resume/schemas.ts`

**Opção A - Remover comentários:**
Se não há plano de migração, remover comentários DEPRECATED

**Opção B - Executar migração:**
Se há plano, criar tasks específicas para normalização

#### Task 4.4: Atualizar Documentação
**Arquivos:**
- `README.md`
- `docs/database-schema-naming-convention.md`

**Ações:**
1. Documentar estrutura de skills (`hard/soft/tools`)
2. Documentar que `headline` é obrigatório
3. Documentar localização do schema canônico
4. Adicionar exemplos de uso

---

## 🧪 Checklist de Validação

### Após Fase 1:
- [ ] Schema compartilhado criado em `src/shared/schemas/`
- [ ] Resume module usa schema compartilhado
- [ ] ATS-Analyzer module usa schema compartilhado
- [ ] Skills seguem estrutura `hard/soft/tools`
- [ ] Todos os testes passam
- [ ] TypeScript sem erros

### Após Fase 2:
- [ ] Actions duplicadas removidas
- [ ] ATS-Analyzer importa actions do resume module
- [ ] Componentes atualizados
- [ ] Todos os testes passam
- [ ] Funcionalidade não quebrou

### Após Fase 3:
- [ ] Dados migrados (se necessário)
- [ ] Estrutura antiga não existe mais
- [ ] Backup realizado antes da migração

### Após Fase 4:
- [ ] Constantes de validação criadas
- [ ] URLs validadas consistentemente
- [ ] Código DEPRECATED removido ou migrado
- [ ] Documentação atualizada
- [ ] Code review completo

---

## 📊 Estimativa de Esforço

| Fase | Tarefas | Tempo Estimado | Risco |
|------|---------|----------------|-------|
| Fase 1 | 4 tasks | 4-6 horas | Médio |
| Fase 2 | 3 tasks | 6-8 horas | Alto |
| Fase 3 | 3 tasks | 2-4 horas | Baixo |
| Fase 4 | 4 tasks | 2-3 horas | Baixo |
| **TOTAL** | **14 tasks** | **14-21 horas** | - |

---

## ⚠️ Riscos e Mitigações

### Risco 1: Quebrar Funcionalidade Existente
**Mitigação:**
- Executar todos os testes após cada fase
- Fazer commits pequenos e frequentes
- Testar manualmente fluxos críticos

### Risco 2: Perda de Dados na Migração
**Mitigação:**
- Fazer backup antes de migrar
- Testar script em ambiente de desenvolvimento
- Validar dados após migração

### Risco 3: Conflitos de Merge
**Mitigação:**
- Comunicar refatoração ao time
- Fazer em branch separada
- Merge frequente da main

---

## 🚀 Ordem de Execução Recomendada

1. **Criar branch:** `git checkout -b refactor/code-quality`
2. **Executar Fase 1** (schemas)
3. **Commit e push**
4. **Executar Fase 2** (actions)
5. **Commit e push**
6. **Executar Fase 3** (migração - se necessário)
7. **Commit e push**
8. **Executar Fase 4** (limpeza)
9. **Commit final**
10. **Abrir Pull Request**
11. **Code Review**
12. **Merge para main**

---

## 📝 Notas Finais

- Este plano prioriza **correções críticas** primeiro
- Cada fase pode ser executada independentemente
- Testes devem passar após cada fase
- Documentação deve ser atualizada continuamente
- Comunicação com o time é essencial
