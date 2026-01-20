export const messages = {
    nav: {
      home: 'HOME',
      learn: 'LEARN',
      vocab: 'VOCABULARY',
      stories: 'STORIES',
      login: 'Login / Sign Up',
      account: 'Account',
      logout: 'Logout',
    },
    home: {
      hero_title:
        'LEARNING ROMANSH, '
        + 'WITH RESPECT AND COMPETENCE.',
      
      hero_subtitle:
        'RumantschVivo is an educational platform dedicated to Romansh, '
        + 'designed for learners who want to approach a living language '
        + 'in an authentic and thoughtful way.',
      hero_b1: 'Start from scratch',
      hero_b2: 'Discover the project',
    
      about_title: 'ABOUT US',
      about_t1:
      '**RumantschVivo** was created with a clear goal: '
      + 'to make Romansh accessible to those who want to learn it '
      + 'in a serious, authentic, and respectful way.',
    
    about_t2:
      'Romansh is a living language with a strong cultural identity, '
      + 'yet there are very few learning resources designed for non-native speakers. '
      + 'RumantschVivo was born from this very gap: '
      + 'to create a modern platform for learning Romansh, '
      + 'without artificial simplifications '
      + 'and without turning it into a folkloristic curiosity.',
    
    about_t3:
      'The content on RumantschVivo is designed for learners of Romansh '
      + 'as a second language and is written and reviewed by people '
      + 'who genuinely know the language, '
      + 'with the support of explanations in Italian, English, and German.',
    
    about_t4:
      'The goal is not just to translate, '
      + 'but to explain how the language works, '
      + 'how it is used in real life, '
      + 'and what makes it unique.',
    
    about_t5:
      'The project grows in a gradual and thoughtful way: '
      + 'one variety at a time, carefully curated content, '
      + 'structured exercises, and strong attention to linguistic quality. '
      + 'RumantschVivo is also an open space for collaboration '
      + 'with speakers, researchers, and enthusiasts of the Romansh language, '
      + 'with full respect for its varieties and its history.',
    
    about_t6:
      'RumantschVivo is not a game, nor a simple experiment.',
    
    about_t7:
      '**It is an educational and cultural project built to last.**',
    },
    footer: {
      tagline: 'Learn Romansh. Preserve stories, words and pronunciation.',
      blurb:
        'An educational project to make Romansh more accessible, '
        + 'practical and alive, with short lessons, real examples and cultural content.',
      quote_rm: '“Bun di e a revair.”',
      quote_it: 'Small phrases, great language.',
      rights: 'Some rights reserved.',
    
      learn: {
        title: 'Learn',
        a0: 'A0 Path',
        a1: 'A1 Path',
        a2: 'A2 Path',
        phrases: 'Useful phrases',
      },
    
      language: {
        title: 'Language & culture',
        vocab: 'Vocabulary',
        stories: 'Stories and texts',
        audio: 'Pronunciation (audio)',
        variants: 'Variants (Sursilvan, Vallader…)',
      },
    
      contrib: {
        title: 'Contribute',
        word: 'Add a word',
        audio: 'Record audio',
        error: 'Report an issue',
        sources: 'Sources & licenses',
      },
    
      legal: {
        privacy: 'Privacy',
        terms: 'Terms',
        contacts: 'Contacts',
      },
    },
    account: {
      edit: {
        title: 'Edit profile',
        subtitle: 'Set the name that will be shown in your account.',
        label: 'Display name',
        placeholder: 'E.g. Dario',
        help: 'You can change it at any time.',
        error_generic: 'Error while saving.',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
      },
      overview: {
        title: 'Account',
        subtitle: 'Manage your profile and track your progress',
        profile_title: 'Profile',
        email: 'Email',
        name: 'Name',
        name_missing: 'Not set',
        edit_profile: 'Edit profile',
        logout: 'Logout',
        progress_title: 'Progress',
        progress_completed: 'Completed',
        recent_activity: 'Recent activity',
        recent_empty: 'No progress yet. Time to get started.',
        open_lesson: 'Open',
      },
    },
    login: {
      title_login: 'Login',
      title_signup: 'Create account',
    
      subtitle_login: 'Log in to save progress, lessons, and preferences.',
      subtitle_signup: 'Create an account to track your progress.',
    
      email_label: 'Email',
      email_placeholder: 'name@example.com',
    
      password_label: 'Password',
      password_placeholder: 'Min 8 characters',
    
      loading: '...',
      submit_login: 'Sign in',
      submit_signup: 'Sign up',
    
      switch_to_signup: "Don't have an account? Sign up",
      switch_to_login: 'Already have an account? Login',
    
      forgot_password: 'Forgot password?',
      back_home: 'Back to home',
    
      info_confirm_email: "I've sent you a confirmation email. Open it, then log in.",
    
      right_title: 'RumantschVivo',
      right_text:
        'Short lessons, real examples, and a place where Romansh doesn’t end up forgotten in a drawer.',
    
      bullet_1: 'Save progress',
      bullet_2: 'Personal vocabulary',
      bullet_3: 'Content for variants (Sursilvan…)',
      google_button: "Continue with Google",
      or: "or"
    },

    about: {
      hero_badge_main: 'RumantschVivo',
      hero_badge_secondary: 'Independent educational project',
    
      hero_card_title: 'For learners who take it seriously.',
      hero_card_text:
        'Materials designed for second-language learners, with clear explanations ' +
        'and a focus on real language use, not just postcard phrases.',
    
      hero_pill_1: 'Level A0–A2',
      hero_pill_2: 'Variant: Sursilvan',
      hero_pill_3: 'Focus: real usage',
    
      mini_language_label: 'Language',
      mini_language_value: 'Romansh',
      mini_language_caption:
        'One of Switzerland’s national languages.',
    
      mini_approach_label: 'Approach',
      mini_approach_value: 'Educational',
      mini_approach_caption:
        'Structured, gradual, without artificial gamification.',
    
      values_block_1_title: 'What RumantschVivo is not',
      values_block_1_text:
        'It is not a five-minute toy, not a random phrasebook, ' +
        'and it does not reduce Romansh to a folkloric curiosity.',
    
      values_block_2_title: 'What it aims to be',
      values_block_2_text:
        'A stable, accurate resource that respects the Romansh community, ' +
        'built over time together with speakers, learners, and researchers.',
    },
  } as const;