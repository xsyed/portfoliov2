const header = {
  // all the properties are optional - can be left empty or deleted
  homepage: 'https://syedsamiuddin.com',
  title: 'SAM.',
}

const about = {
  // all the properties are optional - can be left empty or deleted
  name: 'Samiuddin Syed',
  role: 'Software Engineer',
  description:
    'Dedicated software engineer with more than three years of experience in developing quality and efficient web applications. Proficient in JavaScript, React.js, HTML5, CSS, Node.js, and MySQL.',
  resume: 'https://syedsamiuddin.com/resume.pdf',
  social: {
    linkedin: 'https://www.linkedin.com/in/syedsamiuddin96/',
    github: 'https://github.com/xsyed',
  },
}

const projects = [
  // projects can be added an removed
  // if there are no projects, Projects section won't show up
  {
    name: 'Trackgoals',
    description:
      'TrackGoals is a habit tracker which helps user in tracking habits progress daily, monthly and weekly wise.',
    stack: ['JavaScript', 'PHP', 'MySQL'],
    sourceCode: 'https://github.com/xsyed/trackgoals',
    livePreview: 'https://trackgoals.me',
  },
  {
    name: 'Ninja Warrior',
    description:
      'It is a platform based game, in which user has to complete through challenging levels.',
    stack: ['HTML5', 'JavaScript'],
    sourceCode: 'https://github.com/xsyed',
    livePreview: 'https://syedsamiuddin.com/ninja',
  },
  {
    name: 'Tic-tac-toe',
    description:
      'A classic Tic-tac-toe game, two playing modes, Two players and Against Computer',
    stack: ['HTML5', 'JavaScript'],
    sourceCode: 'https://github.com/xsyed',
    livePreview: 'https://syedsamiuddin.com/tictactoe',
  },
]

const skills = [
  // skills can be added or removed
  // if there are no skills, Skills section won't show up
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Nodejs',
  'MySQL',
  'Java',
  'Git',
  'Agile',
  'jQuery',
  'Bootstrap',
  'RESTful APIs',
  'DigitalOcean',
]

const contact = {
  // email is optional - if left empty Contact section won't show up
  email: 'samiuddin.syed@hotmail.com',
}

export { header, about, projects, skills, contact }
