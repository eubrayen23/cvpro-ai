# CVPro AI — Cria CVs Profissionais com IA

## 🇦🇴 Projeto de SaaS para o Mercado Angolano/Africano

CVPro AI é uma plataforma de geração de currículos com inteligência artificial, destinada ao mercado angolano e africano. Utiliza **Google Gemini 2.0 Flash** como IA principal e **Groq Llama 3.3 70B** como fallback automático.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Supabase (auth, database, storage)
- **IA Principal:** Google Gemini 2.0 Flash (FREE)
- **IA Fallback:** Groq Llama 3.3 70B (FREE)
- **Deploy:** Netlify (frontend) + Supabase (backend)

## 📋 Funcionalidades

✅ Autenticação Supabase (email + social login)  
✅ Editor de CV com 5 secções principais  
✅ IA integrada para gerar e melhorar conteúdo  
✅ 3 templates (Clássico, Moderno, Angolano)  
✅ Campos específicos para Angola (BI, NIF, Província)  
✅ Otimização ATS  
✅ Sugestões de competências  
✅ Geração de cartas de apresentação  
✅ Tradução de secções (português ↔ inglês)  

## 🔑 Setup das APIs de IA (GRATUITO)

### 1. Gemini API
1. Acede a https://aistudio.google.com
2. Clica em "Get API Key" → "Create new project"
3. Copia a chave (formato: `AIzaSy...`)
4. Guarda em `.env` como `VITE_GEMINI_API_KEY=AIzaSy...`

### 2. Groq API
1. Acede a https://console.groq.com
2. Regista-te com email
3. Clica em "Create API Key"
4. Copia a chave (formato: `gsk_...`)
5. Guarda em `.env` como `VITE_GROQ_API_KEY=gsk_...`

### 3. Supabase
1. Cria um projeto em https://supabase.com
2. Copia `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Guarda em `.env`

## 📦 Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/eubrayen23/cvpro-ai.git
cd cvpro-ai

# 2. Instalar dependências
npm install

# 3. Configurar .env
cp .env.example .env
# Preencher as chaves das APIs

# 4. Executar servidor de desenvolvimento
npm run dev
```

## 📝 Setup Supabase

1. Criar um novo projeto em supabase.com
2. Executar as queries SQL em `sql/schema.sql`
3. Configurar RLS Policies
4. Copiar credenciais para `.env`

## 🎨 Estrutura do Projeto

```
cvpro-ai/
├── src/
│   ├── components/
│   │   ├── auth/              (Login/Register)
│   │   ├── cv/                (Editor e Secções)
│   │   ├── ai/                (AIAssistant)
│   │   └── ui/                (Componentes base)
│   ├── services/
│   │   ├── aiService.js       (Lógica de IA com fallback)
│   │   ├── supabase.js        (Cliente Supabase)
│   │   └── cvService.js       (CRUD de CVs)
│   ├── hooks/
│   │   └── useAI.js           (Hook para IA)
│   ├── store/
│   │   └── cvStore.js         (Zustand state)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Dashboard.jsx
│   │   └── Editor.jsx
│   └── App.jsx
├── .env.example
├── package.json
└── README.md
```

## 💡 Limites do Tier Gratuito

- **Gemini:** 15 req/min, 1.500 req/dia
- **Groq:** 30 req/min, ~1.000 req/dia
- **Estratégia:** Fallback automático + Rate limiting por utilizador

## 🚀 Deploy

### Frontend (Netlify)
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Backend (Supabase)
Já configurado — apenas manter variáveis de ambiente.

## 📄 Licença

MIT © 2026 MD Business, Luanda 🇦🇴
