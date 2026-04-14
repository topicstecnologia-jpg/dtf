import { Movie, User, Question, Chat, Match } from '../types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Her',
    year: 2013,
    genres: ['Romance', 'Ficção', 'Drama'],
    description: 'Em um futuro próximo, um escritor solitário desenvolve uma relação improvável com um sistema operacional projetado para atender a todas as suas necessidades.',
    posterUrl: 'https://th.bing.com/th/id/R.41007a812e0d1f2ab26c516e7129afee?rik=5LtZ2a6SpTkDJQ&riu=http%3a%2f%2fwww.impawards.com%2f2013%2fposters%2fher_xlg.jpg&ehk=F62tC47zAvlYnfYFz5wb4bPdcgL7sXK6JGG02z284MU%3d&risl=&pid=ImgRaw&r=0',
    platforms: ['Netflix', 'Prime Video'],
    rating: 8.0,
    moods: ['melancólico', 'romântico', 'reflexivo']
  },
  {
    id: '2',
    title: 'Tudo em Todo o Lugar ao Mesmo Tempo',
    year: 2022,
    genres: ['Ação', 'Aventura', 'Ficção'],
    description: 'Uma imigrante chinesa de meia-idade é arrastada para uma aventura insana onde ela sozinha pode salvar a existência explorando outros universos.',
    posterUrl: 'https://i0.wp.com/cinemaepixels.com.br/wp-content/uploads/2023/03/tudo-ao-mesmo-lugar-ao-mesmo-tempo-cartaz-1-e1678152680337.jpg?resize=500%2C480&ssl=1',
    platforms: ['Prime Video'],
    rating: 8.9,
    moods: ['caótico', 'emocionante', 'existencial']
  },
  {
    id: '3',
    title: 'La La Land',
    year: 2016,
    genres: ['Comédia', 'Drama', 'Música'],
    description: 'Ao navegar por suas carreiras em Los Angeles, um pianista e uma atriz se apaixonam enquanto tentam conciliar suas aspirações para o futuro.',
    posterUrl: 'https://i5.walmartimages.com/seo/La-La-Land-Movie-Poster-Poster-Print-24-x-36_20f02811-01b4-4aea-9bb2-a79942bd2642_1.856c035d66f8fd216f6d933259bc3dfb.jpeg',
    platforms: ['Netflix', 'Hulu'],
    rating: 8.0,
    moods: ['romântico', 'sonhador', 'agridoce']
  },
  {
    id: '4',
    title: 'Interestelar',
    year: 2014,
    genres: ['Aventura', 'Drama', 'Ficção'],
    description: 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    platforms: ['Paramount+', 'Prime Video'],
    rating: 8.6,
    moods: ['épico', 'emocionante', 'complexo']
  },
  {
    id: '5',
    title: 'Retrato de uma Jovem em Chamas',
    year: 2019,
    genres: ['Drama', 'Romance'],
    description: 'Em uma ilha isolada na Bretanha, no final do século XVIII, uma pintora é obrigada a pintar um retrato de casamento de uma jovem.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/34l2d3bX9U5n2Tz1r5W4h1j1h1.jpg',
    platforms: ['Hulu'],
    rating: 8.1,
    moods: ['intenso', 'romântico', 'artístico']
  },
  {
    id: '6',
    title: 'Parasita',
    year: 2019,
    genres: ['Comédia', 'Drama', 'Suspense'],
    description: 'A ganância e a discriminação de classe ameaçam a recém-formada relação simbiótica entre a rica família Park e a destituída família Kim.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    platforms: ['Max'],
    rating: 8.5,
    moods: ['tenso', 'satírico', 'chocante']
  },
  {
    id: '7',
    title: 'Antes do Amanhecer',
    year: 1995,
    genres: ['Drama', 'Romance'],
    description: 'Um jovem e uma mulher se conhecem em um trem na Europa e acabam passando uma noite juntos em Viena.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ax1r53c15P2a2s5X5G5s5.jpg',
    platforms: ['Aluguel'],
    rating: 8.1,
    moods: ['romântico', 'conversativo', 'íntimo']
  },
  {
    id: '8',
    title: 'O Grande Hotel Budapeste',
    year: 2014,
    genres: ['Aventura', 'Comédia', 'Crime'],
    description: 'Um escritor encontra o dono de um hotel de alta classe envelhecido, que lhe conta sobre seus primeiros anos servindo como mensageiro.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpJrDrqPv.jpg',
    platforms: ['Disney+'],
    rating: 8.1,
    moods: ['lúdico', 'estilizado', 'divertido']
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
    emotionalProfile: 'Romântico Idealista',
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
    emotionalProfile: 'Explorador Existencial',
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
    emotionalProfile: 'Amante de Histórias Intensas',
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
        comments: [], 
        timestamp: Date.now() - 1000 * 60 * 60 * 36 
      }
    ]
  }
];

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'O que mais te prende em um filme?',
    options: [
      { text: 'Conexão emocional profunda entre personagens', value: 'romantic' },
      { text: 'Conceitos filosóficos e complexos', value: 'existential' },
      { text: 'Drama intenso e grandes riscos', value: 'intense' },
      { text: 'Beleza visual e atmosfera', value: 'dreamer' }
    ]
  },
  {
    id: 'q2',
    text: 'Como você prefere os finais?',
    options: [
      { text: 'Felizes para sempre', value: 'romantic' },
      { text: 'Ambíguos e reflexivos', value: 'existential' },
      { text: 'Trágicos mas significativos', value: 'dramatic' },
      { text: 'Agridoces e realistas', value: 'dreamer' }
    ]
  },
  {
    id: 'q3',
    text: 'Que tipo de jornada emocional você busca?',
    options: [
      { text: 'Conforto e calor', value: 'romantic' },
      { text: 'Desafio e confusão mental', value: 'existential' },
      { text: 'Adrenalina e choque', value: 'intense' },
      { text: 'Nostalgia e saudade', value: 'dreamer' }
    ]
  },
  {
    id: 'q4',
    text: 'Escolha um cenário para sua história ideal:',
    options: [
      { text: 'Um apartamento aconchegante em dia de chuva', value: 'romantic' },
      { text: 'A vastidão do espaço ou tempo', value: 'existential' },
      { text: 'Um ambiente urbano realista e cru', value: 'intense' },
      { text: 'Uma era passada estilizada e colorida', value: 'dreamer' }
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
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        id: 'msg2',
        senderId: 'u1',
        text: 'Sim! A fotografia é maravilhosa. E a trilha sonora também.',
        timestamp: Date.now() - 1000 * 60 * 60 * 23,
      },
      {
        id: 'msg3',
        senderId: 'u2',
        text: 'Totalmente! Aquela cena na praia é de chorar.',
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
