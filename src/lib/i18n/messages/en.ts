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
      hero_title: 'LEARN ROMANSH',
      hero_subtitle:
        'Learn the historical language of the **Canton of Grisons**, '
        + 'still spoken today by around **60,000 people** in Switzerland. '
        + 'A clear and structured learning path, focused on **Sursilvan**, '
        + 'with short lessons, themed vocabulary and guided review.',
      hero_b1: 'Start from scratch',
      hero_b2: 'Discover the project',
    
      about_title: 'ABOUT US',
      about_t1:
        '**RumantschVivo** is a space dedicated to **Romansh**, '
        + 'a living, rich and often underestimated language. '
        + 'Here you can learn it in a simple and practical way, '
        + '**even starting from zero**.',
      about_t2:
        'RumantschVivo was created to make Romansh accessible, '
        + 'understandable and usable, without unnecessary complications.',
      about_t3:
        '**Because a language only lives if someone speaks it.**',
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
  } as const;