import { Movie, User, Question, Chat, Match } from '../types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Diário de uma Paixão',
    year: 2004,
    genres: ['Drama', 'Romance'],
    description: 'Noah e Allie vivem um amor intenso, mas são separados por diferenças sociais, família e guerra. Anos depois, o destino coloca esse romance à prova novamente.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/8/86/Posternotebook.jpg',
    platforms: ['HBO Max/Max', 'Telecine', 'Globoplay', 'Apple TV', 'Amazon Video'],
    rating: 7.8,
    moods: ['romântico', 'intenso', 'nostálgico']
  },
  {
    id: '2',
    title: 'A Cinco Passos de Você',
    year: 2019,
    genres: ['Drama', 'Romance Teen'],
    description: 'Stella e Will, dois jovens com fibrose cística, se apaixonam enquanto precisam manter distância física por causa da doença.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Five_Feet_Apart_%282019_poster%29.png',
    platforms: ['Netflix'],
    rating: 7.2,
    moods: ['emocionante', 'delicado', 'romântico']
  },
  {
    id: '3',
    title: 'Por Lugares Incríveis',
    year: 2020,
    genres: ['Drama', 'Romance Teen'],
    description: 'Dois adolescentes marcados por dores pessoais criam um laço ao explorar lugares especiais e redescobrir motivos para seguir em frente.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/All_the_Bright_Places.jpeg',
    platforms: ['Netflix'],
    rating: 6.6,
    moods: ['sensível', 'melancólico', 'esperançoso']
  },
  {
    id: '4',
    title: 'Querido John',
    year: 2010,
    genres: ['Drama', 'Romance'],
    description: 'Um soldado e uma universitária vivem um amor de verão que continua por cartas, mesmo com a distância e as escolhas difíceis da vida.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/35/Dear_John_film_poster.jpg',
    platforms: ['Netflix', 'Globoplay'],
    rating: 6.3,
    moods: ['romântico', 'doloroso', 'nostálgico']
  },
  {
    id: '5',
    title: 'Titanic',
    year: 1997,
    genres: ['Drama', 'Romance Histórico'],
    description: 'Jack e Rose se apaixonam a bordo do Titanic, mas o romance enfrenta diferenças sociais e a tragédia do naufrágio.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png',
    platforms: ['Disney+'],
    rating: 7.9,
    moods: ['épico', 'romântico', 'trágico']
  },
  {
    id: '6',
    title: 'Como Eu Era Antes de Você',
    year: 2016,
    genres: ['Drama', 'Romance'],
    description: 'Louisa vira cuidadora de Will, um jovem rico e amargurado após um acidente, e os dois transformam a vida um do outro.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Me_Before_You_%28film%29.jpg',
    platforms: ['Globoplay', 'Telecine', 'Apple TV', 'Amazon Video'],
    rating: 7.4,
    moods: ['emocionante', 'transformador', 'romântico']
  },
  {
    id: '7',
    title: 'Um Amor Para Recordar',
    year: 2002,
    genres: ['Drama', 'Romance'],
    description: 'Um jovem popular se aproxima de uma garota reservada e religiosa, vivendo uma história de amor marcada por amadurecimento e emoção.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dc/A_Walk_to_Remember_Poster.jpg',
    platforms: ['Prime Video', 'Globoplay', 'Telecine', 'Pluto TV'],
    rating: 7.3,
    moods: ['doce', 'emocionante', 'inesquecível']
  },
  {
    id: '8',
    title: 'Questão de Tempo',
    year: 2013,
    genres: ['Romance', 'Comédia Dramática', 'Fantasia'],
    description: 'Um jovem descobre que pode viajar no tempo e tenta usar esse dom para viver melhor o amor, a família e os pequenos momentos.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7c/About_Time_%282013_film%29_Poster.jpg',
    platforms: ['Prime Video', 'Globoplay', 'Telecine', 'Apple TV', 'Amazon Video'],
    rating: 7.8,
    moods: ['leve', 'profundo', 'romântico']
  },
  {
    id: '9',
    title: 'Para Todos os Garotos que Já Amei',
    year: 2018,
    genres: ['Romance Teen', 'Comédia Romântica'],
    description: 'Lara Jean tem sua vida virada de cabeça para baixo quando suas cartas secretas de amor são enviadas para antigos crushes.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b8/To_All_the_Boys_I%27ve_Loved_Before_poster.jpg',
    platforms: ['Netflix'],
    rating: 7.0,
    moods: ['fofo', 'teen', 'divertido']
  },
  {
    id: '10',
    title: 'La La Land: Cantando Estações',
    year: 2016,
    genres: ['Musical', 'Drama', 'Romance'],
    description: 'Uma atriz e um pianista se apaixonam em Los Angeles enquanto tentam equilibrar amor, sonhos e carreira.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png',
    platforms: ['Prime Video', 'Netflix'],
    rating: 8.0,
    moods: ['sonhador', 'agridoce', 'romântico']
  },
  {
    id: '11',
    title: 'Orgulho e Preconceito',
    year: 2005,
    genres: ['Romance de Época', 'Drama'],
    description: 'Elizabeth Bennet e Sr. Darcy enfrentam orgulho, julgamentos e diferenças sociais nesta adaptação clássica de Jane Austen.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Prideandprejudiceposter.jpg',
    platforms: ['Globoplay', 'Telecine', 'Claro Video', 'Apple TV', 'Amazon Video'],
    rating: 7.8,
    moods: ['elegante', 'clássico', 'romântico']
  },
  {
    id: '12',
    title: '10 Coisas que Eu Odeio em Você',
    year: 1999,
    genres: ['Comédia Romântica Teen'],
    description: 'Cameron quer namorar Bianca, mas precisa encontrar alguém para sair com Kat, a irmã difícil e independente dela.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/95/10_Things_I_Hate_About_You_film.jpg',
    platforms: ['Disney+', 'Netflix'],
    rating: 7.3,
    moods: ['divertido', 'teen', 'carismático']
  },
  {
    id: '13',
    title: 'Um Dia',
    year: 2011,
    genres: ['Drama', 'Romance'],
    description: 'Emma e Dexter se conhecem na formatura e passam anos se reencontrando na mesma data, enquanto a vida testa o amor dos dois.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ad/One_Day_Poster.jpg',
    platforms: ['Prime Video', 'Telecine', 'Apple TV', 'Amazon Video'],
    rating: 7.0,
    moods: ['melancólico', 'realista', 'romântico']
  },
  {
    id: '14',
    title: 'Uma Linda Mulher',
    year: 1990,
    genres: ['Comédia Romântica'],
    description: 'Um empresário milionário contrata Vivian para acompanhá-lo por uma semana, mas a relação profissional se transforma em romance.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Pretty_woman_movie.jpg',
    platforms: ['Disney+', 'Netflix'],
    rating: 7.1,
    moods: ['clássico', 'leve', 'romântico']
  },
  {
    id: '15',
    title: 'Assim Nasce Uma Estrela',
    year: 2018,
    genres: ['Drama', 'Romance Musical'],
    description: 'Um cantor famoso descobre uma artista talentosa, mas o sucesso dela e os problemas dele colocam o relacionamento em crise.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/39/A_Star_is_Born.png',
    platforms: ['Telecine', 'Apple TV', 'Amazon Video'],
    rating: 7.6,
    moods: ['intenso', 'musical', 'dramático']
  },
  {
    id: '16',
    title: 'Me Chame Pelo Seu Nome',
    year: 2017,
    genres: ['Drama', 'Romance'],
    description: 'Durante um verão na Itália, Elio vive uma paixão intensa e transformadora por Oliver, assistente de seu pai.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c9/CallMeByYourName2017.png',
    platforms: ['Apple TV', 'Amazon Video', 'Claro Video'],
    rating: 7.8,
    moods: ['sensível', 'solar', 'intenso']
  },
  {
    id: '17',
    title: 'A Culpa é das Estrelas',
    year: 2014,
    genres: ['Drama', 'Romance Teen'],
    description: 'Hazel e Gus, dois jovens com câncer, se apaixonam enquanto enfrentam a fragilidade da vida com humor e intensidade.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/41/The_Fault_in_Our_Stars_%28Official_Film_Poster%29.png',
    platforms: ['Disney+'],
    rating: 7.7,
    moods: ['emocionante', 'teen', 'intenso']
  },
  {
    id: '18',
    title: 'A Barraca do Beijo',
    year: 2018,
    genres: ['Romance Teen', 'Comédia Romântica'],
    description: 'Elle se apaixona pelo irmão mais velho de seu melhor amigo, colocando em risco uma amizade cheia de regras.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/The_Kissing_Booth.png',
    platforms: ['Netflix'],
    rating: 5.9,
    moods: ['teen', 'leve', 'divertido']
  },
  {
    id: '19',
    title: 'After',
    year: 2019,
    genres: ['Drama', 'Romance Teen'],
    description: 'Tessa, uma jovem dedicada aos estudos, se envolve com Hardin, um rapaz intenso e misterioso que muda sua visão sobre amor e desejo.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/6/62/After_2019_film.png',
    platforms: ['Prime Video', 'FilmBox+', 'Diamond Films Amazon Channel', 'Apple TV', 'Amazon Video'],
    rating: 5.3,
    moods: ['intenso', 'teen', 'dramático']
  },
  {
    id: '20',
    title: 'Cartas para Julieta',
    year: 2010,
    genres: ['Comédia Romântica', 'Romance'],
    description: 'Em Verona, Sophie encontra uma antiga carta de amor e ajuda uma mulher a procurar o romance perdido de sua juventude.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Letters_to_juliet_poster.jpg',
    platforms: ['Netflix', 'Telecine', 'Universal+', 'Lionsgate+', 'Apple TV'],
    rating: 6.5,
    moods: ['leve', 'romântico', 'esperançoso']
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u2',
    name: 'Sofia',
    handle: '@sofia_cine',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    bio: 'Cinema é a vida com as partes chatas cortadas. Amante de romances e dramas.',
    emotionalProfile: 'Sonhador Elegante',
    likedMovies: ['1', '3', '7'],
    dislikedMovies: ['6'],
    favoriteMovies: ['1', '3'],
    matches: [],
    savedPosts: [],
    stats: {
      following: 150,
      followers: 320,
      creations: 45
    },
    posts: [
      { 
        id: 'p1', 
        userId: 'u2', 
        movieId: '1', 
        type: 'image',
        thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
        caption: 'Cena favorita de Her. A paleta de cores é perfeita.', 
        likes: 45, 
        likedBy: [],
        views: 0,
        comments: [], 
        timestamp: Date.now() - 1000 * 60 * 60 * 24 
      },
      { 
        id: 'p2', 
        userId: 'u2', 
        movieId: '3', 
        type: 'image',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
        caption: 'La La Land sempre me faz sonhar.', 
        likes: 32, 
        likedBy: [],
        views: 0,
        comments: [], 
        timestamp: Date.now() - 1000 * 60 * 60 * 48 
      }
    ]
  },
  {
    id: 'u3',
    name: 'Lucas',
    handle: '@lucas_films',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    bio: 'Explorando o multiverso e o existencialismo através da sétima arte.',
    emotionalProfile: 'Encanto Misterioso',
    likedMovies: ['2', '4', '6'],
    dislikedMovies: ['3'],
    favoriteMovies: ['2', '4'],
    matches: [],
    savedPosts: [],
    stats: {
      following: 89,
      followers: 120,
      creations: 12
    },
    posts: [
      { 
        id: 'p4', 
        userId: 'u3', 
        movieId: '2', 
        type: 'image',
        thumbnailUrl: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=300&q=80',
        caption: 'Tudo em Todo o Lugar ao Mesmo Tempo é uma obra-prima moderna.', 
        likes: 28, 
        likedBy: [],
        views: 0,
        comments: [], 
        timestamp: Date.now() - 1000 * 60 * 60 * 12 
      }
    ]
  },
  {
    id: 'u4',
    name: 'Elena',
    handle: '@elena_arts',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    bio: 'Cores, luzes e emoções intensas. O cinema é minha pintura favorita.',
    emotionalProfile: 'Intenso Magnético',
    likedMovies: ['5', '6', '1'],
    dislikedMovies: ['8'],
    favoriteMovies: ['5', '6'],
    matches: [],
    savedPosts: [],
    stats: {
      following: 210,
      followers: 540,
      creations: 89
    },
    posts: [
      { 
        id: 'p5', 
        userId: 'u4', 
        movieId: '5', 
        type: 'image',
        thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=80',
        caption: 'A arte em Retrato de uma Jovem em Chamas é hipnotizante.', 
        likes: 56, 
        likedBy: [],
        views: 0,
        comments: [], 
        timestamp: Date.now() - 1000 * 60 * 60 * 36 
      }
    ]
  }
];

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'O que mais te prende em uma historia de amor?',
    options: [
      { text: 'Uma conexão bonita, sensível e cheia de significado', value: 'elegant_dreamer' },
      { text: 'Quimica forte, desejo e emocao no ar', value: 'magnetic_intense' },
      { text: 'Cuidado, confiança e presença constante', value: 'loyal_guardian' },
      { text: 'Leveza, espontaneidade e liberdade', value: 'free_soul' },
      { text: 'Detalhes, memorias e gestos simbolicos', value: 'nostalgic_heart' },
      { text: 'Planos, crescimento e futuro compartilhado', value: 'visionary_romantic' },
      { text: 'Misterio, curiosidade e descoberta aos poucos', value: 'mysterious_charm' }
    ]
  },
  {
    id: 'q2',
    text: 'Qual clima combina mais com você?',
    options: [
      { text: 'Um romance elegante, quase cinematografico', value: 'elegant_dreamer' },
      { text: 'Uma paixao que muda o ritmo de tudo', value: 'magnetic_intense' },
      { text: 'Um amor seguro, honesto e protetor', value: 'loyal_guardian' },
      { text: 'Uma relação natural, sem peso desnecessário', value: 'free_soul' },
      { text: 'Um encontro com cheiro de lembranca antiga', value: 'nostalgic_heart' },
      { text: 'Uma parceria que inspira uma vida maior', value: 'visionary_romantic' },
      { text: 'Uma conexão rara, intensa e pouco óbvia', value: 'mysterious_charm' }
    ]
  },
  {
    id: 'q3',
    text: 'O que você mais valoriza em uma conexão?',
    options: [
      { text: 'Profundidade emocional e beleza nos detalhes', value: 'elegant_dreamer' },
      { text: 'Entrega, presença e intensidade', value: 'magnetic_intense' },
      { text: 'Compromisso, lealdade e estabilidade', value: 'loyal_guardian' },
      { text: 'Individualidade, humor e fluidez', value: 'free_soul' },
      { text: 'Historia, memoria e pequenos rituais', value: 'nostalgic_heart' },
      { text: 'Admiração, ambição e sonhos em comum', value: 'visionary_romantic' },
      { text: 'Profundidade seletiva e tensao emocional', value: 'mysterious_charm' }
    ]
  },
  {
    id: 'q4',
    text: 'Escolha uma cena para sua historia ideal:',
    options: [
      { text: 'Um jantar bonito, luz baixa e conversa infinita', value: 'elegant_dreamer' },
      { text: 'Uma pista cheia, olhares cruzados e coração acelerado', value: 'magnetic_intense' },
      { text: 'Uma casa tranquila onde os dois se sentem em paz', value: 'loyal_guardian' },
      { text: 'Uma viagem sem roteiro, rindo de tudo pelo caminho', value: 'free_soul' },
      { text: 'Uma carta guardada, uma musica antiga e saudade boa', value: 'nostalgic_heart' },
      { text: 'Dois planos na mesa e uma vida sendo desenhada', value: 'visionary_romantic' },
      { text: 'Um encontro noturno, silencios longos e curiosidade', value: 'mysterious_charm' }
    ]
  }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    matchId: 'm1',
    messages: [
      {
        id: 'msg1',
        senderId: 'u2',
        text: 'Oi! Vi que você também gosta de Her. Que filme incrível, né?',
        reactions: [],
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        id: 'msg2',
        senderId: 'u1',
        text: 'Sim! A fotografia é maravilhosa. E a trilha sonora também.',
        reactions: [],
        timestamp: Date.now() - 1000 * 60 * 60 * 23,
      },
      {
        id: 'msg3',
        senderId: 'u2',
        text: 'Totalmente! Aquela cena na praia é de chorar.',
        reactions: [],
        timestamp: Date.now() - 1000 * 60 * 60 * 22,
      }
    ]
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    userIds: ['u1', 'u2'], // u1 is current user (simulated), u2 is Sofia
    compatibility: {
      overall: 95,
      emotional: 90
    },
    commonMovies: ['1'], // Her
    timestamp: Date.now() - 1000 * 60 * 60 * 24
  }
];
