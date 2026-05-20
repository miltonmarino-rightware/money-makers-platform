export const contentConfig = {
landing: {
badge: 'Academia Premium de Trading',
heroTitle: 'Where Traders',
heroTitleHighlight: 'Come To Win',
heroDescription: 'Desenvolve disciplina, psicologia, gestão de risco e estratégia para construir consistência real no mercado financeiro.',
ctaPrimary: 'Entrar na Academia',
ctaSecondary: 'Explorar Plataforma',
featuresTitle: 'Formação completa para o mercado real',
featuresDescription: 'Cada módulo foi construído para desenvolver as competências que os mercados realmente exigem.',
features: [
{ iconKey: 'Brain',        title: 'Psicologia de Trading',  desc: 'Controla as emoções e desenvolve a mentalidade de um trader de alta performance.' },
{ iconKey: 'Shield',       title: 'Gestão de Risco',        desc: 'Aprende a proteger o capital e a definir o risco correto em cada operação.' },
{ iconKey: 'BarChart3',    title: 'Estratégia & Análise',   desc: 'Domina price action, estrutura de mercado e setups de alta probabilidade.' },
{ iconKey: 'Target',       title: 'Execução Disciplinada',  desc: 'Desenvolve consistência através de regras claras e um processo repetível.' },
{ iconKey: 'Users',        title: 'Comunidade de Traders',  desc: 'Grupos de estudo, desafios e partilha de setups com traders sérios.' },
{ iconKey: 'Calendar',     title: 'Mentoria Directa',       desc: 'Sessões individuais focadas no teu desenvolvimento como trader.' },
],
},

about: {
title: 'Sobre a Money Makers Academy',
description: 'Formamos traders disciplinados, estratégicos e consistentes. Não vendemos hype — preparamos traders para o mercado real.',
pillars: [
{ iconKey: 'Target', title: 'Missão',      desc: 'Formar traders com base sólida em psicologia, risco e estratégia — não em promessas.' },
{ iconKey: 'Shield', title: 'Metodologia', desc: 'Um sistema de aprendizagem baseado em disciplina, repetição e análise crítica da performance.' },
{ iconKey: 'Award',  title: 'Compromisso', desc: 'Transparência total. O mercado é difícil — preparamos os nossos membros para essa realidade.' },
],
disclaimer: {
title: '⚠️ Aviso de Risco',
lines: [
'A Money Makers é uma plataforma educacional. O conteúdo não constitui aconselhamento financeiro.',
'Trading envolve risco de perda de capital. Apenas opera com capital que podes perder.',
],
},
ctaLabel: 'Entrar na Academia',
},

dashboard: {
clientTitle: 'Dashboard',
clientSubtitle: 'Bem-vindo à Money Makers Academy',
adminTitle: 'Painel Admin',
adminSubtitle: 'Visão geral da academia',
stats: [
{ key: 'courses', label: 'Módulos Activos',   defaultValue: '—', iconKey: 'GraduationCap' },
{ key: 'trades',  label: 'Trades Registados', defaultValue: '—', iconKey: 'BarChart3'     },
{ key: 'winRate', label: 'Win Rate',          defaultValue: '—', iconKey: 'TrendingUp'    },
{ key: 'booking', label: 'Próxima Sessão',    defaultValue: '—', iconKey: 'Calendar'      },
],
quickActions: [
{ key: 'chat',     label: 'Assistente IA',  path: '/app/chat',     iconKey: 'MessageSquare', desc: 'Fala com o assistente de trading'    },
{ key: 'courses',  label: 'Módulos',        path: '/app/courses',  iconKey: 'GraduationCap', desc: 'Continua a tua formação'             },
{ key: 'trades',   label: 'Trading Journal',path: '/app/trades',   iconKey: 'BarChart3',     desc: 'Regista e analisa as tuas operações' },
{ key: 'bookings', label: 'Agendar Sessão', path: '/app/bookings', iconKey: 'Calendar',      desc: 'Agenda com o teu mentor'             },
],
broadcastsHeading:   'Alertas & Análises',
broadcastsViewAll:   'Ver todos',
quickActionsHeading: 'Acesso Rápido',
priorityLabels: {
normal: 'Normal',
high:   'Alta',
urgent: 'Urgente',
},
},

auth: {
loginTitle: 'Bem-vindo de volta',
loginSubtitle: 'Entra na tua conta Money Makers',
loginButton: 'Entrar',
registerTitle: 'Criar conta',
registerSubtitle: 'Começa a tua formação como trader',
registerButton: 'Criar conta',
resetTitle: 'Recuperar password',
resetSubtitle: 'Indica o teu email para receber instruções',
resetButton: 'Enviar instruções',
resetSuccessTitle: 'Email enviado',
resetSuccessMessage: 'Se o email existir na nossa base de dados, receberás instruções para redefinir a password.',
forgotPassword: 'Esqueceste a password?',
noAccount: 'Não tens conta?',
hasAccount: 'Já tens conta?',
createAccountLink: 'Criar conta',
loginLink: 'Entrar',
backToLogin: 'Voltar ao login',
passwordMinLength: 'A password deve ter pelo menos 6 caracteres.',
invalidCredentials: 'Credenciais inválidas. Tenta novamente.',
registerError: 'Erro ao criar conta. Tenta novamente.',
},

nav: {
login: 'Entrar',
register: 'Começar',
settings: 'Definições',
about: 'Sobre',
newConversation: 'Nova Conversa',
noSessions: 'Sem sessões ainda',
viewAsClient: 'Ver como membro',
adminPanel: 'Painel Admin',
},

header: {
adminLabel: 'Admin Panel',
},

chat: {
emptyTitle: 'Como posso ajudar no teu desenvolvimento hoje?',
emptySubtitle: 'Psicologia, gestão de risco, análise técnica ou estratégia de trading.',
prompts: [
{ text: 'Como controlar o medo de perder numa operação?',       iconKey: 'Brain'      },
{ text: 'Como definir o tamanho correto de posição?',           iconKey: 'Shield'     },
{ text: 'O que é o conceito de R:R e como usá-lo?',            iconKey: 'BarChart3'  },
{ text: 'Como construir um plano de trading sólido?',          iconKey: 'Target'     },
{ text: 'Quais são os erros mais comuns de traders iniciantes?', iconKey: 'TrendingUp' },
],
loadingMessage: 'A carregar conversa...',
},

settings: {
title: 'Definições',
subtitle: 'Personaliza a tua experiência na Money Makers Academy.',
upgradeLabel: 'Upgrade para Pro — Em breve',
},

notFound: {
title: 'Página não encontrada',
description: 'A página que procuras não existe ou foi movida.',
homeButton: 'Ir para o início',
backButton: 'Voltar',
},

copyright: '© {year} Money Makers Academy. Todos os direitos reservados.',
footerCopyright: '© {year} Money Makers',
} as const;

export type ContentConfig = typeof contentConfig;
